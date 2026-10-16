import { vi, describe, it, expect } from 'vitest';
import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import * as scl from '@ace-clublabs/shared-component-library';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getById } from '../../../utils/test-utils';
import { ACTION_TYPE } from '../../../store/actions';
import { OtherPartyDriverInformation } from './DriverInformation';
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
describe('OtherPartyDriverInformation', () => {
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
        <OtherPartyDriverInformation />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result.getByText('Tell us about the other driver')).toBeVisible();
    expect(result).toMatchSnapshot();
  });

  it('Should enables next button when first name and last name are typed by user', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyDriverInformation />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const firstNameInput = getByLabelText('First name');
    const lastNameInput = getByLabelText('Last name');
    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();
    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    expect(nextButton).toBeEnabled();
  });

  it('Should navigate to OtherPartyInjured and set First Name and Last Name to the OtherPartyDriverInformation when Next button is clicked', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyDriverInformation />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const firstNameInput = getByLabelText('First name');
    const lastNameInput = getByLabelText('Last name');
    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();
    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    const mobileNumberInput = getByLabelText('Mobile number (optional)');
    await user.type(mobileNumberInput, '3333333333');

    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/otherpartypassengers');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: ACTION_TYPE.SET_OTHER_PARTY_DRIVER_INFORMATION,
      payload: {
        otherPartyDriverFirstName: 'John',
        otherPartyDriverLastName: 'Doe',
        otherPartyDriverMobileNumber: '3333333333'
      }
    });
  });

  it('Should navigate to OtherPartyInjured when I dont know button is clicked', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <OtherPartyDriverInformation />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const user = userEvent.setup();
    const nextButton = getById(container, 'next-button');
    const unknownButton = getById(container, 'unknown-button');
    expect(nextButton).toBeDisabled();
    await user.click(unknownButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/otherpartypassengers');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: ACTION_TYPE.SET_OTHER_PARTY_DRIVER_INFORMATION,
      payload: {
        otherPartyDriverFirstName: 'unknown',
        otherPartyDriverLastName: 'unknown',
        otherPartyDriverMobileNumber: ''
      }
    });
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <OtherPartyDriverInformation />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('should check if the PII is block to QM', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyDriverInformation />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const firstNameInput = getByLabelText('First name').parentElement?.parentElement;
    const lastNameInput = getByLabelText('Last name').parentElement?.parentElement;
    const mobilePhoneInput = getByLabelText('Mobile number (optional)').parentElement
      ?.parentElement;

    expect(firstNameInput).toHaveAttribute('data-qm-block', 'true');
    expect(lastNameInput).toHaveAttribute('data-qm-block', 'true');
    expect(mobilePhoneInput).toHaveAttribute('data-qm-block', 'true');
  });

  it('should enforce maxlength of 30 on first name and last name inputs', () => {
    const { getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyDriverInformation />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByLabelText('First name')).toHaveAttribute('maxlength', '30');
    expect(getByLabelText('Last name')).toHaveAttribute('maxlength', '30');
  });
});
