import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { findByRole, findByText, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as scl from '@ace-clublabs/shared-component-library';
import { CarKineticStatus, LossCause } from '@lib/types';
import { ACTION_TYPE } from '../../../store/actions';
import { useTaggingSpy } from '../../../test/setup';
import { getById } from '../../../utils/test-utils';
import React from 'react';
import { DamageByWeather } from './DamageByWeather';
import { Pages } from '../../../shared/pages';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

const mockAppState = {
  incidentDescription: undefined,
  claimNumber: 'some-claim-number',
  carStatus: CarKineticStatus.BeingDriven,
  statusVehicleWhileDriven: {
    code: LossCause.WEATHERRELATEDCOMP
  }
};
vi.mock('react-router');

describe('DamageByWeather', () => {
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
        <DamageByWeather />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should enable button when any option is selected', async () => {
    const { findByRole: findByRoleContainer, container } = render(
      <BrowserRouter basename='/'>
        <DamageByWeather />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(1, {
      type: ACTION_TYPE.SET_PREVIOUS_PAGE,
      payload: '/drivenwhathappened'
    });

    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const select = await findByRoleContainer('combobox');
    const user = userEvent.setup();
    await user.click(select);
    const options = await findByRole(container.parentElement!, 'dialog');
    const windOption = await findByText(options, 'Wind');
    await user.click(windOption);
    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: ACTION_TYPE.SET_VEHICLE_WEATHER_DAMAGE,
      payload: {
        code: 'windcomp',
        description: 'Wind'
      }
    });
    expect(mockedUseNavigate).toBeCalledWith(Pages.WhoWasDriving);
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <DamageByWeather />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });
});
