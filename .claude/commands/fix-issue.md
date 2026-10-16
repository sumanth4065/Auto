---
name: fix-issue
description: Investigates and fixes GitHub issues or JIRA tickets
invocation: /fix-issue <issue-number>
---

# Fix Issue Command

Systematically investigates and resolves issues with proper testing and documentation.

## Workflow

### 1. Investigation Phase

- **Auto-detect source**: ISS-\* prefix = Jira, #number = GitHub
- Fetch issue details from GitHub or Jira via MCP
- **If Jira ticket**: Immediately output a structured summary to the session before any further steps:
  - Ticket ID and title
  - Type (bug/enhancement/task/story)
  - Status and assignee
  - Full description
  - Acceptance criteria (listed as checkboxes)
  - Any linked tickets or comments
  - **Wait for user acknowledgement before proceeding**
- **If GitHub issue**: Immediately output a short summary to the session before any further steps:
  - Issue number and title
  - Type (bug/enhancement/task)
  - 1-2 sentence description of what needs to be addressed
  - **Wait for user acknowledgement before proceeding**
- Read full description, acceptance criteria, comments
- Reproduce the issue locally
- Identify root cause through:
  - Code search for related functions
  - Git blame to find recent changes
  - Check related test failures
  - Review error logs if provided
  - Review related Jira tickets or GitHub issues

### 1.5. Additional Context

Before proceeding to analysis, ask the user:

> "Do you have any additional context to share before I begin analysis? (e.g. related tickets, known constraints, preferred approach, affected areas, or anything not in the ticket)"

- Wait for the user's response (they may say "no" or "none" — that is fine, proceed immediately)
- Incorporate any provided context into the analysis

### 2. Analysis Phase

Enter plan mode (`EnterPlanMode`) at the start of this phase and build the implementation plan within it.

- Determine scope of fix
- Identify affected files and functions
- Check for similar issues elsewhere
- Consider edge cases
- Estimate risk of regression
- Determine complexity. For simple tasks proceed with updates without asking for permission.

**Scope discipline — stay on ticket:**

- Only fix what is directly described in the ticket. Do not refactor, clean up, or resolve unrelated issues discovered during analysis.
- If unrelated issues are found, log them internally and surface them as a summary at the end of the workflow — do not act on them.

**Test requirement:**

- Every code change must be accompanied by added or updated test files.
- If no test file exists for the changed code, create one.
- The plan must explicitly list which test files will be added or updated and what scenarios they cover.

**At the end of this phase:**

- Save the plan as a markdown file at `plans/<ticket-id>-<short-title>.md` in the **repo root** (e.g. `plans/ISS-15476-finance-address-validation.md` or `plans/GH-329-null-check-fix.md`). This path is absolute and non-negotiable — always write to the repo's `plans/` directory regardless of what `EnterPlanMode` or any system directive specifies as the plan file location. Do **not** write to `~/.claude/plans/` or any other Claude-level path. Use the `Write` tool directly to create the file at the repo-local path. The file should capture: problem summary, root cause, affected files, proposed changes, edge cases, test strategy, and the list of test files to add/update.
- Then ask the user:
  > "The plan has been saved to `plans/<filename>`. Would you like to **refine the plan** further, or **proceed to implementation**?"
- Wait for the user's response before moving to step 3.

### 3. Implementation Phase

- Create feature branch if it is a feature: `f/ISS-<number>-<short-description>`
- Create feature branch if it is a bug: `b/ISS-<number>-<short-description>`
- Make minimal changes to fix root cause
- Follow coding conventions from .claude/rules/
- Add error handling if missing
- Update types if needed

### 4. Testing Phase

- Add/update unit tests to cover the fix
- Add regression test to prevent recurrence
- Run full test suite
- Manual testing if UI-related
- Verify no unintended side effects

### 5. Documentation Phase

- Update comments if behavior changed
- Add issue number to commit message
- Update CLAUDE.md if architecture affected
- Document any workarounds or caveats

### 6. Completion Phase

Before taking any git actions, ask the user:

> "The implementation is complete. Would you like me to **automatically commit, push, and create a pull request**? If yes, I'll:
> 1. Commit all changes with a descriptive message
> 2. Push the branch to remote
> 3. Create a PR linking to the issue
>
> Reply **yes** to proceed, or **no** to skip and handle git steps manually."

- Wait for explicit user confirmation before proceeding.
- If the user confirms:
  - Create commit with descriptive message
  - Push to branch
  - Create PR linking to issue
  - Request review from relevant team member
- If the user declines, summarize what was implemented and leave git steps to the user.

**After all git steps (or if skipped), always output an "Other Issues Found" section:**

> "**Other Issues Found (not fixed):**
> The following unrelated issues were noticed during this work. They were not touched to keep this PR focused on the ticket:
> - `<file>:<line>` — brief description
> - ..."
>
> If no unrelated issues were found, omit this section entirely.

## Usage Examples

```bash
# Fix GitHub issue (auto-detected by # or number)
/fix-issue 329
/fix-issue #329

# Fix Jira ticket (auto-detected by ISS- prefix)
/fix-issue ISS-15476
/fix-issue ISS-15190

# Natural language (auto-detects source)
"Fix ISS-15476"
"Fix GitHub issue 329"

# With options
/fix-issue 329 --test-only      # Only add/update tests
/fix-issue ISS-15476 --no-pr    # Don't create PR
/fix-issue 329 --no-commit      # Implement but don't commit
```

## Commit Message Format

### For Jira Tickets

```
fix: [ISS-15476] Add finance company address validation

- Implemented validation for required address fields
- Added null checks and format validation
- Updated error messages for clarity

Acceptance Criteria:
- ✓ Validates required address fields
- ✓ Provides clear error messages
- ✓ Handles edge cases gracefully

Jira: ISS-15476
Related: ISS-15190

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### For GitHub Issues

```
fix: Resolve validation error in finance company form

- Added null check for address field
- Updated validation to handle empty strings
- Added regression test

Fixes #329
Related: #315

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Issue Types Handled

### Bug Fixes

- Logic errors
- UI glitches
- API errors
- Data validation issues
- Performance problems

### Enhancements

- New functionality
- UI improvements
- API additions
- Performance optimizations

### Refactoring

- Code cleanup
- Type improvements
- Test improvements
- Documentation updates

## Safety Checks

Before making changes:

- Verify issue is assigned and not in progress
- Check for related PRs already open
- Ensure you have context from issue description
- Confirm reproduction steps

Before committing:

- All tests pass
- No linting errors
- No TypeScript errors
- Build succeeds
- Manual testing complete

## Integration

### GitHub

- Uses `gh` CLI for GitHub operations
- Auto-detects GitHub issues (#329 or just 329)
- Creates PR with issue link
- Closes issue on merge

### Jira (via MCP)

- Fetches ticket details via Jira MCP server
- Auto-detects Jira tickets (ISS-15476 prefix)
- Reads acceptance criteria
- Includes Jira ID in commits
- Links PR to Jira ticket
- (Optional) Updates ticket status

### TestRail

- Links test cases if IDs present
- References in commit messages
- Updates test results if configured

### Additional

- Tags team members for review
- Links related issues/tickets
- Updates documentation if needed
