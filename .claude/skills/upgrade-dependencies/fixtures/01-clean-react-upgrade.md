---
id: clean-react-upgrade
description: Skill must upgrade react, react-dom, @types/react, and @types/react-dom together when no peer conflicts exist
tags: [react, fix, triage]
---

## Input

User runs: `/upgrade-dependencies --packages react`

The repo has one package with React declared:
- `web/package.json` has `react@^18.2.0`, `react-dom@^18.2.0`, `@types/react@^18.3.0`, `@types/react-dom@^18.3.0` in devDependencies
- No `@ace-clublabs/*` packages declare a React peer constraint
- `@testing-library/react` is at v14, which supports React 19

`npm view react version` returns `19.1.0`.

## Expected

- Skill runs `find . -name "package.json" ...` to discover all package.json files
- Skill fetches latest versions via `npm view react version`, `npm view react-dom version`, `npm view @types/react version`, `npm view @types/react-dom version`
- Skill checks peer deps of `@testing-library/react` before triaging
- Skill triage table shows `react`, `react-dom`, `@types/react`, `@types/react-dom` all as ✅ Clean upgrade
- Skill updates all four packages in `web/package.json` to `^19.x.x` versions
- Skill runs `yarn install` once after all edits are complete
- Skill runs `npx tsc --noEmit` after install
- Skill runs `yarn test` after tsc passes
- Skill surfaces the React 18 → 19 breaking changes checklist (forwardRef removal, Context.Provider, useFormState → useActionState, react-dom/test-utils removal)

## Must NOT happen

- Skill upgrades `react` without also upgrading `react-dom`, `@types/react`, and `@types/react-dom` in the same batch
- Skill runs `yarn install` more than once
- Skill skips the peer dep analysis for `@testing-library/react`
- Skill omits the React 18 → 19 breaking changes checklist from the final report
- Skill presents a commit-ready summary before `yarn test` passes
