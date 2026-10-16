import * as scl from '@ace-clublabs/shared-component-library';
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SubmitClaimTransition } from './SubmitClaimTransition';
import { BrowserRouter } from 'react-router-dom';
import * as router from 'react-router';
import * as hooks from '../../../hooks';

const mockedUseNavigate = vi.fn();
const useSubmitClaimSpy = vi.spyOn(hooks, 'useSubmitClaim');

describe('SubmitClaimTransition', () => {
  beforeEach(() => {
    useSubmitClaimSpy.mockImplementation(() => ({
      loading: true,
      error: null
    }));
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [{}, vi.fn()]);
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedUseNavigate);
  });

  afterEach(() => {
    {
      vi.resetAllMocks();
    }
  });

  it('should match snapshot', () => {
    const result = render(
      <BrowserRouter basename='/'>
        <SubmitClaimTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(result).toMatchSnapshot();
  });

  it('should redirect to /confirmation when useSubmitClaim succeeds', () => {
    useSubmitClaimSpy.mockImplementation(() => ({
      loading: false,
      error: null
    }));

    const result = render(
      <BrowserRouter basename='/'>
        <SubmitClaimTransition />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(mockedUseNavigate).toBeCalledWith('/confirmation', { replace: true });
  });
});
