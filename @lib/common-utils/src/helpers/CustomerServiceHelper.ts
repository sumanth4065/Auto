import { getWInsuranceHomeUrl, WINSURANCE_PHONE } from './brandConfig';

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
    hours: ['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm'],
    url: 'https://www.aaa.com'
  }
};

export const getHomeUrl = (clubCode?: string, brand?: 'AAA' | 'WInsurance') => {
  if (brand === 'WInsurance') {
    return getWInsuranceHomeUrl(process.env.ENVIRONMENT!);
  }
  return AAA_CENTERS.hasOwnProperty(clubCode) ? AAA_CENTERS[clubCode].url : AAA_CENTERS.default.url;
};

export const getCustomerServiceNumber = (clubCode?: string, brand?: 'AAA' | 'WInsurance') => {
  if (brand === 'WInsurance') {
    return WINSURANCE_PHONE;
  }
  return AAA_CENTERS.hasOwnProperty(clubCode)
    ? AAA_CENTERS[clubCode].number
    : AAA_CENTERS.default.number;
};

export const getCustomerServiceNumberAbbr = (clubCode?: string, brand?: 'AAA' | 'WInsurance') => {
  if (brand === 'WInsurance') {
    return WINSURANCE_PHONE.replace(/-/g, '');
  }
  return AAA_CENTERS.hasOwnProperty(clubCode)
    ? AAA_CENTERS[clubCode].number.replace(/-/g, '')
    : AAA_CENTERS.default.number.replace(/-/g, '');
};

export const getCustomerServiceHours = (clubCode?: string) => {
  return AAA_CENTERS.hasOwnProperty(clubCode)
    ? AAA_CENTERS[clubCode].hours
    : AAA_CENTERS.default.hours;
};
