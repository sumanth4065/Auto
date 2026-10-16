import * as scl from '@ace-clublabs/shared-component-library';
import { vi, describe, it, expect } from 'vitest';
import { getByText, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import { getById } from '../../../utils/test-utils';
import { DrivenOrParked } from './DrivenOrParked';
import { ClaimType } from '@lib/types';
import { useTaggingSpy } from '../../../test/setup';

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();
const mockAppState = {
  claimNumber: 'some-claim-number',
  claimType: ClaimType.ALL_OTHER_DAMAGE
};
vi.mock('react-router');
describe('DrivenOrParked', () => {
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
        <DrivenOrParked />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should enable Next button if "It was being driven" radio button was selected and should navigate to /driven-incident-details?', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <DrivenOrParked />
      </BrowserRouter>
    );

    const continueButton = getById(result.container, 'next-button');
    expect(continueButton).toBeDisabled();
    const user = userEvent.setup();
    const itWasBeingDrivenOption = getByText(result.container, 'It was being driven');
    expect(itWasBeingDrivenOption).toBeVisible();
    await user.click(itWasBeingDrivenOption);
    expect(continueButton).toBeEnabled();
    await user.click(continueButton!);
    expect(mockedUseNavigate).toBeCalledWith('/drivenwhathappened');
    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_CAR_STATUS',
      payload: 'beingDriven'
    });
  });

  it('should enable Next button if "It was parked" radio button was selected and should navigate to /parked-incident-details', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <DrivenOrParked />
      </BrowserRouter>
    );

    const continueButton = getById(result.container, 'next-button');
    expect(continueButton).toBeDisabled();
    const user = userEvent.setup();
    const itWasParkedOption = getByText(result.container, 'It was parked');
    expect(itWasParkedOption).toBeVisible();
    await user.click(itWasParkedOption);
    expect(continueButton).toBeEnabled();
    await user.click(continueButton!);
    expect(mockedUseNavigate).toBeCalledWith('/parkedwhathappened');
    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_CAR_STATUS',
      payload: 'parked'
    });
  });

  it('should dispatch correct actions when "It was parked" radio button is selected', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <DrivenOrParked />
      </BrowserRouter>
    );

    const continueButton = getById(result.container, 'next-button');
    expect(continueButton).toBeDisabled();
    const user = userEvent.setup();
    const itWasParkedOption = getByText(result.container, 'It was parked');
    expect(itWasParkedOption).toBeVisible();
    await user.click(itWasParkedOption);
    expect(continueButton).toBeEnabled();
    await user.click(continueButton!);

    expect(mockedDispatch).toBeCalledWith({
      type: 'RESET_ACCIDENT_DETAILS_WHILE_DRIVEN',
      payload: undefined
    });
    expect(mockedDispatch).toBeCalledWith({
      type: 'RESET_VEHICLE_DRIVEN_STATUS',
      payload: undefined
    });
    expect(mockedDispatch).toBeCalledWith({
      type: 'RESET_VEHICLE_WEATHER_DAMAGE',
      payload: undefined
    });
  });

  describe('Data is pre-filled if information is in the store', () => {
    it('should check "It was being driven" if this one was previously selected', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          carStatus: 'beingDriven'
        },
        mockedDispatch
      ]);
      const { container } = render(
        <BrowserRouter basename='/'>
          <DrivenOrParked />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const drivenOption = getById(container, 'driven-option');
      expect(drivenOption?.parentElement!).toHaveClass('Mui-checked');
      const nextButton = getById(container, 'next-button');
      expect(nextButton).toBeEnabled();
    });
    it('should check "It was parked" if this one was previously selected', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          carStatus: 'parked'
        },
        mockedDispatch
      ]);
      const { container } = render(
        <BrowserRouter basename='/'>
          <DrivenOrParked />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const parkedOption = getById(container, 'parked-option');
      expect(parkedOption?.parentElement!).toHaveClass('Mui-checked');
      const nextButton = getById(container, 'next-button');
      expect(nextButton).toBeEnabled();
    });

    it('should trigger fireTag with the expected analytic information', async () => {
      render(
        <BrowserRouter basename='/'>
          <DrivenOrParked />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );

      expect(useTaggingSpy).toHaveBeenCalled();
    });
  });
});
