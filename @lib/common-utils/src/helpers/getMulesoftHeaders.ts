import { IApiAuthentication } from '@lib/types';

interface IMulesoftAuthHeaders extends IApiAuthentication {
  GWUserContext: string;
}

export const getMulesoftHeaders = (
  headers: IApiAuthentication,
  policyNumber: string
): IMulesoftAuthHeaders => {
  if (!policyNumber || policyNumber === '') {
    throw new Error('property policyNumber is missing');
  }
  const GWUserContext = Buffer.from(
    JSON.stringify({
      'cc.service.edge.user.authorities': `guidewire.edge.policy.${policyNumber}.ALL`
    })
  ).toString('base64');
  return {
    ...headers,
    GWUserContext
  };
};
