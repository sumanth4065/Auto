import { AceIdentityEnv } from '@ace-clublabs/ace-identity';
import { describe, expect, it } from 'vitest';
import {
  buildAceIdentityWInsuranceParams,
  provideWInsuranceAceIdentity
} from './provideWInsuranceAceIdentity';

const W_LANDING_PAGE_PATH = '/insurance/anon/landing/auto-efnol-w-insurance#/anonymous';
const REDIRECT_PATH = '/insurance/auto/file-a-claim';

const COMMON_PARAMS = {
  LOGIN_FLOW: 'anonymous',
  ASSOCIATED_APP: 'efnol',
  SCOPES: ['iss.anonymous.efnol'],
  TEMPLATE: 'lastNamePolicyNumber',
  SEARCH_PARAMS: [{ query: 'isW', value: 'true' }],
  DISABLE_BYPASS_PKCE: true,
  BYPASS_AUTH2: false
} as const;

const BACKENDS = {
  A1: 'A1',
  B1: 'B1'
} as const;

const HOSTS = {
  LOCALHOST: 'localhost:3000',
  DEV1: 'appdev1.ace.aaa.com',
  DEV2: 'appdev2.ace.aaa.com',
  QA1: 'appqa1.ace.aaa.com',
  QA2: 'appqa2.ace.aaa.com',
  UAT1: 'appuat1.ace.aaa.com',
  UAT2: 'appuat2.ace.aaa.com',
  PROD: 'app.ace.aaa.com',
  UNKNOWN: 'unknown.example.com'
} as const;

