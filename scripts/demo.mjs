import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { packChanged } from "../dist/index.js";

const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "diffpack-demo-"));
execFileSync("git", ["init"], { cwd, stdio: "ignore" });
execFileSync("git", ["config", "user.email", "demo@example.com"], { cwd, stdio: "ignore" });
execFileSync("git", ["config", "user.name", "demo"], { cwd, stdio: "ignore" });
fs.writeFileSync(path.join(cwd, "hello.ts"), "export const hello = 'world';\n");
execFileSync("git", ["add", "."], { cwd, stdio: "ignore" });
execFileSync("git", ["commit", "-m", "init"], { cwd, stdio: "ignore" });
fs.writeFileSync(path.join(cwd, "hello.ts"), "export const hello = 'diffpack';\n");
const out = path.resolve("examples/out-demo");
const result = packChanged({ cwd, outDir: out, format: "md", maxBytes: 100000 });
console.log(JSON.stringify({ files: result.files.length, out }, null, 2));
