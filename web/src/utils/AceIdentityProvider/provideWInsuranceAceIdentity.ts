import AceIdentity, { AceIdentityEnv } from '@ace-clublabs/ace-identity';
import LogCannon from '@ace-clublabs/log-cannon';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// The `#/anonymous` hash is required — ace-identity only performs the redirect
// when `loginUrl.split('#')` has more than one segment. Do NOT bake a query
// string into this path; ace-identity appends `?<params>` itself.
const W_LANDING_PAGE_PATH = '/insurance/anon/landing/auto-efnol-w-insurance#/anonymous';
const REDIRECT_PATH = '/insurance/auto/file-a-claim';

// TODO: confirm final values with AceIdentity admin
const W_ASSOCIATED_APP = 'efnol';
const W_SCOPES = ['iss.anonymous.efnol'];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Backend = 'A1' | 'B1';

interface HostConfig {
  env: AceIdentityEnv;
  loginUrl: string;
  backend?: Backend;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const resolveBackend = (host: string): Backend => (host.includes('1.ace.aaa.com') ? 'A1' : 'B1');

const resolveHostConfig = (host: string): HostConfig => {
  if (host.includes('appdev')) {
    return {
      env: AceIdentityEnv.NonProd,
      loginUrl: `https://${host}${W_LANDING_PAGE_PATH}`,
      backend: resolveBackend(host)
    };
  }
  if (host.includes('appqa')) {
    return {
      env: AceIdentityEnv.NonProd,
      loginUrl: `https://${host}${W_LANDING_PAGE_PATH}`,
      backend: resolveBackend(host)
    };
  }
  if (host.includes('appuat')) {
    return {
      env: AceIdentityEnv.NonProd,
      loginUrl: `https://appuat1.ace.aaa.com${W_LANDING_PAGE_PATH}`,
      backend: resolveBackend(host)
    };
  }
  if (host.includes('app.')) {
    return {
      env: AceIdentityEnv.Prod,
      loginUrl: `https://app.ace.aaa.com${W_LANDING_PAGE_PATH}`
    };
  }
  return {
    env: AceIdentityEnv.NonProd,
    loginUrl: `https://app.ace.aaa.com${W_LANDING_PAGE_PATH}`,
    backend: 'A1'
  };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const buildAceIdentityWInsuranceParams = (host: string) => {
  const { env, loginUrl, backend } = resolveHostConfig(host);

  return {
    env,
    redirectUri: `https://${host}${REDIRECT_PATH}`,
    loginFlow: 'anonymous',
    associatedApp: W_ASSOCIATED_APP,
    scopes: W_SCOPES,
    template: 'lastNamePolicyNumber',
    searchParams: [{ query: 'isW', value: 'true' }],
    backend,
    disableBypassPkce: true,
    loginUrl,
    bypassAuth2: false
  };
};

export const provideWInsuranceAceIdentity = (host: string) => {
  const identityConfig = buildAceIdentityWInsuranceParams(host);
  LogCannon.blast('AceIdentity config', { identityConfig });
  return new AceIdentity(identityConfig);
};
