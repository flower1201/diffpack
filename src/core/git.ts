import { execFileSync } from "node:child_process";

export function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 20 * 1024 * 1024,
  }).trimEnd();
}

export function listChangedFiles(cwd: string, base?: string): string[] {
  const refs = base ? [`${base}...HEAD`] : [];
  const out = base
    ? git(cwd, ["diff", "--name-only", "--diff-filter=ACMR", ...refs])
    : [
        git(cwd, ["diff", "--name-only", "--diff-filter=ACMR"]),
        git(cwd, ["diff", "--name-only", "--cached", "--diff-filter=ACMR"]),
        git(cwd, ["ls-files", "--others", "--exclude-standard"]),
      ].join("\n");

  const set = new Set(
    out
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean),
  );
  return [...set].sort();
}

export function isBinaryPath(path: string): boolean {
  return /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|tgz|woff2?|mp4|exe|dll|so|dylib|bin)$/i.test(
    path,
  );
}
