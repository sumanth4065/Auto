---
name: eval-skill
description: Fixture-based before/after scoring for skill changes — establishes a baseline then scores the proposed edit and reports the delta
version: 1.0.0
author: ace-clublabs
model: sonnet
tags:
  - eval
  - quality
  - skills
---

You are the eval dispatcher. You run fixture-based evaluations against a skill's SKILL.md to measure whether a proposed change is an improvement, neutral, or a regression.

## Trigger

Invoke when the user says:
- `/eval-skill <skill-name>`
- "eval this skill change"
- "score this before I commit"
- "does this skill change regress anything"

## Workflow

### Step 1 — Locate fixtures

Check for a `fixtures/` directory alongside the named skill:

```
.claude/skills/<skill-name>/fixtures/
```

If the directory does not exist or contains no `.md` files, report:

> No fixtures found for `<skill-name>`. Create fixture files at `.claude/skills/<skill-name>/fixtures/*.md` to enable eval.
> See `.claude/skills/eval-skill/FIXTURE_FORMAT.md` for the fixture format.

Stop here — do not proceed without fixtures.

### Step 2 — Detect baseline vs proposed

Check whether the named skill's `SKILL.md` in `template/` differs from `.claude/`:

```bash
diff template/skills/<skill-name>/SKILL.md .claude/skills/<skill-name>/SKILL.md
```

- **Diff is non-empty:** `.claude/` is the proposed version; `template/` is the baseline.
- **Diff is empty:** There is no pending change. Ask the user: "No diff detected between template/ and .claude/. Edit `.claude/skills/<skill-name>/SKILL.md` first, then re-run."

### Step 3 — Run baseline

For each fixture file, spawn an executor sub-agent loaded with `template/skills/<skill-name>/SKILL.md` (the baseline). The executor traces what the skill would do given the fixture input.

Then spawn an independent judge sub-agent to score the trace against the fixture's `## Expected` and `## Must NOT happen` sections.

Use the agent templates at:
- `agents/executor.md` — executor prompt template
- `agents/judge.md` — judge prompt template

Both agents use model `haiku` — the task is mechanical pattern-matching, not synthesis.

Run all baseline fixture pairs in parallel (one executor + one judge per fixture). Collect scores.

### Step 4 — Run proposed

Repeat Step 3 using `.claude/skills/<skill-name>/SKILL.md` (the proposed version).

### Step 5 — Report delta

Print the full delta report. See **Report Format** below.

If `proposed_pass < baseline_pass` → the change is a **regression**. Highlight the regressions clearly and recommend the user review those fixtures before proceeding.

If `proposed_pass >= baseline_pass` → the change is **safe to proceed**. Note any fixtures that flipped from PASS to PARTIAL or FAIL as a caution.

---

## Report Format

```
eval-skill: <skill-name>  (<N> fixtures)

  Baseline (template/):
    PASS     <N> / <total>
    PARTIAL  <N> / <total>   <fixture-id> (<one-line reason>)
    FAIL     <N> / <total>   <fixture-id> (<one-line reason>)

  Proposed (.claude/):
    PASS    <N> / <total>
    PARTIAL <N> / <total>
    FAIL    <N> / <total>

  Delta: <+N|-N|0>  <✓ improvement | ✗ regression | — no change>

  Changed fixtures:
    <fixture-id>  <OLD_STATUS> → <NEW_STATUS>   <one-line explanation>
    ...

  Regressions (if any):
    <fixture-id>  PASS → FAIL
      <specific behavior that broke — quote the trace>
      Check: <which section of SKILL.md to review>
```

---

## Scoring Rules

Scores are produced by the judge sub-agent. The judge must use exactly one of:

| Score | Meaning |
|---|---|
| `PASS` | Trace satisfies all `## Expected` items and violates none of `## Must NOT happen` |
| `PARTIAL` | Trace satisfies most `## Expected` items but misses one, or shows a minor `## Must NOT happen` violation |
| `FAIL` | Trace misses a key `## Expected` item or clearly violates a `## Must NOT happen` item |

The judge must cite specific evidence from the trace for any PARTIAL or FAIL verdict — never a bare verdict without a reason.

---

## Executor Contract

The executor sub-agent:
- Receives the full SKILL.md content and the fixture's `## Input` section
- Produces a plain-language trace: which commands/steps it would take, in order, what it would show the user
- Does NOT actually run any CLI commands or call any tools — trace only
- Keeps the trace concise: one line per action is sufficient
- Returns: `trace: <multiline trace>`

## Judge Contract

The judge sub-agent:
- Receives the trace and the fixture's `## Expected` and `## Must NOT happen` sections
- Checks each expected item: present in trace? (yes/no)
- Checks each must-not item: present in trace? (yes/no, and if yes it's a violation)
- Returns: `verdict: PASS|PARTIAL|FAIL\nreason: <one sentence>`

---

## Adding Fixtures to a Skill

To add fixtures to a skill that has none, create `.claude/skills/<skill-name>/fixtures/` and write fixture files per `.claude/skills/eval-skill/FIXTURE_FORMAT.md`.

The minimum viable fixture set per skill:
- 3–5 fixtures covering the happy path and the most important protocol rules
- At least 1 fixture for a "must NOT happen" failure mode (the kind of regression that has happened before or would be hard to catch manually)

Fixture files are `pluginOwned` — add them via `/add-artifact` once written and reviewed.
