import * as scl from '@ace-clublabs/shared-component-library';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import { Witness } from './Witness';
import { getById } from '../../../utils/test-utils';
import userEvent from '@testing-library/user-event';
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
describe('Witness', () => {
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
        <Witness />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(result).toMatchSnapshot();
  });

  describe('No is selected', () => {
    it('should enable Next button and redirect to /additionalpropertydamage', async () => {
      const { container, getByText } = render(
        <BrowserRouter basename='/'>
          <Witness />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const user = userEvent.setup();
      const nextButton = getById(container, 'next-button');
      expect(nextButton).toBeDisabled();
      const noOption = getByText('No');
      expect(noOption).toBeVisible();
      await user.click(noOption);
      expect(nextButton).toBeEnabled();
      await user.click(nextButton!);
      expect(mockedUseNavigate).toHaveBeenCalledWith('/additionalpropertydamage');
      expect(mockedDispatch).toHaveBeenCalledWith({
        type: 'SET_WITNESS',
        payload: {
          selection: 'no',
          witnessInformation: undefined
        }
      });
    });

    it('should hide Witnesses information text when No is selected', async () => {
      const { getByText, queryByText } = render(
        <BrowserRouter basename='/'>
          <Witness />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const user = userEvent.setup();
      const noOption = getByText('No');
      await user.click(noOption);
      expect(queryByText('Witnesses information')).not.toBeInTheDocument();
    });
  });

  describe('Yes is selected', () => {
    it('should enable Next button and redirect to /other-party-property-damage', async () => {
      const { container, getByText, getByLabelText } = render(
        <BrowserRouter basename='/'>
          <Witness />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const user = userEvent.setup();
      const nextButton = getById(container, 'next-button');
      expect(nextButton).toBeDisabled();
      const yesOption = getByText('Yes');
      expect(yesOption).toBeVisible();
      await user.click(yesOption);
      expect(nextButton).toBeDisabled();
      const firstNameField = getByLabelText('First name');
      const lastNameField = getByLabelText('Last name');
      const phoneField = getByLabelText('Mobile number (optional)');
      await user.type(firstNameField, 'some-name');
      await user.type(lastNameField, 'some-lastName');
      await user.type(phoneField, '3222222222');

      expect(phoneField).toBeVisible();
      expect(nextButton).toBeEnabled();
      await user.click(nextButton!);
      expect(mockedUseNavigate).toHaveBeenCalledWith('/additionalpropertydamage');
      expect(mockedDispatch).toHaveBeenCalledWith({
        type: 'SET_WITNESS',
        payload: {
          selection: 'yes',
          witnessInformation: {
            firstName: 'Some-name',
            lastName: 'Some-lastName',
            mobilePhone: '3222222222'
          }
        }
      });
    });

    it('should display Witnesses information text when Yes is selected', async () => {
      const { getByText } = render(
        <BrowserRouter basename='/'>
          <Witness />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const user = userEvent.setup();
      const yesOption = getByText('Yes');
      await user.click(yesOption);
      expect(getByText('Witnesses information')).toBeVisible();
    });

    it('should check if the PII is block to QM', async () => {
      const { getByText, getByLabelText } = render(
        <BrowserRouter basename='/'>
          <Witness />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const user = userEvent.setup();
      const yesOption = getByText('Yes');
      expect(yesOption).toBeVisible();
      await user.click(yesOption);
      const firstNameField = getByLabelText('First name').parentElement?.parentElement;
      const lastNameField = getByLabelText('Last name').parentElement?.parentElement;
      const phoneField = getByLabelText('Mobile number (optional)').parentElement?.parentElement;

      expect(firstNameField).toHaveAttribute('data-qm-block', 'true');
      expect(lastNameField).toHaveAttribute('data-qm-block', 'true');
      expect(phoneField).toHaveAttribute('data-qm-block', 'true');
    });
  });

  describe('Data is pre-filled if information is in the store', () => {
    it('should load all the information if the previous selection was Yes', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          witness: {
            selection: 'yes',
            witnessInformation: {
              firstName: 'Some-firstName',
              lastName: 'Some-lastName',
              mobilePhone: '3222222222'
            }
          }
        },
        mockedDispatch
      ]);
      const { container, getByLabelText } = render(
        <BrowserRouter basename='/'>
          <Witness />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const yesButton = getById(container, 'yes-button');
      expect(yesButton?.parentElement!).toHaveClass('Mui-checked');
      const nextButton = getById(container, 'next-button');
      expect(nextButton).toBeEnabled();
      const firstNameField = getByLabelText('First name');
      const lastNameField = getByLabelText('Last name');
      const phoneField = getByLabelText('Mobile number (optional)');
      expect(firstNameField).toHaveValue('Some-firstName');
      expect(lastNameField).toHaveValue('Some-lastName');
      expect(phoneField).toHaveValue('(322) 222-2222');
    });
    it('should load all the information if the previous selection was No', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          witness: {
            selection: 'no',
            witnessInformation: undefined
          }
        },
        mockedDispatch
      ]);
      const { container } = render(
        <BrowserRouter basename='/'>
          <Witness />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const noButton = getById(container, 'no-button');
      expect(noButton?.parentElement!).toHaveClass('Mui-checked');
      const nextButton = getById(container, 'next-button');
      expect(nextButton).toBeEnabled();
    });

    it('should trigger fireTag with the expected analytic information', async () => {
      render(
        <BrowserRouter basename='/'>
          <Witness />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );

      expect(useTaggingSpy).toHaveBeenCalled();
    });
  });

  describe('field length constraints', () => {
    it('should enforce maxlength of 30 on first name and last name when Yes is selected', async () => {
      const { getByText, getByLabelText } = render(
        <BrowserRouter basename='/'>
          <Witness />
        </BrowserRouter>,
        { wrapper: scl.ThemeProvider }
      );
      const user = userEvent.setup();
      await user.click(getByText('Yes'));

      expect(getByLabelText('First name')).toHaveAttribute('maxlength', '30');
      expect(getByLabelText('Last name')).toHaveAttribute('maxlength', '30');
    });
  });
});
