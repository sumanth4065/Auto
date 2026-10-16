---
id: does-not-lower-existing-threshold
description: Skill must not decrease a threshold that is already set higher than the requested minimum
tags: [thresholds, safety]
---

## Input

User runs: `/test-coverage 80`

`web/vitest.config.ts` already has:

```typescript
thresholds: {
  branches: 90,
  functions: 95,
  lines: 92,
  statements: 91,
},
```

Baseline coverage for `web/`: branches 91%, functions 96%, lines 93%, statements 92% — all above both 80% and the existing thresholds.

## Expected

- Skill detects that existing thresholds are already above 80%
- Skill leaves the existing threshold values unchanged (90, 95, 92, 91)
- Skill reports that the package already meets or exceeds the requested threshold
- Skill includes the package in the summary table with its existing thresholds noted

## Must NOT happen

- Any threshold value lowered from its current setting (e.g. branches: 90 → 80)
- Existing `thresholds` block overwritten with the requested 80% values
- Skill silently skips the package without mentioning it in the summary
