import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router';
import {
  Button,
  ButtonGroup,
  Form,
  MenuItem,
  MenuItemTypography,
  Select,
  Typography,
  useSelectValidator
} from '@ace-clublabs/shared-component-library';
import { IDriverViewModel, KnockoutReason } from '@lib/types';
import { Features } from '@ace-clublabs/feature-flags';
import { Pages } from '../../../shared/pages';
import { ALLOW_LISTED_DRIVER_SELECTION_KEY } from '../../../shared/whoWasDrivingNavigation';
import { setDriver, setDriverNotListedBackNav, setKnockoutReason } from '../../../store/actions';
import { State } from '../../../store/reducer';
import { useTagging } from '../../../hooks';
import { isCustomDriverSelected } from '../../../utils/isCustomDriverSelected';
import { DRIVER_NOT_LISTED_OPTION, isDriverNotListedSelection } from '../../../utils';
import { DriverNotListedOption, IDriverOption } from '../../../types';

type DriverSelectValue = IDriverOption | DriverNotListedOption;

interface IWhoWasDrivingFormData {
  reporter: DriverSelectValue;
}

export const WhoWasDriving = () => {
  const [appState, dispatch] = useOutletContext<[State, Function]>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location?.state;

  useTagging();

  useEffect(() => {
    const allowListedPicker = Boolean(
      locationState &&
      typeof locationState === 'object' &&
      ALLOW_LISTED_DRIVER_SELECTION_KEY in locationState &&
      (locationState as Record<string, boolean>)[ALLOW_LISTED_DRIVER_SELECTION_KEY]
    );
    if (allowListedPicker) {
      return;
    }
    if (!appState.autoEFNOLFeatureFlags?.[Features.AutoEFNOLCustomDriver]) {
      return;
    }
    if (!isCustomDriverSelected(appState.selectedDriver)) {
      return;
    }
    dispatch(setDriverNotListedBackNav(KnockoutReason.DriverNotListed));
    navigate(Pages.CustomDriver, { replace: true });
  }, [
    appState.autoEFNOLFeatureFlags?.[Features.AutoEFNOLCustomDriver],
    appState.selectedDriver,
    dispatch,
    locationState,
    navigate
  ]);
  const options: IDriverOption[] = useMemo(
    () =>
      appState.driverSummaries
        ? appState.driverSummaries.map(value => ({
            fullName: `${value.firstName} ${value.lastName}`,
            id: (value.driverId || value.id)!,
            driver: value
          }))
        : [],
    [appState.driverSummaries]
  );
  function findCurrentOption(inputOption: IDriverOption) {
    if (appState.selectedDriver) {
      return inputOption.driver.driverId === appState.selectedDriver.driverId;
    }
  }

  function handleDriverNotListed() {
    // If a listed driver was previously selected, clear it before going to custom driver flow
    if (
      appState.selectedDriver &&
      (appState.selectedDriver.driverId || (appState.selectedDriver as any).id)
    ) {
      dispatch(setDriver({} as IDriverViewModel));
    }
    if (appState.autoEFNOLFeatureFlags?.[Features.AutoEFNOLCustomDriver]) {
      dispatch(setDriverNotListedBackNav(KnockoutReason.DriverNotListed));
      navigate(Pages.CustomDriver);
    } else {
      dispatch(setKnockoutReason(KnockoutReason.DriverNotListed));
      navigate(Pages.Knockout);
    }
  }

  function navigateTo(reporter: DriverSelectValue) {
    if (isDriverNotListedSelection(reporter)) {
      handleDriverNotListed();
      return;
    }
    dispatch(setDriver({ ...reporter.driver }));
    dispatch(setDriverNotListedBackNav(''));
    navigate(Pages.Passengers);
  }

  return (
    <div>
      <Typography variant='h5Medium'>Who was driving the vehicle?</Typography>
      <Form
        /* @ts-ignore - shared component lib form typing */
        onSubmit={(data: IWhoWasDrivingFormData) => {
          navigateTo(data.reporter);
        }}>
        <Select<DriverSelectValue>
          name='reporter'
          label='Select the driver'
          //@ts-ignore
          placeholder='Select one'
          validator={useSelectValidator()}
          defaultValue={options.find(findCurrentOption) || undefined}
          getDisplayText={selectedValue =>
            isDriverNotListedSelection(selectedValue) ? 'Driver not listed' : selectedValue.fullName
          }
          data-qm-block
          fullWidth>
          {options.map(value => (
            <MenuItem key={value.id} value={value as any} data-qm-block>
              {value.fullName}
            </MenuItem>
          ))}
          <MenuItem
            isAction
            onClick={handleDriverNotListed}
            value={DRIVER_NOT_LISTED_OPTION as any}>
            <MenuItemTypography variant='action'>Driver not listed</MenuItemTypography>
          </MenuItem>
        </Select>
        <ButtonGroup>
          <Button id='next-button' type='submit' label='Next' fullWidth />
        </ButtonGroup>
      </Form>
    </div>
  );
};
