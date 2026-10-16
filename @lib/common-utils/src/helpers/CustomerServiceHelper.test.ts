import {
  getCustomerServiceHours,
  getCustomerServiceNumber,
  getCustomerServiceNumberAbbr,
  getHomeUrl
} from './CustomerServiceHelper';

describe('CustomerServiceHelper', () => {
  describe('gets home url', () => {
    it('ACE', () => {
      const result = getHomeUrl('004');
      expect(result).toEqual('https://www.ace.aaa.com');
    });

    it('ANE', () => {
      const result = getHomeUrl('240');
      expect(result).toEqual('https://northeast.aaa.com');
    });

    it('unknown', () => {
      const result = getHomeUrl('unknown');
      expect(result).toEqual('https://www.aaa.com');
    });

    it('undefined', () => {
      const result = getHomeUrl();
      expect(result).toEqual('https://www.aaa.com');
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

    it('unknown', () => {
      const result = getCustomerServiceNumber('unknown');
      expect(result).toEqual('1-800-672-5246');
    });

    it('undefined', () => {
      const result = getCustomerServiceNumber();
      expect(result).toEqual('1-800-672-5246');
    });
  });

  describe('gets home url with brand', () => {
    it('returns WInsurance prod URL when brand is WInsurance and ENVIRONMENT is prod', () => {
      process.env.ENVIRONMENT = 'prod';
      const result = getHomeUrl(undefined, 'WInsurance');
      expect(result).toBe('https://w-insurance.com/claims');
      delete process.env.ENVIRONMENT;
    });

    it('returns WInsurance dev URL when brand is WInsurance and ENVIRONMENT is unset', () => {
      delete process.env.ENVIRONMENT;
      const result = getHomeUrl(undefined, 'WInsurance');
      expect(result).toBe('https://dev.w-insurance.com/claims');
    });

    it('returns AAA URL when brand is AAA', () => {
      const result = getHomeUrl('004', 'AAA');
      expect(result).toBe('https://www.ace.aaa.com');
    });

    it('returns AAA URL when brand is not provided', () => {
      const result = getHomeUrl('240');
      expect(result).toBe('https://northeast.aaa.com');
    });
  });

  describe('gets customer service number with brand', () => {
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

  describe('gets customer service number abbr with brand', () => {
    it('returns WInsurance phone abbr when brand is WInsurance', () => {
      const result = getCustomerServiceNumberAbbr(undefined, 'WInsurance');
      expect(result).toBe('18889292252');
    });

    it('returns AAA phone abbr when brand is AAA', () => {
      const result = getCustomerServiceNumberAbbr('240', 'AAA');
      expect(result).toBe('18006725246');
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

    it('unknown', () => {
      const result = getCustomerServiceHours('unknown');
      expect(result).toEqual(['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm']);
    });

    it('undefined', () => {
      const result = getCustomerServiceHours(undefined);
      expect(result).toEqual(['Monday through Friday: 7am to 9pm', 'Saturday: 8am to 5pm']);
    });
  });
});
