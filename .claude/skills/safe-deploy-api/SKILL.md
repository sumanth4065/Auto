---
name: safe-deploy-api
description: Help a team adopt the safe deploy pipeline pattern for a public API (Lambda + API Gateway CDK app). Pre-req: shared and region-specific API Gateway custom domain names (workload gateways) must already exist in AWS for all envs — one shared + two region-specific per env (12 total). Scans the target repo to infer all values, creates a new app-safedeploy-pipeline.yml using shared-safe-deploy-app-stack.yml@main (sequential dev→qa→uat→prod), adds X-Ace-Api-Target-Region to CORS in app-stack.ts and appSetParams.js, and adds DomainNameRegion + DomainNameAliasTargetRegion parameters for region-specific routing. Use when a team wants to adopt safe deploy for their API stack.
trigger: when user mentions "safe deploy api", "safe-deploy-api", "adopt safe deploy api", "safe deploy pipeline app", "safe deploy for api", "safe deploy public api"
arguments: [ticket]
allowed-tools: Bash(git *) Bash(find *) Bash(ls *) Bash(gh *) Bash(grep *) Bash(cat *) Bash(aws *) Bash(node *) Read Write Edit
---

> **GitHub CLI is optional.** This skill uses `gh` to create PRs if available and authenticated, but gracefully falls back to providing ready-to-use `git push` commands and PR body text for manual creation. Never block on `gh` — always complete the file changes and commits regardless.

# Safe Deploy API Adoption — $ticket

---

## Before you begin — AWS login reminder

This skill fetches API Gateway custom domain targets from AWS — both shared (`<app-host>.common.api.<env>.clublabs.net`) and region-specific (`<app-host>.common.api.us-west-2.<env>.clublabs.net`, `<app-host>.common.api.us-east-1.<env>.clublabs.net`) — for all four environments. You need credentials for each workload account.

First, find the profile names for this repo:

```bash
grep -A1 '^\[profile' ~/.aws/config | grep -B1 'ebiz-cloud-devops' | grep '^\[profile' | sed 's/\[profile //' | sed 's/\]//' | sort
```

Then check which profiles are currently valid:

```bash
for profile in dev-<workload>-ebiz-cloud-devops qa-<workload>-ebiz-cloud-devops uat-<workload>-ebiz-cloud-devops prod-<workload>-ebiz-cloud-devops; do
  echo -n "${profile}: "
  aws sts get-caller-identity --profile "${profile}" --query "Account" --output text 2>&1 || true
done
```

For any environment that shows an error, tell the user:

> **Action required**: Run `gimme-aws-creds` in your terminal to refresh credentials, then resume.
>
> ```
> ! gimme-aws-creds
> ```
>
> If you only need a specific env, you can scope it:
> ```
> ! gimme-aws-creds --profile {env}-{workload}-ebiz-cloud-devops
> ```

**Do not block on missing credentials** — continue with `TBD` placeholders for any env you cannot reach, and note them clearly in the final report.

---

You are helping a team adopt the safe deploy pipeline pattern for their **API stack** (Lambda + API Gateway via CDK). This is the API counterpart to `safe-deploy-web`.

The output is always:

1. A **new** `app-safedeploy-pipeline.yml` using `shared-safe-deploy-app-stack.yml@main`, flowing dev → qa → uat → prod
2. `X-Ace-Api-Target-Region` added to CORS allowed headers in `app-stack.ts`
3. `X-Ace-Api-Target-Region` added to CORS header strings in `appSetParams.js` (or equivalent params script)
4. `DomainNameRegion` + `DomainNameAliasTargetRegion` parameters added to `appSetParams.js` and `app-stack.ts`

The old pipeline stays untouched — the new file runs alongside it so the team can validate before cutting over.

---

## Step 0 — Check prerequisites

Check whether the GitHub CLI is available and authenticated:

```bash
gh auth status 2>&1
```

Set a flag:
- If `gh` is available **and** authenticated → `GH_AVAILABLE=true`
- Otherwise → `GH_AVAILABLE=false`

Do **not** stop. Continue regardless — fall back to manual PR instructions when `GH_AVAILABLE=false`.

---

## Step 1 — Collect inputs

You need:

- **Ticket**: `$ticket` — confirm it looks like a ticket number (e.g. `ENBL-1234`)
- **Target repo path**: ask the user, or search if not sure:
  ```bash
  find ~/GHE -maxdepth 2 -name ".github" -type d 2>/dev/null | sed 's|/.github||' | sort
  ```

---

## Step 2 — Scan the target repo's existing pipeline(s)

```bash
ls <repo>/.github/workflows/
```

Read every YAML that looks like an app deploy pipeline (filenames containing `deploy` or `app`). Read them all.

From the pipeline files, extract:

| Value | Notes |
|---|---|
| `WORKLOAD` | e.g. `insurance-policy-info` |
| `APP_COMPONENT_NAME` | e.g. `insurance-billing-summary-app` |
| `APP_STACK_NAME` | e.g. `insurance-policy-info-insurance-billing-summary-app-stack` — look for `APP_STACK_NAME` env var or infer from pattern `{workload}-{app-name}-app-stack` |
| `GITHUB_TAG_PREFIX` | e.g. `InsuranceBillingSummaryApp` |
| `TAG_PREFIX` | Same as `GITHUB_TAG_PREFIX` |
| `APP_NAME` | e.g. `billing-summary` |
| `TEAM_NAME` | e.g. `insurance-self-service` |
| `ACCOUNT_ID` per env (dev/qa/uat/prod) | From each env's deploy job `WORKLOAD_ACCOUNT_ID` |
| `SLACK_CHANNEL_ID` | From any `SlackNotification*` job `ChannelID` |
| Script file | `appSetParams.js` or `setAppParamsByEnvV2.js` — note which one |
| Sanity test workflow + inputs | Any `SanityTest*` jobs — note `uses:`, `with:` inputs, which envs |
| LogVersion workflow + inputs | Any `Log*Version` jobs — note `uses:`, `with:` inputs, which envs |

If `APP_STACK_NAME` is not in the pipeline, infer it: `{workload}-{app-name}-app-stack`.

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

## Step 3 — Identify the CDK app to modify

Find which CDK apps contain an `app-stack.ts` — this is the only signal that matters. CDK apps for DynamoDB, config, and pipelines never contain `app-stack.ts` and are ignored automatically.

```bash
find <repo>/infrastructure -name "app-stack.ts" | sort
```

**If exactly one `app-stack.ts` is found** → use that CDK app automatically. Tell the user:

> Auto-selected CDK app: `infrastructure/<cdk-app>/` (only app-stack.ts found there)

**If multiple `app-stack.ts` files are found** → list only those directories and prompt:

```
Found app-stack.ts in multiple CDK apps:
  1. infrastructure/cdk-app/lib/app-stack.ts
  2. infrastructure/other-app/lib/app-stack.ts

Which one is your API Gateway app-stack? Enter the number (default: 1):
```

Wait for the user's answer before continuing. Use the selected CDK app directory for all subsequent file edits.

---

## Step 3b — Verify base path mapping matches safe-deploy CloudFront convention

Safe-deploy CloudFront routes traffic via the path pattern:

```
/{team-name}-{app-name}/{app-name}/...
```

Where:
- `{team-name}-{app-name}` is the full custom domain hostname prefix (e.g. `insurance-self-service-billing-summary`, `ers-chatbot-aar`, `enterprise-partner-integrations`)
- `{app-name}` is the `APP_NAME` value from the pipeline (e.g. `billing-summary`, `aar`, `partner-integrations`)

