import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { State } from '../../store/reducer';
import { sources } from '../../api/sources';
import {
  setErrorReason,
  setGetClaimInformation,
  setSerializedError
} from '../../store/actions';
import { ISerializedError } from '../../types';
import { serializeError } from '../../utils/LogCannonHelper';
import { resolveClaimPolicyNumber } from '../../utils/policyNumberHelper';

export const useGetAutoClaimInfo = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ISerializedError | null>(null);

  const executeRequest = async () => {
    setLoading(true);
    try {
      const resolvedPolicyNumber = resolveClaimPolicyNumber(
        appState.conversionResult,
        appState.lossDateISO,
        appState.policyNumber
      );

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await sources(
        appState.token!,
        appState.policyGuid!,
        appState.loginFlowType
      ).getAutoClaimInfo({
        lossDate: appState.lossDateISO!,
        policyNumber: resolvedPolicyNumber,
        timezone
      });

      if (response.duplicateClaimExists && response.claimFound) {
        dispatch(
          setGetClaimInformation({
            claimNumber: response.claimFound.claimNumber,
            duplicatedClaim: true,
            adjuster: response.claimFound.adjuster
              ? {
                  displayName: response.claimFound.adjuster.displayName,
                  email: response.claimFound.adjuster.email,
                  phoneNumber: response.claimFound.adjuster.phoneNumber,
                  firstName: response.claimFound.adjuster.firstName,
                  lastName: response.claimFound.adjuster.lastName,
                  extension: response.claimFound.adjuster.extension
                }
              : undefined
          })
        );
      } else {
        dispatch(
          setGetClaimInformation({
            claimNumber: '',
            duplicatedClaim: false,
            adjuster: undefined
          })
        );
      }
    } catch (error: any) {
      const serializedError = serializeError(error, useGetAutoClaimInfo.name);
      const errorMessage =
        serializedError?.errorMessage || 'Unknown error during get claim information';

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
    error
  };
};
