#!/bin/bash
# Pre-push guard — runs on any branch.
# Blocks git push if any plugin-managed file is OUTDATED or EDITED.

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

# Only intercept git push commands
if ! echo "$COMMAND" | grep -qE "^git push"; then
  exit 0
fi

# Run plugin status check (capture exit code even if non-zero)
# If we're inside the plugin source repo itself, use the local bin directly
set +e
if [[ -f "bin/claude-plugin.js" ]]; then
  STATUS_OUTPUT=$(node bin/claude-plugin.js status 2>&1)
else
  STATUS_OUTPUT=$(npx @ace-clublabs/claude-plugin status 2>&1)
fi
EXIT_CODE=$?
set -e

if [[ $EXIT_CODE -ne 0 ]] || echo "$STATUS_OUTPUT" | grep -qE "OUTDATED|EDITED"; then
  OUTDATED_EDITED=$(echo "$STATUS_OUTPUT" | grep "OUTDATED+EDITED" || true)
  EDITED_ONLY=$(echo "$STATUS_OUTPUT" | grep -v "OUTDATED+EDITED" | grep "EDITED" || true)

  echo "" >&2
  echo "╔══════════════════════════════════════════════════════════╗" >&2
  echo "║  PLUGIN PUSH GUARD — PUSH BLOCKED                        ║" >&2
  echo "╚══════════════════════════════════════════════════════════╝" >&2
  echo "" >&2
  echo "  Plugin-managed files are out of sync. CI will fail." >&2
  echo "" >&2

  if [[ -n "$OUTDATED_EDITED" ]]; then
    echo "  OUTDATED+EDITED — .claude/ is ahead of template/ OR behind it:" >&2
    while IFS= read -r line; do
      echo "    $line" >&2
    done <<< "$OUTDATED_EDITED"
    echo "" >&2
    echo "  Fix:" >&2
    echo "    1. Run: diff template/<file> .claude/<file>" >&2
    echo "       - If .claude/ is ahead: copy it to template/, then:" >&2
    echo "         npx @ace-clublabs/claude-plugin update --force" >&2
    echo "       - If template/ is ahead: merge template/ changes into .claude/, then:" >&2
    echo "         npx @ace-clublabs/claude-plugin update --force" >&2
    echo "" >&2
  fi

  if [[ -n "$EDITED_ONLY" ]]; then
    echo "  EDITED — .claude/ differs from template/:" >&2
    while IFS= read -r line; do
      echo "    $line" >&2
    done <<< "$EDITED_ONLY"
    echo "" >&2
    echo "  Fix:" >&2
    echo "    1. Run: diff template/<file> .claude/<file>" >&2
    echo "       - If the diff is empty (stale lock hash): npx @ace-clublabs/claude-plugin update" >&2
    echo "       - If .claude/ has real changes: copy them to template/, then:" >&2
    echo "         npx @ace-clublabs/claude-plugin update" >&2
    echo "" >&2
  fi

  echo "  Re-run: npx @ace-clublabs/claude-plugin status" >&2
  echo "  Confirm all files show 'ok' before pushing." >&2
  echo "" >&2
  exit 2
fi

echo "✅ Plugin sync check passed — all managed files are ok" >&2
exit 0
