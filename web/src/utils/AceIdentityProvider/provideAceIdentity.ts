import AceIdentity, { AceIdentityEnv } from '@ace-clublabs/ace-identity';
import type { AceIdentityConfig } from '@ace-clublabs/ace-identity';
import LogCannon from '@ace-clublabs/log-cannon';

export const getAceIdentityConfig = (host: string): AceIdentityConfig => {
  let aceIdentityEnv: AceIdentityEnv;
  let aceLoginUrl: string;
  let backend: AceIdentityConfig['backend'];

  switch (true) {
    case host.includes('appdev'):
      aceIdentityEnv = AceIdentityEnv.NonProd;
      backend = host.includes('appdev1') ? 'A1' : 'B1';
      if (backend == 'A1') {
        aceLoginUrl = 'https://appdev1.ace.aaa.com/enterprise/identity/dev/#/anonymous';
      } else {
        aceLoginUrl = 'https://appdev2.ace.aaa.com/enterprise/identity/dev/#/anonymous';
      }
      break;
    case host.includes('appqa'):
      aceIdentityEnv = AceIdentityEnv.NonProd;
      backend = host.includes('appqa1') ? 'A1' : 'B1';
      if (backend == 'A1') {
        aceLoginUrl = 'https://appqa1.ace.aaa.com/enterprise/identity/qa/#/anonymous';
      } else {
        aceLoginUrl = 'https://appqa2.ace.aaa.com/enterprise/identity/qa/#/anonymous';
      }
      break;
    case host.includes('appuat'):
      aceIdentityEnv = AceIdentityEnv.NonProd;
      backend = host.includes('appuat1') ? 'A1' : 'B1';
      if (backend == 'A1') {
        aceLoginUrl = 'https://appuat1.ace.aaa.com/enterprise/identity/uat/#/anonymous';
      } else {
        aceLoginUrl = 'https://appuat1.ace.aaa.com/enterprise/identity/uat/#/anonymous';
      }
      break;
    case host.includes('app.'):
      aceIdentityEnv = AceIdentityEnv.Prod;
      aceLoginUrl = 'https://app.ace.aaa.com/enterprise/identity/prod#/anonymous';
      break;
    default:
      aceIdentityEnv = AceIdentityEnv.NonProd;
      backend = 'A1';
      aceLoginUrl = 'https://app.ace.aaa.com/enterprise/identity/prod#/anonymous';
  }

  return {
    env: aceIdentityEnv,
    redirectUri: `https://${host}/insurance/auto/file-a-claim`,
    loginFlow: 'anonymous',
    associatedApp: 'efnol',
    scopes: ['iss.anonymous.efnol'],
    template: 'firstLastPolicyZip',
    searchParams: [{ query: 'tagging', value: 'auto fnol' }],
    backend,
    bypassAuth2: true,
    disableBypassPkce: true,
    loginUrl: aceLoginUrl
  };
};

export const provideAceIdentity = (host: string) => {
  const identityConfig = getAceIdentityConfig(host);
  LogCannon.blast('AceIdentity config', { identityConfig });
  return new AceIdentity(identityConfig);
};
