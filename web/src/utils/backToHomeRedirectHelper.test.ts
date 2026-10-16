import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock axiosInstance from @ace-clublabs/iss-common-util
// Variables prefixed with "mock" are hoisted alongside vi.mock in Vitest
const mockAxiosPost = vi.fn();
vi.mock('@ace-clublabs/iss-common-util', () => ({
  axiosInstance: {
    post: mockAxiosPost
  }
}));

// Mock endpoints module
const mockGetEnvironmentFromHostForMyAccount = vi.fn();
const mockGetEnvironmentFromHost = vi.fn();
vi.mock('../api/endpoints', async importOriginal => {
  const actual = await importOriginal<typeof import('../api/endpoints')>();
  return {
    ...actual,
    endpoints: {
      insurancePolicyFlowDirector: 'https://api.test.com/flow-director'
    },
    getEnvironmentFromHostForMyAccount: mockGetEnvironmentFromHostForMyAccount,
    getEnvironmentFromHost: mockGetEnvironmentFromHost
  };
});

describe('backToHomeRedirectHelper', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'appdev1.ace.aaa.com',
        href: '',
        assign: vi.fn()
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    });
  });

  describe('callAutoPolicyFlowDirector', () => {
    it('should call axiosInstance.post with the insurancePolicyFlowDirector endpoint', async () => {
      mockAxiosPost.mockResolvedValueOnce({
        data: { redirectUrl: 'https://redirect.example.com' }
      });
      const { callAutoPolicyFlowDirector } = await import('./backToHomeRedirectHelper');

      await callAutoPolicyFlowDirector('CAA123456789', '004');

      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
      expect(mockAxiosPost.mock.calls[0][0]).toBe('https://api.test.com/flow-director');
    });

    it('should send policyNumber in the request body', async () => {
      mockAxiosPost.mockResolvedValueOnce({
        data: { redirectUrl: 'https://redirect.example.com' }
      });
      const { callAutoPolicyFlowDirector } = await import('./backToHomeRedirectHelper');

      await callAutoPolicyFlowDirector('CAA123456789', '004');

      const body = mockAxiosPost.mock.calls[0][1] as URLSearchParams;
      expect(body.get('policyNumber')).toBe('CAA123456789');
    });

    it('should send clubCode in the request body', async () => {
      mockAxiosPost.mockResolvedValueOnce({
        data: { redirectUrl: 'https://redirect.example.com' }
      });
      const { callAutoPolicyFlowDirector } = await import('./backToHomeRedirectHelper');

      await callAutoPolicyFlowDirector('CAA123456789', '004');

      const body = mockAxiosPost.mock.calls[0][1] as URLSearchParams;
      expect(body.get('clubCode')).toBe('004');
    });

    it('should send redirectMode as "manual" in the request body', async () => {
      mockAxiosPost.mockResolvedValueOnce({
        data: { redirectUrl: 'https://redirect.example.com' }
      });
      const { callAutoPolicyFlowDirector } = await import('./backToHomeRedirectHelper');

      await callAutoPolicyFlowDirector('CAA123456789', '004');

      const body = mockAxiosPost.mock.calls[0][1] as URLSearchParams;
      expect(body.get('redirectMode')).toBe('manual');
    });

    it('should send URLSearchParams with exactly 3 parameters', async () => {
      mockAxiosPost.mockResolvedValueOnce({
        data: { redirectUrl: 'https://redirect.example.com' }
      });
      const { callAutoPolicyFlowDirector } = await import('./backToHomeRedirectHelper');

      await callAutoPolicyFlowDirector('CAA123456789', '004');

      const body = mockAxiosPost.mock.calls[0][1] as URLSearchParams;
      expect([...body.keys()].length).toBe(3);
    });

    it('should omit clubCode from params when undefined (e.g. PStar markets)', async () => {
      mockAxiosPost.mockResolvedValueOnce({
        data: { redirectUrl: 'https://redirect.example.com' }
      });
      const { callAutoPolicyFlowDirector } = await import('./backToHomeRedirectHelper');

      await callAutoPolicyFlowDirector('P123456789', undefined);

      const body = mockAxiosPost.mock.calls[0][1] as URLSearchParams;
      expect(body.get('clubCode')).toBeNull();
      expect(body.get('policyNumber')).toBe('P123456789');
      expect(body.get('redirectMode')).toBe('manual');
      expect([...body.keys()].length).toBe(2);
    });

    it('should set window.location.href to the redirectUrl from the response', async () => {
      const redirectUrl = 'https://redirect.example.com/claims';
      mockAxiosPost.mockResolvedValueOnce({ data: { redirectUrl } });
      const { callAutoPolicyFlowDirector } = await import('./backToHomeRedirectHelper');

      await callAutoPolicyFlowDirector('CAA123456789', '004');

      expect(window.location.href).toBe(redirectUrl);
    });

    it('should log an error and re-throw it if the API call fails', async () => {
      const error = new Error('Network error');
      mockAxiosPost.mockRejectedValueOnce(error);
      const { callAutoPolicyFlowDirector } = await import('./backToHomeRedirectHelper');
      const logErrorSpy = vi.spyOn((await import('@ace-clublabs/log-cannon')).default, 'error');

      await expect(callAutoPolicyFlowDirector('CAA123456789', '004')).rejects.toThrow(
        'Network error'
      );
      expect(logErrorSpy).toHaveBeenCalledWith(
        'Failed to redirect to auto policy flow director',
        expect.objectContaining({
          errorMessage: 'Network error',
          policyNumber: 'CAA123456789',
          clubCode: '004',
          redirectMode: 'manual'
        })
      );
    });
  });

  describe('navigateToMyAccount', () => {
    it('should return the URL when on dev hostname', async () => {
      const { navigateToMyAccount } = await import('./backToHomeRedirectHelper');
      mockGetEnvironmentFromHostForMyAccount.mockReturnValue('dev');

      const url = await navigateToMyAccount();

      expect(url).toBe('https://account.app.dev.ace.aaa.com');
    });

    it('should return the URL when on qa hostname', async () => {
      const { navigateToMyAccount } = await import('./backToHomeRedirectHelper');
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'appqa1.ace.aaa.com',
          assign: vi.fn()
        },
        writable: true,
        configurable: true
      });
      mockGetEnvironmentFromHostForMyAccount.mockReturnValue('qa');

      const url = await navigateToMyAccount();

      expect(url).toBe('https://account.app.qa.ace.aaa.com');
    });

    it('should return the URL when on uat hostname', async () => {
      const { navigateToMyAccount } = await import('./backToHomeRedirectHelper');
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'appuat1.ace.aaa.com',
          assign: vi.fn()
        },
        writable: true,
        configurable: true
      });
      mockGetEnvironmentFromHostForMyAccount.mockReturnValue('uat');

      const url = await navigateToMyAccount();

      expect(url).toBe('https://account.app.uat.ace.aaa.com');
    });

    it('should return the URL when on prod hostname', async () => {
      const { navigateToMyAccount } = await import('./backToHomeRedirectHelper');
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'app.ace.aaa.com',
          assign: vi.fn()
        },
        writable: true,
        configurable: true
      });
      mockGetEnvironmentFromHostForMyAccount.mockReturnValue('');

      const url = await navigateToMyAccount();

      expect(url).toBe('https://account.app.ace.aaa.com');
    });

    it('should call getEnvironmentFromHostForMyAccount with current hostname', async () => {
      const { navigateToMyAccount } = await import('./backToHomeRedirectHelper');
      const testHostname = 'appdev1.ace.aaa.com';
      mockGetEnvironmentFromHostForMyAccount.mockReturnValue('dev');

      navigateToMyAccount();

      expect(mockGetEnvironmentFromHostForMyAccount).toHaveBeenCalledWith(testHostname);
    });

    it('should return the URL', async () => {
      const { navigateToMyAccount } = await import('./backToHomeRedirectHelper');
      mockGetEnvironmentFromHostForMyAccount.mockReturnValue('dev');

      const url = await navigateToMyAccount();

      expect(url).toBe(`https://account.app.dev.ace.aaa.com`);
    });

    it('should construct URL using environment from getEnvironmentFromHostForMyAccount', async () => {
      const { navigateToMyAccount } = await import('./backToHomeRedirectHelper');
      const customEnv = 'stg';
      mockGetEnvironmentFromHostForMyAccount.mockReturnValue(customEnv);

      const url = await navigateToMyAccount();

      expect(url).toBe(`https://account.app.${customEnv}.ace.aaa.com`);
    });
  });

  describe('navigateToClaimsView', () => {
    it.each(['dev1', 'dev2', 'qa1', 'qa2', 'uat1', 'uat2'])(
      'should return the URL when on %s hostname',
      async env => {
        mockGetEnvironmentFromHost.mockReturnValue(env);

        const { navigateToClaimsView } = await import('./backToHomeRedirectHelper');

        const url = navigateToClaimsView('XXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX');
        expect(url).toBe(
          `https://app${env}.ace.aaa.com/insurance/claims/summary?id=XXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`
        );
      }
    );

    it('should return the URL when on prod hostname', async () => {
      mockGetEnvironmentFromHost.mockReturnValue('prod');

      const { navigateToClaimsView } = await import('./backToHomeRedirectHelper');

      const url = navigateToClaimsView('XXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX');
      expect(url).toBe(
        'https://app.ace.aaa.com/insurance/claims/summary?id=XXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX'
      );
    });
  });

  describe('navigateToClaimsViewRedesign', () => {
    it.each(['dev1', 'dev2', 'qa1', 'qa2', 'uat1', 'uat2'])(
      'should return the URL when on %s hostname',
      async env => {
        mockGetEnvironmentFromHost.mockReturnValue(env);

        const { navigateToClaimsViewRedesign } = await import('./backToHomeRedirectHelper');

        const url = navigateToClaimsViewRedesign('YYY-YYYY-YYYY-YYYY');
        expect(url).toBe(
          `https://app${env}.ace.aaa.com/insurance/claimsview?id=YYY-YYYY-YYYY-YYYY`
        );
      }
    );

    it('should return the URL when on prod hostname', async () => {
      mockGetEnvironmentFromHost.mockReturnValue('prod');

      const { navigateToClaimsViewRedesign } = await import('./backToHomeRedirectHelper');

      const url = navigateToClaimsViewRedesign('YYY-YYYY-YYYY-YYYY');
      expect(url).toBe('https://app.ace.aaa.com/insurance/claimsview?id=YYY-YYYY-YYYY-YYYY');
    });

    it('should call getEnvironmentFromHost with current hostname', async () => {
      mockGetEnvironmentFromHost.mockReturnValue('dev1');

      const { navigateToClaimsViewRedesign } = await import('./backToHomeRedirectHelper');

      navigateToClaimsViewRedesign('some-guid');
      expect(mockGetEnvironmentFromHost).toHaveBeenCalledWith('appdev1.ace.aaa.com');
    });
  });
});
