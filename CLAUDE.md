# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## System Overview

Auto EFNOL (1st party) lets customers submit auto claims (glass and non-glass) through two flows:

- **Anonymous** (`/`): user authenticates via ACE Identity anonymous flow, enters policy/personal info manually.
- **Behind-login** (`/behindlogin`): user arrives pre-authenticated from MyAccount/PolicyView/ClaimsSummary; policy data is pre-populated.

Frontend is a React 18 / Vite SPA. Backend is AWS Lambda functions (Node 22, ARM64) behind API Gateway, integrating with Guidewire PolicyCenter, MuleSoft, Safelite (glass claims), and Split.io (feature flags).

## Monorepo Structure

| Package | Purpose |
|---------|---------|
| `web/` | React + Vite frontend (Vitest, happy-dom) |
| `app/` | Lambda functions + CDK stack |
| `api-gateway/` | API Gateway CDK and route definitions |
| `@lib/common-utils` | Shared Lambda/web helpers |
| `@lib/shared-contracts` | Shared interfaces and enums (e.g. `LoginFlowType`) |
| `@lib/types` | Shared TypeScript type definitions |
| `@lib/utility` | Date, UUID, club code utilities |
| `infrastructure/` | DynamoDB CDK stacks |
| `tests/` | Playwright E2E — **do not touch** unless explicitly asked |

Managed with Yarn 1 workspaces + Lerna 8.

## Commands

From repo root:

```bash
yarn                     # install all deps
yarn start               # frontend dev server (https://localhost:5173/insurance/auto/file-a-claim)
yarn build               # build everything (types → libs → app → web → gateway)
yarn build-web           # frontend only (builds types+libs first)
yarn build-app           # lambdas + CDK only (builds types+libs first)
yarn build-gateway       # API Gateway CDK only
yarn test                # all tests (lerna run test across packages)
yarn test-web            # frontend Vitest (CI mode, stubs)
yarn test-app            # backend Jest
yarn verify              # full CI: install → build → test
```

### Running a single test

Frontend (from `web/`):
```bash
yarn test -- --testPathPattern="ComponentName"    # filter by file name
yarn test -- src/utils/formatDate.test.ts         # specific file
```

Backend (from a lambda directory, e.g. `app/lambdas/without-login-efnol-auto-get-policy-info/`):
```bash
npx jest --testPathPattern="index.test"
```

### Build order matters

Shared libs must build before consumers: `@lib/types` → `@lib/shared-contracts` → `@lib/common-utils` / `@lib/utility` → `app`/`web`. The `build-web` and `build-app` scripts handle this automatically.

## Architecture Details

### API Routes

Base path: `/auto-efnol`

| Method | Path | Lambda |
|--------|------|--------|
| POST | `/auto/claim` | `create-claim-orchestrator` |
| PUT | `/auto/claim` | `submit-claim` |
| GET | `/auto/policy-info` | `get-policy-info` |
| GET | `/auto/claim-info` | `get-claim-info` |
| GET | `/auto/safelite-redirect` | `get-safelite-redirect` |
| OPTIONS | `*` | `cors-handler` |

Route definitions: `api-gateway/bin/api-gateway.ts`
Lambda wiring: `app/lib/app-stack.ts`

### Authentication Flow

Determined by URL path at `Layout.tsx`:
- `isAnonymous = pathname !== '/behindlogin'`
- Hook: `useAuthenticatedTokenAndPolicyNumber({ isAnonymous })` → calls either `provideAceIdentity()` or `provideBehindLoginAceIdentity()`
- Backend: `extractBehindLoginOrAnonymousProps(policyGuid, token)` in `@lib/common-utils` resolves flow type using presence of `policyGuid` parameter

Key files:
- `web/docs/authentication-flow.md` — full flow documentation
- `web/src/hooks/useAuthenticatedTokenAndPolicyNumber/`
- `web/src/utils/AccessTokenHelper/AccessTokenHelper.ts`
- `@lib/common-utils/src/helpers/extractBehindLoginOrAnonymousProps.ts`

### Frontend API Layer

`web/src/api/sources.ts` provides a `Sources` interface with remote/stub implementations:
- **Remotes** (`web/src/api/remotes/`) — real HTTP calls via axios
- **Stubs** (`web/src/api/stubs/`) — offline fixtures for tests/dev

Tests use stubs by default (env var `REACT_APP_SOURCES=stubs` is set in `test:ci`). The Vitest setup file `web/src/test/vitest-endpoints-mock.ts` pins endpoint URLs before all tests.

### State Management

Frontend uses `react-hooks-global-state` with a reducer pattern:
- `web/src/store/actions.ts` — action types (large union; covers the multi-step claim wizard)
- `web/src/store/reducer.ts` — state shape and reducer

### Feature Flags

Split.io via `@ace-clublabs/feature-flags`. Flags defined in `web/src/types/AutoEFNOLFeatureFlags.ts`. Currently gating: custom vehicle, custom reporter, custom driver.

### Backend Pattern

Each lambda follows: `src/index.ts` (handler) + `src/helpers/` + `src/index.test.ts`. All inherit from `jest.base.js` (root) with ts-jest. DynamoDB caching via `@ace-clublabs/iss-common-lambda-v3` Cache class.

## High-Value Hotspots

- Claim orchestration: `app/lambdas/without-login-efnol-auto-create-claim-orchestrator/src/index.ts`
- Claim submission: `app/lambdas/without-login-efnol-auto-submit-claim/src/index.ts`
- Policy lookup: `app/lambdas/without-login-efnol-auto-get-policy-info/src/index.ts`
- Frontend routing/pages: `web/src/containers/Router.tsx`
- Auth orchestration: `web/src/containers/Layout/Layout.tsx`
- Global state: `web/src/store/reducer.ts`
- API surface: `web/src/api/endpoints.ts`, `web/src/api/sources.ts`

## Change Guardrails

- Make minimal, scoped changes only — no unrelated refactors.
- Reuse existing helpers and patterns before adding abstractions.
- Add/update nearest unit tests for every behavior change.
- Do not modify `tests/` Playwright suites unless explicitly requested.
- No secrets, tokens, or environment-specific credentials in code.
- Do not introduce new dependencies without explicit approval.
- Husky pre-push hook runs `yarn build && yarn test` — ensure both pass.
