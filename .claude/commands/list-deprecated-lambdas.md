---
name: list-deprecated-lambdas
description: List all Lambda functions with deprecated runtimes across us-west-1 and us-east-2 for a given AWS profile
invocation: /list-deprecated-lambdas <AWS_PROFILE>
---

List all Lambda functions with deprecated runtimes for the AWS profile: "$ARGUMENTS"

## Deprecated Runtimes to Flag

- nodejs14.x
- nodejs18.x
- nodejs20.x
- python3.7
- python3.6
- dotnetcore2.1
- ruby2.5
- java8

## Steps

### Step 1: Validate argument

If no AWS_PROFILE argument was provided, tell the user: "Usage: /list-deprecated-lambdas <AWS_PROFILE>" and stop.

The AWS_PROFILE is: $ARGUMENTS

### Step 2: Refresh credentials via gimme-aws-creds

Credentials for profiles in `~/.aws/credentials` are provisioned by `gimme-aws-creds`. Check if the current credentials are still valid first:

```bash
AWS_PROFILE="$ARGUMENTS" aws sts get-caller-identity --output json 2>&1
```

- If the output contains a valid `UserId`/`Account` JSON, credentials are fresh — skip to Step 3.
- If the output contains `ExpiredToken`, `InvalidClientTokenId`, or any auth error, run:

```bash
gimme-aws-creds --profile "$ARGUMENTS"
```

This will refresh the credentials in `~/.aws/credentials` for the given profile. After it completes, re-verify with `aws sts get-caller-identity` before proceeding.

If `gimme-aws-creds` is not installed, tell the user: "`gimme-aws-creds` is not installed. Install it with `pip install gimme-aws-creds` or `brew install gimme-aws-creds`."

### Step 3: Query both regions

Run the following command for **each** of the two regions (`us-west-2` and `us-east-1`), handling pagination:

```bash
AWS_PROFILE="$ARGUMENTS" aws lambda list-functions \
  --region <REGION> \
  --max-items 1000 \
  --output json \
  | jq -r '.Functions[] | select(
      .Runtime | IN(
        "nodejs14.x","nodejs18.x","nodejs20.x",
        "python3.7","python3.6",
        "dotnetcore2.1","ruby2.5","java8"
      )
    ) | "\(.FunctionName)\t\(.Runtime)"'
```

Run both regions in parallel if possible. Collect all results.

### Step 4: Handle errors

- If the command returns `ExpiredTokenException` or `InvalidClientTokenId`, re-run `gimme-aws-creds --profile $ARGUMENTS` and retry once
- If the command returns `AccessDenied`, tell the user the profile lacks Lambda list permissions
- If a region returns zero results, note "No deprecated Lambda functions found in <region>"

### Step 5: Classify each Lambda

For every Lambda found, determine its bucket:

**CDK Framework Lambda patterns** (any function name matching one of these substrings):
- `ProviderframeworkonEvent`
- `ProviderframeworkisCompl`
- `ProviderframeworkonTimeo`
- `IsCompleteHandler`
- `OnEventHandler`
- `LogRetentionaae0aa3c5b4d`

If the function name matches a CDK framework pattern, cross-check it against all synthesized CDK templates in the repo:

```bash
find . -path "*/cdk.out/*.template.json" | xargs grep -l "<FUNCTION_NAME_FRAGMENT>" 2>/dev/null
```

Use the unique suffix fragment (first ~20 chars of the random suffix) as the search term. If no `cdk.out` directory exists, note that and treat all CDK framework Lambdas as **potentially orphaned — cdk.out not present**.

- **Found in a `cdk.out` template** → classify as `CDK Framework (active)` — fix is "upgrade aws-cdk-lib + redeploy", do NOT include in delete loop
- **Not found in any `cdk.out` template** → classify as `Orphaned CDK Framework` — fix is "manually delete via AWS CLI", include in delete loop
- **Does not match CDK framework patterns** → classify as `Deprecated Runtime` — include in delete loop

### Step 6: Present results

Display results grouped by region and bucket:

```
Region: us-west-2
────────────────────────────────────────────────────────────
BUCKET                        FUNCTION NAME                            RUNTIME
Orphaned CDK Framework        cmn-foo-ProviderframeworkonEvent-abc123  nodejs18.x
CDK Framework (active)        cmn-foo-IsCompleteHandler-xyz789         nodejs18.x
Deprecated Runtime            api-get-policy-info                      nodejs18.x

Region: us-east-1
────────────────────────────────────────────────────────────
...

Summary:
  Orphaned CDK Framework : N  → delete via AWS CLI
  CDK Framework (active) : N  → upgrade aws-cdk-lib + redeploy
  Deprecated Runtime     : N  → upgrade to nodejs24.x or delete if unused

Total: N deprecated Lambda(s) found across both regions.
```

### Step 7: Write delete scripts and display them

Only include Lambdas classified as `Orphaned CDK Framework` or `Deprecated Runtime`. Do NOT include `CDK Framework (active)` Lambdas. Do NOT execute the scripts — only write and display them.

For each region that has results, write a file named `<AWS_PROFILE>_<region>_deprecated.sh` in the current directory. Each file must be a valid single-line-per-command bash script (no line continuations that could break on paste) with comments explaining each Lambda and any suggested actions.

File format:

```bash
#!/bin/bash
# Deprecated Lambda cleanup — <AWS_PROFILE> / <REGION>
# Generated: <date>
# Profile:   <AWS_PROFILE>
# Region:    <REGION>
#
# REVIEW BEFORE RUNNING. This script deletes all Lambdas classified as
# Orphaned CDK Framework or Deprecated Runtime.
#
# Orphaned CDK Framework Lambdas (safe to delete — not in any active CDK stack):
#   These are leftover CDK internal constructs (ProviderFramework, LogRetention, etc.)
#   from stacks that no longer synthesize them. Nothing will recreate them.
#
# Deprecated Runtime Lambdas (confirm with team before deleting):
#   These are application Lambdas with deprecated runtimes. Deleting removes them
#   permanently. Consider upgrading the runtime (nodejs24.x) instead
#   of deleting unless the Lambda is confirmed unused.
#
# CDK Framework (active) Lambdas are NOT included here.
#   Fix: upgrade aws-cdk-lib in the CDK stack and run cdk deploy.

set -e

# --- Orphaned CDK Framework ---
# Safe to delete. cdk.out cross-check found no active stack claiming these.
AWS_PROFILE=<AWS_PROFILE> aws lambda delete-function --function-name "<fn>" --region <REGION> && echo "Deleted: <fn>"

# --- Deprecated Runtime ---
# WARNING: Application Lambda — confirm unused or upgrade runtime before deleting.
# Suggested fix: update runtime to nodejs24.x in the Lambda config or CDK stack.
AWS_PROFILE=<AWS_PROFILE> aws lambda delete-function --function-name "<fn>" --region <REGION> && echo "Deleted: <fn>"
```

After writing the files, tell the user:
- The filenames written (one per region with results)
- How to run them: `bash <filename>`
- A reminder that `Deprecated Runtime` Lambdas are application Lambdas — confirm with the team before running
