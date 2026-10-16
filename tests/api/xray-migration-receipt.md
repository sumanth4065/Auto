# Xray Migration Receipt

## Run 1 — 7/28/2026, 10:39:35 PM

### Summary

| Metric | Count |
|--------|-------|
| Spec files scanned | 2 |
| Tests migrated this run | 27 |
| Tests already migrated (skipped) | 0 |
| TestRail IDs with no Xray mapping | 0 |
| Files written | 2 |

### Configuration

| Setting | Value |
|---------|-------|
| Playwright config | `tests/api/playwright.config.ts` |
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

#### `tests/api/tests/AutoeFNOLBehindLoginAPITestCases.spec.ts` (19 test(s))
- [x] C488026 → ISS-16120
- [x] C2725971 → ISS-16150
- [x] C488031 → ISS-16125
- [x] C488079 → ISS-16127
- [x] C488081 → ISS-16129
- [x] C488080 → ISS-16128
- [x] C487986 → ISS-16116
- [x] C488082 → ISS-16130
- [x] C487988 → ISS-16118
- [x] C2726396 → ISS-16151
- [x] C2726397 → ISS-16152
- [x] C489313 → ISS-16141
- [x] C489314 → ISS-16142
- [x] C489304 → ISS-16132
- [x] C489305 → ISS-16133
- [x] C489307 → ISS-16135
- [x] C489306 → ISS-16134
- [x] C489312 → ISS-16140
- [x] C489309 → ISS-16137

#### `tests/api/tests/AutoeFNOLWithoutLoginAPITestCases.spec.ts` (8 test(s))
- [x] C2004385 → ISS-16238
- [x] C2004386 → ISS-16239
- [x] C2004387 → ISS-16240
- [x] C2004388 → ISS-16241
- [x] C2004389 → ISS-16242
- [x] C2004390 → ISS-16243
- [x] C2004391 → ISS-16244
- [x] C2004392 → ISS-16245

### Next Steps

- [ ] **Review the Git diff** — verify all title swaps, annotations, and config changes are correct
- [ ] **Set up credentials** — copy `.env.xray-example` → `.env` and fill in Xray client ID/secret
- [ ] **Validate syntax** — run `npx playwright test --dry-run` to confirm no spec was broken
- [ ] **Upload to Xray** — run `npm run test:xray` to execute and upload results

---

## Run 2 — 7/28/2026, 10:41:59 PM

### Summary

| Metric | Count |
|--------|-------|
| Spec files scanned | 2 |
| Tests migrated this run | 1 |
| Tests already migrated (skipped) | 0 |
| TestRail IDs with no Xray mapping | 0 |
| Files written | 1 |

### Configuration

| Setting | Value |
|---------|-------|
| Playwright config | `tests/api/playwright.config.ts` |
| Mapping file | `xray-migration_v2.0/ISS_ID Mapping.xlsx` |

### Execution Checklist

- ✅ Monorepo Target Selected
- ✅ Migration Mode Selected (rerun)
- ✅ Snippet Location Selected
- ✅ XRAY Project Key Captured
- ✅ Jira Transition Defaults Captured
- ✅ XRAY Parent Key Ready (.env)
- ✅ Loaded 1006 Excel Mappings

### ⚠️ Missing Mappings (0)

*All TestRail IDs found in spec files had a corresponding Xray mapping. No action needed.*

### Migrated Tests by File

#### `tests/api/tests/AutoeFNOLBehindLoginAPITestCases.spec.ts` (1 test(s))
- [x] C489308 → ISS-16136

### Next Steps

- [ ] **Review the Git diff** — verify all title swaps, annotations, and config changes are correct
- [ ] **Set up credentials** — copy `.env.xray-example` → `.env` and fill in Xray client ID/secret
- [ ] **Validate syntax** — run `npx playwright test --dry-run` to confirm no spec was broken
- [ ] **Upload to Xray** — run `npm run test:xray` to execute and upload results
