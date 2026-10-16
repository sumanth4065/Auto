import { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import LogCannon from '@ace-clublabs/log-cannon';
import { Button, Typography } from '@ace-clublabs/shared-component-library';
import { MaskData } from '@ace-clublabs/iss-common-util';
import { useTagging } from '../../../hooks';
import { Pages } from '../../../shared/pages';
import { State } from '../../../store/reducer';
import { APP_NAME } from '../../../utils/LogCannonHelper';
import { AppPathname } from '../../../types';
import { getLogData } from '../../../utils';

export const SessionTimedOut = () => {
  useTagging();
  const imgUrl = useMemo(() => {
    return new URL('/SystemError.svg', import.meta.url).href;
  }, []);
  const [appState] = useOutletContext<[State, Function]>();

  const navigate = useNavigate();
  const navigateTo = () => {
    navigate(Pages.FilingClaim);
  };
  const logData = MaskData.maskJSONFields(getLogData(appState, location.pathname));

  LogCannon.error('Session Timeout', {
    ...logData,
    appLabel: APP_NAME,
    component: ('file-a-claim' + location.pathname) as AppPathname,
    error: appState.errorReason
  });

  return (
    <div style={{ margin: '0 auto' }}>
      <img
        src={imgUrl}
        alt='Page expired'
        style={{ margin: '0 auto', display: 'block' }}
        test-id='page-expired'
      />

      <Typography
        variant='h5Medium'
        sx={{
          paddingTop: '0.5rem',
          paddingBottom: '1rem'
        }}>
        {'Your session has timed out'}
      </Typography>

      <Button
        fullWidth
        variant='outlined'
        id='file-a-claim-button'
        label='File a claim'
        onClick={navigateTo}
      />
    </div>
  );
};
