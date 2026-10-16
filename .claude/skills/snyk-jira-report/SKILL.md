---
name: snyk-jira-report
description: "Orchestrates snyk-build-report → jira-clone-ticket: runs a Snyk SCA scan across repos matching a prefix, creates one Jira ticket per repo that has findings, and prints a summary table of all created tickets."
arguments: [prefix, source_ticket]
allowed-tools: Bash(gh *) Bash(python3 *) Bash(jq *) Bash(echo *) Bash(printf *) Bash(curl *) Bash(cat *) Bash(rm *) Read Write
---

# Snyk Jira Report — $prefix

Orchestrates three skills end-to-end:

1. **snyk-build-report** — scans ACE-Clublabs repos matching **`$prefix`**, extracts Snyk SCA findings per repo
2. **jira-clone-ticket** — for each repo with findings, writes a markdown description file and creates a Jira ticket cloned from **`$source_ticket`**
3. **Summary** — prints a table of all created Jira ticket URLs

- **`$prefix`** — repo name prefix to scan (e.g. `cfc`, `billing`, `cci`)
- **`$source_ticket`** — Jira ticket to clone metadata from (e.g. `ISS-17561` or full URL)

---

## Prerequisites

### GitHub CLI
```bash
gh auth status
```
If not authenticated, stop and tell the user: run `gh auth login` first.

### Jira credentials
```bash
python3 -c "
import os, sys
missing = [v for v in ['JIRA_URL','JIRA_EMAIL','JIRA_API_TOKEN'] if not os.environ.get(v)]
if missing:
    print('Missing env vars:', missing)
    sys.exit(1)
print('OK - JIRA_URL:', os.environ['JIRA_URL'])
"
```
If any are missing, stop and tell the user which variable to set.

---

## Phase 1 — Run snyk-build-report

Invoke the `snyk-build-report` skill with **`$prefix`** to produce the full vulnerability report. Follow every step in that skill exactly (Steps 1–6).

Collect the per-repo findings into a structured list. For each repo, record:
- `repo_name` — e.g. `repo-billing`
- `workflow_file` — e.g. `billing-build-pipeline.yml`
- `run_id` — GitHub Actions run ID
- `branch` — branch name
- `findings` — array of vulnerability objects (title, severity, package, introduced_by, fix, snyk_id)
- `skipped` — boolean, true if the repo was skipped (no Build workflow / no BuildPipelineJob / no Snyk step)
- `clean` — boolean, true if no vulnerabilities found

After Phase 1, print the snyk-build-report output in full so the user can review it before tickets are created.

Then ask the user:
> "Found findings in N repo(s). Proceed to create Jira tickets?"

Wait for confirmation before continuing to Phase 2.

---

## Phase 2 — Create one Jira ticket per repo with findings

For each repo where `skipped = false` AND `clean = false` (i.e. has real findings):

### Step 2a — Write the description markdown file

Write a temporary markdown file at `/tmp/snyk-<repo_name>-<run_id>.md` with this structure:

```markdown
# Snyk SCA Vulnerabilities — <repo_name>

Automated vulnerability report generated from GitHub Actions run [#<run_id>](https://github.com/ACE-Clublabs/<repo_name>/actions/runs/<run_id>) on branch `<branch>`.

## Summary

**<total_count> vulnerabilities found** (<high_count> High · <medium_count> Medium · <low_count> Low)

## Findings

| # | Snyk ID | Severity | Vulnerability | Package / Introduced By | Fix |
|---|---------|----------|---------------|------------------------|-----|
<one row per finding>

## Affected Repository

- **Repo:** [ACE-Clublabs/<repo_name>](https://github.com/ACE-Clublabs/<repo_name>)
- **Workflow:** `<workflow_file>`
- **Run:** [#<run_id>](https://github.com/ACE-Clublabs/<repo_name>/actions/runs/<run_id>)
- **Branch:** `<branch>`
- **Scanned:** <today's date YYYY-MM-DD>
```

Use this python3 snippet to write the file:

