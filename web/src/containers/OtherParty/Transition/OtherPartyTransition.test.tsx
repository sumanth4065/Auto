import * as scl from '@ace-clublabs/shared-component-library';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { OtherPartyTransition } from './OtherPartyTransition';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import { getById } from '../../../utils/test-utils';
import { VehicleCount } from '@ace-clublabs/iss-common-auto-efnol-models';
import { CarKineticStatus, LossCause } from '@lib/types';
import { useTaggingSpy } from '../../../test/setup';

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
describe('OtherPartyTransition', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <OtherPartyTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should redirect to "What\'s the year, make and model of the other party\'s car?" page if Next button is clicked and numberOfVehiclesInvolved is 1', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      { numberOfVehiclesInvolved: VehicleCount.One },
      mockedDispatch
    ]);
    const result = render(
      <BrowserRouter basename='/'>
        <OtherPartyTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();
    const nextButton = getById(result.container, 'next-button');
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/yearmakemodel');
  });

  it('should redirect to "Were any pedestrians or cyclists involved in the incident?" page if Next button is clicked and numberOfVehiclesInvolved is none', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      { numberOfVehiclesInvolved: VehicleCount.None },
      mockedDispatch
    ]);
    const result = render(
      <BrowserRouter basename='/'>
        <OtherPartyTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();
    const nextButton = getById(result.container, 'next-button');
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/additional-details-transition');
  });

  it('should redirect to "Were any pedestrians or cyclists involved in the incident?" page if Next button is clicked and numberOfVehiclesInvolved is two or more', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      { numberOfVehiclesInvolved: VehicleCount.TwoOrMore },
      mockedDispatch
    ]);
    const result = render(
      <BrowserRouter basename='/'>
        <OtherPartyTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();
    const nextButton = getById(result.container, 'next-button');
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/additional-details-transition');
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <OtherPartyTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });
});
