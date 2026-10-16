---
name: wiz-confused-deputy
description: "Fix IAM roles vulnerable to the confused deputy problem (Wiz IAM-203). Detects CDK-generated vs hand-written roles, applies the appropriate condition fix or CDK upgrade, creates a branch, and opens a PR."
trigger: when user mentions "confused deputy", "IAM-203", "trust policy condition", "SourceArn", "SourceAccount", or "deputy problem"
arguments: [profile, region, role_arn]
allowed-tools: Bash(aws *) Bash(npm *) Bash(npx *) Bash(grep *) Bash(find *) Bash(git *) Bash(gh *) Bash(python3 *) Bash(jq *) Bash(cd *) Read Write
---

# Wiz IAM-203 — Confused Deputy Fix

Resolves Wiz finding **"IAM Role should not be vulnerable to the confused deputy problem"**
across all environments. Supports two fix paths:

1. **CDK-generated roles** (e.g. `ProviderwaiterStatemachine`, `IsCompleteHandler`,
   `OnEventHandler`, `LogRetentionaae0aa3c5b4d`) — fix by upgrading `aws-cdk-lib`
2. **Hand-written roles** — fix by injecting `aws:SourceAccount` or `aws:SourceArn`
   into the role's trust policy in CDK/CloudFormation source

- **`$profile`** — AWS CLI profile (e.g. `prod-insurancepolicyinfo-ebiz-cloud-devops`)
- **`$region`** — AWS region (default: `us-west-2`)
- **`$role_arn`** — optional; scope to a single role ARN from a Wiz finding

> **Requires:** `GHE_WORKSPACE` env var set to the directory containing your cloned repos
> (e.g. `export GHE_WORKSPACE=/Users/you/repos`). Used to navigate into the repo for
> git operations. If unset, the skill stops after Phase 3 and prints the manual steps.

---

## Phase 1 — Prerequisites

```bash
which aws  || echo "ERROR: aws CLI not found — brew install awscli"
which jq   || echo "ERROR: jq not found — brew install jq"
aws sts get-caller-identity --profile $profile 2>&1 \
  || echo "ERROR: Not authenticated — run: aws sso login --profile $profile"
```

If any check fails, stop and print the exact fix command.

---

## Phase 2 — Identify Affected Roles

### 2a. If `$role_arn` was provided — inspect that single role

```bash
python3 - << 'PYEOF'
import subprocess, json, sys, os

PROFILE = '$profile'
REGION  = '$region'.strip() or 'us-west-2'
ROLE_ARN = '$role_arn'.strip()

def get_role(arn):
    name = arn.split('/')[-1]
    result = subprocess.run(
        ['aws', 'iam', 'get-role', '--profile', PROFILE, '--role-name', name,
         '--query', 'Role.{Name:RoleName,Arn:Arn,TrustPolicy:AssumeRolePolicyDocument}',
         '--output', 'json'],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"ERROR fetching role: {result.stderr}")
        sys.exit(1)
    return json.loads(result.stdout)

role = get_role(ROLE_ARN)
print(json.dumps([role], indent=2))
PYEOF
```

### 2b. If no `$role_arn` — scan the account for all affected roles

