import {
  Button,
  Form,
  TextField,
  Typography,
  useTextValidator
} from '@ace-clublabs/shared-component-library';
import { useNavigate } from 'react-router';
import { Pages } from '../../../shared/pages';
import { State } from '../../../store/reducer';
import { useOutletContext } from 'react-router';
import { setIncidentDescription } from '../../../store/actions';
import { useTagging } from '../../../hooks';

export const WhatHappened = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();

  useTagging();

  return (
    <div>
      <Typography variant='h5Medium'>Please tell us what happened</Typography>
      <Form
        onSubmit={(data: { incidentDescription: string }) => {
          dispatch(setIncidentDescription(data.incidentDescription));
          navigate(Pages.VehicleTowed);
        }}>
        <TextField
          fullWidth
          name='incidentDescription'
          label='Incident description'
          maxLength={1000}
          multiline
          value={appState.incidentDescription ?? ''}
          /* @ts-ignore */
          validator={useTextValidator()}
          required
        />
        <Button fullWidth type='submit' variant='contained' id='next-button' label='Next' />
      </Form>
    </div>
  );
};
