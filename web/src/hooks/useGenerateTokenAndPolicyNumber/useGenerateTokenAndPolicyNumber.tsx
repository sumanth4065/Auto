import { getEnvironmentFromHost as getEnv } from '@ace-clublabs/log-cannon';
import { useAuthenticatedTokenAndPolicyNumber } from '../useAuthenticatedTokenAndPolicyNumber';
import { State } from '../../store/reducer';

export const ALLOWS_AUTHORIZATION_HACK_IN = ['local', 'localhost'];

export const allowsAuthorizationHack = () => {
  const env = getEnv();
  return ALLOWS_AUTHORIZATION_HACK_IN.includes(env);
};

/**
 * @deprecated Use useAuthenticatedTokenAndPolicyNumber instead
 * This hook is kept for backwards compatibility with existing tests
 */
export const useGenerateTokenAndPolicyNumber = (appState: State, dispatch: Function) => {
  return useAuthenticatedTokenAndPolicyNumber({ appState, dispatch, isAnonymous: true });
};
