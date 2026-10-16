import { ThemeProvider } from '@ace-clublabs/shared-component-library';
import { CustomReporter, getDefaultInputValues } from './CustomReporter';
import { render, screen, getByText } from '@testing-library/react';
import { describe, beforeEach, afterEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import userEvent from '@testing-library/user-event';
import { useTaggingSpy } from '../../../test/setup';
import { Pages } from '../../../shared/pages';

vi.mock('react-router');

describe('CustomReporter', () => {
  const mockedDispatch = vi.fn();
  const mockedUseNavigate = vi.fn();
  const mockAppState = {};

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
        <CustomReporter />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should render the form with first name and last name fields', () => {
    render(
      <BrowserRouter basename='/'>
        <CustomReporter />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('should render the title correctly', () => {
    render(
      <BrowserRouter basename='/'>
        <CustomReporter />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(screen.getByText('Tell us who is reporting the claim')).toBeInTheDocument();
  });

  it('should submit form with first and last name and dispatch actions', async () => {
    render(
      <BrowserRouter basename='/'>
        <CustomReporter />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const firstNameInput = screen.getByLabelText('First name');
    const lastNameInput = screen.getByLabelText('Last name');
    const submitButton = screen.getByRole('button', { name: 'Next' });

    const user = userEvent.setup();
    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.click(submitButton);

    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SELECTED_REPORTER',
      payload: {
        id: '',
        fullName: 'John Doe',
        customReporter: {
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CONTACT_INFO',
      payload: {
        mobileNumber: '',
        email: '',
        enableTextCommunication: true,
        enableEmailCommunication: true
      }
    });
  });

  it('should navigate to ContactInformation page after form submission', async () => {
    render(
      <BrowserRouter basename='/'>
        <CustomReporter />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const firstNameInput = screen.getByLabelText('First name');
    const lastNameInput = screen.getByLabelText('Last name');
    const submitButton = screen.getByRole('button', { name: 'Next' });

    const user = userEvent.setup();
    await user.type(firstNameInput, 'Jane');
    await user.type(lastNameInput, 'Smith');
    await user.click(submitButton);

    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.ContactInformation);
  });

  it('should trigger useTagging hook', () => {
    render(
      <BrowserRouter basename='/'>
        <CustomReporter />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();
  });

  it('should have PII blocking attributes for QM on form fields', () => {
    const { container } = render(
      <BrowserRouter basename='/'>
        <CustomReporter />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const firstNameLabel = getByText(container, 'First name');
    const lastNameLabel = getByText(container, 'Last name');

    const firstNameField = firstNameLabel.closest('[data-qm-block]');
    const lastNameField = lastNameLabel.closest('[data-qm-block]');

    expect(firstNameField).toHaveAttribute('data-qm-block', 'true');
    expect(lastNameField).toHaveAttribute('data-qm-block', 'true');
  });

  it('should enforce maxlength of 30 on first name and last name inputs', () => {
    const { getByLabelText } = render(
      <BrowserRouter basename='/'>
        <CustomReporter />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(getByLabelText('First name')).toHaveAttribute('maxlength', '30');
    expect(getByLabelText('Last name')).toHaveAttribute('maxlength', '30');
  });

  it('should handle form submission with special characters in names', async () => {
    render(
      <BrowserRouter basename='/'>
        <CustomReporter />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    const firstNameInput = screen.getByLabelText('First name');
    const lastNameInput = screen.getByLabelText('Last name');
    const submitButton = screen.getByRole('button', { name: 'Next' });

    const user = userEvent.setup();
    await user.type(firstNameInput, 'Jean-Pierre');
    await user.type(lastNameInput, "O'Brien");
    await user.click(submitButton);

    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SELECTED_REPORTER',
      payload: {
        id: '',
        fullName: "Jean-Pierre O'Brien",
        customReporter: {
          firstName: 'Jean-Pierre',
          lastName: "O'Brien"
        }
      }
    });
  });
});

describe('Check Prefilled values in getDefaultInputValues', () => {
  describe('when isReview is true', () => {
    it('should return prefilled values when both firstName and lastName exist', () => {
      const appState = {
        isReview: true,
        selectedReporter: {
          customReporter: {
            firstName: 'John',
            lastName: 'Doe'
          }
        }
      };

      const [firstName, lastName] = getDefaultInputValues(appState as any);

      expect(firstName).toBe('John');
      expect(lastName).toBe('Doe');
    });

    it('should return empty strings when firstName is missing', () => {
      const appState = {
        isReview: true,
        selectedReporter: {
          firstName: '',
          lastName: 'Doe'
        }
      };

      const [firstName, lastName] = getDefaultInputValues(appState as any);

      expect(firstName).toBe('');
      expect(lastName).toBe('');
    });

    it('should return empty strings when lastName is missing', () => {
      const appState = {
        isReview: true,
        selectedReporter: {
          firstName: 'John',
          lastName: ''
        }
      };

      const [firstName, lastName] = getDefaultInputValues(appState as any);

      expect(firstName).toBe('');
      expect(lastName).toBe('');
    });

    it('should return empty strings when selectedReporter is undefined', () => {
      const appState = {
        isReview: true,
        selectedReporter: undefined
      };

      const [firstName, lastName] = getDefaultInputValues(appState as any);

      expect(firstName).toBe('');
      expect(lastName).toBe('');
    });
  });

  describe('when isReview is false', () => {
    it('should return empty strings regardless of selectedReporter data', () => {
      const appState = {
        isReview: false,
        selectedReporter: {
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      const [firstName, lastName] = getDefaultInputValues(appState as any);

      expect(firstName).toBe('');
      expect(lastName).toBe('');
    });
  });
});
