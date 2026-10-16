---
id: discovers-all-packages
description: Skill must find all testable packages before setting any thresholds
tags: [discovery, baseline]
---

## Input

User runs: `/test-coverage 80`

The repo has two packages with test configs:
- `web/package.json` references `vitest` in devDependencies
- `app/package.json` references `jest` in devDependencies
- `shared/package.json` has no test runner — it is a types-only package

## Expected

- Skill runs `find . -name "package.json" -not -path "*/node_modules/*"` via Bash
- Skill identifies `web/` and `app/` as testable packages (have vitest/jest)
- Skill identifies `shared/` as non-testable and excludes it from the threshold run
- Skill runs coverage for both `web/` and `app/` to baseline before setting thresholds
- Skill builds a coverage table showing current percentages for branches, functions, lines, statements for each testable package

## Must NOT happen

- Thresholds set in any config file before coverage baseline is established
- `shared/` included in the testable package list despite having no test runner
- Skill skips the discovery step and assumes a fixed set of packages