describe('provideWInsuranceAceIdentity', () => {
  it('should build correct parameters for localhost environment', () => {
    const host = HOSTS.LOCALHOST;
    const params = buildAceIdentityWInsuranceParams(host);

    expect(params).toEqual({
      env: AceIdentityEnv.NonProd,
      redirectUri: `https://${host}${REDIRECT_PATH}`,
      loginFlow: COMMON_PARAMS.LOGIN_FLOW,
      associatedApp: COMMON_PARAMS.ASSOCIATED_APP,
      scopes: COMMON_PARAMS.SCOPES,
      template: COMMON_PARAMS.TEMPLATE,
      searchParams: COMMON_PARAMS.SEARCH_PARAMS,
      backend: BACKENDS.A1,
      disableBypassPkce: COMMON_PARAMS.DISABLE_BYPASS_PKCE,
      loginUrl: `https://${HOSTS.PROD}${W_LANDING_PAGE_PATH}`,
      bypassAuth2: COMMON_PARAMS.BYPASS_AUTH2
    });
  });

  it('should build correct parameters for DEV1 environment', () => {
    const host = HOSTS.DEV1;
    const params = buildAceIdentityWInsuranceParams(host);

    expect(params).toEqual({
      env: AceIdentityEnv.NonProd,
      redirectUri: `https://${host}${REDIRECT_PATH}`,
      loginFlow: COMMON_PARAMS.LOGIN_FLOW,
      associatedApp: COMMON_PARAMS.ASSOCIATED_APP,
      scopes: COMMON_PARAMS.SCOPES,
      template: COMMON_PARAMS.TEMPLATE,
      searchParams: COMMON_PARAMS.SEARCH_PARAMS,
      backend: BACKENDS.A1,
      disableBypassPkce: COMMON_PARAMS.DISABLE_BYPASS_PKCE,
      loginUrl: `https://${HOSTS.DEV1}${W_LANDING_PAGE_PATH}`,
      bypassAuth2: COMMON_PARAMS.BYPASS_AUTH2
    });
  });

  it('should build correct parameters for DEV2 environment', () => {
    const host = HOSTS.DEV2;
    const params = buildAceIdentityWInsuranceParams(host);

    expect(params).toEqual({
      env: AceIdentityEnv.NonProd,
      redirectUri: `https://${host}${REDIRECT_PATH}`,
      loginFlow: COMMON_PARAMS.LOGIN_FLOW,
      associatedApp: COMMON_PARAMS.ASSOCIATED_APP,
      scopes: COMMON_PARAMS.SCOPES,
      template: COMMON_PARAMS.TEMPLATE,
      searchParams: COMMON_PARAMS.SEARCH_PARAMS,
      backend: BACKENDS.B1,
      disableBypassPkce: COMMON_PARAMS.DISABLE_BYPASS_PKCE,
      loginUrl: `https://${HOSTS.DEV2}${W_LANDING_PAGE_PATH}`,
      bypassAuth2: COMMON_PARAMS.BYPASS_AUTH2
    });
  });

  it('should build correct parameters for QA1 environment', () => {
    const host = HOSTS.QA1;
    const params = buildAceIdentityWInsuranceParams(host);

    expect(params).toEqual({
      env: AceIdentityEnv.NonProd,
      redirectUri: `https://${host}${REDIRECT_PATH}`,
      loginFlow: COMMON_PARAMS.LOGIN_FLOW,
      associatedApp: COMMON_PARAMS.ASSOCIATED_APP,
      scopes: COMMON_PARAMS.SCOPES,
      template: COMMON_PARAMS.TEMPLATE,
      searchParams: COMMON_PARAMS.SEARCH_PARAMS,
      backend: BACKENDS.A1,
      disableBypassPkce: COMMON_PARAMS.DISABLE_BYPASS_PKCE,
      loginUrl: `https://${HOSTS.QA1}${W_LANDING_PAGE_PATH}`,
      bypassAuth2: COMMON_PARAMS.BYPASS_AUTH2
    });
  });

  it('should build correct parameters for QA2 environment', () => {
    const host = HOSTS.QA2;
    const params = buildAceIdentityWInsuranceParams(host);

    expect(params).toEqual({
      env: AceIdentityEnv.NonProd,
      redirectUri: `https://${host}${REDIRECT_PATH}`,
      loginFlow: COMMON_PARAMS.LOGIN_FLOW,
      associatedApp: COMMON_PARAMS.ASSOCIATED_APP,
      scopes: COMMON_PARAMS.SCOPES,
      template: COMMON_PARAMS.TEMPLATE,
      searchParams: COMMON_PARAMS.SEARCH_PARAMS,
      backend: BACKENDS.B1,
      disableBypassPkce: COMMON_PARAMS.DISABLE_BYPASS_PKCE,
      loginUrl: `https://${HOSTS.QA2}${W_LANDING_PAGE_PATH}`,
      bypassAuth2: COMMON_PARAMS.BYPASS_AUTH2
    });
  });

  it('should build correct parameters for UAT1 environment', () => {
    const host = HOSTS.UAT1;
    const params = buildAceIdentityWInsuranceParams(host);

    expect(params).toEqual({
      env: AceIdentityEnv.NonProd,
      redirectUri: `https://${host}${REDIRECT_PATH}`,
      loginFlow: COMMON_PARAMS.LOGIN_FLOW,
      associatedApp: COMMON_PARAMS.ASSOCIATED_APP,
      scopes: COMMON_PARAMS.SCOPES,
      template: COMMON_PARAMS.TEMPLATE,
      searchParams: COMMON_PARAMS.SEARCH_PARAMS,
      backend: BACKENDS.A1,
      disableBypassPkce: COMMON_PARAMS.DISABLE_BYPASS_PKCE,
      loginUrl: `https://${HOSTS.UAT1}${W_LANDING_PAGE_PATH}`,
      bypassAuth2: COMMON_PARAMS.BYPASS_AUTH2
    });
  });

  it('should build correct parameters for UAT2 environment', () => {
    const host = HOSTS.UAT2;
    const params = buildAceIdentityWInsuranceParams(host);

    expect(params).toEqual({
      env: AceIdentityEnv.NonProd,
      redirectUri: `https://${host}${REDIRECT_PATH}`,
      loginFlow: COMMON_PARAMS.LOGIN_FLOW,
      associatedApp: COMMON_PARAMS.ASSOCIATED_APP,
      scopes: COMMON_PARAMS.SCOPES,
      template: COMMON_PARAMS.TEMPLATE,
      searchParams: COMMON_PARAMS.SEARCH_PARAMS,
      backend: BACKENDS.B1,
      disableBypassPkce: COMMON_PARAMS.DISABLE_BYPASS_PKCE,
      loginUrl: `https://${HOSTS.UAT1}${W_LANDING_PAGE_PATH}`,
      bypassAuth2: COMMON_PARAMS.BYPASS_AUTH2
    });
  });

  it('should build correct parameters for PROD environment', () => {
    const host = HOSTS.PROD;
    const params = buildAceIdentityWInsuranceParams(host);

    expect(params).toEqual({
      env: AceIdentityEnv.Prod,
      redirectUri: `https://${host}${REDIRECT_PATH}`,
      loginFlow: COMMON_PARAMS.LOGIN_FLOW,
      associatedApp: COMMON_PARAMS.ASSOCIATED_APP,
      scopes: COMMON_PARAMS.SCOPES,
      template: COMMON_PARAMS.TEMPLATE,
      searchParams: COMMON_PARAMS.SEARCH_PARAMS,
      backend: undefined,
      disableBypassPkce: COMMON_PARAMS.DISABLE_BYPASS_PKCE,
      loginUrl: `https://${HOSTS.PROD}${W_LANDING_PAGE_PATH}`,
      bypassAuth2: COMMON_PARAMS.BYPASS_AUTH2
    });
  });

  it('should build correct parameters for default/fallback case', () => {
    const host = HOSTS.UNKNOWN;
    const params = buildAceIdentityWInsuranceParams(host);

    expect(params).toEqual({
      env: AceIdentityEnv.NonProd,
      redirectUri: `https://${host}${REDIRECT_PATH}`,
      loginFlow: COMMON_PARAMS.LOGIN_FLOW,
      associatedApp: COMMON_PARAMS.ASSOCIATED_APP,
      scopes: COMMON_PARAMS.SCOPES,
      template: COMMON_PARAMS.TEMPLATE,
      searchParams: COMMON_PARAMS.SEARCH_PARAMS,
      backend: BACKENDS.A1,
      disableBypassPkce: COMMON_PARAMS.DISABLE_BYPASS_PKCE,
      loginUrl: `https://${HOSTS.PROD}${W_LANDING_PAGE_PATH}`,
      bypassAuth2: COMMON_PARAMS.BYPASS_AUTH2
    });
  });

  it('should handle all host patterns without throwing', () => {
    const hosts = [
      HOSTS.LOCALHOST,
      HOSTS.DEV1,
      HOSTS.DEV2,
      HOSTS.QA1,
      HOSTS.QA2,
      HOSTS.UAT1,
      HOSTS.UAT2,
      HOSTS.PROD,
      HOSTS.UNKNOWN
    ];

    hosts.forEach(host => {
      expect(() => provideWInsuranceAceIdentity(host)).not.toThrow();
      const result = provideWInsuranceAceIdentity(host);
      expect(result).toBeDefined();
    });
  });

  it('should use lastNamePolicyNumber template for all environments', () => {
    const hosts = [HOSTS.DEV1, HOSTS.QA1, HOSTS.UAT1, HOSTS.PROD];

    hosts.forEach(host => {
      const params = buildAceIdentityWInsuranceParams(host);
      expect(params.template).toBe('lastNamePolicyNumber');
    });
  });

  it('should include isW=true in searchParams for brand detection after redirect', () => {
    const hosts = [HOSTS.DEV1, HOSTS.QA1, HOSTS.UAT1, HOSTS.PROD, HOSTS.LOCALHOST];

    hosts.forEach(host => {
      const params = buildAceIdentityWInsuranceParams(host);
      expect(params.redirectUri).not.toContain('?isW=true');
      expect(params.searchParams).toContainEqual({ query: 'isW', value: 'true' });
    });
  });

  it('should point loginUrl to the WInsurance auto EFNOL landing page for all environments', () => {
    const hosts = [HOSTS.DEV1, HOSTS.QA1, HOSTS.UAT1, HOSTS.PROD, HOSTS.LOCALHOST];

    hosts.forEach(host => {
      const params = buildAceIdentityWInsuranceParams(host);
      expect(params.loginUrl).toContain('/auto-efnol-w-insurance');
    });
  });
});
