# diffpack

**Pack git-changed files into local LLM-ready context.**

Inspired by the open request for [repomix Diff output mode (#339)](https://github.com/yamadashy/repomix/issues/339) — an independent tool that only packs what changed, not the whole repo. Local-first. No cloud. No LLM API.

```bash
git clone https://github.com/flower1201/diffpack.git
cd diffpack
npm install
npm run build
npx diffpack . --out ./diffpack-out
```

## Why

- Agents burn context on unchanged files
- Full-repo packers are great; **change-only** packs are still awkward
- Private repos stay offline

## Options

| Option | Default | Notes |
|--------|---------|-------|
| `--base <ref>` | worktree+staged+untracked | Use `ref...HEAD` |
| `--out <dir>` | `./diffpack-out` | Writes `pack.md`/`pack.xml` + `summary.json` |
| `--format md\|xml` | `md` | |
| `--max-bytes <n>` | `400000` | Soft budget |

## Limitations

- Not a full repomix replacement (no tree compress / MCP)
- Binary paths skipped by extension
- Requires `git` on PATH

## License

MIT
