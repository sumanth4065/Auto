export const meta = {
  name: 'security-scan',
  description: 'Run Wiz + Snyk security scans across repos, fix vulnerabilities, create PRs, then best-effort Jira tickets',
  phases: [
    { title: 'Setup', detail: 'Load team presets and resolve repo paths' },
    { title: 'Epic', detail: 'Verify tool auth + read parent epic for dedup — in parallel' },
    { title: 'Scan', detail: 'Wiz + Snyk run in parallel per repo' },
    { title: 'Review', detail: 'Present consolidated report — PAUSES for user approval before fixes proceed' },
    { title: 'Fix', detail: 'Apply code fixes per repo based on findings' },
    { title: 'Verify', detail: 'Run snyk test locally — gate: block push if new issues found' },
    { title: 'Code Review', detail: 'Run /review on each repo branch changes' },
    { title: 'PR', detail: 'Create PRs for verified changes and push' },
    { title: 'Jira Tickets', detail: 'Best-effort: create tickets under parent epic, link PRs' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// WORKFLOW CONTRACT
// ═══════════════════════════════════════════════════════════════════════════════
//
// Objective:
//   Fix Snyk + Wiz vulnerabilities (CRITICAL, HIGH) across team repos — MEDIUM is reported but not blocking
//   in parallel. Produce evidence that fixes work. Create Jira tickets linked to
//   the quarterly epic. Zero failures after merge to main.
//
// Boundaries:
//   - Repos: team preset OR explicit --repos list. Nothing outside that scope.
//   - Severities: CRITICAL and HIGH are fixed and gated; MEDIUM is reported but does not block the workflow.
//   - Scanners: Wiz + Snyk by default, can be narrowed via sources: ["snyk"].
//   - Changes: only security-related dependency bumps, CDK upgrades, config fixes.
//   - No manual intervention during fix — human gate is at Review + Evidence only.
//
// Role map (each agent has one job):
//   - Epic Reader      → fetch parent epic + existing children for dedup
//   - Prereq Checker   → verify all tools are authenticated
//   - Wiz Scanner      → fetch Wiz findings per repo (parallel)
//   - Snyk Scanner     → run snyk test per repo (parallel)
//   - Ticket Creator   → create one Jira Story per (repo × source × bucket)
//   - Fixer            → apply code changes per repo based on findings
//   - Verifier         → run local snyk test post-fix — GATE: block if HIGH/CRIT remain
//   - Code Reviewer    → review staged changes for correctness/security
//   - PR Creator       → commit, push, create PR with linked tickets
//   - Evidence Collector → fetch post-merge build scan, attach to ticket
//
// Evidence standard:
//   - A finding is valid if: Wiz API returns it as OPEN with HIGH/CRITICAL/MEDIUM
//     OR Snyk CLI reports it with a CVE/SNYK-ID.
//   - A fix is proven if: local `snyk test` post-fix shows zero HIGH/CRITICAL.
//   - A fix is confirmed if: GHA build Snyk step passes after merge.
//   - Evidence attached to ticket: raw scan excerpt from build log + pass/fail status.
//
// Stop rule:
//   - PAUSE at Review — user must confirm before fixes proceed
//   - STOP at Verify if ALL repos fail local scan (nothing safe to push)
//   - STOP at Code Review if ALL repos have critical review issues
//   - Error-and-continue per repo — never abort the full run for one repo failure
//   - Never push code that fails the local scan gate (zero failures after merge)
//
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Team Presets ──────────────────────────────────────────────────────────────
// Team repo lists live in a separate file: team-presets.js (same directory).
// To add or update a team, edit team-presets.js — no need to touch this file.

phase('Setup');
log('Loading team presets and resolving repo paths...');
const presetsRaw = await agent(
  `Read the file .claude/workflows/team-presets.js (relative to the current working directory).

Then resolve the BASE_PATH for repo paths:
  Run: printenv GHE_WORKSPACE
  If the output is empty, stop and tell the user: "GHE_WORKSPACE is not set. Add 'export GHE_WORKSPACE=/path/to/your/repos' to your shell profile and restart the terminal."

Return the result as an object with a "teams" array. Each entry must have:
  - team: the team name key (e.g. "iss-yosemite")
  - wizProject: the wizProject string (e.g. "iss")
  - repos: array of { name, displayName, path } where path = BASE_PATH + "/" + name

Example output:
{
  "teams": [
    {
      "team": "iss-yosemite",
      "wizProject": "iss",
      "repos": [
        { "name": "insurance-self-service_insurancepolicychange_autoiq", "displayName": "autoiq", "path": "<BASE_PATH>/insurance-self-service_insurancepolicychange_autoiq" }
      ]
    }
  ]
}`,
  {
    label: 'load-presets',
    schema: {
      type: 'object',
      properties: {
        teams: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              team: { type: 'string' },
              wizProject: { type: 'string' },
              repos: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    displayName: { type: 'string' },
                    path: { type: 'string' },
                  },
                  required: ['name', 'displayName', 'path'],
                },
              },
            },
            required: ['team', 'wizProject', 'repos'],
          },
        },
      },
      required: ['teams'],
    },
  }
);

log(`Presets loaded — ${(presetsRaw && presetsRaw.teams || []).length} team(s) found`);

// Convert to a map keyed by team name
const TEAM_PRESETS = ((presetsRaw && presetsRaw.teams) || []).reduce((acc, entry) => {
  acc[entry.team] = { wizProject: entry.wizProject, repos: entry.repos };
  return acc;
}, {});

// ─── Configuration ─────────────────────────────────────────────────────────────
// Usage — always scans and fixes. epicKey is ALWAYS required (changes each quarter).
//
//   Scan + fix specific repos:
//     args: { epicKey: 'ISS-XXXXX', repos: ['cmn-policyview'] }
//     args: { epicKey: 'ISS-XXXXX', repos: ['billing-summary', 'autoiq'] }
//
//   Run only Snyk (skip Wiz):
//     args: { epicKey: 'ISS-XXXXX', repos: ['cmn-policyview'], sources: ['snyk'] }
//
//   Run only Wiz (skip Snyk):
//     args: { epicKey: 'ISS-XXXXX', repos: ['cmn-policyview'], sources: ['wiz'] }
//
//   Approve all proposed tickets after Review gate:
//     args: { epicKey: 'ISS-XXXXX', repos: ['cmn-policyview'], confirmed: true, approvedIndexes: 'all' }
//
//   Approve specific tickets (by # shown in Review summary):
//     args: { epicKey: 'ISS-XXXXX', repos: ['cmn-policyview'], confirmed: true, approvedIndexes: [1, 3] }
//
//   Skip re-scanning using cached results from a previous run:
//     args: { epicKey: 'ISS-XXXXX', repos: ['cmn-policyview'], confirmed: true,
//             approvedIndexes: [1, 3], previousResults: <proposedTickets from prior run> }

// Defensively parse args — handles both object and JSON-string forms
let parsedArgs;
try {
  parsedArgs = (typeof args === 'string') ? JSON.parse(args) : (args || {});
} catch (e) {
  log(`ERROR: Failed to parse args as JSON: ${e.message}`);
  return { status: 'error', message: `Invalid JSON args: ${e.message}` };
}

