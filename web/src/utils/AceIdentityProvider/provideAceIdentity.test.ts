import { getAceIdentityConfig } from './provideAceIdentity';
import { it, describe } from 'vitest';

describe('should provide AceIdentity based on environment', () => {
  it('should provide aceIdentity for localhost environment', () => {
    const result = getAceIdentityConfig('localhost:8080');
    expect(result).toEqual({
      env: 'non-prod',
      redirectUri: 'https://localhost:8080/insurance/auto/file-a-claim',
      disableBypassPkce: true,
      bypassAuth2: true,
      loginFlow: 'anonymous',
      scopes: ['iss.anonymous.efnol'],
      associatedApp: 'efnol',
      backend: 'A1',
      loginUrl: 'https://app.ace.aaa.com/enterprise/identity/prod#/anonymous',
      searchParams: [{ query: 'tagging', value: 'auto fnol' }],
      template: 'firstLastPolicyZip'
    });
  });

  it('should provide aceIdentity for DEV1 environment', () => {
    const result = getAceIdentityConfig('appdev1.ace.aaa.com');
    expect(result).toEqual({
      env: 'non-prod',
      redirectUri: 'https://appdev1.ace.aaa.com/insurance/auto/file-a-claim',
      disableBypassPkce: true,
      bypassAuth2: true,
      loginFlow: 'anonymous',
      scopes: ['iss.anonymous.efnol'],
      associatedApp: 'efnol',
      backend: 'A1',
      loginUrl: 'https://appdev1.ace.aaa.com/enterprise/identity/dev/#/anonymous',
      searchParams: [{ query: 'tagging', value: 'auto fnol' }],
      template: 'firstLastPolicyZip'
    });
  });

  it('should provide aceIdentity for DEV2 environment', () => {
    const result = getAceIdentityConfig('appdev2.ace.aaa.com');
    expect(result).toEqual({
      env: 'non-prod',
      redirectUri: 'https://appdev2.ace.aaa.com/insurance/auto/file-a-claim',
      disableBypassPkce: true,
      bypassAuth2: true,
      loginFlow: 'anonymous',
      scopes: ['iss.anonymous.efnol'],
      associatedApp: 'efnol',
      backend: 'B1',
      loginUrl: 'https://appdev2.ace.aaa.com/enterprise/identity/dev/#/anonymous',
      searchParams: [{ query: 'tagging', value: 'auto fnol' }],
      template: 'firstLastPolicyZip'
    });
  });

  it('should provide aceIdentity for QA1 environment', () => {
    const result = getAceIdentityConfig('appqa1.ace.aaa.com');
    expect(result).toEqual({
      env: 'non-prod',
      redirectUri: 'https://appqa1.ace.aaa.com/insurance/auto/file-a-claim',
      disableBypassPkce: true,
      bypassAuth2: true,
      loginFlow: 'anonymous',
      scopes: ['iss.anonymous.efnol'],
      associatedApp: 'efnol',
      backend: 'A1',
      loginUrl: 'https://appqa1.ace.aaa.com/enterprise/identity/qa/#/anonymous',
      searchParams: [{ query: 'tagging', value: 'auto fnol' }],
      template: 'firstLastPolicyZip'
    });
  });

  it('should provide aceIdentity for QA2 environment', () => {
    const result = getAceIdentityConfig('appqa2.ace.aaa.com');
    expect(result).toEqual({
      env: 'non-prod',
      redirectUri: 'https://appqa2.ace.aaa.com/insurance/auto/file-a-claim',
      disableBypassPkce: true,
      bypassAuth2: true,
      loginFlow: 'anonymous',
      scopes: ['iss.anonymous.efnol'],
      associatedApp: 'efnol',
      backend: 'B1',
      loginUrl: 'https://appqa2.ace.aaa.com/enterprise/identity/qa/#/anonymous',
      searchParams: [{ query: 'tagging', value: 'auto fnol' }],
      template: 'firstLastPolicyZip'
    });
  });

  it('should provide aceIdentity for UAT1 environment', () => {
    const result = getAceIdentityConfig('appuat1.ace.aaa.com');
    expect(result).toEqual({
      env: 'non-prod',
      redirectUri: 'https://appuat1.ace.aaa.com/insurance/auto/file-a-claim',
      disableBypassPkce: true,
      bypassAuth2: true,
      loginFlow: 'anonymous',
      scopes: ['iss.anonymous.efnol'],
      associatedApp: 'efnol',
      backend: 'A1',
      loginUrl: 'https://appuat1.ace.aaa.com/enterprise/identity/uat/#/anonymous',
      searchParams: [{ query: 'tagging', value: 'auto fnol' }],
      template: 'firstLastPolicyZip'
    });
  });

  it('should provide aceIdentity for UAT2 environment', () => {
    const result = getAceIdentityConfig('appuat2.ace.aaa.com');
    expect(result).toEqual({
      env: 'non-prod',
      redirectUri: 'https://appuat2.ace.aaa.com/insurance/auto/file-a-claim',
      disableBypassPkce: true,
      bypassAuth2: true,
      loginFlow: 'anonymous',
      scopes: ['iss.anonymous.efnol'],
      associatedApp: 'efnol',
      backend: 'B1',
      loginUrl: 'https://appuat1.ace.aaa.com/enterprise/identity/uat/#/anonymous',
      searchParams: [{ query: 'tagging', value: 'auto fnol' }],
      template: 'firstLastPolicyZip'
    });
  });

  it('should provide aceIdentity for PROD environment', () => {
    const result = getAceIdentityConfig('app.ace.aaa.com');
    expect(result).toEqual({
      env: 'prod',
      redirectUri: 'https://app.ace.aaa.com/insurance/auto/file-a-claim',
      disableBypassPkce: true,
      bypassAuth2: true,
      loginFlow: 'anonymous',
      scopes: ['iss.anonymous.efnol'],
      associatedApp: 'efnol',
      loginUrl: 'https://app.ace.aaa.com/enterprise/identity/prod#/anonymous',
      searchParams: [{ query: 'tagging', value: 'auto fnol' }],
      template: 'firstLastPolicyZip'
    });
  });
});
