import { MaskData, buildPhoneHref } from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { Button, Typography } from '@ace-clublabs/shared-component-library';
import { useMemo } from 'react';
import { useOutletContext } from 'react-router';
import { useTagging } from '../../hooks';
import { State } from '../../store/reducer';
import { AppPathname } from '../../types';
import { getLogData } from '../../utils';
import { getCustomerServiceNumber } from '../../utils/ComponentHelper';
import { APP_NAME } from '../../utils/LogCannonHelper';

export const Knockout = () => {
  useTagging();
  const imgUrl = useMemo(() => {
    return new URL('/Sorry.svg', import.meta.url).href;
  }, []);
  const [appState] = useOutletContext<[State, Function]>();
  const customerServiceNumber = getCustomerServiceNumber(appState.clubCode, appState.brand);
  const logData = MaskData.maskJSONFields(getLogData(appState, location.pathname));

  LogCannon.error('Knockout', {
    ...logData,
    appLabel: APP_NAME,
    component: ('file-a-claim' + location.pathname) as AppPathname,
    // If knockoutReason is not available and serializedError.errorMessage is available,
    // it means the error is meant to be a knockout.
    error: appState.knockoutReason || appState.serializedError?.errorMessage,
    errorData: appState.serializedError
  });

  return (
    <div style={{ margin: '0 auto' }}>
      <img
        src={imgUrl}
        alt='Person using a computer icon'
        style={{ margin: '0 auto', display: 'block' }}
        test-id='person-using-computer-icon'
      />
      <Typography variant='h5Medium' sx={{ marginBottom: '0.5rem' }}>
        {"Sorry, we're unable to process your claim at this point"}
      </Typography>
      <Typography variant='b1Regular' sx={{ marginBottom: '1rem' }}>
        {
          'Your claim has not been submitted. We can help you complete this over the phone. To move forward with the claim, please contact us at the phone number below.'
        }
      </Typography>
      <Typography variant='b1Regular'>{'We are available 24/7'}</Typography>
      <Typography variant='b1Regular' sx={{ marginBottom: '2rem' }}>
        {'Reference number: '}
        <b>{appState.claimNumber ?? 'N/A'}</b>
      </Typography>
      <Button
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
