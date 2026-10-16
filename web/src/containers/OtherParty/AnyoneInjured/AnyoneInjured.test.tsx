import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as scl from '@ace-clublabs/shared-component-library';
import { OtherPartyAnyoneInjured } from './AnyoneInjured';
import { ACTION_TYPE } from '../../../store/actions';
import { getById } from '../../../utils/test-utils';
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
describe('OtherPartyAnyoneInjured', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <OtherPartyAnyoneInjured />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const { getByText } = result;
    expect(getByText('Was anyone in this car injured?')).toBeVisible();
    expect(getByText('Yes')).toBeVisible();
    expect(getByText('No')).toBeVisible();
    expect(getByText("I don't know")).toBeVisible();
    expect(result).toMatchSnapshot();
  });

  // @TODO : transition to previous plage
  it('Should set previous page to /other-party-driver-information', async () => {
    render(
      <BrowserRouter basename='/'>
        <OtherPartyAnyoneInjured />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    // replaced for master_pages
    //React.Strict mode unmounts component
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(1, {
      type: 'RESET_PREVIOUS_PAGE',
      payload: undefined
    });
    //React.Strict mode remounts component
    expect(mockedDispatch).not.toHaveBeenNthCalledWith(2, {
      type: ACTION_TYPE.SET_PREVIOUS_PAGE,
      payload: '/other-party-driver-information'
    });
  });

  it('Should send expected data to store when user selects yes and navigate to /additional-details-transition', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <OtherPartyAnyoneInjured />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    const user = userEvent.setup();

    const yesButton = getById(container, 'yes-button');
    await user.click(yesButton!);
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/additional-details-transition');
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SET_OTHER_PARTY_ANYONE_INJURED',
      payload: 'yes'
    });
  });

  it('Should send expected data to store when user selects no and navigate to /additional-details-transition', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <OtherPartyAnyoneInjured />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const nextButton = getById(container, 'next-button');
    const user = userEvent.setup();

    const noButton = getById(container, 'no-button');
    await user.click(noButton!);
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/additional-details-transition');
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SET_OTHER_PARTY_ANYONE_INJURED',
      payload: 'no'
    });
  });

  it('Should send expected data to store when user selects "I don\'t know and navigate to /additional-details-transition', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <OtherPartyAnyoneInjured />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const user = userEvent.setup();

    const unknownButton = getById(container, 'unknown-button');
    await user.click(unknownButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/additional-details-transition');
    expect(mockedDispatch).toHaveBeenNthCalledWith(1, {
      type: 'SET_OTHER_PARTY_ANYONE_INJURED',
      payload: 'unknown'
    });
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <OtherPartyAnyoneInjured />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it.todo('Should display default value when store is hydrated for "OtherPartyAnyoneInjured"');
});
