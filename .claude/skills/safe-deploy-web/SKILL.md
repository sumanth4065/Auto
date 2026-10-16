---
name: safe-deploy-web
description: Help a team adopt the safe deploy pipeline pattern. Scans the target repo to infer all values, creates a new standardized safe-deploy pipeline using shared-deploy-web-v3-stack.yml@main (sequential dev→qa→uat→prod), and adds safeDeploy: true to their CloudFront origin entries in web distribution. Use when a team wants to adopt safe deploy or standardize their deploy pipeline.
trigger: when user mentions "safe deploy", "safe-deploy", "adopt safe deploy", "safe deploy pipeline", "standardize deploy pipeline"
arguments: [ticket]
allowed-tools: Bash(git *) Bash(find *) Bash(ls *) Bash(gh *) Bash(grep *) Bash(cat *) Read Write Edit
---

> **GitHub CLI is optional.** This skill uses `gh` to create PRs if available and authenticated, but gracefully falls back to providing ready-to-use `git push` commands and PR body text for manual creation. Never block on `gh` — always complete the file changes and commits regardless.

# Safe Deploy Adoption — $ticket

You are helping a team adopt the safe deploy pipeline pattern. The output is always the same regardless of what their current pipeline looks like:

- A **new** pipeline file using `shared-deploy-web-v3-stack.yml@main`, flowing sequentially dev → qa → uat → prod
- `safeDeploy: true` added to their CloudFront origin entries in the web distribution repo

The old pipeline stays untouched — the new file runs alongside it so the team can validate before cutting over.

---

## Step 0 — Check prerequisites

Check whether the GitHub CLI is available and authenticated:

```bash
gh auth status 2>&1
```

Set a flag based on the result:

- If `gh` is available **and** authenticated → `GH_AVAILABLE=true`
- If `gh` is missing, not authenticated, or returns any error → `GH_AVAILABLE=false`

Do **not** stop or ask the user to fix this. Continue regardless — the skill falls back to manual PR instructions when `GH_AVAILABLE=false`.

---

## Step 1 — Collect inputs

You need:

- **Ticket**: `$ticket` — confirm it looks like a ticket number (e.g. `EN-1234`)
- **Target repo path**: ask the user, or search if they're not sure:
  ```bash
  find ~/workspace -maxdepth 5 -name ".github" -type d 2>/dev/null | sed 's|/.github||' | sort
  ```

---

## Step 2 — Scan the target repo's existing pipeline(s)

```bash
ls <repo>/.github/workflows/
```

Read every YAML that looks like a deploy pipeline (filenames containing `deploy` or `web`). There may be multiple — e.g. split nonprod/prod files, per-env files, or several versioned pipelines. Read them all.

From the pipeline files, extract these values. They may be inline on `with:` blocks, or defined as top-level `env:` variables — resolve either form to actual values:

| Value                               | Notes                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `WORKLOAD`                          | Same across all envs                                                                                                     |
| `ACCOUNT_ID` for dev, qa, uat, prod | One per env — look at each env's deploy job                                                                              |
| `GITHUB_TAG_PREFIX`                 | Used in run-name and Slack messages                                                                                      |
| `ARTIFACT_NAME`                     | The build artifact identifier                                                                                            |
| `ARTIFACT_PATH`                     | Usually `./`                                                                                                             |
| `CLOUDFRONT_PATH` per env           | Check if prod uses a different path than lower envs                                                                      |
| `DISTRIBUTION_ID` per env           | The app's own CloudFront distribution                                                                                    |
| `CLOUDFRONT_WORKLOAD_ID` per env    | The shared central distribution account                                                                                  |
| Slack `ChannelID`                   | From any `SlackNotification*` job                                                                                        |
| Sanity test workflow + inputs       | Look for any `SanityTest*` jobs — note the `uses:` path, all `with:` inputs, and which envs they run for (qa, uat, etc.). For each local `uses: ./.github/workflows/<file>` path found, read that file and check if it has `workflow_call` in its `on:` triggers. |
| LogVersion workflow + inputs        | Look for any `Log*Version` jobs — note the `uses:` path, all `with:` inputs, whether they use a matrix, and which envs they run for (dev, qa, uat, prod) |

