import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import { vi, describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { findByRole, findByText, render, waitFor, within } from '@testing-library/react';
import * as scl from '@ace-clublabs/shared-component-library';
import {
  ClaimType,
  LossCause,
  drivenIncidentOptions,
  accidentDetailsDrivenOptions
} from '@lib/types';
import { DrivenIncidentDetails } from './DrivenIncidentDetails';
import { getById } from '../../../utils/test-utils';
import { ACTION_TYPE } from '../../../store/actions';
import { useTaggingSpy } from '../../../test/setup';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

const mockAppState = {
  incidentDescription: undefined,
  claimNumber: 'some-claim-number',
  claimType: ClaimType.ALL_OTHER_DAMAGE
};
vi.mock('react-router');
describe('DrivenIncidentDetails', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });
  it('should enable button when any option is selected', async () => {
    const { findByRole: findByRoleContainer, container } = render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(mockedDispatch).not.toHaveBeenNthCalledWith(1, {
      type: ACTION_TYPE.SET_LOSS_CAUSE,
      payload: 'animalcomp'
    });

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const dialog = await findByRole(container.parentElement!, 'dialog');
    const impactWithAnimalOption = within(dialog).getByRole('menuitem', {
      name: 'Impact with an animal'
    });
    await user.click(impactWithAnimalOption);

    await waitFor(
      () => {
        expect(nextButton).toBeEnabled();
      },
      { timeout: 3000 }
    );
    await user.click(nextButton!);
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: ACTION_TYPE.SET_LOSS_CAUSE,
      payload: 'animalcomp'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(2, {
      type: ACTION_TYPE.SET_VEHICLE_DRIVEN_STATUS,
      payload: {
        code: 'animalcomp',
        description: 'Impact with an animal'
      }
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(3, {
      type: ACTION_TYPE.RESET_ACCIDENT_DETAILS_WHILE_DRIVEN,
      payload: undefined
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(4, {
      type: ACTION_TYPE.RESET_VEHICLE_WEATHER_DAMAGE,
      payload: undefined
    });
    expect(mockedUseNavigate).toBeCalledWith('/driver');
  });

  it('should render inline weather event options when damage by weather is selected', async () => {
    const {
      findByRole: findByRoleContainer,
      container,
      getByText
    } = render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);

    const options = await findByRole(container.parentElement!, 'dialog');
    const damageByWeatherOption = await findByText(options, 'Damaged by weather');
    await user.click(damageByWeatherOption);

    expect(getByText('What was the weather event?')).toBeVisible();
    expect(getByText('Wind')).toBeVisible();
    expect(getByText('Hail')).toBeVisible();
    expect(getByText('Flood/water')).toBeVisible();
  });

  it('should keep Next disabled when damaged by weather is selected without weather event', async () => {
    const {
      findByRole: findByRoleContainer,
      container,
      getByText
    } = render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);

    const options = await findByRole(container.parentElement!, 'dialog');
    const damageByWeatherOption = await findByText(options, 'Damaged by weather');
    await user.click(damageByWeatherOption);

    expect(getByText('What was the weather event?')).toBeVisible();
    expect(nextButton).toBeDisabled();

    nextButton?.click();

    expect(mockedDispatch).not.toHaveBeenCalled();
    expect(mockedUseNavigate).not.toHaveBeenCalled();
  });

  it('should submit weather event and continue to who was driving page', async () => {
    const { findByRole: findByRoleContainer, container } = render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);

    const options = await findByRole(container.parentElement!, 'dialog');
    const damageByWeatherOption = await findByText(options, 'Damaged by weather');
    await user.click(damageByWeatherOption);

    const windOption = await findByText(container, 'Wind');
    await user.click(windOption);
    await user.click(nextButton!);

    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: ACTION_TYPE.SET_LOSS_CAUSE,
      payload: 'weatherrelatedcomp'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(2, {
      type: ACTION_TYPE.SET_VEHICLE_DRIVEN_STATUS,
      payload: {
        code: 'weatherrelatedcomp',
        description: 'Damaged by weather'
      }
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(3, {
      type: ACTION_TYPE.SET_LOSS_CAUSE,
      payload: 'windcomp'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(4, {
      type: ACTION_TYPE.SET_VEHICLE_WEATHER_DAMAGE,
      payload: {
        code: 'windcomp',
        description: 'Wind'
      }
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(5, {
      type: ACTION_TYPE.RESET_ACCIDENT_DETAILS_WHILE_DRIVEN,
      payload: undefined
    });
    expect(mockedUseNavigate).toBeCalledWith('/driver');
  });

  it('should pre-populate the screen field when app state has the required fields and enable nextButton', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        ...mockAppState,
        statusVehicleWhileDriven: drivenIncidentOptions.find(
          o => o.code === LossCause.IMPACTEDWITHANOTHERVEHICLE
        ),
        accidentDetailsWhileDriven: accidentDetailsDrivenOptions[0]
      },
      mockedDispatch
    ]);

    const { container, getByText } = render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    const selectValue = getByText('Impact with other vehicle(s)');
    expect(selectValue).toBeVisible();
    expect(nextButton).toBeEnabled();
  });

  it('should pre-populate weather event when weather incident was previously selected', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        statusVehicleWhileDriven: {
          code: LossCause.WEATHERRELATEDCOMP,
          description: 'Damaged by weather'
        },
        vehicleDamageWeather: {
          code: LossCause.HAILCOMP,
          description: 'Hail'
        }
      },
      mockedDispatch
    ]);

    const { container, getByText } = render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByText('What was the weather event?')).toBeVisible();
    const hailOption = getById(container, 'weather-event-hailcomp');
    expect(hailOption?.parentElement!).toHaveClass('Mui-checked');
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('should keep Next button disabled when vehicle loss cause is selected without accident details', async () => {
    const { container, findByRole } = render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const select = await findByRole('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const dialog = await findByRole('dialog');
    const impactedWithAnotherVehicleOption = within(dialog).getByRole('menuitem', {
      name: 'Impact with other vehicle(s)'
    });
    await user.click(impactedWithAnotherVehicleOption);

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
  });

  it('should not show accident details section when loss cause is not impacted with another vehicle', async () => {
    const { container, findByRole } = render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const select = await findByRole('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const dialog = await findByRole('dialog');
    const impactWithAnimalOption = within(dialog).getByRole('menuitem', {
      name: 'Impact with an animal'
    });
    await user.click(impactWithAnimalOption);

    const accidentDetailsSection = getById(container, 'accidentDetailsWhileDriven');
    expect(accidentDetailsSection).toBeNull();
  });

  it('should show accident details section when loss cause is impacted with another vehicle', async () => {
    const { container, findByRole } = render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const select = await findByRole('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const dialog = await findByRole('dialog');
    const impactedWithAnotherVehicleOption = within(dialog).getByRole('menuitem', {
      name: 'Impact with other vehicle(s)'
    });
    await user.click(impactedWithAnotherVehicleOption);

    const accidentDetailsSection = getById(container, 'accidentDetailsWhileDriven');
    expect(accidentDetailsSection).toBeVisible();
  });

  it('should dispatch the correct action when accident details are selected', async () => {
    const { container, findByRole } = render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const select = await findByRole('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const dialog = await findByRole('dialog');
    const impactedWithAnotherVehicleOption = within(dialog).getByRole('menuitem', {
      name: 'Impact with other vehicle(s)'
    });
    await user.click(impactedWithAnotherVehicleOption);

    const accidentDetailsSection = getById(container, 'accidentDetailsWhileDriven');
    expect(accidentDetailsSection).toBeVisible();

    const accidentDetailsSelect = accidentDetailsSection?.querySelector('[role="combobox"]');
    await user.click(accidentDetailsSelect as HTMLElement);
    const accidentDetailsDialog = await findByRole('dialog');
    const rearEndOption = within(accidentDetailsDialog).getByRole('menuitem', { name: 'Rear-end' });
    await user.click(rearEndOption);

    const nextButton = getById(container, 'next-button');
    await waitFor(() => expect(nextButton).toBeEnabled(), { timeout: 1000 });
    await user.click(nextButton!);

    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: ACTION_TYPE.SET_LOSS_CAUSE,
      payload: 'impactedwithanothervehicle'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(2, {
      type: ACTION_TYPE.SET_VEHICLE_DRIVEN_STATUS,
      payload: {
        code: 'impactedwithanothervehicle',
        description: 'Impact with other vehicle(s)'
      }
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(3, {
      type: ACTION_TYPE.SET_LOSS_CAUSE,
      payload: 'rearendcoll'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(4, {
      type: ACTION_TYPE.SET_ACCIDENT_DETAILS_WHILE_DRIVEN,
      payload: {
        code: 'rearendcoll',
        description: 'Rear-end'
      }
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(5, {
      type: ACTION_TYPE.RESET_VEHICLE_WEATHER_DAMAGE,
      payload: undefined
    });
  });

  it('should dispatch correct actions when a non-vehicle loss cause option is selected', async () => {
    const { container, findByRole } = render(
      <BrowserRouter basename='/'>
        <DrivenIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const select = await findByRole('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const dialog = await findByRole('dialog');
    const impactedWithAnAnimalOption = within(dialog).getByRole('menuitem', {
      name: 'Impact with an animal'
    });
    await user.click(impactedWithAnAnimalOption);

    const nextButton = getById(container, 'next-button');
    await waitFor(() => expect(nextButton).toBeEnabled(), { timeout: 3000 });
    await user.click(nextButton!);

    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: ACTION_TYPE.SET_LOSS_CAUSE,
      payload: 'animalcomp'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(2, {
      type: ACTION_TYPE.SET_VEHICLE_DRIVEN_STATUS,
      payload: {
        code: 'animalcomp',
        description: 'Impact with an animal'
      }
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(3, {
      type: ACTION_TYPE.RESET_ACCIDENT_DETAILS_WHILE_DRIVEN,
      payload: undefined
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(4, {
      type: ACTION_TYPE.RESET_VEHICLE_WEATHER_DAMAGE,
      payload: undefined
    });
    expect(mockedUseNavigate).toBeCalledWith('/driver');
  });
});
