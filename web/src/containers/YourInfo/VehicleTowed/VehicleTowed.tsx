import { useNavigate, useOutletContext } from 'react-router';
import { State } from '../../../store/reducer';
import { setVehicleTowed } from '../../../store/actions';
import { Pages } from '../../../shared/pages';
import {
  Button,
  ButtonGroup,
  Form,
  Radio,
  RadioGroup,
  RadioTypography,
  Typography,
  useRadioGroupValidator
} from '@ace-clublabs/shared-component-library';
import { YesNoUnknown } from '@ace-clublabs/iss-common-auto-efnol-models';
import { useTagging } from '../../../hooks';

export const VehicleTowed = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();

  useTagging();

  return (
    <div>
      <Typography variant='h5Medium'>Was the vehicle towed?</Typography>
      <Form
        onSubmit={
          ((data: { vehicleTowed: YesNoUnknown }) => {
            dispatch(setVehicleTowed(data.vehicleTowed));
            navigate(Pages.VehicleDamage);
          }) as any
        }>
        <RadioGroup
          name='vehicleTowed'
          row
          defaultValue={
            appState.vehicleTowed === YesNoUnknown.Unknown ? null : appState.vehicleTowed ?? null
          }
          variant='text'
          fullWidth
          validator={useRadioGroupValidator()}>
          <Radio
            id='yes-button'
            value={YesNoUnknown.Yes}
            label={<RadioTypography>Yes</RadioTypography>}
          />
          <Radio
            id='no-button'
            value={YesNoUnknown.No}
            label={<RadioTypography>No</RadioTypography>}
          />
        </RadioGroup>

        <ButtonGroup>
          <Button id='next-button' type='submit' label='Next' fullWidth />
          <Button
            id='dontKnown-button'
            variant='outlined'
            label="I don't know"
            fullWidth
            onClick={() => {
              dispatch(setVehicleTowed(YesNoUnknown.Unknown));
              navigate(Pages.VehicleDamage);
            }}
          />
        </ButtonGroup>
      </Form>
    </div>
  );
};