Every team names things differently — `{app-name}` is NOT always derivable by splitting the domain on hyphens. Always use the `APP_NAME` extracted in Step 2 as the authoritative source.

**Check the registered base path:**

Use the CDK app directory selected in Step 3. Search all `*.ts` files under that directory — `BASE_PATH` may be defined in `bin/app.ts`, `lib/app-stack.ts`, or a config file, depending on the repo:

```bash
grep -r "BASE_PATH[[:space:]]*=" <repo>/<cdk-app-dir>/
```

If no result, also check for an inline `basePath:` prop passed directly to the CDK stack:

```bash
grep -r "basePath[[:space:]]*:" <repo>/<cdk-app-dir>/
```

Also check how `basePath` is passed to the CDK stack (usually `basePath: BASE_PATH` in the stack props).

**Compare `BASE_PATH` against `APP_NAME` from Step 2:**

| Value | Example |
|---|---|
| Registered `BASE_PATH` | `billingsummary` |
| `APP_NAME` (from pipeline) | `billing-summary` |

**If they differ**, add two additional `BasePathMapping` constructs in `app-stack.ts` — one for the shared domain and one for the region-specific domain — using the hyphenated name. Keep the original mappings intact; do **not** remove them (existing callers may still use the old path).

Add immediately after the existing `BasePathMappingRegion` block:

```typescript
// Safe-deploy CloudFront routes traffic via path /{team-appname}/{app-name}/...
// where {app-name} uses hyphens. These additional mappings register the hyphenated
// alias on both domains so safe-deploy routing works alongside the existing paths.
new BasePathMapping(this, 'BasePathMappingAppName', {
  domainName: domain,
  restApi: this.apiGateway.restApi,
  basePath: '{app-name}',   // e.g. 'billing-summary'
  stage: this.apiGateway.restApi.deploymentStage
});
new BasePathMapping(this, 'BasePathMappingRegionAppName', {
  domainName: domainRegion,
  restApi: this.apiGateway.restApi,
  basePath: '{app-name}',   // e.g. 'billing-summary'
  stage: this.apiGateway.restApi.deploymentStage
});
```

The two constructs above register the hyphenated alias on both domain types the app uses:
1. Shared domain (`insurance-self-service-{app}.common.api.{env}.clublabs.net`) — covered by `BasePathMappingAppName` using `domain`
2. Region-specific domain (`insurance-self-service-{app}.common.api.{region}.{env}.clublabs.net`) — covered by `BasePathMappingRegionAppName` using `domainRegion`

The `domainRegion` variable in `app-stack.ts` already covers both region-specific domains (Oregon and Virginia) because it is parameterized per deployment — one CDK deploy per region uses the appropriate domain name from `appSetParams.js`.

**If they match** (base path already uses hyphens matching `{app-name}`), skip this step.

---

## Step 4 — Scan the params script

Read the params script (identified in Step 2, typically `.github/scripts/appSetParams.js`).

Extract:
- The `CORS_ALLOWED_HEADERS` constant (or equivalent) — both `NON_PROD` and `PROD` values
- The existing `DomainName` pattern per env (e.g. `insurance-self-service-billing-summary.common.api.{env}.clublabs.net`)
- Whether `DomainNameRegion` and `DomainNameAliasTargetRegion` already exist — if so, skip adding them
- Whether `X-Ace-Api-Target-Region` already exists in the CORS headers — if so, skip that change

Derive the `DomainNameRegion` pattern from the existing `DomainName` values in the script. Each `DomainName` follows the pattern `<host>.common.api.<env>.clublabs.net`. Insert the region between `api` and `<env>`:
- Oregon: `<host>.common.api.us-west-2.<env>.clublabs.net`
- Virginia: `<host>.common.api.us-east-1.<env>.clublabs.net`

For example, if the existing DEV `DomainName` is `insurance-self-service-billing-summary.common.api.dev.clublabs.net`, the region-specific versions are:
- Oregon: `insurance-self-service-billing-summary.common.api.us-west-2.dev.clublabs.net`
- Virginia: `insurance-self-service-billing-summary.common.api.us-east-1.dev.clublabs.net`

---

## Step 5 — Look up domain target values from AWS

You need to fetch `regionalDomainName` values for two types of custom domains per env:
- **Shared** (no region in hostname): `<app-host>.common.api.<env>.clublabs.net`
- **Region-specific**: `<app-host>.common.api.us-west-2.<env>.clublabs.net` and `<app-host>.common.api.us-east-1.<env>.clublabs.net`

Where `<app-host>` is the hostname prefix from the existing `DomainName` in the params script (e.g. `insurance-self-service-claims-view`).

Use `aws apigateway get-domain-name` with the exact FQDN — one call per domain:

```bash
# Shared domain — query both regions since the custom domain may be registered in either
aws apigateway get-domain-name \
  --profile <env>-<workload>-ebiz-cloud-devops \
  --region us-west-2 \
  --domain-name "<app-host>.common.api.<env>.clublabs.net" \
  --query "{domain:domainName,target:regionalDomainName}" \
  --output table 2>&1

# Region-specific: Oregon
aws apigateway get-domain-name \
  --profile <env>-<workload>-ebiz-cloud-devops \
  --region us-west-2 \
  --domain-name "<app-host>.common.api.us-west-2.<env>.clublabs.net" \
  --query "{domain:domainName,target:regionalDomainName}" \
  --output table 2>&1

# Region-specific: Virginia
aws apigateway get-domain-name \
  --profile <env>-<workload>-ebiz-cloud-devops \
  --region us-east-1 \
  --domain-name "<app-host>.common.api.us-east-1.<env>.clublabs.net" \
  --query "{domain:domainName,target:regionalDomainName}" \
  --output table 2>&1
```

Run the above for each env (dev, qa, uat, prod). If the shared domain call returns a `NotFoundException`, try `--region us-east-1` instead. For any env/region where credentials are unavailable (returns an auth error), use `TBD` and remind the user to run `! gimme-aws-creds`.

Collect all values into two tables:

**Shared domain targets (DomainNameAliasTarget):**

| Env | DomainName | DomainNameAliasTarget |
|-----|------------|-----------------------|
| dev | `<app-host>.common.api.dev.clublabs.net` | `d-xxxxxxxx.execute-api.<region>.amazonaws.com` |
| qa | ... | ... |
| uat | ... | ... |
| prod | ... | ... |

**Region-specific domain targets (DomainNameAliasTargetRegion):**

| Env | Region | DomainNameRegion | DomainNameAliasTargetRegion |
|-----|--------|-------------------|-----------------------------|
| dev | us-west-2 | `<app-host>.common.api.us-west-2.dev.clublabs.net` | `d-xxxxxxxx.execute-api.us-west-2.amazonaws.com` |
| dev | us-east-1 | `<app-host>.common.api.us-east-1.dev.clublabs.net` | `d-xxxxxxxx.execute-api.us-east-1.amazonaws.com` |
| qa | us-west-2 | ... | ... |
| qa | us-east-1 | ... | ... |
| uat | us-west-2 | ... | ... |
| uat | us-east-1 | ... | ... |
| prod | us-west-2 | ... | ... |
| prod | us-east-1 | ... | ... |

Show both tables to the user and ask them to confirm or fill in any `TBD` values before writing files.

