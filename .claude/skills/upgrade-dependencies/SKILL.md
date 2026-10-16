---
name: upgrade-dependencies
description: Upgrade React, TypeScript, and Node to their latest stable versions across a monorepo. Handles peer dep conflicts, Lambda CDK runtime constructs, GHA node-version, .nvmrc, and surfaces breaking changes before commit.
trigger: when user mentions "upgrade react", "upgrade typescript", "upgrade node", "update react", "update typescript", "update node", "bump react", "bump typescript", "bump node", "upgrade dependencies", "update dependencies", "framework upgrade"
arguments: [packages]
allowed-tools: Bash(find *) Bash(grep *) Bash(npm *) Bash(npx *) Bash(yarn *) Bash(node *) Bash(sed *) Bash(cat *) Read Write Edit
---

# Upgrade Dependencies — $packages

You are upgrading framework dependencies to their latest stable versions across this repo.

- **`$packages`** — comma-separated list of targets: `react`, `typescript`, `node`. Defaults to `react,typescript,node` if not specified.

Parse `$packages` at the start. If not provided, treat it as all three. Run only the phases relevant to the requested targets.

---

## Step 1 — Prerequisites

Verify the environment has everything needed before touching any files.

```bash
which yarn 2>/dev/null || echo "MISSING: yarn"
node --version
npm --version
npx npm-check-updates --version 2>/dev/null && echo "ncu available" || echo "ncu not installed — will use npm view"
```

If `yarn` is missing, stop and ask the user to install it. The skill requires yarn for install and test steps.

Check that the repo root has a `package.json`:

```bash
test -f package.json && echo "ok" || echo "MISSING: package.json at repo root"
```

---

## Step 2 — Discovery

Find every `package.json` in the repo, excluding generated directories:

```bash
find . -name "package.json" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -path "*/cdk.out/*" \
  -not -path "*/.cache/*" \
  -not -path "*/.sdd/*"
```

For each `package.json` found, determine which upgrade targets it declares:
- **React**: check `dependencies` or `devDependencies` for `react`, `react-dom`, `@types/react`, `@types/react-dom`
- **TypeScript**: check `dependencies` or `devDependencies` for `typescript`, `@types/node`
- **Node**: check `engines.node` field; separately check for `.nvmrc` at repo root

Build a discovery table:

| File | React | TypeScript | Node (engines) |
|------|-------|------------|----------------|
| `package.json` | — | `^5.4.5` | `>=18` |
| `web/package.json` | `^18.2.0` | `^5.4.5` | — |
| `app/package.json` | — | — | — |

Also find:
- Lambda CDK files declaring `Runtime.NODEJS_*`:
```bash
grep -rln "Runtime\.NODEJS_" --include="*.ts" --exclude-dir=node_modules .
```
- GitHub Actions workflows with `node-version`:
```bash
grep -rln "node-version:" .github/workflows/ 2>/dev/null
```
- Dockerfiles referencing a Node base image:
```bash
find . -name "Dockerfile*" -not -path "*/node_modules/*" | xargs grep -l "FROM node:" 2>/dev/null
```
- `.nvmrc` at repo root:
```bash
test -f .nvmrc && cat .nvmrc || echo "no .nvmrc"
```

---

## Step 3 — Version Audit

For each requested upgrade target, resolve the current declared version and the latest stable version.

### React

```bash
npm view react version          # latest stable
npm view react-dom version
npm view @types/react version
npm view @types/react-dom version
```

Read current versions from each affected `package.json`. Build an audit table:

| Package | Current | Latest | Action |
|---------|---------|--------|--------|
| `react` | `18.2.0` | `19.x.x` | upgrade |
| `react-dom` | `18.2.0` | `19.x.x` | upgrade |
| `@types/react` | `^18.3.0` | `^19.x.x` | upgrade |
| `@types/react-dom` | `^18.3.0` | `^19.x.x` | upgrade |

### TypeScript

```bash
npm view typescript version
npm view @types/node version
```

Read current versions from all affected `package.json` files.

### Node

```bash
node --version                       # currently running version
npm view node dist-tags              # lts and latest tags
```

Identify current declared Node version from `.nvmrc`, `engines.node`, and Lambda CDK runtime strings. Identify target: latest LTS (prefer LTS over current for Lambda compatibility).

Show the current Lambda runtimes found:

```bash
grep -rh "Runtime\.NODEJS_" --include="*.ts" --exclude-dir=node_modules . | sort -u
```

---

## Step 4 — Peer Dependency Analysis

Before planning any upgrade, check whether the target new version would break installed packages' peer constraints. Only run this for targets included in `$packages`.

### React peer deps

For each React ecosystem package found in any `package.json`, fetch its peer constraints:

