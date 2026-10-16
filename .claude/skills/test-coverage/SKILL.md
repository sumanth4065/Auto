---
name: test-coverage
description: Enforce minimum test coverage thresholds across all packages in a repo. Baselines current coverage, sets configurable minimums for branches, functions, lines, and statements, and ensures yarn test fails and CI enforces the threshold.
trigger: when user mentions "test coverage", "coverage threshold", "coverage minimum", "enforce coverage", "add coverage"
arguments: [threshold]
allowed-tools: Bash(find *) Bash(ls *) Bash(cat *) Bash(grep *) Bash(yarn *) Read Write Edit
---

# Test Coverage Enforcement — $threshold%

You are enforcing minimum test coverage thresholds across all packages in this repo. 

- **`$threshold`** — the minimum percentage (e.g. `80`). Applies to `branches`, `functions`, `lines`, and `statements` unless a package cannot reach it (document why and lower that package's threshold).

---

## Step 1 — Discover all packages

Find every `package.json` that has a test config (Vitest or Jest):

```bash
find . -name "package.json" -not -path "*/node_modules/*" -not -path "*/.cache/*"
```

For each `package.json`, check whether it references `vitest` or `jest` in `scripts`, `devDependencies`, or `dependencies`. Build a list of testable packages with their paths.

---

## Step 2 — Baseline current coverage

For each testable package, run coverage to establish the current state **before** setting thresholds. This is mandatory — never set a threshold without knowing where the package currently stands.

Run from the repo root:

```bash
yarn test --coverage 2>&1
```

Or, if packages must be run individually:

```bash
cd <package-path> && yarn test --coverage 2>&1
```

Parse the coverage summary output for each package. Record the current percentages for:
- `branches`
- `functions`
- `lines`
- `statements`

Build a table:

| Package | Branches | Functions | Lines | Statements | Meets $threshold%? |
|---------|----------|-----------|-------|------------|-------------------|
| web     | 82%      | 91%       | 88%   | 87%        | ✅ |
| app/lambda-foo | 61% | 74%  | 70%   | 69%        | ❌ |

---

## Step 3 — Determine threshold per package

For each package:

- **If all four metrics meet `$threshold`** → set threshold to `$threshold` for all metrics
- **If one or more metrics are below `$threshold`** → two options:
  1. Add missing tests to bring it up (preferred)
  2. Set a lower documented threshold for that metric only, with a comment explaining why

Never leave coverage unconfigured after this skill runs.

---

## Step 4 — Configure coverage thresholds

Locate the Vitest or Jest config for each package. Common locations:
- `vitest.config.ts` / `vitest.config.js`
- `jest.config.ts` / `jest.config.js`
- `package.json` under `"jest"` or `"vitest"` key

### Vitest — add to `coverage` block

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',        // or 'istanbul' — match what's already configured
      reporter: ['text', 'lcov'],
      thresholds: {
        branches: $threshold,
        functions: $threshold,
        lines: $threshold,
        statements: $threshold,
      },
    },
  },
})
```

If `coverage` already exists, add only the `thresholds` block inside it. Do not change `provider` or `reporter`.

### Jest — add to `coverageThreshold`

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": $threshold,
        "functions": $threshold,
        "lines": $threshold,
        "statements": $threshold
      }
    }
  }
}
```

### Lowered threshold — add a comment above the block

```typescript
// branches capped at 65: AuthService has untestable browser-redirect paths
thresholds: {
  branches: 65,
  functions: $threshold,
  lines: $threshold,
  statements: $threshold,
},
```

---

## Step 5 — Verify thresholds are enforced

Re-run tests with coverage to confirm thresholds take effect:

```bash
yarn test --coverage 2>&1
```

Expected outcomes:
- Packages that meet the threshold → test run passes ✅
- Packages below threshold → test run fails with a coverage error ✅ (this is correct behavior — it means enforcement is working)

If a package now fails due to insufficient coverage, return to Step 3: either add tests or lower and document the threshold. Do not proceed until `yarn test --coverage` passes cleanly across all packages.

---

## Step 6 — Verify CI enforces coverage

Check the CI pipeline configuration:

```bash
find .github/workflows -name "*.yml" | xargs grep -l "test\|coverage" 2>/dev/null
```

For each relevant workflow file, confirm the test step runs with coverage enabled. The coverage flag must be present — CI must not be able to pass with uncovered code.

### If CI runs `yarn test` without `--coverage`

Update the step to include the flag:

```yaml
- name: Run tests
  run: yarn test --coverage
```

### If CI runs tests per package

Ensure each package's test step includes `--coverage`:

```yaml
- name: Test web
  run: cd web && yarn test --coverage

- name: Test app
  run: cd app && yarn test --coverage
```

Do **not** add `--coverageReporters` or `--passWithNoTests` flags — these can suppress threshold failures.

---

## Step 7 — Report summary

Present a final summary:

```
## Coverage Threshold Enforcement — Complete

### Baseline vs Threshold

| Package | Branches | Functions | Lines | Statements | Threshold Set |
|---------|----------|-----------|-------|------------|---------------|
| web     | 82% → ✅ | 91% → ✅  | 88% → ✅ | 87% → ✅ | $threshold% |
| app/foo | 61% → ⚠️ | 74% → ✅  | 70% → ✅ | 69% → ⚠️ | branches: 60%, statements: 68% (documented) |

### Files Changed
- `web/vitest.config.ts` — thresholds added
- `app/foo/vitest.config.ts` — lowered thresholds with documentation

### CI
- `.github/workflows/ci.yml` — coverage flag confirmed / added

### Next Steps
- [ ] Run `yarn test --coverage` locally to confirm clean pass
- [ ] Merge and verify CI passes end-to-end
- [ ] For any lowered thresholds, track missing coverage in a follow-up ticket
```
