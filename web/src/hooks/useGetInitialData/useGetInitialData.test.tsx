import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { LoginFlowType } from '@lib/shared-contracts';
import { AppSource } from '@lib/types';
import { initialState, State } from '../../store/reducer';
import { useGetInitialData } from './useGetInitialData';
import * as SourcesDictionary from '../../api/sources';
import { Sources } from '../../api/sources';

const mockGetInitialData = vi.fn();
const mockedDispatch = vi.fn();
const sessionStorageMock = vi.fn();
vi.stubGlobal('sessionStorage', {
  getItem: sessionStorageMock,
  setItem: sessionStorageMock
});

const mockInitialPolicyDataResponse = {
  sourceApp: AppSource.ClaimsView,
  policyData: {
    policy: 'ABC123456',
    claim: '',
    clubCode: 'CLUB001',
    mode: 'test',
    EnableSplash: false,
    ERSURL: 'https://test.com',
    email: 'test@example.com',
    mobileNumber: '(999) 999-1000',
    conversionResult: {
      isConversionApplicable: false,
      legacyPolicyNumber: 'ABC123456',
      targetPolicyNumber: 'ABC123456',
      targetEffectiveDate: undefined,
      policyState: undefined,
      conversionType: undefined
    }
  }
};

describe('useGetInitialData', () => {
  const baseAppState: State = {
    ...initialState,
    loginFlowType: LoginFlowType.BEHIND_LOGIN,
    token: 'some-token',
    policyGuid: 'policy-guid-123',
    policyPrefix: 'ABC'
  };

  beforeEach(() => {
    vi.spyOn(SourcesDictionary, 'sources').mockImplementation(
      () =>
        ({
          getInitialData: () => mockGetInitialData
        }) as unknown as Sources
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should not execute request when token is missing', () => {
    const appStateWithoutToken: State = {
      ...baseAppState,
      token: undefined
    };

    const { result } = renderHook(() => useGetInitialData(appStateWithoutToken, mockedDispatch));

    expect(result.current).toEqual({
      error: null,
      loading: false
    });
    expect(mockGetInitialData).not.toHaveBeenCalled();
  });

  it('should not execute request when policyGuid is missing', () => {
    const appStateWithoutPolicyGuid: State = {
      ...baseAppState,
      policyGuid: undefined
    };

    const { result } = renderHook(() =>
      useGetInitialData(appStateWithoutPolicyGuid, mockedDispatch)
    );

    expect(result.current).toEqual({
      error: null,
      loading: false
    });
    expect(mockGetInitialData).not.toHaveBeenCalled();
  });

  it('should fetch initial data and dispatch actions on success', async () => {
    sessionStorageMock.mockImplementation((key: string) => {
      if (key === 'ClaimsViewGUID') return 'claimsViewGUID';
      return null;
    });
    mockGetInitialData.mockResolvedValue(mockInitialPolicyDataResponse);

    const { result, waitForNextUpdate } = renderHook(() =>
      useGetInitialData(baseAppState, mockedDispatch)
    );

    expect(result.current).toEqual({
      error: null,
      loading: true
    });

    await waitForNextUpdate();

    expect(result.current).toEqual({
      error: null,
      loading: false
    });

    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_INITIAL_POLICY_DATA_BEHIND_LOGIN',
      payload: mockInitialPolicyDataResponse.policyData
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CONTACT_INFO_PREFILL',
      payload: {
        email: 'test@example.com',
        mobileNumber: '9999991000'
      }
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CONVERSION_RESULT',
      payload: mockInitialPolicyDataResponse.policyData.conversionResult
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_POLICY_NUMBER',
      payload: 'ABC123456'
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SOURCE_APP',
      payload: AppSource.ClaimsView
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLAIMS_VIEW_GUID',
      payload: 'claimsViewGUID'
    });
  });

  it('should set policy number in session storage', async () => {
    sessionStorageMock.mockReturnValue(mockInitialPolicyDataResponse.policyData.policy);
    mockGetInitialData.mockResolvedValue(mockInitialPolicyDataResponse);

    const { waitForNextUpdate } = renderHook(() => useGetInitialData(baseAppState, mockedDispatch));

    await waitForNextUpdate();

    expect(
      sessionStorage.setItem('policyNumber', mockInitialPolicyDataResponse.policyData.policy)
    ).toBe(mockInitialPolicyDataResponse.policyData.policy);
  });

  it('should set source app in session storage', async () => {
    sessionStorageMock.mockReturnValue(mockInitialPolicyDataResponse.sourceApp);
    mockGetInitialData.mockResolvedValue(mockInitialPolicyDataResponse);

    const { waitForNextUpdate } = renderHook(() => useGetInitialData(baseAppState, mockedDispatch));

    await waitForNextUpdate();

    expect(sessionStorage.setItem('sourceApp', mockInitialPolicyDataResponse.sourceApp)).toBe(
      mockInitialPolicyDataResponse.sourceApp
    );
  });

  it('should set error when policy number is missing in response', async () => {
    mockGetInitialData.mockResolvedValue({
      policyData: {
        ...mockInitialPolicyDataResponse.policyData,
        policy: undefined
      }
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useGetInitialData(baseAppState, mockedDispatch)
    );

    expect(result.current).toEqual({
      error: null,
      loading: true
    });

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual({
      errorType: 'client',
      errorLabel: 'Error',
      errorMessage: 'Behind Login Policy number not found',
      stack: expect.any(String),
      errorLocation: 'useGetInitialData'
    });

    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SERIALIZED_ERROR',
      payload: {
        errorType: 'client',
        errorLabel: 'Error',
        errorMessage: 'Behind Login Policy number not found',
        stack: expect.any(String),
        errorLocation: 'useGetInitialData'
      }
    });

    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR_REASON',
      payload: 'Behind Login Policy number not found'
    });
  });

  it('should not dispatch conversion result when absent from response', async () => {
    const responseWithoutConversion = {
      sourceApp: AppSource.ClaimsView,
      policyData: {
        policy: 'ABC123456',
        claim: '',
        clubCode: 'CLUB001',
        mode: 'test',
        EnableSplash: false,
        ERSURL: 'https://test.com',
        email: 'test@example.com',
        mobileNumber: '(999) 999-1000'
      }
    };
    mockGetInitialData.mockResolvedValue(responseWithoutConversion);

    const { result, waitForNextUpdate } = renderHook(() =>
      useGetInitialData(baseAppState, mockedDispatch)
    );

    await waitForNextUpdate();

    expect(result.current).toEqual({
      error: null,
      loading: false
    });

    expect(mockedDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_CONVERSION_RESULT'
      })
    );
  });

  it('should handle API error and dispatch error action', async () => {
    const apiError = {
      ErrorMessage: {
        error: {
          message: 'system error'
        }
      }
    };
    mockGetInitialData.mockRejectedValue(apiError);

    const { result, waitForNextUpdate } = renderHook(() =>
      useGetInitialData(baseAppState, mockedDispatch)
    );

    expect(result.current).toEqual({
      error: null,
      loading: true
    });

    await waitForNextUpdate();

    expect(result.current).toEqual({
      error: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useGetInitialData'
      },
      loading: false
    });

    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR_REASON',
      payload: 'system error'
    });
  });
});