If a value is genuinely missing (e.g. no prod deploy exists yet), flag it and ask the user before continuing.

---

## Step 2b — Fix sanity test workflows missing `workflow_call`

For each local sanity test workflow found in Step 2 (i.e. `uses: ./.github/workflows/<file>.yml`), check if it has `workflow_call` in its `on:` block. If it does not, add `workflow_call` with the same inputs as `workflow_dispatch`:

```yaml
on:
  workflow_dispatch:
    inputs:
      APP_ENV:
        ...
  workflow_call:       # <-- add this block, mirroring workflow_dispatch inputs exactly
    inputs:
      APP_ENV:
        ...
```

Copy every input defined under `workflow_dispatch` to `workflow_call` — same names and `required` flags (and `default` values if present). If `workflow_dispatch` uses unsupported `workflow_call` input types (e.g. `choice` or `environment`), use `type: string` in `workflow_call` and document the allowed values in the description. Do not change anything else in the file.
If `workflow_call` is already present, skip this step for that file.

---

## Step 3 — Name the new pipeline file

The new file should be named to signal what it does, not what version it is:

**`<app-slug>-safe-deploy-pipeline.yml`**

Derive `<app-slug>` from `GITHUB_TAG_PREFIX` lowercased and hyphenated (e.g. `QuickSelfServiceWeb` → `quick-self-service-web`), or from the existing pipeline filename if that's cleaner. The name must be distinct from the existing file(s).

---

## Step 4 — Write the new pipeline

The canonical structure is below. Fill in all `<placeholder>` values from what you extracted in Step 2. Do not deviate from this structure — the goal is to standardize all teams onto this exact pattern.