```bash
python3 - << 'PYEOF'
import subprocess, json, sys

PROFILE = '$profile'

# List all roles in the account
result = subprocess.run(
    ['aws', 'iam', 'list-roles', '--profile', PROFILE,
     '--query', 'Roles[*].{Name:RoleName,Arn:Arn,TrustPolicy:AssumeRolePolicyDocument}',
     '--output', 'json'],
    capture_output=True, text=True
)
if result.returncode != 0:
    print(f"ERROR: {result.stderr}")
    sys.exit(1)

roles = json.loads(result.stdout)

# Vulnerable services (matches Wiz's Rego rule)
VULNERABLE_SERVICES = [
    'lambda.amazonaws.com',
    'states.amazonaws.com',
    'apigateway.amazonaws.com',
    'edgelambda.amazonaws.com',
    'events.amazonaws.com',
    'firehose.amazonaws.com',
    'glue.amazonaws.com',
    'iot.amazonaws.com',
    'logger.cloudwatch.amazonaws.com',
    'replication.dynamodb.amazonaws.com',
    's3.amazonaws.com',
    'sns.amazonaws.com',
    'sqs.amazonaws.com',
    'ssm.amazonaws.com',
    'transfer.amazonaws.com',
]

# Conditions that fix the confused deputy problem
SAFE_CONDITION_KEYS = [
    'aws:sourcearn',
    'aws:sourceaccount',
    'aws:sourceorgid',
    'aws:sourceorgpaths',
    'aws:sourcevpc',
    'aws:sourcevpce',
]

def is_vulnerable(trust_policy):
    for stmt in trust_policy.get('Statement', []):
        if stmt.get('Effect') != 'Allow':
            continue
        principal = stmt.get('Principal', {})
        services = principal if isinstance(principal, list) else (
            principal.get('Service', []) if isinstance(principal, dict) else [principal]
        )
        if isinstance(services, str):
            services = [services]
        if not any(svc in VULNERABLE_SERVICES for svc in services):
            continue
        # Check if a safe condition exists
        conditions = stmt.get('Condition', {})
        cond_keys_lower = [k.lower() for block in conditions.values()
                           for k in (block.keys() if isinstance(block, dict) else [])]
        if not any(safe in cond_keys_lower for safe in SAFE_CONDITION_KEYS):
            return True, [s for s in services if s in VULNERABLE_SERVICES]
    return False, []

vulnerable = []
for role in roles:
    tp = role.get('TrustPolicy', {})
    if isinstance(tp, str):
        tp = json.loads(tp)
    vuln, services = is_vulnerable(tp)
    if vuln:
        vulnerable.append({**role, 'VulnerableServices': services})

print(f"\nFound {len(vulnerable)} vulnerable role(s):\n", file=__import__('sys').stderr)
for r in vulnerable:
    print(f"  {r['Name']} — services: {r['VulnerableServices']}", file=__import__('sys').stderr)

with open('/tmp/wiz-confused-deputy-roles.json', 'w') as f:
    json.dump(vulnerable, f, indent=2)

print(json.dumps(vulnerable, indent=2))
PYEOF
```

If zero roles found, print `No confused deputy issues found in this account.` and stop.

---

## Phase 3 — Classify Each Role

For each vulnerable role, determine whether it is **CDK-generated** or **hand-written**:

```python
CDK_PATTERNS = [
    'ProviderwaiterStatemachine',
    'ProviderframeworkonEvent',
    'ProviderframeworkisCompl',
    'ProviderframeworkonTimeo',
    'IsCompleteHandler',
    'OnEventHandler',
    'LogRetentionaae0aa3c5b4d',
    'CustomResourceHandler',
]

def classify(role_name):
    return 'cdk' if any(p in role_name for p in CDK_PATTERNS) else 'handwritten'
```

Build a classification table:

```
| Role | Service | Type | Fix Path |
|------|---------|------|----------|
| cmn-insurancepolicyinfo-d-Providerwaiterstatemachin-EsgMHjij5zBv | states.amazonaws.com | CDK | Upgrade aws-cdk-lib |
| my-custom-integration-role | lambda.amazonaws.com | hand-written | Add SourceAccount condition |
```

---

## Phase 4a — CDK Fix (for CDK-generated roles)

CDK newer versions add `aws:SourceAccount` to generated role trust policies automatically.

### Step 0 — Verify GHE_WORKSPACE and gh auth

```bash
python3 -c "
import os, subprocess, sys

ws = os.environ.get('GHE_WORKSPACE', '').strip()
if not ws:
    print('ERROR: GHE_WORKSPACE is not set.')
    print('Set it to the directory containing your cloned repos:')
    print('  export GHE_WORKSPACE=/Users/you/repos')
    print('Add to ~/.zshrc to persist across sessions.')
    sys.exit(1)
if not os.path.isdir(ws):
    print(f'ERROR: GHE_WORKSPACE={ws} does not exist or is not a directory.')
    sys.exit(1)
print(f'OK - GHE_WORKSPACE: {ws}')
"

gh auth status || echo "ERROR: gh not authenticated — run: gh auth login"
```

