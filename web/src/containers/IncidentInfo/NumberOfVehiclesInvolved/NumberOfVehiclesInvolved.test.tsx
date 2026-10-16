import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';

import { render } from '@testing-library/react';
import { getById } from '../../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { NumberOfVehiclesInvolved } from './NumberOfVehiclesInvolved';
import { VehicleCount } from '@ace-clublabs/iss-common-auto-efnol-models';
import { CarKineticStatus, LossCause } from '@lib/types';
import { useTaggingSpy } from '../../../test/setup';
import * as scl from '@ace-clublabs/shared-component-library';

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
describe('NumberOfVehiclesInvolved', () => {
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
        <NumberOfVehiclesInvolved />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(result).toMatchSnapshot();
  });

  describe('No other vehicles were involved button is selected', () => {
    it('should enable Next button and redirect to /additional-details-transition', async () => {
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <NumberOfVehiclesInvolved />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const user = userEvent.setup();
      const nextButton = getById(container, 'next-button');
      expect(nextButton).toBeDisabled();
      const noOtherVehicleOption = getByText('No other vehicles were involved');
      expect(noOtherVehicleOption).toBeVisible();
      await user.click(noOtherVehicleOption);
      expect(nextButton).toBeEnabled();
      await user.click(nextButton!);
      expect(mockedDispatch).toHaveBeenCalledWith({
        type: 'SET_NUMBER_OF_VEHICLES_INVOLVED',
        payload: VehicleCount.None
      });
      expect(mockedUseNavigate).toHaveBeenCalledWith('/additional-details-transition');
    });
  });

  describe('1 vehicle is selected', () => {
    it('should enable Next button and redirect to /otherpartyinformationtransition', async () => {
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <NumberOfVehiclesInvolved />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const user = userEvent.setup();
      const nextButton = getById(container, 'next-button');
      expect(nextButton).toBeDisabled();
      const oneVehicleOption = getByText('1 vehicle');
      expect(oneVehicleOption).toBeVisible();
      await user.click(oneVehicleOption);
      expect(nextButton).toBeEnabled();
      await user.click(nextButton!);
      expect(mockedUseNavigate).toHaveBeenCalledWith('/otherpartyinformationtransition');
      expect(mockedDispatch).toHaveBeenCalledWith({
        type: 'SET_NUMBER_OF_VEHICLES_INVOLVED',
        payload: VehicleCount.One
      });
    });
  });

  describe('2 or more vehicles is selected', () => {
    it('should render a pop up modal disclaimer when two or more vehicle option is selected', async () => {
      const { container, getByText, getByLabelText } = render(
        <BrowserRouter basename='/'>
          <NumberOfVehiclesInvolved />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const user = userEvent.setup();
      const nextButton = getById(container, 'next-button');
      expect(nextButton).toBeDisabled();
      const twoOrMoreVehicleOption = getByText('2 or more');
      expect(twoOrMoreVehicleOption).toBeVisible();
      await user.click(twoOrMoreVehicleOption);

      const modal = getById(container.parentElement!, 'modal-vehicles-involved-disclaimer');
      expect(modal).toBeInTheDocument();

      const okButton = getByText('OK');
      await user.click(okButton);

      expect(mockedUseNavigate).toHaveBeenCalledWith('/additional-details-transition');
      expect(mockedDispatch).toHaveBeenCalledWith({
        type: 'SET_NUMBER_OF_VEHICLES_INVOLVED',
        payload: VehicleCount.TwoOrMore
      });
    });
  });

  describe('Data is pre-filled if information is in the store', () => {
    it('should load all the information if the previous selection was No other vehicles were involved', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          numberOfVehiclesInvolved: VehicleCount.None
        },
        mockedDispatch
      ]);
      const { container, getByLabelText } = render(
        <BrowserRouter basename='/'>
          <NumberOfVehiclesInvolved />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const noVehiclesButton = getById(container, 'no-vehicles');
      expect(noVehiclesButton?.parentElement!).toHaveClass('Mui-checked');
      const nextButton = getById(container, 'next-button');
      expect(nextButton).toBeEnabled();
    });
    it('should load all the information if the previous selection was 1 Vehicle', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          numberOfVehiclesInvolved: VehicleCount.One
        },
        mockedDispatch
      ]);
      const { container } = render(
        <BrowserRouter basename='/'>
          <NumberOfVehiclesInvolved />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const oneVehicleButton = getById(container, 'one-vehicle');
      expect(oneVehicleButton?.parentElement!).toHaveClass('Mui-checked');
      const nextButton = getById(container, 'next-button');
      expect(nextButton).toBeEnabled();
    });

    it('should load all the information if the previous selection was 2 or more', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          numberOfVehiclesInvolved: VehicleCount.TwoOrMore
        },
        mockedDispatch
      ]);
      const { container } = render(
        <BrowserRouter basename='/'>
          <NumberOfVehiclesInvolved />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const twoOrMoreVehicleButton = getById(container, 'two-or-more-vehicles');
      expect(twoOrMoreVehicleButton?.parentElement!).toHaveClass('Mui-checked');
      const nextButton = getById(container, 'next-button');
      expect(nextButton).toBeEnabled();
    });

    it('should trigger fireTag with the expected analytic information', async () => {
      render(
        <BrowserRouter basename='/'>
          <NumberOfVehiclesInvolved />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );

      expect(useTaggingSpy).toHaveBeenCalled();
    });
  });
});
