import { useState } from 'react';
import type { Dispatch } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import {
  Button,
  ButtonGroup,
  Form,
  MenuItem,
  Radio,
  RadioGroup,
  RadioTypography,
  Select,
  Typography,
  useRadioGroupValidator,
  useSelectValidator
} from '@ace-clublabs/shared-component-library';
import {
  IAccidentDetailsOptions,
  LossCause,
  drivenIncidentOptions,
  accidentDetailsDrivenOptions,
  drivenWeatherDamageOptions
} from '@lib/types';
import { Pages } from '../../../shared/pages';
import { State } from '../../../store/reducer';
import {
  Actions,
  resetAccidentDetailsWhileDriven,
  resetWeatherDamage,
  setAccidentDetailsWhileDriven,
  setLossCause,
  setVehicleDrivenStatus,
  setWeatherDamage
} from '../../../store/actions';
import { useTagging } from '../../../hooks';

const getWeatherDamageOption = (weatherEventCode?: LossCause) =>
  drivenWeatherDamageOptions.find(option => option.code === weatherEventCode);

const getDrivenIncidentOption = (incidentCode?: LossCause) =>
  drivenIncidentOptions.find(option => option.code === incidentCode);

const getAccidentDetailsOption = (accidentDetailsCode?: LossCause) =>
  accidentDetailsDrivenOptions.find(option => option.code === accidentDetailsCode);

interface DrivenIncidentFormData {
  drivenVehicleInIncident: LossCause;
  weatherEvent?: LossCause;
  accidentDetailsWhileDriven?: LossCause;
}

export const DrivenIncidentDetails = () => {
  const [appState, dispatch] = useOutletContext<[State, Dispatch<Actions>]>();
  const navigate = useNavigate();
  const [selectedIncidentCode, setSelectedIncidentCode] = useState<LossCause | undefined>(
    appState.statusVehicleWhileDriven?.code
  );
  const isImpactWithAnotherVehicleSelected =
    selectedIncidentCode === LossCause.IMPACTEDWITHANOTHERVEHICLE;
  const isWeatherIncidentSelected = selectedIncidentCode === LossCause.WEATHERRELATEDCOMP;

  const weatherEventValidator = useRadioGroupValidator({
    required: isWeatherIncidentSelected
  });
  const accidentDetailsValidator = useSelectValidator({
    required: isImpactWithAnotherVehicleSelected
  });
  const selectValidator = useSelectValidator();

  useTagging();

  const navigateTo = (
    drivenVehicleInIncident: LossCause,
    weatherEventCode?: LossCause,
    accidentDetailsWhileDriven?: LossCause
  ) => {
    const drivenVehicleInIncidentOption = getDrivenIncidentOption(drivenVehicleInIncident);

    if (!drivenVehicleInIncidentOption) {
      return;
    }
    dispatch(setLossCause(drivenVehicleInIncident));
    dispatch(setVehicleDrivenStatus(drivenVehicleInIncidentOption));

    if (isImpactWithAnotherVehicleSelected) {
      if (accidentDetailsWhileDriven) {
        const accidentDetailsOption = getAccidentDetailsOption(accidentDetailsWhileDriven);

        dispatch(setLossCause(accidentDetailsWhileDriven));
        dispatch(setAccidentDetailsWhileDriven(accidentDetailsOption!));
      } else {
        return;
      }

      dispatch(resetWeatherDamage());
      navigate(Pages.WhoWasDriving);
    } else if (isWeatherIncidentSelected) {
      const weatherDamageOption = getWeatherDamageOption(weatherEventCode);
      if (weatherDamageOption) {
        dispatch(setLossCause(weatherEventCode!));
        dispatch(setWeatherDamage(weatherDamageOption));
      } else {
        dispatch(resetWeatherDamage());
      }

      dispatch(resetAccidentDetailsWhileDriven());
    } else {
      dispatch(resetAccidentDetailsWhileDriven());
      dispatch(resetWeatherDamage());
    }

    navigate(Pages.WhoWasDriving);
  };
  const handleSubmit = (data: DrivenIncidentFormData) => {
    navigateTo(data.drivenVehicleInIncident, data.weatherEvent, data.accidentDetailsWhileDriven);
  };

  return (
    <div>
      <Typography variant='h5Medium'>
        What happened to the vehicle while it was being driven?
      </Typography>
      <Form
        key={isImpactWithAnotherVehicleSelected ? 'with-accident-details' : 'incident-only'}
        sx={{
          marginTop: '1rem'
        }}
        onSubmit={handleSubmit}>
        <Select<LossCause>
          defaultValue={selectedIncidentCode ?? appState.statusVehicleWhileDriven?.code}
          id='drivenVehicleInIncident'
          label='Incident type'
          placeholder='Select one'
          fullWidth
          validator={selectValidator}
          name='drivenVehicleInIncident'
          onChange={event => {
            const selectedIncident = event.target.value as LossCause;
            setSelectedIncidentCode(selectedIncident);
          }}
          getDisplayText={incidentCode => getDrivenIncidentOption(incidentCode)?.description ?? ''}
          sx={{
            marginBottom: '1rem'
          }}>
          {drivenIncidentOptions.map(option => (
            <MenuItem key={option.code} value={option.code}>
              {option.description}
            </MenuItem>
          ))}
        </Select>

        {isImpactWithAnotherVehicleSelected && (
          <Select<LossCause>
            defaultValue={appState.accidentDetailsWhileDriven?.code}
            id='accidentDetailsWhileDriven'
            label='Accident details'
            placeholder='Select one'
            fullWidth
            validator={accidentDetailsValidator}
            name='accidentDetailsWhileDriven'
            getDisplayText={accidentDetailsCode =>
              getAccidentDetailsOption(accidentDetailsCode)?.description ?? ''
            }
            required={isImpactWithAnotherVehicleSelected}>
            {accidentDetailsDrivenOptions.map(option => (
              <MenuItem key={option.code} value={option.code}>
                {option.description}
              </MenuItem>
            ))}
          </Select>
        )}
        {isWeatherIncidentSelected && (
          <>
            <Typography variant='h6Medium' sx={{ marginTop: '1.5rem' }}>
              What was the weather event?
            </Typography>
            <RadioGroup
              fullWidth
              label='Select one'
              name='weatherEvent'
              defaultValue={appState.vehicleDamageWeather?.code}
              validator={weatherEventValidator}>
              {drivenWeatherDamageOptions.map(option => (
                <Radio
                  key={option.code}
                  id={`weather-event-${option.code}`}
                  value={option.code}
                  label={<RadioTypography variant='primary'>{option.description}</RadioTypography>}
                />
              ))}
            </RadioGroup>
          </>
        )}

        <ButtonGroup>
          <Button type='submit' fullWidth variant='contained' id='next-button' label='Next' />
        </ButtonGroup>
      </Form>
    </div>
  );
};
