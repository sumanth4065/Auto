import { Box, Button, Typography } from '@ace-clublabs/shared-component-library';
import { Pages } from '../../../shared/pages';
import { useNavigate } from 'react-router';
import { LocalStepper } from '../../../components';
import { useTagging } from '../../../hooks';

export const IncidentInfoIntro = () => {
  const navigate = useNavigate();
  useTagging();

  const redirectTo = () => {
    navigate(Pages.WhenAccident);
  };

  return (
    <>
      <div>
        <LocalStepper step={0} />
        <Typography variant='h5Medium'>
          Let's start with some information about the incident
        </Typography>
        <Box sx={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          <Typography variant='b1Regular'>
            We'll get more details about the incident, including the date, time, location, reporter,
            and contact information.
          </Typography>
        </Box>
        <Button
          fullWidth
          variant='contained'
          id='next-button'
          data-quid='next-button'
          label='Next'
          onClick={redirectTo}
        />
      </div>
    </>
  );
};