```bash
python3 - << 'PYEOF'
import json, os
from datetime import date

repo_name    = '<REPO_NAME>'
run_id       = '<RUN_ID>'
branch       = '<BRANCH>'
workflow     = '<WORKFLOW_FILE>'
findings     = <FINDINGS_JSON>   # list of dicts from Phase 1

high   = [f for f in findings if 'high'   in f.get('severity','').lower()]
medium = [f for f in findings if 'medium' in f.get('severity','').lower()]
low    = [f for f in findings if 'low'    in f.get('severity','').lower()]

rows = []
for i, f in enumerate(findings, 1):
    snyk_id  = f.get('snyk_id', '-')
    severity = f.get('severity', '-')
    title    = f.get('title', '-')
    pkg      = f.get('introduced_by') or f.get('package', '-')
    fix      = f.get('fix', '-')
    rows.append(f'| {i} | {snyk_id} | **{severity}** | {title} | `{pkg}` | {fix} |')

table = '\n'.join(rows)
today = date.today().strftime('%Y-%m-%d')
gh_base = f'https://github.com/ACE-Clublabs/{repo_name}'

content = f"""# Snyk SCA Vulnerabilities — {repo_name}

Automated vulnerability report generated from GitHub Actions run [#{run_id}]({gh_base}/actions/runs/{run_id}) on branch `{branch}`.

## Summary

**{len(findings)} vulnerabilities found** ({len(high)} High · {len(medium)} Medium · {len(low)} Low)

## Findings

| # | Snyk ID | Severity | Vulnerability | Package / Introduced By | Fix |
|---|---------|----------|---------------|------------------------|-----|
{table}

## Affected Repository

- **Repo:** [ACE-Clublabs/{repo_name}]({gh_base})
- **Workflow:** `{workflow}`
- **Run:** [#{run_id}]({gh_base}/actions/runs/{run_id})
- **Branch:** `{branch}`
- **Scanned:** {today}
"""

filepath = f'/tmp/snyk-{repo_name}-{run_id}.md'
with open(filepath, 'w') as fh:
    fh.write(content)
print(f'WRITTEN={filepath}')
PYEOF
```

### Step 2b — Clone the Jira ticket

Invoke the `jira-clone-ticket` skill with:
- `source_ticket` = **`$source_ticket`**
- `description_file` = the path written in Step 2a

Follow every step in the `jira-clone-ticket` skill exactly (Steps 1–5). Capture the URL of the newly created ticket.

### Step 2c — Clean up temp file

```bash
rm -f /tmp/snyk-<repo_name>-<run_id>.md
```

### Step 2d — Record the result

For each repo, record:
- `repo_name`
- `jira_url` — the URL returned by jira-clone-ticket
- `jira_key` — the bare key (e.g. `ISS-17562`)
- `finding_count` — total vulnerabilities
- `high_count`, `medium_count`, `low_count`

If ticket creation fails for a repo, record the error and continue to the next repo — do not abort the entire run.

---

## Phase 3 — Print the summary table

After processing all repos, print:

```
## Snyk → Jira Ticket Summary

Repos scanned:        <N>
Repos with findings:  <N>
Tickets created:      <N>
Ticket errors:        <N>

| Repo | Findings | High | Medium | Low | Jira Ticket |
|------|----------|------|--------|-----|-------------|
| repo-billing | 3 | 2 | 1 | 0 | [ISS-17562](https://autoclub.atlassian.net/browse/ISS-17562) |
| repo-cci     | 1 | 0 | 1 | 0 | [ISS-17563](https://autoclub.atlassian.net/browse/ISS-17563) |
```

For repos that were clean (no findings), add a line below the table:

```
Clean repos (no ticket created): repo-foo, repo-bar
```

For repos that were skipped:

```
Skipped repos (no Build workflow or no Snyk step): repo-baz
```

For any ticket creation errors:

```
Ticket creation errors:
  - repo-qux: <error message>
```

---

## Notes

- This skill is a sequential orchestrator — it invokes `snyk-build-report` then `jira-clone-ticket` in order. Each skill's own prerequisites (GitHub CLI auth, Jira env vars) must be satisfied before this skill runs.
- One ticket is created **per repo**, not per individual vulnerability. All findings for a repo are consolidated into a single ticket description.
- The temp markdown files at `/tmp/snyk-<repo>-<run_id>.md` are deleted after each ticket is created.
- Requires the same env vars as both sub-skills: `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, and `gh` CLI authenticated to `ACE-Clublabs`.
- The skill always asks for confirmation after Phase 1 before creating any Jira tickets.
