---
id: configures-vitest-thresholds
description: Skill must add thresholds block inside existing coverage config without changing provider or reporter
tags: [vitest, config]
---

## Input

User runs: `/test-coverage 80`

`web/vitest.config.ts` already exists with:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov', 'html'],
    },
  },
})
```

Baseline coverage for `web/`: branches 85%, functions 90%, lines 88%, statements 87% — all above 80%.

## Expected

- Skill adds a `thresholds` block inside the existing `coverage` block
- All four metrics (branches, functions, lines, statements) set to 80
- `provider: 'istanbul'` is preserved unchanged
- `reporter: ['text', 'lcov', 'html']` is preserved unchanged
- Skill re-runs `yarn test --coverage` to verify thresholds take effect and pass

## Must NOT happen

- `provider` changed from `istanbul` to `v8` or removed
- `reporter` array modified or removed
- Entire `coverage` block replaced rather than `thresholds` added inside it
- Thresholds set to a value other than 80
