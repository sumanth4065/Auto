---
name: gw-api
description: Query the Guidewire UAT PolicyCenter REST API — policy lookup, account lookup, contacts/DOB, and API discovery.
trigger: when user mentions "gw api", "UAT API", "guidewire REST", "guidewire curl", or uses /gw-api. NOT for test-policy snapshots — use get-test-policy for QA fixture data.
context_weight: lightweight
---

# gw-api

Executes Guidewire UAT REST API calls directly using `curl`.

**Use this skill** when querying a live UAT policy/account via Guidewire REST.
**Use `get-test-policy` instead** when you need a test policy from the QA snapshot dataset.

## Environment

- **UAT1 (default):** `https://pc-uat1-gwcpdev.acsc.beta3-andromeda.guidewire.net`
- **UAT2:** `https://pc-uat2-gwcpdev.acsc.beta3-andromeda.guidewire.net`
- **Auth:** `$GW_CREDENTIALS` environment variable (format: `user:pass`)

Use `uat2` anywhere in arguments to switch to UAT2. Default is UAT1.

### Required Setup

The `GW_CREDENTIALS` env var must be set before using this skill. If unset, stop and tell the user:

> Set `GW_CREDENTIALS` in your shell profile or current session:
> ```bash
> export GW_CREDENTIALS="acesu:gw"
> ```

Do not proceed with any curl call if `GW_CREDENTIALS` is not available.

## Behavior

Always execute the curl command immediately via Bash. Capture the response into a variable, then pretty-print with `python3 -m json.tool`. Show the curl command before executing (credentials display as `$GW_CREDENTIALS`, never the literal value).

**DOB formatting:** Any field named `dob_ext` or `dateOfBirth` contains ISO dates (`yyyy-mm-dd`). After displaying raw JSON, reformat and display DOB values as `mm/dd/yyyy` in a summary table.

For all curl calls use:
- `-sf` (silent + fail on HTTP errors)
- `-u "$GW_CREDENTIALS"`
- `-H "Content-Type: application/json"` for POST/PATCH

**Error handling:** If curl exits non-zero, report the HTTP error to the user and suggest checking credentials/endpoint rather than piping garbage to json.tool.

**Response capture pattern** (use for all calls):
```bash
RESPONSE=$(curl -sf -u "$GW_CREDENTIALS" ... "${HOST}/rest/...")
if [ $? -ne 0 ]; then echo "HTTP error — check credentials and endpoint"; exit 1; fi
echo "$RESPONSE" | python3 -m json.tool
```

## Operations

### 1. List APIs  (`/gw-api apis`)

```bash
RESPONSE=$(curl -sf -u "$GW_CREDENTIALS" "${HOST}/rest/apis")
echo "$RESPONSE" | python3 -m json.tool
```

### 2. Policy lookup by policy number (`/gw-api policy <policyNumber>`)

**Best for getting customerId + DOB — use `policy-details-ext` first:**

```bash
RESPONSE=$(curl -sf -u "$GW_CREDENTIALS" \
  "${HOST}/rest/aaa/policy/v1/policies/getinfo/policy-details-ext?policyNumber=${POLICY_NUMBER}")
echo "$RESPONSE" | python3 -m json.tool
```

Returns `namedInsureds_ext[]` with `customerId_ext`, `dob_ext`, name, address. This is the preferred DOB source when you have a policy number.

For auto IQ vehicle details:

```bash
RESPONSE=$(curl -sf -u "$GW_CREDENTIALS" "${HOST}/rest/aaa/policy/v1/policies/${POLICY_NUMBER}/auto-iq-details-ext")
echo "$RESPONSE" | python3 -m json.tool
```

For home IQ details, use `home` keyword:

```bash
RESPONSE=$(curl -sf -u "$GW_CREDENTIALS" "${HOST}/rest/aaa/policy/v1/policies/${POLICY_NUMBER}/home-iq-details-ext")
echo "$RESPONSE" | python3 -m json.tool
```

### 3. Account lookup by customerId_ext (`/gw-api account <customerId_ext>`)

Resolves accountID_ext from a customerId_ext:

