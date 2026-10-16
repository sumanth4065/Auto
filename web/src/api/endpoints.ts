import { axiosInstance } from '@ace-clublabs/iss-common-util';

export type Endpoints = {
  createAutoClaimUrl: string;
  getSafeliteRedirectUrl: string;
  submitAutoClaimUrl: string;
  getAutoPolicyInfo: string;
  getAutoClaimInfo: string;
  insurancePolicyFlowDirector: string;
  getInitialDataUrl: string;
  policyConversionUrl: string;
};

export enum Environments {
  local = 'localhost',
  dev = 'dev',
  dev1 = 'dev1',
  dev2 = 'dev2',
  qa = 'qa',
  qa1 = 'qa1',
  qa2 = 'qa2',
  uat = 'uat',
  uat1 = 'uat1',
  uat2 = 'uat2',
  stage = 'stg',
  prod = 'prod'
}

export const endpointPath: Endpoints = {
  createAutoClaimUrl: '/claim',
  getSafeliteRedirectUrl: '/safelite-redirect',
  submitAutoClaimUrl: '/claim',
  getAutoPolicyInfo: '/policy-info',
  getAutoClaimInfo: '/claim-info',
  getInitialDataUrl: '/initial-data',
  insurancePolicyFlowDirector: '/flow-director',
  policyConversionUrl: '/policy-conversion'
};

export const getEnvironmentFromHostForMyAccount = (hostname: string): string => {
  if (hostname.startsWith('appdev') || hostname.startsWith('app.dev')) {
    return Environments.dev;
  } else if (hostname.startsWith('appqa') || hostname.startsWith('app.qa')) {
    return Environments.qa;
  } else if (hostname.startsWith('appuat') || hostname.startsWith('app.uat')) {
    return Environments.uat;
  } else if (hostname.startsWith('app.')) {
    return '';
  } else {
    return Environments.dev;
  }
};

export const getEnvironmentFromHost = (hostname: string): Environments => {
  if (hostname.search('localhost') > -1) {
    return Environments.dev2;
  } else {
    if (hostname.startsWith('appdev1') || hostname.startsWith('app.dev')) {
      return Environments.dev1;
    } else if (hostname.startsWith('appdev2')) {
      return Environments.dev2;
    } else if (hostname.startsWith('appqa1') || hostname.startsWith('app.qa')) {
      return Environments.qa1;
    } else if (hostname.startsWith('appqa2')) {
      return Environments.qa2;
    } else if (hostname.startsWith('appuat1') || hostname.startsWith('app.uat')) {
      return Environments.uat1;
    } else if (hostname.startsWith('appuat2')) {
      return Environments.uat2;
    } else if (hostname.startsWith('appstage') || hostname.startsWith('app.stage')) {
      return Environments.stage;
    } else if (hostname.startsWith('app.')) {
      return Environments.prod;
    } else {
      return Environments.uat1;
    }
  }
};

export const getApiDomain = (env: Environments): string => {
  if (env === Environments.prod) {
    return `common.api.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol`;
  } else {
    let envStr = '';
    if (env === Environments.dev1 || env === Environments.dev2) envStr = 'dev';
    else if (env === Environments.qa1 || env === Environments.qa2) envStr = 'qa';
    else envStr = 'uat';
    return `common.api.${envStr}.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol`;
  }
};

export const getPolicyViewApiDomain = (env: Environments): string => {
  if (env === Environments.prod) {
    return `common.api.ace.aaa.com/insurance-self-service-policy-view/policyview`;
  } else if (env === Environments.local) {
    return `common.api.dev.ace.aaa.com/insurance-self-service-policy-view/policyview`;
  } else {
    let envStr = '';
    if (env === Environments.dev1 || env === Environments.dev2) envStr = 'dev';
    else if (env === Environments.qa1 || env === Environments.qa2) envStr = 'qa';
    else envStr = 'uat';
    return `common.api.${envStr}.ace.aaa.com/insurance-self-service-policy-view/policyview`;
  }
};

export const getApiDomainBehindLogin = (env: Environments): string => {
  if (env === Environments.prod) {
    return `api.ace.aaa.com/insurance-auto-efnol`;
  } else {
    return `api${env}.ace.aaa.com/insurance-auto-efnol`;
  }
};

export const getEndpoints = (hostname: string): Endpoints => {
  const env = getEnvironmentFromHost(hostname);

  if (env !== Environments.prod) {
    let testRegion = 'A1';
    if (env === Environments.dev2 || env === Environments.qa2 || env === Environments.uat2) {
      testRegion = 'B1';
    }
    if (axiosInstance && axiosInstance.defaults && axiosInstance.defaults.headers)
      axiosInstance.defaults.headers['X-Ace-Test-Region'] = testRegion;
  }
  const endpoints: Endpoints = {
    createAutoClaimUrl: `https://${getApiDomain(env)}${endpointPath.createAutoClaimUrl}`,
    getSafeliteRedirectUrl: `https://${getApiDomain(env)}${endpointPath.getSafeliteRedirectUrl}`,
    submitAutoClaimUrl: `https://${getApiDomain(env)}${endpointPath.submitAutoClaimUrl}`,
    getAutoPolicyInfo: `https://${getApiDomain(env)}${endpointPath.getAutoPolicyInfo}`,
    getAutoClaimInfo: `https://${getApiDomain(env)}${endpointPath.getAutoClaimInfo}`,
    getInitialDataUrl: `https://${getApiDomain(env)}${endpointPath.getInitialDataUrl}`,
    insurancePolicyFlowDirector: `https://${getPolicyViewApiDomain(env)}${
      endpointPath.insurancePolicyFlowDirector
    }`,
    policyConversionUrl: `https://${getApiDomain(env)}${endpointPath.policyConversionUrl}`
  };
  return endpoints;
};

export const endpoints = getEndpoints(window.location.hostname);
