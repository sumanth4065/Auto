// ─── Team Presets ──────────────────────────────────────────────────────────────
// Add your team here. Each entry needs:
//   - wizProject: Wiz project short name (iss, olb, payments, travel, etc.)
//   - repos: list of { name, displayName, path }
//     - name: full repo name (used for Wiz/Snyk filtering)
//     - displayName: short name shown in summaries and ticket titles
//     - path: local clone path
//
// Naming convention:
//   - "autoiq", "homeiq", "policyview", "anon-poi", "anon-landing", "billing-summary",
//     "micro-payment" = frontend/app repos
//   - "cmn-*" = private-tier (backend Lambda) repos
//
// NOTE: epicKey is NOT stored here — it changes each quarter.
// Always pass it at runtime: args: { team: 'iss-yosemite', epicKey: 'ISS-XXXXX' }
//
// To add a new team:
//   1. Copy the 'iss-yosemite' block below
//   2. Change the key (e.g. 'iss-zion')
//   3. Update wizProject and repos
//   4. Commit this file

// Set GHE_WORKSPACE in your shell profile to point to your local repo root.
// e.g. export GHE_WORKSPACE=/path/to/your/repos
const BASE_PATH = process.env.GHE_WORKSPACE || null;
// Validation is deferred to runtime — throwing here breaks workflow discovery in environments without GHE_WORKSPACE.

const TEAM_PRESETS = {

  'iss-yosemite': {
    wizProject: 'iss',
    repos: [
      // AutoIQ
      { displayName: 'autoiq',
        name: 'insurance-self-service_insurancepolicychange_autoiq',
        path: `${BASE_PATH}/insurance-self-service_insurancepolicychange_autoiq` },

      // BillingSummary (app + private tier)
      { displayName: 'billing-summary',
        name: 'insurance-self-service_insurance-policy-info_billing-summary',
        path: `${BASE_PATH}/insurance-self-service_insurance-policy-info_billing-summary` },
      { displayName: 'cmn-billing-summary',
        name: 'insurance-self-service_common-insurance_billing-summary',
        path: `${BASE_PATH}/insurance-self-service_common-insurance_billing-summary` },

      // MicroPayment
      { displayName: 'micro-payment',
        name: 'insurance-self-service_insurance-policy-info_micro-payment-details',
        path: `${BASE_PATH}/insurance-self-service_insurance-policy-info_micro-payment-details` },

      // HomeIQ (app + private tier)
      { displayName: 'homeiq',
        name: 'insurance-self-service_insurancepolicychange_homeiq',
        path: `${BASE_PATH}/insurance-self-service_insurancepolicychange_homeiq` },
      { displayName: 'cmn-homeiq',
        name: 'insurance-self-service_cmn-insurancepolicychange_homeiq',
        path: `${BASE_PATH}/insurance-self-service_cmn-insurancepolicychange_homeiq` },

      // PolicyView (app + private tier)
      { displayName: 'policyview',
        name: 'insurance-self-service_insurancepolicyinfo_policyview',
        path: `${BASE_PATH}/insurance-self-service_insurancepolicyinfo_policyview` },
      { displayName: 'cmn-policyview',
        name: 'insurance-self-service_cmn-insurancepolicyinfo-common-insurance-policy',
        path: `${BASE_PATH}/insurance-self-service_cmn-insurancepolicyinfo-common-insurance-policy` },

      // Anon POI (app + private tier)
      { displayName: 'anon-poi',
        name: 'insurance-self-service_insurance-policy-info_anonymous-poi',
        path: `${BASE_PATH}/insurance-self-service_insurance-policy-info_anonymous-poi` },
      { displayName: 'cmn-anon-poi',
        name: 'insurance-self-service_cmn-insurancepolicyinfo_anonymous-poi',
        path: `${BASE_PATH}/insurance-self-service_cmn-insurancepolicyinfo_anonymous-poi` },

      // Anon Landing (app + private tier)
      { displayName: 'anon-landing',
        name: 'insurance-self-service_insurance-policy-info_anonymous-landing',
        path: `${BASE_PATH}/insurance-self-service_insurance-policy-info_anonymous-landing` },
      { displayName: 'cmn-anon-landing',
        name: 'insurance-self-service_cmn-insurancepolicyinfo_anonymous-landing',
        path: `${BASE_PATH}/insurance-self-service_cmn-insurancepolicyinfo_anonymous-landing` },

      // Active shared
      { displayName: 'guidewire-okta',
        name: 'insurance-self-service_common_guidewire-okta',
        path: `${BASE_PATH}/insurance-self-service_common_guidewire-okta` },
      { displayName: 'common-package',
        name: 'insurance-self-service_common_package',
        path: `${BASE_PATH}/insurance-self-service_common_package` },
      { displayName: 'common-utils',
        name: 'insurance-self-service_common-utils_util',
        path: `${BASE_PATH}/insurance-self-service_common-utils_util` },
    ],
  },

  'iss-claims': {
    wizProject: 'iss',
    repos: [
      { displayName: 'feature-flags',
        name: 'feature-flags',
        path: `${BASE_PATH}/feature-flags` },
    ],
  },

  // Add more teams below — copy the block above and update
  // 'iss-zion': {
  //   wizProject: 'iss',
  //   repos: [ ... ],
  // },

};
