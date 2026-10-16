import { vi, describe, it, expect } from 'vitest';
import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import * as scl from '@ace-clublabs/shared-component-library';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getById } from '../../../utils/test-utils';
import { OtherPartyInsuranceCompany } from './InsuranceCompany';
import { CarKineticStatus, LossCause, mockPolicyNumber } from '@lib/types';
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
describe('OtherPartyInsuranceCompany', () => {
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
        <OtherPartyInsuranceCompany />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result.getByText("Tell us about the other party's insurance company")).toBeVisible();
    expect(result).toMatchSnapshot();
  });

  it('enables next button when insurance company name is typed by user', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyInsuranceCompany />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const insuranceCompanyNameInput = getByLabelText('Insurance company');
    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();
    await user.type(insuranceCompanyNameInput, 'some-insurance-company-name');
    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/otherpartyvehicledriverinfo');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_OTHER_PARTY_INSURANCE',
      payload: {
        otherPartyInsuranceCompanyName: 'Some-insurance-company-name',
        otherPartyInsurancePolicyNumber: ''
      }
    });
  });
  it('enables next button when insurance company name and insurance company policy number are typed by user', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyInsuranceCompany />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const insuranceCompanyNameInput = getByLabelText('Insurance company');
    const insuranceCompanyPolicyNumberInput = getByLabelText('Policy number(optional)');
    const nextButton = getById(container, 'next-button');
    expect(nextButton).toBeDisabled();
    const user = userEvent.setup();
    await user.type(insuranceCompanyNameInput, 'some-insurance-company-name');
    expect(nextButton).toBeEnabled();
    await user.type(insuranceCompanyPolicyNumberInput, mockPolicyNumber);
    expect(nextButton).toBeEnabled();
    await user.click(nextButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/otherpartyvehicledriverinfo');
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_OTHER_PARTY_INSURANCE',
      payload: {
        otherPartyInsuranceCompanyName: 'Some-insurance-company-name',
        otherPartyInsurancePolicyNumber: mockPolicyNumber
      }
    });
  });
  it('takes the user to next page when "I don\'t know" button is selected', async () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <OtherPartyInsuranceCompany />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const user = userEvent.setup();
    const nextButton = getById(container, 'next-button');
    const unknownButton = getById(container, 'unknown-button');
    expect(nextButton).toBeDisabled();
    await user.click(unknownButton!);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/otherpartyvehicledriverinfo');
    expect(mockedDispatch).toHaveBeenCalledWith({
      payload: undefined,
      type: 'RESET_OTHER_PARTY_INSURANCE'
    });
  });
  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <OtherPartyInsuranceCompany />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });
  it('should check if the PII is block to QM', async () => {
    const { container, getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyInsuranceCompany />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    const insuranceCompanyPolicyNumberInput =
      getByLabelText('Policy number(optional)').parentElement?.parentElement;
    expect(insuranceCompanyPolicyNumberInput).toHaveAttribute('data-qm-block', 'true');
  });
  it.todo(
    'Should display default value when store is hydrated for "otherPartyInsuranceCompanyName" and "otherPartyInsurancePolicyNumber"'
  );

  it('should enforce maxlength of 255 on insurance company name input', () => {
    const { getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyInsuranceCompany />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByLabelText('Insurance company')).toHaveAttribute('maxlength', '255');
  });

  it('should enforce maxlength of 40 on policy number input', () => {
    const { getByLabelText } = render(
      <BrowserRouter basename='/'>
        <OtherPartyInsuranceCompany />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByLabelText('Policy number(optional)')).toHaveAttribute('maxlength', '40');
  });
});
