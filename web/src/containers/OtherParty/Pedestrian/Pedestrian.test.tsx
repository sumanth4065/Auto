import { vi, describe, it, expect } from 'vitest';
import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import * as scl from '@ace-clublabs/shared-component-library';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getById } from '../../../utils/test-utils';
import { ACTION_TYPE } from '../../../store/actions';
import { OtherPartyPedestrian } from './Pedestrian';
import { CarKineticStatus, LossCause } from '@lib/types';
import { useTaggingSpy } from '../../../test/setup';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();

const mockAppState = {
  claimNumber: 'some-claim-number',
  carStatus: CarKineticStatus.BeingDriven,
  statusVehicleWhileDriven: {
    code: LossCause.ANIMALCOLLISION
  }
};
vi.mock('react-router');
describe('OtherPartyPedestrian', () => {
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
        <OtherPartyPedestrian />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('Should enables next button when any checkbox is selected', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <OtherPartyPedestrian />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const cyclistOption = getById(container, 'cyclist-option');
    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();
    await user.click(cyclistOption!);
    expect(cyclistOption).toBeChecked();
    expect(nextButton).toBeEnabled();
  });

  it('Should navigate to Witness and set cyclist and pedestrian to the global state when Next button is clicked', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyPedestrian />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const cyclistOption = getById(container, 'cyclist-option');
    const pedestrianOption = getById(container, 'pedestrian-option');
    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();
    await user.click(cyclistOption!);
    await user.click(pedestrianOption!);
    expect(nextButton).toBeEnabled();

    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/witnessinfo');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: ACTION_TYPE.SET_OTHER_PARTY_PEDESTRIAN,
      payload: {
        otherPartyPedestriansInvolved: ['pedestrian', 'cyclist']
      }
    });
  });

  it('Should navigate to Witness when "None of the above" is clicked', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <OtherPartyPedestrian />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const user = userEvent.setup();
    const nextButton = getById(container, 'next-button');
    const noneAboveButton = getById(container, 'none-above-button');
    expect(nextButton).toBeDisabled();
    await user.click(noneAboveButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/witnessinfo');
    expect(mockedDispatch).toHaveBeenCalledWith({
      payload: undefined,
      type: ACTION_TYPE.RESET_OTHER_PARTY_PEDESTRIAN
    });
  });

  it('Should navigate to Witness and set cyclist to the global state when Next button is clicked', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyPedestrian />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const cyclistOption = getById(container, 'cyclist-option');
    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();
    await user.click(cyclistOption!);
    expect(nextButton).toBeEnabled();

    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/witnessinfo');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: ACTION_TYPE.SET_OTHER_PARTY_PEDESTRIAN,
      payload: {
        otherPartyPedestriansInvolved: ['cyclist']
      }
    });
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <OtherPartyPedestrian />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });
});
