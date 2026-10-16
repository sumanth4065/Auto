import { ThemeProvider } from '@ace-clublabs/shared-component-library';
import { VehicleTowed } from './VehicleTowed';
import * as scl from '@ace-clublabs/shared-component-library';
import { render } from '@testing-library/react';
import { describe, beforeEach, afterEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import { getById } from '../../../utils/test-utils';
import { CarKineticStatus, LossCause } from '@lib/types';
import { useTaggingSpy } from '../../../test/setup';

const mockAppState = {
  claimNumber: 'some-claim-number',
  carStatus: CarKineticStatus.BeingDriven,
  statusVehicleWhileDriven: {
    code: LossCause.ANIMALCOLLISION
  }
};
vi.mock('react-router');
describe('VehicleTowed', () => {
  const mockedDispatch = vi.fn();
  const mockedUseNavigate = vi.fn();
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    {
      vi.resetAllMocks();
    }
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <VehicleTowed />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should set previous page to /what-happened', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <VehicleTowed />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(mockedDispatch).not.toHaveBeenNthCalledWith(1, {
      type: 'RESET_PREVIOUS_PAGE',
      payload: undefined
    });
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(2, {
      type: 'SET_PREVIOUS_PAGE',
      payload: '/what-happened'
    });
  });

  it('Should send expected data to store when user selects yes', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <VehicleTowed />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();

    const yesButton = getById(container, 'yes-button');
    await user.click(yesButton!);
    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/vehicledamage');
    //React.Strict mode unmounts component
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(1, {
      type: 'RESET_PREVIOUS_PAGE',
      payload: undefined
    });
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(2, {
      type: 'SET_PREVIOUS_PAGE',
      payload: '/what-happened'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SET_VEHICLE_TOWED',
      payload: 'yes'
    });
  });
  it('Should send expected data to store when user selects no', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <VehicleTowed />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();

    const noButton = getById(container, 'no-button');
    await user.click(noButton!);
    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/vehicledamage');
    //React.Strict mode unmounts component
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(1, {
      type: 'RESET_PREVIOUS_PAGE',
      payload: undefined
    });
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(2, {
      type: 'SET_PREVIOUS_PAGE',
      payload: '/what-happened'
    });
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SET_VEHICLE_TOWED',
      payload: 'no'
    });
  });
  it('Should redirect to /other-party-intro if I dont know button is selected', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <VehicleTowed />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const user = userEvent.setup();
    const dontKnowButton = getById(container, 'dontKnown-button');
    await user.click(dontKnowButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/vehicledamage');
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SET_VEHICLE_TOWED',
      payload: 'unknown'
    });
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <VehicleTowed />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });
});
