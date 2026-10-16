import AceIdentity, { AceIdentityEnv } from '@ace-clublabs/ace-identity';
import type { AceIdentityConfig } from '@ace-clublabs/ace-identity';
import LogCannon from '@ace-clublabs/log-cannon';

const DEFAULT_SCOPES = ['profile', 'clubCode', 'scope', 'openid', 'customerId', 'membershipStatus'];

const LOGIN_URLS = {
  dev: 'https://appdev1.ace.aaa.com/enterprise/identity/dev/#/login',
  qa: 'https://appqa1.ace.aaa.com/enterprise/identity/qa/#/login',
  uat: 'https://appuat1.ace.aaa.com/enterprise/identity/uat/#/login',
  prod: 'https://app.ace.aaa.com/enterprise/identity/#/login'
} as const;

const ENV_CONFIG = [
  { pattern: 'appdev', b1Pattern: 'appdev2', env: AceIdentityEnv.NonProd, baseUrl: LOGIN_URLS.dev },
  { pattern: 'appqa', b1Pattern: 'appqa2', env: AceIdentityEnv.NonProd, baseUrl: LOGIN_URLS.qa },
  { pattern: 'appuat', b1Pattern: 'appuat2', env: AceIdentityEnv.NonProd, baseUrl: LOGIN_URLS.uat },
  { pattern: 'app.', b1Pattern: null, env: AceIdentityEnv.Prod, baseUrl: LOGIN_URLS.prod }
] as const;

const DEFAULT_ENV_PROPS = {
  aceIdentityEnv: AceIdentityEnv.NonProd,
  loginUrl: LOGIN_URLS.dev,
  backend: 'A1' as const
};

export const getBehindLoginAceIdentityConfig = (host: string): AceIdentityConfig => {
  const { aceIdentityEnv, loginUrl, backend } = getEnvProps(host);
  return {
    env: aceIdentityEnv,
    redirectUri: `https://${host}/insurance/auto/file-a-claim/behindlogin`,
    loginUrl,
    bypassAuth2: true,
    disableBypassPkce: true,
    scopes: DEFAULT_SCOPES,
    backend
  };
};

export const provideBehindLoginAceIdentity = (host: string) => {
  const identityConfig = getBehindLoginAceIdentityConfig(host);
  LogCannon.blast('AceIdentity config', { identityConfig });
  return new AceIdentity(identityConfig);
};

export function getEnvProps(host: string) {
  if (!host) {
    return DEFAULT_ENV_PROPS;
  }

  for (const { pattern, b1Pattern, env, baseUrl } of ENV_CONFIG) {
    if (host.includes(pattern)) {
      const isB1 = b1Pattern ? host.includes(b1Pattern) : false;
      return {
        aceIdentityEnv: env,
        loginUrl: isB1 ? `${baseUrl}/backend/b1` : baseUrl,
        backend: isB1 ? 'B1' : 'A1'
      };
    }
  }

  return DEFAULT_ENV_PROPS;
}
