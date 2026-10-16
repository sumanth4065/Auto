import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Box, Icon, LinearProgress, Typography } from '@ace-clublabs/shared-component-library';
import LogCannon from '@ace-clublabs/log-cannon';
import { MaskData } from '@ace-clublabs/iss-common-util';
import { Pages } from '../../../shared/pages';
import { useSubmitClaim } from '../../../hooks';
import { navigateToErrorPage } from '../../../utils/ComponentHelper';
import { getLogData } from '../../../utils';
import { State } from '../../../store/reducer';

export const SubmitClaimTransition = () => {
  const [appState] = useOutletContext<[State, Function]>();
  const { loading, error } = useSubmitClaim();
  const navigate = useNavigate();
  const logData = MaskData.maskJSONFields(getLogData(appState, location.pathname));

  useEffect(() => {
    if (!loading && error === null) navigate(Pages.Confirmation, { replace: true }); // TODO: fix next route
  }, [loading, error]);

  // navigate to error page\
  if (!loading && error) {
    LogCannon.error('useSubmitClaim error in SubmitClaimTransition', {
      error,
      ...logData
    });
    navigateToErrorPage(error, navigate);
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
        <Icon
          iconName='circle-check-regular'
          color='primary'
          sx={{
            fontSize: '2rem',
            marginRight: '0.5rem',
            paddingTop: '0.25rem'
          }}
        />
        <Typography variant='h5' sx={{ fontWeight: 'regular' }}>
          Gathering your claim details
        </Typography>
      </Box>
      <Typography
        variant='b1Regular'
        sx={{ fontWeight: 'regular', marginTop: '20px', marginLeft: '40px' }}>
        Please wait while we submit your claim. Don't refresh this page or select the back button.
      </Typography>
    </>
  );
};
