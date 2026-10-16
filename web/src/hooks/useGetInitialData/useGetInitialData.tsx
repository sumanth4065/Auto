import { useEffect, useState } from 'react';
import { sources } from '../../api/sources';
import {
  clearConversionResult,
  setClaimsViewGuid,
  setContactInfoPrefill,
  setConversionResult,
  setErrorReason,
  setInitialPolicyDataBehindLogin,
  setPolicyNumber,
  setSerializedError,
  setSourceApp
} from '../../store/actions';
import { State } from '../../store/reducer';
import { filterPhoneNumber } from '@ace-clublabs/iss-common-util';
import { ISerializedError } from '../../types';
import { serializeError } from '../../utils/LogCannonHelper';

export interface IUseGetInitialDataResponse {
  loading: boolean;
  error: ISerializedError | null;
}

export const useGetInitialData = (
  appState: State,
  dispatch: React.Dispatch<any>
): IUseGetInitialDataResponse => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ISerializedError | null>(null);

  const executeRequest = async () => {
    // Only execute if token and policyGuid are available
    if (!appState.token || !appState.policyGuid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await sources(
        appState.token,
        appState.policyGuid!,
        appState.loginFlowType
      ).getInitialData(appState.policyGuid!)();
      const claimsViewGuid = sessionStorage.getItem('ClaimsViewGUID');
      const claimsViewRedesignGuid = sessionStorage.getItem('ClaimsViewRedesignGUID');

      dispatch(setInitialPolicyDataBehindLogin(response.policyData));
      dispatch(
        setContactInfoPrefill({
          email: response.policyData.email ?? '',
          mobileNumber: filterPhoneNumber(response.policyData.mobileNumber)
        })
      );

      if (response.policyData.conversionResult) {
        dispatch(setConversionResult(response.policyData.conversionResult));
      } else {
        dispatch(clearConversionResult());
      }

      if (response.policyData.policy) {
        sessionStorage.setItem('policyNumber', response.policyData.policy);
        dispatch(setPolicyNumber(response.policyData.policy));
      } else {
        throw new Error('Behind Login Policy number not found');
      }

      if (response.sourceApp) {
        sessionStorage.setItem('sourceApp', response.sourceApp);
        dispatch(setSourceApp(response.sourceApp));
      }

      if (claimsViewGuid) {
        dispatch(setClaimsViewGuid(claimsViewGuid));
      } else if (claimsViewRedesignGuid) {
        dispatch(setClaimsViewGuid(claimsViewRedesignGuid));
      }
    } catch (err: any) {
      const serializedError = serializeError(err, useGetInitialData.name);
      const errorMessage =
        serializedError?.errorMessage || 'Unknown error during initial data retrieval';

      dispatch(setSerializedError(serializedError));
      dispatch(setErrorReason(errorMessage));
      setError(serializedError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeRequest();
  }, [appState.loginFlowType, appState.token, appState.policyGuid]);

  return {
    loading,
    error
  };
};
