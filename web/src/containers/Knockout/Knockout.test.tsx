import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as scl from '@ace-clublabs/shared-component-library';
import LogCannon from '@ace-clublabs/log-cannon';
import { CarKineticStatus, KnockoutReason, LossCause } from '@lib/types';
import { Knockout } from './Knockout';
import { useTaggingSpy } from '../../test/setup';

const mockedDispatch = vi.fn();
const loggerSpy = vi.spyOn(LogCannon, 'error');

const mockAppState = {
  clubCode: '240',
  incidentDescription: undefined,
  claimNumber: 'some-claim-number',
  carStatus: CarKineticStatus.BeingDriven,
  KnockoutReason: KnockoutReason.DriverNotListed,
  statusVehicleWhileDriven: {
    code: LossCause.ANIMALCOLLISION
  },
  serializedError: {
    errorType: 'api',
    errorLabel: 'APIError',
    errorMessage: 'system error',
    errorCode: undefined
  }
};
vi.mock('react-router');
describe('knockout', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
  });
  it('renders expected content', () => {
    const { getByAltText, getByText } = render(
      <BrowserRouter basename='/'>
        <Knockout />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByAltText('Person using a computer icon')).toBeVisible();
    expect(getByText("Sorry, we're unable to process your claim at this point")).toBeVisible();
    expect(
      getByText(
        'Your claim has not been submitted. We can help you complete this over the phone. To move forward with the claim, please contact us at the phone number below.'
      )
    ).toBeVisible();
    expect(getByText('We are available 24/7')).toBeVisible();
    expect(getByText('Reference number:')).toBeVisible();
    expect(getByText('Call 1-800-672-5246')).toBeVisible();
    expect(loggerSpy).toHaveBeenCalledWith(
      'Knockout',
      expect.objectContaining({
        errorData: {
          errorType: 'api',
          errorLabel: 'APIError',
          errorMessage: 'system error',
          errorCode: undefined
        }
      })
    );
  });

  it('should trigger fireTag with the expected analytic information', async () => {
    render(
      <BrowserRouter basename='/'>
        <Knockout />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('renders WInsurance phone number when brand is WInsurance', () => {
    const wInsuranceState = {
      ...mockAppState,
      brand: 'WInsurance' as const
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      wInsuranceState,
      mockedDispatch
    ]);

    const { getByText, queryByText } = render(
      <BrowserRouter basename='/'>
        <Knockout />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByText('Call 1-888-929-2252')).toBeVisible();
    expect(queryByText('Call 1-800-672-5246')).toBeNull();
  });

  it('renders AAA phone number when brand is AAA (regression)', () => {
    const aaaState = {
      ...mockAppState,
      brand: 'AAA' as const
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [aaaState, mockedDispatch]);

    const { getByText } = render(
      <BrowserRouter basename='/'>
        <Knockout />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByText('Call 1-800-672-5246')).toBeVisible();
  });

  it('does not render hardcoded AAA text for WInsurance brand', () => {
    const wInsuranceState = {
      ...mockAppState,
      brand: 'WInsurance' as const
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      wInsuranceState,
      mockedDispatch
    ]);

    const { container } = render(
      <BrowserRouter basename='/'>
        <Knockout />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    const textContent = container.textContent ?? '';
    expect(textContent).not.toMatch(/\bAAA\b/);
  });

  it('uses serializedError.errorMessage as error when knockoutReason is not set', () => {
    const stateWithSerializedError = {
      ...mockAppState,
      knockoutReason: undefined,
      serializedError: { errorMessage: 'Policy is not allowed to perform this operation' }
    };
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      stateWithSerializedError,
      mockedDispatch
    ]);

    render(
      <BrowserRouter basename='/'>
        <Knockout />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(loggerSpy).toHaveBeenCalledWith(
      'Knockout',
      expect.objectContaining({ error: 'Policy is not allowed to perform this operation' })
    );
  });
});