```bash
BODY=$(python3 -c "import json,sys; print(json.dumps({'customerId_ext': sys.argv[1]}))" -- "$CUSTOMER_ID")
RESPONSE=$(curl -sf -u "$GW_CREDENTIALS" \
  -H "Content-Type: application/json" \
  -d "$BODY" \
  "${HOST}/rest/aaa/account/v1/search-by-customer-id-ext")
echo "$RESPONSE" | python3 -m json.tool
```

### 4. Contacts / DOB (`/gw-api contacts <accountID_ext>`)

Returns all contacts on the account including `dateOfBirth`.

```bash
RESPONSE=$(curl -sf -u "$GW_CREDENTIALS" "${HOST}/rest/account/v1/accounts/${ACCOUNT_ID}/contacts")
echo "$RESPONSE" | python3 -m json.tool
```

### 5. Full DOB workflow (`/gw-api dob <customerId_ext>`)

Chains account lookup -> contacts automatically:
1. POST `search-by-customer-id-ext` with the customerId_ext -> extract `accountID_ext`
2. GET `accounts/{accountID_ext}/contacts` -> display contacts with DOB

Execute both steps sequentially. Capture step 1's response, extract `accountID_ext`, then run step 2:

```bash
BODY=$(python3 -c "import json,sys; print(json.dumps({'customerId_ext': sys.argv[1]}))" -- "$CUSTOMER_ID")
RESPONSE=$(curl -sf -u "$GW_CREDENTIALS" \
  -H "Content-Type: application/json" \
  -d "$BODY" \
  "${HOST}/rest/aaa/account/v1/search-by-customer-id-ext")
echo "$RESPONSE" | python3 -m json.tool
ACCOUNT_ID=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['accountID_ext'])")

RESPONSE2=$(curl -sf -u "$GW_CREDENTIALS" "${HOST}/rest/account/v1/accounts/${ACCOUNT_ID}/contacts")
echo "$RESPONSE2" | python3 -m json.tool
```

**Note:** If you have a policy number instead of a customerId_ext, use `/gw-api policy <policyNumber>` — `policy-details-ext` returns DOB directly without needing the account chain.

### 6. Account policies (`/gw-api policies <accountID_ext>`)

```bash
RESPONSE=$(curl -sf -u "$GW_CREDENTIALS" "${HOST}/rest/account/v1/accounts/${ACCOUNT_ID}/policies")
echo "$RESPONSE" | python3 -m json.tool
```

### 7. Swagger spec for an API (`/gw-api swagger <api-path>`)

`<api-path>` examples: `aaa/policy/v1`, `aaa/account/v1`, `account/v1`

```bash
RESPONSE=$(curl -sf -u "$GW_CREDENTIALS" "${HOST}/rest/${API_PATH}/swagger.json")
echo "$RESPONSE" | python3 -m json.tool
```

To list only endpoints:

```bash
curl -sf -u "$GW_CREDENTIALS" "${HOST}/rest/${API_PATH}/swagger.json" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); [print(m.upper(), p) for p,ops in d.get('paths',{}).items() for m in ops if m in ['get','post','put','patch','delete']]" \
  | sort
```

## Keyword / Shorthand Mapping

| Keyword / arg    | Operation                          |
|------------------|------------------------------------|
| `apis`           | List all APIs                      |
| `policy <num>`   | Policy details + DOB for named insureds |
| `policy <num> auto` | Auto IQ vehicle details         |
| `policy <num> home` | Home IQ details for policy      |
| `account <id>`   | Search account by customerId_ext   |
| `contacts <id>`  | Account contacts (needs accountID_ext) |
| `dob <id>`       | Full DOB workflow from customerId_ext |
| `policies <id>`  | Policies on account (needs accountID_ext) |
| `swagger <path>` | Fetch/list endpoints for an API    |
| `uat2`           | Use UAT2 instead of UAT1           |

## PII Reminder

`dateOfBirth` and account numbers are PII. Values displayed in this session are captured in Claude conversation history (persisted server-side and locally in `~/.claude/`). Do not display PII unless the user has confirmed this is acceptable for their session.
