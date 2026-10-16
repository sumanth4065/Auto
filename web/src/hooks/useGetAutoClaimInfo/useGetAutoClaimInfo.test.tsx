import * as router from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import {
  foundClaimInfoResponseFixture,
  mockPolicyGuid,
  notFoundClaimInfoResponseFixture
} from '@lib/types';

import { useGetAutoClaimInfo } from './useGetAutoClaimInfo';
import * as SourcesDictionary from '../../api/sources';
import { Sources } from '../../api/sources';

var mockedFn = vi.fn();
const mockedDispatch = vi.fn();

const mockLossDateISO = '2024-05-09T02:00:00-07:00';

describe('useGetAutoClaimInfo', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        policyGuid: mockPolicyGuid,
        lossDateISO: mockLossDateISO,
        token: 'some-token',
        expirationDate: '1970-01-01T00:00:00.000Z',
        effectiveDate: '2024-01-01T00:00:00.000Z'
      },
      mockedDispatch
    ]);
    vi.spyOn(SourcesDictionary, 'sources').mockImplementation(
      () =>
        ({
          getAutoClaimInfo: mockedFn
        }) as unknown as Sources
    );
  });
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('test custom hook lifecycle when NOT claim was found', async () => {
    mockedFn.mockImplementation(() => notFoundClaimInfoResponseFixture);
    const { result, waitForNextUpdate } = renderHook(() => useGetAutoClaimInfo());
    expect(result.current).toEqual({
      error: null,
      loading: true
    });
    expect(mockedFn).toHaveBeenCalled();
    await waitForNextUpdate();
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'GET_CREATE_CLAIM_INFORMATION',
      payload: {
        claimNumber: '',
        duplicatedClaim: false,
        adjuster: undefined
      }
    });
    expect(result.current).toEqual({
      loading: false,
      error: null
    });
  });

  it('test custom hook lifecycle when claim was found', async () => {
    mockedFn.mockImplementation(() => foundClaimInfoResponseFixture);
    const { result, waitForNextUpdate } = renderHook(() => useGetAutoClaimInfo());
    expect(result.current).toEqual({
      error: null,
      loading: true
    });
    expect(mockedFn).toHaveBeenCalled();
    await waitForNextUpdate();
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'GET_CREATE_CLAIM_INFORMATION',
      payload: {
        adjuster: {
          displayName: 'James Bond',
          email: 'james.bond@test.com',
          firstName: 'James',
          lastName: 'Bond',
          phoneNumber: '562-221-9596',
          extension: '4455'
        },
        claimNumber: '123456',
        duplicatedClaim: true
      }
    });
    expect(result.current).toEqual({
      loading: false,
      error: null
    });
  });

  it('sends lossDateISO, policyNumber, and timezone in the POST body', async () => {
    mockedFn.mockImplementation(() => notFoundClaimInfoResponseFixture);
    const { waitForNextUpdate } = renderHook(() => useGetAutoClaimInfo());
    await waitForNextUpdate();
    expect(mockedFn).toHaveBeenCalledWith({
      lossDate: mockLossDateISO,
      policyNumber: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  });

  it('Should populate error state if something happens fetching create-claim', async () => {
    mockedFn.mockImplementation(() => {
      return Promise.reject({
        ErrorMessage: {
          error: {
            message: 'system error'
          }
        }
      });
    });
    const { result, waitForNextUpdate } = renderHook(() => useGetAutoClaimInfo());
    expect(result.current).toEqual({
      error: null,
      loading: true
    });
    expect(mockedFn).toHaveBeenCalled();
    await waitForNextUpdate();
    expect(result.current).toEqual({
      error: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useGetAutoClaimInfo'
      },
      loading: false
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SERIALIZED_ERROR',
      payload: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useGetAutoClaimInfo'
      }
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR_REASON',
      payload: 'system error'
    });
  });
});
