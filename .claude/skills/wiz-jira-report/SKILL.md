---
name: wiz-jira-report
description: "Fetches Wiz findings for a team's repos, triages by bucket type, deduplicates against existing epic children, and creates one Jira ticket per net-new bucket — linked as siblings under the team's parent epic."
arguments: [project, team, source_ticket]
allowed-tools: Bash(python3 *) Bash(curl *) Bash(jq *) Bash(echo *) Bash(printf *) Bash(rm *) Bash(grep *) Bash(cat *) Read Write
---

# Wiz Jira Report — $project / $team

Orchestrates end-to-end:

1. **Fetch & scope** — fetches Wiz issues for the project, scopes to `$team`'s repos using the Lambda prefix map
2. **Triage** — groups findings into fix-type buckets (Lambda SLA, Container CVE, IAM, Network, Secret)
3. **Dedup** — checks the parent epic's existing children; subtracts already-covered resources
4. **Create tickets** — one per net-new bucket, cloned from `$source_ticket`, linked to the parent epic
5. **Summary** — prints results table

- **`$project`** — Wiz project short name (e.g. `iss`, `olb`, `payments`)
- **`$team`** — team name matching a row in `team-epic-map.md` (e.g. `zion`, `yosemite`)
- **`$source_ticket`** — Jira ticket to clone metadata from (e.g. `ISS-17561` or full URL)

Optional flags (parsed from $ARGUMENTS after the three positional args):
- `--parent <KEY>` — override the auto-resolved parent epic
- `--severity <level>` — filter severity (default: `high,critical`)
- `--scan-only` — fetch and triage only, do not create tickets
- `--parent none` — skip parent linking entirely
- `--group-by <bucket|repo>` — grouping strategy for tickets (default: `bucket`). `bucket` = one ticket per fix-type bucket. `repo` = one ticket per (repo × bucket) combination, giving finer-grained assignment.

---

## Phase 1 — Prerequisites

### 1a. Check tooling

```bash
python3 -c "
import os, sys, json

# Check Jira env vars
missing = [v for v in ['JIRA_URL','JIRA_EMAIL','JIRA_API_TOKEN'] if not os.environ.get(v)]
if missing:
    print('ERROR: Missing Jira env vars:', missing)
    sys.exit(1)
print('OK - JIRA_URL:', os.environ['JIRA_URL'])

# Check wizcli auth
auth_path = os.path.expanduser('~/.wiz/auth.json')
if not os.path.exists(auth_path):
    print('ERROR: ~/.wiz/auth.json not found. Run: wizcli auth --use-device-code')
    sys.exit(1)

auth = json.load(open(auth_path))
token = auth.get('access_token', '')
if not token:
    print('ERROR: No access_token in ~/.wiz/auth.json. Run: wizcli auth --use-device-code')
    sys.exit(1)

# Check token expiry
import base64
parts = token.split('.')
if len(parts) >= 2:
    padded = parts[1] + '=' * (4 - len(parts[1]) % 4)
    payload = json.loads(base64.urlsafe_b64decode(padded))
    import time
    exp = payload.get('exp', 0)
    remaining = exp - time.time()
    if remaining < 600:
        print(f'ERROR: Wiz token expires in {int(remaining)}s — less than 10 minutes.')
        print('Run: wizcli auth --use-device-code')
        sys.exit(1)
    print(f'OK - Wiz token valid for {int(remaining/60)} more minutes')

dc = auth.get('data_center', 'us1')
print(f'OK - Wiz data center: {dc}')
"
```

If any check fails, stop and tell the user the exact fix command.

### 1b. Resolve team config from `team-epic-map.md`

Read the map file and extract the team's configuration:

```bash
python3 - << 'PYEOF'
import re, sys, os
from datetime import date

PROJECT = '$project'.lower().strip()
TEAM = '$team'.lower().strip()

# Find team-epic-map.md
map_paths = [
    os.path.join('.claude', 'skills', 'wiz-jira-report', 'team-epic-map.md'),
    os.path.join('skills', 'wiz-jira-report', 'team-epic-map.md'),
]
map_path = None
for p in map_paths:
    if os.path.exists(p):
        map_path = p
        break

if not map_path:
    print("ERROR: team-epic-map.md not found. Expected at .claude/skills/wiz-jira-report/team-epic-map.md")
    sys.exit(1)

content = open(map_path).read()

# Parse table rows (any markdown table with the expected columns)
rows = []
for line in content.splitlines():
    line = line.strip()
    if not line.startswith('|') or line.startswith('|--') or 'project' in line.lower() and 'team' in line.lower() and 'epic' in line.lower():
        continue
    cells = [c.strip() for c in line.split('|')[1:-1]]
    if len(cells) >= 6:
        rows.append({
            'project': cells[0].lower(),
            'team': cells[1].lower(),
            'epic': cells[2],
            'quarter': cells[3],
            'jira_project_key': cells[4],
            'repos': cells[5],
        })

# Filter to (project, team) — pick latest quarter
team_rows = [r for r in rows if r['project'] == PROJECT and r['team'] == TEAM]
if not team_rows:
    print(f"ERROR: No entry for (project={PROJECT}, team={TEAM}) in {map_path}")
    print(f"Available entries:")
    seen = set()
    for r in rows:
        key = (r['project'], r['team'])
        if key not in seen:
            seen.add(key)
            print(f"  project={r['project']}, team={r['team']}")
    sys.exit(1)

# Sort by quarter descending (Q3-2026 > Q2-2026)
def quarter_sort_key(q):
    m = re.match(r'Q(\d)-(\d{4})', q)
    return (int(m.group(2)), int(m.group(1))) if m else (0, 0)

team_rows.sort(key=lambda r: quarter_sort_key(r['quarter']), reverse=True)
chosen = team_rows[0]

# Check staleness
current_year = date.today().year
current_quarter = (date.today().month - 1) // 3 + 1
current_q = f"Q{current_quarter}-{current_year}"
if chosen['quarter'] != current_q:
    print(f"WARNING: Map entry is for {chosen['quarter']} but current quarter is {current_q}.")
    print(f"  Update {map_path} — add a {current_q} row for ({PROJECT}, {TEAM}) with the new epic key.")
    print(f"  Continuing with {chosen['quarter']} entry...")

# Also get shared repos
shared_rows = [r for r in rows if r['project'] == PROJECT and r['team'] == 'shared']
shared_repos = ''
if shared_rows:
    shared_rows.sort(key=lambda r: quarter_sort_key(r['quarter']), reverse=True)
    shared_repos = shared_rows[0]['repos']

import json
result = {
    'epic': chosen['epic'],
    'quarter': chosen['quarter'],
    'jira_project_key': chosen['jira_project_key'],
    'repos': chosen['repos'],
    'shared_repos': shared_repos,
}
print(json.dumps(result, indent=2))
PYEOF
```

