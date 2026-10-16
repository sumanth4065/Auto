import { useNavigate } from 'react-router';
import { Box, Button, Typography } from '@ace-clublabs/shared-component-library';
import { Pages } from '../../../shared/pages';
import { LocalStepper } from '../../../components';
import { useTagging } from '../../../hooks';

export const AdditionalDetailsTransition = () => {
  const navigate = useNavigate();

  const redirectToAdditionalDetails = () => {
    navigate(Pages.OtherPartyPedestrian);
  };

  useTagging();

  return (
    <>
      <div>
        <LocalStepper step={3} />
        <Typography variant='h5Medium'>Lastly, let's gather a few additional details.</Typography>
        <Box sx={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          <Typography variant='b1Regular'>
            Tell us if you have any property damage, witnesses, or if any pedestrians and/or
            cyclists were involved in the incident.
          </Typography>
        </Box>
        <Button
          fullWidth
          variant='contained'
          id='next-button'
          label='Continue'
          onClick={redirectToAdditionalDetails}
        />
      </div>
    </>
  );
};
