import { ThemeProvider } from '@ace-clublabs/shared-component-library';
import { LoginFlowType } from '@lib/shared-contracts';
import { ClaimType } from '@lib/types';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, vi } from 'vitest';
import { useTaggingSpy } from '../../../test/setup';
import { getById } from '../../../utils/test-utils';
import { getDefaultInputValues, IncidentInfoContactInfo } from './ContactInformation';

let mockedDispatch = vi.fn();
let mockedUseNavigate = vi.fn();

vi.mock('react-router');
const mockAppState = {
  goToPreviousPage: undefined,
  enableTextCommunication: true,
  claimType: ClaimType.ALL_OTHER_DAMAGE
};
describe('Whats your contact information', () => {
  beforeEach(() => {
    mockedDispatch = vi.fn();
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <IncidentInfoContactInfo />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should check if the PII is block to QM', async () => {
    const { getByLabelText } = render(
      <BrowserRouter basename='/'>
        <IncidentInfoContactInfo />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );
    const user = userEvent.setup();

    const emailField = getByLabelText('Email').parentElement?.parentElement;
    const mobileNumberField = getByLabelText('Mobile number').parentElement?.parentElement;

    expect(emailField).toHaveAttribute('data-qm-block', 'true');
    expect(mobileNumberField).toHaveAttribute('data-qm-block', 'true');
  });

  it('should enforce maxlength of 60 on email input', () => {
    const { getByLabelText } = render(
      <BrowserRouter basename='/'>
        <IncidentInfoContactInfo />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(getByLabelText('Email')).toHaveAttribute('maxlength', '60');
  });

  describe('user actions', async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should set previous page to /who-is-reporting', () => {
      const result = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      //Replaced for master_pages
      expect(mockedDispatch).not.toHaveBeenCalledWith({
        type: 'SET_PREVIOUS_PAGE',
        payload: '/who-is-reporting'
      });
      expect(result.container).toMatchSnapshot();
    });

    it('should pre-populate the screen field when app state has the required fields and enable nextButton', async () => {
      const newmockAppState = Object.assign(
        {},
        {
          ...mockAppState,
          goToPreviousPage: undefined,
          mobileNumber: '3178887777',
          email: 'a@aaa.com',
          enableTextCommunication: false,
          loginFlowType: LoginFlowType.BEHIND_LOGIN
        }
      );
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        newmockAppState,
        mockedDispatch
      ]);

      const { container, getByDisplayValue } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );
      const user = userEvent.setup();
      const nextButton = getById(container, 'next-button');
      await user.click(nextButton!);

      expect(nextButton).toBeEnabled();
      expect(getByDisplayValue('(317) 888-7777')).toBeVisible();
      expect(getByDisplayValue('a@aaa.com')).toBeVisible();
      expect(mockedDispatch).toBeCalledWith({
        type: 'SET_CONTACT_INFO',
        payload: {
          mobileNumber: '3178887777',
          email: 'a@aaa.com',
          enableTextCommunication: false,
          enableEmailCommunication: true
        }
      });
    });

    it('should enable next button when required fields are completed, and redirect to next page', async () => {
      const { getByLabelText, container } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );
      const user = userEvent.setup();
      const mobileNumberInput = getByLabelText('Mobile number');
      const emailInput = getByLabelText('Email');
      const nextButton = getById(container, 'next-button');

      await user.type(mobileNumberInput, '3130000000');
      await user.type(emailInput, 'a@a.com');
      await user.click(nextButton!);

      expect(nextButton).toBeEnabled();
      expect(mockedDispatch).toBeCalledWith({
        type: 'SET_CONTACT_INFO',
        payload: {
          mobileNumber: '3130000000',
          email: 'a@a.com',
          enableTextCommunication: true,
          enableEmailCommunication: true
        }
      });
      expect(mockedUseNavigate).toBeCalledWith('/cardamagetransition');
    });

    it('should be able to uncheck enableTextCommunication checkbox', async () => {
      const { container, getByLabelText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      const user = userEvent.setup();
      const mobileNumberInput = getByLabelText('Mobile number');
      const emailInput = getByLabelText('Email');
      const enableTextCommunication = getById(container, 'enableTextCommunication');
      const nextButton = getById(container, 'next-button');

      await user.type(mobileNumberInput, '3130000000');
      await user.type(emailInput, 'a@a.com');
      await user.click(enableTextCommunication!);
      await user.click(nextButton!);

      expect(mockedDispatch).toBeCalledWith({
        type: 'SET_CONTACT_INFO',
        payload: {
          mobileNumber: '3130000000',
          email: 'a@a.com',
          enableTextCommunication: false,
          enableEmailCommunication: true
        }
      });
    });

    it('should be able to uncheck enableEmailCommunication checkbox', async () => {
      const { container, getByLabelText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      const user = userEvent.setup();
      const mobileNumberInput = getByLabelText('Mobile number');
      const emailInput = getByLabelText('Email');
      const enableEmailCommunication = getById(container, 'enableEmailCommunication');
      const nextButton = getById(container, 'next-button');

      await user.type(mobileNumberInput, '3130000000');
      await user.type(emailInput, 'a@a.com');
      await user.click(enableEmailCommunication!);
      await user.click(nextButton!);

      expect(mockedDispatch).toBeCalledWith({
        type: 'SET_CONTACT_INFO',
        payload: {
          mobileNumber: '3130000000',
          email: 'a@a.com',
          enableTextCommunication: true,
          enableEmailCommunication: false
        }
      });
    });

    it('should disable next button when required fields are not completed', async () => {
      const { getByLabelText, getByText, container } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );
      const user = userEvent.setup();
      const mobileNumberInput = getByLabelText('Mobile number');
      const emailInput = getByLabelText('Email');
      const nextButton = getById(container, 'next-button');

      await user.click(mobileNumberInput);
      await user.click(emailInput);
      await user.click(document.body);

      expect(nextButton).toBeDisabled();
      expect(getByText(/Email is required\./)).toBeTruthy();
      expect(getByText(/Mobile number is required\./)).toBeTruthy();
    });
  });

  describe('populate driver with information', async () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should pre-populate the screen field when app state has only email available', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          goToPreviousPage: undefined,
          mobileNumber: '',
          email: 'a@aaa.com',
          enableTextCommunication: false,
          loginFlowType: LoginFlowType.BEHIND_LOGIN
        },
        mockedDispatch
      ]);

      const { container, getByLabelText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );
      const user = userEvent.setup();

      const emailField = getByLabelText('Email');
      const mobileNumberField = getByLabelText('Mobile number');

      expect(emailField).toHaveValue('a@aaa.com');
      expect(mobileNumberField).toHaveValue('');
    });

    it('should pre-populate the screen field when app state has only mobile number available', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          goToPreviousPage: undefined,
          mobileNumber: '3121111111',
          email: '',
          enableTextCommunication: false,
          loginFlowType: LoginFlowType.BEHIND_LOGIN
        },
        mockedDispatch
      ]);

      const { container, getByLabelText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );
      const user = userEvent.setup();

      const emailField = getByLabelText('Email');
      const mobileNumberField = getByLabelText('Mobile number');

      expect(emailField).toHaveValue('');
      expect(mobileNumberField).toHaveValue('(312) 111-1111');
    });
    it('should trigger fireTag with the expected analytic information', async () => {
      render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      expect(useTaggingSpy).toHaveBeenCalled();
    });
  });

  describe('footer verbiage', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should display AAA\'s in footer text by default', () => {
      const { getByText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      expect(getByText(/on AAA's behalf/)).toBeTruthy();
    });

    it('should display W Insurance\'s in footer text when brand is WInsurance', () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        { ...mockAppState, brand: 'WInsurance' },
        mockedDispatch
      ]);

      const { getByText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      expect(getByText(/on W Insurance's behalf/)).toBeTruthy();
    });

    it('should display AAA\'s in footer text when brand is AAA', () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        { ...mockAppState, brand: 'AAA' },
        mockedDispatch
      ]);

      const { getByText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      expect(getByText(/on AAA's behalf/)).toBeTruthy();
    });
  });

  describe('anonymous flow prepopulation', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should prepopulate email when email is available AND loginFlowType is BEHIND_LOGIN', () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          ...mockAppState,
          email: 'test@example.com',
          mobileNumber: '',
          loginFlowType: LoginFlowType.BEHIND_LOGIN
        },
        mockedDispatch
      ]);

      const { getByLabelText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      const emailField = getByLabelText('Email');
      expect(emailField).toHaveValue('test@example.com');
    });

    it('should NOT prepopulate email when loginFlowType is ANONYMOUS (even if email exists)', () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          ...mockAppState,
          email: 'test@example.com',
          mobileNumber: '',
          loginFlowType: LoginFlowType.ANONYMOUS
        },
        mockedDispatch
      ]);

      const { getByLabelText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      const emailField = getByLabelText('Email');
      expect(emailField).toHaveValue('');
    });

    it('should prepopulate phone when mobileNumber is available AND loginFlowType is BEHIND_LOGIN', () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          ...mockAppState,
          email: '',
          mobileNumber: '3121234567',
          loginFlowType: LoginFlowType.BEHIND_LOGIN
        },
        mockedDispatch
      ]);

      const { getByLabelText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      const mobileNumberField = getByLabelText('Mobile number');
      expect(mobileNumberField).toHaveValue('(312) 123-4567');
    });

    it('should NOT prepopulate phone when loginFlowType is ANONYMOUS (even if mobileNumber exists)', () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          ...mockAppState,
          email: '',
          mobileNumber: '3121234567',
          loginFlowType: LoginFlowType.ANONYMOUS
        },
        mockedDispatch
      ]);

      const { getByLabelText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      const mobileNumberField = getByLabelText('Mobile number');
      expect(mobileNumberField).toHaveValue('');
    });

    it('should NOT prepopulate either field when loginFlowType is undefined (defaults to anonymous)', () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          ...mockAppState,
          email: 'test@example.com',
          mobileNumber: '3121234567',
          loginFlowType: undefined
        },
        mockedDispatch
      ]);

      const { getByLabelText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      const emailField = getByLabelText('Email');
      const mobileNumberField = getByLabelText('Mobile number');
      expect(emailField).toHaveValue('');
      expect(mobileNumberField).toHaveValue('');
    });

    it('should prepopulate both fields when loginFlowType is BEHIND_LOGIN and both values exist', () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          ...mockAppState,
          email: 'both@example.com',
          mobileNumber: '3129876543',
          loginFlowType: LoginFlowType.BEHIND_LOGIN
        },
        mockedDispatch
      ]);

      const { getByLabelText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      const emailField = getByLabelText('Email');
      const mobileNumberField = getByLabelText('Mobile number');
      expect(emailField).toHaveValue('both@example.com');
      expect(mobileNumberField).toHaveValue('(312) 987-6543');
    });

    it('should NOT prepopulate phone when mobileNumber starts with 0 even if loginFlowType is BEHIND_LOGIN', () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          ...mockAppState,
          email: '',
          mobileNumber: '0123456789',
          loginFlowType: LoginFlowType.BEHIND_LOGIN
        },
        mockedDispatch
      ]);

      const { getByLabelText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      const mobileNumberField = getByLabelText('Mobile number');
      expect(mobileNumberField).toHaveValue('');
    });

    it('should NOT prepopulate phone when mobileNumber starts with 1 even if loginFlowType is BEHIND_LOGIN', () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          ...mockAppState,
          email: '',
          mobileNumber: '1234567890',
          loginFlowType: LoginFlowType.BEHIND_LOGIN
        },
        mockedDispatch
      ]);

      const { getByLabelText } = render(
        <BrowserRouter basename='/'>
          <IncidentInfoContactInfo />
        </BrowserRouter>,
        { wrapper: ThemeProvider }
      );

      const mobileNumberField = getByLabelText('Mobile number');
      expect(mobileNumberField).toHaveValue('');
    });
  });
});