Record the output as `TEAM_CONFIG`. If it errored, stop.

### 1c. Validate `source_ticket`

```bash
python3 -c "
import os, re, requests, sys

raw = '$source_ticket'
m = re.search(r'([A-Z]+-\d+)', raw)
if not m:
    print(f'ERROR: Cannot parse issue key from: {raw}')
    sys.exit(1)
key = m.group(1)
project_key = key.split('-')[0]

# Check it matches the team's jira_project_key from TEAM_CONFIG
expected_key = '<JIRA_PROJECT_KEY_FROM_TEAM_CONFIG>'
if project_key != expected_key:
    print(f'ERROR: source_ticket {key} is in project {project_key} but team map says {expected_key}.')
    print(f'Use a source ticket from the {expected_key} project.')
    sys.exit(1)

# Fetch to verify it exists
EMAIL = os.environ['JIRA_EMAIL']
TOKEN = os.environ['JIRA_API_TOKEN']
BASE_URL = os.environ['JIRA_URL']
r = requests.get(
    f'{BASE_URL}/rest/api/3/issue/{key}',
    auth=(EMAIL, TOKEN),
    headers={'Accept': 'application/json'}
)
if r.status_code != 200:
    print(f'ERROR: Cannot fetch source_ticket {key}: HTTP {r.status_code}')
    print(f'Verify the ticket exists and JIRA_API_TOKEN is valid.')
    sys.exit(1)

print(f'OK - source_ticket {key} is valid (project: {project_key})')
"
```

### 1d. Resolve parent epic

If `--parent <KEY>` was passed, use that value directly. If `--parent none` was passed, skip parent linking.

Otherwise use the `epic` field from `TEAM_CONFIG`. If the epic is `—` (shared row used without override), error:

```
ERROR: Team "shared" has no epic assigned. Use --parent <KEY> to specify one.
```

---

## Phase 2 — Fetch & Triage

### 2a. Derive Lambda prefixes from team repos

```bash
python3 - << 'PYEOF'
import json, os, re

# Team repos from TEAM_CONFIG + shared repos
team_repos_str = '<REPOS_FROM_TEAM_CONFIG>'
shared_repos_str = '<SHARED_REPOS_FROM_TEAM_CONFIG>'

all_repo_strs = [r.strip() for r in (team_repos_str + ', ' + shared_repos_str).split(',') if r.strip()]

# Parse inline prefix specs (repo:prefix1,prefix2) vs plain repo names
inline_prefixes = {}
plain_repos = []
for entry in all_repo_strs:
    if ':' in entry and not entry.startswith('cmn-'):
        parts = entry.split(':', 1)
        repo = parts[0].strip()
        prefixes = [p.strip() for p in parts[1].split(',')]
        inline_prefixes[repo] = prefixes
    else:
        plain_repos.append(entry)

# For plain repos, look up prefixes from the wiz-fix-workflow Lambda prefix map
# Read the workflow file
workflow_paths = [
    os.path.join('.claude', 'wiz-fix-workflow.md'),
    'wiz-fix-workflow.md',
]
workflow_content = ''
for wp in workflow_paths:
    if os.path.exists(wp):
        workflow_content = open(wp).read()
        break

# Parse the prefix map table from wiz-fix-workflow.md
# Format: | repo-suffix | lambda-prefixes | cdk-stack |
prefix_map = {}
in_table = False
for line in workflow_content.splitlines():
    if '| Repo name' in line or '| --' in line:
        in_table = True
        continue
    if in_table and line.startswith('|'):
        cells = [c.strip() for c in line.split('|')[1:-1]]
        if len(cells) >= 2:
            repo_suffix = cells[0].strip('` ')
            lambda_prefixes_str = cells[1].strip('` ')
            if lambda_prefixes_str:
                prefixes = [p.strip().strip('`') for p in lambda_prefixes_str.split(',') if p.strip()]
                prefix_map[repo_suffix] = prefixes
    elif in_table and not line.startswith('|'):
        in_table = False

# CDK framework patterns (always included for filtering)
CDK_PATTERNS = [
    'ProviderframeworkonEvent', 'ProviderframeworkisCompl', 'ProviderframeworkonTimeo',
    'IsCompleteHandler', 'OnEventHandler', 'LogRetentionaae0aa3c5b4d'
]

# Build the combined prefix list
all_prefixes = []
missing_repos = []
shared_repo_list = [r.strip() for r in shared_repos_str.split(',') if r.strip()]

