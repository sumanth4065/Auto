import {
  generatePStarToGWMockConversionResult,
  isPStarToGWMockingEnabled,
  MOCK_POLICY_CONVERSION_DATA
} from './mockPolicyConversionData';

describe('mockPolicyConversionData', () => {
  afterEach(() => {
    delete process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK;
  });

  describe('MOCK_POLICY_CONVERSION_DATA', () => {
    it('should contain all 6 test policies', () => {
      expect(Object.keys(MOCK_POLICY_CONVERSION_DATA)).toHaveLength(6);
    });

    it('should map legacy policy to correct GW policy and state', () => {
      expect(MOCK_POLICY_CONVERSION_DATA['A05441266']).toEqual({
        gwPolicyNumber: 'AAR000202121',
        state: 'AR'
      });
    });

    it('should contain all required policy mappings', () => {
      const expectedPolicies = [
        'A05441266',
        'A05404136',
        'A16301266',
        'A18242411',
        'A65147076',
        'A68609876'
      ];
      expectedPolicies.forEach(policy => {
        expect(MOCK_POLICY_CONVERSION_DATA[policy]).toBeDefined();
      });
    });
  });

  describe('generateMockConversionResult', () => {
    it('should return null for unknown policy number', () => {
      const result = generatePStarToGWMockConversionResult('UNKNOWN123456');
      expect(result).toBeNull();
    });

    it('should return conversion result for known policy', () => {
      const result = generatePStarToGWMockConversionResult('A05441266');
      expect(result).not.toBeNull();
      expect(result?.isConversionApplicable).toBe(true);
      expect(result?.legacyPolicyNumber).toBe('A05441266');
      expect(result?.targetPolicyNumber).toBe('AAR000202121');
      expect(result?.policyState).toBe('AR');
      expect(result?.conversionType).toBe('PSTAR_TO_GW');
    });

    it('should set targetEffectiveDate to today', () => {
      const today = '2026-05-01T00:00:00Z';
      const result = generatePStarToGWMockConversionResult('A05404136');
      expect(result?.targetEffectiveDate).toBe(today);
    });

    it('should return correct data for AL policy', () => {
      const result = generatePStarToGWMockConversionResult('A05404136');
      expect(result).toEqual({
        isConversionApplicable: true,
        legacyPolicyNumber: 'A05404136',
        targetPolicyNumber: 'AAL000202006',
        policyState: 'AL',
        conversionType: 'PSTAR_TO_GW',
        targetEffectiveDate: expect.any(String)
      });
    });

    it('should return correct data for all mock policies', () => {
      const testCases = [
        { input: 'A16301266', expectedState: 'LA', expectedGW: 'ALA000201982' },
        { input: 'A18242411', expectedState: 'IN', expectedGW: 'AIN000202158' },
        { input: 'A65147076', expectedState: 'IL', expectedGW: 'AIL000198722' },
        { input: 'A68609876', expectedState: 'MS', expectedGW: 'AMS000199412' }
      ];

      testCases.forEach(({ input, expectedState, expectedGW }) => {
        const result = generatePStarToGWMockConversionResult(input);
        expect(result?.policyState).toBe(expectedState);
        expect(result?.targetPolicyNumber).toBe(expectedGW);
        expect(result?.isConversionApplicable).toBe(true);
      });
    });
  });

  describe('isMockingEnabled', () => {
    it('should return false when ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK is not set', () => {
      expect(isPStarToGWMockingEnabled()).toBe(false);
    });

    it('should return false when ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK is "false"', () => {
      process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK = 'false';
      expect(isPStarToGWMockingEnabled()).toBe(false);
    });

    it('should return false when ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK is any other value', () => {
      process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK = '1';
      expect(isPStarToGWMockingEnabled()).toBe(false);

      process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK = 'yes';
      expect(isPStarToGWMockingEnabled()).toBe(false);

      process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK = 'enabled';
      expect(isPStarToGWMockingEnabled()).toBe(false);
    });

    it('should return true when ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK is "true"', () => {
      process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK = 'true';
      expect(isPStarToGWMockingEnabled()).toBe(true);
    });
  });
});
