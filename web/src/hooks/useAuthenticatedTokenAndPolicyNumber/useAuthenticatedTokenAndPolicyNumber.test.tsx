import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as LogCannon from '@ace-clublabs/log-cannon';
import { mockPolicyNumber } from '@lib/types';
import { LoginFlowType } from '@lib/shared-contracts';

import { axiosInstance } from '@ace-clublabs/iss-common-util';
import { useAuthenticatedTokenAndPolicyNumber } from './useAuthenticatedTokenAndPolicyNumber';
import * as utils from '../../utils';
import { State } from '../../store/reducer';

// Partial mock of @ace-clublabs/iss-common-util — replaces axiosInstance with a
// lightweight stand-in while preserving CookieHelper / MaskData for the hook.
vi.mock('@ace-clublabs/iss-common-util', async () => {
  const actual = await vi.importActual<typeof import('@ace-clublabs/iss-common-util')>(
    '@ace-clublabs/iss-common-util'
  );
  return {
    ...actual,
    axiosInstance: {
      defaults: { headers: {} },
      interceptors: { request: { use: vi.fn(), eject: vi.fn() } }
    }
  };
});

// Mock useParams to return controlled values
let mockUseParamsReturn: Record<string, string> = {};
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useParams: () => mockUseParamsReturn
  };
});

// Helper function to set mock return value
const setMockUseParams = (value: Record<string, string>) => {
  mockUseParamsReturn = value;
};

