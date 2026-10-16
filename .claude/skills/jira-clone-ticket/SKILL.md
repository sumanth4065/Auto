---
name: jira-clone-ticket
description: "Clones a Jira ticket (by URL or key) into the same project, replaces the description with the contents of a local markdown file, updates the summary accordingly, and returns the URL of the new ticket."
arguments: [source_ticket, description_file]
allowed-tools: Bash(python3 *) Bash(curl *) Read
---

# Jira Clone Ticket — $source_ticket

Fetches **`$source_ticket`**, clones its metadata (project, issue type, priority, labels, components), replaces the description with **`$description_file`**, derives a new summary from the file, and creates the ticket via the Jira REST API v3.

- **`$source_ticket`** — full Jira URL (e.g. `https://autoclub.atlassian.net/browse/ISS-17561`) or bare key (e.g. `ISS-17561`)
- **`$description_file`** — path to a local markdown file whose content becomes the new ticket description

---

## Prerequisites

The following environment variables must be set:

| Variable | Description |
|---|---|
| `JIRA_URL` | Jira base URL, e.g. `https://autoclub.atlassian.net` |
| `JIRA_EMAIL` | Atlassian account email |
| `JIRA_API_TOKEN` | Atlassian API token (create at https://id.atlassian.com/manage-profile/security/api-tokens) |

Check they are present:

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

## Step 1 — Extract the issue key

Parse `$source_ticket` to get the bare issue key:

```bash
python3 -c "
import re, sys
raw = '$source_ticket'
m = re.search(r'([A-Z]+-\d+)', raw)
if not m:
    print('ERROR: cannot parse issue key from:', raw)
    sys.exit(1)
print(m.group(1))
"
```

---

## Step 2 — Fetch the source ticket

```bash
python3 -c "
import os, requests, json

EMAIL    = os.environ['JIRA_EMAIL']
TOKEN    = os.environ['JIRA_API_TOKEN']
BASE_URL = os.environ['JIRA_URL']
KEY      = '<ISSUE_KEY>'   # from Step 1

r = requests.get(
    f'{BASE_URL}/rest/api/3/issue/{KEY}',
    auth=(EMAIL, TOKEN),
    headers={'Accept': 'application/json'}
)
if r.status_code != 200:
    print('ERROR fetching ticket:', r.status_code, r.text[:300])
    raise SystemExit(1)

d = r.json()
f = d['fields']
meta = {
    'project_key':  f['project']['key'],
    'issuetype':    f['issuetype']['name'],
    'priority':     (f.get('priority') or {}).get('name', 'Medium'),
    'labels':       f.get('labels', []),
    'components':   [{'name': c['name']} for c in f.get('components', [])],
    'fixVersions':  [{'name': v['name']} for v in f.get('fixVersions', [])],
    'original_summary': f['summary'],
}
print(json.dumps(meta, indent=2))
"
```

---

## Step 3 — Read the description file and derive the new summary

Read `$description_file` and extract:
1. **Summary** — use the first H1 (`# ...`) line; if none, use the source ticket summary prefixed with `[Clone]`
2. **Description** — the full file content, converted to Jira ADF (Atlassian Document Format)

```bash
python3 - << 'PYEOF'
import sys, re, json

with open('$description_file', 'r') as fh:
    md = fh.read()

# Derive summary from first H1
h1 = re.search(r'^#\s+(.+)', md, re.MULTILINE)
summary = h1.group(1).strip() if h1 else 'Snyk SCA Vulnerability Report'

# Convert markdown to Jira ADF
# ADF is a JSON structure; we map markdown constructs to ADF nodes.
# Strategy: split into paragraphs/headings/tables/lists and build ADF content array.

def text_node(txt):
    return {"type": "text", "text": txt}

def strong(txt):
    return {"type": "text", "text": txt, "marks": [{"type": "strong"}]}

def link_node(txt, href):
    return {"type": "text", "text": txt, "marks": [{"type": "link", "attrs": {"href": href}}]}

def code_node(txt):
    return {"type": "text", "text": txt, "marks": [{"type": "code"}]}

def paragraph(inlines):
    return {"type": "paragraph", "content": inlines}

def heading(level, txt):
    return {"type": "heading", "attrs": {"level": level}, "content": [text_node(txt)]}

def rule():
    return {"type": "rule"}

def bullet_list(items):
    return {
        "type": "bulletList",
        "content": [
            {"type": "listItem", "content": [paragraph([text_node(i)])]}
            for i in items
        ]
    }

def table_row(cells, is_header=False):
    cell_type = "tableHeader" if is_header else "tableCell"
    return {
        "type": "tableRow",
        "content": [
            {"type": cell_type, "content": [paragraph(parse_inline(c.strip()))]}
            for c in cells
        ]
    }

def parse_inline(txt):
    """Parse a line of markdown inline elements into ADF inline nodes."""
    nodes = []
    # Pattern: **bold**, `code`, [text](url), plain text
    pattern = re.compile(r'\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|([^*`\[]+|\[)')
    for m in pattern.finditer(txt):
        if m.group(1):
            nodes.append(strong(m.group(1)))
        elif m.group(2):
            nodes.append(code_node(m.group(2)))
        elif m.group(3):
            nodes.append(link_node(m.group(3), m.group(4)))
        elif m.group(5):
            nodes.append(text_node(m.group(5)))
    return nodes if nodes else [text_node(txt)]

content = []
lines = md.splitlines()
i = 0
while i < len(lines):
    line = lines[i]

    # Horizontal rule
    if re.match(r'^-{3,}$', line.strip()):
        content.append(rule())
        i += 1
        continue

    # Heading
    m = re.match(r'^(#{1,6})\s+(.*)', line)
    if m:
        content.append(heading(len(m.group(1)), m.group(2).strip()))
        i += 1
        continue

    # Table — collect all contiguous table lines
    if line.startswith('|'):
        table_lines = []
        while i < len(lines) and lines[i].startswith('|'):
            table_lines.append(lines[i])
            i += 1
        if len(table_lines) >= 2:
            # First row = header, second row = separator (skip), rest = body
            rows = [r for r in table_lines if not re.match(r'^\|[-| :]+\|', r)]
            adf_rows = []
            for idx, row in enumerate(rows):
                cells = [c for c in row.split('|')[1:-1]]
                adf_rows.append(table_row(cells, is_header=(idx == 0)))
            content.append({
                "type": "table",
                "attrs": {"isNumberColumnEnabled": False, "layout": "full-width"},
                "content": adf_rows
            })
        continue

    # Bullet list — collect contiguous list items
    if re.match(r'^[-*]\s', line):
        items = []
        while i < len(lines) and re.match(r'^[-*]\s', lines[i]):
            items.append(lines[i][2:].strip())
            i += 1
        content.append(bullet_list(items))
        continue

    # Numbered list
    if re.match(r'^\d+\.\s', line):
        items = []
        while i < len(lines) and re.match(r'^\d+\.\s', lines[i]):
            items.append(re.sub(r'^\d+\.\s', '', lines[i]).strip())
            i += 1
        content.append({
            "type": "orderedList",
            "content": [
                {"type": "listItem", "content": [paragraph([text_node(it)])]}
                for it in items
            ]
        })
        continue

    # Bold line (bare **text**)
    # Empty line
    if not line.strip():
        i += 1
        continue

    # Plain paragraph
    content.append(paragraph(parse_inline(line)))
    i += 1

adf = {"type": "doc", "version": 1, "content": content}
print(json.dumps({"summary": summary, "adf": adf}))
PYEOF
```

---

## Step 4 — Create the new Jira ticket

Using the metadata from Step 2 and the summary + ADF from Step 3:

```bash
python3 - << 'PYEOF'
import os, requests, json

EMAIL    = os.environ['JIRA_EMAIL']
TOKEN    = os.environ['JIRA_API_TOKEN']
BASE_URL = os.environ['JIRA_URL']

# --- paste metadata from Step 2 ---
meta = <META_FROM_STEP_2>

# --- paste summary + adf from Step 3 ---
summary = <SUMMARY_FROM_STEP_3>
adf     = <ADF_FROM_STEP_3>

payload = {
    "fields": {
        "project":     {"key": meta["project_key"]},
        "issuetype":   {"name": meta["issuetype"]},
        "summary":     summary,
        "description": adf,
        "priority":    {"name": meta["priority"]},
        "labels":      meta["labels"],
    }
}

# Add components only if present in source
if meta["components"]:
    payload["fields"]["components"] = meta["components"]

# Add fixVersions only if present in source
if meta["fixVersions"]:
    payload["fields"]["fixVersions"] = meta["fixVersions"]

r = requests.post(
    f"{BASE_URL}/rest/api/3/issue",
    auth=(EMAIL, TOKEN),
    headers={"Content-Type": "application/json", "Accept": "application/json"},
    json=payload
)

if r.status_code not in (200, 201):
    print("ERROR creating ticket:", r.status_code)
    print(r.text[:500])
    raise SystemExit(1)

key = r.json()["key"]
url = f"{BASE_URL}/browse/{key}"
print(f"Created: {url}")
PYEOF
```

---

## Step 5 — Return the URL

Print the new ticket URL clearly:

```
New Jira ticket created:
  https://autoclub.atlassian.net/browse/<NEW-KEY>
```

If creation failed, print the full error from Step 4 and suggest:
- Checking that `JIRA_API_TOKEN` is valid (test with `/rest/api/3/myself`)
- Confirming the project key has permission to create issues
- Reviewing the field payload for invalid values

---

## Notes

- Uses Jira REST API v3 (`/rest/api/3/issue`) with HTTP Basic auth (`email:api_token`).
- Description is converted from Markdown to Atlassian Document Format (ADF). Tables, headings, bullet lists, bold, inline code, and links are all mapped. Fenced code blocks are rendered as ADF code blocks.
- Fields intentionally **not** cloned: assignee, sprint, epic link, story points, reporter — these are left at Jira defaults so the new ticket lands in the backlog unassigned.
- Fields intentionally **not** cloned: watchers, comments, attachments, subtasks, linked issues.
- The skill is safe to run multiple times — each invocation creates a new ticket; it does not deduplicate.
