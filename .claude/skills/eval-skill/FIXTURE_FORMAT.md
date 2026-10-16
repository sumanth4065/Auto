---
name: eval-skill-fixture-format
description: Format reference for writing eval-skill fixture files
---

# Fixture Format

Each fixture is a markdown file in `.claude/skills/<skill-name>/fixtures/`.

## File naming

Use a short, descriptive kebab-case name that states what is being tested:

```
01-approval-requires-review.md
02-impl-plan-rejects-phases.md
03-memory-written-on-decision.md
```

The numeric prefix controls execution order (lower = runs first). Use two digits.

## File structure

```markdown
---
id: <kebab-case-id matching filename without number prefix and .md>
description: <one sentence — what behavior this fixture verifies>
tags: [<tag>, <tag>]
---

## Input

<Natural language description of what the user said or did to trigger the skill.
Include any relevant session context — prior commands run, state already established.
Be specific enough that an executor agent can determine exactly what the skill should do.>

## Expected

<Bulleted list of behaviors that MUST appear in the executor's trace.
Each item should be independently checkable — one behavior per bullet.
State in terms of actions taken and information presented, not internal implementation.>

- <behavior 1>
- <behavior 2>
- <behavior 3>

## Must NOT happen

<Bulleted list of behaviors that must be ABSENT from the trace.
These are the regression guards — the things that going wrong would be hard to catch otherwise.>

- <forbidden behavior 1>
- <forbidden behavior 2>
```

## Writing good fixtures

**One behavior per fixture.** A fixture that tests 5 things at once produces ambiguous PARTIAL scores. Keep each fixture focused on one protocol rule or one failure mode.

**Be concrete in Expected.** "Runs `sdd review <key>` before `sdd approve <key>`" is testable. "Handles approval correctly" is not.

**Must NOT happen is as important as Expected.** The most valuable fixtures are the ones that catch regressions in guard rails — things the skill explicitly prohibits.

**Fixtures document tribal knowledge.** If a bug was caught manually, write a fixture for it. The fixture captures why the rule exists, not just that it does.

## Example fixture

```markdown
---
id: approval-requires-review
description: Dispatcher must run sdd review before presenting approval options
tags: [approval, protocol]
---

## Input

User runs: `/spec-plan impl approve SDD-42`

No prior `sdd review SDD-42` has been run in this session.

## Expected

- Dispatcher runs `sdd review SDD-42` via Bash
- Dispatcher parses the JSON envelope from the review
- Dispatcher presents the review summary to the user (type, summary, status, headings, comments)
- Dispatcher asks for confirmation with exactly three options: Yes, Yes-but, No
- Dispatcher waits for user response before proceeding

## Must NOT happen

- `sdd approve SDD-42` called without a preceding `sdd review SDD-42`
- Dispatcher self-approves (confirms on behalf of the user without waiting)
- Dispatcher skips the review because it "already knows" the content
```
