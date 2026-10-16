/**
 * Loads the ACE JS Bridge script based on current hostname.
 * Executed from index.html in the document head.
 */
import {
  getEnvFromHostname,
  getMobileBridgeScriptUrl,
} from './utils/mobileBridgeHelper';

const env = getEnvFromHostname(window.location.hostname);
if (env) {
  const script = document.createElement('script');
  script.src = getMobileBridgeScriptUrl(env);
  document.head.appendChild(script);
}
