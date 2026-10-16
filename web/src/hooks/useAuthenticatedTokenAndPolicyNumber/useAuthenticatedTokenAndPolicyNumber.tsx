import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { axiosInstance, CookieHelper, MaskData } from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { LoginFlowType } from '@lib/shared-contracts';
import { ClubCodeValues, inferClubCode } from '@lib/utility';
import {
  setClubCode as setClubCodeInAppState,
  setCrashDatePrediction,
  setIsMobileAppAccidentDetection,
  setKnockoutReason,
  setPolicyNumber as setPolicyNumberInAppState,
  setToken as setTokenInAppState,
  setIsAnonymous,
  setLoginFlowType,
  setPolicyGuid,
  setErrorReason,
  setSerializedError
} from '../../store/actions';
import type { Brand } from '../../types';
import { jwt, getLogData, getParams, getToken, serializeError } from '../../utils';
import { allowsAuthorizationHack } from '../useGenerateTokenAndPolicyNumber';
import { State } from '../../store/reducer';

/** Persist the token on the shared Axios singleton so every request automatically
 *  includes `Authorization: Bearer <token>` in its headers (ISS-11012). */
const setAxiosToken = (token: string) => {
  axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
};

/** Clear any stale Authorization header before re-acquiring a token so that
 *  failed or empty auth attempts don't leave the previous user's credentials
 *  attached to subsequent requests (ISS-11012). */
const clearAxiosToken = () => {
  delete axiosInstance.defaults.headers['Authorization'];
};

/** Module-scope guards: prevent concurrent auth calls and expose the in-flight
 * promise so remounted instances can observe the outcome instead of getting stuck. */
let isAuthInProgress = false;
let authPromise: Promise<void> | null = null;

interface UseAuthenticatedTokenAndPolicyNumberProps {
  appState: State;
  dispatch: Function;
  isAnonymous: boolean;
}

