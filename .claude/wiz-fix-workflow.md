# Wiz Fix Workflow

Fetches open Wiz security issues for the specified ClubLabs project, triages each finding by fix type, and resolves them — primarily by triggering GitHub Actions deployments for Lambda patching SLA violations, and by applying code/config changes for IAM, network, and secret issues.

## Project Argument

The first positional argument is required and must be one of the known ClubLabs projects:

| Argument value | Wiz project name       |
| -------------- | ---------------------- |
| `iss`          | ClubLabs - ISS         |
| `olb`          | ClubLabs - OLB         |
| `travel`       | ClubLabs - Travel      |
| `cloudops`     | ClubLabs - CloudOps    |
| `payments`     | ClubLabs - Payments    |
| `membership`   | ClubLabs - Membership  |
| `chatbot`      | ClubLabs - ACE-Chatbot |
| `automotive`   | ClubLabs - Automotive  |
| `mlai`         | ClubLabs - MLAI        |
| `enterprise`   | ClubLabs - Enterprise  |
| `website`      | ClubLabs - Website     |
| `mobile`       | ClubLabs - Mobile      |

Argument matching is case-insensitive. If the argument is omitted or unrecognised, print the list above and stop.

Example invocations (these are documentation only — not live commands):

```text
/wiz-fix iss
/wiz-fix iss --scan-only
/wiz-fix payments --severity critical
/wiz-fix olb --type lambda
```

The resolved project name (e.g. `ClubLabs - ISS`) is referred to as `$PROJECT` in all steps below.

## Prerequisites Check

Before proceeding, verify the required tooling:

```bash
# Check Wiz CLI (used for SSO token extraction)
which wizcli || echo "wizcli not found — brew install wizcli  OR  download from Wiz portal → Deployments"

# Check gh CLI (required for triggering GHA deployments)
which gh || echo "gh not found — brew install gh"
gh auth status || echo "Run: gh auth login"

# Check jq (required for JSON parsing)
which jq || echo "jq not found — brew install jq"
```

### Authentication

`wizcli` is a **local scanner** — it cannot fetch portal issues directly. However, once authenticated via SSO it holds a bearer token that can be extracted and used to call the Wiz GraphQL API.

**The workflow (one manual step, then fully automated):**

**Step 1 — Manual (once per session): authenticate via browser SSO**

```bash
wizcli auth --use-device-code
```

Follow the URL printed in the terminal, log in via org SSO. Takes ~30 seconds.

**Step 2 — Automated: extract the token and API URL**

> **Note:** `wizcli auth --print-token` does NOT output a clean JWT — the banner prints to stdout (not stderr), making it impossible to isolate the token via shell redirection. Read `~/.wiz/auth.json` directly instead:

```bash
WIZ_TOKEN=$(python3 -c "import json; print(json.load(open('$HOME/.wiz/auth.json'))['access_token'])")
```

The API URL is determined by the `data_center` field in `~/.wiz/auth.json` — do not use the hardcoded `us1` default or you will silently get no results:

```bash
WIZ_DC=$(python3 -c "import json; print(json.load(open('$HOME/.wiz/auth.json'))['data_center'])")
WIZ_API_URL="https://api.${WIZ_DC}.app.wiz.io/graphql"
# e.g. data_center=us43 → https://api.us43.app.wiz.io/graphql
```

If `WIZ_TOKEN` is empty (session expired or auth.json missing), stop and prompt the user to re-run `wizcli auth --use-device-code`.

## Workflow

### 1. Fetch Issues

#### Via wizcli SSO token + Wiz GraphQL API (preferred)

Extract the SSO token and query the API:

> **Known API quirks (verified 2026-05-28):**
>
> - The `project` filter in a typed GraphQL variable (`$filter: IssueFilters`) fails with `"invalid type for variable: 'filter'"`. Use inline enum syntax instead and filter by project in Python post-fetch.
> - Fetch all HIGH+CRITICAL issues across the tenant, then filter to `$PROJECT` by checking `issue.projects[].name`. This is more reliable and avoids the project filter bug entirely.
> - Paginate using `after:` cursor until `pageInfo.hasNextPage` is false — ISS alone has ~9,500 issues across 19 pages of 500.

```python
# Recommended: paginate all issues in Python, filter to $PROJECT post-fetch
import json, subprocess

TOKEN = subprocess.check_output(
    ['python3', '-c', "import json; print(json.load(open('$HOME/.wiz/auth.json'))['access_token'])"],
    text=True
).strip()

DC = subprocess.check_output(
    ['python3', '-c', "import json; print(json.load(open('$HOME/.wiz/auth.json'))['data_center'])"],
    text=True
).strip()

API_URL = f"https://api.{DC}.app.wiz.io/graphql"
all_nodes = []
cursor = None

while True:
    after_clause = f', after: "{cursor}"' if cursor else ""
    query = f'''{{
      issues(filterBy: {{ status: [OPEN, IN_PROGRESS], severity: [HIGH, CRITICAL] }}, first: 500{after_clause}) {{
        nodes {{
          id status severity
          entity {{ name type }}
          cloudAccounts {{ name externalId }}
          projects {{ name }}
          control {{ name }}
          createdAt
        }}
        pageInfo {{ hasNextPage endCursor }}
      }}
    }}'''
    result = subprocess.run(
        ['curl', '-s', '-X', 'POST', API_URL,
         '-H', f'Authorization: Bearer {TOKEN}',
         '-H', 'Content-Type: application/json',
         '-d', json.dumps({"query": query})],
        capture_output=True, text=True
    )
    data = json.loads(result.stdout)
    nodes = data['data']['issues']['nodes']
    page_info = data['data']['issues']['pageInfo']
    all_nodes.extend(nodes)
    if not page_info['hasNextPage']:
        break
    cursor = page_info['endCursor']

# Filter to target project
project_issues = [i for i in all_nodes if any(p['name'] == '$PROJECT' for p in i.get('projects', []))]
with open('/tmp/wiz-issues.json', 'w') as f:
    json.dump(project_issues, f, indent=2)
print(f"Fetched {len(all_nodes)} total, {len(project_issues)} for $PROJECT")
```

#### Via export file (fallback)

```bash
# Convert CSV export to JSON for uniform processing
python3 -c "
import csv, json, sys
rows = list(csv.DictReader(open('$FILE')))
print(json.dumps(rows))
" > /tmp/wiz-issues.json
```

### 1b. `--this-repo` Filter (when flag is present)

When `--this-repo` is passed, apply an additional filter immediately after fetching all issues — before triage — to scope the run to only the Lambdas owned by the current git repo.

