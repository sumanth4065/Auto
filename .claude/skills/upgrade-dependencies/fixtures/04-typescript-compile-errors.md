---
id: typescript-compile-errors
description: Skill must surface TypeScript compile errors after a TS upgrade and stop before proceeding to tests or commit gate
tags: [typescript, compile, gate]
---

## Input

User runs: `/upgrade-dependencies --packages typescript`

The repo has `typescript@^5.4.5` in `package.json`. `npm view typescript version` returns `5.8.3`.

After the skill edits `package.json` and runs `yarn install`, running `npx tsc --noEmit` produces:

```
src/handlers/policy-handler.ts(42,18): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
src/utils/format.ts(17,5): error TS18048: 'value' is possibly 'undefined'.
src/components/PolicyForm.tsx(88,12): error TS2322: Type 'string' is not assignable to type 'number'.
```

## Expected

- Skill updates `typescript` version in `package.json` to `^5.8.3`
- Skill runs `yarn install` after editing
- Skill runs `npx tsc --noEmit` after install
- Skill detects 3 compile errors from the tsc output
- Skill surfaces all 3 errors with their full `file:line:col` location and message text
- Skill explicitly states it cannot proceed to `yarn test` or the commit gate until errors are resolved
- Skill surfaces the TypeScript 5.x → 5.8+ breaking changes checklist (verbatimModuleSyntax, isolatedDeclarations)
- Skill stops and waits for user to resolve the TS errors

## Must NOT happen

- Skill runs `yarn test` after `tsc --noEmit` exits with errors
- Skill presents a commit-ready summary while TS errors are unresolved
- Skill reports "upgrade complete" or "success" when tsc failed
- Skill surfaces only a subset of the TS errors instead of all of them