// ─── Help mode — print usage only when explicitly requested or no epicKey and no repos ─
const showHelp = !parsedArgs || parsedArgs.help === true || (!parsedArgs.epicKey && !parsedArgs.repos && parsedArgs.help !== false);

if (showHelp) {
  log(`Security Scan Workflow — missing required input: epicKey\n\nPlease tell Claude: "run the security-scan workflow, epic ISS-XXXXX"\n\nOptional: specify team (default: iss-yosemite), repos (default: all team repos), or sources: snyk / wiz / both.\nExamples:\n  - "run security-scan, epic ISS-17912" — scans all iss-yosemite repos\n  - "run security-scan, epic ISS-17912, repos: billing-summary, autoiq"\n  - "run security-scan, epic ISS-17912, repos: all, team: iss-zion"`);
  return { status: 'help' };
}

// Default team to iss-yosemite when not provided
const resolvedTeam = parsedArgs.team || 'iss-yosemite';

// Resolve preset — unknown team is allowed if repos are explicitly passed
const preset = TEAM_PRESETS[resolvedTeam] || null;
if (!preset) {
  if (!parsedArgs.repos || (Array.isArray(parsedArgs.repos) && parsedArgs.repos.length === 0)) {
    log(`ERROR: Unknown team "${resolvedTeam}" and no repos provided. Available teams: ${Object.keys(TEAM_PRESETS).join(', ')}`);
    log(`To use a custom repo list, pass repos explicitly: args: { epicKey: "ISS-XXXXX", repos: ["my-repo"] }`);
    return { status: 'error', message: `Unknown team: ${resolvedTeam}` };
  }
  log(`Team "${resolvedTeam}" not found in presets — using explicitly provided repos.`);
}

// epicKey must always be passed explicitly — it changes each quarter
const resolvedEpicKey = parsedArgs.epicKey;
if (!resolvedEpicKey) {
  log('Missing: epicKey — please tell Claude the Jira epic key (e.g. "run security-scan, epic ISS-17912")');
  return { status: 'error', message: 'epicKey is required' };
}

// sources: which scanners to run — default is both
const defaultSources = ['wiz', 'snyk'];
const requestedSources = Array.isArray(parsedArgs.sources) ? parsedArgs.sources.map(s => s.toLowerCase()) : defaultSources;

// Resolve repos — accepts short names ("cmn-policyview"), full objects, or nothing (= all team repos)
const allPresetRepos = (preset && preset.repos) || [];

// GHE_WORKSPACE resolved at runtime for ad-hoc repo paths
const GHE_WORKSPACE_PATH = presetsRaw && presetsRaw.teams && presetsRaw.teams[0] && presetsRaw.teams[0].repos && presetsRaw.teams[0].repos[0] && presetsRaw.teams[0].repos[0].path
  ? presetsRaw.teams[0].repos[0].path.split('/').slice(0, -1).join('/')
  : null;

function resolveRepos(input) {
  // No repos specified — default to all preset repos for the team
  if (!input || (Array.isArray(input) && input.length === 0)) {
    if (allPresetRepos.length > 0) return allPresetRepos;
    return null;
  }
  // "all" sentinel — only valid when a known team preset exists with repos
  if (input === 'all' || (Array.isArray(input) && input.length === 1 && input[0] === 'all')) {
    if (allPresetRepos.length > 0) return allPresetRepos;
    log(`ERROR: repos: "all" requires a known team with configured repos. Team "${resolvedTeam}" has none. Pass repo names explicitly instead.`);
    return null;
  }
  // Normalize to array
  const list = Array.isArray(input) ? input : [input];
  if (list.length === 0) return null;

  // Already full objects — use as-is
  if (typeof list[0] === 'object') return list;

  // String names — try to resolve against preset first, fall back to ad-hoc path
  const resolved = [];
  for (const shortName of list) {
    const match = allPresetRepos.find(r =>
      r.displayName === shortName ||
      r.displayName === shortName.toLowerCase() ||
      r.name === shortName
    );
    if (match) {
      resolved.push(match);
    } else {
      // No preset match — build an ad-hoc repo object using GHE_WORKSPACE
      const adHocPath = GHE_WORKSPACE_PATH ? `${GHE_WORKSPACE_PATH}/${shortName}` : shortName;
      log(`Repo "${shortName}" not in preset — using ad-hoc path: ${adHocPath}`);
      resolved.push({ name: shortName, displayName: shortName, path: adHocPath });
    }
  }
  return resolved;
}

const config = {
  repos: resolveRepos(parsedArgs.repos),
  epicKey: resolvedEpicKey,
  wizProject: parsedArgs.wizProject || (preset && preset.wizProject) || 'iss',
  team: resolvedTeam,
  confirmed: parsedArgs.confirmed || false,
  approvedIndexes: parsedArgs.approvedIndexes || null,
  previousResults: parsedArgs.previousResults || null,
  ticketMap: parsedArgs.ticketMap || {}, // { "1": "ISS-XXXXX" } to link, { "1": "create" } to create new
  runWiz: requestedSources.includes('wiz'),
  runSnyk: requestedSources.includes('snyk'),
};

if (!config.repos || config.repos.length === 0) {
  const available = allPresetRepos.map(r => r.displayName).join(', ');
  log(`Which repos should I scan? Available for team ${resolvedTeam}:\n  ${available}\n\nTell Claude: "run security-scan, epic ${config.epicKey}, repos: billing-summary, autoiq" (or "all" for all repos)`);
  return { status: 'needs-repos', team: resolvedTeam, available: allPresetRepos.map(r => r.displayName) };
}

log(`━━━ SCAN CONFIG ━━━`);
log(`Team    : ${resolvedTeam}`);
log(`Epic    : ${config.epicKey}`);
log(`Repos   : ${config.repos.map(r => r.displayName).join(', ')}`);
log(`Sources : ${requestedSources.join(', ')}`);
log(`━━━━━━━━━━━━━━━━━━`);

// ─── Schemas ───────────────────────────────────────────────────────────────────

const WIZ_FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    repo: { type: 'string' },
    displayName: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          severity: { type: 'string' },
          bucket: { type: 'string' },
          resource: { type: 'string' },
          firstSeen: { type: 'string' },
          fixAction: { type: 'string' },
        },
        required: ['title', 'severity', 'bucket', 'resource', 'fixAction'],
      },
    },
    error: { type: 'string' },
  },
  required: ['repo', 'findings'],
};

const SNYK_FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    repo: { type: 'string' },
    displayName: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cve: { type: 'string' },
          severity: { type: 'string' },
          pkg: { type: 'string' },
          introducedBy: { type: 'string' },
          bucket: { type: 'string' },
          fixAction: { type: 'string' },
          fixVersion: { type: 'string' },
        },
        required: ['severity', 'pkg', 'introducedBy', 'bucket', 'fixAction'],
      },
    },
    error: { type: 'string' },
  },
  required: ['repo', 'findings'],
};

