import { StatusCode } from 'status-code-enum';
import { vi, describe, it, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import { ILambdaProxyResponse } from '@lib/common-utils';
import { AppSource } from '@lib/types';
import {
  getAppUrl,
  getCustomerServiceHours,
  getCustomerServiceNumber,
  getHomeUrl,
  getLogoutUrl,
  errorType,
  navigateToErrorPage,
  navigateToHome,
  getRoadsideAssistanceUrl
} from './ComponentHelper';
import * as backToHomeRedirectHelper from './backToHomeRedirectHelper';


const mockError = {
  statusCode: StatusCode.ServerErrorInternal,
  headers: 'some-headers'
};

const mockLambdaError = {
  ...mockError,
  requestId: 'some-request-id',
  body: {
    error: {
      message: 'Unable to create auto claim'
    }
  }
};

const mockTimeoutError = {
  ...mockError,
  body: {
    error: { message: 'system timed out' }
  }
};

const mockPolicyError = {
  body: {
    error: { message: 'Unable to get policy info' }
  }
};

const mockKOError = {
  ...mockError,
  body: {
    error: { message: 'Not allowed to perform this operation' }
  }
};

const mockCallAutoPolicyFlowDirector = () => Promise.resolve();
const mockNavigateToMyAccountUrl = 'https://account.appdev1.ace.aaa.com';

const mockNavigate = vi.fn(vi.fn());

describe('ComponentHelper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(backToHomeRedirectHelper, 'callAutoPolicyFlowDirector')
      .mockImplementation(mockCallAutoPolicyFlowDirector);
    vi.spyOn(backToHomeRedirectHelper, 'navigateToMyAccount')
      .mockReturnValue(mockNavigateToMyAccountUrl);
    vi.spyOn(backToHomeRedirectHelper, 'navigateToClaimsView')
      .mockImplementation(
        (guid: string) => `https://appdev1.ace.aaa.com/insurance/claims/summary?id=${guid}`
      );
    vi.spyOn(backToHomeRedirectHelper, 'navigateToClaimsViewRedesign')
      .mockImplementation(
        (guid: string) => `https://appdev1.ace.aaa.com/insurance/claimsview?id=${guid}`
      );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  describe('errorType', () => {
    it('returns POLICY for policy info error', () => {
      const error: ILambdaProxyResponse = {
        statusCode: 500,
        requestId: 'some-request-id',
        body: { error: 'Unable to get policy info' }
      };
      const result = errorType(error);
      expect(result).toEqual('POLICY');
    });
    it('returns SYSTEM for unknown error', () => {
      const error: ILambdaProxyResponse = {
        statusCode: 400,
        requestId: 'some-request-id',
        body: { error: 'some unknown error' }
      };
      const result = errorType(error);
      expect(result).toEqual('SYSTEM');
    });
    it('returns POLICY for behind login policy number not found', () => {
      const error: ILambdaProxyResponse = {
        statusCode: 500,
        requestId: 'some-request-id',
        body: { error: 'Behind Login Policy number not found' }
      };
      const result = errorType(error);
      expect(result).toEqual('POLICY');
    });
    it('returns KO for not allowed to perform operation error', () => {
      const error: ILambdaProxyResponse = {
        statusCode: 500,
        requestId: 'some-request-id',
        body: { error: 'Not allowed to perform this operation' }
      };
      const result = errorType(error);
      expect(result).toEqual('KO');
    });
  });

  describe('navigates to error page', () => {
    it('when session times out', () => {
      navigateToErrorPage(mockTimeoutError, mockNavigate);
      expect(mockNavigate).toBeCalledWith('/error');
    });

    it('when lambda/system returns an error', () => {
      navigateToErrorPage(mockLambdaError, mockNavigate);
      expect(mockNavigate).toBeCalledWith('/error');
    });
  });

  describe('navigates to policy error page', () => {
    it('when policy is not active', () => {
      navigateToErrorPage(mockPolicyError, mockNavigate);
      expect(mockNavigate).toBeCalledWith('/policy-error');
    });
  });

  describe('navigates to knockout page', () => {
    it('when operation is not allowed', () => {
      navigateToErrorPage(mockKOError, mockNavigate);
      expect(mockNavigate).toBeCalledWith('/knockout');
    });
  });

  describe('gets home url', () => {
    it('ACE', () => {
      const result = getHomeUrl('004');
      expect(result).toEqual('https://www.ace.aaa.com');
    });

    it('ANE', () => {
      const result = getHomeUrl('240');
      expect(result).toEqual('https://northeast.aaa.com');
    });

    it('default', () => {
      const result = getHomeUrl('unknown');
      expect(result).toEqual('https://www.aaa.com');
    });
  });

  describe('navigateToHome', () => {
    const mockLocationReplace = vi.fn();

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { replace: mockLocationReplace, hostname: 'appdev1.ace.aaa.com' },
        writable: true
      });
      sessionStorage.clear();
    });

    it('navigates to club URL when no sourceApp', () => {
      navigateToHome('004', undefined, undefined);
      expect(mockLocationReplace).toHaveBeenCalledWith('https://www.ace.aaa.com');
    });

    it('navigates to default club URL for unknown club', () => {
      navigateToHome('unknown', undefined, undefined);
      expect(mockLocationReplace).toHaveBeenCalledWith('https://www.aaa.com');
    });

    it('calls callAutoPolicyFlowDirector for PolicyView with policy number', () => {
      navigateToHome('004', AppSource.PolicyView, '1234567890');
      expect(backToHomeRedirectHelper.callAutoPolicyFlowDirector).toHaveBeenCalledWith('1234567890', '004');
      expect(mockLocationReplace).not.toHaveBeenCalled();
    });

    it('falls back to club URL for PolicyView without policy number', () => {
      navigateToHome('004', AppSource.PolicyView, undefined);
      expect(backToHomeRedirectHelper.callAutoPolicyFlowDirector).not.toHaveBeenCalled();
      expect(mockLocationReplace).toHaveBeenCalledWith('https://www.ace.aaa.com');
    });

    it('calls navigateToMyAccount for MyAccount sourceApp', () => {
      navigateToHome('004', AppSource.MyAccount, undefined);
      expect(backToHomeRedirectHelper.navigateToMyAccount).toHaveBeenCalled();
      expect(mockLocationReplace).toHaveBeenCalledWith(mockNavigateToMyAccountUrl);
    });

    it('calls navigateToClaimsView for ClaimsView sourceApp with guid from sessionStorage', () => {
      sessionStorage.setItem('ClaimsViewGUID', 'XXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX');
      navigateToHome('004', AppSource.ClaimsView, undefined);
      expect(backToHomeRedirectHelper.navigateToClaimsView).toHaveBeenCalledWith(
        'XXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX'
      );
      expect(mockLocationReplace).toHaveBeenCalledWith(
        'https://appdev1.ace.aaa.com/insurance/claims/summary?id=XXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX'
      );
    });

    it('falls back to club URL for ClaimsView when no guid in sessionStorage', () => {
      navigateToHome('004', AppSource.ClaimsView, undefined);
      expect(backToHomeRedirectHelper.navigateToClaimsView).not.toHaveBeenCalled();
      expect(mockLocationReplace).toHaveBeenCalledWith('https://www.ace.aaa.com');
    });

    it('calls navigateToClaimsViewRedesign for ClaimsViewRedesign with guid from sessionStorage', () => {
      sessionStorage.setItem('ClaimsViewRedesignGUID', 'YYY-YYYY-YYYY-YYYY');
      navigateToHome('004', AppSource.ClaimsViewRedesign, undefined);
      expect(backToHomeRedirectHelper.navigateToClaimsViewRedesign).toHaveBeenCalledWith('YYY-YYYY-YYYY-YYYY');
      expect(mockLocationReplace).toHaveBeenCalledWith(
        'https://appdev1.ace.aaa.com/insurance/claimsview?id=YYY-YYYY-YYYY-YYYY'
      );
    });

    it('falls back to club URL for ClaimsViewRedesign when no guid in sessionStorage', () => {
      navigateToHome('004', AppSource.ClaimsViewRedesign, undefined);
      expect(backToHomeRedirectHelper.navigateToClaimsViewRedesign).not.toHaveBeenCalled();
      expect(mockLocationReplace).toHaveBeenCalledWith('https://www.ace.aaa.com');
    });
  });

  describe('gets customer service number', () => {
    it('ACE', () => {
      const result = getCustomerServiceNumber('004');
      expect(result).toEqual('1-800-672-5246');
    });

    it('ANE', () => {
      const result = getCustomerServiceNumber('240');
      expect(result).toEqual('1-800-672-5246');
    });

    it('default', () => {
      const result = getCustomerServiceNumber('unknown');
      expect(result).toEqual('1-800-672-5246');
    });
  });

  describe('gets customer service hours', () => {
    it('ACE', () => {
      const result = getCustomerServiceHours('004');
      expect(result).toEqual(['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm']);
    });

    it('ANE', () => {
      const result = getCustomerServiceHours('240');
      expect(result).toEqual([
        'Monday - Thursday: 8 a.m. to 7 p.m.',
        'Friday: 8 a.m. to 6 p.m.',
        'Saturday: 9 a.m. to 4 p.m.'
      ]);
    });

    it('default', () => {
      const result = getCustomerServiceHours('unknown');
      expect(result).toEqual([]);
    });
  });

  describe('gets logout url for ACE', () => {
    it('dev1', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appdev1.ace.aaa.com' } });
      const result = getLogoutUrl('004');

      expect(result).toEqual(
        'https://appdev1.ace.aaa.com/enterprise/identity/dev/?returnUrl=https://appdev1.ace.aaa.com/insurance/auto/file-a-claim?#/anonymous/logout'
      );
    });

    it('qa1', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appqa1.ace.aaa.com' } });
      const result = getLogoutUrl('004');

      expect(result).toEqual(
        'https://appqa1.ace.aaa.com/enterprise/identity/qa/?returnUrl=https://appqa1.ace.aaa.com/insurance/auto/file-a-claim?#/anonymous/logout'
      );
    });

    it('uat1', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appuat1.ace.aaa.com' } });
      const result = getLogoutUrl('004');

      expect(result).toEqual(
        'https://appuat1.ace.aaa.com/enterprise/identity/uat/?returnUrl=https://appuat1.ace.aaa.com/insurance/auto/file-a-claim?#/anonymous/logout'
      );
    });

    it('uat2', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appuat2.ace.aaa.com' } });
      const result = getLogoutUrl('004');

      expect(result).toEqual(
        'https://appuat1.ace.aaa.com/enterprise/identity/uat/?returnUrl=https://appuat2.ace.aaa.com/insurance/auto/file-a-claim?#/anonymous/logout'
      );
    });

    it('prod', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'app.ace.aaa.com' } });
      const result = getLogoutUrl('004');
      expect(result).toEqual(
        'https://app.ace.aaa.com/enterprise/identity/prod?returnUrl=https://app.ace.aaa.com/insurance/auto/file-a-claim?#/anonymous/logout'
      );
    });
  });

  describe('gets logout url for ANE', () => {
    it('dev1', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appdev1.ace.aaa.com' } });
      const result = getLogoutUrl('240');

      expect(result).toEqual(
        'https://appdev1.ace.aaa.com/enterprise/identity/dev/?returnUrl=https://appdev1.ace.aaa.com/insurance/auto/file-a-claim?#/anonymous/logout'
      );
    });

    it('qa1', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appqa1.ace.aaa.com' } });
      const result = getLogoutUrl('240');

      expect(result).toEqual(
        'https://appqa1.ace.aaa.com/enterprise/identity/qa/?returnUrl=https://appqa1.ace.aaa.com/insurance/auto/file-a-claim?#/anonymous/logout'
      );
    });

    it('uat1', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appuat1.ace.aaa.com' } });
      const result = getLogoutUrl('240');

      expect(result).toEqual(
        'https://appuat1.ace.aaa.com/enterprise/identity/uat/?returnUrl=https://appuat1.ace.aaa.com/insurance/auto/file-a-claim?#/anonymous/logout'
      );
    });

    it('uat2', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appuat2.ace.aaa.com' } });
      const result = getLogoutUrl('240');

      expect(result).toEqual(
        'https://appuat1.ace.aaa.com/enterprise/identity/uat/?returnUrl=https://appuat2.ace.aaa.com/insurance/auto/file-a-claim?#/anonymous/logout'
      );
    });

    it('prod', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'app.ace.aaa.com' } });
      const result = getLogoutUrl('240');
      expect(result).toEqual(
        'https://app.ace.aaa.com/enterprise/identity/prod?returnUrl=https://app.ace.aaa.com/insurance/auto/file-a-claim?#/anonymous/logout'
      );
    });
  });

  describe('gets app url for ANE', () => {
    it('dev1', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appdev1.ace.aaa.com' } });
      const result = getAppUrl('dev');

      expect(result).toEqual('https://appdev1.ace.aaa.com/insurance/auto/file-a-claim?');
    });

    it('qa1', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appqa1.ace.aaa.com' } });
      const result = getAppUrl('qa');

      expect(result).toEqual('https://appqa1.ace.aaa.com/insurance/auto/file-a-claim?');
    });

    it('uat1', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appuat1.ace.aaa.com' } });
      const result = getAppUrl('uat');

      expect(result).toEqual('https://appuat1.ace.aaa.com/insurance/auto/file-a-claim?');
    });

    it('uat2', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appuat2.ace.aaa.com' } });
      const result = getAppUrl('uat');

      expect(result).toEqual('https://appuat2.ace.aaa.com/insurance/auto/file-a-claim?');
    });

    it('prod', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'app.ace.aaa.com' } });
      const result = getAppUrl('prod');
      expect(result).toEqual('https://app.ace.aaa.com/insurance/auto/file-a-claim?');
    });
  });

  describe('getRoadsideAssistanceUrl', () => {
    it('returns AAA roadside URL when brand is AAA', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appdev1.ace.aaa.com' }, writable: true });

      const result = getRoadsideAssistanceUrl('AAA');

      expect(result).toBe('https://qa.chat.ace.aaa.com');
    });

    it('returns AAA prod roadside URL for prod environment', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'app.ace.aaa.com' }, writable: true });

      const result = getRoadsideAssistanceUrl('AAA');

      expect(result).toBe('https://chat.ace.aaa.com');
    });

    it('returns WInsurance roadside URL when brand is WInsurance', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appdev1.ace.aaa.com' }, writable: true });

      const result = getRoadsideAssistanceUrl('WInsurance');

      expect(result).toBe('https://roadside.qa.w-insurance.com/gethelp');
    });

    it('returns WInsurance prod roadside URL for prod environment', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'app.ace.aaa.com' }, writable: true });

      const result = getRoadsideAssistanceUrl('WInsurance');

      expect(result).toBe('https://roadside.w-insurance.com/gethelp');
    });

    it('defaults to AAA when brand is not provided', () => {
      Object.defineProperty(window, 'location', { value: { hostname: 'appdev1.ace.aaa.com' }, writable: true });

      const result = getRoadsideAssistanceUrl();

      expect(result).toBe('https://qa.chat.ace.aaa.com');
    });
  });

  describe('getCustomerServiceNumber with brand', () => {
    it('returns WInsurance phone when brand is WInsurance', () => {
      const result = getCustomerServiceNumber(undefined, 'WInsurance');
      expect(result).toBe('1-888-929-2252');
    });

    it('returns AAA phone when brand is AAA', () => {
      const result = getCustomerServiceNumber('240', 'AAA');
      expect(result).toBe('1-800-672-5246');
    });

    it('returns AAA phone when brand is not provided', () => {
      const result = getCustomerServiceNumber('240');
      expect(result).toBe('1-800-672-5246');
    });
  });

  describe('getHomeUrl with brand', () => {
    it('returns WInsurance homeUrl when brand is WInsurance', () => {
      const result = getHomeUrl('240', 'WInsurance');
      expect(result).toMatch(/w-insurance\.com\/claims$/);
    });

    it('returns clubCode-specific AAA homeUrl when brand is AAA', () => {
      const result = getHomeUrl('004', 'AAA');
      expect(result).toBe('https://www.ace.aaa.com');
    });

    it('returns AAA homeUrl when brand is not provided', () => {
      const result = getHomeUrl('240');
      expect(result).toBe('https://northeast.aaa.com');
    });

    it('uses clubCode-specific URL for AAA, not brandConfig homeUrl', () => {
      expect(getHomeUrl('004')).toBe('https://www.ace.aaa.com');
      expect(getHomeUrl('240')).toBe('https://northeast.aaa.com');
      expect(getHomeUrl('018')).toBe('https://www.aaa.com');
    });

    it('WInsurance brand overrides clubCode-based URL', () => {
      const result = getHomeUrl('004', 'WInsurance');
      expect(result).toMatch(/w-insurance\.com\/claims$/);
      expect(result).not.toContain('ace.aaa.com');
    });
  });
});
