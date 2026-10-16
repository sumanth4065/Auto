import { useNavigate } from 'react-router';
import { Box, Button, Typography } from '@ace-clublabs/shared-component-library';
import { Pages } from '../../../shared/pages';
import { useTagging } from '../../../hooks';

export const IntroPage = () => {
  useTagging();
  const navigate = useNavigate();
  const redirectToFilingClaim = () => {
    navigate(Pages.FilingClaim);
  };

  return (
    <>
      <div>
        <Typography variant='h5Medium'>How the online claims process works</Typography>
        <Box sx={{ marginTop: '0.5rem' }}>
          <Typography variant='b1Regular'>
            Filing a claim will take about 10 minutes. After you submit a claim, a representative
            will reach out to follow up.
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: '#F7F5F1',
            padding: '16px',
            borderRadius: '6px',
            margin: '1.1rem 0.5rem'
          }}>
          <Typography variant='b1Regular'>
            Having the following handy can make the process easier :
          </Typography>
          <ul>
            <li>
              <Typography variant='b1Regular'>
                <b>Date, time, and location of the incident</b>
              </Typography>
            </li>
            <li>
              <Typography variant='b1Regular'>
                <b>Year, make model, insurance carrier, etc.</b> for the vehicle(s) involved
              </Typography>
            </li>
            <li>
              <Typography variant='b1Regular'>
                <b>Names of the people involved:</b> drivers, witness, etc.
              </Typography>
            </li>
          </ul>
        </Box>
        <Button
          fullWidth
          variant='contained'
          id='continue-button'
          label='Continue'
          onClick={redirectToFilingClaim}
        />
      </div>
    </>
  );
};
