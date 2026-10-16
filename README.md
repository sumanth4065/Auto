# Auto EFNOL

Self-service web application that allows customers to file first-notice-of-loss (FNOL) auto insurance claims — including glass and non-glass incidents — both with and without requiring a MyAccount login even though the repo name says "without-login".

## Table of Contents

- [Auto EFNOL](#auto-efnol)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Architecture](#architecture)
  - [Monorepo Structure](#monorepo-structure)
  - [Getting Started](#getting-started)
  - [Development](#development)
  - [Testing](#testing)
  - [API Routes](#api-routes)
  - [Authentication Flows](#authentication-flows)
  - [Deployment](#deployment)

---

## Overview

Customers arrive at `/insurance/auto/file-a-claim` and can submit a claim through one of two flows:

- **Anonymous flow** — user authenticates via ACE Identity anonymous flow, enters policy/personal info manually.
- **Behind-login flow** — user arrives pre-authenticated from MyAccount, PolicyView, or ClaimsSummary; policy data is pre-populated.

The frontend is a React/Vite SPA. The backend is a set of AWS Lambda functions exposed through an API Gateway, integrating with Guidewire PolicyCenter, MuleSoft, Safelite (glass claims), and Split.io (feature flags).

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  Customer Browser                                                      │
│  React SPA (Vite)  ←→  ACE Identity (Okta/auth)                        │
└───────────────────────────┬────────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌────────────────────────────────────────────────────────────────────────┐
│  API Gateway  (efnol-auto-no-auth-api-gateway)                         │
│  Base path: /insurance-auto-efnol-woli                                 │
│  Token authorizer → Okta / ACE Identity                                │
└───────┬────────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Lambda Functions (Node 22, ARM64, VPC, X-Ray tracing)                │
│                                                                       │
│  create-claim-orchestrator  ← POST /auto/claim                        │
│  create-claim               ← (orchestrator sub-call)                 │
│  submit-claim               ← PUT /auto/claim                         │
│  get-policy-info            ← GET /auto/policy-info                   │
│  get-claim-info             ← GET /auto/claim-info                    │
│  get-safelite-redirect      ← GET /auto/safelite-redirect             │
│  send-email                 ← async (invoked internally)              │
│  cors-handler               ← OPTIONS *                               │
└───────┬───────────────────────────────────────────────┬───────────────┘
        │                                               │
        ▼                                               ▼
┌─────────────────────────┐                      ┌───────────────────────┐
│  DynamoDB Tables        │                      │  External Services    │
│  ClaimNoAuthCache       │                      │  Guidewire (claims)   │
│  BehindLoginPolicyCache |                      │  MuleSoft (proxy)     │
│  ErrorCache             │                      │  Safelite (glass)     │
└─────────────────────────┘                      │  Split.io (flags)     │
                                                 └───────────────────────┘
```

---

## Monorepo Structure

```
.
├── @lib/
│   ├── common-utils/        # Shared Lambda/web helpers
│   ├── shared-contracts/    # Shared interfaces and enums
│   ├── types/               # Shared TypeScript type definitions
│   └── utility/             # Date, UUID, club code utilities
├── app/
│   ├── bin/app.ts           # CDK app entry point
│   ├── lib/app-stack.ts     # CDK Stack (Lambdas, IAM, VPC config)
│   └── lambdas/             # One folder per Lambda function
├── api-gateway/
│   └── bin/api-gateway.ts   # Route → Lambda mappings
├── web/
│   ├── src/
│   │   ├── api/             # API clients and remote contracts
│   │   ├── components/      # Shared React components
│   │   ├── containers/      # Page/flow containers (Layout, Router, steps)
│   │   ├── hooks/           # Custom hooks (auth, policy, claim)
│   │   ├── store/           # Global state (actions, reducer)
│   │   └── utils/           # Auth helpers, token utilities
│   └── docs/
│       └── authentication-flow.md   # Auth flow deep-dive
├── infrastructure/
│   └── dynamodb/            # DynamoDB CDK stacks (per-env)
└── tests/                   # Playwright E2E suites (do not modify)
```

---

## Getting Started

**Prerequisites**

- Node.js 22.x (required for the repo/backend; matches the root `.nvmrc` and backend Lambda `engines.node` requirement)
- Yarn 1.22.22+
- AWS credentials configured (only required for backend/CDK work)

**Install dependencies**

```bash
yarn
```

---

## Development

**Start the frontend dev server**

```bash
yarn start
# or inside web/:
yarn dev
```

Opens `https://localhost:5173/insurance/auto/file-a-claim?token=some-token&policyNumber=CAA186030006`.  
HTTPS uses a self-signed certificate (basicSsl plugin). Authorization bypass is available in non-production environments — see [`web/docs/authentication-flow.md`](web/docs/authentication-flow.md).

**Build targets**

| Command              | What it builds         |
| -------------------- | ---------------------- |
| `yarn build`         | Everything             |
| `yarn build-web`     | Frontend SPA           |
| `yarn build-app`     | Lambda functions + CDK |
| `yarn build-gateway` | API Gateway CDK        |

---

## Testing

| Command         | Scope                                        |
| --------------- | -------------------------------------------- |
| `yarn test`     | All packages                                 |
| `yarn test-web` | Frontend (Vitest, CI mode)                   |
| `yarn test-app` | Backend Lambdas (Jest)                       |
| `yarn verify`   | Full CI pass: clean → install → build → test |

Frontend tests use **Vitest** with `happy-dom`. Backend tests use **Jest**.

Playwright E2E suites live in `tests/` — do not modify unless explicitly asked.

---

## API Routes

All routes are under base path `/insurance-auto-efnol-woli`.

| Method    | Path                      | Lambda                                               | Purpose                   |
| --------- | ------------------------- | ---------------------------------------------------- | ------------------------- |
| `POST`    | `/auto/claim`             | `without-login-efnol-auto-create-claim-orchestrator` | Create a draft claim      |
| `PUT`     | `/auto/claim`             | `without-login-efnol-auto-submit-claim`              | Submit / assign the claim |
| `GET`     | `/auto/policy-info`       | `without-login-efnol-auto-get-policy-info`           | Fetch policy details      |
| `GET`     | `/auto/claim-info`        | `without-login-efnol-auto-get-claim-info`            | Fetch existing claim info |
| `GET`     | `/auto/safelite-redirect` | `without-login-efnol-auto-get-safelite-redirect`     | Glass claim redirect URL  |
| `OPTIONS` | `*`                       | `without-login-efnol-auto-cors-handler`              | CORS preflight            |

See [`api-gateway/Readme.md`](api-gateway/Readme.md) for request/response contracts.

---

## Authentication Flows

Two modes are supported, determined by the URL path:

| Mode             | Route          | Description                                                                                          |
| ---------------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| **Anonymous**    | `/`            | User authenticates via ACE Identity anonymous flow, enters policy number and personal info manually. |
| **Behind Login** | `/behindlogin` | User arrives pre-authenticated from MyAccount/PolicyView/ClaimsSummary. Policy data pre-populated.   |

Key files:

- [`web/docs/authentication-flow.md`](web/docs/authentication-flow.md) — full flow documentation
- `web/src/containers/Layout/Layout.tsx` — auth orchestration
- `web/src/hooks/useAuthenticatedTokenAndPolicyNumber/` — main auth hook
- `web/src/utils/AccessTokenHelper/AccessTokenHelper.ts` — token routing logic
- `@lib/common-utils/src/helpers/extractBehindLoginOrAnonymousProps.ts` — Lambda-side flow extraction

---

## Deployment

The app is deployed to AWS via CDK pipelines in two regions: **us-west-2** (primary) and **us-east-1** (secondary).

**Stacks:**

| Stack         | Name                                                    |
| ------------- | ------------------------------------------------------- |
| App (Lambdas) | `insurance-claims-auto-efnol-no-auth-app`               |
| API Gateway   | `efnol-auto-no-auth-api-gateway`                        |
| DynamoDB      | Per-environment stacks under `infrastructure/dynamodb/` |

**Environments:** `dev`, `qa`, `uat`, `prod`

Deployments are triggered via GitHub-managed CDK pipeline roles. Version tracking uses SSM parameters under `/service/pipeline/deploy/`.

For DynamoDB setup (including KMS encryption key linking), see [`infrastructure/dynamodb/README.md`](infrastructure/dynamodb/README.md).