const PREREQ_SCHEMA = {
  type: 'object',
  properties: {
    wizcliOk: { type: 'boolean' },
    snykOk: { type: 'boolean' },
    ghOk: { type: 'boolean' },
    jqOk: { type: 'boolean' },
    blockers: { type: 'array', items: { type: 'string' } },
    notes: { type: 'array', items: { type: 'string' } },
  },
  required: ['ghOk', 'blockers'],
};

const TICKET_SCHEMA = {
  type: 'object',
  properties: {
    ticketKey: { type: 'string' },
    action: { type: 'string', enum: ['created', 'existing', 'failed'] },
    error: { type: 'string' },
  },
  required: ['action'],
};

// ─── Short-circuit: if previousResults provided + confirmed, skip to Phase 5 ──

if (config.previousResults && config.confirmed) {
  log('Using cached results from previous run — skipping scan phases');

  phase('Jira Tickets');

  const ticketGroups = config.approvedIndexes === 'all'
    ? config.previousResults
    : (config.approvedIndexes || []).length > 0
      ? config.previousResults.filter(t => config.approvedIndexes.includes(t.index))
      : [];

  if (ticketGroups.length === 0) {
    log('No tickets selected — nothing to create.');
    return { status: 'complete', ticketsCreated: [], note: 'No indexes selected' };
  }

  log(`Creating ${ticketGroups.length} ticket(s) under ${config.epicKey}...`);

  // Resolve current user's Jira accountId for assignee
  const assigneeResult = await agent(
    `Get the current Jira user's accountId by calling:
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" "https://autoclub.atlassian.net/rest/api/3/myself"

IMPORTANT: Use curl's built-in -u flag for auth. Do NOT build AUTH variable with base64/echo.

Parse the JSON response and return ONLY the accountId string (e.g. "5f1234abc..."). If it fails, return "unknown".`,
    { label: 'resolve-assignee', phase: 'Jira Tickets', schema: { type: 'object', properties: { accountId: { type: 'string' } }, required: ['accountId'] } }
  );
  const assigneeId = (assigneeResult && assigneeResult.accountId !== 'unknown') ? assigneeResult.accountId : null;

  const ticketResults = await pipeline(
    ticketGroups,
    (group) => agent(
      `Create a Jira ticket for this fix group.

Fix group #${group.index}: "${group.summary}"
Repo: ${group.displayName} (${group.repo})
Source: ${group.source}
Bucket: ${group.bucket}
Finding count: ${group.findingCount}
Findings: ${JSON.stringify(group.findings, null, 2)}

If group.existingTicket is set ("${group.existingTicket || ''}"), do NOT create a new ticket.
Instead return action: "existing" with ticketKey set to that value.

Otherwise, create a new Jira Story:
- Project: ISS
- Issue type: Story
- Parent: ${config.epicKey}
- Summary: "${group.summary}"
${assigneeId ? `- Assignee accountId: "${assigneeId}"` : ''}
- Description (ADF format matching ISS-17537 style):
  - Heading 2 "Repo": code-formatted repo name "${group.displayName}"
  - Heading 2 "Findings": ordered list or table with Resource/Package | Severity | Fix Action
  - Heading 2 "Fix Steps": numbered step-by-step remediation from the fix actions
  - Heading 2 "Acceptance Criteria":
    ${group.source === 'WIZ' ? `1. CDK synth passes\\n    2. /review passes on PR changes\\n    3. Deploy to UAT — Wiz scan shows 0 HIGH/CRITICAL for ${group.displayName}\\n    4. Deploy to PROD — Wiz scan shows 0 HIGH/CRITICAL` : `1. snyk code test / snyk test passes locally\\n    2. /review passes on PR changes\\n    3. Merge to main — Snyk dashboard shows 0 HIGH/CRITICAL for ${group.displayName}`}
- Labels: security, ${group.source.toLowerCase()}-fix, ${group.bucket}

Create the ticket using a single-line curl (no backslashes, no semicolons):
curl -s -X POST -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -H "Content-Type: application/json" -d '{"fields":{...}}' "https://autoclub.atlassian.net/rest/api/3/issue"

Build the JSON body inline in the -d flag. Keep it on one line.

IMPORTANT: Use curl's built-in -u flag for auth. Do NOT build AUTH variable with base64/echo.

Return the ticket key if created, or set action to "failed" with error details.`,
      { label: `ticket:${group.index}:${group.displayName}:${group.bucket}`, phase: 'Jira Tickets', schema: TICKET_SCHEMA }
    )
  );

  const created = ticketResults.filter(Boolean).filter(r => r.action === 'created' || r.action === 'existing');
  const failed = ticketResults.filter(Boolean).filter(r => r.action === 'failed');

  if (created.length > 0) log(`Created ${created.length} ticket(s): ${created.map(r => r.ticketKey).join(', ')}`);
  if (failed.length > 0) log(`Failed: ${failed.length} — ${failed.map(r => r.error).join('; ')}`);

  return {
    status: 'complete',
    epicKey: config.epicKey,
    ticketsCreated: created.map(r => r.ticketKey).filter(Boolean),
    errors: failed.map(r => r.error).filter(Boolean),
  };
}

// ─── Phase 1: Prereqs (gh auth only) + Epic read in parallel ─────────────────
// Wiz/Snyk auth is handled by the /wiz-fix and /snyk-fix skills themselves.
// The only hard prereq for the workflow is gh (needed for PRs).

phase('Epic');
log('Step 1/5 — Checking gh auth + reading epic in parallel...');

// Prereqs: just check gh + Jira env vars (lightweight — no agent needed for wiz/snyk)
const parallelTasks = [
  () => agent(
    `Check three things. Each must be a separate, single-line Bash call — no pipes, no chaining.

1. Run: gh auth status
   If it succeeds, ghOk: true. If it fails, ghOk: false AND add to blockers: "gh not authenticated — run: gh auth login".
   IMPORTANT: ghOk:false must always produce a blocker entry — never return ghOk:false with an empty blockers array.

2. ${config.runWiz
    ? `Run: wizcli auth validate
   If exit code 0, wizcliOk: true. If it fails (not installed or not authenticated), wizcliOk: false and add to blockers: "wizcli not authenticated — run: wizcli auth login".`
    : `Wiz scans are disabled (runWiz: false). Set wizcliOk: true and do NOT add anything to blockers for wizcli.`}

3. Run ONE python3 command to check Jira env vars:
   python3 -c "import os,json; missing=[v for v in ['JIRA_URL','JIRA_EMAIL','JIRA_API_TOKEN'] if not os.environ.get(v)]; print(json.dumps({'jiraMissing':missing}))"
   If jiraMissing is non-empty, add to notes: "Jira env vars missing — tickets will be skipped".

Set snykOk: true, jqOk: true — those tools validate themselves during scan/fix.`,
    { label: 'prereq-check', phase: 'Epic', schema: PREREQ_SCHEMA }
  ),
];

