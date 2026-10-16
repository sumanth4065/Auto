---
name: get-test-policy
description: "Find QA test policies from the latest test-data snapshots. Translates natural-language requests (e.g. 'get me an OH auto Guidewire policy') into qa-test-data CLI commands and returns key policy details (login, policy number, named insured, DOB, etc.)."
trigger: when user mentions "test policy", "QA policy", "qa-test-data", "get me a policy", or "find a policy for testing". NOT for live UAT API calls — use gw-api for Guidewire REST queries.
arguments: [query]
allowed-tools: Bash(npx *) Bash(qa-test-data *) Bash(ls *) Bash(find *) Read
---

# Get Test Policy — $query

You help users find QA test policies by translating their natural-language request into `qa-test-data` CLI commands.

**Use this skill** when you need a test policy from the QA snapshot dataset (offline fixture data).
**Use `gw-api` instead** when querying a live UAT policy/account via Guidewire REST API.

---

## Step 0 — Verify CLI is available

Check if the CLI is accessible:

```bash
npx @ace-clublabs/qa-test-data help 2>/dev/null | head -3
```

If the command fails, tell the user:

> The `@ace-clublabs/qa-test-data` package is not available. Install it:
> ```bash
> npm install -g @ace-clublabs/qa-test-data
> ```
> Or ensure your `.npmrc` has `@ace-clublabs:registry=https://npm.pkg.github.com` and you have a valid `GITHUB_TOKEN`.

Do not proceed until the CLI is confirmed working.

---

## Step 1 — Check for data

Verify snapshot data exists:

```bash
npx @ace-clublabs/qa-test-data find -p a -n 1 2>&1 | head -3
```

If the output says "No snapshot directories found" or similar, fetch the latest data:

```bash
npx @ace-clublabs/qa-test-data fetch -m
```

This downloads the current month's test-data artifacts from GitHub Actions. Requires `gh` CLI to be authenticated.

---

## Step 2 — Parse the user's request

Interpret `$query` to determine which filters to apply. Map natural language to these flags:

### Product (`-p`)
| User says | Flag | Notes |
|-----------|------|-------|
| auto | `-p a` | |
| home / homeowners | `-p h` | |
| condo | `-p h` | Stored as HOME sub-type in PolicyCenter |
| tenant / renters | `-p h` | Stored as HOME sub-type in PolicyCenter |
| umbrella | `-p u` | |
| watercraft / boat | `-p w` | |
| earthquake | `-p e` | |
| classic car | `-p cc` | |
| life | `-p l` | |
| assigned risk | `-p ar` | |
| membership (only) | `-p m -mo` | Use with `-mo` flag for membership-only customers |

Multiple products can be comma-separated: `-p a,h`

### Tenant / Backend System (`-t`)
| User says | Flag |
|-----------|------|
| guidewire / GW | `-t g` |
| huon | `-t h` |
| policystar / pstar | `-t p` |

Multiple tenants can be comma-separated: `-t h,g`

### Club / State (`-c`)
| User says | Flag | Code |
|-----------|------|------|
| AL / Alabama | `-c al` | 001 |
| CA / California / SoCal | `-c ca` | 004 |
| HI / Hawaii | `-c hi` | 018 |
| NNE / Northern New England | `-c nne` | 036 |
| MO / Missouri | `-c mo` | 065 |
| NH / Northampton | `-c nh` | 188 |
| OH / Ohio / East Central | `-c ec` | 215 |
| ANE / Atlantic Northeast | `-c ane` | 240 |
| TX / Texas | `-c tx` | 252 |
| TW / Tidewater | `-c tw` | 258 |
| WA / Washington | `-c wa` | 260 |
| NM / New Mexico | `-c nm` | 601 |

### Policy Status (`-ps`)
| User says | Flag |
|-----------|------|
| in force / active | `-ps 'in force'` |
| cancelled / canceled | `-ps cancel` |
| not cancelled | `-ps '!cancel'` |

Multiple statuses comma-separated; prefix `!` to exclude.

### Customer/Membership Status (`-cs`)
| User says | Flag |
|-----------|------|
| impaired | `-cs impaired` |
| non-renewed | `-cs non-renewed` |
| renew | `-cs renew` |
| in force | `-cs 'in force'` |
| not impaired | `-cs '!impaired'` |

Multiple values comma-separated; prefix `!` to exclude.

### Additional filters
| User says | Flag |
|-----------|------|
| with IQ / insurance questionnaire needed | `-iq` |
| multiple drivers / N drivers | `-dr N` |
| N vehicles | `-v N` |
| converted from huon | `-cif h` |
| converted to guidewire | `-cit g` |
| any conversion | `-ci` |
| converted from policystar to guidewire | `-cif p -cit g` |
| policy prefix ACA | `-pf ACA` |
| with DOB / has date of birth | `-dob` |
| DOB matches 11/07/02 | `-dob 11/07/02` |
| N+ named insureds | `-ni N+` |
| exactly N named insureds | `-ni N` |
| membership-only (no policies) | `-mo` |
| expiration date | `-pe mm/dd/yy` (supports `*` wildcard) |
| term start date | `-ts mm/dd/yy` (supports `*` wildcard) |
| term end date | `-te mm/dd/yy` (supports `*` wildcard) |

