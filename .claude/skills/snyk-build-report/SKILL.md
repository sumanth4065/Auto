---
name: snyk-build-report
description: "Scans GitHub Actions Build workflows across ACE-Clublabs repos matching a name prefix, extracts Snyk SCA findings from the most recent BuildPipeline / BuildPipelineJob run per matched repo, and produces a tabulated vulnerability report."
arguments: [prefix]
allowed-tools: Bash(gh *) Bash(python3 *) Bash(jq *) Bash(echo *) Bash(printf *)
---

# Snyk Build Report — $prefix

Queries `https://github.com/ACE-Clublabs` for repositories whose names contain **`$prefix`**, inspects the most recent GitHub Actions **Build** workflow run for each matched repo, drills into the **BuildPipeline / BuildPipelineJob** job, and extracts any Snyk Node SCA findings. Produces a per-repo vulnerability table.

---

## Prerequisites

Verify `gh` CLI is available and authenticated:

```bash
gh auth status
```

If not authenticated, stop and tell the user:

> Run `gh auth login` to authenticate the GitHub CLI before using this skill.

---

## Step 1 — Discover matching repositories

List all repos in `ACE-Clublabs` whose name contains `$prefix` (case-insensitive):

```bash
gh repo list ACE-Clublabs --limit 200 --json name,nameWithOwner \
  | python3 -c "
import json, sys, re
prefix = '$prefix'.lower()
repos = json.load(sys.stdin)
matched = [r for r in repos if prefix in r['name'].lower()]
print(json.dumps(matched, indent=2))
"
```

If no repos match, stop and tell the user:

> No repositories found in ACE-Clublabs matching `$prefix`. Check the prefix spelling or your GitHub access.

Print the matched repo names for the user to confirm before proceeding.

---

## Step 2 — Find the most recent Build workflow run per repo

For each matched repo, list **all** workflows and pick every one whose filename contains the word `build` (case-insensitive):

```bash
gh workflow list \
  --repo ACE-Clublabs/<REPO_NAME> \
  --limit 100 \
  --json name,path \
  | python3 -c "
import json, sys
workflows = json.load(sys.stdin)
build_workflows = [w for w in workflows if 'build' in w['path'].lower()]
print(json.dumps(build_workflows, indent=2))
"
```

For each matched workflow file, fetch the most recent completed run:

```bash
gh run list \
  --repo ACE-Clublabs/<REPO_NAME> \
  --workflow <WORKFLOW_FILENAME> \
  --limit 5 \
  --json databaseId,status,conclusion,createdAt,headBranch,workflowName \
  | python3 -c "
import json, sys
runs = json.load(sys.stdin)
completed = [r for r in runs if r['status'] == 'completed']
print(json.dumps(completed[0] if completed else {}, indent=2))
"
```

If a repo has more than one build workflow, process each independently — each produces its own section in the final report.

Use the **first completed run** (any conclusion: success, failure, cancelled) — this is the run most likely to contain Snyk output.

If no workflow filename contains `build`, skip that repo and note it in the final report as:
> `<repo>` — no workflow file containing "build" found

---

## Step 3 — Locate the BuildPipeline / BuildPipelineJob job

For the run ID found in Step 2, list its jobs and locate the one named **BuildPipelineJob** (inside the **BuildPipeline** workflow call, or a standalone job whose name matches `BuildPipelineJob`):

```bash
gh run view <RUN_ID> \
  --repo ACE-Clublabs/<REPO_NAME> \
  --json jobs \
  | python3 -c "
import json, sys
data = json.load(sys.stdin)
jobs = data.get('jobs', [])
for j in jobs:
    print(j['name'], '|', j['databaseId'], '|', j['conclusion'])
"
```

Target the job whose name contains `BuildPipelineJob` (case-insensitive). If not found, look for a job containing both `build` and `pipeline` in its name. If still not found, skip this repo and note:

> `<repo>` — BuildPipelineJob not found in run #<RUN_ID>

---

## Step 4 — Extract the Snyk SCA step log

> **Important — reusable workflow log format:** When the `BuildPipelineJob` calls a shared reusable workflow (e.g. `cloud-ops_shared-workflows/.github/workflows/node-share-build-pipeline.yml`), GitHub Actions reports every step as `UNKNOWN STEP` in the tab-delimited log — there are no named step columns to filter on. Extraction must be done by **message content**, not step name.

Each log line has the format:
```
<job-name>\tUNKNOWN STEP\t<ISO-timestamp> <message>
```

Extract the SCA section by finding the `snyk test` command line and stopping at the `sca_ec` gate:

```bash
gh run view --repo ACE-Clublabs/<REPO_NAME> --job <JOB_ID> --log 2>/dev/null \
  | python3 -c "
import sys, re

ansi_re = re.compile(r'\x1b\[[0-9;]*m|\[[0-9;]*m')

def get_msg(line):
    parts = line.split('\t', 2)
    msg = parts[2] if len(parts) >= 3 else line
    msg = re.sub(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\s*', '', msg)
    return ansi_re.sub('', msg).strip()

lines = sys.stdin.readlines()
msgs  = [get_msg(l) for l in lines]

start_re = re.compile(r'snyk test.*--all-projects.*--fail-fast|snyk test.*--fail-fast.*--all-projects', re.IGNORECASE)
end_re   = re.compile(r'Run sca_ec|##\[group\]Run sca_ec', re.IGNORECASE)

in_section = False
section = []
for msg in msgs:
    if not in_section:
        if start_re.search(msg):
            in_section = True
    else:
        if end_re.search(msg):
            break
        section.append(msg)

print('\n'.join(section[:600]))
"
```

