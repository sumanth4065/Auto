import {
  Button,
  Form,
  Radio,
  RadioGroup,
  RadioTypography,
  Typography,
  useRadioGroupValidator
} from '@ace-clublabs/shared-component-library';
import { Pages } from '../../../shared/pages';
import { useNavigate, useOutletContext } from 'react-router';
import { CarKineticStatus } from '@lib/types';
import { State } from '../../../store/reducer';
import {
  resetAccidentDetailsWhileDriven,
  resetVehicleDrivenStatus,
  resetWeatherDamage,
  setCarStatus
} from '../../../store/actions';

import { useTagging } from '../../../hooks';

export const DrivenOrParked = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();

  useTagging();

  const redirectToSpecificIncidentContext = (value: string) => {
    switch (value) {
      case CarKineticStatus.BeingDriven:
        navigate(Pages.DrivenIncidentDetails);
        break;
      case CarKineticStatus.Parked:
        dispatch(resetAccidentDetailsWhileDriven());
        dispatch(resetVehicleDrivenStatus());
        dispatch(resetWeatherDamage());
        navigate(Pages.ParkedIncidentDetails);
        break;
    }
  };

  return (
    <>
      <div>
        <Typography variant='h5Medium'>
          Was someone driving or was the car parked during the incident?
        </Typography>
        <div
          style={{
            margin: '1.5rem 0'
          }}>
          <Form
            /* @ts-ignore */
            onSubmit={(value: { incidentContextSelection: CarKineticStatus }) => {
              redirectToSpecificIncidentContext(value.incidentContextSelection);
              dispatch(setCarStatus(value.incidentContextSelection));
            }}>
            <div
              style={{
                flexDirection: 'column',
                display: 'flex',
                gap: 15
              }}>
              <RadioGroup
                fullWidth
                label='Select one'
                name='incidentContextSelection'
                defaultValue={appState.carStatus}
                validator={useRadioGroupValidator()}>
                <Radio
                  id='driven-option'
                  value={CarKineticStatus.BeingDriven}
                  label={
                    <>
                      <RadioTypography variant='primary'>It was being driven</RadioTypography>
                    </>
                  }
                />
                <Radio
                  id='parked-option'
                  value={CarKineticStatus.Parked}
                  label={
                    <>
                      <RadioTypography variant='primary'>It was parked</RadioTypography>
                    </>
                  }
                />
              </RadioGroup>
              <Button type='submit' fullWidth variant='contained' id='next-button' label='Next' />
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};