---

## Step 6 — Edit `app-stack.ts` — CORS header

Read the CDK app-stack file identified in Step 3:

```bash
cat <repo>/infrastructure/<cdk-app>/lib/app-stack.ts
```

Find the `ALLOWED_HEADERS` array in the `addGatewayEndpoint()` method (or equivalent CORS configuration). It will look like:

```typescript
const ALLOWED_HEADERS = [
  'Authorization', 'Content-Type', 'X-Amz-Date', 'X-Api-Key',
  'X-Amz-Security-Token', 'X-Ace-Test-Region',
  'x-request-id'
];
```

Add `'X-Ace-Api-Target-Region'` after `'X-Ace-Test-Region'` (or after the last existing header if `X-Ace-Test-Region` is not present):

```typescript
const ALLOWED_HEADERS = [
  'Authorization', 'Content-Type', 'X-Amz-Date', 'X-Api-Key',
  'X-Amz-Security-Token', 'X-Ace-Test-Region',
  'X-Ace-Api-Target-Region',
  'x-request-id'
];
```

If `X-Ace-Api-Target-Region` is already present, skip this change and tell the user.

---

## Step 7 — Edit `app-stack.ts` — Region-specific domain parameters

In the same `app-stack.ts`, find where `CfnParameter` entries are defined for `DomainName`, `DomainNameAliasTarget`, and `DomainNameAliasHostedZoneId`. They typically look like:

```typescript
const domainName = new CfnParameter(this, 'DomainName', { type: 'String' });
const domainNameAliasTarget = new CfnParameter(this, 'DomainNameAliasTarget', { type: 'String' });
const domainNameAliasHostedZoneId = new CfnParameter(this, 'DomainNameAliasHostedZoneId', { type: 'String' });
```

Add two new `CfnParameter` entries immediately after those:

```typescript
const domainNameRegion = new CfnParameter(this, 'DomainNameRegion', { type: 'String' });
const domainNameAliasTargetRegion = new CfnParameter(this, 'DomainNameAliasTargetRegion', { type: 'String' });
```

Then find the `DomainName.fromDomainNameAttributes` call and the `BasePathMapping` that uses it. It typically looks like:

```typescript
const domain = DomainName.fromDomainNameAttributes(this, 'ApiDomain', {
  domainName: domainName.valueAsString,
  domainNameAliasHostedZoneId: domainNameAliasHostedZoneId.valueAsString,
  domainNameAliasTarget: domainNameAliasTarget.valueAsString,
});

new BasePathMapping(this, 'BasePathMapping', {
  domainName: domain,
  restApi: api,
  basePath: '',
});
```

Add a second domain + mapping immediately after, using the region parameters:

```typescript
const domainRegion = DomainName.fromDomainNameAttributes(this, 'ApiDomainRegion', {
  domainName: domainNameRegion.valueAsString,
  domainNameAliasHostedZoneId: domainNameAliasHostedZoneId.valueAsString,
  domainNameAliasTarget: domainNameAliasTargetRegion.valueAsString,
});

new BasePathMapping(this, 'BasePathMappingRegion', {
  domainName: domainRegion,
  restApi: api,
  basePath: '',
});
```

Note: the exact variable names (`api`, `domain`, etc.) must match what's already in the file — read the file first to confirm the exact names used.

If `DomainNameRegion` `CfnParameter` already exists, skip this step and tell the user.

---

## Step 8 — CDK snapshot test (only if snapshots already exist)

Check whether the CDK app already has a snapshot test and an existing snapshot file. CDK test files most commonly live in `test/`, but some repos put them under `bin/` — check both:

```bash
find <repo>/infrastructure/<cdk-app>/test -name "*.test.ts" 2>/dev/null
find <repo>/infrastructure/<cdk-app>/bin -name "*.test.ts" 2>/dev/null
find <repo>/infrastructure/<cdk-app>/test/__snapshots__ -name "*.snap" 2>/dev/null
find <repo>/infrastructure/<cdk-app>/bin/__snapshots__ -name "*.snap" 2>/dev/null
```

**If no test or snapshot file is found in either location — skip this step entirely.** Tell the user:

> No CDK snapshot test found — skipping Step 8.

**Only if both a test file and a snapshot exist** — update the snapshot to capture the new `DomainNameRegion`, `DomainNameAliasTargetRegion` CFN parameters and the `BasePathMappingRegion` resource added in Steps 6–7.

Find the test command:

```bash
grep -E '"test' <repo>/infrastructure/<cdk-app>/package.json 2>/dev/null
```

Then run with the update flag:

```bash
cd <repo>/infrastructure/<cdk-app>
npx vitest run --update 2>&1
# OR if jest:
npx jest --updateSnapshot 2>&1
```

Confirm the snapshot file was updated (in whichever `__snapshots__/` directory it was found), and add it to the commit in Step 12.

---

## Step 9 — Extend CORS handler unit tests

Find the CORS handler lambda test file:

```bash
find <repo>/lambdas -name "index.test.ts" | xargs grep -l "CorsHandler\|cors-handler\|ALLOWED_HEADERS" 2>/dev/null
```

Read that test file and the corresponding `index.ts` to understand the existing test structure. The CORS handler typically reads `process.env.ALLOWED_HEADERS` and appends it to the `Access-Control-Allow-Headers` response header.

Add two new test cases that verify `X-Ace-Api-Target-Region` is included in the response for both the non-prod and prod header strings. Insert them inside the existing `describe` block, **after** the existing test cases:

```typescript
it('should include X-Ace-Api-Target-Region in allowed headers for non-prod', async () => {
  process.env.ALLOWED_HEADERS =
    'X-Ace-Test-Region,X-Ace-Mock,X-Ace-Test-Scenario,X-Request-Id,X-Ace-Session-Id,X-Ace-Correlation-Id,X-Ace-Team-Id,Accept,X-Ace-Client-Application,X-Ace-Api-Target-Region';
  const result = await app({ ...event });
  expect(result.headers['Access-Control-Allow-Headers']).toContain(
    'X-Ace-Api-Target-Region'
  );
});

it('should include X-Ace-Api-Target-Region in allowed headers for prod', async () => {
  process.env.ALLOWED_HEADERS =
    'X-Request-Id,X-Ace-Session-Id,X-Ace-Correlation-Id,X-Ace-Team-Id,Accept,X-Ace-Client-Application,X-Ace-Api-Target-Region';
  const result = await app({ ...event });
  expect(result.headers['Access-Control-Allow-Headers']).toContain(
    'X-Ace-Api-Target-Region'
  );
});
```

Use the exact `ALLOWED_HEADERS` strings from `appSetParams.js` `CORS_ALLOWED_HEADERS.NON_PROD` and `CORS_ALLOWED_HEADERS.PROD` — copy them verbatim so the test reflects the real deployed values.

Run the tests to confirm they pass before committing:

```bash
cd <repo>
yarn test-<cors-lambda-name> 2>&1
# e.g. yarn test-billing-summary-cors-handler-v2
```

If the test command isn't obvious, check `package.json` for the test script pattern, or run:

```bash
grep -r "cors-handler\|cors_handler" <repo>/package.json <repo>/**/package.json 2>/dev/null | grep '"test'
```

---

## Step 10 — Edit `appSetParams.js` — Region domain constants and parameters

### 10a — Add shared and region domain target constants

