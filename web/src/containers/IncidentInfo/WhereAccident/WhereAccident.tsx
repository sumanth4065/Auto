import {
  Box,
  Button,
  ButtonGroup,
  Form,
  TextField,
  Typography,
  useStateInitialsValidator,
  useTextValidator,
  useZipCodeValidator
} from '@ace-clublabs/shared-component-library';
import { useNavigate, useOutletContext } from 'react-router';
import { useTagging } from '../../../hooks';
import { Pages } from '../../../shared/pages';
import { setWhereInformation } from '../../../store/actions';
import { State } from '../../../store/reducer';
import { IWhereInformation } from '../../../types';

export const WhereAccident = () => {
  const navigate = useNavigate();
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  useTagging();
  const cityValidator = useTextValidator({ maxLength: 60 });
  const zipCodeValidator = useZipCodeValidator({ required: false, label: 'ZIP code' });
  const streetValidator = useTextValidator({
    maxLength: 60,
    fieldIsRequiredValidationMessage: 'Street is required.'
  });
  const stateValidator = useStateInitialsValidator({
    fieldIsRequiredValidationMessage: 'State is required.'
  });
  const locationDescriptionValidator = useTextValidator({
    maxLength: 2000,
    required: false
  });

  return (
    <>
      <Typography variant='h5Medium'>Where did the incident happen?</Typography>
      <Form
        onSubmit={(data: IWhereInformation) => {
          dispatch(setWhereInformation(data));
          navigate(Pages.CreateClaimTransition);
        }}
        sx={{
          marginTop: '0'
        }}>
        <TextField
          required
          defaultValue={appState.street ?? ''}
          validator={streetValidator}
          fullWidth
          name='street'
          label='Street'
          helperText='Example: 1234 Main Street, or I-110 North near Exit 20'
        />
        <TextField
          required
          defaultValue={appState.city ?? ''}
          validator={cityValidator}
          fullWidth
          name='city'
          label='City'
          helperText='Example: Los Angeles'
        />
        <Box sx={{ display: 'flex', gap: '0.5rem' }}>
          <TextField
            name='state'
            label='State'
            required
            validator={stateValidator}
            helperText='Example: CA'
            defaultValue={appState.state ?? ''}
            sx={{
              width: '50%'
            }}
          />
          <TextField
            name='zipCode'
            label='ZIP code (optional)'
            required={false}
            validator={zipCodeValidator}
            defaultValue={appState.zipCode ?? ''}
            sx={{
              width: '50%'
            }}
          />
        </Box>
        <TextField
          defaultValue={appState.lossLocationDescription ?? ''}
          validator={locationDescriptionValidator}
          fullWidth
          multiline
          name='lossLocationDescription'
          label='Additional description (optional)'
          required={false}
        />
        <ButtonGroup>
          <Button id='next-button' type='submit' label='Next' fullWidth />
        </ButtonGroup>
      </Form>
    </>
  );
};
