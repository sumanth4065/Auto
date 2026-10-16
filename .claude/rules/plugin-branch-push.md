# Plugin Push Rules

<!-- Note: `bin/claude-plugin.js` and `template/` are installed at the repo root by the plugin and are always present in repos that use it. References to these paths below are intentional and correct. -->

## Why This Exists

CI runs `node bin/claude-plugin.js status` before publishing. If any plugin-managed
file is `OUTDATED` or `EDITED`, the build exits with code 1. The
`commit-push-guard.sh` hook enforces this check locally on every push, regardless
of branch, before it reaches CI.

## Before Pushing to Any Branch

Always run the status check and resolve all findings first:

```bash
node bin/claude-plugin.js status
```

### Resolving flagged files

**`EDITED` — `.claude/` differs from `template/`**

First check whether the diff is real:
```bash
diff template/<file> .claude/<file>
```
- **Empty diff** (stale lock hash): `npx @ace-clublabs/claude-plugin update`
- **Real diff and `.claude/` is correct**: copy it to `template/`, then `npx @ace-clublabs/claude-plugin update`

**`OUTDATED+EDITED` — `.claude/` has local edits AND diverges from the template version**

```bash
diff template/<file> .claude/<file>
```
- **`.claude/` is ahead** (has improvements not yet in template): copy `.claude/` to `template/`, then `npx @ace-clublabs/claude-plugin update --force`
- **`template/` is ahead** (template has newer changes): merge the template changes into `.claude/`, then `npx @ace-clublabs/claude-plugin update --force`

Re-run `node bin/claude-plugin.js status` and confirm every line shows `ok` before pushing.

## Editing Plugin-Managed Files

Always edit `template/` first — it is the source of truth. Never edit `.claude/` as your only change. The correct workflow:

1. Edit `template/<path-to-file>` (e.g. `template/skills/safe-deploy-web/SKILL.md`)
2. Run `node bin/claude-plugin.js status` — the file should show `ok`
3. Bump the version in `package.json` if the change is substantive
4. Commit, then push

## Project-Owned Files

Files marked `(project-owned)` in status output (e.g. `rules/`, `skills/deploy/`)
are intentionally excluded from the sync check — local edits to those are fine.
