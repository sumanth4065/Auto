---
name: statusline-setup
description: Wires up a Bedrock cost status bar into Claude Code's statusLine setting. Installs a drop-in aggregator so any existing statusLine command is preserved, then adds session cost, daily cost vs quota, and per-model breakdown.
allowed-tools: Bash(ls *) Bash(mkdir *) Bash(cp *) Bash(chmod *) Bash(python3 *) Read Write Edit
---

# Statusline Setup

Installs the Bedrock cost status bar into Claude Code's global `~/.claude/settings.json`.
After setup, the status bar shows:

```
💰 sess $0.42  |  ████████░░ $12.34 / $60.00  [snt $9.10  ops $3.24]
```

| Field | Meaning |
|---|---|
| `💰 sess $0.42` | Cost of the current Claude Code session (always live, no cache) |
| `████████░░ $12.34 / $60.00` | 10-char progress bar + today's spend vs daily quota |
| `[snt $9.10  ops $3.24]` | Per-model breakdown using short labels (snt/ops/hku), ordered by cost desc |

Alerts: `⚠️` at 70% quota, `❌` at 100%.

The quota defaults to **$60/day** from Confluence. See Step 7 to override it.

---

## Step 1 — Confirm source scripts are present

Check that the three source files exist in the plugin install:

```bash
ls ~/.claude/scripts/bedrock-usage/bedrock-usage.py 2>/dev/null \
  || ls .claude/scripts/bedrock-usage/bedrock-usage.py 2>/dev/null \
  || echo "NOT FOUND"
```

You should see the path printed (not "NOT FOUND"). The three required files are:
`bedrock-usage.py`, `status-aggregator.sh`, `01-bedrock-usage.sh`.

If missing, the plugin has not been installed or updated in this project. Run:

```bash
npx @ace-clublabs/claude-plugin update
```

then re-run `/statusline-setup`.

Determine the source directory — use whichever path has the `bedrock-usage.py` file:
- User-level install: `~/.claude/scripts/bedrock-usage/`
- Project-local install: `.claude/scripts/bedrock-usage/` (relative to cwd)

---

## Step 2 — Copy scripts to the user-level ~/.claude/scripts/

The scripts must live in `~/.claude/scripts/` so Claude Code can find them regardless of which
project directory is open.

```bash
mkdir -p ~/.claude/scripts/bedrock-usage
mkdir -p ~/.claude/scripts/statusline.d

# Determine source: prefer user-level, fall back to project-local
if [[ -f "$HOME/.claude/scripts/bedrock-usage/bedrock-usage.py" ]]; then
  SOURCE="$HOME/.claude/scripts/bedrock-usage"
elif [[ -f ".claude/scripts/bedrock-usage/bedrock-usage.py" ]]; then
  SOURCE=".claude/scripts/bedrock-usage"
else
  echo "ERROR: source files not found — run 'npx @ace-clublabs/claude-plugin update' first"
  exit 1
fi

cp "$SOURCE/bedrock-usage.py"      ~/.claude/scripts/bedrock-usage/bedrock-usage.py
cp "$SOURCE/status-aggregator.sh"  ~/.claude/scripts/status-aggregator.sh
cp "$SOURCE/01-bedrock-usage.sh"   ~/.claude/scripts/statusline.d/01-bedrock-usage.sh

chmod +x ~/.claude/scripts/status-aggregator.sh
chmod +x ~/.claude/scripts/statusline.d/01-bedrock-usage.sh
```

Confirm all three destinations exist:

```bash
ls ~/.claude/scripts/bedrock-usage/bedrock-usage.py
ls ~/.claude/scripts/status-aggregator.sh
ls ~/.claude/scripts/statusline.d/01-bedrock-usage.sh
```

---

## Step 3 — Read the current global settings.json

Read the file `~/.claude/settings.json`. If it does not exist, treat `statusLine` as absent
and proceed to Step 4 — Case A.

Find the value of `statusLine` (it may be absent, a bare string, or an object with a
`command` key). Note the exact current value — you need it in Step 4.

---

## Step 4 — Wire up the aggregator

Choose the case that matches the current state.

### Case A — No existing statusLine

`statusLine` is absent or `statusLine.command` is empty/null.

Add the following key to `~/.claude/settings.json` (preserve all other keys):

```json
"statusLine": {
  "type": "command",
  "command": "~/.claude/scripts/status-aggregator.sh"
}
```

Proceed to Step 5.

---

### Case B — statusLine already points to the aggregator

`statusLine.command` is exactly `~/.claude/scripts/status-aggregator.sh`.

Nothing to change in settings.json. The `01-bedrock-usage.sh` dropped into
`statusline.d/` in Step 2 is already picked up automatically.

Skip to Step 5.

---

### Case C — statusLine points to a different command

The user has an existing custom command. Migrate it so it continues to run alongside
the new cost bar:

**Special sub-case:** if the existing command contains `bedrock-usage.sh` (the old
monolithic script), the new `01-bedrock-usage.sh` already replaces it — no wrapper
needed. Inform the user, then switch settings.json to the aggregator and proceed to Step 5.

