import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { IAutoPolicySummary } from '@lib/types';
import { sources } from '../../api/sources';
import { State } from '../../store/reducer';
import { setErrorReason, setSerializedError } from '../../store/actions';
import { ISerializedError } from '../../types';
import { serializeError } from '../../utils/LogCannonHelper';

export const useGetAutoPolicyInfo = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ISerializedError | null>(null);
  const [autoPolicyInfo, setAutoPolicyInfo] = useState<IAutoPolicySummary | undefined>(undefined);

  const executeRequest = async () => {
    setLoading(true);
    try {
      // Call the API using token + policy guid
      const response = await sources(
        appState.token!,
        appState.policyGuid!,
        appState.loginFlowType
      ).getAutoPolicyInfo();

      /**
       * For v1 → Response always contains data.
       * For v2 (flag ON) → Lambda returns empty policyGeneralInfo + driverSummaries.
       * Both scenarios are safely stored in the hook's state.
       */
      setAutoPolicyInfo(response?.data);
    } catch (error: any) {
      const serializedError = serializeError(error, useGetAutoPolicyInfo.name);
      const errorMessage =
        serializedError?.errorMessage || 'Unknown error during get auto policy information';

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
    autoPolicyInfo
  };
};