```yaml
name: <App Display Name> Safe Deploy Pipeline
run-name: Deploy <App Display Name> version ${{ inputs.APP_VERSION }} by @${{ github.actor }}

on:
  workflow_dispatch:
    inputs:
      APP_VERSION:
        description: 'Which version of the app?'
        type: string
        required: true
  # [OPTIONAL — only add workflow_call if SanityTest* jobs were found in the existing pipeline]
  # workflow_call:
  #   inputs:
  #     APP_VERSION:
  #       description: 'Which version of the app?'
  #       type: string
  #       required: true

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  id-token: write
  contents: write
  packages: read

# Lower-env approvals come from shared-deploy-web-v3-stack (REQUIRE_SAFEDEPLOY_APPROVAL + GitHub env qa/uat/prod).
jobs:
  #
  # Environment: dev
  #
  DeployDev:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/shared-deploy-web-v3-stack.yml@main
    secrets: inherit
    strategy:
      fail-fast: false
      matrix:
        regions: ['us-east-1', 'us-west-2']
    with:
      WORKLOAD: <workload>
      ACCOUNT_ID: '<dev-account-id>'
      APP_VERSION: ${{ inputs.APP_VERSION }}
      GITHUB_TAG_PREFIX: '<GitHubTagPrefix>'
      AWS_REGION: ${{ matrix.regions }}
      ARTIFACT_NAME: '<artifact-name>'
      DEPLOY_ENV: 'dev'
      CLOUDFRONT_PATH: '<cloudfront-path-dev>'
      ARTIFACT_PATH: '<artifact-path>'
      REQUIRE_SAFEDEPLOY_APPROVAL: false
      DISTRIBUTION_ID: '<dev-distribution-id>'
      CLOUDFRONT_WORKLOAD_ID: '<dev-cloudfront-workload-id>'
      INVALIDATION_PATHS: '[\"/<cloudfront-path-dev>*\"]'
  # [OPTIONAL — LOG VERSION DEV]
  # Only add if a Log*Version job for dev was found in the existing pipeline.
  # LogDevVersion:
  #   uses: <log-version-workflow-path>
  #   secrets: inherit
  #   needs: [DeployDev]
  #   strategy:
  #     fail-fast: false
  #     matrix:
  #       regions: ['us-east-1', 'us-west-2']
  #   with:
  #     <...with: inputs copied exactly from the existing LogDevVersion job...>
  SlackNotificationDev:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/share-slack-notification.yml@main
    needs: [DeployDev]
    secrets: inherit
    if: ${{ always() }}
    with:
      ChannelID: '<slack-channel-id>'
      RequestPipeline: '<App Display Name> Dev Safe Deploy: ${{ inputs.APP_VERSION }}'
      Action: 'Deploy'
      Status: '"${{ needs.DeployDev.result }}" == "failure"'

  #
  # Environment: qa
  #
  DeployQa:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/shared-deploy-web-v3-stack.yml@main
    needs: [DeployDev]
    secrets: inherit
    strategy:
      fail-fast: false
      matrix:
        regions: ['us-east-1', 'us-west-2']
    with:
      WORKLOAD: <workload>
      ACCOUNT_ID: '<qa-account-id>'
      APP_VERSION: ${{ inputs.APP_VERSION }}
      GITHUB_TAG_PREFIX: '<GitHubTagPrefix>'
      AWS_REGION: ${{ matrix.regions }}
      ARTIFACT_NAME: '<artifact-name>'
      DEPLOY_ENV: 'qa'
      CLOUDFRONT_PATH: '<cloudfront-path-qa>'
      ARTIFACT_PATH: '<artifact-path>'
      REQUIRE_SAFEDEPLOY_APPROVAL: true
      DISTRIBUTION_ID: '<qa-distribution-id>'
      CLOUDFRONT_WORKLOAD_ID: '<qa-cloudfront-workload-id>'
      INVALIDATION_PATHS: '[\"/<cloudfront-path-qa>*\"]'
  # [OPTIONAL — SANITY TEST QA]
  # Only add if a SanityTest* job for qa was found in the existing pipeline.
  # Runs IN PARALLEL with DeployQa (both depend on DeployDev) — smoke-tests the
  # currently running QA version before the new version lands.
  # SanityTestQa:
  #   uses: <sanity-test-workflow-path>
  #   secrets: inherit
  #   needs: [DeployDev]
  #   with:
  #     APP_ENV: 'qa'
  #     <...other with: inputs copied exactly from the existing SanityTestQA job...>
  # [OPTIONAL — LOG VERSION QA]
  # Only add if a Log*Version job for qa was found in the existing pipeline.
  # LogQaVersion:
  #   uses: <log-version-workflow-path>
  #   secrets: inherit
  #   needs: [DeployQa]
  #   strategy:
  #     fail-fast: false
  #     matrix:
  #       regions: ['us-east-1', 'us-west-2']
  #   with:
  #     <...with: inputs copied exactly from the existing LogQAVersion job...>
  SlackNotificationQa:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/share-slack-notification.yml@main
    needs: [DeployQa]
    secrets: inherit
    if: ${{ always() && needs.DeployQa.result != 'skipped' }}
    with:
      ChannelID: '<slack-channel-id>'
      RequestPipeline: '<App Display Name> Qa Safe Deploy: ${{ inputs.APP_VERSION }}'
      Action: 'Deploy'
      Status: '"${{ needs.DeployQa.result }}" == "failure"'

  #
  # Environment: uat
  #
  DeployUat:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/shared-deploy-web-v3-stack.yml@main
    needs: [DeployQa]
    secrets: inherit
    strategy:
      fail-fast: false
      matrix:
        regions: ['us-east-1', 'us-west-2']
    with:
      WORKLOAD: <workload>
      ACCOUNT_ID: '<uat-account-id>'
      APP_VERSION: ${{ inputs.APP_VERSION }}
      GITHUB_TAG_PREFIX: '<GitHubTagPrefix>'
      AWS_REGION: ${{ matrix.regions }}
      ARTIFACT_NAME: '<artifact-name>'
      DEPLOY_ENV: 'uat'
      CLOUDFRONT_PATH: '<cloudfront-path-uat>'
      ARTIFACT_PATH: '<artifact-path>'
      REQUIRE_SAFEDEPLOY_APPROVAL: true
      DISTRIBUTION_ID: '<uat-distribution-id>'
      CLOUDFRONT_WORKLOAD_ID: '<uat-cloudfront-workload-id>'
      INVALIDATION_PATHS: '[\"/<cloudfront-path-uat>*\"]'
  # [OPTIONAL — SANITY TEST UAT]
  # Only add if a SanityTest* job for uat was found in the existing pipeline.
  # Runs IN PARALLEL with DeployUat (both depend on DeployQa) — smoke-tests the
  # currently running UAT version before the new version lands.
  # SanityTestUat:
  #   uses: <sanity-test-workflow-path>
  #   secrets: inherit
  #   needs: [DeployQa]
  #   with:
  #     APP_ENV: 'uat'
  #     <...other with: inputs copied exactly from the existing SanityTestUAT job...>
  # [OPTIONAL — LOG VERSION UAT]
  # Only add if a Log*Version job for uat was found in the existing pipeline.
  # LogUatVersion:
  #   uses: <log-version-workflow-path>
  #   secrets: inherit
  #   needs: [DeployUat]
  #   strategy:
  #     fail-fast: false
  #     matrix:
  #       regions: ['us-east-1', 'us-west-2']
  #   with:
  #     <...with: inputs copied exactly from the existing LogUatVersion job...>
  SlackNotificationUat:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/share-slack-notification.yml@main
    needs: [DeployUat]
    secrets: inherit
    if: ${{ always() && needs.DeployUat.result != 'skipped' }}
    with:
      ChannelID: '<slack-channel-id>'
      RequestPipeline: '<App Display Name> Uat Safe Deploy: ${{ inputs.APP_VERSION }}'
      Action: 'Deploy'
      Status: '"${{ needs.DeployUat.result }}" == "failure"'

  #
  # Environment: prod
  #
  # ProdApproval gates prod deployment — without this, DeployProd runs automatically after UAT.
  # Note: `environment: prod` only pauses here if the repo has environment protection rules (e.g., required reviewers) configured for `prod`.
  # If protections are not configured, this job will not block and prod will proceed automatically.
    runs-on: ubuntu-latest
    environment: 'prod'
    needs: DeployUat
    steps:
      - id: step1
        run: echo "Approval Step"
  DeployProd:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/shared-deploy-web-v3-stack.yml@main
    needs: [ProdApproval]
    secrets: inherit
    strategy:
      fail-fast: false
      matrix:
        regions: ['us-east-1', 'us-west-2']
    with:
      WORKLOAD: <workload>
      ACCOUNT_ID: '<prod-account-id>'
      APP_VERSION: ${{ inputs.APP_VERSION }}
      GITHUB_TAG_PREFIX: '<GitHubTagPrefix>'
      AWS_REGION: ${{ matrix.regions }}
      ARTIFACT_NAME: '<artifact-name>'
      DEPLOY_ENV: 'prod'
      CLOUDFRONT_PATH: '<cloudfront-path-prod>'
      ARTIFACT_PATH: '<artifact-path>'
      REQUIRE_SAFEDEPLOY_APPROVAL: true
      DISTRIBUTION_ID: '<prod-distribution-id>'
      CLOUDFRONT_WORKLOAD_ID: '<prod-cloudfront-workload-id>'
      INVALIDATION_PATHS: '[\"/<cloudfront-path-prod>*\"]'
  # [OPTIONAL — LOG VERSION PROD]
  # Only add if a Log*Version job for prod was found in the existing pipeline.
  # Note: if prod deploys sequentially (west then east), add one LogVersion job per region.
  # LogProdVersion:
  #   uses: <log-version-workflow-path>
  #   secrets: inherit
  #   needs: [DeployProd]
  #   strategy:
  #     fail-fast: false
  #     matrix:
  #       regions: ['us-east-1', 'us-west-2']
  #   with:
  #     <...with: inputs copied exactly from the existing LogProd*Version job...>
  SlackNotificationProd:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/share-slack-notification.yml@main
    needs: [DeployProd]
    secrets: inherit
    if: ${{ always() && needs.DeployProd.result != 'skipped' }}
    with:
      ChannelID: '<slack-channel-id>'
      RequestPipeline: '<App Display Name> Prod Safe Deploy: ${{ inputs.APP_VERSION }}'
      Action: 'Deploy'
      Status: '"${{ needs.DeployProd.result }}" == "failure"'
```

