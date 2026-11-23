import fs from "node:fs";
import path from "node:path";
import { ENGINE_VERSION } from "../version.js";
import { isBinaryPath, listChangedFiles } from "./git.js";
import type { PackOptions, PackResult, PackedFile } from "./types.js";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function packChanged(options: PackOptions): PackResult {
  const files = listChangedFiles(options.cwd, options.base);
  const packed: PackedFile[] = [];
  const skipped: { path: string; reason: string }[] = [];
  const chunks: string[] = [];
  let totalBytes = 0;

  if (options.format === "md") {
    chunks.push(`# DiffPack\n\nBase: \`${options.base ?? "WORKDIR"}\`\n`);
  } else {
    chunks.push(`<?xml version="1.0" encoding="UTF-8"?>\n<diffpack base="${escapeXml(options.base ?? "WORKDIR")}">`);
  }

  for (const rel of files) {
    if (isBinaryPath(rel)) {
      skipped.push({ path: rel, reason: "binary" });
      continue;
    }
    const abs = path.join(options.cwd, rel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      skipped.push({ path: rel, reason: "missing" });
      continue;
    }
    let text = fs.readFileSync(abs, "utf8");
    let truncated = false;
    const bytes = Buffer.byteLength(text, "utf8");
    if (totalBytes + bytes > options.maxBytes) {
      const remain = Math.max(0, options.maxBytes - totalBytes);
      text = text.slice(0, remain);
      truncated = true;
    }
    const used = Buffer.byteLength(text, "utf8");
    totalBytes += used;
    packed.push({ path: rel, bytes: used, truncated });

    if (options.format === "md") {
      chunks.push(`\n## ${rel}\n\n\`\`\`\n${text}\n\`\`\`\n`);
    } else {
      chunks.push(
        `<file path="${escapeXml(rel)}" bytes="${used}" truncated="${truncated}"><![CDATA[\n${text}\n]]></file>`,
      );
    }
    if (totalBytes >= options.maxBytes) break;
  }

  if (options.format === "xml") chunks.push("</diffpack>\n");

  fs.mkdirSync(options.outDir, { recursive: true });
  const packName = options.format === "md" ? "pack.md" : "pack.xml";
  const packPath = path.join(options.outDir, packName);
  const summaryPath = path.join(options.outDir, "summary.json");
  fs.writeFileSync(packPath, chunks.join("\n"), "utf8");

  const result: PackResult = {
    schemaVersion: "1.0",
    engineVersion: ENGINE_VERSION,
    cwd: options.cwd,
    base: options.base ?? "WORKDIR",
    format: options.format,
    files: packed,
    skipped,
    totalBytes,
    artifacts: { pack: packName, summary: "summary.json" },
  };
  fs.writeFileSync(summaryPath, JSON.stringify(result, null, 2), "utf8");
  return result;
}
