/**
 * Environment detection and mobile bridge script URL for the ACE JS Bridge.
 * Used by index.html to conditionally load the bridge based on hostname.
 */

export type MobileBridgeEnv = 'prod' | 'uat' | 'qa' | 'dev';

/**
 * Derives environment from hostname for mobile bridge script loading.
 * Matches the logic in index.html used to select ace-js-bridge.js URL.
 * More specific patterns (app.uat, app.qa, app.dev) must be checked before app.
 */
export function getEnvFromHostname(hostname: string): MobileBridgeEnv | undefined {
  if (hostname.startsWith('appuat') || hostname.startsWith('app.uat')) {
    return 'uat';
  }
  if (hostname.startsWith('appqa') || hostname.startsWith('app.qa')) {
    return 'qa';
  }
  if (
    hostname.startsWith('appdev') ||
    hostname.startsWith('app.dev') ||
    hostname.startsWith('localhost')
  ) {
    return 'dev';
  }
  if (hostname.startsWith('app.')) {
    return 'prod';
  }
  return undefined;
}

/**
 * Returns the ace-js-bridge.js script URL for the given environment.
 */
export function getMobileBridgeScriptUrl(env: MobileBridgeEnv): string {
  if (env === 'prod') {
    return 'https://app.ace.aaa.com/enterprise/identity/ace-js-bridge.js';
  }
  return `https://app${env}1.ace.aaa.com/enterprise/identity/${env}/ace-js-bridge.js`;
}
