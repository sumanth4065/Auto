---
name: find-orphaned-stacks
description: Find orphaned CloudFormation stacks with deprecated Lambda runtimes, trace their origin repo/commit, identify the live replacement stack, and generate a delete_stack.md report
trigger: when user mentions "orphaned stack", "deprecated runtime", "node 18 lambda", "find stacks to delete", or "stale cloudformation"
context_weight: lightweight
---

# Find Orphaned Stacks Skill

Identifies CloudFormation stacks that contain Lambdas on deprecated runtimes, determines
whether those stacks have been superseded by a newer replacement, traces the origin back
to a GitHub repo and commit, and produces a `docs/delete_stack.md` report.

## Arguments

```text
/find-orphaned-stacks [--profile <aws-profile>] [--region <region>] [--runtime <runtime>[,<runtime>...]] [--prefix <stack-prefix>]
```

| Argument | Default | Description |
|---|---|---|
| `--profile` | current AWS env | AWS CLI profile to use |
| `--region` | `us-west-2` | AWS region to scan |
| `--runtime` | `nodejs18.x` | Deprecated runtime(s) to hunt for. Accepts a comma-separated list to scan multiple runtimes in one pass (e.g. `nodejs18.x,nodejs20.x`). |
| `--prefix` | _(none — account-wide)_ | Filter stacks and Lambdas by name prefix. Use to scope the scan to a single repo's resources (e.g. `cmn-insurancepolicychange-change-finance-company`). Without this, the scan covers the entire AWS account. |

Examples:
```text
# Account-wide scan (all stacks in the workload account)
/find-orphaned-stacks --profile prod-insurancepolicychange-ebiz-cloud-devops

# Scoped to this repo's stacks only
/find-orphaned-stacks --profile prod-insurancepolicychange-ebiz-cloud-devops --prefix cmn-insurancepolicychange-change-finance-company

# Scan for both Node 18 and Node 20 in one pass
/find-orphaned-stacks --profile prod-insurancepolicychange-ebiz-cloud-devops --runtime nodejs18.x,nodejs20.x
```

## Prerequisites

```bash
which aws  || echo "aws CLI not found — brew install awscli"
which gh   || echo "gh not found — brew install gh"
which jq   || echo "jq not found — brew install jq"
aws sts get-caller-identity || echo "Run: aws sso login --profile <profile>"
gh auth status              || echo "Run: gh auth login"
```

## Step 1 — Find Lambdas on Deprecated Runtime

`--runtime` accepts a comma-separated list. Split it and run one query per runtime, then
merge the results before proceeding to Step 2.

```bash
RUNTIMES="${RUNTIME:-nodejs18.x}"   # e.g. "nodejs18.x,nodejs20.x"
REGION="${REGION:-us-west-2}"
PREFIX="${PREFIX:-}"  # optional — filters by Lambda name prefix

# Split on commas and query each runtime in turn
IFS=',' read -ra RUNTIME_LIST <<< "$RUNTIMES"
for RT in "${RUNTIME_LIST[@]}"; do
  echo "=== Runtime: $RT ==="
  aws lambda list-functions \
    --profile <profile> --region $REGION \
    --query "Functions[?Runtime=='$RT'${PREFIX:+ && starts_with(FunctionName, \`$PREFIX\`)}].[FunctionName,Runtime,LastModified]" \
    --output table
done
```

If `--prefix` was provided, only Lambdas whose names start with that prefix are returned,
scoping the scan to a single repo's resources. Without it, all matching-runtime Lambdas
in the account are returned.

For each Lambda found, record:
- `FunctionName`
- `Runtime`
- `LastModified` (to assess staleness)

## Step 2 — Map Lambdas to CloudFormation Stacks

For each Lambda, query its CloudFormation stack tag:

```bash
aws lambda get-function \
  $PROFILE_FLAG --region $REGION \
  --function-name <FunctionName> \
  --query 'Tags' --output json
```

Look for `aws:cloudformation:stack-name` tag. If absent, the Lambda is not CFN-managed —
note it separately.

Then describe the parent stack:

```bash
STACK_NAME=$(aws lambda get-function \
  $PROFILE_FLAG --region $REGION \
  --function-name <FunctionName> \
  --query "Tags.\"aws:cloudformation:stack-name\"" --output text)

aws cloudformation describe-stacks \
  $PROFILE_FLAG --region $REGION \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].{Status:StackStatus,Created:CreationTime,Updated:LastUpdatedTime,ParentId:ParentId,RootId:RootId}" \
  --output table
```

If the stack has a `ParentId`, resolve the root/parent stack name:

```bash
aws cloudformation describe-stacks \
  $PROFILE_FLAG --region $REGION \
  --stack-name "<ParentStackId>" \
  --query "Stacks[0].StackName" --output text
```

## Step 3 — Determine if Stack is Orphaned

A stack is **orphaned** (candidate for deletion) when ALL of the following are true:

1. It contains Lambdas on a deprecated runtime (from Step 1).
2. It has had **no CloudFormation operations** (create/update) in the past 6 months —
   check `LastUpdatedTime` from Step 2.
3. A **replacement stack exists** with the same logical purpose but a newer naming
   convention or `V2`/`V3` suffix (found in Step 4).

A stack is **NOT orphaned** if it is still actively deployed to (even if its Lambdas have
drifted to old runtimes). In that case, the fix is a runtime upgrade (see
`nest_stack_cdk_forced_update.md`), not deletion.

## Step 4 — Find the Replacement Stack

Search for stacks with similar names (same workload prefix, similar table/function name)
but a newer suffix:

```bash
# Use --prefix value if provided, otherwise use the workload prefix derived from the orphaned stack name
aws cloudformation list-stacks \
  --profile <profile> --region $REGION \
  --stack-status-filter UPDATE_COMPLETE CREATE_COMPLETE \
  --query "StackSummaries[?contains(StackName, '<prefix-or-workload-prefix>')].{Name:StackName,Updated:LastUpdatedTime}" \
  --output table | sort
```

If `--prefix` was provided, use it here. Otherwise derive the workload prefix from the
orphaned stack name (e.g. `insurancepolicychange-` from `insurancepolicychange-cfc-policy-cache-table`).

A replacement stack typically:
- Shares the same workload prefix (e.g. `insurancepolicychange-`)
- Contains a `V2` suffix in its DynamoDB table name or stack name
- Was **last updated more recently** than the orphaned stack

## Step 5 — Trace Origin to GitHub

Search the GitHub org for the stack name to find which repo created it:

```bash
gh search code "<stack-name>" --owner ACE-Clublabs \
  --json repository,path \
  | jq -r '.[] | "\(.repository.nameWithOwner) → \(.path)"'
```

If no live code matches (stack name was refactored away), search git history:

```bash
# Find the commit that introduced the stack name
gh api "repos/ACE-Clublabs/<repo>/commits?path=<cdk-entry-point>&per_page=20" \
  | jq -r '.[] | "\(.commit.committer.date) — \(.sha[0:7]) — \(.commit.message | split("\n")[0])"'

# Read file at the creating commit
gh api "repos/ACE-Clublabs/<repo>/contents/<file>?ref=<sha>" \
  | jq -r '.content' | base64 -d
```

For the replacement stack, find the upgrade commit:

```bash
gh search code "<V2-table-name>" --owner ACE-Clublabs \
  --json repository,path \
  | jq -r '.[] | "\(.repository.nameWithOwner) → \(.path)"'
```

## Step 6 — Confirm with Deploy Pipeline

Verify the replacement is actively deployed by reading the repo's deploy workflow:

```bash
gh api "repos/ACE-Clublabs/<repo>/contents/.github/workflows/deploy-dynamodb-v2.yml" \
  | jq -r '.content' | base64 -d \
  | grep -i "STACK_NAME\|DEPLOY_ENV\|WORKLOAD"
```

## Step 6b — Verify Zero CloudWatch Activity on Old Tables

For each orphaned stack, get the old DynamoDB table name from its CloudFormation resources
and check 30-day read/write metrics. Zero on both means the table is safe to delete.