Rules:

- `REQUIRE_SAFEDEPLOY_APPROVAL: false` on dev only; `true` on qa, uat, prod
- `ProdApproval` is mandatory — always include it; `DeployProd` must `needs: [ProdApproval]` not `needs: [DeployUat]`
- No environment-selector inputs — one input (`APP_VERSION`), always sequential
- `CLOUDFRONT_PATH` and `INVALIDATION_PATHS` may differ between prod and lower envs — use what you found in the existing pipeline per env

---

## Step 5 — Locate the web distribution repo

```bash
find ~ -maxdepth 6 -type d -name "cloud-ops_aws-common-web-distribution" 2>/dev/null
```

If found, attempt to pull latest:

```bash
cd <web-dist-repo> && git checkout main && git pull 2>&1
```

If `git pull` fails (e.g. auth/SAML error), do **not** stop. Tell the user:

> Could not pull latest on `cloud-ops_aws-common-web-distribution` — you may need to re-authorize SAML SSO for the ACE-Clublabs org. The skill will continue using your local copy. Please run `git pull` manually in that repo before merging the PR.

Then continue with whatever is on disk.

If the repo is not found at all, tell the user to clone it manually:

> The web distribution repo wasn't found locally. Please run:
>
> ```
> git clone git@github.com:ACE-Clublabs/cloud-ops_aws-common-web-distribution.git ~/GHE/cloud-ops_aws-common-web-distribution
> ```
>
> Then re-run this skill.