### Snapshot date selection
| User says | Flag |
|-----------|------|
| from today / latest | (no flag needed — default) |
| from this month | `-m` |
| from last month | `-m -1` |
| from N months ago | `-m -N` |
| from this week | `-w` |
| from last week | `-w -1` |
| from a specific date | `-d MMDDYYYY` or `-d YYYYMMDD` |
| from N days ago | `-d -N` |
| all this year | `-y` |

### Output options
| User says | Flag |
|-----------|------|
| random / shuffle | `-r` |
| show all (including duplicates) | `-a` |
| show snapshot column | `-ss` |

### Defaults
- If the user does not specify a status, add `-ps '!cancel'` to exclude cancelled policies
- Always request output columns: `-o p,l,fn,ln,d,ps`
- Limit to 5 results: `-n 5`
- Use the latest snapshot (no date flag needed)

---

## Step 3 — Run the find command

Construct and execute the command:

```bash
npx @ace-clublabs/qa-test-data find <filters> -ps '!cancel' -o p,l,fn,ln,d,ps -n 5
```

Examples:
```bash
# OH auto Guidewire policy
npx @ace-clublabs/qa-test-data find -p a -t g -c ec -ps '!cancel' -o p,l,fn,ln,d,ps -n 5

# CA home converted from Huon to Guidewire
npx @ace-clublabs/qa-test-data find -p h -c ca -cif h -cit g -ps '!cancel' -o p,l,fn,ln,d,ps -n 5

# Auto policy with 3+ named insureds
npx @ace-clublabs/qa-test-data find -p a -ni 3+ -ps '!cancel' -o p,l,fn,ln,d,ps -n 5

# Random TX auto with DOB
npx @ace-clublabs/qa-test-data find -p a -c tx -dob -r -ps '!cancel' -o p,l,fn,ln,d,ps -n 5

# Policies with prefix ACA from this week
npx @ace-clublabs/qa-test-data find -pf ACA -w -ps '!cancel' -o p,l,fn,ln,d,ps -n 5
```

If the command returns no results:
1. Try relaxing filters (remove club first, then status)
2. Try fetching a broader date range: `npx @ace-clublabs/qa-test-data fetch -m` then re-run
3. Report to the user what was tried and that no matching policies exist in current snapshots

---

## Step 4 — Get full details for the best match

Take the first result from Step 3 and run `get` to retrieve complete details:

```bash
npx @ace-clublabs/qa-test-data get <productId>
```

This outputs a comprehensive summary including all named insureds, billing info, and policy status.

---

## Step 5 — Present results

Format the response as a clean summary card:

```
## Test Policy Found

| Field | Value |
|-------|-------|
| **Policy Number** | <productId> |
| **Login (username)** | <username> |
| **Named Insured** | <firstName> <lastName> |
| **Date of Birth** | <dateOfBirth> |
| **Policy Type** | <policyType> (<tenant>) |
| **Club** | <clubCode> |
| **Status** | <currentStatus> |
| **Term** | <termInceptionDate> - <expirationDate> |
```

If the user's request implies they need multiple policies (e.g. "get me 3 policies"), show a table of all results instead of just the first.

### Additional fields to include when relevant:
- **Member Number** — if the user is testing membership flows
- **Billing Info** — if the user mentions billing or payments
- **Vehicles** — if the user mentions vehicles or auto
- **Drivers** — if the user asks for multiple drivers
- **IQ Status** — if the user mentions insurance questionnaire
- **Conversion Info** — if the user is testing migration scenarios
- **Named Insured Count** — if the user filtered by `-ni`
- **ZIP** — if the user mentions location or address testing

---

## Step 6 — Offer follow-up options

After presenting results, mention:

> Need a different policy? I can:
> - Search with different criteria (different state, product, status)
> - Show more results from this search
> - Get full details on any of the other matches
> - Fetch newer snapshot data if these are stale
> - Search a specific snapshot date (`-d MMDDYYYY` or `-m -N`)

---

## Reference: Common Requests

| Natural language | Translated command |
|------------------|--------------------|
| "OH auto GW policy" | `find -p a -t g -c ec -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
| "CA home Guidewire" | `find -p h -t g -c ca -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
| "any active auto policy" | `find -p a -ps 'in force' -o p,l,fn,ln,d,ps -n 5` |
| "TX auto with 3 drivers" | `find -p a -c tx -dr 3 -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
| "home policy converted from Huon" | `find -p h -cif h -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
| "policy with IQ needed" | `find -iq -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
| "Guidewire umbrella NNE" | `find -p u -t g -c nne -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
| "Alabama PolicyStar home" | `find -p h -t p -c al -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
| "random CA auto with DOB" | `find -p a -c ca -dob -r -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
| "auto with 2+ named insureds" | `find -p a -ni 2+ -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
| "Huon+GW home in Texas" | `find -p h -t h,g -c tx -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
| "policies from last week" | `find -w -1 -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
| "prefix ACA auto" | `find -p a -pf ACA -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
| "converted from Huon to GW" | `find -cif h -cit g -ps '!cancel' -o p,l,fn,ln,d,ps -n 5` |