**Step 1 — Detect the repo name and derive Lambda prefixes:**

```bash
# Get the repo name from git remote
REPO_NAME=$(git remote get-url origin | sed 's/.*\///' | sed 's/\.git$//')
# e.g. insurance-self-service_insurancepolicychange_change-finance-company-app
```

Use the following known prefix map for ClubLabs-ISS repos:

| Repo name (suffix)                                     | Application Lambda prefix                                                                                                                                                       | CDK stack name fragment                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------  |
| `change-finance-company-app`                           | `cfc-`                                                                                                                                                                          | `insurancepolicychange-cfc`                                   |
| `cmn-insuranceclaims_claims-api-v2` (auto-efnol)       | `cmn-auto-efnol-`                                                                                                                                                               | `cmn-insuranceclaims-cmn-auto-efnol-api-v2`                   |
| `cmn-insuranceclaims_claims-api-v2` (claims)           | `cmn-claims-`, `cmn-efnol-policy-`                                                                                                                                              | `cmn-insuranceclaims-cmn-claims-api-v2`                       |
| `cmn-insuranceclaims_claims-api-v2` (claims-view)      | `cmn-claims-view-`                                                                                                                                                              | `cmn-insuranceclaims-cmn-claims-view-api-v2`                  |
| `cmn-insuranceclaims_claims-api-v2` (home-efnol)       | `cmn-home-efnol-`                                                                                                                                                               | `cmn-insuranceclaims-cmn-home-efnol-api-v2`                   |
| `cmn-insurancepolicychange-auto-vehicle-ao`            | `add-replace-remove-`, `change-coverage-`                                                                                                                                       | `cmn-insurancepolicychange-`                                  |
| `cmn-insurancepolicychange_change-finance-company`     | `cmn-cfc-`                                                                                                                                                                      | `cmn-insurancepolicychange-cfc`                               |
| `cmn-insurancepolicychange_driver-ao`                  | `cmn-driver-ao-`                                                                                                                                                                | `cmn-insurancepolicychange-driver-ao`                         |
| `cmn-insurancepolicychange_home-ao`                    | `cmn-home-ao-`                                                                                                                                                                  | `cmn-insurancepolicychange-home-ao`                           |
| `cmn-insurancepolicychange_homeiq`                     | `cmn-home-iq-`, `homeiq-mongodb-`                                                                                                                                               | `cmn-insurancepolicychange-home-iq-app`                       |
| `cmn-insurancepolicyinfo_anonymous-landing` (policy)   | `cmn-anonymous-landing-policy-`, `cmn-anonymous-landing-guidewire-`, `cmn-anonymous-landing-huon-`, `cmn-anonymous-landing-home-`                                               | `cmn-insurancepolicyinfo-cmn-anonymous-insurance-policy-app`  |
| `cmn-insurancepolicyinfo_anonymous-landing` (validate) | `cmn-anonymous-landing-validate-`                                                                                                                                               | `cmn-insurancepolicyinfo-cmn-anonymous-landing-app`           |
| `cmn-insurancepolicyinfo_anonymous-poi`                | `cmn-anonymous-poi-`                                                                                                                                                            | `cmn-insurancepolicyinfo-cmn-anonymous-poi-app`               |
| `cmn-insurancepolicyinfo-common-insurance-policy`      | `cmn-get-`, `cmn-expire-`, `cmn-home-iq-`, `cmn-mock-`                                                                                                                          | `cmn-insurancepolicyinfo`                                     |
| `cmn-insurancepolicyinfo-common-insurance-policy` (gw-auto)         | `app-auto-`, `app-cmn-insurance-policy-info-`, `app-get-auto-`, `app-get-file-`, `app-get-policy-`, `app-gw-`, `get-apple-`, `get-google-`, `update-google-`       | `cmn-insurancepolicyinfo-insurance-policy-gw-auto-api`        |
| `cmn-insurancepolicyinfo-common-insurance-policy` (gw-home)         | `app-gw-home-`, `gw-home-`, `get-home-policy-`                                                                                                                     | `cmn-insurancepolicyinfo-insurance-policy-gw-home-api`        |
| `cmn-insurancepolicyinfo-common-insurance-policy` (gw-speciality)   | `gw-speciality-`, `get-speciality-`                                                                                                                                | `cmn-insurancepolicyinfo-insurance-policy-gw-speciality-app`  |
| `cmn-insurancepolicyinfo-common-insurance-policy` (huon-auto)       | `apple-wallet`, `app-call-`, `get-huon-auto-`, `get-huon-policy-`, `get-membership-`, `common-insurance-get-`, `get-pstar-auto-`                                   | `cmn-insurancepolicyinfo-huon-auto-policy-api`                |
| `cmn-insurancepolicyinfo-common-insurance-policy` (huon-home)       | `get-huon-home-`, `app-get-policy-document-`, `get-pstar-home-`                                                                                                    | `cmn-insurancepolicyinfo-huon-home-policy-app`                |
| `cmn-insurancepolicyinfo-common-insurance-policy` (huon-speciality) | `get-huon-speciality-`                                                                                                                                             | `cmn-insurancepolicyinfo-insurance-policy-huon-speciality-app`|
| `cmn-insurancepolicyinfo_cci-api`                      | `api-`, `cci-`                                                                                                                                                                  | `cmn-insurancepolicyinfo-c`                                   |
| `cmn-insurancepolicyinfo_cci-api` (policy)             | `api-policy-info-`, `api-guidewire-`, `api-huon-`, `api-expire-cache-`, `cci-insurance-event-subscriber-`, `api-oms-`, `api-tmo-`, `api-ubi-`, `cci-get-gw-`                    | `cmn-insurancepolicyinfo-api-insurance-policy-stack`          |
| `cmn-insurancepolicyinfo_cci-api` (vehicles)           | `vehicle-make-search`, `vehicle-model-search`                                                                                                                                   | `common-insurance-api-insurance-services`                     |
| `common-insurance_billing-summary`                     | `cmn-get-guidewire-billing-`                                                                                                                                                    | `common-insurance-cmn-billing-summary-guidewire-app`          |
| `common-utils_util`                                    | `common-utils-`                                                                                                                                                                 | `common-utils-utilities-api`                                  |
| `common_guidewire-okta`                                | `guidewire-okta-`                                                                                                                                                               | `commonservices-guidewire-okta`                               |
| `common_package`                                       | `common-package-`                                                                                                                                                               | `commonservices-common-package`                               |
| `driver-ao`                                            | `driver-ao-`                                                                                                                                                                    | `insurancepolicychange-dri`                                   |
| `insurance-policy-change_address-change`               | `address-change-`                                                                                                                                                               | `insurancepolicychange-address-change`                        |
| `insurance-policy-info_anonymous-landing`              | `anonymous-landing-`                                                                                                                                                            | `insurance-policy-info-anonymous-landing-app`                 |
| `insurance-policy-info_anonymous-poi`                  | `anonymous-poi-`                                                                                                                                                                | `insurance-policy-info-anonymous-poi-app`                     |
| `insurance-policy-info_billing-summary`                | `billing-summary-`,  `get-billing-`, `cancel-scheduled-payment-`                                                                                                                | `insurance-policy-info-insurance-billing-summary-app`         |
| `insurance-policy-info_micro-payment-details`          | `micro-payment-`                                                                                                                                                                | `insurance-policy-info-micro-payment-details-app`             |
| `insurance-policy-info_rush-escrow`                    | `rush-escrow-`                                                                                                                                                                  | `insurance-policy-info-rush-escrow-app`                       |
| `insurance-self-service-cmn-insuranceclaims-api`       | `api-get-customer-claims`, `api-get-customer-claims-v2`                                                                                                                         | `cmn-insuranceclaims-api-customer-claims`                     |
| `insuranceclaims_auto-efnol-without-login`             | `without-login-efnol-auto-`, `efnol-auto-flow-director-v4`, `efnol-auto-get-initial-data-v4`                                                                                    | `insurance-claims-auto-efnol-no-auth-app`                     |
| `insuranceclaims_auto-efnol-without-login-thirdparty`  | `without-login-thirdparty-efnol-auto-`                                                                                                                                          | `insurance-claims-auto-efnol-thirdparty-no-auth-app`          |
| `insuranceclaims_auto-home-efnol` (auto)               | `efnol-auto-`                                                                                                                                                                   | `insurance-claims-auto-efnol-app-v3AppStack`                  |
| `insuranceclaims_auto-home-efnol` (home)               | `efnol-cors-handler-v3`, `create-home-claim-v3`, `efnol-flow-director-v3`, `get-`, `send-email-v3`, `submit-home-claim-v3`                                                      | `insurance-claims-home-efnol-app-v3AppStack`                  |
| `insuranceclaims_claimsview`                           | `claimsview-`                                                                                                                                                                   | `insurance-claims-claimsview-app`                             |
| `insuranceclaims_home-efnol-without-login`             | `without-login-efnol-home-`, `efnol-home-flow-director`, `efnol-home-get-initial-data`                                                                                          | `insurance-claims-home-efnol-no-auth-app`                     |
| `insurancepolicychange_auto-add-replace-vehicle`       | `add-replace-vehicle-`                                                                                                                                                          | `insurancepolicychange-auto-add-replace-vehicle`              |
| `insurancepolicychange_autoiq` (public)                | `auto-iq-`, `save-iq`, `get-iq`                                                                                                                                                 | `insurancepolicychange-auto-iq-app`                           |
| `insurancepolicychange_autoiq` (private)               | `cmn-huon-`, `cmn-get-guidewire-iq`, `cmn-save-`, `cmn-get-auto-iq-`, `cmn-autoiq-`, `cmn-auto-iq-`                                                                             | `insurancepolicychange-cmn-auto-iq-app`                       |
| `insurancepolicychange_cmn-address-change`             | `cmn-address-change-`, `cmn-get-customer-`, `cmn-validate-address-change-`, `cmn-verify-address-`, `cmn-record-policy-notes`                                                    | `insurancepolicychange-address-change-cmn`                    |
| `insurancepolicychange_home-ao-mortgage-change`        | `gw-`, `huon-`, `bind-mortgage-`, `mortgage-`                                                                                                                                   | `insurancepolicychange-hom`                                   |
| `insurancepolicychange_homeiq`                         | `home-iq-`                                                                                                                                                                      | `insurancepolicychange-insurancepolicychange-homeiq`          |
| `insurancepolicychange_insurance-coverage-change`      | `cancel-scheduled-`                                                                                                                                                             | `insurancepolicychange-ins`                                   |
| `insurancepolicyinfo_policyview`                       | `app-`                                                                                                                                                                          | `insurance-policy-info-insurance-policy-info-app`             |