In the `constants` object (or top-level constants), add 12 new entries — 4 shared domain targets and 8 region-specific API GW domain targets — collected in Step 5:

```javascript
// Domain Name API Gateway Custom Domain in both regions for Safe Deploy
DEV_OREGON_REGION_DOMAIN_NAME_TARGET: 'd-xxxxxxxx.execute-api.us-west-2.amazonaws.com',
DEV_VIRGINIA_REGION_DOMAIN_NAME_TARGET: 'd-xxxxxxxx.execute-api.us-east-1.amazonaws.com',
QA_OREGON_REGION_DOMAIN_NAME_TARGET: 'd-xxxxxxxx.execute-api.us-west-2.amazonaws.com',
QA_VIRGINIA_REGION_DOMAIN_NAME_TARGET: 'd-xxxxxxxx.execute-api.us-east-1.amazonaws.com',
UAT_OREGON_REGION_DOMAIN_NAME_TARGET: 'd-xxxxxxxx.execute-api.us-west-2.amazonaws.com',
UAT_VIRGINIA_REGION_DOMAIN_NAME_TARGET: 'd-xxxxxxxx.execute-api.us-east-1.amazonaws.com',
PROD_OREGON_REGION_DOMAIN_NAME_TARGET: 'd-xxxxxxxx.execute-api.us-west-2.amazonaws.com',
PROD_VIRGINIA_REGION_DOMAIN_NAME_TARGET: 'd-xxxxxxxx.execute-api.us-east-1.amazonaws.com',
```

Place them immediately after the existing `PROD_VIRGINIA_DOMAIN_NAME_TARGET` constant.

### 10b — Add DomainNameRegion and DomainNameAliasTargetRegion to each parameter block

For each of the 8 regional parameter blocks (DEV_PARAMETERS_OREGON, DEV_PARAMETERS_VIRGINIA, QA_PARAMETERS_OREGON, etc.), add two new properties:

```javascript
const DEV_PARAMETERS_OREGON = JSON.stringify({
  ...DEV_COMMON_PARAMETERS,
  ApiGatewayID: constants.AWS_IDS.DEV.GATEWAY_OREGON_ID,
  DynamoDbEncryptionKeyCUST: ...,
  DomainNameAliasTarget: constants.DEV_OREGON_DOMAIN_NAME_TARGET,
  DomainNameAliasHostedZoneId: constants.DEV_OREGON_DOMAIN_NAME_HOSTED_ZONE_ID,
  DomainNameRegion: 'insurance-self-service-{app-name}.common.api.us-west-2.dev.clublabs.net',           // <-- add
  DomainNameAliasTargetRegion: constants.DEV_OREGON_REGION_DOMAIN_NAME_TARGET                            // <-- add
})
```

Apply the same pattern to all 8 blocks. Use the domain name pattern derived in Step 4 (replacing `{app-name}` with the actual app slug from the existing `DomainName` value).

---

## Step 11 — Write the new pipeline file

Create `.github/workflows/app-safedeploy-pipeline.yml` in the target repo.

The canonical structure (fill all `<placeholder>` values from Step 2):

