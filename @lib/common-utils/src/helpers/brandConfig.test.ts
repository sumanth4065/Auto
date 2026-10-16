import { getBrandConfig, getWInsuranceHomeUrl, getWInsuranceRoadsideUrl, WINSURANCE_EMAIL, WINSURANCE_PHONE } from './brandConfig';

describe('getWInsuranceHomeUrl', () => {
  it('returns prod URL for prod environment', () => {
    expect(getWInsuranceHomeUrl('prod')).toBe('https://w-insurance.com/claims');
  });

  it('returns staging URL for uat environment', () => {
    expect(getWInsuranceHomeUrl('uat')).toBe('https://staging.w-insurance.com/claims');
  });

  it('returns dev URL for dev environment', () => {
    expect(getWInsuranceHomeUrl('dev')).toBe('https://dev.w-insurance.com/claims');
  });

  it('returns dev URL for unknown environment', () => {
    expect(getWInsuranceHomeUrl('unknown')).toBe('https://dev.w-insurance.com/claims');
  });
});

describe('getWInsuranceRoadsideUrl', () => {
  it('returns prod URL for prod environment', () => {
    expect(getWInsuranceRoadsideUrl('prod')).toBe('https://roadside.w-insurance.com/gethelp');
  });

  it('returns uat URL for uat environment', () => {
    expect(getWInsuranceRoadsideUrl('uat')).toBe('https://roadside.uat.w-insurance.com/gethelp');
  });

  it('returns qa URL for dev environment', () => {
    expect(getWInsuranceRoadsideUrl('dev')).toBe('https://roadside.qa.w-insurance.com/gethelp');
  });

  it('returns qa URL for unknown environment', () => {
    expect(getWInsuranceRoadsideUrl('unknown')).toBe('https://roadside.qa.w-insurance.com/gethelp');
  });
});

describe('getBrandConfig', () => {
  describe('WInsurance', () => {
    it('returns correct phone and email', () => {
      const config = getBrandConfig('WInsurance', 'dev');
      expect(config.customerServicePhone).toBe(WINSURANCE_PHONE);
      expect(config.customerServiceEmail).toBe(WINSURANCE_EMAIL);
    });

    it('returns env-aware homeUrl for prod', () => {
      const config = getBrandConfig('WInsurance', 'prod');
      expect(config.homeUrl).toBe('https://w-insurance.com/claims');
    });

    it('returns env-aware homeUrl for uat', () => {
      const config = getBrandConfig('WInsurance', 'uat');
      expect(config.homeUrl).toBe('https://staging.w-insurance.com/claims');
    });

    it('returns env-aware homeUrl for dev', () => {
      const config = getBrandConfig('WInsurance', 'dev');
      expect(config.homeUrl).toBe('https://dev.w-insurance.com/claims');
    });

    it('returns env-aware roadsideUrl for prod', () => {
      expect(getBrandConfig('WInsurance', 'prod').roadsideUrl).toBe('https://roadside.w-insurance.com/gethelp');
    });

    it('returns env-aware roadsideUrl for uat', () => {
      expect(getBrandConfig('WInsurance', 'uat').roadsideUrl).toBe('https://roadside.uat.w-insurance.com/gethelp');
    });

    it('returns env-aware roadsideUrl for dev', () => {
      expect(getBrandConfig('WInsurance', 'dev').roadsideUrl).toBe('https://roadside.qa.w-insurance.com/gethelp');
    });
  });

  describe('AAA', () => {
    it('returns correct AAA values', () => {
      const config = getBrandConfig('AAA', 'dev');
      expect(config.brandName).toBe('AAA');
      expect(config.customerServicePhone).toBe('1-800-672-5246');
      expect(config.customerServiceEmail).toBe('ClaimsDocuments@ace.aaa.com');
      expect(config.homeUrl).toBe('https://www.aaa.com');
    });

    it('returns env-aware roadsideUrl for prod', () => {
      expect(getBrandConfig('AAA', 'prod').roadsideUrl).toBe('https://chat.ace.aaa.com');
    });

    it('returns env-aware roadsideUrl for non-prod', () => {
      expect(getBrandConfig('AAA', 'dev').roadsideUrl).toBe('https://qa.chat.ace.aaa.com');
    });
  });

  // --- ISS-18073: logoSrc in BrandConfig ---

  describe('logoSrc', () => {
    it('returns logoSrc for WInsurance brand', () => {
      const config = getBrandConfig('WInsurance', 'dev');
      expect(config.logoSrc).toBe('/winsurance-logo.svg');
    });

    it('does not set logoSrc for AAA brand (SCL handles default)', () => {
      const config = getBrandConfig('AAA', 'dev');
      expect(config.logoSrc).toBeUndefined(); 
    });
  });
});