If either check fails, stop and print the exact fix command.

### Step 1 — Find the repo that owns these stacks

```bash
python3 - << 'PYEOF'
import subprocess, json, sys, os

roles = json.load(open('/tmp/wiz-confused-deputy-roles.json'))
GHE_WORKSPACE = os.environ.get('GHE_WORKSPACE', '')

repo_map = {}  # role_name → { repo, local_path }

for role in roles:
    name = role['Name']
    # Extract the CDK stack fragment — strip the random suffix (last segment after final -)
    # e.g. cmn-insurancepolicyinfo-d-Providerwaiterstatemachin-EsgMHjij5zBv
    # → search fragment: cmn-insurancepolicyinfo-d
    parts = name.split('-')
    # Use first 3–4 segments as the search fragment (before CDK pattern keywords)
    CDK_KEYWORDS = ['Provider', 'IsComplete', 'OnEvent', 'LogRetention', 'Custom']
    fragment = name
    for i, p in enumerate(parts):
        if any(kw in p for kw in CDK_KEYWORDS):
            fragment = '-'.join(parts[:i])
            break

    result = subprocess.run(
        ['gh', 'search', 'code', fragment, '--owner', 'ACE-Clublabs',
         '--json', 'repository,path'],
        capture_output=True, text=True
    )
    if result.returncode != 0 or not result.stdout.strip():
        print(f"  WARNING: No repo found for fragment '{fragment}' (role: {name})")
        continue

    hits = json.loads(result.stdout)
    if not hits:
        print(f"  WARNING: No repo found for fragment '{fragment}' (role: {name})")
        continue

    repo_name = hits[0]['repository']['nameWithOwner'].split('/')[-1]
    local_path = os.path.join(GHE_WORKSPACE, repo_name)
    repo_map[name] = {
        'repo': hits[0]['repository']['nameWithOwner'],
        'repo_name': repo_name,
        'local_path': local_path,
        'path': hits[0]['path'],
        'exists_locally': os.path.isdir(local_path),
    }
    print(f"  {name} → {hits[0]['repository']['nameWithOwner']} ({hits[0]['path']})")
    if not os.path.isdir(local_path):
        print(f"    WARNING: {local_path} not found locally — clone it first:")
        print(f"    git clone https://github.com/{hits[0]['repository']['nameWithOwner']} {local_path}")

with open('/tmp/wiz-confused-deputy-repo-map.json', 'w') as f:
    json.dump(repo_map, f, indent=2)

print(json.dumps(repo_map, indent=2))
PYEOF
```

If any repo is not cloned locally, stop and print the clone command. Do not proceed until all repos exist at their local paths.

### Step 1b — Prepare git branch in each affected repo

```bash
python3 - << 'PYEOF'
import subprocess, json, sys, os

repo_map = json.load(open('/tmp/wiz-confused-deputy-repo-map.json'))
BRANCH = 'fix/wiz-iam-203-confused-deputy'

seen_repos = set()
for role_name, info in repo_map.items():
    repo_key = info['repo_name']
    if repo_key in seen_repos:
        continue
    seen_repos.add(repo_key)

    path = info['local_path']
    print(f"\n=== {info['repo']} ===")

    for cmd in [
        ['git', '-C', path, 'checkout', 'main'],
        ['git', '-C', path, 'pull', 'origin', 'main'],
        ['git', '-C', path, 'checkout', '-b', BRANCH],
    ]:
        result = subprocess.run(cmd, capture_output=True, text=True)
        label = ' '.join(cmd[2:])
        if result.returncode != 0:
            # Branch may already exist — try switching to it
            if 'checkout' in cmd and '-b' in cmd:
                result2 = subprocess.run(
                    ['git', '-C', path, 'checkout', BRANCH],
                    capture_output=True, text=True
                )
                if result2.returncode == 0:
                    print(f"  {label}: branch already exists — switched to it")
                    continue
            print(f"  ERROR: {label}: {result.stderr.strip()}")
            sys.exit(1)
        print(f"  ✓ {label}")
PYEOF
```

