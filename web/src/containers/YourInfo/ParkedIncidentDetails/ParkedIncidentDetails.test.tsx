import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { findByRole, findByText, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as scl from '@ace-clublabs/shared-component-library';
import { CarKineticStatus, LossCause } from '@lib/types';
import { ParkedIncidentDetails } from './ParkedIncidentDetails';
import { ACTION_TYPE } from '../../../store/actions';
import { useTaggingSpy } from '../../../test/setup';
import { getById } from '../../../utils/test-utils';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

const mockAppState = {
  incidentDescription: undefined,
  claimNumber: 'some-claim-number',
  carStatus: CarKineticStatus.BeingDriven,
  statusVehicleWhileDriven: {
    code: LossCause.ANIMALCOLLISION
  }
};
vi.mock('react-router');
describe('ParkedIncidentDetails', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    {
      vi.clearAllMocks();
    }
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <ParkedIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });
  it('should enable button when any option is selected', async () => {
    const { findByRole: findByRoleContainer, container } = render(
      <BrowserRouter basename='/'>
        <ParkedIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(1, {
      type: ACTION_TYPE.SET_LOSS_CAUSE,
      payload: 'parkedunoccupied'
    });
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(2, {
      type: ACTION_TYPE.SET_PREVIOUS_PAGE,
      payload: '/driven-or-parked'
    });

    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const options = await findByRole(container.parentElement!, 'dialog');
    const hitByAnotherVehicleOption = await findByText(options, 'Hit by another vehicle');
    await user.click(hitByAnotherVehicleOption);
    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: ACTION_TYPE.SET_LOSS_CAUSE,
      payload: 'parkedunoccupied'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(2, {
      type: ACTION_TYPE.SET_VEHICLE_PARKED_STATUS,
      payload: {
        code: 'parkedunoccupied',
        description: 'Hit by another vehicle'
      }
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(3, {
      type: ACTION_TYPE.RESET_VEHICLE_WEATHER_DAMAGE,
      payload: undefined
    });
    expect(mockedUseNavigate).toBeCalledWith('/driver');
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <ParkedIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('Should show weather event section and keep Next disabled until weather event selected when Damaged by weather', async () => {
    const { findByRole: findByRoleContainer, container } = render(
      <BrowserRouter basename='/'>
        <ParkedIncidentDetails />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const dialog = await findByRole(container.parentElement!, 'dialog');
    const damagedByWeatherOption = await within(dialog).findByText('Damaged by weather');
    await user.click(damagedByWeatherOption);
    // Weather section appears immediately; Next stays disabled until weather event is selected
    const windRadio = await screen.findByText('Wind');
    await user.click(windRadio);
    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: ACTION_TYPE.SET_LOSS_CAUSE,
      payload: 'weatherrelatedcomp'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(2, {
      type: ACTION_TYPE.SET_VEHICLE_PARKED_STATUS,
      payload: {
        code: 'weatherrelatedcomp',
        description: 'Damaged by weather'
      }
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        type: ACTION_TYPE.SET_VEHICLE_WEATHER_DAMAGE,
        payload: expect.objectContaining({ code: 'windcomp', description: 'Wind' })
      })
    );
    expect(mockedUseNavigate).toBeCalledWith('/driver');
  });
});
