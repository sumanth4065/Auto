import { getBehindLoginAceIdentityConfig, getEnvProps } from './provideBehindLoginAceIdentity';
import { it, describe, expect } from 'vitest';

describe('provideBehindLoginAceIdentity', () => {
  describe('should provide AceIdentity based on environment', () => {
    it('should provide aceIdentity for localhost environment (default)', () => {
      const result = getBehindLoginAceIdentityConfig('localhost:8080');
      expect(result).toEqual({
        env: 'non-prod',
        redirectUri: 'https://localhost:8080/insurance/auto/file-a-claim/behindlogin',
        loginUrl: 'https://appdev1.ace.aaa.com/enterprise/identity/dev/#/login',
        bypassAuth2: true,
        disableBypassPkce: true,
        backend: 'A1',
        scopes: ['profile', 'clubCode', 'scope', 'openid', 'customerId', 'membershipStatus']
      });
    });

    it('should provide aceIdentity for DEV1 environment', () => {
      const result = getBehindLoginAceIdentityConfig('appdev1.ace.aaa.com');
      expect(result).toEqual({
        env: 'non-prod',
        redirectUri: 'https://appdev1.ace.aaa.com/insurance/auto/file-a-claim/behindlogin',
        loginUrl: 'https://appdev1.ace.aaa.com/enterprise/identity/dev/#/login',
        bypassAuth2: true,
        disableBypassPkce: true,
        backend: 'A1',
        scopes: ['profile', 'clubCode', 'scope', 'openid', 'customerId', 'membershipStatus']
      });
    });

    it('should provide aceIdentity for DEV2 environment with B1 backend', () => {
      const result = getBehindLoginAceIdentityConfig('appdev2.ace.aaa.com');
      expect(result).toEqual({
        env: 'non-prod',
        redirectUri: 'https://appdev2.ace.aaa.com/insurance/auto/file-a-claim/behindlogin',
        loginUrl: 'https://appdev1.ace.aaa.com/enterprise/identity/dev/#/login/backend/b1',
        bypassAuth2: true,
        disableBypassPkce: true,
        backend: 'B1',
        scopes: ['profile', 'clubCode', 'scope', 'openid', 'customerId', 'membershipStatus']
      });
    });

    it('should provide aceIdentity for QA1 environment', () => {
      const result = getBehindLoginAceIdentityConfig('appqa1.ace.aaa.com');
      expect(result).toEqual({
        env: 'non-prod',
        redirectUri: 'https://appqa1.ace.aaa.com/insurance/auto/file-a-claim/behindlogin',
        loginUrl: 'https://appqa1.ace.aaa.com/enterprise/identity/qa/#/login',
        bypassAuth2: true,
        disableBypassPkce: true,
        backend: 'A1',
        scopes: ['profile', 'clubCode', 'scope', 'openid', 'customerId', 'membershipStatus']
      });
    });

    it('should provide aceIdentity for QA2 environment with B1 backend', () => {
      const result = getBehindLoginAceIdentityConfig('appqa2.ace.aaa.com');
      expect(result).toEqual({
        env: 'non-prod',
        redirectUri: 'https://appqa2.ace.aaa.com/insurance/auto/file-a-claim/behindlogin',
        loginUrl: 'https://appqa1.ace.aaa.com/enterprise/identity/qa/#/login/backend/b1',
        bypassAuth2: true,
        disableBypassPkce: true,
        backend: 'B1',
        scopes: ['profile', 'clubCode', 'scope', 'openid', 'customerId', 'membershipStatus']
      });
    });

    it('should provide aceIdentity for UAT1 environment', () => {
      const result = getBehindLoginAceIdentityConfig('appuat1.ace.aaa.com');
      expect(result).toEqual({
        env: 'non-prod',
        redirectUri: 'https://appuat1.ace.aaa.com/insurance/auto/file-a-claim/behindlogin',
        loginUrl: 'https://appuat1.ace.aaa.com/enterprise/identity/uat/#/login',
        bypassAuth2: true,
        disableBypassPkce: true,
        backend: 'A1',
        scopes: ['profile', 'clubCode', 'scope', 'openid', 'customerId', 'membershipStatus']
      });
    });

    it('should provide aceIdentity for UAT2 environment with B1 backend', () => {
      const result = getBehindLoginAceIdentityConfig('appuat2.ace.aaa.com');
      expect(result).toEqual({
        env: 'non-prod',
        redirectUri: 'https://appuat2.ace.aaa.com/insurance/auto/file-a-claim/behindlogin',
        loginUrl: 'https://appuat1.ace.aaa.com/enterprise/identity/uat/#/login/backend/b1',
        bypassAuth2: true,
        disableBypassPkce: true,
        backend: 'B1',
        scopes: ['profile', 'clubCode', 'scope', 'openid', 'customerId', 'membershipStatus']
      });
    });

    it('should provide aceIdentity for PROD environment', () => {
      const result = getBehindLoginAceIdentityConfig('app.ace.aaa.com');
      expect(result).toEqual({
        env: 'prod',
        redirectUri: 'https://app.ace.aaa.com/insurance/auto/file-a-claim/behindlogin',
        loginUrl: 'https://app.ace.aaa.com/enterprise/identity/#/login',
        bypassAuth2: true,
        disableBypassPkce: true,
        backend: 'A1',
        scopes: ['profile', 'clubCode', 'scope', 'openid', 'customerId', 'membershipStatus']
      });
    });
  });
});

