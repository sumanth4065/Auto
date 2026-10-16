#!/usr/bin/env bash
# status-aggregator.sh — Drop-in aggregator for Claude Code's statusLine.
#
# Set this script as your statusLine.command in ~/.claude/settings.json:
#
#   "statusLine": { "command": "~/.claude/scripts/status-aggregator.sh" }
#
# Then add executable .sh scripts to ~/.claude/scripts/statusline.d/ and they
# will be picked up automatically — no settings change needed.
#
# Naming convention: use numeric prefixes to control order (01-, 02-, ...).
# Scripts that exit non-zero or produce no output are silently skipped.
# Outputs from all providers are joined with " | " on a single line.
#
# This file is plugin-managed — do not edit it directly.
# Add custom providers to statusline.d/ instead.

STATUSLINE_D="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/statusline.d"

[[ -d "$STATUSLINE_D" ]] || exit 0

parts=()

while IFS= read -r -d $'\0' script; do
    [[ -x "$script" ]] || continue
    output=$("$script" 2>/dev/null) || continue
    [[ -n "$output" ]] && parts+=("$output")
done < <(find "$STATUSLINE_D" -maxdepth 1 -name '*.sh' -print0 | sort -z)

(( ${#parts[@]} == 0 )) && exit 0

# Join parts with " | "
result="${parts[0]}"
for part in "${parts[@]:1}"; do
    result+=" | $part"
done

printf '%s\n' "$result"