```yaml
name: App SafeDeploy Pipeline
on:
  workflow_dispatch:
    inputs:
      APP_VERSION:
        description: Which version of the app?
        type: string
        required: true
  workflow_call:
    inputs:
      APP_VERSION:
        description: Which version of the app?
        type: string
        required: true
run-name: 'App Safe Deploy <TAG_PREFIX>-${{ inputs.APP_VERSION }}'  # Replace <TAG_PREFIX> with the literal value from Step 2 (e.g. InsuranceBillingSummaryApp)
env:
  DEV_WORKLOAD_ACCOUNT_ID: '<dev-account-id>'
  QA_WORKLOAD_ACCOUNT_ID: '<qa-account-id>'
  UAT_WORKLOAD_ACCOUNT_ID: '<uat-account-id>'
  PROD_WORKLOAD_ACCOUNT_ID: '<prod-account-id>'
  SLACK_CHANNEL_ID: <slack-channel-id>
  TAG_PREFIX: <TAG_PREFIX>
  WORKLOAD: <workload>
  APP_COMPONENT_NAME: <app-component-name>
  APP_STACK_NAME: <app-stack-name>
  AWS_REGION_OREGON: us-west-2
  AWS_REGION_VIRGINIA: us-east-1
  TEAM_NAME: <team-name>
  APP_NAME: <app-name>
permissions:
  id-token: write
  contents: write
  packages: read
jobs:
  SetEnvVariables:
    runs-on:
      - ubuntu-latest
    steps:
      - name: Set up Node.js
        uses: actions/setup-node@v6
        with:
          node-version: '24'
      - name: Checkout repository
        uses: actions/checkout@v6
      - name: Set params
        run: node ./.github/scripts/<params-script>
        env:
          BUILD_VERSION: '${{inputs.APP_VERSION}}'
      - name: 'Set accountid, Parameters'
        id: parameters
        run: |
          echo 'DEV_PARAMETERS_OREGON=${{env.DEV_PARAMETERS_OREGON}}' >> $GITHUB_OUTPUT
          echo 'DEV_PARAMETERS_VIRGINIA=${{env.DEV_PARAMETERS_VIRGINIA}}' >> $GITHUB_OUTPUT
          echo 'DEV_WORKLOAD_ACCOUNT_ID=${{env.DEV_WORKLOAD_ACCOUNT_ID}}' >> $GITHUB_OUTPUT
          echo 'QA_PARAMETERS_OREGON=${{env.QA_PARAMETERS_OREGON}}' >> $GITHUB_OUTPUT
          echo 'QA_PARAMETERS_VIRGINIA=${{env.QA_PARAMETERS_VIRGINIA}}' >> $GITHUB_OUTPUT
          echo 'QA_WORKLOAD_ACCOUNT_ID=${{env.QA_WORKLOAD_ACCOUNT_ID}}' >> $GITHUB_OUTPUT
          echo 'UAT_PARAMETERS_OREGON=${{env.UAT_PARAMETERS_OREGON}}' >> $GITHUB_OUTPUT
          echo 'UAT_PARAMETERS_VIRGINIA=${{env.UAT_PARAMETERS_VIRGINIA}}' >> $GITHUB_OUTPUT
          echo 'UAT_WORKLOAD_ACCOUNT_ID=${{env.UAT_WORKLOAD_ACCOUNT_ID}}' >> $GITHUB_OUTPUT
          echo 'PROD_PARAMETERS_OREGON=${{env.PROD_PARAMETERS_OREGON}}' >> $GITHUB_OUTPUT
          echo 'PROD_PARAMETERS_VIRGINIA=${{env.PROD_PARAMETERS_VIRGINIA}}' >> $GITHUB_OUTPUT
          echo 'PROD_WORKLOAD_ACCOUNT_ID=${{env.PROD_WORKLOAD_ACCOUNT_ID}}' >> $GITHUB_OUTPUT
          echo 'TAG_PREFIX=${{env.TAG_PREFIX}}' >> $GITHUB_OUTPUT
          echo 'WORKLOAD=${{env.WORKLOAD}}' >> $GITHUB_OUTPUT
          echo 'SLACK_CHANNEL_ID=${{env.SLACK_CHANNEL_ID}}' >> $GITHUB_OUTPUT
          echo 'APP_COMPONENT_NAME=${{env.APP_COMPONENT_NAME}}' >> $GITHUB_OUTPUT
          echo 'APP_STACK_NAME=${{env.APP_STACK_NAME}}' >> $GITHUB_OUTPUT
          echo 'AWS_REGION_OREGON=${{env.AWS_REGION_OREGON}}' >> $GITHUB_OUTPUT
          echo 'AWS_REGION_VIRGINIA=${{env.AWS_REGION_VIRGINIA}}' >> $GITHUB_OUTPUT
          echo 'TEAM_NAME=${{env.TEAM_NAME}}' >> $GITHUB_OUTPUT
          echo 'APP_NAME=${{env.APP_NAME}}' >> $GITHUB_OUTPUT
    outputs:
      DevParametersOregon: '${{ steps.parameters.outputs.DEV_PARAMETERS_OREGON }}'
      DevParametersVirginia: '${{ steps.parameters.outputs.DEV_PARAMETERS_VIRGINIA }}'
      DevAccountId: '${{ steps.parameters.outputs.DEV_WORKLOAD_ACCOUNT_ID }}'
      QaParametersOregon: '${{ steps.parameters.outputs.QA_PARAMETERS_OREGON }}'
      QaParametersVirginia: '${{ steps.parameters.outputs.QA_PARAMETERS_VIRGINIA }}'
      QaAccountId: '${{ steps.parameters.outputs.QA_WORKLOAD_ACCOUNT_ID }}'
      UatParametersOregon: '${{ steps.parameters.outputs.UAT_PARAMETERS_OREGON }}'
      UatParametersVirginia: '${{ steps.parameters.outputs.UAT_PARAMETERS_VIRGINIA }}'
      UatAccountId: '${{ steps.parameters.outputs.UAT_WORKLOAD_ACCOUNT_ID }}'
      ProdParametersOregon: '${{ steps.parameters.outputs.PROD_PARAMETERS_OREGON }}'
      ProdParametersVirginia: '${{ steps.parameters.outputs.PROD_PARAMETERS_VIRGINIA }}'
      ProdAccountId: '${{ steps.parameters.outputs.PROD_WORKLOAD_ACCOUNT_ID }}'
      TagPrefix: '${{ steps.parameters.outputs.TAG_PREFIX }}'
      Workload: '${{ steps.parameters.outputs.WORKLOAD }}'
      SlackChannelId: '${{ steps.parameters.outputs.SLACK_CHANNEL_ID }}'
      AppComponentName: '${{ steps.parameters.outputs.APP_COMPONENT_NAME }}'
      StackName: '${{ steps.parameters.outputs.APP_STACK_NAME }}'
      AWSRegionOregon: '${{ steps.parameters.outputs.AWS_REGION_OREGON }}'
      AWSRegionVirginia: '${{ steps.parameters.outputs.AWS_REGION_VIRGINIA }}'
      TeamName: '${{ steps.parameters.outputs.TEAM_NAME }}'
      AppName: '${{ steps.parameters.outputs.APP_NAME }}'

  DeployDev:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/shared-safe-deploy-app-stack.yml@main
    needs: SetEnvVariables
    secrets: inherit
    with:
      ACCOUNT_ID: '${{ needs.SetEnvVariables.outputs.DevAccountId }}'
      APP_COMPONENT_NAME: '${{ needs.SetEnvVariables.outputs.AppComponentName }}'
      APP_VERSION: '${{ inputs.APP_VERSION }}'
      DEPLOY_ENV: dev
      GITHUB_TAG_PREFIX: '${{ needs.SetEnvVariables.outputs.TagPrefix }}'
      PARAMETERS_EAST: '${{ needs.SetEnvVariables.outputs.DevParametersVirginia }}'
      PARAMETERS_WEST: '${{ needs.SetEnvVariables.outputs.DevParametersOregon }}'
      WORKLOAD: '${{ needs.SetEnvVariables.outputs.Workload }}'
      APP_STACK_NAME: '${{ needs.SetEnvVariables.outputs.StackName }}'
      ENABLE_SAFEDEPLOY: false
      TEAM_NAME: '${{ needs.SetEnvVariables.outputs.TeamName }}'
      APP_NAME: '${{ needs.SetEnvVariables.outputs.AppName }}'
  # [OPTIONAL — LOG DEV VERSION]
  # Only add if Log*Version jobs were found in the existing pipeline (Step 2).
  # LogDevOregonVersion:
  #   needs: [SetEnvVariables, DeployDev]
  #   uses: ace-clublabs/insurance-self-service_dev-scripts/.github/workflows/get-deployed-app-version.yml@main
  #   secrets: inherit
  #   with:
  #     WORKLOAD: '${{ needs.SetEnvVariables.outputs.Workload }}'
  #     APP_COMPONENT_NAME: '${{ needs.SetEnvVariables.outputs.AppComponentName }}'
  #     WORKLOAD_ACCOUNT_ID: '${{ needs.SetEnvVariables.outputs.DevAccountId }}'
  #     AWS_REGION: '${{ needs.SetEnvVariables.outputs.AWSRegionOregon }}'
  #     GITHUB_TAG_PREFIX: '${{ needs.SetEnvVariables.outputs.TagPrefix }}'
  #     DEPLOY_ENV: dev
  #     APP_TYPE: app
  # LogDevVirginiaVersion:
  #   needs: [SetEnvVariables, DeployDev]
  #   uses: ace-clublabs/insurance-self-service_dev-scripts/.github/workflows/get-deployed-app-version.yml@main
  #   secrets: inherit
  #   with:
  #     WORKLOAD: '${{ needs.SetEnvVariables.outputs.Workload }}'
  #     APP_COMPONENT_NAME: '${{ needs.SetEnvVariables.outputs.AppComponentName }}'
  #     WORKLOAD_ACCOUNT_ID: '${{ needs.SetEnvVariables.outputs.DevAccountId }}'
  #     AWS_REGION: '${{ needs.SetEnvVariables.outputs.AWSRegionVirginia }}'
  #     GITHUB_TAG_PREFIX: '${{ needs.SetEnvVariables.outputs.TagPrefix }}'
  #     DEPLOY_ENV: dev
  #     APP_TYPE: app
  SlackNotificationDev:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/share-slack-notification.yml@main
    if: ${{ always() }}
    needs: [SetEnvVariables, DeployDev]
    secrets: inherit
    with:
      ChannelID: '${{ needs.SetEnvVariables.outputs.SlackChannelId }}'
      RequestPipeline: 'App Safe Deploy Pipeline for ${{ needs.SetEnvVariables.outputs.TagPrefix }}-${{ inputs.APP_VERSION }} in DEV environment'
      Status: '"${{ needs.DeployDev.result }}" == "failure"'

  QaApproval:
    runs-on: ubuntu-latest
    environment: qa
    needs: [SetEnvVariables, DeployDev]
    steps:
      - id: step1
        run: |
          echo "Approval Step"
  DeployQa:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/shared-safe-deploy-app-stack.yml@main
    needs: [SetEnvVariables, QaApproval]
    secrets: inherit
    with:
      ACCOUNT_ID: '${{ needs.SetEnvVariables.outputs.QaAccountId }}'
      APP_COMPONENT_NAME: '${{ needs.SetEnvVariables.outputs.AppComponentName }}'
      APP_VERSION: '${{ inputs.APP_VERSION }}'
      DEPLOY_ENV: qa
      GITHUB_TAG_PREFIX: '${{ needs.SetEnvVariables.outputs.TagPrefix }}'
      PARAMETERS_EAST: '${{ needs.SetEnvVariables.outputs.QaParametersVirginia }}'
      PARAMETERS_WEST: '${{ needs.SetEnvVariables.outputs.QaParametersOregon }}'
      WORKLOAD: '${{ needs.SetEnvVariables.outputs.Workload }}'
      APP_STACK_NAME: '${{ needs.SetEnvVariables.outputs.StackName }}'
      ENABLE_SAFEDEPLOY: false
      TEAM_NAME: '${{ needs.SetEnvVariables.outputs.TeamName }}'
      APP_NAME: '${{ needs.SetEnvVariables.outputs.AppName }}'
  # [OPTIONAL — LOG QA VERSION]
  # Only add if Log*Version jobs were found in the existing pipeline (Step 2).
  # LogQaOregonVersion:
  #   needs: [SetEnvVariables, DeployQa]
  #   uses: ace-clublabs/insurance-self-service_dev-scripts/.github/workflows/get-deployed-app-version.yml@main
  #   secrets: inherit
  #   with:
  #     WORKLOAD: '${{ needs.SetEnvVariables.outputs.Workload }}'
  #     APP_COMPONENT_NAME: '${{ needs.SetEnvVariables.outputs.AppComponentName }}'
  #     WORKLOAD_ACCOUNT_ID: '${{ needs.SetEnvVariables.outputs.QaAccountId }}'
  #     AWS_REGION: '${{ needs.SetEnvVariables.outputs.AWSRegionOregon }}'
  #     GITHUB_TAG_PREFIX: '${{ needs.SetEnvVariables.outputs.TagPrefix }}'
  #     DEPLOY_ENV: qa
  #     APP_TYPE: app
  # LogQaVirginiaVersion:
  #   needs: [SetEnvVariables, DeployQa]
  #   uses: ace-clublabs/insurance-self-service_dev-scripts/.github/workflows/get-deployed-app-version.yml@main
  #   secrets: inherit
  #   with:
  #     WORKLOAD: '${{ needs.SetEnvVariables.outputs.Workload }}'
  #     APP_COMPONENT_NAME: '${{ needs.SetEnvVariables.outputs.AppComponentName }}'
  #     WORKLOAD_ACCOUNT_ID: '${{ needs.SetEnvVariables.outputs.QaAccountId }}'
  #     AWS_REGION: '${{ needs.SetEnvVariables.outputs.AWSRegionVirginia }}'
  #     GITHUB_TAG_PREFIX: '${{ needs.SetEnvVariables.outputs.TagPrefix }}'
  #     DEPLOY_ENV: qa
  #     APP_TYPE: app
  SlackNotificationQa:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/share-slack-notification.yml@main
    if: ${{ always() && needs.DeployQa.result != 'skipped' }}
    needs: [SetEnvVariables, DeployQa]
    secrets: inherit
    with:
      ChannelID: '${{ needs.SetEnvVariables.outputs.SlackChannelId }}'
      RequestPipeline: 'App Safe Deploy Pipeline for ${{ needs.SetEnvVariables.outputs.TagPrefix }}-${{ inputs.APP_VERSION }} in QA environment'
      Status: '"${{ needs.DeployQa.result }}" == "failure"'

  UatApproval:
    runs-on: ubuntu-latest
    environment: uat
    needs: [SetEnvVariables, DeployQa]
    steps:
      - id: step1
        run: |
          echo "Approval Step"
  DeployUat:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/shared-safe-deploy-app-stack.yml@main
    needs: [SetEnvVariables, UatApproval]
    secrets: inherit
    with:
      ACCOUNT_ID: '${{ needs.SetEnvVariables.outputs.UatAccountId }}'
      APP_COMPONENT_NAME: '${{ needs.SetEnvVariables.outputs.AppComponentName }}'
      APP_VERSION: '${{ inputs.APP_VERSION }}'
      DEPLOY_ENV: uat
      GITHUB_TAG_PREFIX: '${{ needs.SetEnvVariables.outputs.TagPrefix }}'
      PARAMETERS_EAST: '${{ needs.SetEnvVariables.outputs.UatParametersVirginia }}'
      PARAMETERS_WEST: '${{ needs.SetEnvVariables.outputs.UatParametersOregon }}'
      WORKLOAD: '${{ needs.SetEnvVariables.outputs.Workload }}'
      APP_STACK_NAME: '${{ needs.SetEnvVariables.outputs.StackName }}'
      ENABLE_SAFEDEPLOY: true
      TEAM_NAME: '${{ needs.SetEnvVariables.outputs.TeamName }}'
      APP_NAME: '${{ needs.SetEnvVariables.outputs.AppName }}'
  # [OPTIONAL — LOG UAT VERSION]
  # Only add if Log*Version jobs were found in the existing pipeline (Step 2).
  # LogUatOregonVersion:
  #   needs: [SetEnvVariables, DeployUat]
  #   uses: ace-clublabs/insurance-self-service_dev-scripts/.github/workflows/get-deployed-app-version.yml@main
  #   secrets: inherit
  #   with:
  #     WORKLOAD: '${{ needs.SetEnvVariables.outputs.Workload }}'
  #     APP_COMPONENT_NAME: '${{ needs.SetEnvVariables.outputs.AppComponentName }}'
  #     WORKLOAD_ACCOUNT_ID: '${{ needs.SetEnvVariables.outputs.UatAccountId }}'
  #     AWS_REGION: '${{ needs.SetEnvVariables.outputs.AWSRegionOregon }}'
  #     GITHUB_TAG_PREFIX: '${{ needs.SetEnvVariables.outputs.TagPrefix }}'
  #     DEPLOY_ENV: uat
  #     APP_TYPE: app
  # LogUatVirginiaVersion:
  #   needs: [SetEnvVariables, DeployUat]
  #   uses: ace-clublabs/insurance-self-service_dev-scripts/.github/workflows/get-deployed-app-version.yml@main
  #   secrets: inherit
  #   with:
  #     WORKLOAD: '${{ needs.SetEnvVariables.outputs.Workload }}'
  #     APP_COMPONENT_NAME: '${{ needs.SetEnvVariables.outputs.AppComponentName }}'
  #     WORKLOAD_ACCOUNT_ID: '${{ needs.SetEnvVariables.outputs.UatAccountId }}'
  #     AWS_REGION: '${{ needs.SetEnvVariables.outputs.AWSRegionVirginia }}'
  #     GITHUB_TAG_PREFIX: '${{ needs.SetEnvVariables.outputs.TagPrefix }}'
  #     DEPLOY_ENV: uat
  #     APP_TYPE: app
  SlackNotificationUat:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/share-slack-notification.yml@main
    if: ${{ always() && needs.DeployUat.result != 'skipped' }}
    needs: [SetEnvVariables, DeployUat]
    secrets: inherit
    with:
      ChannelID: '${{ needs.SetEnvVariables.outputs.SlackChannelId }}'
      RequestPipeline: 'App Safe Deploy Pipeline for ${{ needs.SetEnvVariables.outputs.TagPrefix }}-${{ inputs.APP_VERSION }} in UAT environment'
      Status: '"${{ needs.DeployUat.result }}" == "failure"'
  # [OPTIONAL — SANITY TEST QA]
  # Only add if a SanityTest* job for qa was found in the existing pipeline.
  # SanityTestQA:
  #   uses: ./.github/workflows/<sanity-test-workflow>
  #   secrets: inherit
  #   needs: [DeployQa]
  #   with:
  #     APP_ENV: 'qa'
  #     <...other with: inputs copied exactly from the existing SanityTestQA job...>
  # [OPTIONAL — SANITY TEST UAT]
  # Only add if a SanityTest* job for uat was found in the existing pipeline.
  # SanityTestUAT:
  #   uses: ./.github/workflows/<sanity-test-workflow>
  #   secrets: inherit
  #   needs: [DeployUat]
  #   with:
  #     APP_ENV: 'uat'
  #     <...other with: inputs copied exactly from the existing SanityTestUAT job...>

  ProdApproval:
    runs-on: ubuntu-latest
    environment: prod
    needs: [SetEnvVariables, DeployUat]
    steps:
      - id: step1
        run: |
          echo "Approval Step"
  DeployProd:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/shared-safe-deploy-app-stack.yml@main
    needs: [SetEnvVariables, ProdApproval]
    secrets: inherit
    with:
      ACCOUNT_ID: '${{ needs.SetEnvVariables.outputs.ProdAccountId }}'
      APP_COMPONENT_NAME: '${{ needs.SetEnvVariables.outputs.AppComponentName }}'
      APP_VERSION: '${{ inputs.APP_VERSION }}'
      DEPLOY_ENV: prod
      GITHUB_TAG_PREFIX: '${{ needs.SetEnvVariables.outputs.TagPrefix }}'
      PARAMETERS_EAST: '${{ needs.SetEnvVariables.outputs.ProdParametersVirginia }}'
      PARAMETERS_WEST: '${{ needs.SetEnvVariables.outputs.ProdParametersOregon }}'
      WORKLOAD: '${{ needs.SetEnvVariables.outputs.Workload }}'
      APP_STACK_NAME: '${{ needs.SetEnvVariables.outputs.StackName }}'
      ENABLE_SAFEDEPLOY: true
      TEAM_NAME: '${{ needs.SetEnvVariables.outputs.TeamName }}'
      APP_NAME: '${{ needs.SetEnvVariables.outputs.AppName }}'
  # [OPTIONAL — LOG PROD VERSION]
  # Only add if Log*Version jobs were found in the existing pipeline (Step 2).
  # LogProdOregonVersion:
  #   needs: [SetEnvVariables, DeployProd]
  #   uses: ace-clublabs/insurance-self-service_dev-scripts/.github/workflows/get-deployed-app-version.yml@main
  #   secrets: inherit
  #   with:
  #     WORKLOAD: '${{ needs.SetEnvVariables.outputs.Workload }}'
  #     APP_COMPONENT_NAME: '${{ needs.SetEnvVariables.outputs.AppComponentName }}'
  #     WORKLOAD_ACCOUNT_ID: '${{ needs.SetEnvVariables.outputs.ProdAccountId }}'
  #     AWS_REGION: '${{ needs.SetEnvVariables.outputs.AWSRegionOregon }}'
  #     GITHUB_TAG_PREFIX: '${{ needs.SetEnvVariables.outputs.TagPrefix }}'
  #     DEPLOY_ENV: prod
  #     APP_TYPE: app
  # LogProdVirginiaVersion:
  #   needs: [SetEnvVariables, DeployProd]
  #   uses: ace-clublabs/insurance-self-service_dev-scripts/.github/workflows/get-deployed-app-version.yml@main
  #   secrets: inherit
  #   with:
  #     WORKLOAD: '${{ needs.SetEnvVariables.outputs.Workload }}'
  #     APP_COMPONENT_NAME: '${{ needs.SetEnvVariables.outputs.AppComponentName }}'
  #     WORKLOAD_ACCOUNT_ID: '${{ needs.SetEnvVariables.outputs.ProdAccountId }}'
  #     AWS_REGION: '${{ needs.SetEnvVariables.outputs.AWSRegionVirginia }}'
  #     GITHUB_TAG_PREFIX: '${{ needs.SetEnvVariables.outputs.TagPrefix }}'
  #     DEPLOY_ENV: prod
  #     APP_TYPE: app
  SlackNotificationProd:
    uses: ace-clublabs/cloud-ops_shared-workflows/.github/workflows/share-slack-notification.yml@main
    if: ${{ always() && needs.DeployProd.result != 'skipped' }}
    needs: [SetEnvVariables, DeployDev, DeployQa, DeployUat, DeployProd]
    secrets: inherit
    with:
      ChannelID: '${{ needs.SetEnvVariables.outputs.SlackChannelId }}'
      RequestPipeline: 'App Safe Deploy Pipeline for ${{ needs.SetEnvVariables.outputs.TagPrefix }}-${{ inputs.APP_VERSION }} in PROD environment'
      Status: '"${{ needs.DeployProd.result }}" == "failure"'
```

