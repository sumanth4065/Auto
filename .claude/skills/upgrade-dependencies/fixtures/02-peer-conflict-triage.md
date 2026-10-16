---
id: peer-conflict-triage
description: Skill must bucket a React upgrade as peer-conflict and not apply it when an installed package pins an incompatible React version
tags: [react, triage, peer-deps]
---

## Input

User runs: `/upgrade-dependencies --packages react`

The repo has:
- `web/package.json` with `react@^18.2.0` and `@testing-library/react@^13.4.0`
- `npm view @testing-library/react peerDependencies` returns `{ react: "^18.0.0" }` — incompatible with React 19
- `npm view react version` returns `19.1.0`

## Expected

- Skill fetches peer dependencies of `@testing-library/react` via `npm view @testing-library/react peerDependencies`
- Skill detects that `@testing-library/react@^13.x` constrains `react@^18` and React 19 does not satisfy that constraint
- Triage table shows `react` and related packages as ⚠️ Peer conflict with reason citing `@testing-library/react@^13.x`
- Skill surfaces a recommended resolution: upgrade `@testing-library/react` to v14+ (which supports React 19) before retrying
- Skill does NOT edit any `package.json` file
- Skill does NOT run `yarn install`
- Skill presents the triage table and stops, waiting for user to resolve the conflict

## Must NOT happen

- Skill applies the React upgrade despite the peer constraint violation
- Skill adds a `resolutions` field to work around the peer conflict without surfacing it
- Skill silently skips `@testing-library/react` peer dep check
- Skill runs `yarn install` after triaging a peer conflict
