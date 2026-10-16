# Wiz/Snyk Team → Epic Map

Update at the start of each quarter. One row per (project, team) pair.
The skill always picks the row with the latest quarter for a given (project, team).

The `repos` column is a comma-separated list of repo name suffixes (matched against
the Lambda prefix map in wiz-fix-workflow.md to derive entity filters).

Teams may also declare inline prefixes directly using `repo-name:prefix1,prefix2` syntax
when their repos are not in the central prefix map (e.g. non-ISS projects).

Shared repos (owned by no single team) are listed in a separate `shared` row and
included in every team's scope automatically.

## ISS — Q3 2026

| project | team        | epic      | quarter | jira_project_key | repos |
|---------|-------------|-----------|---------|------------------|-------|
| iss     | zion        | ISS-17910 | Q3-2026 | ISS              | insurancepolicychange_home-ao-mortgage-change, cmn-insurancepolicychange_home-ao, insurancepolicychange_change-finance-company-app, cmn-insurancepolicychange_change-finance-company, insurancepolicychange_driver-ao, cmn-insurancepolicychange_driver-ao, insurancepolicyinfo_cci-api, cmn-insurancepolicyinfo_cci-api |
| iss     | redwoods    | ISS-17911 | Q3-2026 | ISS              | insurancepolicychange_insurance-coverage-change, insurancepolicychange_auto-add-replace-vehicle, cmn-insurancepolicychange-auto-vehicle-ao, insurance-policy-change_address-change, insurancepolicychange_cmn-address-change |
| iss     | yosemite    | ISS-17912 | Q3-2026 | ISS              | insurancepolicychange_autoiq, insurance-policy-info_billing-summary, common-insurance_billing-summary, insurance-policy-info_micro-payment-details, insurancepolicychange_homeiq, cmn-insurancepolicychange_homeiq, insurancepolicyinfo_policyview, cmn-insurancepolicyinfo-common-insurance-policy, insurance-policy-info_rush-escrow, insurance-policy-info_anonymous-poi, cmn-insurancepolicyinfo_anonymous-poi, insurance-policy-info_anonymous-landing, cmn-insurancepolicyinfo_anonymous-landing, common_guidewire-okta, common-utils_util |
| iss     | yellowstone | ISS-17913 | Q3-2026 | ISS              | insuranceclaims_home-efnol-without-login, insuranceclaims-api, cmn-insuranceclaims_claims-api-v2, insuranceclaims_auto-efnol-without-login, insuranceclaims_auto-efnol-without-login-thirdparty, insuranceclaims_auto-home-efnol, insuranceclaims_claimsview |
| iss     | shared      | —         | Q3-2026 | ISS              | dev-scripts, common_package |