### Step 2 — Check current aws-cdk-lib version in each repo

```bash
python3 - << 'PYEOF'
import subprocess, json, os

repo_map = json.load(open('/tmp/wiz-confused-deputy-repo-map.json'))
seen = set()
for info in repo_map.values():
    p = info['local_path']
    if p in seen or not os.path.isdir(p):
        continue
    seen.add(p)
    result = subprocess.run(
        ['grep', '-r', '"aws-cdk-lib"', '--include=package.json', p],
        capture_output=True, text=True
    )
    current = result.stdout.strip() or '(not found)'
    print(f"{info['repo_name']}:\n  {current}")
PYEOF
```

### Step 3 — Find the minimum CDK version that fixes confused deputy on Provider roles

```bash
# Fetch latest aws-cdk-lib and aws-cdk CLI versions from npm at runtime
LATEST_CDK_LIB=$(npm view aws-cdk-lib version)
LATEST_CDK_CLI=$(npm view aws-cdk version)
echo "Latest aws-cdk-lib : $LATEST_CDK_LIB"
echo "Latest aws-cdk CLI : $LATEST_CDK_CLI"
```

Known fix versions (verify at runtime — do not rely on these being current):
- `aws-cdk-lib >= 2.150.0` added `aws:SourceAccount` to most service-principal trust policies
- Always confirm the version from npm before bumping

### Step 4 — Bump aws-cdk-lib and aws-cdk CLI in each repo

```bash
python3 - << 'PYEOF'
import subprocess, json, os, re

repo_map = json.load(open('/tmp/wiz-confused-deputy-repo-map.json'))

latest_lib = subprocess.run(['npm', 'view', 'aws-cdk-lib', 'version'],
    capture_output=True, text=True).stdout.strip()
latest_cli = subprocess.run(['npm', 'view', 'aws-cdk', 'version'],
    capture_output=True, text=True).stdout.strip()

seen = set()
for info in repo_map.values():
    path = info['local_path']
    if path in seen or not os.path.isdir(path):
        continue
    seen.add(path)
    print(f"\n=== {info['repo_name']} — bumping aws-cdk-lib to {latest_lib}, aws-cdk to {latest_cli} ===")

    # Find all package.json files (excluding node_modules)
    result = subprocess.run(
        ['find', path, '-name', 'package.json',
         '-not', '-path', '*/node_modules/*',
         '-not', '-path', '*/dist/*',
         '-not', '-path', '*/cdk.out/*'],
        capture_output=True, text=True
    )
    pkg_files = [f for f in result.stdout.strip().split('\n') if f]

    for pkg_file in pkg_files:
        content = open(pkg_file).read()
        original = content
        content = re.sub(
            r'"aws-cdk-lib":\s*"[^"]*"',
            f'"aws-cdk-lib": "^{latest_lib}"',
            content
        )
        content = re.sub(
            r'"aws-cdk":\s*"[^"]*"',
            f'"aws-cdk": "^{latest_cli}"',
            content
        )
        if content != original:
            open(pkg_file, 'w').write(content)
            print(f"  Updated: {pkg_file.replace(path, '')}")

    # Install dependencies
    use_yarn = os.path.exists(os.path.join(path, 'yarn.lock'))
    install_cmd = ['yarn', 'install'] if use_yarn else ['npm', 'install']
    print(f"  Running: {' '.join(install_cmd)}")
    result = subprocess.run(install_cmd, cwd=path, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ERROR: install failed:\n{result.stderr}")
    else:
        print(f"  ✓ install complete")
PYEOF
```

### Step 5 — Verify cdk synth still passes

```bash
find . -name "cdk.json" -not -path "*/node_modules/*" -not -path "*/cdk.out/*" | while read f; do
  DIR=$(dirname "$f")
  echo "Synthesizing $DIR..."
  (cd "$DIR" && npx cdk synth > /dev/null && echo "✅ $DIR OK") || echo "❌ $DIR FAILED"
done
```

If any synthesis fails, investigate the CDK CLI compatibility issue (see the snyk-fix CDK check section) and resolve before proceeding.

