import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { ConversionType } from '@ace-clublabs/iss-common-shared-claims-models';
import { sources } from '../../api/sources';
import { State } from '../../store/reducer';
import {
  clearConversionResult,
  setConversionResult,
  setSerializedError
} from '../../store/actions';
import { ISerializedError } from '../../types';
import { serializeError } from '../../utils/LogCannonHelper';
import { navigateToErrorPage } from '../../utils/ComponentHelper';

/**
 * Calls POST /auto/policy-conversion to get the PStar→GW conversion result for the current policy.
 * Pass `enabled = false` to skip the request (e.g. for BEHIND_LOGIN flows).
 * On error the hook navigates the user to the system error page — a hard API failure here is
 * unexpected since upstream gates return graceful no-conversion objects for ineligible cases.
 */
export const useGetPolicyConversion = (enabled = true, conversionType: ConversionType) => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<ISerializedError | null>(null);

  const executeRequest = async () => {
    setLoading(true);
    try {
      const response = await sources(
        appState.token!,
        appState.policyGuid!,
        appState.loginFlowType
      ).getPolicyConversion({
        policyNumber: appState.policyNumber!,
        conversionType: conversionType
      });

      if (response) {
        dispatch(setConversionResult(response));
      } else {
        dispatch(clearConversionResult());
      }
    } catch (err: unknown) {
      const serializedError = serializeError(err, useGetPolicyConversion.name);
      dispatch(setSerializedError(serializedError));
      setError(serializedError);
      navigateToErrorPage(serializedError, navigate);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      executeRequest();
    }
  }, []);

  return { loading, error };
};