```bash
npm view @testing-library/react peerDependencies 2>/dev/null
npm view @testing-library/user-event peerDependencies 2>/dev/null
npm view react-router-dom peerDependencies 2>/dev/null
npm view react-hook-form peerDependencies 2>/dev/null
npm view react-query peerDependencies 2>/dev/null
# Also check any @ace-clublabs/* packages
npm view @ace-clublabs/shared-component-library peerDependencies 2>/dev/null
```

For any package whose `peerDependencies.react` constraint does NOT satisfy the target version, flag it as a conflict.

### TypeScript peer deps

```bash
# Check if any build tools pin a TS version range
npm view ts-jest peerDependencies 2>/dev/null
npm view @typescript-eslint/parser peerDependencies 2>/dev/null
npm view @typescript-eslint/eslint-plugin peerDependencies 2>/dev/null
```

### Internal packages (`@ace-clublabs/*`)

If any `@ace-clublabs/*` package declares a peerDependency that conflicts with the target version, classify that upgrade target as **upstream blocked** — do not attempt the upgrade and surface it clearly. Internal packages must be updated by the platform team first.

---

## Step 5 — Triage

Classify each upgrade target into exactly one bucket. Print a triage table for review before making any changes.

| Target | Bucket | Reason |
|--------|--------|--------|
| `react` | ✅ Clean upgrade | No peer conflicts |
| `react-dom` | ✅ Clean upgrade | No peer conflicts |
| `@types/react` | ✅ Clean upgrade | — |
| `@testing-library/react` | ⚠️ Peer conflict | Requires `react@^18`; must upgrade `@testing-library/react` to v14+ first |
| `typescript` | ✅ Clean upgrade | — |
| `node` (Lambda/GHA) | ✅ Clean upgrade | No CDK construct conflicts |
| `@ace-clublabs/shared-component-library` | 🚫 Upstream blocked | Pins `react@^18`; needs platform team update |

**Buckets:**
- ✅ **Clean upgrade** — proceed in Step 6
- ⚠️ **Peer conflict** — surface to user; do NOT apply; recommend resolution path
- 🚫 **Upstream blocked** — surface to user; do NOT apply; requires internal package update
- ⏭️ **Already at latest** — skip silently, note in report

Pause here and show the triage table. Proceed to Step 6 only for **clean upgrade** targets.

---

## Step 6 — Fix

Apply all clean-upgrade edits in one batch. Run `yarn install` once at the end — do not run it per-file.

### React upgrades

For each `package.json` that declares a React package being upgraded, update the version using the `latest` value resolved in Step 3. Always upgrade `react`, `react-dom`, `@types/react`, and `@types/react-dom` together — never upgrade one without the others.

Use `Edit` to update version strings in each file. Preserve the existing semver range prefix (`^`, `~`, or exact).

### TypeScript upgrades

For each `package.json` that declares `typescript`, update it to the latest stable version. Also update `@types/node` to match the target Node version major (e.g., `@types/node@^22` if upgrading to Node 22).

### Node upgrades

**`.nvmrc`** — if present, update to the target Node major:
```
22
```

**`engines.node`** — in each `package.json` that declares it, update the minimum version:
```json
"engines": { "node": ">=22" }
```

**Lambda CDK runtime constructs** — for each `.ts` file found in Step 2, replace the old runtime with the target:

Common runtime strings to find and replace (adjust source/target to match what was found):
- `Runtime.NODEJS_18_X` → `Runtime.NODEJS_24_X`
- `Runtime.NODEJS_20_X` → `Runtime.NODEJS_24_X`
- `Runtime.NODEJS_22_X` → `Runtime.NODEJS_24_X`

```bash
grep -rln "Runtime\.NODEJS_18_X\|Runtime\.NODEJS_20_X\|Runtime\.NODEJS_22_X" --include="*.ts" --exclude-dir=node_modules .
```

Use `Edit` (not sed) to update each file. Verify with grep after editing:

```bash
grep -rn "Runtime\.NODEJS_" --include="*.ts" --exclude-dir=node_modules . | grep -v "NODEJS_24_X"
```

This must return empty before proceeding.

**GitHub Actions workflows** — for each workflow file found in Step 2, update `node-version` entries:

```bash
grep -rn "node-version:" .github/workflows/
```

Update each occurrence to the target Node major (e.g., `'22'` or `22`). Preserve quoting style found in the file.

**Dockerfiles** — for each Dockerfile found in Step 2, update `FROM node:` base image to the target LTS tag (e.g., `FROM node:22-alpine` or `FROM node:22-slim`). Preserve the existing OS variant suffix.

### Run install

After all edits are complete:

```bash
yarn install 2>&1
```

If `yarn install` fails, stop and surface the error. Do not proceed.

---

## Step 7 — TypeScript Compile Check

Run the TypeScript compiler with no emit to catch new errors introduced by the version upgrades:

```bash
npx tsc --noEmit 2>&1
```

If errors are present, surface each one with its full `file:line:col` location and message. Do NOT proceed to the test suite or commit gate. Present the errors and stop — the user must resolve TS errors before the upgrade can be completed.

