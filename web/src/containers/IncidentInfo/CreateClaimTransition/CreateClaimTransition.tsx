import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Box, LinearProgress, Typography } from '@ace-clublabs/shared-component-library';
import LogCannon from '@ace-clublabs/log-cannon';
import { MaskData } from '@ace-clublabs/iss-common-util';
import { useCreateClaim, useGetAutoClaimInfo } from '../../../hooks';
import { Pages } from '../../../shared/pages';
import { navigateToErrorPage } from '../../../utils/ComponentHelper';
import { State } from '../../../store/reducer';
import { getLogData } from '../../../utils';

export const CreateClaimTransition = () => {
  //TODO: add the correspondig call to get claim info
  const { loading: getClaimInfoLoading, error: getClaimInfoError } = useGetAutoClaimInfo();
  const { loading: createClaimLoading, error: createClaimError } = useCreateClaim(
    !getClaimInfoLoading && getClaimInfoError === null
  );

  // Only call policy retrieve after create claim completes successfully

  const navigate = useNavigate();
  const [appState] = useOutletContext<[State, Function]>();
  const logData = MaskData.maskJSONFields(getLogData(appState, location.pathname));

  useEffect(() => {
    if (appState.duplicatedClaim) {
      if (!getClaimInfoLoading && getClaimInfoError === null) {
        LogCannon.blast('CreateClaimTransition navigation', {
          destination: Pages.WhenAccident,
          reason: 'duplicated claim',
          ...logData
        });
        navigate(Pages.WhenAccident);
      }
    }
  }, [getClaimInfoLoading, getClaimInfoError, appState.duplicatedClaim, appState.claimNumber]);

  useEffect(() => {
    // Navigate only when both create claim and policy retrieve complete successfully
    if (!createClaimLoading && createClaimError === null) {
      if (appState.claimSubmittedForClaimNumber) {
        LogCannon.blast('CreateClaimTransition navigation', {
          destination: Pages.SystemError,
          reason: 'claim already submitted in session',
          ...logData
        });
        navigate(Pages.SystemError, { replace: true });
      } else {
        LogCannon.blast('CreateClaimTransition navigation', {
          destination: Pages.WhoIsReporting,
          reason: 'both API calls completed successfully',
          ...logData
        });
        navigate(Pages.WhoIsReporting);
      }
    }
  }, [
    createClaimLoading,
    createClaimError,
    appState.claimNumber,
    appState.claimSubmittedForClaimNumber
  ]);

  if ((!getClaimInfoLoading && getClaimInfoError) || (!createClaimLoading && createClaimError)) {
    const firstError = getClaimInfoError || createClaimError;
    LogCannon.error('CreateClaimTransition error', { error: firstError, ...logData });
    navigateToErrorPage(firstError, navigate);
  }

  return (
    <>
      <LinearProgress
        aria-label='progress'
        sx={{
          marginBottom: '1rem'
        }}
      />
      <Box sx={{ display: 'flex' }}>
        <Typography variant='h4' sx={{ fontWeight: 'regular' }}>
          Setting up your claim
        </Typography>
      </Box>
    </>
  );
};