### Step 6 — Verify the generated trust policy now includes SourceAccount

```bash
# After synth, inspect the generated CFN template for the role
find cdk.out -name "*.template.json" | xargs grep -l "ProviderwaiterStatemachine\|ProviderframeworkonEvent" \
  | while read f; do
    echo "=== $f ==="
    python3 -c "
import json, sys
t = json.load(open('$f'))
for k, v in t.get('Resources', {}).items():
    if v.get('Type') == 'AWS::IAM::Role':
        props = v.get('Properties', {})
        name = props.get('RoleName', k)
        stmts = props.get('AssumeRolePolicyDocument', {}).get('Statement', [])
        for s in stmts:
            cond = s.get('Condition', {})
            has_fix = any('sourceaccount' in str(k).lower() or 'sourcearn' in str(k).lower()
                          for k in cond.keys())
            if not has_fix:
                print(f'  STILL VULNERABLE: {name}')
            else:
                print(f'  FIXED: {name} — condition: {list(cond.keys())}')
"
  done
```

If roles are still missing the condition after the CDK upgrade, proceed to Phase 4b for those specific roles.

---

## Phase 4b — Hand-written / CDK Escape Hatch Fix

For roles that are hand-written in CDK/CFN, or where the CDK upgrade did not add the condition:

### Option A — CDK `addToPolicy` / `grant` escape hatch

In the CDK stack that defines the role, add the condition after role creation:

```typescript
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

// After the role is defined:
role.assumeRolePolicy?.addStatements(new PolicyStatement({
  effect: Effect.DENY,
  principals: [new ServicePrincipal('states.amazonaws.com')],
  actions: ['sts:AssumeRole'],
  conditions: {
    StringNotEquals: {
      'aws:SourceAccount': Stack.of(this).account,
    },
  },
}));

// Or replace the existing Allow statement with a conditioned one:
// (Use cfnRole.addOverride for fine-grained control on L1 constructs)
const cfnRole = role.node.defaultChild as CfnRole;
cfnRole.addOverride('Properties.AssumeRolePolicyDocument.Statement.0.Condition', {
  StringEquals: { 'aws:SourceAccount': Stack.of(this).account },
});
```

### Option B — Direct trust policy update (break-glass only)

If a CDK fix is not yet possible, update the trust policy directly in AWS as a temporary measure:

```bash
ROLE_NAME="<role-name>"
ACCOUNT_ID=$(aws sts get-caller-identity --profile $PROFILE --query Account --output text)

# Get current trust policy
aws iam get-role --profile $PROFILE --role-name $ROLE_NAME \
  --query 'Role.AssumeRolePolicyDocument' --output json > /tmp/trust-policy.json

# Inject SourceAccount condition into each vulnerable statement
python3 - << 'PYEOF'
import json

ACCOUNT_ID = '<account-id>'
with open('/tmp/trust-policy.json') as f:
    policy = json.load(f)

for stmt in policy.get('Statement', []):
    if stmt.get('Effect') != 'Allow':
        continue
    principal = stmt.get('Principal', {})
    services = principal if isinstance(principal, list) else principal.get('Service', [])
    if not services:
        continue
    if isinstance(services, str):
        services = [services]
    if not any('amazonaws.com' in s for s in services):
        continue
    # Add SourceAccount condition
    if 'Condition' not in stmt:
        stmt['Condition'] = {}
    stmt['Condition'].setdefault('StringEquals', {})['aws:SourceAccount'] = ACCOUNT_ID

with open('/tmp/trust-policy-fixed.json', 'w') as f:
    json.dump(policy, f, indent=2)

print("Fixed policy written to /tmp/trust-policy-fixed.json")
print(json.dumps(policy, indent=2))
PYEOF

# Apply the updated trust policy
aws iam update-assume-role-policy \
  --profile $PROFILE \
  --role-name $ROLE_NAME \
  --policy-document file:///tmp/trust-policy-fixed.json

echo "Trust policy updated for $ROLE_NAME"
```

> **Note:** Direct trust policy updates are overwritten on the next CDK deploy. The proper fix is always in the CDK source (Option A). Use Option B only as a temporary measure while the CDK fix is in progress.

