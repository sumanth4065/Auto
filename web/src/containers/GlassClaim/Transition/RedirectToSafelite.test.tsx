import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as scl from '@ace-clublabs/shared-component-library';
import { RedirectToSafelite } from './RedirectToSafelite';
import * as hooks from '../../../hooks';

vi.mock('../../../hooks');

const mockedUseNavigate = vi.fn();
const mockedDispatch = vi.fn();
const useRedirectToSafeliteSpy = vi.spyOn(hooks, 'useRedirectToSafelite');
const sessionStorageMock = vi.fn();
vi.stubGlobal('sessionStorage', {
  setItem: sessionStorageMock
});

describe('Redirect to Safelite', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [{}, mockedDispatch]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
    useRedirectToSafeliteSpy.mockImplementation(() => ({
      loading: true,
      error: null,
      safeliteRedirectUrl: undefined
    }));
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <RedirectToSafelite />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should redirect to safelite app after a MIN timeout', async () => {
    const result = render(
      <BrowserRouter basename='/'>
        <RedirectToSafelite />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(
      result.getByText('Please wait while we direct you to the Safelite website.')
    ).toBeVisible();
    // expect(mockedUseNavigate).toHaveBeenCalledWith('/Safelite loading page'); implement for story ISS-7902
  });

  it('should set the safeliteRedirectInitiated flag in session storage', () => {
    useRedirectToSafeliteSpy.mockImplementation(() => ({
      loading: false,
      error: null,
      safeliteRedirectUrl: 'https://submittest.glassclaim.com/SelfService/Default.aspx'
    }));

    render(
      <BrowserRouter basename='/'>
        <RedirectToSafelite />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(sessionStorageMock).toHaveBeenCalledWith('safeliteRedirectInitiated', 'true');
  });
});
