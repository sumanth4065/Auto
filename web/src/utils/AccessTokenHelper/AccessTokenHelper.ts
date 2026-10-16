import LogCannon from '@ace-clublabs/log-cannon';
import type { Brand } from '../../types';
import {
  provideAceIdentity,
  provideBehindLoginAceIdentity,
  provideWInsuranceAceIdentity
} from '../AceIdentityProvider';
import { serializeError } from '../LogCannonHelper';

export const generateToken = async (
  isAnonymous: boolean = true,
  brand: Brand = 'AAA'
) => {
  LogCannon.blast('generateToken called', { host: window.location.host, isAnonymous, brand, href: window.location.origin + '/' + (window.location.pathname.split('/')[1] ?? '') });
  const aceIdentity = isAnonymous
    ? brand === 'WInsurance'
      ? provideWInsuranceAceIdentity(window.location.host)
      : provideAceIdentity(window.location.host)
    : provideBehindLoginAceIdentity(window.location.host);
  await aceIdentity.ready();
  const tokens = await aceIdentity.tokens();
  const token = tokens?.accessToken;
  LogCannon.blast('generateToken result', { hasAuth: Boolean(token) });
  return token;
};

export const getToken = async (
  isAnonymous: boolean = true,
  brand: Brand = 'AAA'
) => {
  try {
    const token = await generateToken(isAnonymous, brand);
    return token;
  } catch (error) {
    const serializedError = serializeError(error, 'getToken');
    LogCannon.error(`Failed to acquire ${isAnonymous ? 'anonymous' : 'behind-login'} token`, {
      ...serializedError,
      isAnonymous,
      brand,
      flowType: isAnonymous ? 'ANONYMOUS' : 'BEHIND_LOGIN'
    });
    return undefined;
  }
};