for repo in plain_repos:
    if repo in prefix_map:
        all_prefixes.extend(prefix_map[repo])
    else:
        # Try partial match
        matched = False
        for key in prefix_map:
            if repo in key or key in repo:
                all_prefixes.extend(prefix_map[key])
                matched = True
                break
        if not matched:
            missing_repos.append(repo)

for repo, prefixes in inline_prefixes.items():
    all_prefixes.extend(prefixes)

# Deduplicate
all_prefixes = list(set(all_prefixes))

result = {
    'prefixes': all_prefixes,
    'cdk_patterns': CDK_PATTERNS,
    'missing_repos': missing_repos,
    'shared_repos': shared_repo_list,
}
print(json.dumps(result, indent=2))

if missing_repos:
    print(f"\nWARNING: No Lambda prefix found for repos: {missing_repos}", file=sys.stderr)
    print("These repos will not be scoped — their Wiz findings may be missed.", file=sys.stderr)
PYEOF
```

Record the output as `PREFIX_CONFIG`.

### 2b. Fetch Wiz issues (paginated)

```bash
python3 - << 'PYEOF'
import json, subprocess, os, sys

auth = json.load(open(os.path.expanduser('~/.wiz/auth.json')))
TOKEN = auth['access_token']
DC = auth.get('data_center', 'us1')
API_URL = f"https://api.{DC}.app.wiz.io/graphql"

# Wiz project name mapping
PROJECT_MAP = {
    'iss': 'ClubLabs - ISS',
    'olb': 'ClubLabs - OLB',
    'travel': 'ClubLabs - Travel',
    'cloudops': 'ClubLabs - CloudOps',
    'payments': 'ClubLabs - Payments',
    'membership': 'ClubLabs - Membership',
    'chatbot': 'ClubLabs - ACE-Chatbot',
    'automotive': 'ClubLabs - Automotive',
    'mlai': 'ClubLabs - MLAI',
    'enterprise': 'ClubLabs - Enterprise',
    'website': 'ClubLabs - Website',
    'mobile': 'ClubLabs - Mobile',
}

PROJECT = '$project'.lower().strip()
WIZ_PROJECT = PROJECT_MAP.get(PROJECT)
if not WIZ_PROJECT:
    print(f"ERROR: Unknown project '{PROJECT}'. Valid: {list(PROJECT_MAP.keys())}")
    sys.exit(1)

# Severity filter (default: high + critical)
severity_filter = 'HIGH, CRITICAL'
# Parse --severity from args if provided
# (placeholder — replace with actual arg parsing)

all_nodes = []
cursor = None
page = 0

