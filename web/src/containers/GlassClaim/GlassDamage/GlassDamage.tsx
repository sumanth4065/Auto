import { useNavigate, useOutletContext } from 'react-router';
import { Box, Button, Typography } from '@ace-clublabs/shared-component-library';
import { Pages } from '../../../shared/pages';
import { State } from '../../../store/reducer';
import { useTagging } from '../../../hooks';

export const GlassDamage = () => {
  const navigate = useNavigate();
  const [appState] = useOutletContext<[State, Function]>();
  const { tags, fireTag } = useTagging();

  return (
    <>
      <div>
        <Typography variant='h5Medium'>Glass Damage</Typography>
        <Box sx={{ marginTop: '0.5rem' }}>
          <Typography variant='b1Regular'>
            We’ve partnered with auto glass expert Safelite to get your glass repaired and give you
            the best service.
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: '#F7F5F1',
            padding: '16px',
            borderRadius: '6px',
            margin: '1.1rem 0.5rem'
          }}>
          <Typography variant='h6'>What’s next?</Typography>
          <ul>
            <li>
              <Typography variant='b1Regular'>We’ll direct you to the Safelite website.</Typography>
            </li>
            <li>
              <Typography variant='b1Regular'>You’ll report the glass damage details.</Typography>
            </li>
            <li>
              <Typography variant='b1Regular'>
                Schedule a repair appointment that’s convenient for you.
              </Typography>
            </li>
          </ul>
        </Box>
        <Button
          fullWidth
          variant='contained'
          id='continue-button'
          label='Continue'
          onClick={() => {
            fireTag('safeliteredirect-continue');

            // redirectToSafelite
            navigate(Pages.RedirectToSafelite);
          }}
        />
      </div>
    </>
  );
};
