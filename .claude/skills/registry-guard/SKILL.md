---
name: registry-guard
description: Enforces ClubLabs policy blocking public npx/npm installs; redirects to internal registry
trigger: when user says "registry-guard", "block npx", "enforce registry policy", or "set up registry guard"
context_weight: lightweight
---

# Registry Guard Skill

Enforces the ClubLabs policy: **do not run `npx <package>` or install packages directly from the public npm registry.** All packages must come from the org's internal marketplace/registry.

## What This Skill Does

When invoked, this skill:
1. Writes `.claude/hooks/registry-guard.sh` — the shell hook that intercepts and blocks unsafe commands
2. Updates `.claude/settings.json` — wires the hook into `PreToolUse` for all Bash calls
3. Removes `Bash(npx *)` and `Bash(npm install *)` from the broad `permissions.allow` list, replacing them with safer scoped versions

## Trigger Conditions

- User invokes `/registry-guard`
- User says "enforce registry policy" or "block public npx"
- Security audit flags open `npx *` permission

## Steps to Execute

### Step 1 — Write the hook script

Write the file `.claude/hooks/registry-guard.sh` with the content from the **Hook Script** section below.
Make it executable: `chmod +x .claude/hooks/registry-guard.sh`

### Step 2 — Update settings.json

Add a `PreToolUse` hook entry for `Bash` pointing to the script, and tighten `npx`/`npm install` permissions.

Read `.claude/settings.json` first, then apply these changes:
- Add to `hooks`:
  ```json
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "command",
          "command": "bash .claude/hooks/registry-guard.sh"
        }
      ]
    }
  ]
  ```
- In `permissions.allow`: replace `"Bash(npx *)"` with `"Bash(npx ./*)"`  (local-only)
- In `permissions.allow`: replace `"Bash(npm *)"` with specific safe variants:
  - `"Bash(npm run *)"`, `"Bash(npm test *)"`, `"Bash(npm ci)"`, `"Bash(npm install --registry *)"` 

### Step 3 — Confirm to user

Print a summary:
```
Registry Guard activated.
- Public npx <package> calls are now blocked
- Public npm install <package> calls are now blocked
- Allowed: npx ./local-path, npm run/test/ci, installs from @ace-clublabs registry
- Hook: .claude/hooks/registry-guard.sh
```

---

## Hook Script

```bash
#!/bin/bash
# Registry Guard — blocks public npx and npm install calls
# Reads Claude Code PreToolUse JSON from stdin

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null || echo "")

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

ORG_REGISTRY="npm.pkg.github.com"
INTERNAL_SCOPE="@ace-clublabs"

block() {
  echo "REGISTRY GUARD BLOCKED: $1" >&2
  echo "ClubLabs policy prohibits installing packages from the public npm registry." >&2
  echo "Use the internal marketplace or scope packages under $INTERNAL_SCOPE." >&2
  echo "See: https://github.com/orgs/ACE-Clublabs/packages" >&2
  exit 2
}

# Block: npx <package> where package is not a local path
if echo "$COMMAND" | grep -qE '^\s*npx\s+'; then
  PKG=$(echo "$COMMAND" | sed -E 's/^\s*npx\s+(-[^ ]+ )*//' | awk '{print $1}')
  # Allow local paths (./something, /absolute, node_modules/.bin/...)
  if [[ "$PKG" != ./* ]] && [[ "$PKG" != /* ]] && [[ "$PKG" != node_modules/* ]]; then
    # Allow org-scoped packages
    if [[ "$PKG" != "$INTERNAL_SCOPE"* ]]; then
      block "npx $PKG"
    fi
  fi
fi

# Block: npm install <package> without explicit internal registry flag
if echo "$COMMAND" | grep -qE '^\s*npm\s+(install|i|add)\s+'; then
  if ! echo "$COMMAND" | grep -q "\-\-registry"; then
    # Allow if only installing org-scoped packages
    PACKAGES=$(echo "$COMMAND" | sed -E 's/^\s*npm\s+(install|i|add)\s+//' | tr ' ' '\n' | grep -v '^-')
    for pkg in $PACKAGES; do
      if [[ "$pkg" != "$INTERNAL_SCOPE"* ]] && [[ "$pkg" != "" ]]; then
        block "npm install $pkg"
      fi
    done
  fi
fi

exit 0
```

---

## Allowlist Reference

These patterns are **safe** and should remain permitted:
| Pattern | Reason |
|---|---|
| `npx ./node_modules/.bin/*` | Local binary, already installed |
| `npm run *` | Runs scripts, no install |
| `npm test` / `npm ci` | No new package fetch from public |
| `npm install --registry https://npm.pkg.github.com *` | Explicit internal registry |
| `yarn add @ace-clublabs/*` | Org-scoped, hits GitHub Packages via `.npmrc` |

## Disabling

To disable: remove the `PreToolUse` hook entry from `.claude/settings.json` and run `/update-config`.
