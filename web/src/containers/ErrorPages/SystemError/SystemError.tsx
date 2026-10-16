import { buildPhoneHref, MaskData } from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { Button, Illustration, Typography } from '@ace-clublabs/shared-component-library';
import { useOutletContext } from 'react-router';
import { useTagging } from '../../../hooks';
import { State } from '../../../store/reducer';
import { AppPathname } from '../../../types';
import { getLogData } from '../../../utils';
import { getCustomerServiceNumber } from '../../../utils/ComponentHelper';
import { APP_NAME } from '../../../utils/LogCannonHelper';

export const SystemError = () => {
  useTagging();
  const [appState] = useOutletContext<[State, Function]>();
  const customerServiceNumber = getCustomerServiceNumber(appState.clubCode, appState.brand);

  const logData = MaskData.maskJSONFields(getLogData(appState, location.pathname));
  LogCannon.error('System Error', {
    ...logData,
    appLabel: APP_NAME,
    component: ('file-a-claim' + location.pathname) as AppPathname,
    error: appState.errorReason,
    errorData: appState.serializedError
  });

  return (
    <div style={{ margin: '0 auto' }}>
      <div test-id='system-error' style={{ display: 'flex' }}>
        <Illustration
          illustrationName='page-expired'
          sx={{ margin: '0 auto', display: 'block', width: '100%', height: 'auto' }}
        />
      </div>

      <Typography
        variant='h5Medium'
        sx={{
          paddingTop: '0.5rem',
          paddingBottom: '1rem'
        }}>
        {'Our systems are temporarily unavailable'}
      </Typography>

      <Typography variant='b1Regular' sx={{ marginBottom: '1rem' }}>
        {'Please try again later or contact us for assistance.'}
      </Typography>

      <Button
        sx={{ marginTop: '1rem' }}
        fullWidth
        variant='outlined'
        id='continue-button'
        label={`Call ${customerServiceNumber}`}
        onClick={() => {
          window.open(buildPhoneHref(customerServiceNumber));
        }}
      />
    </div>
  );
};
