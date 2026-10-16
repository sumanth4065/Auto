import { Box, Button, Typography } from '@ace-clublabs/shared-component-library';
import { Pages } from '../../../shared/pages';
import { useNavigate } from 'react-router';
import { LocalStepper } from '../../../components';
import { useTagging } from '../../../hooks';

export const CarDetailsTransitionPage = () => {
  useTagging();
  const navigate = useNavigate();

  const redirectToVehicleInvolved = () => {
    navigate(Pages.VehicleInvolved);
  };

  return (
    <>
      <div>
        <LocalStepper step={1} />
        <Typography variant='h5Medium'>Now, we'll need details about your vehicle</Typography>
        <Box sx={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          <Typography variant='b1Regular'>
            We'll get some information about your vehicle, the driver, and the details of the
            incident.
          </Typography>
        </Box>
        <Button
          fullWidth
          variant='contained'
          id='next-button'
          label='Next'
          onClick={redirectToVehicleInvolved}
        />
      </div>
    </>
  );
};
