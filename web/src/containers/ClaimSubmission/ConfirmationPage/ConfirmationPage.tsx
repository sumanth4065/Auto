import { buildPhoneHref, formatPhoneNumber } from '@ace-clublabs/iss-common-util';
import {
  Box,
  Button,
  CindyButton,
  CindyTypography,
  Link,
  Typography
} from '@ace-clublabs/shared-component-library';
import { useOutletContext } from 'react-router';
import { useTagging } from '../../../hooks';
import { getCustomerServiceEmail } from '../../../shared/constants';
import { State } from '../../../store/reducer';
import { clearClaimSession } from '../../../utils/claimSessionGuard';
import {
  getCustomerServiceNumber,
  getRoadsideAssistanceUrl,
  navigateToHome
} from '../../../utils/ComponentHelper';

export const ConfirmationPage = () => {
  const [appState] = useOutletContext<[State, Function]>();

  const handleNavigateToHome = () => {
    clearClaimSession();
    navigateToHome(appState.clubCode, appState.sourceApp, appState.policyNumber, appState.brand);
  };

  const navigateToRoadsideAssistance = () => {
    const url = getRoadsideAssistanceUrl(appState.brand);
    window.location.assign(url);
  };

  useTagging();

  const { adjuster } = appState;
  const genericEmail = getCustomerServiceEmail(appState.brand ?? 'AAA');
  const genericPhone = getCustomerServiceNumber(appState.clubCode, appState.brand);
  const formattedAdjusterPhone = formatPhoneNumber(adjuster?.phoneNumber);
  const contactCardSx = {
    borderRadius: '6px',
    backgroundColor: '#F7F5F1',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
      <Typography variant='h5'>Your claim has been filed</Typography>
      <Typography variant='b1Regular'>Claim number :</Typography>
      <Typography variant='b1Bold' data-qm-block>
        {appState.claimNumber}
      </Typography>
      <Typography variant='b1Regular'>We've sent an email confirmation to</Typography>
      <Typography variant='b1Bold' data-qm-block>
        {appState.email}
      </Typography>
      <Typography variant='b1Regular'>
        Thank you for reporting your claim. We'll contact you shortly to follow up.
      </Typography>
      <Typography variant='b1Regular'>
        The claims representative will help you investigate the incident, review your policy
        coverage, gather any photos/documents, and assist you with the next steps.
      </Typography>
      {adjuster ? (
        <Box sx={contactCardSx}>
          <Typography variant='b1Bold' sx={{ marginBottom: '1.5rem' }}>
            Claims Service Representative
          </Typography>
          {adjuster?.displayName && (
            <Typography variant='b1Regular' data-qm-block>
              Name: {adjuster?.displayName}
            </Typography>
          )}
          <Typography variant='b1Regular' data-qm-block>
            Email: <Link href={`mailto:${genericEmail}`}>{genericEmail}</Link>
          </Typography>
          <Typography variant='b1Regular' data-qm-block>
            Phone:{' '}
            <Link href={buildPhoneHref(adjuster?.phoneNumber || genericPhone)}>
              {adjuster?.phoneNumber ? formattedAdjusterPhone : genericPhone}
            </Link>
            {adjuster?.extension ? ` (ext.${adjuster.extension})` : ''}
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant='b1Regular'>
            If you need any information about your claim, please contact us using the email address
            or phone number below.
          </Typography>
          <Box sx={contactCardSx}>
            <Typography variant='b1Regular'>
              Email: <Link href={`mailto:${genericEmail}`}>{genericEmail}</Link>
            </Typography>
            <Typography variant='b1Regular'>
              Phone: <Link href={buildPhoneHref(genericPhone)}>{genericPhone}</Link>
            </Typography>
          </Box>
        </>
      )}
      <Button
        sx={{
          margin: '1rem 0'
        }}
        fullWidth
        variant='contained'
        id='returnHome'
        label='Back to home'
        onClick={handleNavigateToHome}
      />
      <Box
        sx={{
          borderRadius: '6px',
          backgroundColor: '#F6F6F8',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          fontSize: '14px'
        }}>
        <CindyTypography>
          If you need Roadside Assistance, please start a chat to request service online.
        </CindyTypography>
        <CindyButton
          sx={{
            width: 'fit-content',
            marginTop: '0.5rem'
          }}
          label='Get Road Assistance'
          onClick={navigateToRoadsideAssistance}
          placeholder={'Get Road Assistance'}
        />
      </Box>
    </Box>
  );
};
