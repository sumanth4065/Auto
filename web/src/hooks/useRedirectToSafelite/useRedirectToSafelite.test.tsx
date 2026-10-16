import * as router from 'react-router';
import { describe, it, expect, vi } from 'vitest';

import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { mockPolicyGuid, safeliteRedirectUrlResponseFixture } from '@lib/types';

import { useRedirectToSafelite } from './useRedirectToSafelite';
import * as SourcesDictionary from '../../api/sources';
import { Sources } from '../../api/sources';

var mockedFn = vi.fn();
const mockedDispatch = vi.fn();

describe('useRedirectToSafelite', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        policyGuid: mockPolicyGuid,
        token: 'some-token',
        brand: 'AAA'
      },
      mockedDispatch
    ]);

    vi.spyOn(SourcesDictionary, 'sources').mockImplementation(
      () =>
        ({
          getSafeliteRedirectUrl: mockedFn
        }) as unknown as Sources
    );
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should pass brand to sources', async () => {
    mockedFn.mockImplementation(() => safeliteRedirectUrlResponseFixture);
    const { waitForNextUpdate } = renderHook(() => useRedirectToSafelite());

    await waitForNextUpdate();
    expect(SourcesDictionary.sources).toHaveBeenCalledWith(
      'some-token',
      mockPolicyGuid,
      undefined,
      undefined,
      'AAA'
    );
  });

  it('should pass WInsurance brand to sources', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        policyGuid: mockPolicyGuid,
        token: 'some-token',
        brand: 'WInsurance'
      },
      mockedDispatch
    ]);
    mockedFn.mockImplementation(() => safeliteRedirectUrlResponseFixture);
    const { waitForNextUpdate } = renderHook(() => useRedirectToSafelite());

    await waitForNextUpdate();
    expect(SourcesDictionary.sources).toHaveBeenCalledWith(
      'some-token',
      mockPolicyGuid,
      undefined,
      undefined,
      'WInsurance'
    );
  });

  it('test custom hook lifecycle', async () => {
    mockedFn.mockImplementation(() => safeliteRedirectUrlResponseFixture);
    const { result, waitForNextUpdate } = renderHook(() => useRedirectToSafelite());

    expect(result.current).toEqual({
      error: null,
      loading: true,
      safeliteRedirectUrl: undefined
    });
    expect(mockedFn).toHaveBeenCalled();

    await waitForNextUpdate();
    expect(result.current).toEqual({
      error: null,
      loading: false,
      safeliteRedirectUrl: 'https://submittest.glassclaim.com/SelfService/Default.aspx'
    });
  });

  it('Should populate error state if something happens fetching GetSafeliteRedirectUrl', async () => {
    mockedFn.mockImplementation(() => {
      return Promise.reject({
        ErrorMessage: {
          error: {
            message: 'system error'
          }
        }
      });
    });
    const { result, waitForNextUpdate } = renderHook(() => useRedirectToSafelite());

    expect(result.current).toEqual({
      error: null,
      loading: true,
      safeliteRedirectUrl: undefined
    });
    expect(mockedFn).toHaveBeenCalled();

    await waitForNextUpdate();
    expect(result.current).toEqual({
      error: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useRedirectToSafelite'
      },
      loading: false,
      safeliteRedirectUrl: undefined
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SERIALIZED_ERROR',
      payload: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useRedirectToSafelite'
      }
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR_REASON',
      payload: 'system error'
    });
  });

  it('Should populate knockout state if something happens fetching GetSafeliteRedirectUrl', async () => {
    mockedFn.mockImplementation(() => {
      return Promise.reject({
        ErrorMessage: {
          error: {
            message: 'system error'
          }
        }
      });
    });
    const { result, waitForNextUpdate } = renderHook(() => useRedirectToSafelite());

    expect(result.current).toEqual({
      error: null,
      loading: true,
      safeliteRedirectUrl: undefined
    });
    expect(mockedFn).toHaveBeenCalled();

    await waitForNextUpdate();
    expect(result.current).toEqual({
      error: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useRedirectToSafelite'
      },
      loading: false,
      safeliteRedirectUrl: undefined
    });
  });
});