while True:
    page += 1
    after_clause = f', after: "{cursor}"' if cursor else ""
    query = f'''{{
      issues(filterBy: {{ status: [OPEN, IN_PROGRESS], severity: [{severity_filter}] }}, first: 500{after_clause}) {{
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
    if 'errors' in data:
        print(f"ERROR: Wiz API returned errors: {data['errors']}")
        sys.exit(1)

    nodes = data['data']['issues']['nodes']
    page_info = data['data']['issues']['pageInfo']
    all_nodes.extend(nodes)
    print(f"  Page {page}: {len(nodes)} issues fetched ({len(all_nodes)} total)", file=sys.stderr)

    if not page_info['hasNextPage']:
        break
    cursor = page_info['endCursor']

# Filter to target project
project_issues = [i for i in all_nodes if any(p['name'] == WIZ_PROJECT for p in i.get('projects', []))]
print(f"Fetched {len(all_nodes)} total, {len(project_issues)} for {WIZ_PROJECT}", file=sys.stderr)

with open('/tmp/wiz-jira-report-issues.json', 'w') as f:
    json.dump(project_issues, f, indent=2)

print(json.dumps({'total_fetched': len(all_nodes), 'project_issues': len(project_issues)}))
PYEOF
```

### 2c. Scope to team repos

```bash
python3 - << 'PYEOF'
import json, sys

issues = json.load(open('/tmp/wiz-jira-report-issues.json'))

# PREFIX_CONFIG values (injected from 2a output)
PREFIXES = <PREFIXES_FROM_2A>
CDK_PATTERNS = <CDK_PATTERNS_FROM_2A>
SHARED_REPOS = <SHARED_REPOS_FROM_2A>

def belongs_to_team(issue):
    name = issue.get('entity', {}).get('name', '')
    if not name:
        return False, False
    is_cdk = any(p in name for p in CDK_PATTERNS)
    matches_prefix = any(name.startswith(p) for p in PREFIXES)
    return matches_prefix or is_cdk, False

def is_shared_repo_issue(issue):
    """Check if this issue's entity matches a shared repo's prefix."""
    # Shared repos are identified by their prefixes in PREFIX_CONFIG
    # This is a secondary tag — the issue still belongs to the team
    name = issue.get('entity', {}).get('name', '')
    # (Implementation: check against shared repo prefixes specifically)
    return False  # Placeholder — refined during implementation

team_issues = []
for issue in issues:
    belongs, _ = belongs_to_team(issue)
    if belongs:
        team_issues.append(issue)

print(f"Team-scoped: {len(issues)} project issues → {len(team_issues)} for this team", file=sys.stderr)

with open('/tmp/wiz-jira-report-team-issues.json', 'w') as f:
    json.dump(team_issues, f, indent=2)

print(json.dumps({'team_issues': len(team_issues)}))
PYEOF
```

If `team_issues` is 0, print:

```
No Wiz findings found for team $team in project $project.
Checked prefixes: <list>
```

And stop.

### 2d. Triage into buckets

```bash
python3 - << 'PYEOF'
import json, re, sys

issues = json.load(open('/tmp/wiz-jira-report-team-issues.json'))

CDK_PATTERNS = [
    'ProviderframeworkonEvent', 'ProviderframeworkisCompl', 'ProviderframeworkonTimeo',
    'IsCompleteHandler', 'OnEventHandler', 'LogRetentionaae0aa3c5b4d'
]

BUCKETS = {
    'lambda_sla': [],
    'deprecated_runtime_app': [],
    'deprecated_runtime_cdk': [],
    'container_cve': [],
    'iam': [],
    'network': [],
    'secret': [],
    'no_action': [],
}

for issue in issues:
    control = issue.get('control', {}).get('name', '')
    entity_name = issue.get('entity', {}).get('name', '')
    entity_type = issue.get('entity', {}).get('type', '')
    severity = issue.get('severity', '')
    status = issue.get('status', '')

    if status in ('ACCEPTED', 'FALSE_POSITIVE'):
        BUCKETS['no_action'].append(issue)
        continue

    is_cdk = any(p in entity_name for p in CDK_PATTERNS)

    if 'Patching Standard SLA' in control:
        BUCKETS['lambda_sla'].append(issue)
    elif 'deprecated runtime' in control.lower():
        if is_cdk:
            BUCKETS['deprecated_runtime_cdk'].append(issue)
        else:
            BUCKETS['deprecated_runtime_app'].append(issue)
    elif entity_type in ('CONTAINER', 'containerImage'):
        BUCKETS['container_cve'].append(issue)
    elif 'iam' in control.lower() or 'permissive' in control.lower() or 'privilege' in control.lower():
        BUCKETS['iam'].append(issue)
    elif 'security group' in control.lower() or 'network' in control.lower() or '0.0.0.0' in control:
        BUCKETS['network'].append(issue)
    elif 'secret' in control.lower() or 'credential' in control.lower() or 'plaintext' in control.lower():
        BUCKETS['secret'].append(issue)
    else:
        BUCKETS['no_action'].append(issue)

# Print triage summary
print(f"\n{'='*60}")
print(f"  TRIAGE SUMMARY — $project / $team")
print(f"{'='*60}")
for bucket, items in BUCKETS.items():
    if items:
        print(f"  {bucket:<25} {len(items):>4} issues")
print(f"{'='*60}\n")

# Print detail table
print(f"| {'Resource':<40} | {'Type':<12} | {'Control':<45} | {'Severity':<8} | {'Bucket':<20} |")
print(f"|{'-'*42}|{'-'*14}|{'-'*47}|{'-'*10}|{'-'*22}|")
for bucket, items in BUCKETS.items():
    if bucket == 'no_action':
        continue
    for issue in items[:20]:  # Cap display at 20 per bucket
        name = issue.get('entity', {}).get('name', '?')[:40]
        etype = issue.get('entity', {}).get('type', '?')[:12]
        ctrl = issue.get('control', {}).get('name', '?')[:45]
        sev = issue.get('severity', '?')[:8]
        print(f"| {name:<40} | {etype:<12} | {ctrl:<45} | {sev:<8} | {bucket:<20} |")

with open('/tmp/wiz-jira-report-buckets.json', 'w') as f:
    json.dump(BUCKETS, f, indent=2)

# Also produce repo-level grouping for --group-by repo
# Uses REPO_PREFIXES passed in from 2a (team repos → their prefixes)
REPO_PREFIXES = <REPO_PREFIXES_FROM_2A>  # dict: {repo_name: [prefix1, prefix2, ...]}

repo_buckets = {}  # key: (repo, bucket_key) → list of issues
for bucket_key, bucket_issues in BUCKETS.items():
    if bucket_key == 'no_action' or not bucket_issues:
        continue
    for issue in bucket_issues:
        entity_name = issue.get('entity', {}).get('name', '')
        is_cdk = any(p in entity_name for p in CDK_PATTERNS)
        assigned_repo = 'cdk_framework' if is_cdk else None
        if not is_cdk:
            for repo, prefixes in REPO_PREFIXES.items():
                if any(entity_name.startswith(p) for p in prefixes):
                    assigned_repo = repo
                    break
        if not assigned_repo:
            assigned_repo = 'unmatched'
        key = f"{assigned_repo}|{bucket_key}"
        repo_buckets.setdefault(key, []).append(issue)

with open('/tmp/wiz-jira-report-repo-buckets.json', 'w') as f:
    json.dump(repo_buckets, f, indent=2)

# Print repo × bucket breakdown
print(f"\n{'='*60}")
print(f"  REPO × BUCKET BREAKDOWN")
print(f"{'='*60}")
print(f"| {'Repo':<45} | {'Bucket':<22} | {'Count':>5} |")
print(f"|{'-'*47}|{'-'*24}|{'-'*7}|")
for key in sorted(repo_buckets.keys()):
    repo, bkt = key.split('|', 1)
    print(f"| {repo:<45} | {bkt:<22} | {len(repo_buckets[key]):>5} |")
print(f"{'='*60}")
print(f"Tickets with --group-by repo: {len(repo_buckets)}")

# Summary counts for later phases
actionable = {k: v for k, v in BUCKETS.items() if k != 'no_action' and v}
print(json.dumps({'actionable_buckets': list(actionable.keys()), 'total_actionable': sum(len(v) for v in actionable.values()), 'repo_bucket_count': len(repo_buckets)}))
PYEOF
```

After printing the triage table, ask the user:

> "Found findings in N bucket(s) totalling M issues. Proceed to dedup and ticket creation?"
> If `--group-by repo` is active, also state: "Grouping by repo: N tickets will be created (one per repo × bucket combination)."

If `--scan-only` was passed, stop here — do not proceed to Phase 3.

Wait for user confirmation before continuing.

---

## Phase 3 — Dedup Check

### 3a. Fetch existing children of the parent epic

```bash
python3 -c "
import os, requests, json, sys

EMAIL = os.environ['JIRA_EMAIL']
TOKEN = os.environ['JIRA_API_TOKEN']
BASE_URL = os.environ['JIRA_URL']
PARENT_EPIC = '<RESOLVED_PARENT_EPIC>'

# JQL: children of this epic that are open, in progress, or closed within last 30 days
jql = f'parent = {PARENT_EPIC} AND (statusCategory in (\"To Do\", \"In Progress\") OR (status changed to Done after -30d))'

r = requests.get(
    f'{BASE_URL}/rest/api/3/search',
    auth=(EMAIL, TOKEN),
    headers={'Accept': 'application/json'},
    params={'jql': jql, 'maxResults': 100, 'fields': 'summary,description,status'}
)
if r.status_code != 200:
    print(f'WARNING: Could not fetch epic children: HTTP {r.status_code}')
    print('Proceeding without dedup — tickets may duplicate existing ones.')
    print(json.dumps({'existing_tickets': []}))
else:
    data = r.json()
    tickets = []
    for issue in data.get('issues', []):
        tickets.append({
            'key': issue['key'],
            'summary': issue['fields']['summary'],
            'status': issue['fields']['status']['name'],
            'description_text': json.dumps(issue['fields'].get('description', {})),
        })
    print(json.dumps({'existing_tickets': tickets}, indent=2))
"
```

### 3b. Compute net-new resources per grouping unit

The dedup logic works the same regardless of `--group-by` — it subtracts already-covered resources from the current run's findings. The difference is the iteration unit:
- `--group-by bucket` (default): iterate per bucket_key
- `--group-by repo`: iterate per (repo × bucket_key)

```bash
python3 - << 'PYEOF'
import json, re, sys

GROUP_BY = '<GROUP_BY>'  # 'bucket' or 'repo'

existing_raw = '<EXISTING_TICKETS_JSON>'
existing = json.loads(existing_raw) if existing_raw else {'existing_tickets': []}

BUCKET_LABELS = {
    'lambda_sla': 'Lambda SLA',
    'deprecated_runtime_app': 'Deprecated Runtime',
    'deprecated_runtime_cdk': 'Deprecated Runtime - CDK',
    'container_cve': 'Container CVE',
    'iam': 'IAM',
    'network': 'Network',
    'secret': 'Secret',
}

def strip_version_suffix(name):
    """Strip trailing -v\\d+ for prefix-based matching."""
    return re.sub(r'-v\d+$', '', name)

def extract_covered_resources(tickets, search_terms):
    """Find resource names mentioned in existing tickets matching any search term."""
    covered = set()
    for t in tickets:
        summary = t.get('summary', '').lower()
        desc = t.get('description_text', '')
        if not any(term.lower() in summary for term in search_terms):
            continue
        names = re.findall(r'`([a-zA-Z0-9_-]+)`', desc)
        for n in names:
            covered.add(strip_version_suffix(n))
    return covered

results = {}

if GROUP_BY == 'repo':
    repo_buckets = json.load(open('/tmp/wiz-jira-report-repo-buckets.json'))
    for key, issues in repo_buckets.items():
        repo, bucket_key = key.split('|', 1)
        label = BUCKET_LABELS.get(bucket_key, bucket_key)
        # Search existing tickets for both the bucket label and repo name
        search_terms = [label, repo]
        covered = extract_covered_resources(existing.get('existing_tickets', []), search_terms)

        net_new = []
        already_covered = []
        for issue in issues:
            entity_name = issue.get('entity', {}).get('name', '')
            prefix = strip_version_suffix(entity_name)
            if prefix in covered:
                already_covered.append(issue)
            else:
                net_new.append(issue)

        results[key] = {
            'label': f"{label} — {repo}",
            'repo': repo,
            'bucket_key': bucket_key,
            'total': len(issues),
            'already_covered': len(already_covered),
            'net_new_count': len(net_new),
            'net_new_issues': net_new,
        }

        if already_covered:
            print(f"  {label} [{repo}]: {len(already_covered)}/{len(issues)} already covered")
        if net_new:
            print(f"  {label} [{repo}]: {len(net_new)} net-new")
else:
    buckets = json.load(open('/tmp/wiz-jira-report-buckets.json'))
    for bucket_key, issues in buckets.items():
        if bucket_key == 'no_action' or not issues:
            continue

        label = BUCKET_LABELS.get(bucket_key, bucket_key)
        covered = extract_covered_resources(existing.get('existing_tickets', []), [label])

        net_new = []
        already_covered = []
        for issue in issues:
            entity_name = issue.get('entity', {}).get('name', '')
            prefix = strip_version_suffix(entity_name)
            if prefix in covered:
                already_covered.append(issue)
            else:
                net_new.append(issue)

        results[bucket_key] = {
            'label': label,
            'total': len(issues),
            'already_covered': len(already_covered),
            'net_new_count': len(net_new),
            'net_new_issues': net_new,
        }

        if already_covered:
            print(f"  {label}: {len(already_covered)}/{len(issues)} already covered by existing tickets")
        if net_new:
            print(f"  {label}: {len(net_new)} net-new resources to create ticket for")

with open('/tmp/wiz-jira-report-netnew.json', 'w') as f:
    json.dump(results, f, indent=2)

print(json.dumps({k: v['net_new_count'] for k, v in results.items()}))
PYEOF
```

If all grouping units have `net_new_count == 0`, print:

```
All findings are already covered by existing tickets under <PARENT_EPIC>.
No new tickets needed.

Existing tickets:
  - <KEY>: <summary> (<status>)
  ...
```

And stop.

---

## Phase 4 — Create Tickets

For each grouping unit where `net_new_count > 0` (iterating over the keys in `/tmp/wiz-jira-report-netnew.json`):
- With `--group-by bucket` (default): each key is a bucket_key (e.g. `lambda_sla`)
- With `--group-by repo`: each key is `repo|bucket_key` (e.g. `insurancepolicychange_driver-ao|lambda_sla`)

### 4a. Write the description markdown file

```bash
python3 - << 'PYEOF'
import json, os, sys
from datetime import date

GROUPING_KEY = '<GROUPING_KEY>'  # bucket_key or repo|bucket_key
PROJECT = '$project'
TEAM = '$team'

netnew = json.load(open('/tmp/wiz-jira-report-netnew.json'))
bucket_data = netnew[GROUPING_KEY]
issues = bucket_data['net_new_issues']
BUCKET_LABEL = bucket_data['label']  # e.g. "Lambda SLA" or "Lambda SLA — driver-ao"
REPO_NAME = bucket_data.get('repo', '')  # non-empty when --group-by repo

# Determine if any issues are from shared repos
SHARED_REPOS = <SHARED_REPOS_LIST>
SHARED_PREFIXES = <SHARED_PREFIXES_LIST>  # prefixes derived from shared repos

has_shared = False
for issue in issues:
    name = issue.get('entity', {}).get('name', '')
    if any(name.startswith(p) for p in SHARED_PREFIXES):
        has_shared = True
        break

shared_tag = '[SHARED] ' if has_shared else ''

# Build severity counts
high = [i for i in issues if i.get('severity', '').upper() == 'HIGH']
critical = [i for i in issues if i.get('severity', '').upper() == 'CRITICAL']
medium = [i for i in issues if i.get('severity', '').upper() == 'MEDIUM']

today = date.today().strftime('%Y-%m-%d')

# Build resource table
rows = []
for idx, issue in enumerate(issues, 1):
    name = issue.get('entity', {}).get('name', '—')
    etype = issue.get('entity', {}).get('type', '—')
    control = issue.get('control', {}).get('name', '—')
    severity = issue.get('severity', '—')
    status = issue.get('status', '—')
    wiz_id = issue.get('id', '—')
    account = (issue.get('cloudAccounts') or [{}])[0].get('name', '—')
    rows.append(f"| {idx} | `{name}` | {etype} | {severity} | {control} | {account} | {wiz_id} |")

table = '\n'.join(rows)

repo_line = f"\n- **Repo:** {REPO_NAME}" if REPO_NAME else ""
title_repo = f" [{REPO_NAME}]" if REPO_NAME else ""

REMEDIATION_GUIDES = {
    'lambda_sla': f"""## Remediation Guide

Use the `/wiz-fix {PROJECT} --this-repo` Claude Code command to fetch, triage, and resolve all open HIGH/CRITICAL Wiz findings scoped to this repo.

- **Repo:** {REPO_NAME if REPO_NAME else PROJECT.upper()}

**Steps:**

1. Update `@ace-clublabs/claude-plugin` to the latest version — this installs or refreshes the `/wiz-fix` command:
   ```
   npx @ace-clublabs/claude-plugin update
   ```
2. Authenticate with Wiz:
   ```
   wizcli auth --use-device-code
   ```
3. In the repo, run the scan and fix:
   ```
   /wiz-fix {PROJECT} --this-repo
   ```
4. Review the triage table — approve any code changes (Splunk layer bumps, CDK upgrades) before they are applied.
5. Trigger PROD deployments via the GHA pipelines surfaced by the workflow.
6. Verify findings are resolved in the Wiz portal within 1–4 hours of a successful PROD deployment.

**Expected finding types:**
- Lambda patching SLA violations (`[ACE] Serverless function exceeding our Patching Standard SLA`)
- Deprecated runtimes on CDK framework Lambdas (`[ACE] Serverless using deprecated runtime`)
- IAM, network, or secret issues (if any)

**Acceptance criteria:**
- All HIGH/CRITICAL Wiz findings scoped to this repo are resolved or formally accepted in the Wiz portal
- Any code changes (layer version bumps, CDK upgrades) are merged and deployed to PROD""",

    'deprecated_runtime_app': f"""## Remediation Guide

Use the `/wiz-fix {PROJECT} --this-repo` Claude Code command to fetch, triage, and resolve deprecated runtime findings scoped to this repo.

- **Repo:** {REPO_NAME if REPO_NAME else PROJECT.upper()}

**Steps:**

1. Update `@ace-clublabs/claude-plugin` to the latest version:
   ```
   npx @ace-clublabs/claude-plugin update
   ```
2. Authenticate with Wiz:
   ```
   wizcli auth --use-device-code
   ```
3. In the repo, run the scan and fix:
   ```
   /wiz-fix {PROJECT} --this-repo
   ```
4. Review the proposed runtime upgrades — `/wiz-fix` identifies Lambda functions on end-of-life runtimes (e.g. Node 16, Python 3.8) and upgrades them in CDK/SAM config.
5. Trigger PROD deployments via the GHA pipelines surfaced by the workflow.
6. Verify findings are resolved in the Wiz portal within 1–4 hours of a successful PROD deployment.

**Expected finding types:**
- Deprecated Lambda runtimes (`[ACE] Serverless using deprecated runtime`)

**Acceptance criteria:**
- All deprecated runtime findings scoped to this repo are resolved or formally accepted in the Wiz portal
- Runtime upgrades are merged and deployed to PROD""",

    'deprecated_runtime_cdk': f"""## Remediation Guide

These findings are in **CDK framework Lambdas** (custom resource providers, log retention handlers) — they are managed by CDK, not your application code directly.

- **Repo:** {REPO_NAME if REPO_NAME else PROJECT.upper()}

**Steps:**

1. Update `@ace-clublabs/claude-plugin` to the latest version:
   ```
   npx @ace-clublabs/claude-plugin update
   ```
2. Authenticate with Wiz:
   ```
   wizcli auth --use-device-code
   ```
3. In the CDK repo, run:
   ```
   /wiz-fix {PROJECT} --this-repo
   ```
4. Review the proposed changes — `/wiz-fix` will bump `aws-cdk-lib` or pin the `lambdaPurpose` runtime on affected constructs.
5. Run `cdk synth` to verify, then trigger PROD deployments via the GHA pipelines.
6. Verify findings are resolved in the Wiz portal within 1–4 hours of a successful PROD deployment.

**Expected finding types:**
- Deprecated runtimes on CDK framework Lambdas (`[ACE] Serverless using deprecated runtime`)

**Acceptance criteria:**
- All deprecated runtime findings for CDK framework Lambdas are resolved or formally accepted in the Wiz portal
- CDK upgrades are merged and deployed to PROD""",

    'container_cve': f"""## Remediation Guide

Use the `/wiz-fix {PROJECT} --this-repo` Claude Code command to resolve container CVE findings scoped to this repo.

- **Repo:** {REPO_NAME if REPO_NAME else PROJECT.upper()}

**Steps:**

1. Update `@ace-clublabs/claude-plugin` to the latest version:
   ```
   npx @ace-clublabs/claude-plugin update
   ```
2. Authenticate with Wiz:
   ```
   wizcli auth --use-device-code
   ```
3. In the repo, run:
   ```
   /wiz-fix {PROJECT} --this-repo
   ```
4. Review the proposed Dockerfile base image updates — approve before they are applied.
5. Trigger PROD deployments via the GHA pipelines surfaced by the workflow.
6. Verify findings are resolved in the Wiz portal within 1–4 hours of a successful PROD deployment.

**Expected finding types:**
- Container image CVEs

**Acceptance criteria:**
- All container CVE findings scoped to this repo are resolved or formally accepted in the Wiz portal
- Updated images are built and deployed to PROD""",

    'iam': f"""## Remediation Guide

Use the `/wiz-fix {PROJECT} --this-repo` Claude Code command to resolve IAM findings scoped to this repo.

- **Repo:** {REPO_NAME if REPO_NAME else PROJECT.upper()}

**Steps:**

1. Review the findings table below — each row identifies an over-permissive IAM role or policy.
2. Update `@ace-clublabs/claude-plugin` to the latest version:
   ```
   npx @ace-clublabs/claude-plugin update
   ```
3. Run `/wiz-fix {PROJECT} --this-repo` to get AI-assisted remediation.
4. Review proposed IAM policy scoping changes (least-privilege) before they are applied.
5. Trigger PROD deployments via the GHA pipelines surfaced by the workflow.
6. Verify findings are resolved in the Wiz portal within 1–4 hours of a successful PROD deployment.

**Expected finding types:**
- Over-permissive IAM roles or policies

**Acceptance criteria:**
- All IAM findings scoped to this repo are resolved or formally accepted in the Wiz portal
- IAM policy changes are merged and deployed to PROD""",

    'network': f"""## Remediation Guide

Use the `/wiz-fix {PROJECT} --this-repo` Claude Code command to resolve network findings scoped to this repo.

- **Repo:** {REPO_NAME if REPO_NAME else PROJECT.upper()}

**Steps:**

1. Review the findings below — each row identifies an over-permissive security group or network rule.
2. Update `@ace-clublabs/claude-plugin` to the latest version:
   ```
   npx @ace-clublabs/claude-plugin update
   ```
3. Run `/wiz-fix {PROJECT} --this-repo` to get AI-assisted remediation.
4. Review proposed security group restrictions before they are applied.
5. Trigger PROD deployments via the GHA pipelines surfaced by the workflow.
6. Verify findings are resolved in the Wiz portal within 1–4 hours of a successful PROD deployment.

**Expected finding types:**
- Over-permissive security groups or network rules

**Acceptance criteria:**
- All network findings scoped to this repo are resolved or formally accepted in the Wiz portal
- Network config changes are merged and deployed to PROD""",

    'secret': f"""## Remediation Guide

**Steps:**

1. Review the findings below — each row identifies a plaintext secret or exposed credential.
2. **Rotate the exposed secret immediately.**
3. Move the secret to AWS Secrets Manager or Parameter Store (SecureString).
4. Update the Lambda/ECS task to read the secret at runtime rather than injecting it as an env var.
5. Open a PR with the updated config and confirm the old secret is revoked.
6. Verify findings are resolved in the Wiz portal within 1–4 hours of a successful PROD deployment.

**Expected finding types:**
- Plaintext secrets or exposed credentials

**Acceptance criteria:**
- All secret findings scoped to this repo are resolved or formally accepted in the Wiz portal
- Exposed secrets are rotated and removed from source/config""",
}

remediation = REMEDIATION_GUIDES.get(bucket_key, f"""## Remediation Guide

Run `/wiz-fix {PROJECT} --this-repo` in the affected repo to get AI-assisted remediation for these findings.

**Acceptance criteria:**
- All HIGH/CRITICAL Wiz findings scoped to this repo are resolved or formally accepted in the Wiz portal""")

content = f"""# {shared_tag}{BUCKET_LABEL}{title_repo} — {PROJECT.upper()} / {TEAM.capitalize()}

Automated Wiz vulnerability report for team **{TEAM.capitalize()}** in project **{PROJECT.upper()}**.

## Summary

**{len(issues)} net-new findings** ({len(critical)} Critical · {len(high)} High · {len(medium)} Medium)

- **Bucket type:** {BUCKET_LABEL}
- **Repo:** {REPO_NAME if REPO_NAME else PROJECT.upper()}
- **Scanned:** {today}
- **Severity filter:** high + critical

{remediation}

## Findings

| # | Resource | Type | Severity | Control | Account | Wiz ID |
|---|----------|------|----------|---------|---------|--------|
{table}

## Metadata

- **Project:** {PROJECT.upper()}
- **Team:** {TEAM.capitalize()}
- **Scanned:** {today}
- **Severity filter:** high + critical
- **Scope:** team-owned repos only

---
*Generated by wiz-jira-report on {today} — project: {PROJECT}, team: {TEAM}*
"""

safe_key = GROUPING_KEY.replace('|', '-')
filepath = f'/tmp/wiz-jira-report-{safe_key}.md'
with open(filepath, 'w') as fh:
    fh.write(content)
print(f'WRITTEN={filepath}')
print(f'SUMMARY={shared_tag}{BUCKET_LABEL}{title_repo} — {PROJECT.upper()} / {TEAM.capitalize()} ({len(issues)} findings)')
PYEOF
```

### 4b. Clone the Jira ticket with parent linking

Invoke the `jira-clone-ticket` skill with:
- `source_ticket` = **`$source_ticket`**
- `description_file` = the path written in Step 4a
- `parent_ticket` = the resolved parent epic

The cloned ticket's summary should be set to the `SUMMARY` value from 4a (which includes the `[SHARED]` prefix if applicable).

Follow every step in the `jira-clone-ticket` skill exactly (Steps 1–5). Capture the URL of the newly created ticket.

### 4c. Clean up temp file

```bash
rm -f /tmp/wiz-jira-report-<SAFE_GROUPING_KEY>.md
```

### 4d. Record the result

For each grouping unit, record:
- `grouping_key` — the key from netnew.json (bucket_key or repo|bucket_key)
- `label` — human-readable label (includes repo name if `--group-by repo`)
- `jira_url` — the URL returned by jira-clone-ticket
- `jira_key` — the bare key (e.g. `ISS-17920`)
- `net_new_count` — resources in the new ticket
- `already_covered_count` — resources already in existing tickets
- `has_shared` — whether `[SHARED]` was applied

If ticket creation fails for a grouping unit, record the error and continue to the next — do not abort the entire run.

---

## Phase 5 — Summary Table

After processing all grouping units, print:

```
## Wiz → Jira Ticket Summary

Project:              $project
Team:                 $team
Parent Epic:          <PARENT_EPIC>
Severity filter:      high + critical
Group by:             <bucket|repo>
Team-scoped issues:   <N>
Grouping units:       <N>
Tickets created:      <N>
Tickets skipped:      <N> (already covered)
Ticket errors:        <N>
```

**When `--group-by bucket` (default):**

```
| Bucket | Total | Already Covered | Net-New | Action | Jira Ticket |
|--------|-------|-----------------|---------|--------|-------------|
| Lambda SLA | 12 | 8 | 4 | Created | [ISS-17920](https://autoclub.atlassian.net/browse/ISS-17920) |
| Container CVE | 3 | 3 | 0 | Skipped | — (covered by [ISS-17915](https://autoclub.atlassian.net/browse/ISS-17915)) |
| IAM | 2 | 0 | 2 | Created | [[SHARED] ISS-17921](https://autoclub.atlassian.net/browse/ISS-17921) |
```

**When `--group-by repo`:**

```
| Repo | Bucket | Total | Already Covered | Net-New | Action | Jira Ticket |
|------|--------|-------|-----------------|---------|--------|-------------|
| driver-ao | Lambda SLA | 368 | 0 | 368 | Created | [ISS-17920](https://autoclub.atlassian.net/browse/ISS-17920) |
| change-finance-company-app | Lambda SLA | 72 | 0 | 72 | Created | [ISS-17921](https://autoclub.atlassian.net/browse/ISS-17921) |
| cci-api | Deprecated Runtime | 10 | 5 | 5 | Created | [ISS-17922](https://autoclub.atlassian.net/browse/ISS-17922) |
| cdk_framework | Deprecated Runtime - CDK | 194 | 194 | 0 | Skipped | — (covered by [ISS-17915](...)) |
```

For any ticket creation errors:

```
Ticket creation errors:
  - <grouping_key>: <error message>
```

---

## Notes

- This skill is a sequential orchestrator — it calls the Wiz GraphQL API directly and invokes `jira-clone-ticket` for ticket creation.
- Default (`--group-by bucket`): one ticket per bucket type per run, covering only net-new resources not in any existing epic child.
- With `--group-by repo`: one ticket per (repo × bucket) combination, giving finer-grained assignment to specific repos.
- All created tickets are siblings (children of the parent epic, never nested under each other).
- Tickets with any finding from a shared repo get `[SHARED]` in the summary.
- The temp files at `/tmp/wiz-jira-report-*.json` and `/tmp/wiz-jira-report-*.md` are cleaned up after each run.
- Requires: `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` env vars; `wizcli` authenticated via SSO.
- The skill always asks for confirmation after Phase 2 before creating any Jira tickets.
- Token expiry is checked upfront — if the Wiz token has less than 10 minutes remaining, the skill stops and prompts re-authentication.
- Dedup matches on Lambda name prefix (strips `-v\d+` suffix) to handle version rotations.
- Dedup queries Jira for epic children in status categories `To Do`, `In Progress`, or closed within the last 30 days.
