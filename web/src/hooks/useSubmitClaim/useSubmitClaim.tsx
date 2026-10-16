import { IAdjuster } from '@lib/types';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { createRequestBody } from './createSubmitClaimRequest';
import { State } from '../../store/reducer';
import { sources } from '../../api/sources';
import {
  setClaimSubmittedForClaimNumber,
  setErrorReason,
  setSerializedError,
  setSubmitClaimInformation
} from '../../store/actions';
import { ISerializedError } from '../../types';
import { serializeError } from '../../utils/LogCannonHelper';

export const useSubmitClaim = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ISerializedError | null>(null);
  const alreadySubmittedForThisClaim =
    appState.claimNumber != null && appState.claimSubmittedForClaimNumber === appState.claimNumber;

  const executeRequest = async () => {
    setLoading(true);
    try {
      const requestBody = createRequestBody(appState);
      const response = await sources(
        appState.token!,
        appState.policyGuid!,
        appState.loginFlowType
      ).submitAutoClaim(requestBody);
      dispatch(setSubmitClaimInformation(response?.adjuster as IAdjuster));
      if (appState.claimNumber) {
        dispatch(setClaimSubmittedForClaimNumber(appState.claimNumber));
      }
    } catch (error: any) {
      const serializedError = serializeError(error, useSubmitClaim.name);
      const errorMessage = serializedError?.errorMessage || 'Unknown error during claim submission';

      dispatch(setSerializedError(serializedError));
      dispatch(setErrorReason(errorMessage));
      setError(serializedError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alreadySubmittedForThisClaim) {
      setLoading(false);
      return;
    }
    executeRequest();
  }, []);

  return {
    loading,
    error
  };
};