If the start pattern is not found, note:

> `<repo>/<workflow>` — `snyk test --all-projects --fail-fast` command not found in BuildPipelineJob log

---

## Step 5 — Parse Snyk findings from the log

Pass the extracted Snyk log section through this parser to identify individual vulnerabilities:

```bash
python3 - <<'PYEOF'
import sys, re, json

log_text = """<SNYK_LOG_SECTION>"""

# Patterns for Snyk text output (non-JSON mode)
vuln_block_re  = re.compile(r'✗\s+(.*?)\s+\[(.*?)\]', re.IGNORECASE)
package_re     = re.compile(r'introduced by\s+(.+)', re.IGNORECASE)
fix_re         = re.compile(r'fix(?:ed in|able via upgrade to)\s+(.+)', re.IGNORECASE)
path_re        = re.compile(r'from\s+(.+)', re.IGNORECASE)
snyk_id_re     = re.compile(r'(SNYK-[A-Z0-9-]+)', re.IGNORECASE)

findings = []
current = {}
for line in log_text.splitlines():
    m = vuln_block_re.search(line)
    if m:
        if current:
            findings.append(current)
        current = {
            'title':    m.group(1).strip(),
            'severity': m.group(2).strip(),
            'package':  '',
            'introduced_by': '',
            'fix': '',
            'snyk_id': '',
        }
        id_m = snyk_id_re.search(line)
        if id_m:
            current['snyk_id'] = id_m.group(1)
        continue
    if current:
        if package_re.search(line):
            current['introduced_by'] = package_re.search(line).group(1).strip()
        elif fix_re.search(line):
            current['fix'] = fix_re.search(line).group(1).strip()
        elif 'snyk_id' not in current or not current['snyk_id']:
            id_m = snyk_id_re.search(line)
            if id_m:
                current['snyk_id'] = id_m.group(1)

if current:
    findings.append(current)

print(json.dumps(findings, indent=2))
PYEOF
```

If the log section contains `No vulnerable paths found` or `tested ... no vulnerable paths` (case-insensitive), record zero findings for this repo — do not skip it; list it in the report as clean.

---

## Step 6 — Produce the report

After processing all matched repos, emit a consolidated report in this format:

---

### Snyk SCA Build Report for `<repo-name>`: `<YYYY-MM-DD>`

**Repos matched:** `<N>` | **Repos with issues:** `<N>`

---

For each repo **with findings**, print a section:

#### `ACE-Clublabs/<repo-name>`

| Repo | Workflow File | Run | Branch | Conclusion | Job |
|------|---------------|-----|--------|------------|-----|
| `<repo-name>` | `.github/workflows/<workflow-filename>.yml` | [#`<run-id>`](https://github.com/ACE-Clublabs/`<repo-name>`/actions/runs/`<run-id>`) | `<branch>` | `<conclusion>` | BuildPipelineJob |

**Vulnerabilities found: `<count>` (`<HIGH count>` High · `<MEDIUM count>` Medium · `<LOW count>` Low)**

| # | Snyk ID | Severity | Vulnerability | Package / Introduced By | Fix |
|---|---------|----------|---------------|------------------------|-----|
| 1 | SNYK-JS-XXX-123 | **High** | Prototype Pollution | `lodash@4.17.15` via `direct` | Upgrade to `4.17.21` |
| 2 | SNYK-JS-YYY-456 | Medium | ReDoS | `minimatch@3.0.4` via `webpack > enhanced-resolve` | Upgrade to `3.1.2` |

---

For each repo **with no findings**, print a single line:

> ✓ `ACE-Clublabs/<repo-name>` (`<workflow-filename>.yml`) — No vulnerabilities found ([run #`<run-id>`](https://github.com/ACE-Clublabs/`<repo-name>`/actions/runs/`<run-id>`), `<branch>`)

---

For each repo **that was skipped** (no Build workflow / no BuildPipelineJob / no Snyk step), print:

> ⚠ `ACE-Clublabs/<repo-name>` — `<reason>`

---

### Summary Table

| Repo | Workflow File | Run | Branch | High | Medium | Low | Total |
|------|---------------|-----|--------|------|--------|-----|-------|
| repo-billing | `billing-build-pipeline.yml` | [#1234](https://github.com/ACE-Clublabs/repo-billing/actions/runs/1234) | main | 2 | 1 | 0 | 3 |
| repo-cci | `cci-build-pipeline.yml` | [#5678](https://github.com/ACE-Clublabs/repo-cci/actions/runs/5678) | main | 0 | 0 | 0 | ✓ |

---

## Error handling

- **Rate limiting**: if `gh` returns `API rate limit exceeded`, pause and tell the user to wait or use `gh auth login` with a PAT that has higher limits.
- **No log access**: if the run log is not accessible (e.g. log expired after 90 days), note the run ID and conclusion but state the log is unavailable.
- **Large log**: if a job log exceeds 1 MB, cap extraction at the first 500 lines of the Snyk step and note the truncation.

---

## Notes

- Requires `gh` CLI ≥ 2.x with `ACE-Clublabs` org read access.
- GitHub Actions logs are available for 90 days from the run date.
- The `--log` flag on `gh run view --job` streams the raw text log; Snyk SCA output in text mode (not `--json`) is expected. If the step uses `snyk test --json`, the parser still extracts severity/package from the structured JSON embedded in the log.
- This skill is **read-only** — it never modifies any file or triggers any workflow.