If the repo has multiple `tsconfig.json` files (monorepo), find them first:

```bash
find . -name "tsconfig.json" -not -path "*/node_modules/*" -not -path "*/dist/*"
```

Run `tsc --noEmit` for each relevant one.

---

## Step 8 — Test Suite

Run the full test suite:

```bash
yarn test 2>&1
```

If tests fail, surface the failures. For each failing test, note whether it's likely caused by the version upgrade (changed API, new strict behavior, removed export) or is pre-existing. Do not proceed to the commit gate if any tests fail.

If the repo uses per-package test commands (e.g., `yarn test-web`, `yarn test-app`), run both.

---

## Step 9 — Breaking Changes Checklist

Based on the version transitions detected in Step 3, surface a version-gated checklist of known breaking changes. Only show items relevant to the actual source → target version pairs found.

### React 17 → 18

- [ ] `ReactDOM.render` must be replaced with `ReactDOM.createRoot(el).render(<App />)`
- [ ] `ReactDOM.hydrate` must be replaced with `ReactDOM.hydrateRoot(el, <App />)`
- [ ] Automatic state batching now applies outside React events (timeouts, promises) — verify no unintended behavior
- [ ] Strict Mode now double-invokes effects in development to surface impure effects
- [ ] `act()` in tests must wrap all state-updating async operations

### React 18 → 19

- [ ] `forwardRef` is removed — convert to accepting `ref` as a regular prop
- [ ] `Context.Provider` wrapper is no longer needed — render `<MyContext value={...}>` directly
- [ ] `ReactDOM.render` is removed (was deprecated in 18) — must use `createRoot`
- [ ] `useFormState` renamed to `useActionState` — update all usages
- [ ] `react-dom/test-utils` is removed — import from `@testing-library/react` instead
- [ ] `defaultProps` on function components is removed — use JS default parameters

### TypeScript 4.x → 5.x

- [ ] Decorators rewrite: if using `@` decorators, add `"experimentalDecorators": true` in tsconfig or migrate to Stage 3 decorator syntax
- [ ] `moduleResolution` — `"bundler"` is now available and may be needed for Vite/esbuild setups
- [ ] `exactOptionalPropertyTypes` — if enabled, `undefined` is no longer assignable to optional props

### TypeScript 5.x → 5.5+

- [ ] `verbatimModuleSyntax` — type-only imports must use `import type`; run `tsc --verbatimModuleSyntax` to audit
- [ ] New control flow narrowing may expose previously unchecked `never` branches

### TypeScript 5.5+ → 5.8+

- [ ] Isolated declarations (`isolatedDeclarations`) enforces explicit return types on exported functions
- [ ] `--noUncheckedSideEffectImports` treats bare side-effect imports more strictly

### Node 18 → 20

- [ ] `fetch` is now stable — remove any `node-fetch` polyfill if used only for Node
- [ ] OpenSSL 3.x is default — test for any legacy `createCipher`/`createDecipher` usage
- [ ] `--experimental-vm-modules` flag behavior changed — verify Vitest/Jest config if used

### Node 20 → 22

- [ ] `require(esm)` now works without flags — review any CJS/ESM interop workarounds
- [ ] `URLPattern` is now global — remove any polyfill imports
- [ ] Lambda runtime `nodejs24.x` requires verifying CDK bootstrap version supports it

---

## Step 10 — Report and Commit Gate

Gate conditions before presenting the commit-ready summary. All three must pass:

1. `tsc --noEmit` exits with code 0
2. `yarn test` exits with code 0
3. No peer-conflict or upstream-blocked upgrades were silently skipped

Print a final summary:

```
## Upgrade Dependencies — Complete

### Version Changes

| Package | Before | After | Files Changed |
|---------|--------|-------|---------------|
| react | 18.2.0 | 19.x.x | web/package.json |
| react-dom | 18.2.0 | 19.x.x | web/package.json |
| @types/react | ^18.3.0 | ^19.x.x | web/package.json |
| typescript | ^5.4.5 | ^5.8.x | package.json, web/package.json |
| node (Lambda) | NODEJS_22_X | NODEJS_24_X | app/stacks/api-stack.ts |
| node (.nvmrc) | 22 | 24 | .nvmrc |
| node (GHA) | '22' | '24' | .github/workflows/ci.yml |

### Skipped (Peer Conflict)
- `@testing-library/react@13.x` — pins `react@^18`; upgrade to v14+ separately

### Skipped (Upstream Blocked)
- `@ace-clublabs/shared-component-library` — pins `react@^18`; requires platform team update

### Breaking Changes to Review
- [ ] (items from Step 9 relevant to this upgrade)

### Gate Status
- ✅ tsc --noEmit: 0 errors
- ✅ yarn test: all passing
- ✅ No silently skipped upgrades

Ready to commit. Run `git add` and `git commit` when reviewed.
```

If any gate condition fails, do not present the commit-ready summary. Surface the failure and stop.