export const useAuthenticatedTokenAndPolicyNumber = ({
  appState,
  dispatch,
  isAnonymous
}: UseAuthenticatedTokenAndPolicyNumberProps) => {
  const routeParams = useParams();
  const [token, setToken] = useState<string | undefined>(undefined);
  const [policyNumber, setPolicyNumber] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [clubCode, setClubCode] = useState<string | undefined>(undefined);
  const [clubCodeError, setClubCodeError] = useState<string | undefined>(undefined);
  const [isTokenInfoError, setTokenInfoError] = useState<boolean>(false);
  const logData = MaskData.maskJSONFields(getLogData(appState, location.pathname));

  const isClubCodeEnabled = (clubCode: ClubCodeValues) => {
    const params = getParams(['disabledClubCodes']);
    if (!params.disabledClubCodes) return true;
    const disabledClubCodes = params.disabledClubCodes.split(',') || [];
    return !disabledClubCodes.includes(clubCode);
  };

  const getClubCodeFromAemCookie = (): string | undefined => {
    const cookieValue = CookieHelper.getCookieValue(
      typeof document !== 'undefined' ? document.cookie : '',
      'zipcode'
    );
    if (!cookieValue) return undefined;
    // Cookie format: "90060|AAA|004|PC" — index 2 is the club code
    const parts = cookieValue.split('|');
    return parts[2] || undefined;
  };

  const setClubCodeFromPolicyNumber = (policyNumber: string) => {
    try {
      const clubCodeFromToken = inferClubCode(policyNumber) ?? getClubCodeFromAemCookie();
      if (clubCodeFromToken) {
        sessionStorage.setItem('clubCode', clubCodeFromToken);
      } else {
        sessionStorage.removeItem('clubCode');
      }
      setClubCode(clubCodeFromToken);
      dispatch(setClubCodeInAppState(clubCodeFromToken as ClubCodeValues));

      if (
        clubCodeFromToken !== undefined &&
        !isClubCodeEnabled(clubCodeFromToken as ClubCodeValues)
      ) {
        throw new Error('Market not supported');
      }
    } catch (e) {
      const err = e as any as Error;
      const serializedError = serializeError(err, useAuthenticatedTokenAndPolicyNumber.name);
      dispatch(setSerializedError(serializedError));
      dispatch(setKnockoutReason(serializedError.errorMessage));
      setClubCodeError(serializedError.errorMessage);
    }
  };

  // Extract policyGuid from route parameter
  const policyGuid = useMemo(() => {
    return routeParams.policyGuid || null;
  }, [routeParams.policyGuid]);

  // Set policyGuid in app state if available and not already set
  useEffect(() => {
    if (policyGuid && !appState.policyGuid) {
      dispatch(setPolicyGuid(policyGuid));
    }
  }, [policyGuid, appState.policyGuid, dispatch]);

  // Reads brand synchronously from URL or sessionStorage — avoids the race
  // condition where appState.brand hasn't been dispatched yet when this effect fires.
  const getBrandForAuth = (): Brand => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('isW') === 'true') return 'WInsurance';
    return sessionStorage.getItem('brand') === 'WInsurance' ? 'WInsurance' : 'AAA';
  };

  const getTokenAndPolicyNumberWrapper = async () => {
    // Clear stale Authorization header before token acquisition 
    clearAxiosToken();
    try {
      LogCannon.blast('Step: getToken', { ...logData });
      // Use anonymous or behind login token retrieval based on the flow
      const token = await getToken(isAnonymous, getBrandForAuth());

      if (!token) {
        LogCannon.blast('AceIdentity returned NO token', { ...logData });
        setLoading(false);
        return;
      }

      // persist token in memory via Axios singleton (ISS-11012)
      setAxiosToken(token);

      // persist token in appState
      setToken(token);
      dispatch(setTokenInAppState(token));
      dispatch(setIsAnonymous(isAnonymous));
      dispatch(
        setLoginFlowType(isAnonymous ? LoginFlowType.ANONYMOUS : LoginFlowType.BEHIND_LOGIN)
      );
      sessionStorage.setItem(
        'loginFlowType',
        isAnonymous ? LoginFlowType.ANONYMOUS : LoginFlowType.BEHIND_LOGIN
      );

      // persist policyNumber in appState
      const { policyNumber: policyNumberFromToken, clubCode: clubCodeFromToken } = jwt.jwtDecode<{
        policyNumber: string;
        clubCode: string;
      }>(token);

      if (!appState.policyNumber && policyNumberFromToken) {
        sessionStorage.setItem('policyNumber', policyNumberFromToken);
        setPolicyNumber(policyNumberFromToken);
        dispatch(setPolicyNumberInAppState(policyNumberFromToken));
      }

      if (!appState.clubCode && policyNumberFromToken) {
        setClubCodeFromPolicyNumber(policyNumberFromToken);
      } else if (!appState.clubCode && clubCodeFromToken) {
        sessionStorage.setItem('clubCode', clubCodeFromToken);
        setClubCode(clubCodeFromToken);
        dispatch(setClubCodeInAppState(clubCodeFromToken as ClubCodeValues));
      }

      const isMobileAppAccidentDetection = localStorage.getItem('isMobileAppAccidentDetection');
      const crashDatePrediction = localStorage.getItem('crashDatePrediction');

      if (isMobileAppAccidentDetection && crashDatePrediction) {
        dispatch(setIsMobileAppAccidentDetection(isMobileAppAccidentDetection));
        dispatch(setCrashDatePrediction(crashDatePrediction));
      }

      LogCannon.blast(`Step: getTokenAndPolicyNumberWrapper success`, { ...logData });
    } catch (error) {
      const serializedError = serializeError(error, useAuthenticatedTokenAndPolicyNumber.name);
      dispatch(setSerializedError(serializedError));
      LogCannon.error(
        `System Failed to Authorize User: ${
          error instanceof Error ? error.stack : JSON.stringify(error)
        }`,
        { ...logData, error: serializedError.errorMessage, errorData: serializedError }
      );
      dispatch(setErrorReason('PKCE Behind Login Token or Initial Data error'));
      setTokenInfoError(true);
    } finally {
      LogCannon.blast(`Step: setLoading to false`, { ...logData });
      setLoading(false);
    }
  };

  useEffect(() => {
    LogCannon.blast('useAuthenticatedTokenAndPolicyNumber effect', {
      hasAuth: Boolean(appState.token),
      hasClaimant: Boolean(appState.policyNumber),
      hasMarket: Boolean(appState.clubCode),
      authInProgress: isAuthInProgress
    });

    const params = getParams(['isMobileAppAccidentDetection', 'crashDatePrediction']);
    if (
      params.isMobileAppAccidentDetection !==
        'Typo Error! please check your url and/or parameter isMobileAppAccidentDetection' &&
      params.crashDatePrediction !==
        'Typo Error! please check your url and/or parameter crashDatePrediction'
    ) {
      const isMobileAppAccidentDetection = params.isMobileAppAccidentDetection;
      const crashDatePrediction = params.crashDatePrediction;

      localStorage.setItem('isMobileAppAccidentDetection', isMobileAppAccidentDetection);
      localStorage.setItem('crashDatePrediction', crashDatePrediction);
    }

    if (allowsAuthorizationHack()) {
      const params = getParams(['policyNumber', 'token']);
      if (
        params.policyNumber !== 'Typo Error! please check your url and/or parameter policyNumber' &&
        params.token !== 'Typo Error! please check your url and/or parameter token'
      ) {
        setAxiosToken(params.token);
        setToken(params.token);
        dispatch(setTokenInAppState(params.token));
        dispatch(setIsAnonymous(isAnonymous));
        dispatch(
          setLoginFlowType(isAnonymous ? LoginFlowType.ANONYMOUS : LoginFlowType.BEHIND_LOGIN)
        );
        sessionStorage.setItem(
          'loginFlowType',
          isAnonymous ? LoginFlowType.ANONYMOUS : LoginFlowType.BEHIND_LOGIN
        );

        sessionStorage.setItem('policyNumber', params.policyNumber);
        setPolicyNumber(params.policyNumber);
        dispatch(setPolicyNumberInAppState(params.policyNumber));

        setClubCodeFromPolicyNumber(params.policyNumber);

        setLoading(false);
      }
    } else {
      // If auth already completed (e.g. Layout remounted), hydrate local state from appState
      // and skip a redundant PKCE round-trip.
      if (appState.token) {
        setAxiosToken(appState.token);
        setToken(appState.token);
        if (appState.policyNumber) setPolicyNumber(appState.policyNumber);
        if (appState.clubCode) setClubCode(appState.clubCode);
        setLoading(false);
        return;
      }

      if (isAuthInProgress) {
        LogCannon.blast('Auth already in progress, skipping duplicate call', { ...logData });
        if (authPromise) {
          authPromise
            .catch(() => setTokenInfoError(true))
            .finally(() => setLoading(false));
        }
        return;
      }

      isAuthInProgress = true;
      authPromise = getTokenAndPolicyNumberWrapper()
        .catch(error => {
          LogCannon.error('getTokenAndPolicyNumberWrapper failed unexpectedly', {
            ...logData,
            error
          });
          setLoading(false);
        })
        .finally(() => {
          isAuthInProgress = false;
          authPromise = null;
        });
    }
  }, [appState.token]);

  return {
    token,
    policyNumber,
    loading,
    clubCode,
    clubCodeError,
    isTokenInfoError
  };
};