describe('getDefaultInputValues', () => {
  describe('with BEHIND_LOGIN flow', () => {
    it('should return both email and mobileNumber when both are provided', () => {
      const appState = {
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        email: 'test@example.com',
        mobileNumber: '3121234567'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(email).toBe('test@example.com');
      expect(mobileNumber).toBe('3121234567');
    });

    it('should return email only when mobileNumber is not provided', () => {
      const appState = {
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        email: 'test@example.com',
        mobileNumber: undefined
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(email).toBe('test@example.com');
      expect(mobileNumber).toBe('');
    });

    it('should return mobileNumber only when email is not provided', () => {
      const appState = {
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        email: undefined,
        mobileNumber: '3121234567'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(email).toBe('');
      expect(mobileNumber).toBe('3121234567');
    });

    it('should filter out mobileNumber starting with 0', () => {
      const appState = {
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        email: 'test@example.com',
        mobileNumber: '0121234567'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(mobileNumber).toBe('');
      expect(email).toBe('test@example.com');
    });

    it('should filter out mobileNumber starting with 1', () => {
      const appState = {
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        email: 'test@example.com',
        mobileNumber: '1121234567'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(mobileNumber).toBe('');
      expect(email).toBe('test@example.com');
    });

    it('should return empty strings when neither email nor mobileNumber are provided', () => {
      const appState = {
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        email: undefined,
        mobileNumber: undefined
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(mobileNumber).toBe('');
      expect(email).toBe('');
    });
  });

  describe('with isReview flag', () => {
    it('should return both email and mobileNumber when isReview is true', () => {
      const appState = {
        isReview: true,
        loginFlowType: LoginFlowType.ANONYMOUS,
        email: 'review@example.com',
        mobileNumber: '3129876543'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(email).toBe('review@example.com');
      expect(mobileNumber).toBe('3129876543');
    });

    it('should filter out mobileNumber starting with 0 even when isReview is true', () => {
      const appState = {
        isReview: true,
        loginFlowType: LoginFlowType.ANONYMOUS,
        email: 'review@example.com',
        mobileNumber: '0129876543'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(mobileNumber).toBe('');
      expect(email).toBe('review@example.com');
    });

    it('should filter out mobileNumber starting with 1 even when isReview is true', () => {
      const appState = {
        isReview: true,
        loginFlowType: LoginFlowType.ANONYMOUS,
        email: 'review@example.com',
        mobileNumber: '1129876543'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(mobileNumber).toBe('');
      expect(email).toBe('review@example.com');
    });
  });

  describe('with ANONYMOUS flow', () => {
    it('should return empty strings when loginFlowType is ANONYMOUS', () => {
      const appState = {
        loginFlowType: LoginFlowType.ANONYMOUS,
        isReview: false,
        email: 'anon@example.com',
        mobileNumber: '3121234567'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(email).toBe('');
      expect(mobileNumber).toBe('');
    });

    it('should return empty strings even when email is valid but loginFlowType is ANONYMOUS', () => {
      const appState = {
        loginFlowType: LoginFlowType.ANONYMOUS,
        isReview: false,
        email: 'user@example.com',
        mobileNumber: undefined
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(email).toBe('');
      expect(mobileNumber).toBe('');
    });

    it('should return empty strings even when mobileNumber is valid but loginFlowType is ANONYMOUS', () => {
      const appState = {
        loginFlowType: LoginFlowType.ANONYMOUS,
        isReview: false,
        email: undefined,
        mobileNumber: '3129876543'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(email).toBe('');
      expect(mobileNumber).toBe('');
    });

    it('should return empty strings when both email and mobileNumber are undefined in ANONYMOUS flow', () => {
      const appState = {
        loginFlowType: LoginFlowType.ANONYMOUS,
        isReview: false,
        email: undefined,
        mobileNumber: undefined
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(email).toBe('');
      expect(mobileNumber).toBe('');
    });

    it('should return empty strings when both email and mobileNumber are empty strings in ANONYMOUS flow', () => {
      const appState = {
        loginFlowType: LoginFlowType.ANONYMOUS,
        isReview: false,
        email: '',
        mobileNumber: ''
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(email).toBe('');
      expect(mobileNumber).toBe('');
    });

    it('should prepopulate email when isReview is true even with ANONYMOUS loginFlowType', () => {
      const appState = {
        loginFlowType: LoginFlowType.ANONYMOUS,
        isReview: true,
        email: 'review@example.com',
        mobileNumber: undefined
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(email).toBe('review@example.com');
      expect(mobileNumber).toBe('');
    });

    it('should prepopulate mobileNumber when isReview is true even with ANONYMOUS loginFlowType', () => {
      const appState = {
        loginFlowType: LoginFlowType.ANONYMOUS,
        isReview: true,
        email: undefined,
        mobileNumber: '3129876543'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(mobileNumber).toBe('3129876543');
      expect(email).toBe('');
    });

    it('should prepopulate both fields when isReview is true even with ANONYMOUS loginFlowType', () => {
      const appState = {
        loginFlowType: LoginFlowType.ANONYMOUS,
        isReview: true,
        email: 'review@example.com',
        mobileNumber: '3129876543'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(email).toBe('review@example.com');
      expect(mobileNumber).toBe('3129876543');
    });

    it('should filter out mobileNumber starting with 0 when isReview is true in ANONYMOUS flow', () => {
      const appState = {
        loginFlowType: LoginFlowType.ANONYMOUS,
        isReview: true,
        email: 'review@example.com',
        mobileNumber: '0129876543'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(mobileNumber).toBe('');
      expect(email).toBe('review@example.com');
    });

    it('should filter out mobileNumber starting with 1 when isReview is true in ANONYMOUS flow', () => {
      const appState = {
        loginFlowType: LoginFlowType.ANONYMOUS,
        isReview: true,
        email: 'review@example.com',
        mobileNumber: '1129876543'
      } as any;

      const [mobileNumber, email] = getDefaultInputValues(appState);

      expect(mobileNumber).toBe('');
      expect(email).toBe('review@example.com');
    });
  });
});
