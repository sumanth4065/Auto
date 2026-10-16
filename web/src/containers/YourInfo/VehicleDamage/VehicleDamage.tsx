import {
  Button,
  ButtonGroup,
  Form,
  TextField,
  Typography,
  useTextValidator
} from '@ace-clublabs/shared-component-library';
import { useNavigate, useOutletContext } from 'react-router';
import { State } from '../../../store/reducer';
import { Pages } from '../../../shared/pages';
import { setVehicleDamage } from '../../../store/actions';
import { useTagging } from '../../../hooks';

export const VehicleDamage = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();

  useTagging();

  return (
    <div>
      <Typography variant='h5Medium'>Please tell us about the damage to your vehicle</Typography>
      <Form
        //@ts-ignore
        onSubmit={(data: { damageDescription: string }) => {
          dispatch(setVehicleDamage(data.damageDescription));
          navigate(Pages.NumberOfVehiclesInvolved);
        }}>
        <TextField
          fullWidth
          name='damageDescription'
          label='Description of the damage'
          defaultValue={appState.damageDescription ?? null}
          maxLength={500}
          multiline
          /* @ts-ignore */
          validator={useTextValidator()}
          required
        />
        <ButtonGroup>
          <Button fullWidth type='submit' variant='contained' id='next-button' label='Next' />
        </ButtonGroup>
      </Form>
    </div>
  );
};