If the repo is not in this table, print the repo name and ask the user to supply the Lambda prefix manually before continuing.

**Step 2 — Filter issues in Python:**

```python
CDK_PATTERNS = [
    'ProviderframeworkonEvent', 'ProviderframeworkisCompl', 'ProviderframeworkonTimeo',
    'IsCompleteHandler', 'OnEventHandler', 'LogRetentionaae0aa3c5b4d'
]

# Derive from repo name — example for change-finance-company-app
APP_PREFIXES = ['cfc-']          # application Lambda prefixes
CDK_STACK_FRAGMENT = 'insurancepolicychange-cfc'  # CDK framework Lambda name fragment

def belongs_to_this_repo(issue):
    name = issue['entity']['name']
    is_cdk = any(p in name for p in CDK_PATTERNS)
    if is_cdk:
        return CDK_STACK_FRAGMENT in name
    else:
        return any(name.startswith(p) for p in APP_PREFIXES)

repo_issues = [i for i in project_issues if belongs_to_this_repo(i)]
print(f"--this-repo filter: {len(project_issues)} → {len(repo_issues)} issues")
```

All subsequent triage, fix, and reporting steps operate on `repo_issues` only. The output summary should note `Scope: this repo only (<repo-name>)`.

### 2. Triage Phase

Parse `/tmp/wiz-issues.json` and group every issue into one of these buckets:

| Bucket                                 | Description                                                                                                                                                                                                                                                   | Fix Mechanism                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Lambda SLA**                         | `[ACE] Serverless function exceeding our Patching Standard SLA` — Lambda runtime is behind patching SLA                                                                                                                                                       | Redeploy via GHA (runtime updated on deploy)          |
| **Deprecated Runtime — App**           | `[ACE] Serverless using deprecated runtime` on application Lambdas (named by the team)                                                                                                                                                                        | Update runtime version in repo's CDK/config           |
| **Deprecated Runtime — CDK Framework** | `[ACE] Serverless using deprecated runtime` on CDK-auto-generated Lambdas (names match patterns: `ProviderframeworkonEvent*`, `ProviderframeworkisCompl*`, `ProviderframeworkonTimeo*`, `IsCompleteHandler*`, `OnEventHandler*`, `LogRetentionaae0aa3c5b4d*`) | Upgrade `aws-cdk-lib` in the CDK stack + `cdk deploy` |
| **Container CVE**                      | Container image contains known CVEs; base image is outdated                                                                                                                                                                                                   | Rebuild image with updated base, push, redeploy       |
| **IAM**                                | Overly permissive role, wildcard resource, missing boundary                                                                                                                                                                                                   | Update IAM policy in CDK; `cdk deploy`                |
| **Missing Tag — ace:team**             | `[ACE] Resource missing the tag ace:team` on CDK-auto-generated `LogRetentionaae0aa3c5b4d*` Lambdas                                                                                                                                                          | Apply tags at stack level in CDK; redeploy            |
| **Network exposure**                   | Security group allows `0.0.0.0/0`, open port, missing VPC endpoint                                                                                                                                                                                            | Update security group / CDK config                    |
| **Secret / credential**                | Secret in plaintext, exposed env var, unrotated credential                                                                                                                                                                                                    | Rotate via AWS Secrets Manager; update Lambda env     |
| **No action**                          | Issue marked `ACCEPTED`, `FALSE_POSITIVE`, or no fix available yet                                                                                                                                                                                            | Document and skip                                     |

> **CDK Framework Lambda identification:** ~59% of Deprecated Runtime issues in ClubLabs-ISS are CDK framework Lambdas, not application code. Always split this bucket before acting — the fix mechanism is completely different. Use this Python snippet to separate them:
>
> ```python
> CDK_PATTERNS = [
>     'ProviderframeworkonEvent', 'ProviderframeworkisCompl', 'ProviderframeworkonTimeo',
>     'IsCompleteHandler', 'OnEventHandler', 'LogRetentionaae0aa3c5b4d'
> ]
> def is_cdk_framework(name):
>     return any(p in name for p in CDK_PATTERNS)
> ```

Display a triage table before applying any fixes:

| Resource             | Type   | Control      | Severity | Bucket     | Action         |
| -------------------- | ------ | ------------ | -------- | ---------- | -------------- |
| cfc-complete-auto-ao | Lambda | Patching SLA | High     | Lambda SLA | Deploy via GHA |
| cfc-flow-director-v2 | Lambda | Patching SLA | High     | Lambda SLA | Deploy via GHA |
| ...                  |        |              |          |            |                |

### Fix Boundaries (apply to ALL fix types below)

- **NEVER change Lambda timeout in `api.ts` / `app.ts` / `*-stack.ts` files.** API Gateway has a hard 29-second limit. Lambda timeouts are set at 29s intentionally — changing to 30 causes 504 errors for callers. Wiz findings about timeout are not about the value itself — they're about patching SLA (the runtime needs redeploying).
- **NEVER change `Duration.seconds()` default values in `api-stack.ts`.** The default fallback (15s or 29s) is an architecture decision, not a vulnerability.
- **Do not modify `event.ts` test fixtures** unless the production code being tested actually decodes the value (see snyk-fix JWT boundary rule).

### 3. Lambda SLA Fix

This is the most common issue type for ClubLabs-ISS. When a Lambda function is flagged for exceeding the patching SLA, the fix is redeploying the function — the GHA workflow pulls the latest approved Lambda runtime, so a fresh deployment resolves the finding without any code changes.

#### Check for pinned Lambda runtime version

Before triggering a redeploy, check whether the Lambda runtime itself is **hardcoded to an older version** in the CDK stack. A redeploy-only fix will not change the runtime if it is pinned in code — the CDK must be updated first.

**1. Search CDK stacks for pinned runtime versions:**

```bash
grep -rn "Runtime\.NODEJS_" . --include="*.ts" --exclude-dir=node_modules --exclude-dir=dist --exclude="*.d.ts"
```

**2. Compare against the current AWS-recommended runtime:**

The current target runtime is `Runtime.NODEJS_24_X` (`nodejs24.x`). Any Lambda still pinned to `NODEJS_18_X`, `NODEJS_20_X`, or `NODEJS_22_X` must be upgraded.

**3. If the runtime is behind, update all occurrences:**

```bash
# Example: bump NODEJS_22_X → NODEJS_24_X across all CDK stacks
find . -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" \
  | xargs grep -l "Runtime\.NODEJS_22_X" \
  | xargs sed -i.bak 's/Runtime\.NODEJS_22_X/Runtime\.NODEJS_24_X/g'
find . -name "*.ts.bak" -not -path "*/node_modules/*" -delete
```

Also update `compatibleRuntimes` on any Lambda layer definitions (e.g. feature-flags layers) to match the new runtime.

**4. Check `.nvmrc` and GHA workflow `node-version` settings match:**

```bash
# .nvmrc
cat .nvmrc
# GHA workflows
grep -rn "node-version\|NODE_VERSION" .github/workflows/
```

All should reference the same major Node.js version as the CDK runtime. If `.nvmrc` says `v22` and the CDK is `NODEJS_24_X`, update `.nvmrc` to `v24` and update all GHA `node-version: '22'` to `'24'`.

> **This is a common miss:** redeploying a Lambda does NOT change its runtime if the runtime is hardcoded in the CDK stack. The wiz-fix must update the CDK source code before redeploying.

#### Check for pinned Lambda layer versions

Before triggering a redeploy, check whether the root cause is a **hard-pinned Lambda layer ARN** in the CDK stack. A redeploy-only fix will not change the layer version if the ARN is pinned — the CDK must be updated first.

**1. Search CDK stacks for pinned layer ARNs:**

```bash
grep -rn "layer:splunk-apm\|layer:splunk-apm-arm\|LayerVersion.fromLayerVersionArn" \
  infrastructure/ --include="*.ts"
```

**2. Check the upstream version manifest for the latest available version:**

```bash
# For splunk-apm-arm layers (Splunk OpenTelemetry, arm64)
gh api repos/signalfx/lambda-layer-versions/contents/splunk-apm/splunk-apm-arm.md \
  --jq '.content' | base64 -d
```

Compare the pinned version in the CDK against the latest for each deployed region (typically `us-east-1`, `us-east-2`, `us-west-2`). Layer versions vary by region — use the version for the stack's primary region.

**3. Note on `codeSha256`:** Splunk publishes layers from account `254067382080`. A cross-account `lambda:GetLayerVersion` call will be denied by IAM:

```bash
aws lambda get-layer-version-by-arn \
  --arn "arn:aws:lambda:us-east-1:254067382080:layer:splunk-apm-arm:<version>" \
  --region us-east-1
# → AccessDeniedException — expected; codeSha256 must be verified post-deploy via:
# aws lambda get-function-configuration --function-name <name> --query 'Layers'
```