parallelTasks.push(() => agent(
    `Fetch the Jira epic ${config.epicKey} and its closed/resolved child ticket summaries for deduplication.

COMMAND RULES — CRITICAL, read carefully:
These rules prevent permission prompts. VIOLATING ANY RULE blocks the workflow.
1. NEVER use | (pipes) in any bash command
2. NEVER use ; (semicolons) in any bash command
3. NEVER use \\ (backslash continuations) — every command must be ONE LINE
4. NEVER use $() subshells
5. NEVER use && to chain commands
6. NEVER append "echo exit code" or similar
7. Use the Write tool (not bash) to create files with JSON content
8. Use the Read tool (not bash/cat) to read files
9. Use -u "$JIRA_EMAIL:$JIRA_API_TOKEN" for auth (NOT base64/echo)
10. Every Bash call = exactly one simple command, one line, no chaining

Two API calls — titles only, no bodies:

1. ONE single-line curl (no backslashes):
   curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" "https://autoclub.atlassian.net/rest/api/3/issue/${config.epicKey}?fields=summary,status" -o /tmp/jira-epic.json
   Then use the Read tool on /tmp/jira-epic.json

2. Use the Write tool to create /tmp/jira-search.json with content:
   {"jql":"parent = ${config.epicKey}","maxResults":100,"fields":["summary","status"]}
   Then ONE single-line curl (no backslashes):
   curl -s -X POST -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -H "Content-Type: application/json" -d @/tmp/jira-search.json "https://autoclub.atlassian.net/rest/api/3/search/jql" -o /tmp/jira-children.json
   Then use the Read tool on /tmp/jira-children.json
   Body: { "jql": "parent = ${config.epicKey}", "maxResults": 100, "fields": ["summary", "status"] }

For each child ticket, look at the summary string ONLY (do NOT fetch description or body) and infer:
- inferredRepo: which displayName from [${config.repos.map(r => r.displayName).join(', ')}] the ticket belongs to.
  Matching rules (apply in order):
  1. If the exact displayName string appears anywhere in the summary → match (e.g. "policyview" in "...insurancepolicyinfo_policyview")
  2. Ticket summaries often use the FULL repo name (e.g. "insurance-self-service_insurancepolicyinfo_policyview") — if the summary ends with or contains an underscore-suffix equal to the displayName, that is a match.
  3. IMPORTANT: "cmn-policyview" must NOT match a ticket that only says "policyview" (no "cmn-" prefix). The match must include the distinguishing prefix.
  Only leave inferredRepo empty if none of the displayNames match by any of the above rules.
- inferredSource: "wiz" if title contains Wiz/Lambda SLA/Deprecated Runtime; "snyk" if contains Snyk/SCA; else "unknown"

If a repo+source combo from the scanned repos is NOT found in existing tickets, set notFound: true for that entry so the user can be asked for the ticket number.`,
    {
      label: 'read-epic',
      phase: 'Epic',
      schema: {
        type: 'object',
        properties: {
          epicSummary: { type: 'string' },
          epicStatus: { type: 'string' },
          existingTickets: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string' },
                summary: { type: 'string' },
                inferredRepo: { type: 'string' },
                inferredSource: { type: 'string' },
                notFound: { type: 'boolean' },
              },
              required: ['key', 'summary'],
            },
          },
          error: { type: 'string' },
        },
        required: ['existingTickets'],
      },
    }
  ));

const parallelResults = await parallel(parallelTasks);
const prereqs = parallelResults[0];
const epicData = parallelResults[1] || { existingTickets: [] };

if (epicData && epicData.error) {
  log(`⚠ Could not read epic ${config.epicKey}: ${epicData.error} — deduplication skipped`);
}

const wizcliStatus = !config.runWiz ? 'skipped (snyk-only)' : (prereqs && prereqs.wizcliOk ? 'ok' : 'BLOCKED');
log(`✓ prereq-check: gh=${prereqs && prereqs.ghOk ? 'ok' : 'BLOCKED'} | wizcli=${wizcliStatus}`);
log(`✓ read-epic: "${(epicData && epicData.epicSummary) || config.epicKey}" [${(epicData && epicData.epicStatus) || '?'}] — ${((epicData && epicData.existingTickets) || []).length} existing child tickets loaded for dedup`);

// Hard blockers — stop before doing any work
// ghOk is checked deterministically (agent can return ghOk:false with empty blockers)
const hardBlockers = (prereqs && prereqs.blockers) || [];
if (!prereqs || !prereqs.ghOk || hardBlockers.length > 0) {
  log('❌ Prerequisites failed — fix these before running the workflow:');
  if (!prereqs || !prereqs.ghOk) log('  • gh not authenticated — run: gh auth login');
  hardBlockers.filter(b => !(b.includes('gh not authenticated'))).forEach(b => log(`  • ${b}`));
  const allBlockers = [...((!prereqs || !prereqs.ghOk) && !hardBlockers.some(b => b.includes('gh not authenticated')) ? ['gh not authenticated — run: gh auth login'] : []), ...hardBlockers];
  return { status: 'blocked', blockers: allBlockers };
}

if (prereqs && prereqs.notes && prereqs.notes.length > 0) prereqs.notes.forEach(n => log(`  ${n}`));

log('✓ All prerequisites passed — starting scans');

// ─── Phase 3: Wiz + Snyk scans (separate parallel calls — no interleaving) ───

phase('Scan');
log(`Step 2/5 — Running scans across ${config.repos.length} repo(s): ${config.repos.map(r => r.displayName).join(', ')}`);
if (config.runWiz)  log(`  [Wiz]  fetching open HIGH/CRITICAL findings via Wiz GraphQL API`);
if (config.runSnyk) log(`  [Snyk] running "snyk test" scoped to each repo root (--all-projects scans all package.json files within that repo only) — typically 5-10 min per repo`);


// Run Wiz scans for all repos in parallel (skip if sources excludes wiz)
// Delegate to /wiz-fix --scan-only — the skill handles auth, API calls, filtering, and classification
const wizRaw = !config.runWiz ? [] : await parallel(
  config.repos.map(repo => () => agent(
    `You are scanning "${repo.displayName || repo.name}" for Wiz security findings. Delegate to the /wiz-fix skill in scan-only mode.

1. cd ${repo.path}
2. Run: /wiz-fix ${config.wizProject} --scan-only --this-repo

The skill will authenticate with wizcli, query the Wiz API, filter findings to this repo's resources, classify them into buckets, and output a summary.

After the skill finishes, collect all findings it reported and return them in the schema format:
- repo: "${repo.name}"
- displayName: "${repo.displayName || repo.name}"
- findings: array of {id, title, severity, bucket, resource, firstSeen, fixAction}
- If the skill reports zero findings or errors out, return findings: [] and set error if applicable.`,
    { label: `wiz:${repo.displayName || repo.name}`, phase: 'Scan', schema: WIZ_FINDINGS_SCHEMA }
  ))
);

// Run Snyk scans for all repos in parallel (skip if sources excludes snyk)
// Delegate to /snyk-fix --scan-only — the skill handles auth, scoping, and classification
const snykRaw = !config.runSnyk ? [] : await parallel(
  config.repos.map(repo => () => agent(
    `You are scanning "${repo.displayName || repo.name}" for Snyk vulnerabilities. Delegate to the /snyk-fix skill in scan-only mode.

1. cd ${repo.path}
2. git pull origin main
3. Run: /snyk-fix ${repo.displayName || repo.name} --scan-only --this-repo

The skill will authenticate, run snyk test, scope-filter, classify findings into buckets, and output a summary.

After the skill finishes, collect all findings it reported and return them in the schema format:
- repo: "${repo.name}"
- displayName: "${repo.displayName || repo.name}"
- findings: array of {cve, severity, pkg, introducedBy, bucket, fixVersion, fixAction}
- If the skill reports zero findings or errors out, return findings: [] and set error if applicable.`,
    { label: `snyk:${repo.displayName || repo.name}`, phase: 'Scan', schema: SNYK_FINDINGS_SCHEMA }
  ))
);

