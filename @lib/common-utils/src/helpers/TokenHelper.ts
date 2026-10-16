import { jwtDecode } from 'jwt-decode';
import { IEvent, IProxyIntegrationRequest } from '@ace-clublabs/aws-lambda-v3';
import { getHeaderCaseInsensitive } from './getHeaderCaseInsensitive';

export const getAuthorizationToken = (event: IEvent | IProxyIntegrationRequest) => {
  const raw = getHeaderCaseInsensitive(
    event?.headers as Record<string, string | undefined> | undefined,
    'authorization'
  );
  return raw?.replace(/^Bearer\s+/i, '') ?? '';
};

export const extractPolicyNumberFromToken = (token: string) => {
  return jwtDecode<{ policyNumber: string }>(token).policyNumber;
};
