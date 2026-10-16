---
id: node-lambda-cdk-upgrade
description: Skill must update Lambda CDK runtime constructs, GHA node-version, .nvmrc, and engines field when upgrading Node
tags: [node, lambda, cdk, gha]
---

## Input

User runs: `/upgrade-dependencies --packages node`

The repo has:
- `.nvmrc` containing `18`
- `package.json` with `"engines": { "node": ">=18" }`
- `app/stacks/api-stack.ts` with `runtime: lambda.Runtime.NODEJS_18_X`
- `app/stacks/worker-stack.ts` with `runtime: lambda.Runtime.NODEJS_18_X`
- `.github/workflows/ci.yml` with `node-version: '18'`
- `.github/workflows/deploy.yml` with `node-version: '18'`
- No Dockerfiles in the repo

Target Node version is 24 (latest LTS).

## Expected

- Skill runs `grep -rln "Runtime\.NODEJS_"` to find Lambda CDK files and identifies `api-stack.ts` and `worker-stack.ts`
- Skill runs `grep -rln "node-version:"` in `.github/workflows/` and identifies `ci.yml` and `deploy.yml`
- Skill updates `.nvmrc` from `18` to `24`
- Skill updates `package.json` `engines.node` from `>=18` to `>=24`
- Skill updates `Runtime.NODEJS_18_X` to `Runtime.NODEJS_24_X` in both `api-stack.ts` and `worker-stack.ts`
- Skill updates `node-version: '18'` to `node-version: '24'` in both `ci.yml` and `deploy.yml`
- Skill runs `grep -rn "Runtime\.NODEJS_" ... | grep -v "NODEJS_24_X"` after editing to verify no old runtime strings remain
- Skill surfaces the Node 18 → 24 breaking changes checklist (require(esm), URLPattern, Lambda bootstrap note)

## Must NOT happen

- Skill updates `.nvmrc` but skips Lambda CDK runtime files
- Skill updates Lambda CDK runtime files but skips GHA `node-version` entries
- Skill skips the post-edit grep verification for stale runtime strings
- Skill edits only the first occurrence of `NODEJS_18_X` and misses subsequent ones
