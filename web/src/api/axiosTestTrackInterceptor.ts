/**
 * What installAxiosTestTrackInterceptor is:
It is a small startup hook for the web app (called once from main.tsx before React renders)
 that registers an Axios request interceptor on the shared axiosInstance 
 from @ace-clublabs/iss-common-util.

What it does at runtime:
Runs only in the browser (window must exist); 
it does nothing during SSR or non-browser contexts.

On every outgoing HTTP request through that axios instance, the interceptor:

If the app is treated as prod (from getEnvironmentFromHost(window.location.hostname)), 
it does nothing—no header is added.
Otherwise (dev/qa/uat/etc.), it reads sessionStorage['testTrack'] (trimmed). 
If that value is set, it adds the header X-Ace-Test-Track to the request using Axios 1’s AxiosHeaders API.
HMR-safe install: it stores the interceptor id on the same axiosInstance 
and ejects the previous one before registering again, 
so Vite hot reload does not stack duplicate interceptors.
 */
import { axiosInstance } from '@ace-clublabs/iss-common-util';
import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { Environments, getEnvironmentFromHost } from './endpoints';

const TEST_TRACK_REQUEST_INTERCEPTOR_ID = Symbol.for(
  'com.ace.autoEfnolWithoutLogin.testTrackRequestInterceptorId',
);

type AxiosInstanceWithInterceptorSlot = typeof axiosInstance & {
  [TEST_TRACK_REQUEST_INTERCEPTOR_ID]?: number;
};

function setTestTrackHeader(config: InternalAxiosRequestConfig, testTrack: string): void {
  const merged = AxiosHeaders.from(config.headers);
  merged.set('X-Ace-Test-Track', testTrack);
  config.headers = merged;
}

export function installAxiosTestTrackInterceptor(): void {
  if (typeof window === 'undefined') return;
  if (!axiosInstance?.interceptors?.request) return;

  const client = axiosInstance as AxiosInstanceWithInterceptorSlot;
  const previousId = client[TEST_TRACK_REQUEST_INTERCEPTOR_ID];
  if (typeof previousId === 'number') {
    axiosInstance.interceptors.request.eject(previousId);
    delete client[TEST_TRACK_REQUEST_INTERCEPTOR_ID];
  }

  if (getEnvironmentFromHost(window.location.hostname) === Environments.prod) return;
  
  const id = axiosInstance.interceptors.request.use(config => {
    if (getEnvironmentFromHost(window.location.hostname) === Environments.prod) {
      return config;
    }
    const testTrack = sessionStorage.getItem('testTrack')?.trim();
    if (!testTrack) return config;

    setTestTrackHeader(config, testTrack);
    return config;
  });

  client[TEST_TRACK_REQUEST_INTERCEPTOR_ID] = id;
}
