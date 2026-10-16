---
name: snyk-fix
description: Run Snyk vulnerability checks locally, triage issues and resolve them before committing
invocation: /snyk-fix [--scan-only] [--workspace <name>]
---

# Snyk Fix Command

Runs Snyk vulnerability scans across all workspace packages, triages each finding, and applies fixes (upgrades, resolutions, or patches) before the code is committed.

## Prerequisites Check

Before scanning, verify tooling is available:

```bash
# Check snyk CLI
which snyk || npm install -g snyk

# Check authentication
snyk auth status  ||  echo  "Run: snyk auth"
```

If `snyk` is not installed or not authenticated, output clear instructions and stop.

## Workflow

### 1. Discovery Phase

Identify all scannable `package.json` files in the monorepo (excluding `node_modules`):

```bash
find . -name "package.json" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -path "*/cdk.out/*" \
  | sort
```

### 2. Scan Phase

Run `snyk test` against the root and each workspace package. Capture JSON output for structured triage:

```bash
# Root scan
snyk test --json --all-projects 2>&1 | tee /tmp/snyk-results.json

# Per-package fallback if --all-projects is unsupported
snyk test --json --file=<package.json path> 2>&1
```

For each result, extract and display a summary table:

| Package | Severity | Vulnerability | Introduced By | Fix Available |
|---------|----------|---------------|---------------|---------------|
| webpack@5.94.0 | Low | SSRF | webpack | Upgrade to 5.104.1 |
| ajv@6.12.6 | High | ReDoS | aws-cdk-lib > ajv | Upgrade to 6.14.0 |

Group findings into five buckets:
- **Direct upgrades**: dependency is in a `package.json` this repo controls, and a safe version exists
- **Transitive upgrades**: vulnerability is in a sub-dependency; fix via `resolutions` in root `package.json`
- **Outside workspace**: package is not listed in the root yarn workspaces — root `resolutions` do not apply to it
- **Upstream blocked**: vulnerability is introduced by an internal or third-party package (`@ace-clublabs/*`, `@aws-sdk/*` pinned inside an internal lib, etc.) that this repo cannot directly upgrade — requires a ticket to the owning team
- **No fix available**: no patched version exists anywhere yet — document and skip

### 3. Triage Phase

For each vulnerability, determine the fix strategy:

1. **Direct dependency** (`dependencies`/`devDependencies` in a workspace `package.json`):
   - Read the current version constraint
   - Identify the minimum patched version from Snyk output
   - Propose the version bump: e.g., `webpack: "^5.94.0"` → `"^5.104.1"`