describe('useAuthenticatedTokenAndPolicyNumber', () => {
  describe('Anonymous flow (isAnonymous: true)', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve('some-token'));
      vi.spyOn(utils.jwt, 'jwtDecode').mockReturnValue({ policyNumber: mockPolicyNumber } as any);
      setMockUseParams({});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return token and policy number on localhost with query params', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      const { result } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(result.current).toEqual({
        loading: false,
        token: 'some-token',
        policyNumber: mockPolicyNumber,
        clubCode: '240',
        clubCodeError: undefined,
        isTokenInfoError: false
      });
    });

    it('should not store club code in sessionStorage for PStar policies when AEM zipcode cookie is absent', async () => {
      const pstarPolicyNumber = 'A12345678';
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${pstarPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');
      vi.spyOn(document, 'cookie', 'get').mockReturnValue('');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(sessionStorage.getItem('clubCode')).toBeNull();
    });

    it('should use club code from AEM zipcode cookie for PStar policies when cookie is present', async () => {
      const pstarPolicyNumber = 'A12345678';
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${pstarPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');
      vi.spyOn(document, 'cookie', 'get').mockReturnValue('zipcode=90060|AAA|004|PC');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(sessionStorage.getItem('clubCode')).toBe('004');
    });

    it('should ignore malformed AEM zipcode cookie with missing club code segment', async () => {
      const pstarPolicyNumber = 'A12345678';
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${pstarPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');
      vi.spyOn(document, 'cookie', 'get').mockReturnValue('zipcode=90060|AAA');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(sessionStorage.getItem('clubCode')).toBeNull();
    });

    it('should dispatch setIsAnonymous with true', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_IS_ANONYMOUS',
        payload: true
      });
    });

    it('should dispatch setLoginFlowType with ANONYMOUS', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_LOGIN_FLOW_TYPE',
        payload: LoginFlowType.ANONYMOUS
      });
    });
  });

  describe('Behind login flow (isAnonymous: false)', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve('behind-login-token'));
      vi.spyOn(utils.jwt, 'jwtDecode').mockReturnValue({ policyNumber: mockPolicyNumber } as any);
      setMockUseParams({});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should dispatch setIsAnonymous with false', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_IS_ANONYMOUS',
        payload: false
      });
    });

    it('should dispatch setLoginFlowType with BEHIND_LOGIN', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_LOGIN_FLOW_TYPE',
        payload: LoginFlowType.BEHIND_LOGIN
      });
    });

    it('should fetch token and policy number successfully', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');

      const { result, waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      expect(result.current.loading).toBe(true);

      await waitForNextUpdate();

      expect(result.current).toEqual({
        loading: false,
        token: 'behind-login-token',
        policyNumber: mockPolicyNumber,
        clubCode: '240',
        clubCodeError: undefined,
        isTokenInfoError: false
      });
    });
  });

  describe('Token dispatch actions', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve('some-token'));
      vi.spyOn(utils.jwt, 'jwtDecode').mockReturnValue({ policyNumber: mockPolicyNumber } as any);
      setMockUseParams({});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should dispatch setToken action with token value', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_TOKEN',
        payload: 'some-token'
      });
    });

    it('should dispatch setPolicyNumber action with policy number value', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_POLICY_NUMBER',
        payload: mockPolicyNumber
      });
    });

    it('should dispatch setClubCode action with club code value', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_CLUB_CODE',
        payload: '240'
      });
    });
  });

  describe('Club code from token', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      setMockUseParams({});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should use clubCode from token when policyNumber is not available in token', async () => {
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve('token-with-club-code'));
      vi.spyOn(utils.jwt, 'jwtDecode').mockReturnValue({ clubCode: '123' } as any);

      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_CLUB_CODE',
        payload: '123'
      });
    });
  });

  describe('Market not supported', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve('some-token'));
      vi.spyOn(utils.jwt, 'jwtDecode').mockReturnValue({ policyNumber: mockPolicyNumber } as any);
      setMockUseParams({});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should set clubCodeError when market is not supported', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}&disabledClubCodes=240`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      const { result } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_SERIALIZED_ERROR',
        payload: expect.anything()
      });

      expect(result.current).toEqual({
        loading: false,
        token: 'some-token',
        policyNumber: mockPolicyNumber,
        clubCode: '240',
        clubCodeError: 'Market not supported',
        isTokenInfoError: false
      });
    });

    it('should dispatch setKnockoutReason when market is not supported', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}&disabledClubCodes=240`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_KNOCKOUT_REASON',
        payload: 'Market not supported'
      });
    });
  });

  describe('Error handling', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      vi.resetAllMocks();
      setMockUseParams({});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should set isTokenInfoError to true when getToken throws an error', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.reject(new Error('Token retrieval failed')));

      const { result, waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect(result.current.isTokenInfoError).toBe(true);
    });

    it('should dispatch setErrorReason when getToken throws an error', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.reject(new Error('Token retrieval failed')));

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_ERROR_REASON',
        payload: 'PKCE Behind Login Token or Initial Data error'
      });
    });

    it('should set loading to false when no token is returned', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve(undefined));

      const { result, waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.token).toBeUndefined();
    });
  });

  describe('Mobile Crash Detection', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve('some-token'));
      vi.spyOn(utils.jwt, 'jwtDecode').mockReturnValue({ policyNumber: mockPolicyNumber } as any);
      setMockUseParams({});
      localStorage.removeItem('isMobileAppAccidentDetection');
      localStorage.removeItem('crashDatePrediction');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should set isMobileAppAccidentDetection and crashDatePrediction in local storage', async () => {
      localStorage.clear();

      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}&isMobileAppAccidentDetection=true&crashDatePrediction=10-08-2025`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      await waitFor(() => {
        expect(localStorage.getItem('isMobileAppAccidentDetection')).toBe('true');
        expect(localStorage.getItem('crashDatePrediction')).toBe('10-08-2025');
      });
    });

    it('should dispatch crash detection actions from local storage', async () => {
      // Set localStorage values before rendering
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn((key: string) => {
            if (key === 'isMobileAppAccidentDetection') return 'true';
            if (key === 'crashDatePrediction') return '10-08-2025';
            return null;
          }),
          setItem: vi.fn(),
          removeItem: vi.fn()
        },
        writable: true
      });

      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_IS_MOBILE_APP_ACCIDENT_DETECTION',
        payload: 'true'
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'SET_CRASH_DATE_PREDICTION',
        payload: '10-08-2025'
      });
    });
  });

  describe('PolicyGuid from route params', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve('some-token'));
      vi.spyOn(utils.jwt, 'jwtDecode').mockReturnValue({ policyNumber: mockPolicyNumber } as any);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should not dispatch setPolicyGuid when policyGuid is already in appState', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');
      setMockUseParams({ policyGuid: 'existing-policy-guid' });

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: { policyGuid: 'existing-policy-guid' } as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(mockDispatch).not.toHaveBeenCalledWith({
        type: 'SET_POLICY_GUID',
        payload: 'existing-policy-guid'
      });
    });

    it('should not dispatch setPolicyGuid when policyGuid is not in route params', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');
      setMockUseParams({});

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_POLICY_GUID'
        })
      );
    });
  });

  describe('Session storage updates', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve('some-token'));
      vi.spyOn(utils.jwt, 'jwtDecode').mockReturnValue({ policyNumber: mockPolicyNumber } as any);
      setMockUseParams({});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should set loginFlowType in session storage for anonymous flow', async () => {
      sessionStorage.clear();

      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      await waitFor(() =>
        expect(sessionStorage.getItem('loginFlowType')).toBe(LoginFlowType.ANONYMOUS)
      );
    });

    it('should set loginFlowType in session storage for behind login flow', async () => {
      sessionStorage.clear();

      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      await waitFor(() =>
        expect(sessionStorage.getItem('loginFlowType')).toBe(LoginFlowType.BEHIND_LOGIN)
      );
    });

    it('should set policyNumber in session storage', async () => {
      sessionStorage.clear();

      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      await waitFor(() => expect(sessionStorage.getItem('policyNumber')).toBe(mockPolicyNumber));
    });

    it('should set clubCode in session storage', async () => {
      sessionStorage.clear();

      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=some-token&policyNumber=${mockPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      await waitFor(() => expect(sessionStorage.getItem('clubCode')).toBe('240'));
    });
  });

  describe('AppState existing values', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve('some-token'));
      vi.spyOn(utils.jwt, 'jwtDecode').mockReturnValue({ policyNumber: mockPolicyNumber } as any);
      setMockUseParams({});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should not dispatch setPolicyNumber when policyNumber already exists in appState', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: { policyNumber: 'existing-policy' } as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect(mockDispatch).not.toHaveBeenCalledWith({
        type: 'SET_POLICY_NUMBER',
        payload: mockPolicyNumber
      });
    });

    it('should not dispatch setClubCode when clubCode already exists in appState', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: { clubCode: '999' } as unknown as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SET_CLUB_CODE'
        })
      );
    });
  });

  describe('WInsurance brand routing (getBrandForAuth)', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(utils.jwt, 'jwtDecode').mockReturnValue({ policyNumber: mockPolicyNumber } as any);
      setMockUseParams({});
      sessionStorage.clear();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      sessionStorage.clear();
    });

    it('should call getToken with WInsurance when isW=true is in URL', async () => {
      const getTokenSpy = vi
        .spyOn(utils, 'getToken')
        .mockImplementation(() => Promise.resolve('w-token'));

      Object.defineProperty(window, 'location', {
        value: {
          host: 'appqa1.ace.aaa.com',
          hostname: 'appqa1.ace.aaa.com',
          pathname: '/test',
          search: '?isW=true'
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('qa');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      await waitForNextUpdate();

      expect(getTokenSpy).toHaveBeenCalledWith(true, 'WInsurance');
    });

    it('should call getToken with WInsurance when sessionStorage brand is WInsurance', async () => {
      sessionStorage.setItem('brand', 'WInsurance');
      const getTokenSpy = vi
        .spyOn(utils, 'getToken')
        .mockImplementation(() => Promise.resolve('w-token'));

      Object.defineProperty(window, 'location', {
        value: {
          host: 'appqa1.ace.aaa.com',
          hostname: 'appqa1.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('qa');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      await waitForNextUpdate();

      expect(getTokenSpy).toHaveBeenCalledWith(true, 'WInsurance');
    });

    it('should call getToken with AAA when isW is absent and no WInsurance brand in sessionStorage', async () => {
      const getTokenSpy = vi
        .spyOn(utils, 'getToken')
        .mockImplementation(() => Promise.resolve('aaa-token'));

      Object.defineProperty(window, 'location', {
        value: {
          host: 'appqa1.ace.aaa.com',
          hostname: 'appqa1.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('qa');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      await waitForNextUpdate();

      expect(getTokenSpy).toHaveBeenCalledWith(true, 'AAA');
    });
  });

  describe('ISS-11012: Axios singleton token management', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve('some-token'));
      vi.spyOn(utils.jwt, 'jwtDecode').mockReturnValue({ policyNumber: mockPolicyNumber } as any);
      setMockUseParams({});
      // Reset axiosInstance mock headers before each test
      delete (axiosInstance.defaults.headers as Record<string, string>)['Authorization'];
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    // AC-1 happy path: anonymous flow sets axiosInstance Authorization header
    it('should set axiosInstance.defaults.headers Authorization when token acquired via anonymous flow', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'appqa1.ace.aaa.com',
          hostname: 'appqa1.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('qa');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      await waitForNextUpdate();

      expect((axiosInstance.defaults.headers as Record<string, string>)['Authorization']).toBe('Bearer some-token');
    });

    // AC-1 happy path: behind-login flow sets axiosInstance Authorization header
    it('should set axiosInstance.defaults.headers Authorization when token acquired via behind-login flow', async () => {
      vi.spyOn(utils, 'getToken').mockImplementation(() =>
        Promise.resolve('behind-login-token')
      );

      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect((axiosInstance.defaults.headers as Record<string, string>)['Authorization']).toBe('Bearer behind-login-token');
    });

    // AC-1 happy path: dev authorization hack sets axiosInstance Authorization header
    it('should set axiosInstance.defaults.headers Authorization when token set via dev query param hack', () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'localhost',
          hostname: 'localhost',
          pathname: '/test',
          search: `?token=dev-hack-token&policyNumber=${mockPolicyNumber}`
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect((axiosInstance.defaults.headers as Record<string, string>)['Authorization']).toBe('Bearer dev-hack-token');
    });

    // AC-1 edge: undefined token should NOT set invalid Bearer header on axiosInstance
    it('should not set axiosInstance Authorization header when getToken returns undefined', async () => {
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve(undefined));

      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect((axiosInstance.defaults.headers as Record<string, string>)['Authorization']).toBeUndefined();
    });

    // AC-1 edge: remount hydration should ensure axiosInstance header is still set
    it('should set axiosInstance Authorization header when hydrating from existing appState on remount', () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'appqa1.ace.aaa.com',
          hostname: 'appqa1.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('qa');

      const existingState = {
        token: 'hydrated-token',
        policyNumber: mockPolicyNumber,
        clubCode: '240'
      } as State;

      renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: existingState,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect((axiosInstance.defaults.headers as Record<string, string>)['Authorization']).toBe('Bearer hydrated-token');
    });

    // Regression: stale Authorization header must be cleared when token reacquisition
    // returns nothing or throws — prevents authenticating as the previous user (Copilot review).
    it('should clear stale Authorization header when getToken returns undefined', async () => {
      // Simulate leftover header from a previous user session
      (axiosInstance.defaults.headers as Record<string, string>)['Authorization'] = 'Bearer stale-old-token';

      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve(undefined));

      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect((axiosInstance.defaults.headers as Record<string, string>)['Authorization']).toBeUndefined();
    });

    // Regression: stale Authorization header must be cleared when getToken throws
    it('should clear stale Authorization header when getToken throws an error', async () => {
      (axiosInstance.defaults.headers as Record<string, string>)['Authorization'] = 'Bearer stale-old-token';

      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.reject(new Error('auth failed')));

      Object.defineProperty(window, 'location', {
        value: {
          host: 'app.ace.aaa.com',
          hostname: 'app.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: false
        })
      );

      await waitForNextUpdate();

      expect((axiosInstance.defaults.headers as Record<string, string>)['Authorization']).toBeUndefined();
    });

    // AC-2 happy path: axiosInstance carries Authorization header to downstream requests
    it('should include Authorization header in axiosInstance defaults for all subsequent requests', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          host: 'appqa1.ace.aaa.com',
          hostname: 'appqa1.ace.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('qa');

      const { waitForNextUpdate } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: {} as State,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      await waitForNextUpdate();

      // The header set on defaults persists across all future axiosInstance calls
      expect((axiosInstance.defaults.headers as Record<string, string>)['Authorization']).toBe('Bearer some-token');
      // Verify it's a Bearer format string
      expect((axiosInstance.defaults.headers as Record<string, string>)['Authorization']).toMatch(/^Bearer .+$/);
    });
  });

  describe('auth stabilization guards', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
      vi.spyOn(utils, 'getToken').mockImplementation(() => Promise.resolve('some-token'));
      vi.spyOn(utils.jwt, 'jwtDecode').mockReturnValue({ policyNumber: mockPolicyNumber } as any);
      setMockUseParams({});
      Object.defineProperty(window, 'location', {
        value: {
          host: 'appqa1.aaa.com',
          hostname: 'appqa1.aaa.com',
          pathname: '/test',
          search: ''
        },
        writable: true,
        configurable: true
      });
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('qa');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('hydrates local state from appState.token and skips PKCE when token already exists', async () => {
      const getTokenSpy = vi.spyOn(utils, 'getToken');
      const existingState = {
        token: 'existing-token',
        policyNumber: mockPolicyNumber,
        clubCode: '240'
      } as State;

      const { result } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: existingState,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      // Should not call getToken since token already exists in appState
      expect(getTokenSpy).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
      expect(result.current.token).toBe('existing-token');
    });

    it('skips PKCE and hydrates only token when policyNumber/clubCode absent in appState', async () => {
      const getTokenSpy = vi.spyOn(utils, 'getToken');
      const existingState = { token: 'existing-token' } as State;

      const { result } = renderHook(() =>
        useAuthenticatedTokenAndPolicyNumber({
          appState: existingState,
          dispatch: mockDispatch,
          isAnonymous: true
        })
      );

      expect(getTokenSpy).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
      expect(result.current.token).toBe('existing-token');
    });
  });
});