describe('getEnvProps', () => {
  it('should return default props for empty host', () => {
    const result = getEnvProps('');
    expect(result).toEqual({
      aceIdentityEnv: 'non-prod',
      loginUrl: 'https://appdev1.ace.aaa.com/enterprise/identity/dev/#/login',
      backend: 'A1'
    });
  });

  it('should return DEV props with A1 backend for appdev1', () => {
    const result = getEnvProps('appdev1.ace.aaa.com');
    expect(result).toEqual({
      aceIdentityEnv: 'non-prod',
      loginUrl: 'https://appdev1.ace.aaa.com/enterprise/identity/dev/#/login',
      backend: 'A1'
    });
  });

  it('should return DEV props with B1 backend for appdev2', () => {
    const result = getEnvProps('appdev2.ace.aaa.com');
    expect(result).toEqual({
      aceIdentityEnv: 'non-prod',
      loginUrl: 'https://appdev1.ace.aaa.com/enterprise/identity/dev/#/login/backend/b1',
      backend: 'B1'
    });
  });

  it('should return QA props with A1 backend for appqa1', () => {
    const result = getEnvProps('appqa1.ace.aaa.com');
    expect(result).toEqual({
      aceIdentityEnv: 'non-prod',
      loginUrl: 'https://appqa1.ace.aaa.com/enterprise/identity/qa/#/login',
      backend: 'A1'
    });
  });

  it('should return QA props with B1 backend for appqa2', () => {
    const result = getEnvProps('appqa2.ace.aaa.com');
    expect(result).toEqual({
      aceIdentityEnv: 'non-prod',
      loginUrl: 'https://appqa1.ace.aaa.com/enterprise/identity/qa/#/login/backend/b1',
      backend: 'B1'
    });
  });

  it('should return UAT props with A1 backend for appuat1', () => {
    const result = getEnvProps('appuat1.ace.aaa.com');
    expect(result).toEqual({
      aceIdentityEnv: 'non-prod',
      loginUrl: 'https://appuat1.ace.aaa.com/enterprise/identity/uat/#/login',
      backend: 'A1'
    });
  });

  it('should return UAT props with B1 backend for appuat2', () => {
    const result = getEnvProps('appuat2.ace.aaa.com');
    expect(result).toEqual({
      aceIdentityEnv: 'non-prod',
      loginUrl: 'https://appuat1.ace.aaa.com/enterprise/identity/uat/#/login/backend/b1',
      backend: 'B1'
    });
  });

  it('should return PROD props for app.ace.aaa.com', () => {
    const result = getEnvProps('app.ace.aaa.com');
    expect(result).toEqual({
      aceIdentityEnv: 'prod',
      loginUrl: 'https://app.ace.aaa.com/enterprise/identity/#/login',
      backend: 'A1'
    });
  });

  it('should return default props for unknown host', () => {
    const result = getEnvProps('unknown.example.com');
    expect(result).toEqual({
      aceIdentityEnv: 'non-prod',
      loginUrl: 'https://appdev1.ace.aaa.com/enterprise/identity/dev/#/login',
      backend: 'A1'
    });
  });
});
