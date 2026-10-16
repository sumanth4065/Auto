#!/usr/bin/env bash
# 01-bedrock-usage.sh — Bedrock cost provider for the statusline aggregator.
#
# Numbered 01- so it runs first; add your own providers as 02-, 03-, etc.
#
# Output:  💰 sess $0.42  |  ████████░░ $12.34 / $60.00  [snt $9.10  ops $3.24]
#
# To override the daily quota without editing this file, create:
#   ~/.claude/bedrock-quota.json  →  { "daily": 150.0 }
#
# This file is plugin-managed — do not edit it directly.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PY_SCRIPT="$SCRIPTS_DIR/bedrock-usage/bedrock-usage.py"
PROJECTS_DIR="${CLAUDE_CODE_PROJECTS_DIR:-$HOME/.claude/projects}"
SESSION_ID="${CLAUDE_CODE_SESSION_ID:-}"

if ! command -v python3 &>/dev/null; then
    echo "bedrock-usage: python3 not found" >&2
    exit 1
fi

if [[ ! -f "$PY_SCRIPT" ]]; then
    echo "bedrock-usage: $PY_SCRIPT not found — re-run /statusline-setup" >&2
    exit 1
fi

exec python3 "$PY_SCRIPT" "$PROJECTS_DIR" "$SESSION_ID"