2. **Transitive dependency** (introduced by a library you don't own):
   - Add or update a `resolutions` entry in the **root** `package.json`
   - Example: `"minimatch": "^3.1.3"` under `resolutions`
   - Verify the resolution is compatible with the owning package's peer constraints
   - **Before applying**: confirm the affected package is listed in the root `workspaces` array — yarn `resolutions` only apply to workspace members; packages outside the workspace are unaffected

3. **Outside workspace** (package exists in the repo but is not a yarn workspace member):
   - Root `resolutions` have no effect — yarn does not hoist or resolve deps for non-workspace packages
   - Check the root `package.json` `workspaces` array to confirm the gap
   - Suggest one of:
     - **Add to workspaces** (preferred): add the package path to the root `workspaces` array so root resolutions apply. Warn that this changes hoisting behaviour and requires `yarn install` from the root.
     - **Direct version bump**: upgrade the direct dependency in the package's own `package.json` to a version that no longer pulls in the vulnerable transitive dep. Check the dependency's changelog to identify which version first included the fix.
     - **Local `overrides`/`resolutions`**: if the package uses npm, add an `overrides` block to its own `package.json`; if it uses yarn, note that per-package `resolutions` is not supported — the package must be added to the workspace or the direct dep bumped.
   - State clearly which option was chosen and why

4. **Upstream blocked** (introduced via an `@ace-clublabs/*` or other uncontrolled internal package):
   - Identify the internal package name and pinned version that pulls in the vulnerable dep
   - **Before raising a ticket, always check npm for a newer published version that already fixes it:**
     ```bash
     npm view @ace-clublabs/<package-name> version        # latest published
     npm view @ace-clublabs/<package-name> dependencies   # what uuid/etc it ships with
     ```
   - If a newer version is already published with the fix: bump the internal package version in the affected workspace `package.json` files — no ticket needed
   - If no: document the blocker clearly — name the internal package, the CVE, and state that a ticket to the owning team is required
   - Assess whether a yarn `resolutions` override is safe:
     - Check whether the fix version is a **major version bump** (e.g. uuid v8 → v11). If so, warn explicitly that the internal library's code may break at runtime even if `yarn install` succeeds, because import paths or APIs may have changed.
     - Check whether the fix version is a **minor/patch bump**. If so, a resolution is low-risk and can be proposed with a note.
   - When a resolution would cross a major version, suggest it only as a last resort with a clear warning, and always recommend raising a ticket to the owning team as the proper fix.

   #### Known fix — SNYK-JS-UUID-16133035 (uuid Medium)

   This CVE has **multiple independent chains** in ISS repos. You must trace and fix ALL of them:

   **Chain 1:** `iss-common-lambda-v3 → aws-lambda-v3 → uuid@8.x`
   **Chain 2:** `iss-http-client → iss-common-util → log-cannon → uuidv4 → uuid@3.x`
   **Chain 3:** `aws-lambda-logger → uuid@8.x`

   **Why lambda package.json files list `"uuid": "8.3.2"`:** The lambdas do NOT import uuid directly. The dep is there because yarn hoists it from `aws-lambda-v3`. Once the upstream packages are fixed, those entries can be removed.

   **Fix action — trace each chain dynamically (do NOT rely on hardcoded versions):**

   ```bash
   # Step 1: Check the latest published versions of ALL packages in the chains
   npm view @ace-clublabs/aws-lambda-v3 version
   npm view @ace-clublabs/aws-lambda-logger version
   npm view @ace-clublabs/iss-common-lambda-v3 version
   npm view @ace-clublabs/iss-common-util version
   npm view @ace-clublabs/log-cannon version
   npm view @ace-clublabs/iss-http-client version

   # Step 2: Verify each latest version no longer depends on vulnerable uuid
   npm view @ace-clublabs/aws-lambda-v3@latest dependencies | grep uuid
   npm view @ace-clublabs/aws-lambda-logger@latest dependencies | grep uuid
   npm view @ace-clublabs/log-cannon@latest dependencies | grep -i "uuid\|uuidv4"
   npm view @ace-clublabs/iss-common-util@latest dependencies | grep log-cannon
   ```

   Steps (batch — do NOT prompt per file):
   1. Bump `@ace-clublabs/aws-lambda-v3` to latest in ALL workspace `package.json` files (use grep + sed loop)
   2. Bump `@ace-clublabs/iss-common-lambda-v3` and `@ace-clublabs/iss-http-client` to latest in ALL package.json files AND root resolutions
   3. Add root `package.json` resolutions for ALL packages in the chain that yarn resolves to old versions:
      - `@ace-clublabs/aws-lambda-logger` → latest (fixes Chain 3)
      - `@ace-clublabs/iss-common-util` → latest (fixes Chain 2 — ships newer log-cannon)
      - `@ace-clublabs/log-cannon` → latest (fixes Chain 2 — drops uuidv4, uses uuid@^14)
   4. Run `yarn install` — this updates yarn.lock
   5. Remove `"uuid": "8.3.2"` from ALL lambda package.json files that list it (batch removal)
   6. Run `yarn install` again to clean the lock file
   7. Verify ALL chains are resolved:
      ```bash
      # Should return 0 for both
      grep -c "uuid@8.3.2" yarn.lock
      grep -c "uuid@3.3.3" yarn.lock
      # Check what remains
      grep -A2 "^uuid@" yarn.lock
      # Acceptable: uuid@8.0.0 (aws-sdk v2 — separate), uuid4 (unrelated)
      ```

   **How to identify which resolutions are needed (dynamic — don't hardcode):**

   ```bash
   # After bumping package.json files but BEFORE declaring success, check what yarn actually resolved:
   yarn install
   grep 'uuid "^8\|uuid "8\|uuidv4' yarn.lock
   # If any results: trace back to the parent package, check if a newer version exists, add resolution
   ```

   The key insight: `package.json` declares semver ranges (e.g. `"iss-common-util": "*"`), but yarn.lock pins exact versions. Resolutions in root `package.json` force yarn to pick specific versions for these ranges. You must add resolutions for any internal package where yarn's resolved version is outdated.

   **Do not** force `uuid@^11.1.1` via yarn `resolutions` directly — the major version jump (v8→v11) removes the `uuid/v4` deep-import path. Always fix by bumping the upstream packages that depend on uuid.

   **⚠ uuid@11 changes `v4()` return type:** After bumping uuid to `^11.x`, any test using `jest.spyOn(uuid, 'v4').mockReturnValue('some-string')` will fail with `TS2345: Argument of type 'string' is not assignable to parameter of type 'Uint8Array'`. Fix: add `as any` to the mock return value: `mockReturnValue('some-guid' as any)`.

   **uuid4 is NOT uuid:** `uuid4` (package `uuid4@^1.1.4`) is a completely separate package that uses Node's built-in `crypto.randomBytes()`. It has NO dependency on the `uuid` npm package and is NOT affected by SNYK-JS-UUID-16133035. Do not modify or remove `uuid4` references when fixing this CVE.

   #### Known fix — axios/uuid via @ace-clublabs/playwright-testrail-reporter or playwright-splunk-reporter

   `tests/ui` folders are typically outside the root workspace, so root resolutions don't apply. These repos have their own `package.json` and `yarn.lock`.

   > **Deprecation notice:** `@ace-clublabs/playwright-testrail-reporter` is being deprecated and will not receive further updates. **Do NOT bump it to a newer version** — the fix for any vulnerability it introduces is always a `resolutions` entry in `tests/ui/package.json`. Log a warning in the fix summary when this package is the vulnerability source.

   **Fix action — always apply resolutions directly, skip the version check:**

   Do NOT run `npm view` to check for a newer testrail-reporter version — there won't be one. Instead, immediately identify the vulnerable transitive deps and pin them via resolutions in `tests/ui/package.json`:

   ```bash
   # Step 1 — confirm which vulns are introduced via the reporter
   cd tests/ui
   snyk test --json 2>&1 | python3 -c "
   import json, sys
   data = json.load(sys.stdin)
   vulns = data.get('vulnerabilities', []) if isinstance(data, dict) else []
   for v in vulns:
       chains = [' > '.join(p.get('name','') + '@' + p.get('version','') for p in v.get('from', []))]
       if any('testrail' in c or 'splunk' in c for c in chains):
           print(v['id'], v['severity'], v['packageName'], '@', v['version'], '|', chains[0])
   "

   # Step 2 — find minimum safe version for each flagged package
   npm view axios version          # latest axios
   npm view uuid version           # latest uuid
   ```

   ```bash
   # Step 3 — add resolutions to tests/ui/package.json (always do this regardless of reporter version)
   ```

   Add or update the `resolutions` block in `tests/ui/package.json`:
   ```json
   "resolutions": {
     "axios": "^1.8.2",
     "uuid": "^11.1.0"
   }
   ```

   Also bump the direct `axios` dep in `tests/ui/package.json` if it is listed there:
   ```bash
   grep '"axios"' tests/ui/package.json
   # If present as a direct dep → bump it to ^1.8.2
   ```

   ```bash
   # Step 4 — install and verify
   cd tests/ui && yarn install
   grep -A2 "^axios@\|^uuid@" yarn.lock | grep "version"
   # Confirm resolved versions are at or above the pinned resolution floor
   ```

   **Warning to emit in the fix summary when this package is involved:**
   ```
   ⚠  @ace-clublabs/playwright-testrail-reporter is deprecated and will not receive upstream fixes.
      Vulnerabilities introduced by this package are mitigated via resolutions in tests/ui/package.json.
      Plan to replace it with an alternative TestRail integration before it is removed from the registry.
   ```

   For `playwright-splunk-reporter`, check for a newer version first (it is not deprecated) before falling back to resolutions.

   **Dead deps:** Check if any lambda directly declares `uuidv4` in its package.json. If the source code doesn't import it (`grep -r "uuidv4" lambdas/<name>/src/`), remove it — it's a dead dependency.

   #### Known fix — js-yaml via @ace-clublabs/feature-flags → @splitsoftware/splitio

   CVEs: SNYK-JS-JSYAML-17900054 (fix: js-yaml >=4.3.0) and SNYK-JS-JSYAML-18593780 (fix: js-yaml >=4.3.1)
   Chain: `@ace-clublabs/feature-flags > @splitsoftware/splitio@^11.11.1 > js-yaml@^4.2.0`

   **Why bumping feature-flags doesn't fix it:** As of 2026-08, `@ace-clublabs/feature-flags@latest` (1.1.13) still declares `@splitsoftware/splitio: "^11.11.1"`. The latest `@splitsoftware/splitio@11.11.2` still declares `js-yaml: "^4.2.0"`. Yarn resolves this to `4.2.0` unless forced.

   **Fix action — add a yarn resolution to force js-yaml to 4.3.1:**

   ```json
   "resolutions": {
     "js-yaml": "^4.3.1"
   }
   ```

   A global `js-yaml` resolution is safe here — js-yaml `4.3.1` is a patch bump within 4.x and compatible with all consumers declaring `^4.x.x`. Run `yarn install` and confirm `yarn.lock` shows `js-yaml@4.3.1`.

   ```bash
   grep -A2 "^js-yaml@" yarn.lock | grep "version"
   # Should show version "4.3.1" or higher within 4.x (Yarn resolves to the highest satisfying ^4.3.1)
   ```

   #### Known fix — Transitive CDK vulnerabilities (brace-expansion, fast-uri, etc.)

   CDK repos frequently get flagged for transitive vulnerabilities introduced via `aws-cdk-lib → <intermediate> → <vulnerable-package>`. These are fixed with **scoped resolutions** — no aws-cdk-lib upgrade needed.

   **How to trace and fix ANY transitive CDK vulnerability:**

   Step 1 — Identify the chain from Snyk output (e.g. `aws-cdk-lib > minimatch > brace-expansion@5.0.8`):
   ```bash
   # Confirm the intermediate package and its constraint
   npm view aws-cdk-lib@$(grep -A2 "aws-cdk-lib@" yarn.lock | grep "version" | head -1 | awk '{print $2}' | tr -d '"') dependencies | grep <intermediate>
   # e.g.: npm view aws-cdk-lib@2.263.0 dependencies | grep minimatch
   # Output: minimatch: '^10.2.5'

   # Then check what the intermediate declares for the vulnerable package
   npm view <intermediate>@<version> dependencies | grep <vulnerable-pkg>
   # e.g.: npm view minimatch@10.2.5 dependencies | grep brace-expansion
   # Output: { 'brace-expansion': '^5.0.5' }
   ```

   Step 2 — Find the latest patched version:
   ```bash
   npm view <vulnerable-pkg> version
   # e.g.: npm view brace-expansion version → 5.0.9
   ```

   Step 3 — Confirm compatibility (the fix version must satisfy the semver range from Step 1):
   - If intermediate declares `^5.0.5` and fix is `5.0.9` → compatible (same major, higher patch)
   - If it would cross a major version → NOT safe as a resolution, needs a different approach

   Step 4 — Add a scoped resolution in root `package.json`:
   ```json
   "resolutions": {
     "aws-cdk-lib/**/<vulnerable-pkg>": "^<fix-version>"
   }
   ```

   Step 5 — Run `yarn install` and verify:
   ```bash
   yarn install
   # Confirm the vulnerable version is gone from yarn.lock
   grep -A2 "<vulnerable-pkg>@" yarn.lock | grep "version"
   ```

   **Examples of this pattern (as of 2026-08):**

   | CVE | Vulnerable | Chain | Fix resolution |
   |-----|-----------|-------|----------------|
   | SNYK-JS-BRACEEXPANSION-18512280 | brace-expansion@5.0.8 | aws-cdk-lib → minimatch@10.2.5 → brace-expansion | `"aws-cdk-lib/**/minimatch": "^10.2.6"` (minimatch@10.2.6 ships brace-expansion@5.0.9) |
   | SNYK-JS-FASTURI-16642394 | fast-uri@3.1.0 | aws-cdk-lib → table → ajv → fast-uri | `"fast-uri": "^3.1.5"` |

   **Why this works without upgrading aws-cdk-lib:** Yarn resolutions override the resolved version for a given semver range. If `minimatch` declares `brace-expansion@^5.0.5`, yarn normally picks the highest published version satisfying that range. A resolution forces a specific minimum. As long as the fix version is within the same major, it's compatible.

   **⚠ Malformed resolution key syntax (Yarn Berry only — breaks Yarn v1):** Do NOT use `"brace-expansion@^range": "version"` syntax — this is Yarn Berry/v2+ syntax only. In Yarn v1 it concatenates into an invalid string key and silently breaks `yarn install`. Always use bare name or scoped-path keys: `"aws-cdk-lib/**/minimatch"` not `"minimatch@^range"`.

   **Note on Snyk `--all-projects` and brace-expansion:** Snyk's `--all-projects` mode resolves dependency chains from registry metadata, not from yarn.lock. This means even with `aws-cdk-lib/**/minimatch: ^10.2.6` in resolutions, Snyk may still report `brace-expansion@5.0.8` because it traces `aws-cdk-lib@X > minimatch@^10.2.5` → resolves `10.2.5` from registry → `brace-expansion@^5.0.5` → `5.0.8`.

   **If Snyk still reports brace-expansion HIGH after applying the minimatch resolution:**

   Step 1 — Add a direct scoped brace-expansion resolution to root `package.json`:
   ```json
   "aws-cdk-lib/**/brace-expansion": "^<min-fix-version-from-advisory>"
   ```
   Look up the minimum fixed version from the Snyk advisory (do not hardcode). Use `^` not an exact version.

   Step 2 — Check if `snyk-filter` already suppresses it in CI. ISS repos use a shared `snyk-filter` config (`shared-snyk-severity-all-types-filter.yml`) that may already filter this CVE from the build gate. Check the CI log for `"No issues found after custom filtering"` — if present, the gate is not blocked even though raw `snyk test` output shows the finding.

   Step 3 — If Snyk still reports HIGH from a specific sub-package manifest (CI log shows `Testing .../api-gateway/...` before the finding), add the same resolution to that sub-package's `package.json`. Only replicate to sub-packages that are explicitly flagged in the scan output — do not preemptively replicate to all.

   #### Known fix — Hardcoded JWT / secret tokens in test files (Exposed Secrets)

   This finding affects **all ISS teams** — 26+ occurrences across 16 repos. Scanners (Snyk Code, Wiz, ACE Exposed Secrets audit) flag any string matching the JWT pattern `eyJ...<header>.<payload>.<signature>` as a hardcoded secret — even in test files, even if the claims are fake.

   **Scope:** This fix applies ONLY to files matching `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `__tests__/*`, `__mocks__/*`, or `test/` directories. Do NOT modify production source files without manual review.

   **IMPORTANT — Check before applying:** Before replacing a JWT string with `buildMockJwt()`, verify that the **production code under test actually decodes the JWT payload** (e.g. calls `Buffer.from(token.split('.')[1], 'base64')`, `jwt.verify()`, or `JSON.parse(atob(...))`).

   - If the handler only checks `if (!Authorization)` (existence check) → replace with `'Bearer test-token'` instead. No `buildMockJwt` needed.
   - If the handler decodes the JWT payload to extract claims (scope, clubCode, customerId) → use `buildMockJwt()` with the required claims.
   - Check `validateAuthBearer()` in `@lib/utility` — it only checks existence, NOT content.
   - Check `verifyScopePolicyByBearerToken()` in `@lib/utility` — this DOES decode the JWT and needs `buildMockJwt`.

   Most Lambda handlers in this repo use `validationHandler()` which calls `validateAuthBearer()` — a simple existence check. Only `AccessTokenHelper.verifyScopePolicyByBearerToken()` actually Base64-decodes the token. Do not add complexity where a simple string suffices.

   **Affected repos (as of 2026-08):**
   - autoiq (5), homeiq (4), billing-summary (2), anonymous-poi (2), address-change (2)
   - cmn-policyview, cmn-homeiq, cmn-auto-vehicle-ao, policyview, guidewire-okta
   - driver-ao, home-ao-mortgage-change, insurance-coverage-change, auto-add-replace-vehicle

   **Why it keeps failing:** Scanners pattern-match on base64-encoded `{"alg":"RS256"}` header + three dot-separated base64url segments. A syntactically valid JWT — real or fake — triggers the rule. Replacing one JWT with another "test" JWT that still uses RS256 **will be flagged again**.

   **Fix action — replace hardcoded JWTs with programmatically built tokens:**

   Step 1: Find all hardcoded JWTs in test files:
   ```bash
   grep -rn "eyJ" --include="*.test.ts" --include="*.test.tsx" --include="*.spec.ts" . \
     | grep -v node_modules | grep -v dist
   ```

   Step 2: For each match, replace the hardcoded string with a builder function:

   ```typescript
   // Helper — add to a shared test utility (e.g. @lib/common/src/test-helpers.ts)
   export function buildMockJwt(claims: Record<string, unknown> = {}): string {
     const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
     const payload = Buffer.from(JSON.stringify({
       ver: 1,
       jti: 'test-jti-000',
       iss: 'https://test-identity.example.com/oauth2/test000',
       aud: 'test-audience-id',
       iat: 1700000000,
       exp: 1700003600,
       cid: 'test-client-id',
       uid: 'test-user-id',
       scp: ['offline_access', 'openid', 'clubCode', 'scope', 'profile', 'customerId'],
       sub: 'testuser@example.com',
       selfRecovery: false,
       clubCode: '004',
       scope: ['guidewire.edge.policy.CAA000000000.ALL'],
       customerId: '0000000000000000',
       preferred_username: 'testuser@example.com',
       ...claims,
     })).toString('base64url');
     return `${header}.${payload}.unsigned`;
   }
   ```

   ```typescript
   // In the test file — replace the hardcoded eyJ... string:
   import { buildMockJwt } from '@lib/common/src/test-helpers';

   const mockBearerToken = buildMockJwt({
     clubCode: '004',
     scope: ['guidewire.edge.policy.CHO147541002.ALL'],
   });
   ```

   Step 3: If the test validates JWT structure (checks for three segments, decodes payload):
   ```typescript
   // Use HS256 with a literal dummy key — still passes structure validation
   import { sign } from 'jsonwebtoken';
   const mockBearerToken = sign(
     { clubCode: '004', scope: [...], customerId: '0000000000000000' },
     'test-only-not-a-real-key',
     { algorithm: 'HS256', expiresIn: '1h' }
   );
   ```

   **Do not:**
   - Copy-paste a real JWT from browser devtools or Postman (even with claims redacted, the signature is real)
   - Replace a real JWT with another "fake" one that still has `alg: "RS256"` — scanners will flag it again
   - Add `snyk:ignore` without first trying the `alg: "none"` approach
   - Modify any file outside of test directories without explicit review

   **Verification:** After replacing, run:
   ```bash
   grep -rn "eyJ" --include="*.test.ts" --include="*.test.tsx" --include="*.spec.ts" . \
     | grep -v node_modules | grep -v dist | grep -v "alg.*none"
   ```
   If zero results, the secret scan will pass. Also run `snyk code test` if available to confirm.

   **Scanner trigger rules** (must match ALL to flag):
   - `eyJ` prefix (base64 for `{"`)
   - Three dot-separated base64url segments
   - Known signing algorithm in header: `RS256`, `RS384`, `RS512`, `ES256`, `PS256`

   Tokens with `alg: "none"` or `alg: "HS256"` signed by a literal string do not match — they cannot authenticate against any real identity provider.

5. **No upgrade path**:
   - Note the CVE, severity, and affected path
   - Explain the full dependency chain (e.g. `aws-crt → mqtt → help-me → glob → inflight`) so the reader understands why no action is possible from this repo
   - State whether the vulnerability is exploitable given the runtime context (e.g. a build-time-only dep, a CLI-only tool, a dep only reachable via a code path not exercised in production)
   - Add a comment in the PR description explaining why it was skipped
   - Do NOT add `// snyk:ignore` without documenting a justification

### 4. Fix Phase

Apply fixes in order — most severe first (High → Medium → Low):

#### Direct upgrades — BATCH OPERATIONS

**IMPORTANT: Do NOT prompt the user for each package.json individually.** When a fix requires bumping a dependency across multiple workspace packages (e.g. `@ace-clublabs/aws-lambda-v3` from `^10.1.11` to `^10.1.13`), batch ALL edits in a single pass:

1. Use `grep -rn` to find ALL package.json files declaring the dependency
2. Update ALL of them at once (script or multi-edit — no per-file confirmation)
3. Run `yarn install` ONCE after all edits are done
4. If the fix also requires removing an obsolete transitive dep from lambda package.json files (e.g. removing `"uuid": "8.3.2"` after bumping aws-lambda-v3), batch-remove those too

```bash
# Example: batch bump aws-lambda-v3 across all workspace packages
# First get the latest version dynamically:
LATEST=$(npm view @ace-clublabs/aws-lambda-v3 version)
grep -rln '"@ace-clublabs/aws-lambda-v3"' --include="package.json" . | grep -v node_modules | while read f; do
  sed -i.bak "s/\"@ace-clublabs\/aws-lambda-v3\": \"[^\"]*\"/\"@ace-clublabs\/aws-lambda-v3\": \"^${LATEST}\"/" "$f"
done

# Then reinstall ONCE
yarn install --ignore-engines
```

Also update root `package.json` resolutions for transitive deps that pin old versions (e.g. `iss-common-lambda-v3` resolution must match the version in workspace packages).

Prefer `^` range to allow patch updates.

#### Transitive resolutions
Before editing, confirm the affected package is in the root `workspaces` array. If it is not, resolutions will have no effect — handle it under "Outside workspace" instead.

**Resolution pre-flight — run these checks before writing any resolution entry:**

1. **Only add if not already present** — run `node -e "const p=require('./package.json'); console.log(JSON.stringify(p.resolutions||{},null,2))"` and confirm the key does not already exist. If it does, update rather than duplicate.

2. **Scope to the narrowest subtree** — if the vulnerability chain traces through a single package (e.g. `aws-cdk-lib → yaml`), use `pkg/**/dep` not bare `dep`. A bare key overrides the dep for every consumer in the monorepo, which can break unrelated packages that need a different major.

3. **Collect all consumer ranges first** — before setting the pinned version, find every range declared for that dep across the lockfile (replace `<dep>` with the actual package name):
   ```bash
   grep "^<dep>@" yarn.lock
   # e.g.: grep "^minimatch@" yarn.lock
   # Output: minimatch@^10.2.5, minimatch@^3.0.4, minimatch@^3.1.1:
   ```
   The pinned version must satisfy ALL of them, not just the target chain. Use the highest minimum across all consumers as the floor.

4. **Use `^` not `>=`** — never write `">=X.Y.Z"` in resolutions. The `>=` form allows future majors during updates and can silently introduce breaking changes. Always use `"^X.Y.Z"`.

5. **Flag any major-version crossing** — if the pinned version crosses a major boundary vs. any consumer's declared range, document the justification as a comment in the PR description. Common legitimate cases: ESM-only packages breaking Jest (e.g. uuid v14 ESM-only; pin to v11 + add `moduleNameMapper` for CJS), abandoned packages with no in-range fix.

6. **Keep internal `@ace-clublabs/*` resolution pins current** — when an internal package is pinned to an exact version in resolutions (e.g. `"@ace-clublabs/ace-identity": "10.0.22"`), verify that the pin is >= the highest version floor required by any consumer in the dep graph:
   ```bash
   # Find what version consumers require
   yarn why @ace-clublabs/<package> 2>&1 | grep "depends on it\|Hoisted"
   npm view @ace-clublabs/<package> version   # latest published
   ```
   If any consumer requires a higher version than the pinned exact value, bump the pin to the latest published version that satisfies all consumers. Stale exact pins can cause `yarn install` to silently install a version that breaks dependents at runtime.

Edit the **root** `package.json` `resolutions` field:

```json
"resolutions": {
  "chalk": "^4.0.0",
  "aws-cdk-lib/**/minimatch": "^3.1.3",
  "serialize-javascript": "^7.0.3"
}
```

Then run `yarn install` to apply the resolutions.

#### Outside workspace packages
For packages not in the root `workspaces`, apply the fix inside that package's own directory. Prefer npm `overrides` (if the package has a `package-lock.json`) or adding the package to the root workspace. Document the chosen approach in the commit message.

### 5. Resolution Compatibility Check

Run this check after every Fix Phase that added, changed, or removed entries in root `package.json` `resolutions` (or `overrides`). Its job is to catch three failure modes before `yarn install` silently locks in a broken state:

1. **Resolution version is outside the declared semver range** — the owning package declared `"^3.1.0"` but the resolution pins `"^2.x"` (incompatible major) or an exact version below the minimum. Yarn applies the resolution but the package may break at runtime.
2. **Resolution is now stale** — an upgrade in the Fix Phase already satisfies the constraint natively; keeping the resolution adds noise and can block future patch updates.
3. **Missing resolution** — the Fix Phase bumped a direct dep that introduces a new vulnerable transitive, but no resolution was added for it.

#### Step 1 — Read the current state

```bash
# Print the full resolutions block from root package.json
node -e "const p = require('./package.json'); console.log(JSON.stringify(p.resolutions || p.overrides || {}, null, 2))"

# Show which direct deps were changed in the Fix Phase
git diff --name-only HEAD | grep package.json
```

#### Step 2 — Verify each resolution is within range

For every entry in `resolutions` / `overrides`, check that the pinned version satisfies the semver range declared by the owning package:

```bash
# For each resolution entry "pkg": "^X.Y.Z", find what the owner requires:
# Example: resolution "brace-expansion": "^5.0.9"
# Owner (minimatch) declares: "brace-expansion": "^5.0.5"
# Check: is 5.0.9 >= 5.0.5 and same major? → compatible

# Automated check — for each resolution, find all declaring packages in yarn.lock
# and confirm the pinned version satisfies their range:
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const resolutions = pkg.resolutions || pkg.overrides || {};
const lockfile = fs.readFileSync('./yarn.lock', 'utf8');

for (const [name, pinnedRange] of Object.entries(resolutions)) {
  const escaped = name.replace(/[@/]/g, c => '\\\\' + c);
  // Find all version declarations for this package in yarn.lock
  const matches = [...lockfile.matchAll(new RegExp(escaped + '@([^:]+):\\n  version \"([^\"]+)\"', 'g'))];
  if (matches.length === 0) {
    console.log('ORPHAN:', name, '— not found in yarn.lock; resolution may be dead');
  } else {
    console.log('OK:', name, '@', pinnedRange, '— found', matches.length, 'usage(s) in lock');
  }
}
"
```

Report any `ORPHAN` entries — resolutions pointing to packages not present in the lockfile are dead and should be removed.

#### Step 3 — Check for stale resolutions made redundant by the upgrade

For each resolution that targets a package introduced by a dep you just upgraded, verify whether the new version of that dep already satisfies the required version natively:

```bash
# Example: you bumped aws-cdk-lib from 2.260.0 to 2.265.0.
# Check whether the new version of aws-cdk-lib ships brace-expansion >= 5.0.9 natively:
NEW_CDK=$(node -e "const p = require('./node_modules/aws-cdk-lib/package.json'); console.log(p.version)" 2>/dev/null)
npm view aws-cdk-lib@$NEW_CDK dependencies | grep brace-expansion
# If result is "brace-expansion: '^5.0.9'" or higher → the resolution is now redundant

# General pattern: for each transitive resolution, trace back to the dep that was upgraded
# and check if the NEW version of that dep now satisfies the constraint without the resolution
```

If the upgraded dep already pins a version that satisfies the constraint: **remove the resolution** from root `package.json` to avoid locking in a floor that might conflict with future updates.

#### Step 4 — Confirm no new vulnerable transitives were introduced

After `yarn install` completes (from the Fix Phase), scan the lockfile for any packages that were added or upgraded and cross-reference against the Snyk results:

```bash
# Show every package that changed version in yarn.lock since the last clean state
git diff yarn.lock | grep '^+  version' | sort -u

# For any new package version, check if Snyk knows about a vulnerability:
# (use the existing snyk scan output from Step 2 above — no need to re-scan)
# Look for entries in the Snyk output that match newly introduced packages
```

If a new vulnerable transitive was introduced by one of the upgrades, add a resolution for it before proceeding.

#### Step 5 — Produce the compatibility summary table

| Resolution | Pinned version | Owning package's range | Compatible? | Action |
|-----------|---------------|----------------------|-------------|--------|
| `brace-expansion` | `^5.0.9` | `^5.0.5` (minimatch) | ✅ | Keep |
| `fast-uri` | `^3.1.5` | `^3.1.0` (ajv) | ✅ | Keep |
| `minimatch` | `^3.1.3` | `^3.0.4` (glob) | ✅ | Keep |
| `some-old-pkg` | `^1.2.3` | — (not in lockfile) | ⚠ ORPHAN | Remove |

**Only proceed to the CDK CLI Compatibility Check when:**
- No `ORPHAN` resolutions remain
- All pinned versions are within the owning package's declared range
- No new vulnerable transitives were introduced by the upgrades

### 6. CDK CLI Compatibility Check

Run this check whenever `aws-cdk-lib` was bumped in any `package.json` during the Fix Phase. Skipping it risks a broken build — the CDK CLI enforces a maximum cloud assembly schema version and will refuse to synthesize if `aws-cdk-lib` is too far ahead.

#### Why this matters

`aws-cdk-lib` generates a cloud assembly at `cdk synth` time. The schema version increases with each CDK release. The CDK CLI has a hard maximum schema version it can read — if `aws-cdk-lib` produces schema 54 but the installed CLI only supports up to 53, the build fails with:

```
This CDK CLI is not compatible with the CDK library used by your application.
(Cloud assembly schema version mismatch: Maximum schema version supported is 53.x.x,
but found 54.0.0. You need at least CLI version 2.1135.0 to read this manifest.)
```

#### Step 1 — Find every pinned `aws-cdk` CLI version across the repo

```bash
grep -rn '"aws-cdk"' --include="package.json" . \
  | grep -v node_modules | grep -v dist
```

#### Step 2 — Find the minimum required CLI version for the new `aws-cdk-lib`

```bash
# Check what schema version the new aws-cdk-lib produces
node -e "
const { CLOUD_ASSEMBLY_VERSION } = require('./node_modules/aws-cdk-lib/cx-api');
console.log('Cloud assembly schema version:', CLOUD_ASSEMBLY_VERSION);
" 2>/dev/null || echo "Run: yarn install first"
```

Check the [aws-cdk-lib release notes](https://github.com/aws/aws-cdk/releases) for the target version — the schema version bump and minimum CLI version are always noted there.

#### Step 3 — Compare and flag mismatches

Build a compatibility table:

| File | Current `aws-cdk` CLI | New `aws-cdk-lib` | Min CLI required | Compatible? |
|------|-----------------------|-------------------|-----------------|-------------|
| `infrastructure/cdk-app/package.json` | `2.1129.0` | `2.262.1` | `2.1135.0` | ❌ |
| `api-gateway/package.json` | `2.1133.0` | `2.262.1` | `2.1135.0` | ✅ |

For any ❌ row, bump `aws-cdk` to the minimum required version. Also check CI workflows for `CDK_ASSETS_VERSION` — `cdk-assets` does **not** follow the same version number as `aws-cdk-lib`, always look it up independently:

```bash
grep -rn "CDK_ASSETS_VERSION" .github/workflows/
npm view cdk-assets version
```

#### Step 4 — Re-run `yarn install` and validate synthesis

After bumping `aws-cdk` CLI versions, run `yarn install` then validate every CDK stack synthesizes cleanly:

```bash
yarn install

# Find all CDK stacks (directories containing cdk.json)
find . -name "cdk.json" -not -path "*/node_modules/*" -not -path "*/cdk.out/*"

# Run cdk synth for each stack — must all succeed before proceeding
cd infrastructure/cdk-app   && npx cdk synth > /dev/null && echo "✅ cdk-app synth OK"
cd infrastructure/config     && npx cdk synth > /dev/null && echo "✅ config synth OK"
cd api-gateway               && npx cdk synth > /dev/null && echo "✅ api-gateway synth OK"
# (repeat for each stack found above)
```

**This step is a hard gate — do not proceed to commit if any stack fails to synthesize.** A synthesis failure means the CDK CLI version is still incompatible or a dependency is missing. Fix the error before moving on.

### 7. Verification Phase

Re-run Snyk locally to confirm all fixed vulnerabilities are resolved:

```bash
snyk test --all-projects 2>&1
```

Display a diff table:

| Vulnerability | Before | After | Status |
|---------------|--------|-------|--------|
| SSRF webpack | Low | — | Fixed |
| ReDoS ajv | High | — | Fixed |
| ReDoS minimatch | High | — | Fixed |

If any High/Critical vulnerabilities remain unfixed, **do not proceed to commit** — report them with a clear explanation.

### 8. Test Phase

After dependency changes, verify nothing broke:

```bash
# Full test suite
yarn test-silent

# Or targeted if --workspace was specified
lerna run test-app --scope "{<workspace>,}" --include-dependencies
```

If tests fail due to the version bump, investigate compatibility. Roll back only the specific change that caused the failure and document it.

### 9. Commit Phase

Only when all of the following are true:
- Zero High/Critical vulnerabilities remain
- `yarn install` succeeded (no hoisting conflicts)
- Resolution Compatibility Check passed (Step 5) — no orphan resolutions, all pins within range
- If `aws-cdk-lib` was bumped:
  - CDK CLI version compatibility check passed (Step 6)
  - `npx cdk synth` succeeded on **every CDK stack** in the repo (hard gate — no exceptions)
- `yarn build` succeeded
- Tests pass

Stage and commit the changes:

```bash
git add package.json yarn.lock <any workspace package.json files changed>
git commit -m "fix: resolve Snyk vulnerabilities via dependency upgrades

- Upgrade webpack to 5.104.1 (SSRF SNYK-JS-WEBPACK-15235959, 15235969)
- Add resolution for minimatch ^3.1.3 (ReDoS SNYK-JS-MINIMATCH-*)
- Add resolution for serialize-javascript ^7.0.3 (Code Injection)
- Add resolution for ajv ^8.18.0 (ReDoS SNYK-JS-AJV-*)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

## Options

| Flag | Behaviour |
|------|-----------|
| `--scan-only` | Run scan and triage, print report, make no changes |
| `--workspace <name>` | Scan only the named workspace (e.g. `@lib/gateway`) |
| `--no-commit` | Apply fixes and run tests, but do not commit |
| `--high-only` | Fix only High and Critical severity issues |
| `--skip-cdk-check` | Skip CDK CLI compatibility check (use only when no CDK stacks are present) |

## Output Format

At the end of each run, print a structured summary:

```
╔══════════════════════════════════════════════╗
║           SNYK FIX SUMMARY                  ║
╠══════════════════════════════════════════════╣
║ Scanned packages   : 8                      ║
║ Issues found       : 6 (3 High, 3 Low)      ║
║ Fixed (direct)     : 2                      ║
║ Fixed (resolution) : 2                      ║
║ Outside workspace  : 1                      ║
║ Upstream blocked   : 1                      ║
║ No fix available   : 1                      ║
║ Tests              : PASS                   ║
║ Committed          : YES                    ║
╚══════════════════════════════════════════════╝
```

Follow with a triage table covering every finding:

| CVE | Severity | Vulnerable Pkg | Introduced By | Fixable? | Action |
|-----|----------|---------------|---------------|----------|--------|
| SNYK-JS-WEBPACK-123 | High | webpack@5.94.0 | direct | Yes | Bumped to 5.104.1 in `web/package.json` |
| SNYK-JS-MINIMATCH-456 | High | minimatch@3.1.2 | aws-cdk-lib > minimatch | Yes | Added resolution `minimatch: ^3.1.3` |
| SNYK-JS-UUID-16133035 | High | uuid@9.0.1 | @aws-sdk/client-dynamodb@3.848.0 | Yes | Bumped SDK to 3.896.0 in `cmn-mock-api/package.json` |
| SNYK-JS-FASTURI-* | High | fast-uri@3.1.0 | aws-cdk-lib > ajv > fast-uri | Outside workspace | `api-gateway/cmn-manage-driver` not in yarn workspaces — see below |
| SNYK-JS-UUID-16133035 | Medium | uuid@8.3.2 | @ace-clublabs/aws-lambda-v3 > uuid | Yes | Bumped aws-lambda-v3 to latest + added resolutions (see Known fix section) |
| SNYK-JS-INFLIGHT-6095116 | Medium | inflight@1.0.6 | aws-crt > mqtt > inflight | No | No upstream fix — see below |

Then list each non-fixed item with full context:

```
Outside workspace (root resolutions do not apply):
  - fast-uri@3.1.0 via aws-cdk-lib > table > ajv in api-gateway/cmn-manage-driver
    CVE: SNYK-JS-FASTURI-16642394, SNYK-JS-FASTURI-16642399 (High)
    Root cause: api-gateway/cmn-manage-driver is not listed in the root workspaces array,
      so the existing "fast-uri": "^3.1.2" resolution in root package.json has no effect on it.
    Options (in order of preference):
      1. Add "api-gateway/cmn-manage-driver" to root workspaces — root resolutions will then apply.
         Side-effect: changes dep hoisting; run `yarn install` from root and verify the CDK build still works.
      2. Bump aws-cdk-lib in api-gateway/cmn-manage-driver/package.json to a version that
         pulls fast-uri ≥ 3.1.2 transitively. Check aws-cdk-lib release notes for the first
         version to include ajv > fast-uri ≥ 3.1.2.
      3. Add an npm "overrides" block to api-gateway/cmn-manage-driver/package.json:
           "overrides": { "fast-uri": "^3.1.2" }
         Note: this package uses npm (no yarn.lock present), so npm overrides are supported.

Upstream blocked (example — when no newer version of the internal package exists):
  - <package>@<version> via @ace-clublabs/<internal-lib>@<version>
    CVE: <SNYK-ID> (severity)
    Fix versions: <package> ≥ X.Y.Z — check if it's a major version jump from current.
    Before declaring "blocked", ALWAYS check npm for a newer internal lib version:
      npm view @ace-clublabs/<internal-lib> version
      npm view @ace-clublabs/<internal-lib>@latest dependencies | grep <package>
    If a newer version exists that fixes the dep → bump it (see Known fix sections above).
    If truly no fix exists → raise ticket to owning team, document the CVE and dep chain.

No fix available (accept risk):
  - inflight@1.0.6 via aws-crt > mqtt > help-me > glob@7.2.3
    CVE: SNYK-JS-INFLIGHT-6095116 (Medium)
    Reason: No patched version of inflight exists; the package is effectively unmaintained.
    Runtime exposure: inflight is only reachable through mqtt's internal glob usage, which is
      itself only active during MQTT connection setup — assess whether that code path is
      exercised in production and document accordingly.
    Action: Document in PR description; revisit if aws-crt ships a newer mqtt dependency.
```

## Safety Rules

- Never modify files inside `node_modules` directly
- Never add `snyk:ignore` comments without a written justification
- Never commit if High/Critical vulnerabilities remain unfixed and a fix exists
- Always run `yarn install` after editing any `package.json` or `yarn.lock`
- Roll back individual failing upgrades rather than reverting all changes
- Prefer the narrowest version range that satisfies the fix (use `^` not `*`)
