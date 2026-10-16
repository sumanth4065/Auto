import { useNavigate } from 'react-router';
import { getEnvironmentFromHost } from '@ace-clublabs/log-cannon';
import { ILambdaProxyResponse } from '@lib/common-utils';
import { Pages } from '../shared/pages';
import { AppSource } from '@lib/types';
import * as backToHomeRedirectHelper from './backToHomeRedirectHelper';
import { getBrandConfig } from './brandConfig';

// @TODO besides ANE & ACE, please correct URL for all other markets

export const AAA_CENTERS = {
  '004': {
    number: '1-800-672-5246',
    hours: ['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm'],
    url: 'https://www.ace.aaa.com'
  },
  '018': {
    number: '1-800-672-5246',
    hours: ['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm'],
    url: 'https://www.aaa.com'
  },
  '036': {
    number: '1-800-672-5246',
    hours: ['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm'],
    url: 'https://www.aaa.com'
  },
  '065': {
    number: '1-800-672-5246',
    hours: ['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm'],
    url: 'https://www.aaa.com'
  },
  '188': {
    number: '1-800-672-5246',
    hours: ['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm'],
    url: 'https://www.aaa.com'
  },
  '215': {
    number: '1-800-672-5246',
    hours: ['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm'],
    url: 'https://www.aaa.com'
  },
  '240': {
    number: '1-800-672-5246',
    hours: [
      'Monday - Thursday: 8 a.m. to 7 p.m.',
      'Friday: 8 a.m. to 6 p.m.',
      'Saturday: 9 a.m. to 4 p.m.'
    ],
    url: 'https://northeast.aaa.com'
  },
  '252': {
    number: '1-800-672-5246',
    hours: ['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm'],
    url: 'https://www.aaa.com'
  },
  '258': {
    number: '1-800-672-5246',
    hours: ['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm'],
    url: 'https://www.aaa.com'
  },
  '601': {
    number: '1-800-672-5246',
    hours: ['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm'],
    url: 'https://www.aaa.com'
  },
  default: {
    number: '1-800-672-5246',
    hours: [],
    url: 'https://www.aaa.com'
  }
};

export const getBackButtonLabel = (currentPath: string) => {
  switch (currentPath) {
    case Pages.SessionTimedOut:
    case Pages.PolicyError:
    case Pages.SystemError:
    case Pages.Knockout:
      return 'Back to home';
    default:
      return 'Back';
  }
};

export const getHomeUrl = (clubCode: string = '240', brand?: 'AAA' | 'WInsurance'): string => {
  if (brand === 'WInsurance') {
    return getBrandConfig('WInsurance').homeUrl;
  }
  return AAA_CENTERS.hasOwnProperty(clubCode) ? AAA_CENTERS[clubCode].url : AAA_CENTERS.default.url;
};

export const navigateToHome = (
  clubCode: string = '240',
  sourceApp: AppSource | undefined,
  policyNumber: string | undefined,
  brand?: 'AAA' | 'WInsurance',
): void => {
  if (sourceApp) {
    switch (sourceApp) {
      case AppSource.PolicyView:
        if (policyNumber) {
          backToHomeRedirectHelper.callAutoPolicyFlowDirector(policyNumber, clubCode);
          return;
        }
        break;
      case AppSource.MyAccount:
        window.location.replace(backToHomeRedirectHelper.navigateToMyAccount());
        return;
      case AppSource.ClaimsViewRedesign: {
        const claimsViewRedesignGuid = sessionStorage.getItem('ClaimsViewRedesignGUID');
        if (claimsViewRedesignGuid) {
          window.location.replace(backToHomeRedirectHelper.navigateToClaimsViewRedesign(claimsViewRedesignGuid));
          return;
        }
        break;
      }
      case AppSource.ClaimsView: {
        const claimsViewGuid = sessionStorage.getItem('ClaimsViewGUID');
        if (claimsViewGuid) {
          window.location.replace(backToHomeRedirectHelper.navigateToClaimsView(claimsViewGuid));
          return;
        }
        break;
      }
      default:
        break;
    }
  }

  window.location.replace(getHomeUrl(clubCode, brand));
};



export const getCustomerServiceNumber = (clubCode: string = '240', brand?: 'AAA' | 'WInsurance') => {
  if (brand === 'WInsurance') {
    return getBrandConfig('WInsurance').customerServicePhone;
  }
  return AAA_CENTERS.hasOwnProperty(clubCode)
    ? AAA_CENTERS[clubCode].number
    : AAA_CENTERS.default.number;
};

export const getCustomerServiceHours = (clubCode: string = '240') => {
  return AAA_CENTERS.hasOwnProperty(clubCode)
    ? AAA_CENTERS[clubCode].hours
    : AAA_CENTERS.default.hours;
};

export const URLS = {
  prod: {
    app: 'https://app.ace.aaa.com/insurance/auto/file-a-claim?',
    logout:
      'https://app.ace.aaa.com/enterprise/identity/prod?returnUrl={{returnUrl}}#/anonymous/logout'
  },
  default: {
    app: 'https://app{{env}}{{affinity}}.ace.aaa.com/insurance/auto/file-a-claim?',
    logout:
      'https://app{{env}}1.ace.aaa.com/enterprise/identity/{{env}}/?returnUrl={{returnUrl}}#/anonymous/logout'
  }
};

export const getAppUrl = env => {
  switch (env) {
    case PROD:
      return URLS.prod.app;
    default: {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const affinity = hostname.includes('2') ? '2' : '1';
      return URLS.default.app.replace(/{{env}}/g, env).replace(/{{affinity}}/, affinity);
    }
  }
};

const PROD = 'prod';

export const getLogoutUrl = (clubCode: string = '240'): string => {
  const env: string = getEnvironmentFromHost();
  const returnUrl: string = getAppUrl(env);

  switch (env) {
    case PROD:
      return URLS.prod.logout.replace(/{{returnUrl}}/, returnUrl);
    default:
      return URLS.default.logout.replace(/{{env}}/g, env).replace(/{{returnUrl}}/, returnUrl);
  }
};

export const POLICY_ERRORS: string[] = [
  'unable to get policy info',
  'behind login policy number not found'
];
export const KO_ERRORS: string[] = ['not allowed to perform this operation'];
const enum ErrorType {
  'KO' = 'KO',
  'SYSTEM' = 'SYSTEM',
  'POLICY' = 'POLICY'
}

export const errorType = (error: ILambdaProxyResponse) => {
  if (!error) return ErrorType.SYSTEM;

  const errorMessage = JSON.stringify(error).toLowerCase().trim();
  const isPolicyError = Boolean(
    POLICY_ERRORS.find(policyError => errorMessage.includes(policyError))
  );

  const isKOError = Boolean(KO_ERRORS.find(koError => errorMessage.includes(koError)));

  if (isKOError) {
    return ErrorType.KO;
  } else if (isPolicyError) {
    return ErrorType.POLICY;
  } else {
    return ErrorType.SYSTEM;
  }
};

export const navigateToErrorPage = (error: any, navigate: typeof useNavigate.prototype) => {
  const type = errorType(error);
  switch (type) {
    case ErrorType.KO:
      navigate(Pages.Knockout);
      break;
    case ErrorType.POLICY:
      navigate(Pages.PolicyError);
      break;
    default:
      navigate(Pages.SystemError);
      break;
  }
};

export const getRoadsideAssistanceUrl = (brand?: 'AAA' | 'WInsurance'): string =>
  getBrandConfig(brand ?? 'AAA').roadsideUrl;
