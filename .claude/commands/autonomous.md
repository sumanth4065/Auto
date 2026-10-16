---
name: autonomous
description: Toggle autonomous mode — Claude makes all file/code changes without asking permission, but never commits to git without explicit user approval
invocation: /autonomous [on|off]
---

# Autonomous Mode Command

Activates or deactivates autonomous mode for the current session.

## What Autonomous Mode Does

**Enabled**: Claude makes all file edits, code changes, package.json updates, config modifications, and runs build/test commands freely — without pausing to ask permission for each action. Git commits and pushes are **never** performed autonomously; those always require explicit user approval.

**Disabled** (default): Claude follows standard behavior — asks before making significant changes, pauses at decision points.

## Usage

```bash
# Enable autonomous mode for this session
/autonomous on

# Disable and return to default behavior
/autonomous off

# Check current status
/autonomous
```

## Scope of Autonomous Actions (when ON)

Claude may freely perform **without asking**:
- Edit any source file (`.ts`, `.tsx`, `.json`, `.md`, etc.)
- Create new files and directories
- Run `yarn build`, `yarn test`, `yarn lint`, and related scripts
- Run `git status`, `git diff`, `git log` (read-only git)
- Install/update packages (`yarn add`, `yarn remove`)
- Rename or move files within the project
- Update configuration files (tsconfig, vite config, etc.)

Claude will **always stop and ask** before:
- `git commit` — staging and committing changes
- `git push` — pushing to remote
- Creating or merging pull requests
- Dropping or deleting database tables or infrastructure
- Any destructive `rm -rf` operations outside build artifacts
- Deploying to any environment

## Confirmation on Activation

When you run `/autonomous on`, Claude will respond with:
1. Confirmation that autonomous mode is active
2. A summary of what it will do autonomously
3. A reminder that git commits/pushes still require your approval

## Example Session

```
You: /autonomous on
Claude: Autonomous mode ON. I'll make code changes and run builds freely.
        Git commits and pushes still need your explicit approval.

You: Fix all TypeScript errors and make the build pass
Claude: [edits files, runs yarn build, iterates — no permission prompts]
        Done. Build passes. Here's a summary of changes made.
        Ready to commit when you say so.

You: Commit it
Claude: [creates the commit with your approval]
```

## Deactivation

Run `/autonomous off` or start a new session to return to default behavior. Autonomous mode does not persist across sessions.
