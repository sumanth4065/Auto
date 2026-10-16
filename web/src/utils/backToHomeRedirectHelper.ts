import LogCannon from '@ace-clublabs/log-cannon';
import { axiosInstance } from '@ace-clublabs/iss-common-util';
import {
  endpoints,
  Environments,
  getEnvironmentFromHost,
  getEnvironmentFromHostForMyAccount
} from '../api/endpoints';
import { serializeError } from './LogCannonHelper';

export const callAutoPolicyFlowDirector = async (policyNumber: string, clubCode?: string) => {
  try {
    const params: Record<string, string> = { policyNumber, redirectMode: 'manual' };
    if (clubCode) {
      params.clubCode = clubCode;
    }
    const response = await axiosInstance.post(
      endpoints.insurancePolicyFlowDirector,
      new URLSearchParams(params)
    );
    window.location.href = response.data.redirectUrl;
  } catch (error) {
    const serializedError = serializeError(error, 'callAutoPolicyFlowDirector');
    LogCannon.error('Failed to redirect to auto policy flow director', {
      ...serializedError,
      policyNumber,
      clubCode,
      redirectMode: 'manual'
    });
    throw error;
  }
};

export const navigateToMyAccount = () => {
  const env = getEnvironmentFromHostForMyAccount(window.location.hostname);
  const url = `https://account.app${env ? '.' + env : ''}.ace.aaa.com`;
  return url;
};

export const navigateToClaimsViewRedesign = (claimsViewRedesignGuid: string) => {
  const env = getEnvironmentFromHost(window.location.hostname);
  const url = `https://app${env === Environments.prod ? '' : env}.ace.aaa.com/insurance/claimsview?id=${claimsViewRedesignGuid}`;
  return url;
}
export const navigateToClaimsView = (claimsViewGuid: string) => {
  const env = getEnvironmentFromHost(window.location.hostname);
  const url = `https://app${env === Environments.prod ? '' : env}.ace.aaa.com/insurance/claims/summary?id=${claimsViewGuid}`;
  return url;
};