const wizResults = wizRaw.filter(Boolean);
const snykResults = snykRaw.filter(Boolean);

// Log per-repo scan results
if (config.runWiz) {
  log(`[Wiz] Scan complete:`);
  wizResults.forEach(r => {
    if (r.error) log(`  ❌ ${r.displayName || r.repo}: ERROR — ${r.error}`);
    else log(`  ✓ ${r.displayName || r.repo}: ${r.findings.length} finding(s) — buckets: ${[...new Set(r.findings.map(f => f.bucket))].join(', ') || 'none'}`);
  });
}
if (config.runSnyk) {
  log(`[Snyk] Scan complete:`);
  snykResults.forEach(r => {
    if (r.error) log(`  ❌ ${r.displayName || r.repo}: ERROR — ${r.error}`);
    else log(`  ✓ ${r.displayName || r.repo}: ${r.findings.length} finding(s) — buckets: ${[...new Set(r.findings.map(f => f.bucket))].join(', ') || 'none'}`);
  });
}

// Inject repo/displayName into each finding from the parent result (fixes the "unknown" bug)
const allWizFindings = wizResults.flatMap(r =>
  (r.findings || []).map(f => ({ ...f, repo: r.repo, displayName: r.displayName || r.repo }))
);
const allSnykFindings = snykResults.flatMap(r =>
  (r.findings || []).map(f => ({ ...f, repo: r.repo, displayName: r.displayName || r.repo }))
);

const wizErrors = wizResults.filter(r => r.error).map(r => `Wiz/${r.displayName || r.repo}: ${r.error}`);
const snykErrors = snykResults.filter(r => r.error).map(r => `Snyk/${r.displayName || r.repo}: ${r.error}`);

// Dedup against ALL child tickets (any status) — an open ticket means work is already underway.
// Never suppress findings silently; show all findings and annotate with existing ticket key if one matches.
const newWizFindings = allWizFindings;
const newSnykFindings = allSnykFindings;
log(`New findings to process: Wiz=${newWizFindings.length} | Snyk=${newSnykFindings.length}`);

// ─── Phase 4: Review — present findings, pause for user decision ────────────

phase('Review');
log('Step 3/5 — Building review summary...');

// Build proposed tickets: one per (displayName × source) — all buckets merged into a single ticket
const ticketBuckets = {};
for (const f of newWizFindings) {
  const dn = f.displayName || f.repo || 'unknown';
  const key = `${dn}::wiz`;
  if (!ticketBuckets[key]) ticketBuckets[key] = { repo: f.repo, displayName: dn, source: 'WIZ', bucket: 'all', findings: [] };
  ticketBuckets[key].findings.push(f);
}
for (const f of newSnykFindings) {
  const dn = f.displayName || f.repo || 'unknown';
  const key = `${dn}::snyk`;
  if (!ticketBuckets[key]) ticketBuckets[key] = { repo: f.repo, displayName: dn, source: 'SNYK', bucket: 'all', findings: [] };
  ticketBuckets[key].findings.push(f);
}

// ticketMap: user-supplied overrides — { "1": "ISS-XXXXX" } or { "1": "create" }
const ticketMap = config.ticketMap || {};

// Assign stable index numbers and check for existing coverage
const proposedTickets = Object.values(ticketBuckets).map((g, i) => {
  const dn = g.displayName;
  const idx = i + 1;
  // Check if any existing ticket covers this repo+source by title match
  const existingTicket = (epicData.existingTickets || []).find(t =>
    t.inferredRepo && t.inferredSource && !t.notFound &&
    t.inferredRepo.toLowerCase() === dn.toLowerCase() &&
    t.inferredSource.toLowerCase() === g.source.toLowerCase()
  );
  // User override takes precedence — either an explicit ticket key or "create"
  const userSupplied = ticketMap[String(idx)];
  const resolvedTicket = userSupplied && userSupplied !== 'create'
    ? userSupplied
    : existingTicket ? existingTicket.key : null;
  return {
    index: idx,
    summary: g.source === 'WIZ' ? `WIZ Cloud Security Findings — ${dn}` : `SNYK SCA Vulnerabilities — ${dn}`,
    repo: g.repo,
    displayName: dn,
    source: g.source,
    bucket: 'all',
    findingCount: g.findings.length,
    findings: g.findings,
    existingTicket: resolvedTicket,
    createNew: userSupplied === 'create' || (!resolvedTicket),
  };
});

const alreadyCovered = proposedTickets.filter(t => t.existingTicket && !t.createNew).length;

// Build the review report as a plain string (no sub-agent needed for formatting)
const reviewLines = [
  ``,
  `## Security Scan Summary — ${config.epicKey}`,
  ``,
  `Epic: ${epicData.epicSummary || config.epicKey}`,
  `Repos scanned: ${config.repos.length}`,
  `Wiz findings (new): ${newWizFindings.length} | Snyk findings (new): ${newSnykFindings.length}`,
  `Already covered by existing tickets: ${alreadyCovered} (existing ticket found, excluded from new ticket creation)`,
  ``,
];

if (wizErrors.length > 0 || snykErrors.length > 0) {
  reviewLines.push(`### Scan Errors`);
  [...wizErrors, ...snykErrors].forEach(e => reviewLines.push(`  - ${e}`));
  reviewLines.push('');
}

if (proposedTickets.length > 0) {
  reviewLines.push(`### Proposed Fix Tickets`);
  reviewLines.push('');
  reviewLines.push(`| # | Repo | Source | Bucket | Findings | Existing Ticket |`);
  reviewLines.push(`|---|------|--------|--------|----------|-----------------|`);
  for (const t of proposedTickets) {
    const existing = t.existingTicket ? `${t.existingTicket} (already exists)` : 'needs creation';
    reviewLines.push(`| ${t.index} | ${t.displayName} | ${t.source} | ${t.bucket} | ${t.findingCount} | ${existing} |`);
  }
  reviewLines.push('');
} else {
  reviewLines.push('### No new findings — all covered by existing tickets.');
  reviewLines.push('');
}

// Surface any tickets not found — ask user for number or to create new
const missingCoverage = proposedTickets.filter(t => !t.existingTicket);
if (missingCoverage.length > 0) {
  reviewLines.push(`### Tickets Not Found — Action Required`);
  reviewLines.push('');
  reviewLines.push('The following repo+scanner combos have no existing ticket under this epic:');
  for (const t of missingCoverage) {
    reviewLines.push(`  - #${t.index} ${t.displayName} [${t.source}] — provide ticket number or say "create new for #${t.index}"`);
  }
  reviewLines.push('');
}

