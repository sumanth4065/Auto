# Xray Migration Receipt

**Date:** 6/8/2026, 8:55:34 PM

## Execution Checklist
- ✅ | Monorepo Target Selected
- ✅ | Loaded 1006 Excel Mappings
- ✅ | Biome Formatting Applied

## Migrated Tests by File

### `tests/ui/tests/AutoeFNOLWithLoginTestCases.spec.ts`
- [x] C2574477 → ISS-16188
- [x] C2574478 → ISS-16189
- [x] C2574479 → ISS-16190
- [x] C2574480 → ISS-16191
- [x] C2574481 → ISS-16192
- [x] C2574482 → ISS-16193
- [x] C2574483 → ISS-16194
- [x] C2574484 → ISS-16195
- [x] C2574485 → ISS-16196
- [x] C2574486 → ISS-16197
- [x] C2574487 → ISS-16198
- [x] C2574488 → ISS-16199
- [x] C2574489 → ISS-16200
- [x] C2574490 → ISS-16201
- [x] C2574495 → ISS-16206
- [x] C2574496 → ISS-16207
- [x] C2679083 → ISS-16209
- [x] C2679084 → ISS-16210
- [x] C2679085 → ISS-16211
- [x] C2679086 → ISS-16212
- [x] C2679087 → ISS-16213

### `tests/ui/tests/AutoeFNOLWithoutLoginTestCases.spec.ts`
- [x] C1662910 → ISS-16216
- [x] C1662911 → ISS-16217
- [x] C1662912 → ISS-16218
- [x] C1662913 → ISS-16219
- [x] C1662914 → ISS-16220
- [x] C1662915 → ISS-16221
- [x] C1662916 → ISS-16222
- [x] C2004336 → ISS-16226
- [x] C2239863 → ISS-16227
- [x] C2455550 → ISS-16228
- [x] C2004336 → ISS-16226
- [x] C2679126 → ISS-16230
- [x] C2679130 → ISS-16231
- [x] C2679131 → ISS-16232
- [x] C2679132 → ISS-16233
- [x] C2679133 → ISS-16234
- [x] C2679134 → ISS-16235
- [x] C2679135 → ISS-16236
# Xray Migration Receipt

## Run 1 — 7/28/2026, 10:44:06 PM

### Summary

| Metric | Count |
|--------|-------|
| Spec files scanned | 2 |
| Tests migrated this run | 12 |
| Tests already migrated (skipped) | 0 |
| TestRail IDs with no Xray mapping | 0 |
| Files written | 2 |

### Configuration

| Setting | Value |
|---------|-------|
| Playwright config | `tests/ui/playwright.config.ts` |
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

#### `tests/ui/tests/AutoeFNOLWithLoginTestCases.spec.ts` (5 test(s))
- [x] C2574491 → ISS-16202
- [x] C2574492 → ISS-16203
- [x] C2574493 → ISS-16204
- [x] C2574494 → ISS-16205
- [x] C2574497 → ISS-16208

#### `tests/ui/tests/AutoeFNOLWithoutLoginTestCases.spec.ts` (7 test(s))
- [x] C1662909 → ISS-16215
- [x] C1662917 → ISS-16223
- [x] C1662918 → ISS-16224
- [x] C1662919 → ISS-16225
- [x] C2686071 → ISS-16237
- [x] C2167573 → ISS-16214
- [x] C2455551 → ISS-16229

### Next Steps

- [ ] **Review the Git diff** — verify all title swaps, annotations, and config changes are correct
- [ ] **Set up credentials** — copy `.env.xray-example` → `.env` and fill in Xray client ID/secret
- [ ] **Validate syntax** — run `npx playwright test --dry-run` to confirm no spec was broken
- [ ] **Upload to Xray** — run `npm run test:xray` to execute and upload results