Rules:
- `ENABLE_SAFEDEPLOY: false` on dev and qa; `ENABLE_SAFEDEPLOY: true` on uat and prod
- `ProdApproval` is mandatory — `DeployProd` must `needs: [SetEnvVariables, ProdApproval]`
- `PROD_ROLLBACK` input is **not** included — safe deploy handles rollback via `ENABLE_SAFEDEPLOY`
- `SanityTestUAT` is optional — only include if found in the existing pipeline
- `Log*Version` jobs are optional — **only include them if they are present in the existing pipeline** (captured in Step 2). If the original pipeline has none, skip them entirely. If not present but the user asks whether to add them, offer it as an option — it is not required.
- The `SetEnvVariables` job must output `TeamName` and `AppName` (these are required by `shared-safe-deploy-app-stack.yml` but absent from the old `iss-shared-deploy-stack-app.yml`)

---

## Step 12 — Branch, commit, push, open PR

Always run the git steps:

```bash
cd <repo>
git checkout -b $ticket/safe-deploy-api-pipeline
git add .github/workflows/app-safedeploy-pipeline.yml
git add .github/scripts/<params-script>
git add infrastructure/<cdk-app>/lib/app-stack.ts
# If Step 2b modified any sanity test workflow files, add them:
git add .github/workflows/<sanity-test-workflow>.yml 2>/dev/null || true
# If Step 8 updated a CDK snapshot, add it:
git add infrastructure/<cdk-app>/bin/__snapshots__/*.snap 2>/dev/null || true
git add infrastructure/<cdk-app>/test/__snapshots__/*.snap 2>/dev/null || true
git commit -m "$ticket add safe deploy API pipeline and CORS/domain config"
git push -u origin $ticket/safe-deploy-api-pipeline 2>&1
```