reviewLines.push(`> **Paused for your review.**`);
reviewLines.push(`> - To link an existing ticket: "use ISS-XXXXX for #1"`);
reviewLines.push(`> - To create a new ticket: "create new for #1" or "create new for all"`);
reviewLines.push(`> - To approve and proceed: "approve all" or "approve tickets 1 and 3"`);

const report = reviewLines.join('\n');
log(report);

// REVIEW GATE — always pauses here for user to inspect findings before tickets/fixes
if (!config.confirmed) {
  log('Paused. Review the findings above. To proceed: re-run with confirmed: true and approvedIndexes (e.g. "all" or [1,3]). The workflow will then apply code fixes, verify locally, run code review, create PRs, and create Jira tickets — in that order.');
  return {
    status: 'awaiting-confirmation',
    epicKey: config.epicKey,
    wizFindings: newWizFindings,
    snykFindings: newSnykFindings,
    alreadyCovered,
    proposedTickets,
    errors: [...wizErrors, ...snykErrors],
  };
}

// ─── Phase 5: Apply fixes per repo ─────────────────────────────────────────

phase('Fix');
log('Step 4/5 — Applying code fixes per repo...');

// Group findings by repo — one branch per repo covering all its findings
// Only process tickets in approvedIndexes (respects partial approvals)
const approvedTickets = config.approvedIndexes === 'all'
  ? proposedTickets
  : (config.approvedIndexes && config.approvedIndexes.length > 0)
    ? proposedTickets.filter(t => config.approvedIndexes.includes(t.index))
    : proposedTickets;

const repoFixGroups = {};
for (const t of approvedTickets) {
  const key = t.displayName;
  if (!repoFixGroups[key]) repoFixGroups[key] = { displayName: t.displayName, repo: t.repo, sources: [], findings: [] };
  if (!repoFixGroups[key].sources.includes(t.source)) repoFixGroups[key].sources.push(t.source);
  repoFixGroups[key].findings.push(...t.findings);
}

const repoFixList = Object.values(repoFixGroups);
const repoPathMap = {};
for (const r of config.repos) {
  repoPathMap[r.displayName || r.name] = r.path;
}

log(`Applying fixes to ${repoFixList.length} repo(s): ${repoFixList.map(r => r.displayName).join(', ')}`);
repoFixList.forEach(r => log(`  ${r.displayName}: sources=${r.sources.join(', ')} | findings=${r.findings.length}`));

const FIX_RESULT_SCHEMA = {
  type: 'object',
  properties: {
    displayName: { type: 'string' },
    repo: { type: 'string' },
    branch: { type: 'string' },
    filesChanged: { type: 'array', items: { type: 'string' } },
    buildPassed: { type: 'boolean' },
    testPassed: { type: 'boolean' },
    error: { type: 'string' },
  },
  required: ['displayName', 'repo', 'branch'],
};

const fixResults = await parallel(
  repoFixList.map((repoGroup) => () => agent(
    `Fix security vulnerabilities in ${repoGroup.displayName}. You are an orchestrator — delegate the actual fixing to the /snyk-fix and /wiz-fix skills.

Repo path: ${repoPathMap[repoGroup.displayName]}
Sources: ${repoGroup.sources.join(', ')}

Steps:
1. cd to ${repoPathMap[repoGroup.displayName]}
2. git checkout main
3. git pull origin main
4. git checkout -b f/security-fix-${repoGroup.displayName}

5. Run the appropriate skill(s) for this repo:
${repoGroup.sources.includes('SNYK') ? `   - Run /snyk-fix (invoke the snyk-fix skill). It will scan, triage, and apply fixes automatically.
     It handles: direct upgrades, transitive resolutions, CDK compatibility, uuid known-fix, and verification.
     Let it do its full workflow — do NOT override or skip its steps.` : ''}
${repoGroup.sources.includes('WIZ') ? `   - Run /wiz-fix ${config.wizProject} --this-repo (invoke the wiz-fix skill scoped to this repo).
     It handles: deprecated runtimes, CDK upgrades, lambda SLA, IAM, and network findings.
     Let it do its full workflow — do NOT override or skip its steps.` : ''}

6. After the skill(s) complete, stage all changes: git add -A
7. Do NOT commit — the review phase will validate first.
8. Run: git diff --stat
9. IMMEDIATELY call StructuredOutput with: displayName (must be exactly "${repoGroup.displayName}"), repo (must also be exactly "${repoGroup.displayName}" — not the full path), branch, filesChanged (from diff --stat), buildPassed, testPassed.

CRITICAL: You MUST call StructuredOutput as your very last action. The workflow cannot continue without it.`,
    { label: `fix:${repoGroup.displayName}`, phase: 'Fix', schema: FIX_RESULT_SCHEMA }
  ))
);

const successfulFixes = fixResults.filter(Boolean).filter(r => !r.error);
const failedFixes = fixResults.filter(Boolean).filter(r => r.error);

log(`Fix results: ${successfulFixes.length} succeeded | ${failedFixes.length} failed`);
successfulFixes.forEach(r => log(`  ✓ ${r.repo}: branch=${r.branch} | build=${r.buildPassed ? 'PASS' : 'FAIL'} | tests=${r.testPassed ? 'PASS' : 'FAIL'} | files=${(r.filesChanged || []).length} changed`));
if (failedFixes.length > 0) failedFixes.forEach(r => log(`  ❌ ${r.repo}: ${r.error}`));

if (successfulFixes.length === 0) {
  log('No successful fixes to review. Stopping.');
  return {
    status: 'complete-with-errors',
    epicKey: config.epicKey,
    fixErrors: failedFixes.map(r => ({ repo: r.repo, error: r.error })),
  };
}

// ─── Phase 6b: Local Scan Gate (pre-push verification) ─────────────────────────

phase('Verify');

log(`Running local snyk test on ${successfulFixes.length} repo(s) — gate: block push if HIGH/CRITICAL remain...`);

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    displayName: { type: 'string' },
    repo: { type: 'string' },
    passed: { type: 'boolean' },
    exitCode: { type: 'number' },
    remainingHigh: { type: 'number' },
    remainingCritical: { type: 'number' },
    remainingMedium: { type: 'number' },
    newIssues: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, severity: { type: 'string' }, pkg: { type: 'string' } } } },
    error: { type: 'string' },
  },
  required: ['displayName', 'repo', 'passed'],
};

const verifyResults = await parallel(
  successfulFixes.map((fix) => () => agent(
    `Run a local Snyk scan to verify the fixes in ${fix.displayName} before pushing.

Repo path: ${repoPathMap[fix.displayName]}
Branch: ${fix.branch}

Steps:
1. cd to the repo path
2. Run: npx snyk test --all-projects --severity-threshold=high 2>&1
3. Parse the output:
   - Count remaining HIGH, CRITICAL, MEDIUM vulnerabilities
   - If output says "no issues found" or "no vulnerable paths" → passed: true
   - If vulnerabilities remain, list them in newIssues[]
4. Also run: npx snyk code test 2>&1 (code quality/SAST scan)
   - If code issues found, add to newIssues with severity

Pass criteria:
- passed: true ONLY if zero HIGH and zero CRITICAL remain
- MEDIUM issues are acceptable (passed still true) but report them
- If snyk command fails entirely (auth error, network), set error and passed: false

Return displayName (must be "${fix.displayName}"), counts and any remaining issues. This is a GATE — repos that fail here will NOT proceed to PR.`,
    { label: `verify:${fix.displayName}`, phase: 'Verify', schema: VERIFY_SCHEMA }
  ))
);

