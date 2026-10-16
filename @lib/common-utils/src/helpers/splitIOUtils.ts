export enum SplitIOFeatureFlags {
  AUTO_EFNOL_WITHOUT_LOGIN_ALLOW_MARKET_BY_CLUB_CODE = 'AutoEFNOLWithoutLoginAllowMarketByClubCode',
  ENABLE_AUTO_EFNOL_ANONYMOUS_INTEGRATION_GATEWAY = 'AutoEfnol1stPartyAnonymousEnableIntegrationGateway',
  ENABLE_AUTO_EFNOL_BEHIND_LOGIN_INTEGRATION_GATEWAY = 'AutoEfnolBehindLoginEnableIntegrationGateway',
  AUTO_EFNOL_ALLOWED_POLICY_PREFIXES = 'insuranceclaims_auto-efnol_allowed-policy-prefixes',
  AUTO_EFNOL_ENABLE_WINSURANCE = 'insuranceclaims_auto-efnol-1stp-winsurance'
}

export enum SplitIOTreatment {
  ON = 'on',
  OFF = 'off'
}