**4. If the pinned version is behind latest, show the diff and prompt for approval before applying:**

```bash
# Find all pinned occurrences across CDK stacks
grep -rn "splunk-apm-arm:<old-version>" . --include="*.ts"
```

Present the version comparison table to the user:

| Region      | Pinned version | Latest available | Delta |
| ----------- | -------------- | ---------------- | ----- |
| `us-east-1` | 45             | 51               | +6    |
| `us-east-2` | 45             | 71               | +26   |
| `us-west-2` | 45             | 51               | +6    |

Then ask: **"Permission to update all CDK stacks from `:45` to `:51`?"** — do not apply the change without explicit user approval.

After approval, update all occurrences:

```bash
# Example: bump version 45 → 51 across all CDK stacks
find . -name "*.ts" -path "*/infrastructure/*" \
  | xargs grep -l "splunk-apm-arm:45" \
  | xargs sed -i.bak 's/splunk-apm-arm:45/splunk-apm-arm:51/g'
find . -name "*.ts.bak" -not -path "*/node_modules/*" -delete
```

Known CDK stack locations for ClubLabs-ISS (splunk-apm-arm layer):

| Repo                                                                      | File                                                     | Approx. line |
| ------------------------------------------------------------------------- | -------------------------------------------------------- | ------------ |
| `insurance-self-service_insurancepolicychange_change-finance-company-app` | `infrastructure/cdk-app/app/lib/app-stack.ts`            | 194          |
| `insurance-self-service_insurancepolicychange_driver-ao`                  | `infrastructure/app/lib/app-stack.ts`                    | 249          |
| `insurance-self-service_cmn-insurancepolicyinfo_cci-api`                  | `api-insurance-policy/lib/api-insurance-policy-stack.ts` | 353          |
| `frontend/insurance-self-service_insurancepolicychange_driver-ao`         | `infrastructure/app/lib/app-stack.ts`                    | 249          |

After updating the CDK, a `cdk deploy` **and** a GHA redeploy are both required to push the new layer ARN to the live Lambda functions.

#### Check for pinned Lambda Insights layer versions

CloudWatch Lambda Insights uses an AWS-published layer (`LambdaInsightsExtension-Arm64`, account `580247275435`) that is often pinned in CDK stacks. When Wiz flags a Lambda for exceeding the patching SLA, the root cause may be a stale Insights layer — not just the runtime or Splunk layer. This section applies only when the Insights layer is already present but outdated — do not add it to Lambdas that don't use it.

**1. Search CDK stacks for pinned Lambda Insights versions:**

```bash
grep -rn "LambdaInsightsVersion\|LambdaInsightsExtension\|insightsVersion" \
  . --include="*.ts" --exclude-dir=node_modules --exclude-dir=dist --exclude="*.d.ts"
```

If no matches are found, skip this section — the Lambda does not use Lambda Insights.

Look for three patterns:

- **CDK enum:** `LambdaInsightsVersion.VERSION_1_0_498_0` (maps to layer `:25`)
- **Explicit ARN:** `LambdaInsightsVersion.fromInsightVersionArn('arn:aws:lambda:...:LambdaInsightsExtension-Arm64:<version>')`
- **Constant-based:** A local constant like `LAMBDA_INSIGHTS_LAYER_VERSION = 25` referenced in the ARN

**2. Check the latest available layer version:**

```bash
aws lambda list-layer-versions \
  --layer-name "arn:aws:lambda:us-west-2:580247275435:layer:LambdaInsightsExtension-Arm64" \
  --region us-west-2 \
  --query 'LayerVersions[0].Version'
```

If the above fails due to cross-account IAM restrictions, check the [AWS Lambda Insights documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-extension-versions.html) for the latest version number.

**3. Follow existing constant patterns in the file:**

Before updating, check whether the file uses a constant for the layer version:

```bash
grep -rn "LAMBDA_INSIGHTS_LAYER_VERSION\|INSIGHTS.*VERSION\|INSIGHTS.*=.*[0-9]" \
  . --include="*.ts" -r --exclude-dir=node_modules
```

- **If a constant exists** (e.g. `const LAMBDA_INSIGHTS_LAYER_VERSION = 25`): update only the constant value — the ARN template literal picks up the change automatically.
- **If the version is inlined** in the ARN or CDK enum: extract it into a named constant first (e.g. `const LAMBDA_INSIGHTS_LAYER_VERSION = 35`), then reference `${LAMBDA_INSIGHTS_LAYER_VERSION}` in the ARN. This keeps future upgrades to a single-line change.
- **If the CDK enum is used** (e.g. `VERSION_1_0_498_0`): check whether `aws-cdk-lib` has an enum for the target version. If not, switch to `fromInsightVersionArn()` with the explicit ARN and a constant for the version number.

**4. If the pinned version is behind latest, show the diff and prompt for approval before applying.**

Present the version comparison:

| Region      | Pinned version | Latest available | Delta |
| ----------- | -------------- | ---------------- | ----- |
| `us-west-2` | 25             | 35               | +10   |
| `us-east-1` | 25             | 35               | +10   |

Then ask: **"Permission to update Lambda Insights layer from `:25` to `:35`?"** — do not apply the change without explicit user approval.

**5. Apply the update across all CDK stacks that already use the Insights layer.**

The Lambda Insights layer is typically set in `lambda-setting.ts` files (not `app-stack.ts`), since it is applied via the `insightsVersion` property on every Lambda function.

Known CDK stack locations for ClubLabs-ISS (LambdaInsightsExtension-Arm64 layer):

| Repo                                                      | File                                           |
| --------------------------------------------------------- | ---------------------------------------------- |
| `insurance-self-service_cmn-insurancepolicychange_homeiq` | `lambdas/lib/lambda/lambda-setting.ts`         |
| `insurance-self-service_cmn-insurancepolicychange_homeiq` | `mongodb-lambdas/lib/lambda/lambda-setting.ts` |
| `insurance-self-service_insurancepolicychange_homeiq`     | `infrastructure/cdk-app/lib/api-stack.ts`      |

After updating, run `yarn test` and `cdk synth` in the affected subprojects to verify the synthesized template reflects the new layer version.

#### Map Lambda name → GHA repo and workflow

Use the following naming convention for ClubLabs-ISS Lambda functions:

| Lambda prefix / name pattern | Likely repo                           | Workflow hint                           |
| ---------------------------- | ------------------------------------- | --------------------------------------- |
| `cfc-*`                      | `ACE-Clublabs/insurance-self-service` | `deploy-*.yml` matching the Lambda name |
| `orchestrator-*`             | `ACE-Clublabs/insurance-self-service` | orchestrator deploy workflow            |
| `gw-*`                       | `ACE-Clublabs/insurance-self-service` | guidewire deploy workflow               |
| `huon-*`                     | `ACE-Clublabs/insurance-self-service` | huon deploy workflow                    |

For each flagged Lambda, find the corresponding workflow:

```bash
# List workflows for the repo
gh workflow list --repo ACE-Clublabs/insurance-self-service

# Find the workflow file matching this Lambda name
gh workflow list --repo ACE-Clublabs/insurance-self-service \
  --json name,id,path \
  | jq '.[] | select(.name | ascii_downcase | contains("<lambda-name-fragment>"))'
```

If no workflow match is found for a Lambda, flag it as **"Workflow not found — manual deploy required"** and add it to the manual steps list.

#### Check last successful deployment

Before triggering a new deploy, check when the Lambda was last deployed to PROD to understand the SLA gap:

```bash
gh run list \
  --repo ACE-Clublabs/<repo> \
  --workflow <workflow.yml> \
  --status success \
  --limit 10 \
  --json databaseId,displayTitle,createdAt,url \
  | jq '.[] | select(.displayTitle | ascii_downcase | contains("prod"))'
```

#### Trigger the deployment

```bash
gh workflow run <workflow.yml> \
  --repo ACE-Clublabs/<repo> \
  --field environment=prod
```

If the workflow requires input parameters, list them first:

```bash
gh workflow view <workflow.yml> --repo ACE-Clublabs/<repo> --yaml \
  | grep -A 20 'workflow_dispatch'
```

Track deployments triggered — record the run ID for verification in Step 6.

#### Subscription grouping

The screenshot shows Lambdas split across two AWS subscriptions:

- `prodinsurancepolicychange / 178191694148` — production account
- `uatinsurancepolicychange / 728251991990` — UAT account

Prioritize production subscription issues first. UAT issues resolve naturally on next UAT deploy cycle.

### 4. Container CVE Fix

For each flagged container image:

1. Identify the base image and the CVE list from the Wiz finding
2. Check if an updated base image tag is available:
   ```bash
   # Example: check for newer node:18-alpine
   docker manifest inspect node:18-alpine --verbose | jq '.Descriptor.digest'
   ```
3. Update the `FROM` line in the relevant `Dockerfile`
4. Rebuild and push via GHA:
   ```bash
   gh workflow run <build-and-push.yml> --repo ACE-Clublabs/<repo>
   ```
5. If the CVE is in an OS package, add a `RUN apk upgrade --no-cache` (Alpine) or `RUN apt-get upgrade -y` (Debian) layer before the app layer as a short-term mitigation

### 5. IAM Fix

For each overly-permissive IAM finding:

1. Identify the CDK stack and construct that defines the role/policy
2. Narrow the resource ARN (replace `*` with specific ARN pattern)
3. Remove unused actions from the policy statement
4. Run `cdk diff` to review the change before deploying:
   ```bash
   cd <cdk-directory>
   npx cdk diff <StackName>
   ```
5. Deploy:
   ```bash
   npx cdk deploy <StackName> --require-approval never
   ```

### 6. Missing Tag — ace:team on LogRetention Handlers

CDK auto-generates `LogRetentionaae0aa3c5b4d*` Lambda functions when `logRetention` is set on a Lambda. These helpers do not inherit tags applied to individual Lambda constructs (`cdk.Tags.of(lambdaFn).add(...)`) — they only inherit tags applied at the **stack level** (`cdk.Tags.of(this).add(...)`).

When Wiz flags `[ACE] Resource missing the tag ace:team` on a `LogRetentionaae0aa3c5b4d*` Lambda, the root cause is that the CDK stack applies `ace:*` tags per-Lambda instead of at the stack level.

#### Step 1 — Identify which CDK stack owns the LogRetention Lambda

Use the `aws:cloudformation:stack-name` tag on the Lambda to find the parent stack:

```bash
aws lambda list-tags \
  --resource "arn:aws:lambda:<region>:<account>:function:<LogRetention-function-name>" \
  --query "Tags.\"aws:cloudformation:stack-name\"" --output text
```

#### Step 2 — Check how the stack currently applies tags

In the CDK source for that stack, search for how tags are applied:

```bash
grep -rn "Tags.of\|ace:team" . --include="*.ts" --exclude-dir=node_modules --exclude-dir=dist
```

Look for the pattern:

- **Per-Lambda tagging (broken):** `cdk.Tags.of(lambdaFn).add('ace:team', ...)` — tags only the business Lambda, not LogRetention helpers
- **Stack-level tagging (correct):** `cdk.Tags.of(this).add('ace:team', ...)` — propagates to all child resources including LogRetention

#### Step 3 — Check a working reference

The `cmn-insurancepolicyinfo` stacks demonstrate the correct pattern. For example, `cmn-insurancepolicyinfo_anonymous-poi/app/lib/app-stack.ts` applies tags at the stack level:

```typescript
const tagRecords = (this as any).tags?.tagValues?.() ?? (props as any).tags ?? {};
for (const tagKey in tagRecords) {
  cdk.Tags.of(this).add(tagKey, tagRecords[tagKey]);
}
cdk.Tags.of(this).add(tag.TaggingKey.Environment, environment);
cdk.Tags.of(this).add('ace:version', buildVersion);
```

This propagates all `ace:*` tags to every resource in the stack, including LogRetention helpers.

#### Step 4 — Apply the fix

Two approaches depending on the stack's current pattern:

**A. Stack already receives tags via props (preferred):**

If the CDK app entry point passes tags via `props.tags` (check `bin/*.ts` and `stack-props.ts`), add stack-level tag propagation in the stack constructor:

```typescript
// In the stack constructor, after super():
const tagRecords = (this as any).tags?.tagValues?.() ?? (props as any).tags ?? {};
for (const tagKey in tagRecords) {
  cdk.Tags.of(this).add(tagKey, tagRecords[tagKey]);
}
```

**B. Stack uses hardcoded per-Lambda tags:**

If the stack applies tags directly on each Lambda (e.g. in a `lambda-setting.ts` helper), keep those AND add stack-level tagging in the stack constructor or the parent CDK app:

