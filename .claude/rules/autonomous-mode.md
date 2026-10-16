# Autonomous Mode Rules

## What Is Autonomous Mode

Autonomous mode is a session-level setting activated via `/autonomous on`. When active, Claude operates with maximum initiative on code and file changes, minimizing interruptions for routine operations.

## Behavior When Autonomous Mode Is ON

### Always Allowed Without Asking
- Edit, create, rename, or delete source files within the project
- Run build, test, lint, and format scripts (`yarn build`, `yarn test`, `yarn lint`, etc.)
- Install or update npm/yarn packages
- Read-only git operations (`git status`, `git diff`, `git log`, `git branch`)
- Modify configuration files (`tsconfig.json`, `vite.config.ts`, `package.json`, etc.)
- Create directories and organize files
- Run `python3` / `python` scripts and inline `-c` expressions for data processing, parsing, audit output analysis, JSON manipulation, etc.
- Run any non-destructive shell command needed to validate changes

### Always Requires Explicit User Approval (Even in Autonomous Mode)
- **`git commit`** — never commit to git without the user explicitly saying to commit
- **`git push`** — never push to remote without explicit instruction
- **Creating or merging pull requests** — always confirm with user
- **`git reset --hard`**, **`git push --force`** — destructive git operations
- **`rm -rf`** on anything outside `dist/`, `node_modules/`, or `.cache/` directories
- **Deployments** to any environment (dev, test, prod)
- **Infrastructure changes** that affect shared resources

## Behavior When Autonomous Mode Is OFF (Default)

Standard Claude Code behavior applies:
- Pause and explain before significant file changes
- Ask before running commands that modify state
- Confirm before installing packages
- Describe planned approach and wait for approval on complex tasks

## Activating and Deactivating

- **Activate**: User types `/autonomous on` in the session
- **Deactivate**: User types `/autonomous off` or starts a new session
- **Autonomous mode does not persist across sessions** — it must be re-enabled each session
- Claude should confirm activation with a brief summary of what it will do autonomously

## Communication Style in Autonomous Mode

- Do not ask "Is it okay if I...?" for routine file edits or build runs
- Proceed and report what was done, not what you're about to do
- Surface decision points only when genuinely ambiguous or when the action falls in the "always requires approval" list above
- After completing a task, provide a concise summary of all changes made
- When ready to commit, present the summary and **wait for the user to say "commit"** or equivalent

## Key Invariant

**Git commits and pushes are never autonomous.** This is non-negotiable regardless of how broadly autonomous mode is enabled. The user must explicitly approve every commit.