const verifyPassed = verifyResults.filter(Boolean).filter(r => r.passed);
const verifyFailed = verifyResults.filter(Boolean).filter(r => !r.passed);

if (verifyFailed.length > 0) {
  log(`⚠ SCAN GATE BLOCKED ${verifyFailed.length} repo(s):`);
  for (const r of verifyFailed) {
    const issues = r.newIssues || [];
    log(`  ${r.repo}: ${r.remainingCritical || 0} critical, ${r.remainingHigh || 0} high remaining`);
    if (issues.length > 0) {
      issues.slice(0, 5).forEach(i => log(`    - ${i.title} [${i.severity}] — ${i.pkg || ''}`));
      if (issues.length > 5) log(`    ... and ${issues.length - 5} more`);
    }
    if (r.error) log(`    Error: ${r.error}`);
  }
  log('');
  log('These repos need additional fixes before they can be pushed.');
  log('Fix the remaining issues and re-run, or remove these repos from the run.');
}

if (verifyPassed.length > 0) {
  log(`✓ ${verifyPassed.length} repo(s) passed local scan — safe to push`);
  for (const r of verifyPassed) {
    const med = r.remainingMedium || 0;
    log(`  ${r.repo}: clean${med > 0 ? ` (${med} medium — acceptable)` : ''}`);
  }
}

if (verifyPassed.length === 0) {
  log('All repos blocked by scan gate. Fix remaining vulnerabilities and re-run.');
  return {
    status: 'scan-gate-blocked',
    epicKey: config.epicKey,
    verifyFailures: verifyFailed.map(r => ({ repo: r.repo, high: r.remainingHigh, critical: r.remainingCritical, issues: r.newIssues })),
  };
}

// Filter successfulFixes to only those that passed verification — downstream phases use this
const verifiedFixes = successfulFixes.filter(f => verifyPassed.some(v => v.displayName === f.displayName));

// ─── Phase 7: Code Review ──────────────────────────────────────────────────────

phase('Code Review');

log(`Running code review on ${verifiedFixes.length} repo(s) that passed scan gate: ${verifiedFixes.map(f => f.repo).join(', ')}`);

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    displayName: { type: 'string' },
    repo: { type: 'string' },
    passed: { type: 'boolean' },
    criticalIssues: { type: 'array', items: { type: 'string' } },
    suggestions: { type: 'array', items: { type: 'string' } },
  },
  required: ['displayName', 'repo', 'passed'],
};

const reviewResults = await parallel(
  verifiedFixes.map((fix) => () => agent(
    `Review the staged changes in ${fix.displayName} (branch: ${fix.branch}).

Repo path: ${repoPathMap[fix.displayName]}
Branch: ${fix.branch}
Files changed: ${JSON.stringify(fix.filesChanged)}

Steps:
1. cd to the repo path
2. Run: git diff --staged (or git diff if not yet staged)
3. Review the changes against these criteria:
   - No secrets/credentials introduced
   - No breaking changes to exports or APIs
   - Proper error handling maintained
   - Package versions are correct (not pinned to old, not wildcard)
   - CDK changes: no removal of existing resources, proper construct IDs preserved
   - Test changes: mock patterns are valid, no real tokens
   - Build artifacts (.js in dist/) NOT committed
4. Flag critical issues (must-fix before PR) vs suggestions (nice-to-have)

Return displayName (must be "${fix.displayName}"), passed: true if no critical issues. Critical issues block the PR.`,
    { label: `review:${fix.displayName}`, phase: 'Code Review', schema: REVIEW_SCHEMA }
  ))
);

const reviewPassed = reviewResults.filter(Boolean).filter(r => r.passed);
const reviewFailed = reviewResults.filter(Boolean).filter(r => !r.passed);

if (reviewFailed.length > 0) {
  log(`Review BLOCKED ${reviewFailed.length} repo(s):`);
  for (const r of reviewFailed) {
    log(`  ${r.repo}: ${(r.criticalIssues || []).join(', ')}`);
  }
}

if (reviewPassed.length === 0) {
  log('All repos blocked by review. Fix critical issues and re-run.');
  return {
    status: 'review-blocked',
    epicKey: config.epicKey,
    reviewFailures: reviewFailed.map(r => ({ repo: r.repo, issues: r.criticalIssues })),
  };
}

// ─── Phase 8: Commit + PR ──────────────────────────────────────────────────────

phase('PR');

log(`Creating PRs for ${reviewPassed.length} repo(s) that passed code review: ${reviewPassed.map(r => r.repo).join(', ')}`);

const PR_SCHEMA = {
  type: 'object',
  properties: {
    displayName: { type: 'string' },
    repo: { type: 'string' },
    prUrl: { type: 'string' },
    prNumber: { type: 'number' },
    error: { type: 'string' },
  },
  required: ['displayName', 'repo'],
};

const prResults = await parallel(
  reviewPassed.map((review) => () => {
    const fix = verifiedFixes.find(f => f.displayName === review.displayName);
    const repoSources = (repoFixGroups[review.displayName] && repoFixGroups[review.displayName].sources) || (repoFixGroups[review.repo] && repoFixGroups[review.repo].sources) || [];
    return agent(
      `Commit the staged changes and create a PR for ${review.displayName}.

COMMAND RULES — CRITICAL, read carefully:
These rules prevent permission prompts. VIOLATING ANY RULE blocks the workflow.
1. NEVER use | (pipes) in any bash command
2. NEVER use ; (semicolons) in any bash command
3. NEVER use \\ (backslash continuations) — every command must be ONE LINE
4. NEVER use $() subshells
5. NEVER use && to chain commands (use cd as prefix only)
6. NEVER append "echo exit code" or similar after a command
7. Use the Write tool (not bash) to create files with content
8. Every Bash call = exactly one simple command, one line, no chaining

Repo path: ${repoPathMap[review.displayName]}
Branch: ${(fix && fix.branch) || `f/security-fix-${review.displayName}`}
Epic: ${config.epicKey}

Steps:
1. cd to the repo path and run: git add -A
2. Use the Write tool to create /tmp/commit-msg-${review.displayName}.txt with content:
   fix: [${config.epicKey}] security fixes for ${review.displayName} — Sources: ${repoSources.join(', ')}

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
3. Run: git commit -F /tmp/commit-msg-${review.displayName}.txt
4. Run: git push -u origin ${(fix && fix.branch) || `f/security-fix-${review.displayName}`}
5. Use the Write tool to create /tmp/pr-body-${review.displayName}.md with this content:
   **Epic:** [${config.epicKey}](https://autoclub.atlassian.net/browse/${config.epicKey})

   ## Summary
   - Security fixes for ${review.displayName} (${repoSources.join(' + ')} findings)
   - Source: ${repoSources.join(' + ')} scan

   ## Test plan
   - [ ] yarn build passes
   - [ ] yarn test passes
   - [ ] Snyk/Wiz scan shows 0 new HIGH/CRITICAL (MEDIUM is acceptable)

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
6. Run: gh pr create --title "fix: [${config.epicKey}] security fixes — ${review.displayName}" --body-file /tmp/pr-body-${review.displayName}.md

Return displayName (must be "${review.displayName}"), PR URL and number. If anything fails, return error.`,
      { label: `pr:${review.displayName}`, phase: 'PR', schema: PR_SCHEMA }
    );
  })
);

