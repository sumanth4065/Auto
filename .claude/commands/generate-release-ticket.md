Usage: <version> <track> [ready] — e.g. 05/14/2026 yellowstone ready

Generate a release ticket summary for: $ARGUMENTS

Arguments:
- version (required): The JIRA fix version (e.g., `ER2-7418`, `05/14/2026`)
- track (required): redwoods | sequoia | yosemite | zion | yellowstone | olympic
- ready (optional): If specified, only include tickets in "Pending Signoff" or "Ready to Ship" status

## Prerequisites

The following environment variables must be set in the user's shell:
- `JIRA_URL` (e.g., `https://autoclub.atlassian.net`)
- `JIRA_EMAIL`
- `JIRA_API_TOKEN` 

The tool `jq` must be installed (`brew install jq`).
 
## Steps 

### Step 1: Fetch Asset Versions from JIRA 

Delete any existing output file first, then run the asset version extraction script from the `.claude/scripts/get-asset-version/` directory: 

```bash
cd .claude/scripts/get-asset-version && rm -f asset_versions.txt && ./get-asset-versions.sh '<version>' [<track>] [ready]
```

This produces `.claude/scripts/get-asset-version/asset_versions.txt`.

### Step 2: Fetch Release Summary from JIRA

Run the release summary script from the `.claude/scripts/get-jira-release-summary/` directory:

```bash
cd .claude/scripts/get-jira-release-summary && ./get-jira-release-summary.sh '<version>' [<track>] [ready]
```

This produces `.claude/scripts/get-jira-release-summary/release_summary.txt`.

### Step 3: Parse and extract assets

Read `.claude/scripts/get-asset-version/asset_versions.txt` and extract:

1. **Standard deployable assets**: Lines matching the pattern `AssetName-X.X.X.X` (regex: `[A-Za-z][A-Za-z0-9-]*-[0-9]{1,4}(?:\.[0-9]{1,4}){3}`). These are GitHub Actions deployments.
2. **GitHub Actions links**: URLs matching `https://github.com/ACE-Clublabs/.../actions/runs/...` or `https://github.com/ACE-Clublabs/.../actions/workflows/...`
3. **Config deployments**: Lines matching patterns like `PolicyViewConfig-NNN` or other non-semver numbered assets.

### Step 3.5: Look up the current PROD-deployed version for each asset

For each standard deployable asset extracted in Step 3, query GitHub Actions to find the most recently **successful** PROD deployment run.

#### How to derive the repo and workflow

- If a `https://github.com/ACE-Clublabs/<repo>/actions/workflows/<workflow.yml>` URL was found for this asset in `asset_versions.txt`, extract `<repo>` and `<workflow.yml>` directly.
- If only an `actions/runs/<id>` URL was found, extract the repo from the URL path.
- If **no GHA URL at all** is present for this asset, mark it as **"PROD lookup unavailable — no deploy workflow URL in JIRA"** and skip.

#### Query command

For each asset with a known repo and workflow, run:

```bash
gh run list \
  --repo ACE-Clublabs/<repo> \
  --workflow <workflow.yml> \
  --status success \
  --limit 30 \
  --json databaseId,displayTitle,conclusion,createdAt,url
```

Then filter the JSON result for entries whose `displayTitle` contains `"prod"` (case-insensitive). Take the **most recent** matching entry.

#### Extract the version and URL

- Apply the asset version regex `[A-Za-z][A-Za-z0-9-]*-[0-9]{1,4}(?:\.[0-9]{1,4}){3}` to the `displayTitle` of the matching run to extract the deployed version.
- Record the run's `url` as the **PROD Deploy Link**.
- If no prod run is found in the last 30 results, expand with `--limit 100` and retry once. If still not found, flag as **"No recent PROD run found"**.

#### Record the results

For each asset, record:
- `prod_version`: the version string extracted from the run title (e.g. `1.0.372.0`)
- `prod_run_url`: the GitHub Actions run URL (e.g. `https://github.com/ACE-Clublabs/.../actions/runs/12345678`)
- `jira_version`: the target version from JIRA (from Step 3)

These are used in Step 5 to annotate the Release Scope output.

### Step 4: Identify manual/non-standard deployment steps

Scan each ticket's "Asset Versions" section for items that are NOT standard GitHub Actions deployments. Flag any of these patterns:

