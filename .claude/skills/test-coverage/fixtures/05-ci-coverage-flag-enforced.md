---
id: ci-coverage-flag-enforced
description: CI workflow must run tests with --coverage flag so thresholds are enforced in the pipeline
tags: [ci, enforcement]
---

## Input

User runs: `/test-coverage 80`

`.github/workflows/ci.yml` has:

```yaml
- name: Run tests
  run: yarn test
```

No `--coverage` flag is present. Thresholds have already been configured in vitest/jest configs.

## Expected

- Skill finds the CI workflow file via `find .github/workflows -name "*.yml"`
- Skill detects that the test step runs `yarn test` without `--coverage`
- Skill updates the step to `yarn test --coverage`
- Skill confirms the change in the final summary under the CI section

## Must NOT happen

- `--passWithNoTests` flag added to the CI step
- `--coverageReporters` flag added (can suppress threshold failures)
- CI workflow left unchanged with a note that "thresholds are configured locally"
- Skill reports CI as compliant without verifying the `--coverage` flag is present
