#!/bin/bash
# Registry Guard — blocks public npx and npm install calls
# ClubLabs policy: all packages must come from the internal marketplace.
# See .claude/skills/registry-guard/SKILL.md

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('command', ''))
except Exception:
    print('')
" 2>/dev/null || echo "")

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

INTERNAL_SCOPE="@ace-clublabs"

block() {
  local blocked_cmd="$1"
  echo "" >&2
  echo "╔══════════════════════════════════════════════════════════╗" >&2
  echo "║  REGISTRY GUARD — INSTALL BLOCKED                        ║" >&2
  echo "╚══════════════════════════════════════════════════════════╝" >&2
  echo "" >&2
  echo "  Blocked: $blocked_cmd" >&2
  echo "" >&2
  echo "  ClubLab policy prohibits installing packages from the public" >&2
  echo "  npm registry (phishing/supply-chain risk)." >&2
  echo "" >&2
  echo "  Alternatives:" >&2
  echo "    • Use an $INTERNAL_SCOPE scoped package" >&2
  echo "    • Install via: npm install --registry https://npm.pkg.github.com" >&2
  echo "    • Copy the script locally instead of npx-ing it" >&2
  echo "    • Request the package be added to the internal marketplace" >&2
  echo "" >&2
  exit 2
}

# Parse tokens from command via python3 for portability
TOKENS=$(python3 -c "
import sys, shlex
cmd = sys.argv[1]
try:
    tokens = shlex.split(cmd)
    print('\n'.join(tokens))
except Exception:
    print('')
" "$COMMAND" 2>/dev/null || echo "")

FIRST=$(echo "$TOKENS" | head -1)

# --- Block: npx <public-package> ---
if [[ "$FIRST" == "npx" ]]; then
  # Skip flags (-y, --yes, etc.) to find the package name
  PKG=$(echo "$TOKENS" | tail -n +2 | grep -v '^-' | head -1)
  if [[ -n "$PKG" ]] && [[ "$PKG" != ./* ]] && [[ "$PKG" != /* ]] && [[ "$PKG" != node_modules/* ]] && [[ "$PKG" != "$INTERNAL_SCOPE"* ]]; then
    block "npx $PKG"
  fi
fi

# --- Block: npm install/i/add <public-package> without explicit internal registry ---
if [[ "$FIRST" == "npm" ]]; then
  SUBCOMMAND=$(echo "$TOKENS" | sed -n '2p')
  if [[ "$SUBCOMMAND" == "install" ]] || [[ "$SUBCOMMAND" == "i" ]] || [[ "$SUBCOMMAND" == "add" ]]; then
    if ! echo "$COMMAND" | grep -q "\-\-registry"; then
      while IFS= read -r pkg; do
        if [[ -n "$pkg" ]] && [[ "$pkg" != -* ]] && [[ "$pkg" != "$INTERNAL_SCOPE"* ]]; then
          block "npm install $pkg"
        fi
      done <<< "$(echo "$TOKENS" | tail -n +3)"
    fi
  fi
fi

exit 0
