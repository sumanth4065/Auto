import { useNavigate, useOutletContext } from 'react-router';
import { useState } from 'react';
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
  useSelectValidator,
  useRadioGroupValidator
} from '@ace-clublabs/shared-component-library';
import {
  parkIncidentOptions,
  IIncidentDetailsOptions,
  IWeatherDamageOptions,
  LossCause
} from '@lib/types';

const PARK_WEATHER_EVENT_OPTIONS: IWeatherDamageOptions[] = [
  { code: LossCause.WINDCOMP, description: 'Wind' },
  { code: LossCause.HAILCOMP, description: 'Hail' },
  { code: LossCause.FLOODCOMP, description: 'Flood/water' }
];

import { useTagging } from '../../../hooks';
import { Pages } from '../../../shared/pages';
import { resetWeatherDamage, setLossCause, setVehicleParkedStatus, setWeatherDamage } from '../../../store/actions';
import { State } from '../../../store/reducer';

function findOptionByCode(code: string | undefined): IIncidentDetailsOptions | undefined {
  if (!code) return undefined;
  return parkIncidentOptions.find(o => o.code === code);
}

function updateIncidentState(
  option: IIncidentDetailsOptions | undefined,
  setSelectedIncident: (v: IIncidentDetailsOptions | undefined) => void,
  setSelectedWeatherDescription: (v: string | undefined) => void,
  setShowWeatherStep: (v: boolean) => void
) {
  setSelectedIncident(option ?? undefined);
  if (option?.code !== LossCause.WEATHERRELATEDCOMP) {
    setSelectedWeatherDescription(undefined);
    setShowWeatherStep(false);
  }
}

export const ParkedIncidentDetails = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState<IIncidentDetailsOptions | undefined>(
    appState.statusVehicleWhileParked
  );
  const [showWeatherStep, setShowWeatherStep] = useState(false);
  const [pendingParkedIncident, setPendingParkedIncident] = useState<IIncidentDetailsOptions | undefined>();
  const [selectedWeatherDescription, setSelectedWeatherDescription] = useState<string | undefined>(
    appState?.vehicleDamageWeather?.description
  );

  useTagging();

  const isWeatherSelected =
    selectedIncident?.code === LossCause.WEATHERRELATEDCOMP || showWeatherStep;
  const hasIncidentSelection = !!(selectedIncident ?? pendingParkedIncident);
  const canProceed =
    hasIncidentSelection && (!isWeatherSelected || !!selectedWeatherDescription);

  const navigateTo = (parkedVehicleInIncident: IIncidentDetailsOptions, weatherEvent?: IWeatherDamageOptions) => {
    dispatch(setLossCause(parkedVehicleInIncident.code));
    dispatch(setVehicleParkedStatus(parkedVehicleInIncident));
    if (parkedVehicleInIncident.code === LossCause.WEATHERRELATEDCOMP && weatherEvent) {
      dispatch(setWeatherDamage(weatherEvent));
      navigate(Pages.WhoWasDriving);
    } else {
      dispatch(resetWeatherDamage());
      navigate(Pages.WhoWasDriving);
    }
  };

  const handleSubmit = (data: {
    parkedVehicleInIncident: IIncidentDetailsOptions | string;
    weatherEvent?: IWeatherDamageOptions | string;
  }) => {
    const { parkedVehicleInIncident: rawIncident, weatherEvent } = data;
    const parkedVehicleInIncident =
      typeof rawIncident === 'string' ? findOptionByCode(rawIncident) : rawIncident;
    if (!parkedVehicleInIncident) return;
    const incident = showWeatherStep ? pendingParkedIncident! : selectedIncident ?? parkedVehicleInIncident;
    if (incident?.code === LossCause.WEATHERRELATEDCOMP) {
      const weatherOption = PARK_WEATHER_EVENT_OPTIONS.find(
        o => o.description === (selectedWeatherDescription ?? (typeof weatherEvent === 'object' ? weatherEvent?.description : weatherEvent))
      );
      if (weatherOption) {
        navigateTo(incident, weatherOption);
        return;
      }
      if (!showWeatherStep) {
        setPendingParkedIncident(parkedVehicleInIncident);
        setShowWeatherStep(true);
      }
      return;
    }
    navigateTo(parkedVehicleInIncident);
  };

  return (
    <>
      <Typography variant='h5Medium'>What happened to the vehicle while it was parked?</Typography>
      <Form
        sx={{
          marginTop: '0'
        }}
        /* @ts-ignore */
        onSubmit={handleSubmit}>
        <Select<string>
          id='select-vehicle'
          value={showWeatherStep ? pendingParkedIncident?.code : selectedIncident?.code}
          label='Incident type'
          //@ts-ignore
          placeholder='Select one'
          fullWidth
          validator={useSelectValidator()}
          name='parkedVehicleInIncident'
          getDisplayText={code => findOptionByCode(code)?.description ?? ''}
          onChange={(e, value) => {
            const codeFromArgs = (value as string) ?? (e?.target as HTMLInputElement & { value?: string })?.value;
            const applyOption = (option: IIncidentDetailsOptions) => {
              setTimeout(() => {
                updateIncidentState(
                  option,
                  setSelectedIncident,
                  setSelectedWeatherDescription,
                  setShowWeatherStep
                );
              }, 0);
            };
            const optionFromArgs = findOptionByCode(codeFromArgs);
            if (optionFromArgs) {
              applyOption(optionFromArgs);
              return;
            }
          }}>
          {parkIncidentOptions.map((option, index) => (
            <MenuItem key={index} value={option.code}>
              {option.description}
            </MenuItem>
          ))}
        </Select>

        {isWeatherSelected && (
          <div style={{ marginTop: '1.5rem' }}>
            <Typography variant='body1' sx={{ marginBottom: '0.75rem' }}>
              What was the weather event?
            </Typography>
            <RadioGroup
              fullWidth
              name='weatherEvent'
              label='Select one'
              validator={useRadioGroupValidator()}
              value={selectedWeatherDescription}
              onChange={(_e, value) => setSelectedWeatherDescription(typeof value === 'string' ? value : (value as IWeatherDamageOptions)?.description)}>
              {PARK_WEATHER_EVENT_OPTIONS.map((option, index) => (
                <Radio
                  key={index}
                  value={option.description}
                  label={<RadioTypography variant='primary'>{option.description}</RadioTypography>}
                />
              ))}
            </RadioGroup>
          </div>
        )}

        <ButtonGroup>
          <Button
            type='submit'
            fullWidth
            variant='contained'
            id='next-button'
            label='Next'
            disabled={!canProceed}
          />
        </ButtonGroup>
      </Form>
    </>
  );
};