If `git push` fails with auth/SAML error, tell the user:

> Push failed — you may need to re-authorize SAML SSO. Please run:
>
> ```
> git push -u origin $ticket/safe-deploy-api-pipeline
> ```
>
> in your terminal (`! git push -u origin $ticket/safe-deploy-api-pipeline`) then come back.

**If `GH_AVAILABLE=true`**, create the PR:

```bash
gh pr create \
  --title "$ticket Add safe deploy API pipeline" \
  --body "$(cat <<'EOF'
## Summary
- Adds \`app-safedeploy-pipeline.yml\` using \`shared-safe-deploy-app-stack.yml@main\`
- Sequential dev → qa → uat → prod with \`ENABLE_SAFEDEPLOY: false\` on dev/qa and \`ENABLE_SAFEDEPLOY: true\` on uat/prod
- Adds \`X-Ace-Api-Target-Region\` to CORS allowed headers in \`app-stack.ts\` and \`appSetParams.js\`
- Adds \`DomainNameRegion\` + \`DomainNameAliasTargetRegion\` CFN parameters and \`BasePathMappingRegion\` to \`app-stack.ts\`
- Adds region-specific domain constants and parameters to \`appSetParams.js\`
- Old pipeline left in place — cut over once validated

## Test plan
- [ ] Trigger \`app-safedeploy-pipeline.yml\` manually on dev and confirm it completes
- [ ] Confirm qa/uat/prod stages wait for safe-deploy approval
- [ ] Verify \`X-Ace-Api-Target-Region\` header routes to correct region in both us-east-1 and us-west-2
- [ ] Check CloudWatch logs for session IDs in both regions
EOF
)"
```