```bash
# Get old table name from the orphaned stack
OLD_TABLE=$(AWS_PROFILE=<profile> aws cloudformation describe-stack-resources \
  --region <region> \
  --stack-name "<orphaned-stack-name>" \
  --query "StackResources[?ResourceType=='AWS::DynamoDB::Table' || ResourceType=='AWS::DynamoDB::GlobalTable'].PhysicalResourceId" \
  --output text)

echo "Checking activity for: $OLD_TABLE"

# Check reads and writes over the last 30 days
for metric in ConsumedReadCapacityUnits ConsumedWriteCapacityUnits; do
  result=$(AWS_PROFILE=<profile> aws cloudwatch get-metric-statistics \
    --region <region> \
    --namespace AWS/DynamoDB \
    --metric-name $metric \
    --dimensions Name=TableName,Value=$OLD_TABLE \
    --start-time $(date -u -v-30d +%Y-%m-%dT%H:%M:%SZ) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
    --period 2592000 \
    --statistics Sum \
    --query 'Datapoints[0].Sum' \
    --output text 2>/dev/null)
  echo "  $metric: ${result:-0 (no datapoints)}"
done
```

**Interpret results:**
- `0.0` or `no datapoints` on both metrics → **safe to delete**
- Any non-zero value → table still has active traffic; **do not delete** — investigate which
  service is still reading/writing the old table before proceeding

Record the CloudWatch result for each table in the `delete_stack.md` report under a
**CloudWatch Verification** row.

## Step 7 — Generate delete_stack.md

Create or update `docs/delete_stack.md` in the current repo using the template below.
Fill in every `<placeholder>` with findings from Steps 1–6.

```markdown
## Deprecated Stack (orphan)

| Field | Value |
|---|---|
| Stack | `<orphaned-stack-name>` |
| Nested stack | `<nested-stack-name>` |
| DynamoDB table | `<old-table-name>` |
| Account | `<account-id>` (`<env>` `<workload>`) |
| Region | `<region>` |
| Created | `<created-date>` |
| Last updated | `<last-updated-date>` |
| CF status | `<status>` (inactive — no operations since creation) |
| CloudWatch reads (30d) | `<value>` — ✅ safe / ⚠️ active |
| CloudWatch writes (30d) | `<value>` — ✅ safe / ⚠️ active |

## Live Replacement Stack

| Field | Value |
|---|---|
| Stack | `<replacement-stack-name>` |
| DynamoDB table | `<new-table-name>` |
| Account | `<account-id>` |
| Region | `<region>` |

## Proof

**1. Origin of the deprecated stack** — commit `<sha>` (`<date>`) in
`ACE-Clublabs/<repo>` via `<file-path>`:

\`\`\`typescript
const stackName = '<orphaned-stack-name>';
const tableName = '<old-table-name>';
\`\`\`

**2. Replacement introduced** — commit `<sha>` (`<date>`), PR title: `<pr-title>`

New table name defined in `<constants-file>`:
\`\`\`typescript
export const <varName> = '<new-table-name>';
\`\`\`

**3. Deploy pipeline confirms live stack** — `<workflow-file>`:
\`\`\`yaml
STACK_NAME: <replacement-stack-name>
DEPLOY_ENV: prod
WORKLOAD: <workload>
\`\`\`

## Why the deprecated stack still exists

<Explain what changed — e.g. refactor from per-table scripts to consolidated V2 stack —
and why the old stack was never deleted.>

## What to do

1. Confirm `<old-table-name>` has no active reads/writes in CloudWatch.
2. Delete `<orphaned-stack-name>` via the CloudFormation console or the source repo's pipeline.
3. Any nested `awscdkawsdynamodbReplicaProviderNestedStac` stacks are deleted automatically.

> The Node 18 `IsCompleteHandler` / `OnEventHandler` Lambdas flagged by Wiz/deprecation
> scans belong to this orphaned stack — deleting it removes them entirely.
```

## Output

- Updated `docs/delete_stack.md` in the repo.
- Console summary listing each orphaned stack found, its replacement, and whether it is
  safe to delete.

## Safety Note

**Do not delete stacks automatically.** This skill only produces documentation and a
deletion recommendation. The actual deletion must be performed manually after confirming
that the old DynamoDB table has no active traffic.
