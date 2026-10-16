import { Box, Button, Typography } from '@ace-clublabs/shared-component-library';
import { Pages } from '../../../shared/pages';
import { useNavigate, useOutletContext } from 'react-router';
import { LocalStepper } from '../../../components';
import { State } from '../../../store/reducer';
import { useTagging } from '../../../hooks';
import { VehicleCount } from '@ace-clublabs/iss-common-auto-efnol-models';

export const OtherPartyTransition = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();

  useTagging();

  const redirectToOtherParty = () => {
    if (appState.numberOfVehiclesInvolved == VehicleCount.One) {
      navigate(Pages.OtherPartyYMM);
    } else {
      navigate(Pages.AdditionalDetailsTransition);
    }
  };

  return (
    <>
      <div>
        <LocalStepper step={2} />
        <Typography variant='h5Medium'>
          Next, let's get some information about the other party.
        </Typography>
        <Box sx={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          <Typography variant='b1Regular'>
            We'll get more information about the other vehicle(s), insurance, individuals involved,
            and any witness information.
          </Typography>
        </Box>
        <Button
          fullWidth
          variant='contained'
          id='next-button'
          label='Next'
          onClick={redirectToOtherParty}
        />
      </div>
    </>
  );
};
