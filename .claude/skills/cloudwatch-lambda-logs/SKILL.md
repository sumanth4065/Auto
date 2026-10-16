---
name: cloudwatch-lambda-logs
description: "Pull CloudWatch logs for a Lambda function in any workload/environment. Resolves the AWS profile and log group automatically, filters by user-supplied criteria (correlationId, sessionId, requestId, or free text), and saves raw .log and parsed JSON to cloudwatchlogs/{workloadName}/."
trigger: when user mentions "cloudwatch logs", "lambda logs", "pull logs", "get logs for", "cwlogs", or uses /cloudwatch-lambda-logs
arguments: [query]
allowed-tools: Bash Read Write
---

# CloudWatch Lambda Logs — $query

You help users pull CloudWatch logs for Lambda functions across ACE workloads.

---

## Step 0 — Parse the user's request

Extract from `$query`:

| Field | Description | Example |
|-------|-------------|---------|
| **workload** (required) | The workload name — maps to an AWS profile | `uatcommonutils`, `uatinsuranceclaims` |
| **resource** (optional) | The Lambda function name or partial name | `common-utils-send-email-v2`, `send-email` |
| **filters** (optional) | One or more values to filter logs by | correlationId, sessionId, requestId, free text |
| **time range** (optional) | How far back to search | `1h`, `6h`, `1d`, `7d` (default: `7d`) |

### Workload-to-profile mapping

AWS profiles follow the pattern: `{env}-{workload}-ebiz-cloud-devops`

The user may supply the workload as a combined string (e.g., `uatcommonutils`). Parse the environment prefix:

| Prefix in workload | Environment |
|---------------------|-------------|
| `uat` | `uat` |
| `dev` | `dev` |
| `qa` | `qa` |
| `prod` | `prod` |
| `stage` | `stage` |

Split the workload string into `{env}` and `{workloadName}`. Examples:
- `uatcommonutils` → env=`uat`, workload=`commonutils`, profile=`uat-commonutils-ebiz-cloud-devops`
- `prodinsuranceclaims` → env=`prod`, workload=`insuranceclaims`, profile=`prod-insuranceclaims-ebiz-cloud-devops`
- `devcommonservices` → env=`dev`, workload=`commonservices`, profile=`dev-commonservices-ebiz-cloud-devops`

If the split is ambiguous, list matching profiles and ask the user to confirm:

```bash
aws configure list-profiles 2>/dev/null | grep -i "<partial>"
```

### Time range parsing

Convert the user's time range to a `--start-time` epoch in milliseconds:

| User says | Milliseconds calculation |
|-----------|--------------------------|
| `1h` / last hour | `(now - 3600) * 1000` |
| `6h` / last 6 hours | `(now - 21600) * 1000` |
| `1d` / today / last day | `(now - 86400) * 1000` |
| `7d` / last week (default) | `(now - 604800) * 1000` |
| `30d` / last month | `(now - 2592000) * 1000` |

---

## Step 1 — Validate the AWS profile

```bash
aws sts get-caller-identity --profile <profile> 2>&1
```

If this fails, suggest the user authenticate:
> Profile `<profile>` is not authenticated. Run: `! aws sso login --profile <profile>`

---

## Step 2 — Find the log group

If the user supplied a full resource name, try directly:

```bash
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/lambda/<resource>" \
  --region us-west-2 \
  --profile <profile> \
  --query "logGroups[].logGroupName" --output text
```

If the user supplied a partial name or no resource name, search:

```bash
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/lambda/" \
  --region us-west-2 \
  --profile <profile> \
  --query "logGroups[].logGroupName" --output text \
  | tr '\t' '\n' | grep -i "<partial>"
```

If multiple log groups match, present them and ask the user to pick one.
If no match is found, list all log groups and let the user choose.

---

## Step 3 — Query CloudWatch logs

Build the filter command. If the user provided filter values, use `filter-log-events` with a `--filter-pattern`:

```bash
aws logs filter-log-events \
  --log-group-name "<log-group>" \
  --filter-pattern '"<filter-value>"' \
  --region us-west-2 \
  --profile <profile> \
  --start-time <epoch-ms> \
  --output json
```

