import { ThemeProvider } from '@ace-clublabs/shared-component-library';
import { describe, beforeEach, afterEach, vi } from 'vitest';
import { render, getByLabelText, findByText } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';

import { useTaggingSpy } from '../../../test/setup';
import { Pages } from '../../../shared/pages';
import { CustomDriver } from './CustomDriver';

import { State } from '../../../store/reducer';
import { filterPhoneNumber } from '@ace-clublabs/iss-common-util';

describe('CustomDriver', () => {
  const mockedDispatch = vi.fn();
  const mockedUseNavigate = vi.fn();
  let mockAppState: Partial<State>;

  beforeEach(() => {
    mockAppState = {
      selectedDriver: {
        firstName: 'Hayden',
        lastName: 'Barnes',
        mobileNumber: '4151234567',
        email: 'hayden@example.com'
      }
    };

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('prefills fields from appState and submits custom driver', async () => {
    const user = userEvent.setup();
    const { getByLabelText: getByLabelTextFromRender, findByText: findByTextFromRender } = render(
      <BrowserRouter basename='/'>
        <CustomDriver />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();

    const firstName = getByLabelTextFromRender('First name') as HTMLInputElement;
    const lastName = getByLabelTextFromRender('Last name') as HTMLInputElement;
    const mobileNumber = getByLabelTextFromRender('Mobile number') as HTMLInputElement;
    const email = getByLabelTextFromRender('Email') as HTMLInputElement;

    expect(firstName.value).toBe('Hayden');
    expect(lastName.value).toBe('Barnes');
    expect(filterPhoneNumber(mobileNumber.value)).toBe('4151234567');
    expect(email.value.toLowerCase()).toBe('hayden@example.com');

    await user.click(await findByTextFromRender('Next'));

    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_DRIVER',
      payload: expect.objectContaining({
        firstName: 'Hayden',
        lastName: 'Barnes',
        mobileNumber: '4151234567',
        email: expect.stringMatching(/hayden@example\.com/i)
      })
    });

    const dispatched = mockedDispatch.mock.calls[0]?.[0];
    expect(dispatched).toBeDefined();
    expect((dispatched as any).payload).not.toHaveProperty('driverId');

    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.Passengers);
  });

  it('prefills empty fields when selectedDriver is missing and submits edited values', async () => {
    mockAppState = {};
    const user = userEvent.setup();

    const { getByLabelText: getByLabelTextFromRender, findByText: findByTextFromRender } = render(
      <BrowserRouter basename='/'>
        <CustomDriver />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(useTaggingSpy).toHaveBeenCalled();

    const firstName = getByLabelTextFromRender('First name') as HTMLInputElement;
    const lastName = getByLabelTextFromRender('Last name') as HTMLInputElement;
    const mobileNumber = getByLabelTextFromRender('Mobile number') as HTMLInputElement;
    const email = getByLabelTextFromRender('Email') as HTMLInputElement;

    expect(firstName.value).toBe('');
    expect(lastName.value).toBe('');
    expect(mobileNumber.value).toBe('');
    expect(email.value).toBe('');

    await user.type(firstName, 'John');
    await user.type(lastName, 'Doe');
    await user.type(mobileNumber, '(415) 123-4567');
    await user.type(email, 'John@Example.com');

    await user.click(await findByTextFromRender('Next'));

    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_DRIVER',
      payload: expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        mobileNumber: '4151234567',
        email: 'John@Example.com'
      })
    });

    expect(mockedUseNavigate).toHaveBeenCalledWith(Pages.Passengers);
  });

  it('filters formatted phone numbers on submit', async () => {
    mockAppState = {
      selectedDriver: {
        firstName: 'Hayden',
        lastName: 'Barnes',
        mobileNumber: '(415) 123-4567',
        email: 'hayden@example.com'
      }
    };

    const user = userEvent.setup();
    const { findByText: findByTextFromRender, getByLabelText: getByLabelTextFromRender } = render(
      <BrowserRouter basename='/'>
        <CustomDriver />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(getByLabelTextFromRender('Email')).toHaveValue('hayden@example.com');

    await user.click(await findByTextFromRender('Next'));

    expect(mockedDispatch).toBeCalledWith({
      type: 'SET_DRIVER',
      payload: expect.objectContaining({
        firstName: 'Hayden',
        lastName: 'Barnes',
        mobileNumber: '4151234567',
        email: 'hayden@example.com'
      })
    });
  });

  it('marks PII inputs with data-qm-block', async () => {
    const { getByLabelText: getByLabelTextFromRender, container } = render(
      <BrowserRouter basename='/'>
        <CustomDriver />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    // The shared TextField component likely applies the `data-qm-block` attribute
    // on a wrapper element, not directly on the <input>.
    const firstName = getByLabelTextFromRender('First name') as HTMLElement;
    const lastName = getByLabelTextFromRender('Last name') as HTMLElement;
    const mobileNumber = getByLabelTextFromRender('Mobile number') as HTMLElement;
    const email = getByLabelTextFromRender('Email') as HTMLElement;

    expect(container.querySelectorAll('[data-qm-block]').length).toBeGreaterThanOrEqual(4);
    expect(firstName.closest('[data-qm-block]')).toBeTruthy();
    expect(lastName.closest('[data-qm-block]')).toBeTruthy();
    expect(mobileNumber.closest('[data-qm-block]')).toBeTruthy();
    expect(email.closest('[data-qm-block]')).toBeTruthy();
  });

  it('should enforce maxlength of 30 on first name and last name, and 60 on email', () => {
    const { getByLabelText: getByLabelTextFromRender } = render(
      <BrowserRouter basename='/'>
        <CustomDriver />
      </BrowserRouter>,
      { wrapper: ThemeProvider }
    );

    expect(getByLabelTextFromRender('First name')).toHaveAttribute('maxlength', '30');
    expect(getByLabelTextFromRender('Last name')).toHaveAttribute('maxlength', '30');
    expect(getByLabelTextFromRender('Email')).toHaveAttribute('maxlength', '60');
  });
});

