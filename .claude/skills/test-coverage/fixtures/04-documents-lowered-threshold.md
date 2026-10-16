---
id: documents-lowered-threshold
description: When a package cannot reach the requested threshold, the lower value must be documented with a comment explaining why
tags: [thresholds, documentation]
---

## Input

User runs: `/test-coverage 80`

`app/package.json` uses Jest. Baseline coverage for `app/`:
- branches: 58% — below 80%
- functions: 83%
- lines: 81%
- statements: 80%

The user explains that `app/` has untestable browser-redirect paths in the auth module that account for the low branch coverage.

## Expected

- Skill sets branches threshold lower than 80 (at or near the current 58%)
- Skill adds a comment directly above or inside the threshold block explaining why branches is capped lower
- Skill sets functions, lines, and statements to 80 as requested
- Skill includes the lowered threshold in the summary table with a notation
- Skill suggests tracking the missing branch coverage in a follow-up ticket

## Must NOT happen

- Branches threshold set to 80 when current coverage is only 58% (would immediately fail CI)
- Lowered threshold written without any explanatory comment
- All four metrics silently set to 58% (lowering functions/lines/statements unnecessarily)
- Skill refuses to proceed and asks the user to fix coverage first (lowering with documentation is the valid path)