```typescript
// In the CDK app entry point (bin/api.ts or similar):
const stack = new MyStack(app, 'StackName', props);
cdk.Tags.of(stack).add('ace:team', 'insurance-self-service');
cdk.Tags.of(stack).add('ace:department', 'ebiz');
cdk.Tags.of(stack).add('ace:workload', 'cmn-insurancepolicychange');
cdk.Tags.of(stack).add('ace:data-profile', 'internal');
```

#### Step 5 — Verify the fix

After applying, run `cdk synth` and check that the LogRetention Lambda now has tags:

```bash
npx cdk synth > /dev/null
python3 -c "
import json, glob
for tmpl in glob.glob('cdk.out/*.template.json'):
    t = json.load(open(tmpl))
    for name, res in t.get('Resources', {}).items():
        if 'LogRetention' in name and res['Type'] == 'AWS::Lambda::Function':
            tags = res.get('Properties', {}).get('Tags', [])
            has_team = any(t['Key'] == 'ace:team' for t in tags)
            print(f'{name}: ace:team={\"YES\" if has_team else \"MISSING\"} ({len(tags)} tags)')
"
```

If the LogRetention Lambda shows `ace:team=YES`, the fix is correct. Deploy via GHA to push the change.

#### Note — CloudOps/LZA Lambdas

Lambdas like `s3-public-access-rule`, `ec2-rule`, `container-detection-rule`, `igw-rule`, `gateway-config-rule`, and `StackSet-CONFIG-*` are deployed by CloudOps via StackSets — these are **not fixable by the application team**. Flag them to CloudOps and skip.

### 7. Deprecated Runtime — CDK Framework Lambda Fix

CDK auto-generates internal Lambda functions to manage `CustomResource` providers (DynamoDB stream setup, log retention, custom resource polling). These are flagged for deprecated runtimes but are **not application code** — they are regenerated by CDK on every deploy.

#### Step 1 — Identify which CDK stack each framework Lambda belongs to

A repo may have **multiple independent CDK stacks** (e.g. an app stack and a DynamoDB stack), each with its own build and deploy pipeline. Do not assume all framework Lambdas come from one stack.

For each flagged framework Lambda, the stack is identified by its name prefix:

```python
# e.g. "insurancepolicychange-cfc-ProviderframeworkonEvent-..." → app stack
# e.g. "insurancepolicychange-dynamodb-ProviderframeworkonEvent-..." → dynamodb stack
```

For each CDK stack directory in the repo, run `cdk synth` and inspect the output template to confirm which framework Lambdas it produces and what runtime they will use:

```bash
# Build shared libs first (required for bundling to succeed)
yarn build-lib

# Synth each CDK stack and check framework Lambda runtimes
cd <cdk-stack-dir>
npx cdk synth > /dev/null  # generates cdk.out/

python3 -c "
import json, glob
for tmpl in glob.glob('cdk.out/*.template.json'):
    t = json.load(open(tmpl))
    lambdas = {k: v for k, v in t.get('Resources', {}).items() if v['Type'] == 'AWS::Lambda::Function'}
    for name, res in lambdas.items():
        rt = res.get('Properties', {}).get('Runtime', 'NOT SET')
        fn = res.get('Properties', {}).get('FunctionName', name[:50])
        print(f'{fn:<55} Runtime={rt}')
"
```

**If framework Lambdas still show a deprecated runtime in the synthesized template** (e.g. `nodejs18.x`), the `aws-cdk-lib` bump alone is not sufficient — the framework construct is resolving the runtime via a regional fact lookup that returns the old value. In this case, explicitly set the runtime on the `Provider` construct or replace `logRetention` with an explicit `logGroup`.

> **Important:** A GHA deploy that was previously successful may still have synthesized the old runtime if `aws-cdk-lib` hadn't been bumped at that time. Always verify via `cdk synth` rather than assuming the live runtime matches the new template.

#### Step 2 — Check and bump `aws-cdk-lib` version

```bash
# Current pinned version across all package.json files
grep -r "aws-cdk-lib\|\"aws-cdk\"" --include="package.json" . | grep -v node_modules | grep -v dist

# Latest available
npm view aws-cdk-lib version
npm view aws-cdk version
```

**Apply the upgrade** across all `package.json` files that pin `aws-cdk-lib` and `aws-cdk`:

- Root `package.json` (`resolutions` block)
- `api-gateway/package.json`
- `dynamodb/package.json`
- `infrastructure/cdk-app/app/package.json`

> Do not bump `aws-cdk-lib` without checking for breaking changes in the CDK changelog between current and target version.

#### Step 3 — Update `CDK_ASSETS_VERSION` in GHA workflows

`cdk-assets` has its own independent version scheme — it does **not** mirror `aws-cdk-lib` version numbers. After bumping `aws-cdk-lib`, scan all GHA workflow files for `CDK_ASSETS_VERSION` and update to the latest available `cdk-assets` 2.x:

```bash
# Find all CDK_ASSETS_VERSION references
grep -rn "CDK_ASSETS_VERSION" .github/workflows/

# Check latest available cdk-assets 2.x
npm view cdk-assets versions --json | python3 -c "
import json, sys
versions = [v for v in json.load(sys.stdin) if v.startswith('2.') and 'alpha' not in v]
print('Latest 2.x:', versions[-1])
"
```

Update each occurrence — do **not** set `CDK_ASSETS_VERSION` to match the `aws-cdk-lib` version (e.g. `2.257.0` does not exist in `cdk-assets`).

#### Step 4 — Identify and trigger all relevant build+deploy pipelines

Each CDK stack has its own build and deploy pipeline. After making code changes, all affected pipelines must be triggered — not just the primary app pipeline.

For ClubLabs-ISS CFC repo:

| CDK Stack                                 | Build Pipeline          | Deploy Pipeline          | Framework Lambdas Fixed                                              |
| ----------------------------------------- | ----------------------- | ------------------------ | -------------------------------------------------------------------- |
| App stack (`infrastructure/cdk-app/app/`) | `build-cfc-app.yml`     | `deploy-env-cfc-app.yml` | `LogRetentionaae0aa3c5b4d*`                                          |
| DynamoDB stack (`dynamodb/`)              | `build-dynamodb-v2.yml` | `deploy-dynamodb-v2.yml` | `ProviderframeworkonEvent*`, `IsCompleteHandler*`, `OnEventHandler*` |

For other repos, list all build workflows and match to CDK stack directories:

```bash
ls .github/workflows/build-*.yml
# Match each to a CDK stack dir by reading PROJECT_PATH input in the workflow
```

#### Step 5 — Deploy sequence

