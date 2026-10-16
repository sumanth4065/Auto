import { getBrandConfig } from '../utils/brandConfig';

export const WOLI_AUTO_EFNOL_TIME_FORMAT = 'MM/DD/YYYY';
export const WOLI_AUTO_EFNOL_REVIEW_PAGE_TIME_FORMAT = 'MM/DD/YYYY';
export const WOLI_AUTO_EFNOL_INCIDENT_TIME_FALLBACK = '12:00';

export const getCustomerServiceEmail = (brand: 'AAA' | 'WInsurance'): string =>
  getBrandConfig(brand).customerServiceEmail;
