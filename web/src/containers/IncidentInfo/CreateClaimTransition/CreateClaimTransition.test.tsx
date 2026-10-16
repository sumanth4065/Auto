import * as scl from '@ace-clublabs/shared-component-library';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CreateClaimTransition } from './CreateClaimTransition';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import * as hooks from '../../../hooks';
import { Pages } from '../../../shared/pages';
import { ISerializedError } from '../../../types';

const mockedDispatch = vi.fn();
const mockedUseNavigate = vi.fn();
const useCreateClaimSpy = vi.spyOn(hooks, 'useCreateClaim');
const useGetAutoClaimInfoSpy = vi.spyOn(hooks, 'useGetAutoClaimInfo');

describe('CreateClaimTransition', () => {
  beforeEach(() => {
    useCreateClaimSpy.mockImplementation(() => ({
      loading: true,
      error: null
    }));
    useGetAutoClaimInfoSpy.mockImplementation(() => ({
      loading: true,
      error: null
    }));
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      { duplicatedClaim: false },
      mockedDispatch
    ]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <CreateClaimTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should redirect to /claimreporter if useCreateClaim is successful', () => {
    useCreateClaimSpy.mockImplementation(() => ({
      loading: false,
      error: null
    }));

    const result = render(
      <BrowserRouter basename='/'>
        <CreateClaimTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(mockedUseNavigate).toBeCalledWith('/claimreporter');
  });

  it('should redirect to SystemError when claimSubmittedForClaimNumber is set', () => {
    useCreateClaimSpy.mockImplementation(() => ({
      loading: false,
      error: null
    }));
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      { duplicatedClaim: false, claimSubmittedForClaimNumber: 'CLM-12345' },
      mockedDispatch
    ]);

    render(
      <BrowserRouter basename='/'>
        <CreateClaimTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(mockedUseNavigate).toBeCalledWith(Pages.SystemError, { replace: true });
  });

  it('should redirect to /when-accident if useCreateClaim is a success when duplicated claim', () => {
    useCreateClaimSpy.mockImplementation(() => ({
      loading: false,
      error: null
    }));
    useGetAutoClaimInfoSpy.mockImplementation(() => ({
      loading: false,
      error: null
    }));
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      { duplicatedClaim: true },
      mockedDispatch
    ]);

    const result = render(
      <BrowserRouter basename='/'>
        <CreateClaimTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(mockedUseNavigate).toBeCalledWith('/when-accident');
  });

  it('should redirect to error page if useCreateClaim fails', () => {
    useCreateClaimSpy.mockImplementation(() => ({
      loading: false,
      error: { errorLabel: 'some error', errorMessage: 'some error message' } as ISerializedError
    }));
    useGetAutoClaimInfoSpy.mockImplementation(() => ({
      loading: false,
      error: null
    }));

    const result = render(
      <BrowserRouter basename='/'>
        <CreateClaimTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(mockedUseNavigate).toBeCalledWith('/error');
  });
});
