import { Dispatch, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import dayjs from 'dayjs';
import { Box, Icon, LinearProgress, Typography } from '@ace-clublabs/shared-component-library';
import { Features } from '@ace-clublabs/feature-flags';
import { useFeatureFlags } from '@ace-clublabs/feature-flags/react';
import LogCannon from '@ace-clublabs/log-cannon';
import { MaskData } from '@ace-clublabs/iss-common-util';
import { ConversionType } from '@ace-clublabs/iss-common-shared-claims-models';
import { LoginFlowType } from '@lib/shared-contracts';
import {
  useGetAutoPolicyInfo,
  useGetInitialData,
  useGetPolicyConversion,
  useTagging
} from '../../../hooks';
import { Pages } from '../../../shared/pages';
import { navigateToErrorPage } from '../../../utils/ComponentHelper';
import {
  setAutoEFNOLFeatureFlags,
  setEffectiveDate,
  setExpirationDate,
  setPriorPolicyNumber
} from '../../../store/actions';
import { State } from '../../../store/reducer';
import { getLogData, serializeError } from '../../../utils';

export const IntroTransition = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const {
    loading: autoPolicyInfoLoading,
    error: autoPolicyInfoError,
    autoPolicyInfo
  } = useGetAutoPolicyInfo();
  const { loading: isInitialDataLoading, error: initialDataError } = useGetInitialData(
    appState,
    dispatch as Dispatch<any>
  );
  // Fire for anonymous flow only; errors KO the user via navigateToErrorPage inside the hook
  const { loading: pStarConversionLoading } = useGetPolicyConversion(
    appState.loginFlowType === LoginFlowType.ANONYMOUS,
    ConversionType.PSTAR_TO_GW
  );

  const {
    treatments,
    isReady,
    isLoading: isFeatureFlagsLoading,
    error: featureFlagError
  } = useFeatureFlags([
    { name: Features.AutoEFNOLCustomVehicle },
    { name: Features.AutoEFNOLCustomReporter },
    { name: Features.AutoEFNOLCustomDriver },
    { name: Features.AutoEFNOLEnableWInsurance }
  ]);
  const logData = MaskData.maskJSONFields(getLogData(appState, location.pathname));
  const navigate = useNavigate();

  const isReadyToNavigate =
    !autoPolicyInfoLoading &&
    !isInitialDataLoading &&
    !isFeatureFlagsLoading &&
    !pStarConversionLoading &&
    autoPolicyInfoError === null &&
    initialDataError === null;

  useEffect(() => {
    if (!isFeatureFlagsLoading && (featureFlagError || !isReady)) {
      const serializedError = serializeError(featureFlagError, IntroTransition.name);
      LogCannon.error('Error fetching feature flags', {
        ...logData,
        error: serializedError.errorMessage,
        errorData: serializedError
      });
    }

    if (!isFeatureFlagsLoading) {
      dispatch(
        setAutoEFNOLFeatureFlags({
          [Features.AutoEFNOLCustomVehicle]: treatments[Features.AutoEFNOLCustomVehicle] === 'on',
          [Features.AutoEFNOLCustomReporter]: treatments[Features.AutoEFNOLCustomReporter] === 'on',
          [Features.AutoEFNOLCustomDriver]: treatments[Features.AutoEFNOLCustomDriver] === 'on',
          [Features.AutoEFNOLEnableWInsurance]: treatments[Features.AutoEFNOLEnableWInsurance] === 'on'
        })
      );
    }
  }, [featureFlagError, isFeatureFlagsLoading, isReady, treatments]);

  useEffect(() => {
    if (isReadyToNavigate) {
      navigate(Pages.Intro);
    }
  }, [isReadyToNavigate]);

  useEffect(() => {
    if (autoPolicyInfo) {
      dispatch(
        setEffectiveDate(dayjs(autoPolicyInfo.policyGeneralInfo.termEffectiveDate).toISOString())
      );
      dispatch(
        setExpirationDate(dayjs(autoPolicyInfo.policyGeneralInfo.termExpirationDate).toISOString())
      );

      if (autoPolicyInfo.policyGeneralInfo.priorPolicyNumber) {
        dispatch(setPriorPolicyNumber(autoPolicyInfo.policyGeneralInfo.priorPolicyNumber));
      }
    }
  }, [autoPolicyInfo]);

  if (
    !autoPolicyInfoLoading &&
    !isInitialDataLoading &&
    (autoPolicyInfoError || initialDataError)
  ) {
    if (initialDataError) {
      LogCannon.error('useGetInitialData error in IntroTransition', {
        ...logData,
        error: initialDataError.errorMessage,
        errorData: appState.serializedError
      });
    }

    if (autoPolicyInfoError) {
      LogCannon.error('useGetAutoPolicyInfo error in IntroTransition', {
        ...logData,
        error: autoPolicyInfoError.errorMessage,
        errorData: appState.serializedError
      });
    }

    navigateToErrorPage(autoPolicyInfoError ?? initialDataError, navigate);
  }
  useTagging();
  return (
    <>
      <LinearProgress
        aria-label='progress'
        sx={{
          marginBottom: '1rem'
        }}
      />
      <Box sx={{ display: 'flex' }}>
        <Icon
          iconName={`${
            autoPolicyInfoLoading || isInitialDataLoading
              ? 'circle-regular'
              : 'circle-check-regular'
          }`}
          color='primary'
          sx={{
            fontSize: '2rem',
            marginRight: '0.5rem'
          }}
        />
        <Typography variant='b1Medium' sx={{ paddingTop: '0.25rem' }}>
          Gathering your policy information
        </Typography>
      </Box>
      <Typography
        variant='b1Regular'
        sx={{ fontWeight: 'regular', marginTop: '20px', marginLeft: '40px' }}>
        This will only take a moment. Please don't refresh this page or go back.
      </Typography>
    </>
  );
};
