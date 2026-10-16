import { describe, it, expect, vi } from 'vitest';
import * as LogCannon from '@ace-clublabs/log-cannon';
import { getBrandConfig, BrandConfig } from './brandConfig';

describe('getBrandConfig', () => {
  it('returns a valid BrandConfig for AAA', () => {
    const config: BrandConfig = getBrandConfig('AAA');
    expect(config.brandName).toBe('AAA');
    expect(config.customerServicePhone).toBeTruthy();
    expect(config.customerServiceEmail).toBe('ClaimsDocuments@ace.aaa.com');
    expect(config.homeUrl).toBeTruthy();
    expect(config.logoAltText).toBeTruthy();
  });

  it('returns a valid BrandConfig for WInsurance', () => {
    const config: BrandConfig = getBrandConfig('WInsurance');
    expect(config.brandName).toBe('WInsurance');
    expect(config.customerServicePhone).toBeDefined();
    expect(config.customerServiceEmail).toBeDefined();
    expect(config.homeUrl).toBeDefined();
    expect(config.logoAltText).toBeTruthy();
  });

  it('returns different configs for AAA and WInsurance', () => {
    const aaaConfig = getBrandConfig('AAA');
    const wConfig = getBrandConfig('WInsurance');
    expect(aaaConfig.brandName).not.toBe(wConfig.brandName);
  });

  describe('AAA URL mapping', () => {
    it('returns https://www.aaa.com as homeUrl', () => {
      const config = getBrandConfig('AAA');
      expect(config.homeUrl).toBe('https://www.aaa.com');
    });
  });

  describe('WInsurance URL mapping by environment', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns prod URL when environment is prod', () => {
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('prod');
      const config = getBrandConfig('WInsurance');
      expect(config.homeUrl).toBe('https://w-insurance.com/claims');
    });

    it('returns staging URL when environment is uat', () => {
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('uat');
      const config = getBrandConfig('WInsurance');
      expect(config.homeUrl).toBe('https://staging.w-insurance.com/claims');
    });

    it('returns dev URL when environment is dev', () => {
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('dev');
      const config = getBrandConfig('WInsurance');
      expect(config.homeUrl).toBe('https://dev.w-insurance.com/claims');
    });

    it('returns dev URL when environment is qa', () => {
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('qa');
      const config = getBrandConfig('WInsurance');
      expect(config.homeUrl).toBe('https://dev.w-insurance.com/claims');
    });

    it('returns dev URL when environment is localhost', () => {
      vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue('localhost');
      const config = getBrandConfig('WInsurance');
      expect(config.homeUrl).toBe('https://dev.w-insurance.com/claims');
    });
  });
});
