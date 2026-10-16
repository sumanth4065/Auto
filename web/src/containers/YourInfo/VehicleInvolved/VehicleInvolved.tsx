import { useNavigate, useOutletContext } from 'react-router';
import {
  Box,
  Button,
  Form,
  MenuItem,
  MenuItemTypography,
  Select,
  Typography,
  useSelectValidator
} from '@ace-clublabs/shared-component-library';
import { Features } from '@ace-clublabs/feature-flags';
import { IVehicleOption, KnockoutReason } from '@lib/types';
import { useTagging } from '../../../hooks';
import { Pages } from '../../../shared/pages';
import { setKnockoutReason, setVehicleInvolvedInIncident } from '../../../store/actions';
import { State } from '../../../store/reducer';
import { isVehicleNotListedSelection, VEHICLE_NOT_LISTED_OPTION } from '../../../utils';
import { VehicleNotListedOption } from '../../../types';

type VehicleSelectValue = IVehicleOption | VehicleNotListedOption;

interface IFormData {
  vehicleInIncident: VehicleSelectValue;
}

const navigation = {
  prevPage: undefined,
  nextPage: Pages.DrivenOrParked,
  customVehicle: Pages.CustomVehicle
};

export const VehicleInvolvedPage = () => {
  const navigate = useNavigate();
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  useTagging();

  const onVehicleNotListed = () => {
    if (appState.autoEFNOLFeatureFlags?.[Features.AutoEFNOLCustomVehicle]) {
      navigate(navigation.customVehicle);
    } else {
      dispatch(setKnockoutReason(KnockoutReason.VehicleNotListed));
      navigate(Pages.Knockout);
    }
  };

  const navigateTo = (vehicleInIncident: VehicleSelectValue) => {
    if (isVehicleNotListedSelection(vehicleInIncident)) {
      onVehicleNotListed();
      return;
    }

    dispatch(setVehicleInvolvedInIncident({ ...vehicleInIncident, customVehicle: undefined }));
    navigate(navigation.nextPage);
  };

  const findCurrentOption = (inputOption: IVehicleOption) => {
    if (appState.vehicleInIncident) {
      // v2 API uses RUNumber instead of vehicleId
      if (appState.vehicleInIncident.RUNumber) {
        return inputOption.RUNumber === appState.vehicleInIncident.RUNumber;
      }
      return inputOption.vehicleId === appState.vehicleInIncident.vehicleId;
    }
  };
  return (
    <>
      <Typography variant='h5Medium'>Which vehicle was involved in the incident?</Typography>
      <article
        style={{
          margin: '1.5rem 0'
        }}>
        <Form
          /* @ts-ignore */
          onSubmit={(data: IFormData) => {
            navigateTo(data.vehicleInIncident);
          }}>
          <Box
            sx={{
              marginTop: '1rem',
              marginBottom: '2.25rem'
            }}>
            <Select<VehicleSelectValue>
              id='select-vehicle'
              label='Select Vehicle'
              //@ts-ignore
              placeholder='Select one'
              fullWidth
              validator={useSelectValidator()}
              defaultValue={appState.vehicleOptions?.find(findCurrentOption) ?? undefined}
              name='vehicleInIncident'
              getDisplayText={vehicle =>
                isVehicleNotListedSelection(vehicle) ? 'Vehicle not listed' : vehicle.vehicleTitle
              }>
              {appState.vehicleOptions?.map((vehicle, index) => (
                <MenuItem key={index} value={vehicle as any}>
                  <MenuItemTypography
                    variant={
                      appState.vehicleInIncident?.vehicleTitle === vehicle.vehicleTitle
                        ? 'action'
                        : 'secondary'
                    }>
                    {vehicle.vehicleTitle}
                  </MenuItemTypography>
                  <MenuItemTypography variant='secondary'>
                    {`VIN: ${vehicle.vin}`}
                  </MenuItemTypography>
                </MenuItem>
              ))}
              <MenuItem
                isAction
                onClick={onVehicleNotListed}
                value={VEHICLE_NOT_LISTED_OPTION as any}
                sx={{ backgroundColor: '#FAF8F4' }}>
                <MenuItemTypography variant='action'>Vehicle not listed</MenuItemTypography>
              </MenuItem>
            </Select>
          </Box>
          <Button type='submit' fullWidth variant='contained' id='next-button' label='Next' />
        </Form>
      </article>
    </>
  );
};
