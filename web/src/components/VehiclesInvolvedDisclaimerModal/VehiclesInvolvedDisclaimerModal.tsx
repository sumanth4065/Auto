import { useEffect } from 'react';
import {
  Modal,
  ModalActionButton,
  ModalActions,
  ModalContent,
  Typography
} from '@ace-clublabs/shared-component-library';
import { useTagging } from '../../hooks';
interface VehiclesInvolvedDisclaimerModalProps {
  open: boolean;
  onClose: () => void;
}

export const VehiclesInvolvedDisclaimerModal = ({
  open,
  onClose
}: VehiclesInvolvedDisclaimerModalProps) => {
  const { fireTag } = useTagging(false, 'twoormorevehicles');

  useEffect(() => {
    if (open) {
      fireTag();
    }
  }, [open]);

  return (
    <Modal
      id='modal-vehicles-involved-disclaimer'
      open={open}
      onClose={onClose}
      aria-labelledby='modal-title-1'
      aria-describedby='modal-content-1'>
      <ModalContent id='modal-content-1'>
        <Typography variant='b1Regular'>
          A claims representative will contact you to gather details about the other vehicles once
          the claim is filed. Select OK to continue filling a claim.
        </Typography>
      </ModalContent>
      <ModalActions
        actionLayout={{
          xs: 'fullWidth',
          sm: 'fullWidth',
          md: 'rightAlign',
          lg: 'rightAlign'
        }}>
        <ModalActionButton
          id='okButton'
          label='OK'
          // @ts-ignore
          placeholder={undefined}
          onClick={onClose}
        />
      </ModalActions>
    </Modal>
  );
};
