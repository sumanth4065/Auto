# Xray Migration Receipt

## Run 1 — 7/28/2026, 10:31:37 PM

### Summary

| Metric | Count |
|--------|-------|
| Spec files scanned | 1 |
| Tests migrated this run | 23 |
| Tests already migrated (skipped) | 0 |
| TestRail IDs with no Xray mapping | 0 |
| Files written | 1 |

### Configuration

| Setting | Value |
|---------|-------|
| Playwright config | `tests/ada/playwright.config.ts` |
| Mapping file | `xray-migration_v2.0/ISS_ID Mapping.xlsx` |

### Execution Checklist

- ✅ Monorepo Target Selected
- ✅ Migration Mode Selected (fresh)
- ✅ Snippet Location Selected
- ✅ XRAY Project Key Captured
- ✅ Jira Transition Defaults Captured
- ✅ XRAY Parent Key Ready (.env)
- ✅ Loaded 1006 Excel Mappings

### ⚠️ Missing Mappings (0)

*All TestRail IDs found in spec files had a corresponding Xray mapping. No action needed.*

### Migrated Tests by File

#### `tests/ada/tests/EFNOLWithoutLoginADATestCases.spec.ts` (23 test(s))
- [x] C2004391 → ISS-16244
- [x] C2004392 → ISS-16245
- [x] C2004393 → ISS-16246
- [x] C2004394 → ISS-16247
- [x] C2004395 → ISS-16248
- [x] C2004396 → ISS-16249
- [x] C2004397 → ISS-16250
- [x] C2004398 → ISS-16251
- [x] C2004399 → ISS-16252
- [x] C2004400 → ISS-16253
- [x] C2004401 → ISS-16254
- [x] C2004402 → ISS-16255
- [x] C2004403 → ISS-16256
- [x] C2004404 → ISS-16257
- [x] C2004405 → ISS-16258
- [x] C2004406 → ISS-16259
- [x] C2004407 → ISS-16260
- [x] C2004408 → ISS-16261
- [x] C2004409 → ISS-16262
- [x] C2004410 → ISS-16263
- [x] C2004411 → ISS-16264
- [x] C2004412 → ISS-16265
- [x] C2004413 → ISS-16266

### Next Steps

- [ ] **Review the Git diff** — verify all title swaps, annotations, and config changes are correct
- [ ] **Set up credentials** — copy `.env.xray-example` → `.env` and fill in Xray client ID/secret
- [ ] **Validate syntax** — run `npx playwright test --dry-run` to confirm no spec was broken
- [ ] **Upload to Xray** — run `npm run test:xray` to execute and upload results