And stop.

---

## Step 6 — Find and update the app's origin entry

Search using the `CLOUDFRONT_PATH` and `WORKLOAD` values you found:

```bash
grep -rn "<cloudfront-path>\|<workload>" \
  <web-dist-repo>/web-distribution/bin/team-origins/
```

Read the matched file in full. Identify the entry belonging to this app.

### Detect which style the entry uses

**Style A — Flat `accountDetails`** (most common):

```typescript
{
  behaviorPathPattern: 'some/path*',
  s3OriginPath: '/some/path',
  bucketPrefix: 'some-prefix-web-v2',
  accountDetails: AccountIds.someteam
}
```

→ `safeDeploy` is a top-level optional field on this type. Just add `safeDeploy: true` after `accountDetails`:

```typescript
{
  behaviorPathPattern: 'some/path*',
  s3OriginPath: '/some/path',
  bucketPrefix: 'some-prefix-web-v2',
  accountDetails: AccountIds.someteam,
  safeDeploy: true
}
```

Do NOT convert to per-env style — that is unnecessary complexity.

**Style B — Per-env keyed** (less common, already structured with `[EnvironmentValue.X]` keys):

```typescript
{
  [EnvironmentValue.Dev]: { ..., bucketAccountId: AccountIds.x.dev },
  [EnvironmentValue.Qa]:  { ..., bucketAccountId: AccountIds.x.qa },
  ...
}
```

→ Add `safeDeploy: true` after each `bucketAccountId` line that doesn't already have it.

Also update the test snapshot in `web-distribution/test/web-distribution-stack-v3.test.ts` — grep for the same `behaviorPathPattern` or `bucketPrefix`, find the matching block, and apply the same change.

---

## Step 7 — Branch, commit, push, open PRs

### Target repo

Always run the git steps:

```bash
cd <repo>
git checkout -b $ticket/safe-deploy-pipeline
git add .github/workflows/<app-slug>-safe-deploy-pipeline.yml
git commit -m "$ticket add safe deploy pipeline"
git push -u origin $ticket/safe-deploy-pipeline 2>&1
```

If `git push` fails with an auth/SAML error, tell the user:

> Push failed — you may need to re-authorize SAML SSO. Please run:
>
> ```
> git push -u origin $ticket/safe-deploy-pipeline
> ```
>
> in your terminal (type `! git push -u origin $ticket/safe-deploy-pipeline`) then come back.

**If `GH_AVAILABLE=true`**, create the PR:

```bash
gh pr create \
  --title "$ticket Add safe deploy pipeline" \
  --body "$(cat <<'EOF'
## Summary
- Adds \`<app-slug>-safe-deploy-pipeline.yml\` using \`shared-deploy-web-v3-stack.yml@main\`
- Sequential dev → qa → uat → prod; approval is built into the shared workflow for qa/uat/prod
- Old pipeline left in place — cut over once validated

## Dependencies
Merge and validate this pipeline through to prod **before** merging the companion web-distribution PR (`safeDeploy: true`).

## Test plan
- [ ] Trigger manually on dev and confirm it completes
- [ ] Confirm qa/uat/prod stages prompt for safe-deploy approval
EOF
)"
```

**If `GH_AVAILABLE=false`**, output the following for the user to create the PR manually:

> **Target repo PR — create manually on GitHub**
>
> Branch: `$ticket/safe-deploy-pipeline`
> Title: `$ticket Add safe deploy pipeline`
>
> Body:
>
> ```
> ## Summary
> - Adds `<app-slug>-safe-deploy-pipeline.yml` using `shared-deploy-web-v3-stack.yml@main`
> - Sequential dev → qa → uat → prod; approval is built into the shared workflow for qa/uat/prod
> - Old pipeline left in place — cut over once validated
>
> ## Dependencies
> Merge and validate this pipeline through to prod **before** merging the companion web-distribution PR (`safeDeploy: true`).
>
> ## Test plan
> - [ ] Trigger manually on dev and confirm it completes
> - [ ] Confirm qa/uat/prod stages prompt for safe-deploy approval
> ```

---

### Web distribution repo

Always run the git steps:

```bash
cd <web-dist-repo>
git checkout -b $ticket/safedeploy-<app-slug>
git add web-distribution/bin/team-origins/<team-file>.ts
git add web-distribution/test/web-distribution-stack-v3.test.ts
git commit -m "$ticket add safeDeploy flag for <app-slug>"
git push -u origin $ticket/safedeploy-<app-slug> 2>&1
```

If `git push` fails with an auth/SAML error, give the same push-manually instruction as above.

**If `GH_AVAILABLE=true`**, create the PR:

```bash
gh pr create \
  --title "$ticket Add safeDeploy flag for <app-slug>" \
  --body "$(cat <<'EOF'
## Summary
- Adds \`safeDeploy: true\` to the origin entry for \`<app-slug>\` (no style conversion)
- Updates test snapshots

## Dependencies
Validate the safe deploy pipeline through to prod **before** merging this PR.

## Test plan
- [ ] \`yarn test\` passes
EOF
)"
```

**If `GH_AVAILABLE=false`**, output the following for the user to create the PR manually:

> **Web distribution PR — create manually on GitHub**
>
> Branch: `$ticket/safedeploy-<app-slug>`
> Title: `$ticket Add safeDeploy flag for <app-slug>`
>
> Body:
>
> ```
> ## Summary
> - Adds `safeDeploy: true` to the origin entry for `<app-slug>` (no style conversion)
> - Updates test snapshots
>
> ## Dependencies
> Validate the safe deploy pipeline through to prod **before** merging this PR.
>
> ## Test plan
> - [ ] `yarn test` passes
> ```

---

## Step 8 — Report back

- New pipeline filename and path
- PR URL for the target repo (or a reminder to create it manually if `GH_AVAILABLE=false`)
- PR URL for the web distribution repo (or a reminder to create it manually if `GH_AVAILABLE=false`)
- Which team-origins file was changed and which style was used (flat `accountDetails` or per-env keyed)
- Whether sanity test jobs were found and included (and for which envs), and whether `workflow_call` was added to any sanity test workflow files
- Whether LogVersion jobs were found and included (and for which envs)
- Any values that need the team to verify
- If `git pull` on the web distribution repo was skipped due to auth, remind the user to pull before merging
- **Critical ordering reminder:**
  1. Merge and run the new safe deploy pipeline PR first — validate it all the way through to **prod**
  2. Only after the new pipeline is confirmed working in prod, merge and deploy the web-distribution PR (`safeDeploy: true`)

  Reversing this order risks a prod issue: setting `safeDeploy: true` in the distribution before the pipeline is live means CloudFront expects safe deploy behaviour that isn't there yet.
