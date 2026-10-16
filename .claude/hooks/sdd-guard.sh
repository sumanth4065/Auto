#!/usr/bin/env bash
# Pre-tool hook: warn when sdd --force bypasses a workflow gate.
# Gate overrides write an [SDD-OVERRIDE] audit comment to Jira — always intentional.
# Exits 0 (allow) after printing; blocks nothing.

input=$(cat)
command=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('command',''))" 2>/dev/null || true)

if echo "$command" | grep -q -- '--force'; then
  if echo "$command" | grep -qE '^sdd '; then
    echo "WARNING: sdd --force bypasses a workflow gate and writes [SDD-OVERRIDE] to Jira. Proceed only if intentional." >&2
  fi
fi

exit 0
