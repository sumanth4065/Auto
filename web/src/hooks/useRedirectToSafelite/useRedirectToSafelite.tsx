import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { sources } from '../../api/sources';
import { State } from '../../store/reducer';
import { setErrorReason, setSerializedError } from '../../store/actions';
import { ISerializedError } from '../../types';
import { serializeError } from '../../utils';

export const useRedirectToSafelite = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();

  const [error, setError] = useState<ISerializedError | null>(null);
  const [loading, setLoading] = useState(true);
  const [safeliteRedirectUrl, setSafeliteRedirectUrl] = useState<string | undefined>(undefined);

  const executeRequest = async () => {
    setLoading(true);
    try {
      const response = await sources(
        appState.token!,
        appState.policyGuid!,
        appState.loginFlowType,
        undefined,
        appState.brand
      ).getSafeliteRedirectUrl();
      setSafeliteRedirectUrl(response?.safeliteRedirectUrl);
    } catch (error: any) {
      const serializedError = serializeError(error, useRedirectToSafelite.name);
      const errorMessage =
        serializedError?.errorMessage || 'Unknown error during redirecting to Safelite.';

      dispatch(setSerializedError(serializedError));
      dispatch(setErrorReason(errorMessage));
      setError(serializedError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeRequest();
  }, []);

  return {
    loading,
    error,
    safeliteRedirectUrl
  };
};
