export type PackFormat = "md" | "xml";

export type PackOptions = {
  cwd: string;
  base?: string;
  outDir: string;
  format: PackFormat;
  maxBytes: number;
};

export type PackedFile = {
  path: string;
  bytes: number;
  truncated: boolean;
};

export type PackResult = {
  schemaVersion: "1.0";
  engineVersion: string;
  cwd: string;
  base: string;
  format: PackFormat;
  files: PackedFile[];
  skipped: { path: string; reason: string }[];
  totalBytes: number;
  artifacts: { pack: string; summary: string };
};
