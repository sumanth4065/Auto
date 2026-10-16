import { useMemo } from 'react';
import { useOutletContext } from 'react-router';
import LogCannon from '@ace-clublabs/log-cannon';
import { Button, Typography } from '@ace-clublabs/shared-component-library';
import { MaskData } from '@ace-clublabs/iss-common-util';
import { useTagging } from '../../../hooks';
import { State } from '../../../store/reducer';
import { AppPathname } from '../../../types';
import { getCustomerServiceNumber } from '../../../utils/ComponentHelper';
import { APP_NAME } from '../../../utils/LogCannonHelper';
import { getLogData } from '../../../utils';
import { buildPhoneHref } from '@ace-clublabs/iss-common-util';

export const PolicyError = () => {
  useTagging();
  const imgUrl = useMemo(() => {
    return new URL('/Sorry.svg', import.meta.url).href;
  }, []);
  const [appState] = useOutletContext<[State, Function]>();
  const customerServiceNumber = getCustomerServiceNumber(appState.clubCode, appState.brand);
  const logData = MaskData.maskJSONFields(getLogData(appState, location.pathname));
  LogCannon.error('Policy Error', {
    ...logData,
    appLabel: APP_NAME,
    component: ('file-a-claim' + location.pathname) as AppPathname,
    error: appState.errorReason,
    errorData: appState.serializedError
  });

  return (
    <div style={{ margin: '0 auto' }}>
      <img
        src={imgUrl}
        alt='Policy error'
        style={{ margin: '0 auto', display: 'block' }}
        test-id='policy-error'
      />

      <Typography
        variant='h5Medium'
        sx={{
          paddingTop: '0.5rem',
          paddingBottom: '1rem'
        }}>
        {'We couldn’t verify the information provided to start a claim'}
      </Typography>

      <Typography variant='b1Regular' sx={{ marginBottom: '1rem' }}>
        {'To file a claim, please call us and an agent will be happy to assist you.'}
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
