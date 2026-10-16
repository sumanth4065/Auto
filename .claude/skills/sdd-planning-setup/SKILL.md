---
name: sdd-planning-setup
description: Initialize SDD planning skill — checks prerequisites, authentication, and project configuration
version: 0.3.0
author: ace-clublabs
model: sonnet
---

Run prerequisite checks for the SDD Planning Skill. Verify acli installation, authentication, and project configuration. Guide the user through any missing steps. Creates `.sdd/config.json` if it doesn't exist.

Do NOT spawn sub-agents — all logic runs directly in this context. This is a sequential check-and-fix flow.

## Procedure

Execute these steps in order. Stop at the first failure that requires user action.

### Step 1: Check acli Installation

Run: `which acli`

**If found:**
- Run: `acli --version`
- Report: `✓ acli installed (version <X>)`
- Continue to Step 2.

**If not found:**
- Report: `✗ acli not installed`
- Instruct: "Install with: `brew install atlassian/acli/acli`"
- STOP — tell the user to re-run `/spec-plan-setup` after installing.

### Step 2: Check Global Authentication

Run: `acli auth status`

**If output contains "Authenticated":**
- Report: `✓ Global auth active (<email>)`
- Continue to Step 3.

**If not authenticated:**
- Report: `✗ Global auth not configured`
- Instruct: "Run this command in your terminal: `acli auth login`"
- Explain: "This opens a browser for OAuth. Re-run `/spec-plan-setup` when complete."
- STOP — user must complete interactive auth.

### Step 3: Check Jira Authentication

Run: `acli jira auth status`

**If output contains "Authenticated":**
- Extract the site URL from output.
- Report: `✓ Jira auth active (site: <url>)`
- Continue to Step 4.

**If not authenticated:**
- Report: `✗ Jira auth not configured`
- Instruct: "Run this command in your terminal: `acli jira auth login --web`"
- Explain: "This opens a browser for Jira OAuth. Re-run `/spec-plan-setup` when complete."
- STOP — user must complete interactive auth.

### Step 4: Check ClubLabs User Identity

Check if `~/.clublabs/user.json` exists.

**If it exists and has `jira.accountId`:**
- Report: `✓ User identity configured (<displayName>, <email>)`
- Continue to Step 5.

**If it does not exist or is missing `jira.accountId`:**
- Report: `✗ User identity not configured`
- Run: `acli jira me --json` (or `acli jira auth status --json` if `me` is unavailable)
- Parse the response to extract:
  - `accountId` (Jira/Atlassian account ID)
  - `displayName`
  - `emailAddress`
- Create `~/.clublabs/` if it does not exist: `mkdir -p ~/.clublabs`
- Write `~/.clublabs/user.json` (preserving any existing top-level keys if the file already exists):
  ```json
  {
    "jira": {
      "accountId": "<accountId>",
      "displayName": "<displayName>",
      "email": "<emailAddress>"
    }
  }
  ```
  Note: `~/.clublabs/user.json` is a shared identity file. Other ClubLabs plugins may add their own top-level keys (e.g., `"github"`, `"slack"`). Only write the `jira` key — merge, do not overwrite the full file.
- Report: `✓ User identity configured and saved (<displayName>, <emailAddress>)`
- Continue to Step 5.

**If discovery fails (command not available or returns no accountId):**
- Report: `✗ Could not discover user identity automatically`
- Instruct: "Add your Jira account ID manually to `~/.clublabs/user.json`. You can find it in your Atlassian profile settings."
- Continue to Step 5 — a missing user identity is non-blocking.

### Step 5: Check for Existing Config

Check if `.sdd/config.json` exists in the repository root.

**If it exists:**
1. Read and parse it.
2. Validate: does it have `version`, `projects` (non-empty array), and `defaults`?
3. If valid: check that the configured project is accessible:
   ```bash
   acli jira project view --key <configured-key> --json
   ```
   - If accessible: Report `✓ Config valid — project <key> accessible`. Report setup complete. DONE.
   - If not accessible: Report `✗ Config exists but project <key> is not accessible.` Offer to re-run discovery.
4. If malformed: Report `✗ Config exists but is malformed`. Offer to recreate it.

**If it does NOT exist:**
- Continue to Step 5.

### Step 5: Interactive Config Creation

Ask the user: "What Jira project key should I configure for SDD planning? (e.g., SDD, ENG)"

Once they provide a key:

1. Run discovery:
   ```bash
   acli jira project view --key <KEY> --json
   ```

2. If project not found or not accessible: report error, ask for a different key.

3. If found, parse the response to extract issue types. Look for these SDD types (match by name, case-insensitive comparison, but store the exact name from Jira):
   - Engineering Story
   - Tech Analysis
   - Implementation Plan
   - Phase Task

4. For each matched issue type, store: `{ "id": "<id>", "name": "<exact-name-from-jira>" }`

5. If any required type is missing: warn the user the project may not be fully set up for SDD. Still proceed but note the gap.

6. Use default statuses: `["Backlog", "Selected for Development", "In Progress", "Done"]`
   - Note to user: "Using default status set. If your workflow uses different names, edit `.sdd/config.json`"

7. Create the config:
   ```bash
   mkdir -p .sdd
   ```
   Write `.sdd/config.json` with the discovered values:
   ```json
   {
     "version": "1.0",
     "projects": [
       {
         "key": "<KEY>",
         "role": "engineering",
         "label": "<project name from discovery>",
         "issue_types": {
           "engineering_story": { "id": "<id>", "name": "<exact name>" },
           "tech_analysis": { "id": "<id>", "name": "<exact name>" },
           "implementation_plan": { "id": "<id>", "name": "<exact name>" },
           "phase_task": { "id": "<id>", "name": "<exact name>" }
         },
         "statuses": ["Backlog", "Selected for Development", "In Progress", "Done"]
       }
     ],
     "defaults": {
       "engineering_project": "<KEY>"
     }
   }
   ```

8. Report: "Config created at `.sdd/config.json`". Report setup complete.

## Output Format

Present results as a clear status report:

```
SDD Planning Skill — Setup Check

✓ acli installed (version 1.3.18-stable)
✓ Global auth active (user@example.com)
✓ Jira auth active (site: example.atlassian.net)
✓ Config valid — project SDD accessible

All checks passed. You can now use /spec-plan commands.
```

If config creation was needed:

```
SDD Planning Skill — Setup Check

✓ acli installed (version 1.3.18-stable)
✓ Global auth active (user@example.com)
✓ Jira auth active (site: example.atlassian.net)
✗ No .sdd/config.json found

Discovering project SDD...
  Found: Engineering Story (14257), Tech Analysis (14258),
         Implementation Plan (14259), Phase Task (14260)

Config created at .sdd/config.json
Setup complete. You can now use /spec-plan commands.
```

## Reference

See [GLOSSARY.md](../GLOSSARY.md) for term definitions, artifact types, lifecycle gates, and Jira field mappings.