const prsCreated = prResults.filter(Boolean).filter(r => r.prUrl);
const prsFailed = prResults.filter(Boolean).filter(r => r.error);

if (prsCreated.length > 0) {
  log(`✓ PRs created (${prsCreated.length}):`);
  prsCreated.forEach(r => log(`  ${r.displayName || r.repo}: ${r.prUrl}`));
}
if (prsFailed.length > 0) {
  log(`❌ PR failures (${prsFailed.length}):`);
  prsFailed.forEach(r => log(`  ${r.displayName || r.repo}: ${r.error}`));
}

// ─── Phase 9: Jira Tickets (best-effort — never blocks the run) ──────────────

phase('Jira Tickets');
log('Step 5/5 — Creating Jira tickets (best-effort)...');

// Only attempt if Jira env vars were present in prereqs
let ticketResults = [];
let created = [];
let existing = [];
let failed = [];

const jiraEnvOk = !(prereqs && prereqs.notes && prereqs.notes.some(n => n.includes('Jira env vars missing')));

if (!jiraEnvOk) {
  log('⚠ Jira env vars missing — skipping ticket creation. PRs are done, fix is complete.');
} else if (prsCreated.length > 0) {
  // Create one ticket per proposed group that got a PR
  const ticketGroups = proposedTickets.filter(t =>
    prsCreated.some(pr => pr.displayName === t.displayName || pr.repo === t.repo)
  );

  if (ticketGroups.length > 0) {
    log(`Creating ${ticketGroups.length} ticket(s) under ${config.epicKey} (best-effort)...`);

    ticketResults = await pipeline(
      ticketGroups,
      (group) => {
        const pr = prsCreated.find(p => p.displayName === group.displayName || p.repo === group.repo);
        const fix = verifiedFixes.find(f => f.displayName === group.displayName || f.repo === group.repo);
        const verify = verifyResults.find(v => v && (v.displayName === group.displayName || v.repo === group.repo));
        return agent(
          `Create a Jira ticket for this security fix group. This is BEST-EFFORT — if it fails, just return action: "failed" with the error. Do not retry.

Fix group #${group.index}: "${group.summary}"
Repo: ${group.displayName} (full name: ${group.repo})
Source: ${group.source}
Bucket: ${group.bucket}
Findings (${group.findingCount}): ${JSON.stringify(group.findings.slice(0, 10), null, 2)}${group.findings.length > 10 ? `\n... and ${group.findings.length - 10} more` : ''}
PR: ${pr ? pr.prUrl : 'N/A'}
Build: ${fix && fix.buildPassed ? 'PASS' : 'CHECK PR'}
Local scan: ${verify && verify.passed ? 'PASS' : 'REVIEW'}

${group.existingTicket ? `An existing ticket ${group.existingTicket} covers this. Return action: "existing" with ticketKey: "${group.existingTicket}".` : `Create a new Jira Story:
- Project: ISS
- Issue type: Story
- Parent: ${config.epicKey}
- Summary: "${group.summary}"
- Description (ADF):
  - Heading "Findings": table with Resource/Package | Severity | Fix Action
  - Heading "PR": link to ${pr ? pr.prUrl : 'pending'}
  - Heading "Acceptance Criteria": "${group.source === 'WIZ' ? 'Wiz' : 'Snyk'} shows 0 HIGH/CRITICAL for ${group.displayName} after fix deployed to PROD"
- Labels: security, ${group.source.toLowerCase()}-fix

Create using:
curl -s -X POST -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -H "Content-Type: application/json" "https://autoclub.atlassian.net/rest/api/3/issue" -d @/tmp/jira-ticket-${group.index}.json -o /tmp/jira-ticket-result-${group.index}.json

Use the Write tool to create /tmp/jira-ticket-${group.index}.json with the request body first.
Use the Read tool on the result file.
IMPORTANT: Use curl's built-in -u flag for auth. Do NOT build AUTH variable with base64/echo.`}

Return: ticketKey (the ISS-XXXXX key), action ("created" or "existing" or "failed"), error if failed.`,
          { label: `ticket:${group.index}:${group.displayName}`, phase: 'Jira Tickets', schema: TICKET_SCHEMA }
        );
      }
    );

    created = ticketResults.filter(Boolean).filter(r => r.action === 'created');
    existing = ticketResults.filter(Boolean).filter(r => r.action === 'existing');
    failed = ticketResults.filter(Boolean).filter(r => r.action === 'failed');

    if (created.length > 0)  log(`✓ Created  ${created.length} ticket(s)  : ${created.map(r => r.ticketKey).join(', ')}`);
    if (existing.length > 0) log(`✓ Linked   ${existing.length} existing  : ${existing.map(r => r.ticketKey).join(', ')}`);
    if (failed.length > 0)   log(`⚠ Failed   ${failed.length} ticket(s) (best-effort, not blocking): ${failed.map(r => r.error).join('; ')}`);
  }
}

log(`━━━ WORKFLOW COMPLETE ━━━`);
log(`Epic       : ${config.epicKey}`);
log(`Fixes      : ${successfulFixes.length} repos fixed | ${failedFixes.length} failed`);
log(`Scan gate  : ${verifyPassed.length} passed | ${verifyFailed.length} blocked`);
log(`PRs        : ${prsCreated.length} created | ${prsFailed.length} failed`);
log(`Tickets    : ${created.length} created | ${existing.length} linked | ${failed.length} skipped (best-effort)`);
log(`━━━━━━━━━━━━━━━━━━━━━━━━`);

return {
  status: 'complete',
  epicKey: config.epicKey,
  fixResults: fixResults.filter(Boolean).map(r => ({ repo: r.displayName || r.repo, branch: r.branch, ok: !r.error })),
  verifyResults: verifyResults.filter(Boolean).map(r => ({ repo: r.displayName || r.repo, passed: r.passed, high: r.remainingHigh, critical: r.remainingCritical, medium: r.remainingMedium })),
  verifyBlocked: verifyFailed.map(r => ({ repo: r.displayName || r.repo, issues: r.newIssues })),
  reviewResults: reviewResults.filter(Boolean).map(r => ({ repo: r.displayName || r.repo, passed: r.passed })),
  prsCreated: prsCreated.map(r => ({ repo: r.displayName || r.repo, url: r.prUrl })),
  prsFailed: prsFailed.map(r => ({ repo: r.displayName || r.repo, error: r.error })),
  ticketsCreated: created.map(r => r.ticketKey).filter(Boolean),
  ticketsExisting: existing.map(r => r.ticketKey).filter(Boolean),
  proposedTickets,
};
