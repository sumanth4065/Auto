import { useNavigate, useOutletContext } from 'react-router';
import { Box, Icon, LinearProgress, Typography } from '@ace-clublabs/shared-component-library';
import LogCannon from '@ace-clublabs/log-cannon';
import { MaskData } from '@ace-clublabs/iss-common-util';
import { useRedirectToSafelite } from '../../../hooks';
import { getLogData, navigateToErrorPage } from '../../../utils';
import { State } from '../../../store/reducer';

export const RedirectToSafelite = () => {
  const [appState] = useOutletContext<[State, Function]>();
  const { error, loading, safeliteRedirectUrl } = useRedirectToSafelite();
  const navigate = useNavigate();
  const logData = MaskData.maskJSONFields(getLogData(appState, location.pathname));

  // - wait for lambda to response with a safeliteRedirectUrl
  // - navigate to the safeliteRedirectUrl
  if (!loading && safeliteRedirectUrl) {
    sessionStorage.setItem('safeliteRedirectInitiated', 'true');
    window.location.replace(safeliteRedirectUrl);
  }

  if (!loading && error) {
    LogCannon.error('useRedirectToSafelite error in RedirectToSafelite', {
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
        <Typography variant='h4' sx={{ fontWeight: 'regular' }}>
          Please wait while we direct you to the Safelite website.
        </Typography>{' '}
      </Box>
    </>
  );
};
