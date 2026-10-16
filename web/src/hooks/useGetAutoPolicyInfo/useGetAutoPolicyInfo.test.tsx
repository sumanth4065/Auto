import * as router from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { mockPolicyGuid } from '@lib/types';
import { policyInfoResponseFixture } from '@lib/types';
import { useGetAutoPolicyInfo } from './useGetAutoPolicyInfo';
import * as SourcesDictionary from '../../api/sources';
import { Sources } from '../../api/sources';

const mockRemote = vi.fn();
const mockedDispatch = vi.fn();

describe('useGetAutoPolicyInfo', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        policyGuid: mockPolicyGuid,
        token: 'some-token'
      },
      mockedDispatch
    ]);

    vi.spyOn(SourcesDictionary, 'sources').mockImplementation(
      () =>
        ({
          getAutoPolicyInfo: mockRemote
        }) as unknown as Sources
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('test custom hook lifecycle', async () => {
    mockRemote.mockImplementation(() => policyInfoResponseFixture);
    const { result, waitForNextUpdate } = renderHook(() => useGetAutoPolicyInfo());

    expect(result.current).toEqual({
      error: null,
      loading: true,
      autoPolicyInfo: undefined
    });
    await waitForNextUpdate();
    expect(result.current).toEqual({
      error: null,
      loading: false,
      autoPolicyInfo: {
        policyGeneralInfo: {
          inceptionDate: '12/10/2020',
          policyClass: 'PPA',
          policyType: 'Auto',
          status: 'ACTIVE',
          termEffectiveDate: '12/10/2020',
          termExpirationDate: '12/10/2021'
        }
      }
    });
  });

  it('Should handle v2 empty policy response (flag ON)', async () => {
    mockRemote.mockImplementation(() => ({
      data: {
        policyGeneralInfo: {},
        driverSummaries: {}
      }
    }));

    const { result, waitForNextUpdate } = renderHook(() => useGetAutoPolicyInfo());

    // initial state
    expect(result.current).toEqual({
      error: null,
      loading: true,
      autoPolicyInfo: undefined
    });

    await waitForNextUpdate();

    // final state: the hook should store the empty object returned by the lambda
    expect(result.current).toEqual({
      error: null,
      loading: false,
      autoPolicyInfo: {
        policyGeneralInfo: {},
        driverSummaries: {}
      }
    });
  });

  it('Should populate error state if something happens fetching GetAutoPolicyInfo', async () => {
    mockRemote.mockImplementation(() => {
      return Promise.reject({
        ErrorMessage: {
          error: {
            message: 'system error'
          }
        }
      });
    });
    const { result, waitForNextUpdate } = renderHook(() => useGetAutoPolicyInfo());

    expect(result.current).toEqual({
      error: null,
      loading: true,
      autoPolicyInfo: undefined
    });

    await waitForNextUpdate();
    expect(result.current).toEqual({
      error: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useGetAutoPolicyInfo'
      },
      loading: false,
      autoPolicyInfo: undefined
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SERIALIZED_ERROR',
      payload: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useGetAutoPolicyInfo'
      }
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR_REASON',
      payload: 'system error'
    });
  });

  it('Should populate knockout state if something happens fetching GetAutoPolicyInfo', async () => {
    mockRemote.mockImplementation(() => {
      return Promise.reject({
        ErrorMessage: {
          error: {
            message: 'system error'
          }
        }
      });
    });
    const { result, waitForNextUpdate } = renderHook(() => useGetAutoPolicyInfo());

    expect(result.current).toEqual({
      error: null,
      loading: true,
      autoPolicyInfo: undefined
    });

    await waitForNextUpdate();
    expect(result.current).toEqual({
      error: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useGetAutoPolicyInfo'
      },
      loading: false,
      autoPolicyInfo: undefined
    });
  });
});