- **Harness feature flags**: mentions of "Harness", "feature flag", "FF"
- **Split.io flags**: mentions of "Split.io", "split", "feature toggle"
- **Manual configuration changes**: mentions of "set param", "setParams", "config change", "enable", "disable", "USE_NATIVE_MULE", environment variable changes
- **Secret/credential management**: mentions of "secret", "clientId", "credential", "API key", region-specific operations ("run the command in both east and west regions")
- **CDK/infrastructure deploys**: mentions of "cdk deploy", infrastructure changes
- **Conditional/deferred deployments**: phrases like "deploying to UAT only", "will hold off", "wait until", "see ticket", "for PROD deployment see"
- **Manual verification steps**: phrases like "verify secret", "confirm", "run the command"
- **Deploy via GHA notation**: lines like "Deploy via GHA: <url>" — these are standard but should include the URL in output
- **Any free-text instructions** that don't match the standard asset version pattern

These are critical because they represent manual steps that a release engineer must perform outside of standard GitHub Actions runs.

### Step 5: Generate the Release Ticket Summary

Produce a Jira Cloud markdown document structured for pasting directly into the JIRA release ticket description. The release ticket title format is:

```
AWS Release - <MM/DD/YYYY> : ISS <Track> (CRQ0000000XXXXX)
```

#### Jira Cloud markdown syntax rules

Jira Cloud's new editor uses standard markdown. Use these conventions throughout:

- Headings: `##` for h2, `###` for h3
- Bold: `**text**`
- Italic: `_text_`
- Bullet lists: `- item`
- Links: `[text](url)`
- Tables: standard markdown tables with `|---|` separator row
- Horizontal rules: `---`
- Checkboxes: `* [ ] item` (asterisk + space + brackets — this is Jira Cloud's checkbox syntax)

Do NOT use Jira wiki markup (`h2.`, `[text|url]`, `||`, `{color}`, `( )`).

#### Output format — Release Scope section

Group assets into their **team-specific application categories**. Only include categories that have assets with versions in the tickets list. Use the latest version for each asset.

Known category groupings (by track):

**Yellowstone:**
- Auto EFNOL 1stP + BL v2: AutoEFNOLNoAuthApp, AutoEFNOLNoAuthWebsite, EFNOLAutoNoAuthApiGateway
- Auto EFNOL 3rd Party Anonymous: AutoEFNOLThirdPartyNoAuthApp, AutoEFNOLThirdPartyNoAuthWebsite, EFNOLAutoThirdPartyNoAuthApiGateway
- Home EFNOL + BL v2: HomeEFNOLNoAuthApp, HomeEFNOLNoAuthWebsite, EFNOLHomeNoAuthApiGateway
- Auto EFNOL Behind Login: AutoEFNOLAppV3, AutoEFNOLWebsiteV3
- Home EFNOL Behind Login: HomeEFNOLAppV3, HomeEFNOLWebsiteV3
- Common Claims APIs v2: CmnClaimsAppV2, CmnAutoEFNOLAppV2, CmnHomeEFNOLAppV2, CmnClaimsV2DynamoDB, CmnEFNOLApiGatewayV2
- Claims View: ClaimsViewAppV3, ClaimsViewApiGatewayV3, ClaimsViewWebsiteV3

**Yosemite:**
- Insurance Policy Info: InsurancePolicyInfoWebsite, InsurancePolicyHuonAutoApi, PolicyViewConfig
- Billing Summary: InsuranceBillingSummaryApp, CommonInsuranceBillingSummaryApiGateway, CmnInsuranceBillingSummaryGuidewireApp, CmnInsuranceBillingHuonApp
- Micro Payments: InsurancePaymentDetailsMicroWeb, MicroPaymentDetailsApp
- Anonymous POI: AnonymousPOIWeb, AnonymousPOIApp, CmnAnonymousLandingApp, CmnAnonymousInsurancePolicyApp
- Auto IQ: AutoIQApp, CmnAutoIQApp

If an asset doesn't fit a known category, create a new group or flag it with a warning. NEVER infer categories — if unsure, flag the asset.

The output format for each asset line:

```
- AssetName: X.X.X.X - [Deploy Link](https://github.com/...) | Currently in PROD: Y.Y.Y.Y - [PROD Run](https://github.com/.../actions/runs/...)
- AssetName: X.X.X.X ([ISS-XXXXX](https://autoclub.atlassian.net/browse/ISS-XXXXX)) | Currently in PROD: Y.Y.Y.Y - [PROD Run](https://github.com/.../actions/runs/...)
- AssetName: X.X.X.X | Currently in PROD: _No recent PROD run found_
- AssetName: X.X.X.X | Currently in PROD: _lookup unavailable — no deploy workflow URL in JIRA_
```

Each asset line has two parts separated by ` | `:
1. **Target version** (from JIRA): the version to be deployed, with its deploy link or source ticket reference.
2. **PROD version** (from Step 3.5): the version currently live in PROD, linked to its GitHub Actions run.

If a GitHub Actions URL is present for an asset, include it as a markdown link: `[Deploy Link](URL)`. If no deploy URL is available, include the source ticket as a markdown link in parentheses: `([ISS-XXXXX](https://autoclub.atlassian.net/browse/ISS-XXXXX))`.

**Deduplication:** When the same asset appears across multiple tickets with different versions, apply the following rules in order:

1. **Collect all versions** for the asset across every ticket, noting each ticket's status.
2. **Identify the highest version from a ship-ready ticket** — i.e., a ticket whose status is "Ready to Ship" or "Pending Signoff". This is the deployment target version.
3. **If no ship-ready ticket has a version for this asset**, use the highest version overall and add a warning that none of its source tickets are ship-ready.
4. **If a higher version exists in a non-ship-ready ticket** (e.g. "In QA", "In Progress"), do NOT use it as the target. Instead:
   - Use the highest ship-ready version as the deployment target.
   - Add a warning in the Warnings section: "A higher version X.X.X.X exists in [ISS-XXXXX] (status: In QA) — not included because the ticket is not Ready to Ship."
5. The deploy link or source ticket reference in the Release Scope output should come from the ticket that provided the chosen (ship-ready) target version.
6. The PROD version lookup uses the workflow URL from whichever ticket (any status) has a GHA URL for this asset.

#### Full output document structure (Jira Cloud markdown):

```markdown
## Release Scope - Track Team

### Category Name
- AssetName: X.X.X.X - [Deploy Link](https://github.com/ACE-Clublabs/.../actions/runs/...) | Currently in PROD: Y.Y.Y.Y - [PROD Run](https://github.com/ACE-Clublabs/.../actions/runs/...)
- AssetName: X.X.X.X | Currently in PROD: _lookup unavailable_

---

## Manual Deployment Steps Required

These items require action OUTSIDE of standard GitHub Actions runs. A release engineer must handle these manually:

| Ticket | Title | Manual Action Required |
|--------|-------|------------------------|
| [ISS-XXXXX](https://autoclub.atlassian.net/browse/ISS-XXXXX) | Title | Description of manual step |

---

## Warnings

- **Warning text here**
- Any assets found in tickets that don't match a known category

---

## Ticket Summary

N Tickets:

[https://autoclub.atlassian.net/browse/ISS-XXXXX](https://autoclub.atlassian.net/browse/ISS-XXXXX)
[https://autoclub.atlassian.net/browse/ISS-YYYYY](https://autoclub.atlassian.net/browse/ISS-YYYYY)

---

## Release Checklist

* [ ] Asset versions list pasted into release ticket
* [ ] All versions verified deployed to UAT
* [ ] QA notified to test in UAT
* [ ] Release Tech Certified (check `#selfservice-coreteam` Slack)
* [ ] Release scope posted to deployment Slack channel with `@here`
* [ ] Assets deployed to PROD via GitHub Actions
* [ ] Manual deployment steps completed (see table above)
* [ ] QA notified to test in PROD (reply in Slack thread)
```

#### Slack notification format

When the user asks for the Slack deployment message, format it as:

```
@here *Release Scope – <Track> Team*

*<Category Name>:*
• *AssetName:* X.X.X.X
• *AssetName:* X.X.X.X

*<Category Name>:*
• *AssetName:* X.X.X.X
```

### Step 6: Write to files and present the result

Save the release ticket summary in **two formats** in the repo root. Use dashes instead of slashes in the filename (e.g. `05/14/2026` → `05-14-2026`).

#### File 1: Jira Cloud markdown — `release_ticket_<version>_jira.md`

The markdown file uses Jira Cloud syntax so the user can copy/paste directly into the Jira description field:
1. Open the file
2. Copy the entire contents (Cmd+A, Cmd+C)
3. Paste into the Jira Cloud description field — headings, bullets, links, tables, and checkboxes render natively

#### File 2: HTML — `release_ticket_<version>.html`

A fully styled HTML document so the user can alternatively copy from a browser into Jira's rich-text editor:
1. Open the file in a browser
2. Select All (Cmd+A) and Copy (Cmd+C)
3. Paste into Jira's rich text editor — formatting is preserved

Use semantic HTML with inline styles for readability: `<h2>`, `<h3>`, `<ul>/<li>`, `<table>`, `<a href>` for links, `<input type="checkbox">` for checklist items. Include a `<style>` block in `<head>` for basic typography and table borders.

The HTML content mirrors the markdown exactly — same sections, same links, same data.

Tell the user both files have been written, with the `.md` file recommended for direct Jira paste and the `.html` file as a browser-based alternative.

### Step 7: Link release tickets to the release JIRA ticket

After writing the file, automatically link all release tickets to the release ticket (e.g. `ISS-18048`) as "relates to" using the Jira REST API.

Ask the user for the release ticket key (e.g. `ISS-18048`) if it cannot be determined from the arguments or the release summary.

#### Step 7a: Permission probe

Before attempting any links, probe whether the credentials have link-creation rights by fetching the issue link types:

```bash
curl -s -o /tmp/issue-link-types.json -w "%{http_code}" -X GET "$JIRA_URL/rest/api/3/issueLinkType" -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -H "Content-Type: application/json"
```

- **HTTP 200** — credentials are valid and the API is reachable. Read `/tmp/issue-link-types.json`, find the entry with `"name": "Relates"` and extract its `id` (typically `10003`). Proceed to Step 7b.
- **HTTP 401 or 403** — no permission to manage links. Skip Step 7b entirely and go straight to the **Manual Link Fallback** below.
- **Any other error / network failure** — treat as permission denied and go to the Manual Link Fallback.

#### Step 7b: Bulk-link tickets

Loop over every ticket in the release (excluding the release ticket itself) and POST a link. Track successes and failures separately.

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST \
  "$JIRA_URL/rest/api/3/issueLink" \
  -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": { \"id\": \"<relates-id>\" },
    \"inwardIssue\": { \"key\": \"<RELEASE_TICKET>\" },
    \"outwardIssue\": { \"key\": \"<ISS-XXXXX>\" }
  }"
```

- **HTTP 201** — linked successfully. Note it.
- **HTTP 401 / 403** — permission denied for this ticket. Add it to the failed list and continue the loop (do not abort).
- **Any other non-201** — unexpected error. Add it to the failed list with the status code.

After the loop, report a summary: `Linked X / Y tickets successfully.`

If the failed list is non-empty, proceed to the **Manual Link Fallback**.

#### Manual Link Fallback

Whenever any tickets could not be linked automatically (permission denied, partial failures, or the probe failed entirely), output the following block so the user can link them manually:

```
---

## Manual Jira Linking Required

The following tickets could not be linked automatically to <RELEASE_TICKET>.
To link them in Jira: open the release ticket → **Link** → **Relates to** → paste each key below.

<ISS-XXXXX> — <Ticket Title>
<ISS-YYYYY> — <Ticket Title>
...
```

List every unlinked ticket as `KEY — Title`, one per line, so the user can paste them directly into Jira's link dialog.

## Important Notes

- The PROD version lookup (Step 3.5) requires `gh` CLI to be authenticated (`gh auth status`). If unauthenticated or rate-limited, mark all PROD versions as `lookup unavailable — gh CLI not authenticated` and continue.
- The PROD version in the output is informational only — it shows what is currently live so the release engineer can verify the delta before deploying. It does NOT change which version gets deployed (that is always the JIRA target version).
- Always check for the "Manual Deployment Steps" section carefully. Missing a manual step can cause a release failure.
- The asset regex `[A-Za-z][A-Za-z0-9-]*-[0-9]{1,4}(?:\.[0-9]{1,4}){3}` is the canonical pattern for standard assets.
- If a ticket's Asset Versions section contains ONLY free text (no regex-matching assets), it likely represents a configuration-only or infrastructure-only change — always flag it.
- "N/A" in Asset Versions means no deployment needed for that ticket.
- Links may be concatenated directly after the asset version (no space) — parse accordingly. Always extract and include these URLs as markdown links `[Deploy Link](URL)` next to the asset version in the Release Scope output.
- UAT deployment should happen 1 day before the release date.
- The release ticket JIRA fields must include: Labels=`Eng_Accept`, Fix Versions=`ER2-XXXX (MM/DD/YYYY) -...`, Deployed to=`Prod`.
- Scan EVERY ticket thoroughly. Missing even one asset version is a failure. Perform a second verification pass after the first scan.
- ONLY include assets that have versions in the tickets list. Do NOT list assets from categories that have no versions.
- If you find an asset with a version that is NOT in any known category, flag it as a warning to the user.
- The output file uses **Jira Cloud markdown** (`##`, `###`, `* [ ]`, `[text](url)`, standard markdown tables). Do NOT use Jira wiki markup (`h2.`, `[text|url]`, `||`, `{color}`). Jira Cloud's new editor renders standard markdown natively.
- Checkboxes in Jira Cloud require `* [ ]` syntax (asterisk + space + brackets), not `- [ ]`.
- Step 7 (Jira linking) requires `JIRA_URL`, `JIRA_EMAIL`, and `JIRA_API_TOKEN` env vars. If any are missing, skip linking and warn the user.
