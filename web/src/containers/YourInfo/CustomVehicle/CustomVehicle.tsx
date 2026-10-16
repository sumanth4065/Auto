import {
  Button,
  ButtonGroup,
  Form,
  TextField,
  Typography,
  useTextValidator
} from '@ace-clublabs/shared-component-library';
import { IYearMakeModel } from '@lib/types';
import { useNavigate, useOutletContext } from 'react-router';
import { useTagging } from '../../../hooks';
import { Pages } from '../../../shared/pages';
import { setVehicleInvolvedInIncident } from '../../../store/actions';
import { State } from '../../../store/reducer';
import { YearValidator } from '../../../utils';

export const CustomVehiclePage = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  
  // @ts-expect-error getFormValue returns number for IYearMakeModel.year; hook types are string.
  const yearValidator = useTextValidator(YearValidator);
  const makeValidator = useTextValidator({ maxLength: 40 });
  const modelValidator = useTextValidator({ maxLength: 40 });
  const navigate = useNavigate();
  useTagging();

  const handleSubmit = (data: IYearMakeModel) => {
    dispatch(setVehicleInvolvedInIncident({
      vehicleTitle: '',
      vin: '',
      customVehicle: data
    }));
    navigate(Pages.DrivenOrParked);
  };

  return (
    <>
      <Typography variant='h5Medium'>
        What's the year, make, and model of the vehicle?
      </Typography>
      <Form onSubmit={handleSubmit}>
        <TextField
          validator={yearValidator}
          name='year'
          id='year'
          label='Year'
          helperText='yyyy'
          defaultValue={appState.vehicleInIncident?.customVehicle?.year}
          style={{ width: '50%' }}
        />
        <TextField
          fullWidth
          for='any-text'
          name='make'
          id='make'
          label='Make'
          // @ts-ignore
          validator={makeValidator}
          defaultValue={appState.vehicleInIncident?.customVehicle?.make}
        />
        <TextField
          fullWidth
          for='any-text'
          name='model'
          id='model'
          label='Model'
          //@ts-ignore
          validator={modelValidator}
          defaultValue={appState.vehicleInIncident?.customVehicle?.model}
        />
        <ButtonGroup>
          <Button fullWidth type='submit' variant='contained' id='next-button' label='Next' />
        </ButtonGroup>
      </Form>
    </>
  );
};
