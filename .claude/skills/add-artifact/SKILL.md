---
name: add-artifact
description: Registers a new artifact (skill, command, hook, or rule) that already exists in .claude/ into the plugin — updates plugin.json, copies to template/, updates verify-installation.sh, and bumps the version.
arguments: [name, owned]
allowed-tools: Bash(find *) Bash(ls *) Bash(cp *) Bash(chmod *) Bash(node *) Bash(mkdir *) Bash(cat *) Read Write Edit
---

# Add Plugin Artifact — $name

Automates the steps in `docs/creating-new-artifact.md` for an artifact that already exists in `.claude/`.

- **`$name`** — path relative to `.claude/` (e.g. `skills/safe-deploy-web/SKILL.md`, `commands/my-command.md`, `hooks/my-hook.sh`, `rules/my-rule.md`)
- **`$owned`** — `plugin` or `project`. Defaults to `plugin` if not specified. Plugin-owned files are overwritten on every `update`; project-owned files are written once on `install` and never overwritten.

---

## Step 1 — Validate the source file exists

```bash
ls .claude/$name
```

If the file is not found, stop and tell the user:

> `.claude/$name` does not exist. Create the file first, then re-run this skill.

Do not proceed until the file is confirmed present.

---

## Step 2 — Detect artifact type

Derive the artifact type from the path:

| Path pattern | Type |
|---|---|
| `skills/*/SKILL.md` | skill |
| `commands/*.md` | command |
| `hooks/*.sh` | hook |
| `rules/*.md` | rule |

If the path doesn't match any pattern, ask the user to confirm the type before continuing.

---

## Step 3 — Copy to `template/`

For plugin-owned artifacts (`$owned == plugin`, or when `$owned` was not specified):

```bash
mkdir -p template/$(dirname $name)
cp .claude/$name template/$name
```

For hooks, ensure the template copy is executable:

```bash
chmod +x template/$name
```

For project-owned artifacts (`$owned == project`):

```bash
mkdir -p project-template/$(dirname $name)
cp .claude/$name project-template/$name
```

Confirm the copy succeeded:

```bash
ls template/$name        # plugin-owned
ls project-template/$name  # project-owned
```

---

## Step 4 — Register in `plugin.json`

Read `plugin.json`. Add the relative path to the correct array:

- Plugin-owned → `pluginOwned`
- Project-owned → `projectOwned`

Place the new entry grouped with others of the same type (skills with skills, commands with commands, etc.).

Example result for a plugin-owned skill:
```json
"pluginOwned": [
  ...
  "skills/safe-deploy-web/SKILL.md",
  "skills/add-artifact/SKILL.md"
]
```

Write the updated `plugin.json`.

---

## Step 5 — Update `verify-installation.sh`

`verify-installation.sh` is a manual diagnostic tool for consuming projects — it has a hardcoded `required_files` array that is not derived from `plugin.json` and must be updated explicitly.

Read `.claude/verify-installation.sh`. Add the new entry to the `required_files` array, grouped with others of the same type:

```bash
required_files=(
    ...
    ".claude/$name"
)
```

> Only add rules if every consuming project is expected to have the file. When in doubt, skip rules.

Write the updated `.claude/verify-installation.sh`.

---

## Step 6 — Verify hashes match

Run the plugin status check to confirm `.claude/$name` and `template/$name` have matching hashes:

```bash
node bin/claude-plugin.js status
```

The new entry must show `ok`. If it shows `MISSING` or `OUTDATED`, the copy in Step 3 did not succeed — re-check the paths and repeat.

---

## Step 7 — Report back

Print a summary:

```
✓ Artifact registered: $name
  Type:      <skill|command|hook|rule>
  Ownership: <plugin-owned|project-owned>
  Template:  template/$name   (or project-template/$name)
  plugin.json: added to <pluginOwned|projectOwned>
  verify-installation.sh: entry added

Next: commit your changes and push to trigger the release workflow.
  git add template/$name plugin.json .claude/verify-installation.sh
  git commit -m "feat: add $name artifact to plugin"
```
