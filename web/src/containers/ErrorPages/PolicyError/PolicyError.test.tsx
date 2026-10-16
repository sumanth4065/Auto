import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as scl from '@ace-clublabs/shared-component-library';
import LogCannon from '@ace-clublabs/log-cannon';
import { PolicyError } from './PolicyError';
import { useTaggingSpy } from '../../../test/setup';

vi.mock('react-router');
let mockedDispatch = vi.fn();
const loggerSpy = vi.spyOn(LogCannon, 'error');

describe('policy error', () => {
  const mockAppState = {
    clubCode: '240',
    errorReason: 'policy error',
    policyNumber: 'some-policy-number',
    serializedError: {
      errorType: 'api',
      errorLabel: 'APIError',
      errorMessage: 'system error',
      errorCode: undefined
    }
  };

  beforeEach(() => {
    mockedDispatch = vi.fn();
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [mockAppState, mockedDispatch]);
  });

  it('renders expected content', () => {
    const { getByAltText, getByText } = render(
      <BrowserRouter basename='/'>
        <PolicyError />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );

    expect(getByAltText('Policy error')).toBeVisible();
    expect(getByText('We couldn’t verify the information provided to start a claim')).toBeVisible();
    expect(getByText('Call 1-800-672-5246')).toBeVisible();
    expect(useTaggingSpy).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(
      'Policy Error',
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
});