---

## Phase 5 — Verify Fix

### 5a. Verify via AWS CLI (for deployed roles)

```bash
python3 - << 'PYEOF'
import subprocess, json, sys

PROFILE = '$profile'
roles = json.load(open('/tmp/wiz-confused-deputy-roles.json'))

SAFE_CONDITION_KEYS = ['aws:sourcearn', 'aws:sourceaccount', 'aws:sourceorgid']

still_vulnerable = []
for role in roles:
    result = subprocess.run(
        ['aws', 'iam', 'get-role', '--profile', PROFILE,
         '--role-name', role['Name'],
         '--query', 'Role.AssumeRolePolicyDocument',
         '--output', 'json'],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  ERROR reading {role['Name']}: {result.stderr}")
        continue
    tp = json.loads(result.stdout)
    for stmt in tp.get('Statement', []):
        cond = stmt.get('Condition', {})
        cond_keys = [k.lower() for block in cond.values()
                     for k in (block.keys() if isinstance(block, dict) else [])]
        if not any(safe in cond_keys for safe in SAFE_CONDITION_KEYS):
            still_vulnerable.append(role['Name'])
            break

if still_vulnerable:
    print(f"STILL VULNERABLE ({len(still_vulnerable)}):")
    for r in still_vulnerable:
        print(f"  {r}")
    sys.exit(1)
else:
    print(f"✅ All {len(roles)} role(s) now have SourceAccount/SourceArn conditions.")
PYEOF
```

### 5b. Verify via Wiz (after deploy)

Wiz re-scans continuously. After deploying the CDK fix:
- Allow 1–4 hours for Wiz to pick up the updated trust policies
- The finding status should move from `Open` to `Resolved`
- If still Open after 4 hours, re-run Phase 2 to confirm the condition was actually deployed

---

## Phase 5c — Commit and Open PR

Run this phase only after `cdk synth` passes (Phase 4a Step 5) and the generated templates
show `SourceAccount` conditions (Phase 4a Step 6).