```bash
yarn                          # update lockfile with new aws-cdk-lib version
# Then trigger each relevant build pipeline via GHA (not cdk deploy locally)
# Build pipeline → produces versioned artifact → deploy pipeline → DEV → QA → UAT → PROD
```

> Do not run `cdk deploy` locally to resolve Wiz issues in CI/CD-managed repos — always go through the GHA pipeline so the correct IAM roles, artifact buckets, and approval gates are used.

### 8. Secret / Credential Fix

For each exposed or unrotated secret:

1. Identify the secret name and the Lambda environment variable referencing it
2. Rotate the secret value in AWS Secrets Manager:
   ```bash
   aws secretsmanager rotate-secret --secret-id <secret-name> --region us-east-1
   ```
3. If the secret is hardcoded in an environment variable (not referencing Secrets Manager), update the Lambda config or the CDK definition to reference the secret ARN instead
4. Redeploy the Lambda to pick up the new secret reference

### 9. Verification Phase

After fixes are applied, verify resolution:

#### Check GHA deployment status

```bash
# Poll each triggered workflow run
gh run watch <run-id> --repo ACE-Clublabs/<repo>

# Or list recent runs to check completion
gh run list \
  --repo ACE-Clublabs/<repo> \
  --workflow <workflow.yml> \
  --limit 5 \
  --json status,conclusion,createdAt,url
```

Wait for all PROD deployments to reach `completed / success` before verifying in Wiz.

#### Re-scan via wizcli

```bash
wizcli scan cloud --project "$PROJECT" --output json > /tmp/wiz-rescan.json
```

Or check the Wiz portal: select `$PROJECT` from the project scope dropdown, then filter:

```
Status equals Open or In Progress
Severity equals High
Rule equals [ACE] Serverless function exceeding our Patching Standard SLA
```

The count of open issues should decrease by the number of Lambdas successfully redeployed. Wiz typically picks up the change within 1–4 hours of a successful deployment.

#### Diff table

| Resource             | Before      | After | Status              |
| -------------------- | ----------- | ----- | ------------------- |
| cfc-complete-auto-ao | High / Open | —     | Resolved (deployed) |
| cfc-flow-director-v2 | High / Open | —     | Resolved (deployed) |
| ...                  |             |       |                     |

If any issues remain open after a successful deployment, investigate:

- Was the correct workflow triggered (prod, not UAT)?
- Did the runtime version actually change? Check Lambda config via `aws lambda get-function-configuration --function-name <name>`.
- Is Wiz still processing the scan? Wait for the next scheduled scan cycle.

### 10. Commit Phase (code changes only)

Lambda patching SLA fixes require **no code changes** — redeployment is sufficient. Only commit if code was modified (Dockerfile, CDK, IAM policies):

When all of the following are true:

- Code changes are limited to Dockerfile/CDK/IAM (no application logic changes)
- `cdk diff` showed only the intended changes
- No new Wiz issues introduced

Stage and commit:

```bash
git add <changed files>
git commit -m "fix: resolve Wiz security findings

- Trigger PROD redeployment for <N> Lambda functions exceeding patching SLA
- <Other fix descriptions if applicable>

Wiz issue IDs: <id1>, <id2>, ...

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

## Options

| Flag                  | Behaviour                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<project>`           | **Required** positional arg — short name for the target project (e.g. `iss`, `olb`, `payments`)                                                                   |
| `--scan-only`         | Fetch and triage issues, print report, make no changes                                                                                                            |
| `--this-repo`         | Scope to only issues belonging to the current git repo — auto-detects repo name, derives Lambda prefix, filters application and CDK framework Lambdas accordingly |
| `--severity <level>`  | Only process issues at this severity and above (default: `high`)                                                                                                  |
| `--type <bucket>`     | Only process one fix bucket (e.g. `--type lambda`)                                                                                                                |
| `--file <path>`       | Read issues from a Wiz CSV/JSON export instead of live API                                                                                                        |
| `--no-deploy`         | Apply code fixes but do not trigger GHA deployments                                                                                                               |
| `--subscription <id>` | Only process issues in the given AWS subscription ID                                                                                                              |

## Output Format

At the end of each run, print a structured summary:

```
╔══════════════════════════════════════════════╗
║            WIZ FIX SUMMARY                  ║
╠══════════════════════════════════════════════╣
║ Issues fetched      : 1,205                 ║
║ Lambda SLA          : 48  → 45 deployed     ║
║ Container CVE       : 3   → 2 fixed         ║
║ IAM                 : 2   → 2 fixed         ║
║ Network exposure    : 1   → 0 (manual)      ║
║ Secret/credential   : 1   → 1 fixed         ║
║ No action           : 1,150 (accepted/N/A)  ║
║ Deployments pending : 45 GHA runs triggered ║
║ Committed           : NO (deploy-only fix)  ║
╚══════════════════════════════════════════════╝
```

Follow with a full triage table:

| Resource                           | Subscription        | Severity | Bucket     | Action Taken     | GHA Run                             |
| ---------------------------------- | ------------------- | -------- | ---------- | ---------------- | ----------------------------------- |
| cfc-complete-auto-ao               | prod / 178191694148 | High     | Lambda SLA | Triggered deploy | [run/12345](https://github.com/...) |
| cfc-flow-director-v2               | prod / 178191694148 | High     | Lambda SLA | Triggered deploy | [run/12346](https://github.com/...) |
| huon-change-finance-company-update | uat / 728251991990  | High     | Lambda SLA | Skipped (UAT)    | —                                   |
| ...                                |                     |          |            |                  |                                     |

Then list any items that could not be automatically resolved:

```
Manual action required:
  - orchestrator-change-finance-company-<suffix>
    Bucket: Lambda SLA
    Reason: No matching GHA workflow found for this Lambda name
    Action: Manually identify the deploy workflow and trigger a PROD deployment
    Wiz issue ID: <id>
```

## Safety Rules

- Never modify Lambda function code to fix a patching SLA issue — the fix is always redeployment
- Never trigger a `prod` deployment without confirming the workflow targets prod (check workflow inputs and branch)
- Never rotate a secret without verifying all consumers of that secret are updated before the old value expires
- Never apply CDK changes without reviewing `cdk diff` output first
- Always trigger UAT deployment before PROD for code-level fixes (Dockerfile, CDK)
- If a Wiz finding is marked `ACCEPTED` or `FALSE_POSITIVE` in the portal, do not attempt to fix it — respect the existing triage decision
- Do not commit empty commits or stub commits when the fix is deploy-only
