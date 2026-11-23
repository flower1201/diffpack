import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { packChanged } from "../src/core/pack.js";

function git(cwd: string, args: string[]) {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}

describe("packChanged", () => {
  it("packs untracked and modified text files", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "diffpack-"));
    git(cwd, ["init"]);
    git(cwd, ["config", "user.email", "t@example.com"]);
    git(cwd, ["config", "user.name", "t"]);
    fs.writeFileSync(path.join(cwd, "a.ts"), " consola = 1;\n");
    git(cwd, ["add", "a.ts"]);
    git(cwd, ["commit", "-m", "init"]);
    fs.writeFileSync(path.join(cwd, "a.ts"), "const a = 2;\n");
    fs.writeFileSync(path.join(cwd, "b.ts"), "export const b = 3;\n");
    const out = path.join(cwd, "out");
    const result = packChanged({
      cwd,
      outDir: out,
      format: "md",
      maxBytes: 100000,
    });
    expect(result.files.map((f) => f.path).sort()).toEqual(["a.ts", "b.ts"]);
    expect(fs.existsSync(path.join(out, "pack.md"))).toBe(true);
    expect(fs.existsSync(path.join(out, "summary.json"))).toBe(true);
  });
});