If no filter values were provided, use `get-log-events` on recent streams or `filter-log-events` with no pattern (last N minutes).

**Multiple filter values:** If the user provided multiple IDs (e.g., correlationId AND sessionId), pick one to filter on — CloudWatch filter patterns are AND-based so either ID will match the relevant invocations. Prefer correlationId if available as it's most specific to a single request.

**Timeout:** CloudWatch queries on large log groups can take time. Use a 60-second timeout. If the query times out, narrow the time range and retry.

---

## Step 4 — Save output files

Create the output directory:

```bash
mkdir -p cloudwatchlogs/<workloadName>
```

Where `<workloadName>` is the user's original combined workload string (e.g., `uatcommonutils`).

### File naming

Use the pattern: `{lambda-name}_{primary-filter-value}`

If no filter was supplied, use a timestamp: `{lambda-name}_{YYYY-MM-DDTHH-MM-SS}`

### 4a — Raw log file (`.log`)

Write each event's `message` field as a plain text line:

```python
for evt in events:
    out.write(evt["message"])
    if not evt["message"].endswith("\n"):
        out.write("\n")
```

Output: `cloudwatchlogs/<workloadName>/<name>.log`

### 4b — Parsed JSON messages (`.json`)

Each log line is tab-delimited: `timestamp\trequestId\tLEVEL\t{json}`

Extract the last tab-delimited field from each line, parse it as JSON, and collect all parsed objects into a single JSON array:

```python
import json

results = []
with open(log_path) as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) >= 4:
            try:
                results.append(json.loads(parts[-1]))
            except json.JSONDecodeError:
                pass

with open(json_path, "w") as f:
    json.dump(results, f, indent=2)
```

Output: `cloudwatchlogs/<workloadName>/<name>_messages.json`

---

## Step 5 — Present results

After saving, report:

1. **Event count** — total log events found
2. **Time span** — earliest to latest timestamp
3. **Files saved** — full local paths to both files
4. **Quick summary** — invocation count, any errors found, key log messages (e.g., "Successfully sent email to X")

Format:

```
## CloudWatch Logs Retrieved

| Field | Value |
|-------|-------|
| **Log group** | /aws/lambda/<name> |
| **Filter** | <filter-value> |
| **Events** | <count> |
| **Time span** | <first-timestamp> → <last-timestamp> |
| **Invocations** | <count> (by distinct requestId) |
| **Errors** | <count or "none"> |

### Files
- `cloudwatchlogs/<workload>/<name>.log` — raw log lines
- `cloudwatchlogs/<workload>/<name>_messages.json` — parsed JSON array (<count> objects)
```

If errors or exceptions were found in the logs, highlight them in a separate section.

---

## Step 6 — Offer follow-up

After presenting results, mention:

> I can also:
> - Search with different filters or a narrower time range
> - Pull logs for a different Lambda in this workload
> - Show specific log entries (e.g., just the request payload or the outbound API call)
> - Summarize the request/response flow from these logs

---

## Reference: Common Workloads

| Shorthand | Profile pattern |
|-----------|-----------------|
| `uatcommonutils` | `uat-commonutils-ebiz-cloud-devops` |
| `prodcommonutils` | `prod-commonutils-ebiz-cloud-devops` |
| `uatinsuranceclaims` | `uat-insuranceclaims-ebiz-cloud-devops` |
| `uatcommonservices` | `uat-commonservices-ebiz-cloud-devops` |
| `uatcommonmembership` | `uat-commonmembership-ebiz-cloud-devops` |
| `uatcommoninsurance` | `uat-commoninsurance-ebiz-cloud-devops` |
| `uatcommoncustomer` | `uat-commoncustomer-ebiz-cloud-devops` |
| `uatinsurancepolicyinfo` | `uat-insurancepolicyinfo-ebiz-cloud-devops` |
| `uatidentity` | `uat-identity-ebiz-cloud-devops` |
| `uatrouting` | `uat-routing-ebiz-cloud-devops` |

## Region

Default region is `us-west-2`. If the user specifies a different region, use that instead.