**If `GH_AVAILABLE=false`**, output the following for the user:

> **PR — create manually on GitHub**
>
> Branch: `$ticket/safe-deploy-api-pipeline`
> Title: `$ticket Add safe deploy API pipeline`
>
> Body:
> ```
> ## Summary
> - Adds `app-safedeploy-pipeline.yml` using `shared-safe-deploy-app-stack.yml@main`
> - Sequential dev → qa → uat → prod with `ENABLE_SAFEDEPLOY: false` on dev/qa and `ENABLE_SAFEDEPLOY: true` on uat/prod
> - Adds `X-Ace-Api-Target-Region` to CORS allowed headers in `app-stack.ts` and `appSetParams.js`
> - Adds `DomainNameRegion` + `DomainNameAliasTargetRegion` CFN parameters and `BasePathMappingRegion` to `app-stack.ts`
> - Adds region-specific domain constants and parameters to `appSetParams.js`
> - Old pipeline left in place — cut over once validated
>
> ## Test plan
> - [ ] Trigger `app-safedeploy-pipeline.yml` manually on dev and confirm it completes
> - [ ] Confirm qa/uat/prod stages wait for safe-deploy approval
> - [ ] Verify `X-Ace-Api-Target-Region` header routes to correct region in both us-east-1 and us-west-2
> - [ ] Check CloudWatch logs for session IDs in both regions
> ```

## Step 13 — Report back

Summarise everything that was done:

- New pipeline filename and path
- Files changed: `app-stack.ts`, `appSetParams.js`, new `app-safedeploy-pipeline.yml`
- Whether a sanity test workflow was found, and whether `workflow_call` was added (Step 2b)
- CDK app selected (auto-detected or user-chosen)
- Whether base path alias mappings were added (Step 3b) — if so, what `BASE_PATH` vs `APP_NAME` were
- The 8 region domain target values used — flag any that are `TBD` and need AWS lookup
- Whether `X-Ace-Api-Target-Region` was already present (skipped) or newly added
- Whether the CORS handler unit tests were updated (Step 9) and whether they passed
- Whether `DomainNameRegion` was already present (skipped) or newly added
- PR URL (or reminder to create manually if `GH_AVAILABLE=false`)
- Any values the team still needs to fill in (e.g. TBD domain targets for envs without credentials)

**Critical ordering reminder:**
1. Get the region-specific API GW custom domain names created in AWS for each env (if not already present) — the `DomainNameRegion` DNS entries must exist before the CDK stack deploy
2. If `BASE_PATH` ≠ `APP_NAME` (Step 3b), deploy the CDK stack change first so both base path mappings exist before running the safe-deploy pipeline
3. Deploy the new `app-safedeploy-pipeline.yml` through dev → qa → uat → prod
4. Validate `X-Ace-Api-Target-Region` routing in each env using curl + CloudWatch log evidence (see Step 14)
5. Only after validation, decommission the old `deploy-pipeline-app.yml`

---

## Step 14 — Engineering Acceptance: Validating safe deploy promotion

When `ENABLE_SAFEDEPLOY: true` (UAT and prod), the pipeline deploys east (`us-east-1`) first and holds west (`us-west-2`) until safe-deploy approval is granted. This means:

- **East** → new version running
- **West** → still on previous version
- **UI / default traffic** → goes to west (no `X-Ace-Api-Target-Region` header = west = old version). **The UI will appear to be on the old version — this is expected** while safe deploy is holding west.

### Which path to use for API testing

| Path | Works? | Notes |
|---|---|---|
| `/billingsummary/...` | Yes, both regions | Legacy path — always works, not CloudFront-routed |
| `/billing-summary/...` | Yes for east after CDK deploy | Safe-deploy CloudFront path — use this for acceptance testing |

Always use the **`billing-summary` path** (with hyphen) when validating safe-deploy routing. This is the path CloudFront uses when routing via `X-Ace-Api-Target-Region`. If you test with the legacy `billingsummary` path, the result may not reflect whether safe-deploy routing is actually working.

### Acceptance test sequence for east

```bash
# 1. Call flow-director on east — obtain policyGuid
curl -s -X POST "https://common.api.{env}.ace.aaa.com/insurance-self-service-billing-summary/billing-summary/flow-director" \
  -H "Authorization: Bearer <token>" \
  -H "X-Ace-Api-Target-Region: us-east-1" \
  -H "X-Ace-Session-Id: accept-east-001" \
  -d '{"policyNumber":"<policyNumber>","clubCode":"<clubCode>"}'

# 2. (Optional) Call downstream lambdas with X-Ace-Api-Target-Region: us-east-1
#    Note: get-billing-summary, get-config etc. are private VPC endpoints — callable only
#    from within the VPC. Test these via the UI once east is validated via flow-director.
```

### Confirm region routing in CloudWatch

After each call, search logs in **both** regions for the `X-Ace-Session-Id` value:

```bash
# East logs
aws logs filter-log-events \
  --log-group-name "/aws/lambda/billing-summary-flow-director-v2" \
  --filter-pattern "accept-east-001" \
  --region us-east-1 \
  --profile {env}-insurancepolicyinfo-ebiz-cloud-devops \
  --start-time <epoch-ms-10min-ago> --end-time <epoch-ms-now> \
  --output json

# West logs (should be empty for this session id)
aws logs filter-log-events \
  --log-group-name "/aws/lambda/billing-summary-flow-director-v2" \
  --filter-pattern "accept-east-001" \
  --region us-west-2 \
  --profile {env}-insurancepolicyinfo-ebiz-cloud-devops \
  --start-time <epoch-ms-10min-ago> --end-time <epoch-ms-now> \
  --output json
```

**Pass criteria:**
- Session ID appears in east logs, with `ace:region` = `us-east-1`
- Session ID does **not** appear in west logs
- No 5xx errors in east logs

### Promoting west

Once east is validated, approve the safe-deploy promotion in the pipeline to deploy west. After west deploys:
- Re-run the same acceptance test with `X-Ace-Api-Target-Region: us-west-2`
- Confirm the session ID appears in west logs and not east
- Check the UI loads correctly (default traffic = west = new version)

### East-only deployment — what to expect

| Test | Expected result |
|---|---|
| `billing-summary` path + `X-Ace-Api-Target-Region: us-east-1` | 200 — east is on new version |
| `billing-summary` path + `X-Ace-Api-Target-Region: us-west-2` | May 403 — west CDK may not be promoted yet |
| `billingsummary` path + `X-Ace-Api-Target-Region: us-west-2` | May 403 for same reason |
| UI (no header = west) | Old version or down — expected until west is promoted |

> **Do not treat west 403 as a bug during east-only safe deploy.** It means west has not yet been promoted. Only investigate west failures *after* the pipeline has promoted west.
