import { useEffect } from 'react';
import {
  Box,
  Modal,
  ModalActionButton,
  ModalActions,
  ModalCloseIconButton,
  ModalContent,
  ModalTitle,
  Typography,
  Link
} from '@ace-clublabs/shared-component-library';
import { useOutletContext } from 'react-router';
import { State } from '../../store/reducer';
import { getCustomerServiceNumber } from '../../utils/ComponentHelper';
import { getReturnNavigation } from '../../utils/returnNavigationHelper';
import { getCustomerServiceEmail } from '../../shared/constants';
import { formatPhoneNumber } from '@ace-clublabs/iss-common-util';
import { useTagging } from '../../hooks';

interface DuplicatedClaimModalProps {
  open: boolean;
  onClose: () => void;
}

export const DuplicatedClaimModal = ({ open, onClose }: DuplicatedClaimModalProps) => {
  const [appState] = useOutletContext<[State, Function]>();
  const { fireTag } = useTagging(false, 'existingclaim');
  const customerServiceNumber = getCustomerServiceNumber(appState.clubCode!, appState.brand);
  const adjuster = appState.adjuster;
  const customerServiceEmail = getCustomerServiceEmail(appState.brand ?? 'AAA');

  const basePhone = adjuster?.phoneNumber || '';
  const digits = (basePhone || customerServiceNumber).replace(/\D/g, '');
  const normalizedDigits = digits.length === 10 ? `1${digits}` : digits;
  const adjusterPhoneTelHref = `tel:${normalizedDigits}`;
  const formatted = formatPhoneNumber(basePhone);
  const extensionDisplay = adjuster?.extension ? ` (ext. ${adjuster.extension})` : '';
  const prefixOne = (phone: string) => (phone.startsWith('1-') ? phone : `1-${phone}`);
  const adjusterPhoneDisplay = prefixOne(formatted || customerServiceNumber);

  const returnNavigation = getReturnNavigation(appState, {
    labelOverrides: {
      anonymousHomepage: 'Go back to home',
      autoPolicy: 'Go back to Auto policy',
      policyFallback: 'Go back to home',
      myAccount: 'Go back to My Account',
      autoClaim: 'Go back to Auto claim',
      claimsFallback: 'Go back to home'
    }
  });
  const handleGoBack = () => returnNavigation.onClick();

  useEffect(() => {
    if (open) {
      fireTag();
    }
  }, [open]);

  return (
    <Modal
      id='modal-duplicate-claim'
      open={open}
      onClose={onClose}
      aria-labelledby='modal-title-1'
      aria-describedby='modal-content-1'>
      <ModalContent id='modal-content-1'>
        <Box sx={{ position: 'relative' }}>
          <ModalTitle
            id='modal-title-1'
            sx={{
              paddingRight: '3rem',
              color: '#3D4043',
              fontSize: '20px',
              fontFamily: 'Roboto',
              fontWeight: 700,
              lineHeight: '32px',
              wordWrap: 'break-word'
            }}>
            We found an existing claim on the selected date
          </ModalTitle>
          <ModalCloseIconButton
            id='closeButton'
            aria-label='Close'
            onClick={onClose}
            sx={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', '& svg': { fontSize: '2rem' } }}
          />
        </Box>

        <Typography variant='b1Regular'>
          If you need information about your existing claim <strong>{appState.claimNumber}</strong>,{' '}
          <>please contact us using the email address or phone number below.</>
        </Typography>
        {
          <Box
            sx={{
              borderRadius: '6px',
              backgroundColor: '#F7F5F1',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              marginTop: '1rem'
            }}>
            {adjuster && (
              <Typography variant='b1Bold' paddingBottom={'0.5rem'}>
                Claims Service Representative
              </Typography>
            )}
            {adjuster?.displayName && (
              <Typography variant='b1Regular' data-qm-block paddingBottom={'0.5rem'}>
                Name: {adjuster?.displayName}
              </Typography>
            )}
            <Typography variant='b1Regular' data-qm-block>
              Email:{' '}
              <Link target='_blank' href={`mailto:${customerServiceEmail}`}>
                {customerServiceEmail}
              </Link>
            </Typography>
            <Typography variant='b1Regular' data-qm-block>
              Phone:{' '}
              <Link target='_blank' href={adjusterPhoneTelHref}>
                {adjusterPhoneDisplay}
              </Link>
              {extensionDisplay}
            </Typography>
          </Box>
        }
      </ModalContent>
      <ModalActions
        actionLayout={{
          xs: 'fullWidth',
          sm: 'fullWidth',
          md: 'fullWidth',
          lg: 'fullWidth',
          xl: 'fullWidth'
        }}>
        <ModalActionButton
          id='goBackButton'
          label={returnNavigation.label}
          variant='outlined'
          // @ts-ignore
          placeholder={undefined}
          onClick={handleGoBack}
        />
        <ModalActionButton
          id='continueButton'
          label='Select a different date'
          // @ts-ignore
          placeholder={undefined}
          onClick={onClose}
        />
      </ModalActions>
    </Modal>
  );
};