```bash
python3 - << 'PYEOF'
import subprocess, json, os

repo_map   = json.load(open('/tmp/wiz-confused-deputy-repo-map.json'))
roles      = json.load(open('/tmp/wiz-confused-deputy-roles.json'))
BRANCH     = 'fix/wiz-iam-203-confused-deputy'

# Collect affected role names per repo for the PR body
repo_roles = {}
for role in roles:
    info = repo_map.get(role['Name'])
    if not info:
        continue
    repo_roles.setdefault(info['repo_name'], []).append(role['Name'])

seen = set()
pr_results = []

for role_name, info in repo_map.items():
    repo_key = info['repo_name']
    if repo_key in seen:
        continue
    seen.add(repo_key)

    path = info['local_path']
    if not os.path.isdir(path):
        print(f"  SKIP {repo_key}: local path not found")
        continue

    # Check if there are actual changes to commit
    diff = subprocess.run(
        ['git', '-C', path, 'diff', '--name-only'],
        capture_output=True, text=True
    )
    changed_files = [f for f in diff.stdout.strip().split('\n') if f]
    if not changed_files:
        print(f"  SKIP {repo_key}: no changes to commit")
        continue

    print(f"\n=== {info['repo']} — {len(changed_files)} file(s) changed ===")
    for f in changed_files:
        print(f"  {f}")

    # Stage and commit
    subprocess.run(['git', '-C', path, 'add'] + changed_files, check=True)

    role_list = ', '.join(repo_roles.get(repo_key, []))
    commit_msg = (
        f"fix: upgrade aws-cdk-lib to resolve Wiz IAM-203 confused deputy (SourceAccount)\n\n"
        f"Affected roles: {role_list}\n\n"
        f"Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
    )
    result = subprocess.run(
        ['git', '-C', path, 'commit', '-m', commit_msg],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  ERROR committing: {result.stderr}")
        continue
    print(f"  ✓ committed")

    # Push branch
    result = subprocess.run(
        ['git', '-C', path, 'push', '-u', 'origin', BRANCH],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  ERROR pushing: {result.stderr}")
        continue
    print(f"  ✓ pushed branch {BRANCH}")

    # Build PR body
    pr_body_path = f'/tmp/wiz-iam203-pr-body-{repo_key}.md'
    pr_body = f"""## Summary

- Upgrade `aws-cdk-lib` to latest to resolve Wiz IAM-203 (confused deputy problem)
- Affected IAM roles now receive `aws:SourceAccount` condition on their trust policies via CDK upgrade

## Affected Roles

{chr(10).join(f'- `{r}`' for r in repo_roles.get(repo_key, []))}

## Wiz Finding

**IAM-203** — IAM Role should not be vulnerable to the confused deputy problem  
**Severity:** Medium  
**Fix:** `aws-cdk-lib` >= 2.150.0 adds `aws:SourceAccount` to Provider-generated role trust policies automatically

## Test Plan

- [ ] `cdk synth` passes — no synthesis errors
- [ ] Generated CFN templates include `aws:SourceAccount` condition on affected roles
- [ ] Deploy to dev/UAT — confirm Wiz finding moves to Resolved within 1–4h
- [ ] Deploy to prod

🤖 Generated with [Claude Code](https://claude.com/claude-code)
"""
    open(pr_body_path, 'w').write(pr_body)

    # Create PR
    result = subprocess.run(
        ['gh', 'pr', 'create',
         '--title', f'fix: [Wiz IAM-203] confused deputy — upgrade aws-cdk-lib ({repo_key})',
         '--body-file', pr_body_path,
         '--base', 'main'],
        capture_output=True, text=True, cwd=path
    )
    if result.returncode != 0:
        print(f"  ERROR creating PR: {result.stderr}")
    else:
        pr_url = result.stdout.strip()
        print(f"  ✓ PR created: {pr_url}")
        pr_results.append({'repo': info['repo'], 'pr_url': pr_url})

    # Cleanup temp file
    os.remove(pr_body_path)

# Save PR results for Phase 6 summary
with open('/tmp/wiz-confused-deputy-prs.json', 'w') as f:
    json.dump(pr_results, f, indent=2)
PYEOF
```

---

## Phase 6 — Summary

Print a summary table:

```
╔══════════════════════════════════════════════════╗
║     CONFUSED DEPUTY FIX SUMMARY                 ║
╠══════════════════════════════════════════════════╣
║ Account        : <account>                      ║
║ Roles found    : <N>                            ║
║ CDK-generated  : <N> → fix: aws-cdk-lib upgrade ║
║ Hand-written   : <N> → fix: trust policy patch  ║
║ Verified clean : <N>                            ║
║ Still open     : <N>                            ║
║ PRs created    : <N>                            ║
╚══════════════════════════════════════════════════╝
```

For each role, state:
- Role name
- Fix type applied (CDK upgrade / direct policy update)
- Verification result (✅ fixed / ❌ still vulnerable)
- Whether a CDK deploy is still needed to make it permanent

For each PR, print the URL:
```bash
python3 -c "
import json
prs = json.load(open('/tmp/wiz-confused-deputy-prs.json'))
for p in prs:
    print(f\"  {p['repo']}: {p['pr_url']}\")
" 2>/dev/null || echo "  (no PRs recorded)"
```

---

## Notes

- CDK-generated roles (`ProviderwaiterStatemachine`, `IsCompleteHandler`, etc.) are owned by
  `aws-cdk-lib` internals — do not attempt to edit them manually in CDK source.
  The only durable fix is a `aws-cdk-lib` version upgrade.
- Direct trust policy updates (Phase 4b Option B) are **overwritten on the next CDK deploy**.
  Always follow up with a CDK fix.
- `aws:SourceAccount` is preferred over `aws:SourceArn` for CDK-generated roles because the
  ARN of the generating resource (e.g. a custom resource) is not always known at stack-definition time.
- This finding is Medium severity in Wiz — real-world exploitability requires an attacker to
  already have a foothold in another AWS account. Prioritise after High/Critical findings.
- Requires: AWS CLI authenticated to the target account profile; `gh` authenticated for
  repo search (Phase 4a Step 1).
