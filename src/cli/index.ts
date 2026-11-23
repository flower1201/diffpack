#!/usr/bin/env node
import path from "node:path";
import { Command } from "commander";
import { packChanged } from "../core/pack.js";
import { ENGINE_VERSION } from "../version.js";
import type { PackFormat } from "../core/types.js";

const program = new Command();
program
  .name("diffpack")
  .description("Pack git-changed files into local LLM-ready context")
  .version(ENGINE_VERSION)
  .argument("[dir]", "repo directory", ".")
  .option("--base <ref>", "diff against ref...HEAD instead of worktree")
  .option("--out <dir>", "output directory", "./diffpack-out")
  .option("--format <fmt>", "md|xml", "md")
  .option("--max-bytes <n>", "max total bytes", "400000")
  .action((dir: string, opts: Record<string, string>) => {
    const format = (opts.format === "xml" ? "xml" : "md") as PackFormat;
    const result = packChanged({
      cwd: path.resolve(dir),
      base: opts.base,
      outDir: path.resolve(opts.out),
      format,
      maxBytes: Number(opts.maxBytes) || 400000,
    });
    process.stdout.write(
      `${JSON.stringify({ files: result.files.length, totalBytes: result.totalBytes, out: opts.out }, null, 2)}\n`,
    );
  });

program.parseAsync(process.argv).catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 1;
});
