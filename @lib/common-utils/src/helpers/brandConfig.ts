export interface BrandConfig {
  brandName: string;
  logoAltText: string;
  logoSrc?: string;
  customerServicePhone: string;
  customerServiceEmail: string;
  homeUrl: string;
  roadsideUrl: string;
  chatUrl?: string;
  faqUrl?: string;
  policyNumberDigits?: number;
}

export const WINSURANCE_PHONE = '1-888-929-2252';
export const WINSURANCE_EMAIL = 'ClaimsDocuments@ace.aaa.com';

export const getWInsuranceHomeUrl = (env: string): string => {
  switch (env) {
    case 'prod':
      return 'https://w-insurance.com/claims';
    case 'uat':
      return 'https://staging.w-insurance.com/claims';
    default:
      return 'https://dev.w-insurance.com/claims';
  }
};

export const getWInsuranceRoadsideUrl = (env: string): string => {
  switch (env) {
    case 'prod':
      return 'https://roadside.w-insurance.com/gethelp';
    case 'uat':
      return 'https://roadside.uat.w-insurance.com/gethelp';
    default:
      return 'https://roadside.qa.w-insurance.com/gethelp';
  }
};

const getAaaRoadsideUrl = (env: string): string =>
  env === 'prod' ? 'https://chat.ace.aaa.com' : 'https://qa.chat.ace.aaa.com';

const AAA_BASE_CONFIG: Omit<BrandConfig, 'roadsideUrl'> = {
  brandName: 'AAA',
  logoAltText: 'AAA logo',
  customerServicePhone: '1-800-672-5246',
  customerServiceEmail: 'ClaimsDocuments@ace.aaa.com',
  homeUrl: 'https://www.aaa.com'
};

const WINSURANCE_BASE_CONFIG: Omit<BrandConfig, 'homeUrl' | 'roadsideUrl'> = {
  brandName: 'WInsurance',
  logoAltText: 'WInsurance logo',
  logoSrc: '/winsurance-logo.svg',
  customerServicePhone: WINSURANCE_PHONE,
  customerServiceEmail: WINSURANCE_EMAIL
};

export const getBrandConfig = (brand: 'AAA' | 'WInsurance', env: string): BrandConfig => {
  if (brand === 'WInsurance') {
    return {
      ...WINSURANCE_BASE_CONFIG,
      homeUrl: getWInsuranceHomeUrl(env),
      roadsideUrl: getWInsuranceRoadsideUrl(env)
    };
  }
  return { ...AAA_BASE_CONFIG, roadsideUrl: getAaaRoadsideUrl(env) };
};
