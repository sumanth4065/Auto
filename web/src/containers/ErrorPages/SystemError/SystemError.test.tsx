import LogCannon from '@ace-clublabs/log-cannon';
import * as scl from '@ace-clublabs/shared-component-library';
import { render } from '@testing-library/react';
import * as router from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useTaggingSpy } from '../../../test/setup';
import { SystemError } from './SystemError';

vi.mock('react-router');
let mockedDispatch = vi.fn();
const loggerSpy = vi.spyOn(LogCannon, 'error');

describe('session timed out', () => {
  const mockAppState = {
    clubCode: '240',
    error: 'system error',
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
    const { getByText, container } = render(
      <BrowserRouter basename='/'>
        <SystemError />
      </BrowserRouter>,
      { wrapper: scl.ThemeProvider }
    );
    expect(container.querySelector('[test-id="system-error"]')).toBeInTheDocument();
    expect(getByText('Our systems are temporarily unavailable')).toBeVisible();
    expect(getByText('Call 1-800-672-5246')).toBeVisible();
    expect(useTaggingSpy).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(
      'System Error',
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