**Otherwise — wrap the old command:**

1. Extract `<EXISTING_CMD>` from the current `statusLine` value (strip quotes; handle
   both bare-string and object forms).

2. Create the wrapper:

```bash
cat > ~/.claude/scripts/statusline.d/00-existing.sh << 'EOF'
#!/usr/bin/env bash
# Preserved from previous statusLine — migrated by /statusline-setup
CMD='<EXISTING_CMD>'
exec $CMD
EOF
chmod +x ~/.claude/scripts/statusline.d/00-existing.sh
```

   Replace `<EXISTING_CMD>` with the literal command string.

3. Update `~/.claude/settings.json` to point to the aggregator:

```json
"statusLine": {
  "type": "command",
  "command": "~/.claude/scripts/status-aggregator.sh"
}
```

4. Inform the user: "Your previous statusLine command has been preserved as
   `~/.claude/scripts/statusline.d/00-existing.sh` and will continue to run
   alongside the Bedrock cost bar."

---

## Step 5 — Write the updated settings.json

Use Read + Edit to apply the change from Step 4 to `~/.claude/settings.json`.

**Important schema rules:**
- Always include `"type": "command"` — Claude Code's settings schema requires it.
- Use the object form `{ "type": "command", "command": "..." }` — never a bare string.
- Remove any old `"refreshInterval"` or other keys from a previous `statusLine` entry.
- Preserve all other top-level keys in the file exactly.

Validate the result is valid JSON before writing.

---

## Step 6 — Verify the status bar works

Test the aggregator manually:

```bash
CLAUDE_CODE_SESSION_ID="" ~/.claude/scripts/status-aggregator.sh
```

Expected output (values will vary):

```
💰 sess $0.00  |  ░░░░░░░░░░ $0.00 / $60.00
```

If nothing prints or you see an error, run the Python script directly to diagnose:

```bash
python3 ~/.claude/scripts/bedrock-usage/bedrock-usage.py ~/.claude/projects ""
```

Common issues:

| Symptom | Fix |
|---|---|
| `python3 not found` | Install Python 3.8+ and ensure it is in PATH |
| `sess $0.00` | Normal when `CLAUDE_CODE_SESSION_ID` is empty (e.g. run outside a Claude Code session) or no session JSONL file exists yet |
| `err: ...` or traceback | Check the path to `bedrock-usage.py` is correct |

---

## Step 7 — (Optional) Set a custom daily quota

**When to use:** If the Confluence-sourced quota is wrong for you (e.g. you have a different
personal limit, or Confluence is unreachable), you can pin a fixed daily dollar value that
overrides everything else.

**Where:** `~/.claude/bedrock-quota.json` — this file exists at `~/.claude/` and the plugin
never modifies or deletes it. It is seeded as an **empty object `{}`** so it is visible and
discoverable, but it is **inert until you add the `"daily"` key**. An empty `{}` is silently
skipped and Confluence-sourced limits continue to apply normally.

**To activate a custom limit**, add the `"daily"` key with your desired USD value:
```bash
echo '{ "daily": 150.0 }' > ~/.claude/bedrock-quota.json
```

**Format** (the `daily` key must be a positive number in USD):
```json
{ "daily": 150.0 }
```

**Priority:** Once `"daily"` is set, this file takes effect immediately on the next status bar
refresh and overrides both the Confluence quota cache (`~/.claude/quota-cache.json`) and the
hardcoded $60 default.

**To revert to Confluence-sourced limits**, remove the `"daily"` key (or reset to empty):
```bash
echo '{}' > ~/.claude/bedrock-quota.json
```

> **Note:** If the file exists but `"daily"` is absent, 0, or the file is malformed JSON, it
> is silently ignored and the next source in the priority chain is used instead.

---

## Step 8 — Report back

Print a summary of what was done:

```
✓ Statusline setup complete.

  Aggregator:     ~/.claude/scripts/status-aggregator.sh
  Cost provider:  ~/.claude/scripts/statusline.d/01-bedrock-usage.sh
  Python script:  ~/.claude/scripts/bedrock-usage/bedrock-usage.py

  settings.json:  statusLine.command → ~/.claude/scripts/status-aggregator.sh

  [Case B only]   "Already pointed to the aggregator — no change needed."
  [Case C only]   "Previous command saved as: ~/.claude/scripts/statusline.d/00-existing.sh"

The status bar will appear on the next Claude Code reload.

To set a custom daily quota, add "daily" to ~/.claude/bedrock-quota.json:
  { "daily": 150.0 }
  (file exists as {} — inert until "daily" is added; see Step 7)

To add your own status providers, drop executable .sh files into:
  ~/.claude/scripts/statusline.d/    (name them 02-, 03-, etc. to control order)

NOTE: After 'npx @ace-clublabs/claude-plugin update', re-run /statusline-setup
to propagate updated scripts to ~/.claude/scripts/.
```
