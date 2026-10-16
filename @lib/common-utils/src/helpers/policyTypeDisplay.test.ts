import { homePolicyTypeDisplay } from './policyTypeDisplay';

describe('homePolicyTypeDisplay translates the policyType and policyPrefix to the proper policyType display for confirm and submit page', () => {
  it('when the policy is CEA prefix and policyType starts with "HO" then it should return "Homeowner (CEA)"', () => {
    expect(homePolicyTypeDisplay('HO', 'CEA123456789')).toStrictEqual(
      'Homeowner (CEA)'
    );
  });
  it('when the policy is CEA prefix and policyType is "TEN" then it should return "Renters (CEA)"', () => {
    expect(homePolicyTypeDisplay('TEN', 'CEA123456789')).toStrictEqual(
      'Renters (CEA)'
    );
  });
  it('when the policy is not CEA prefix and policyType is "TEN" then it should return "Renters"', () => {
    expect(homePolicyTypeDisplay('TEN', 'TEN123456789')).toStrictEqual(
      'Renters'
    );
  });
  it('when the policy is not CEA prefix and policyType starts with "HO" then it should return "Homeowner"', () => {
    expect(homePolicyTypeDisplay('HOA', 'CHO123456789')).toStrictEqual(
      'Homeowner'
    );
  });
  it('when the policy is not CEA prefix and policyType is "RDP" then it should return "Rental Dwelling Property"', () => {
    expect(homePolicyTypeDisplay('RDP', 'CHO123456789')).toStrictEqual(
      'Rental Dwelling Property'
    );
  });
  it('when the policy is not CEA prefix and policyType is "CON" then it should return "Homeowner"', () => {
    expect(homePolicyTypeDisplay('CON', 'CHO123456789')).toStrictEqual('Condo');
  });
  it('when the policy is not CEA prefix and policyType other than listed above or empty it should return "Homeowner"', () => {
    expect(homePolicyTypeDisplay('', 'CEA123456789')).toStrictEqual('Pending');
    expect(homePolicyTypeDisplay('SEL', 'CAA123456789')).toStrictEqual(
      'Pending'
    );
  });

  it('should return guidewire home policy type', () => {
    const result = homePolicyTypeDisplay('HMO', 'HMO123456789');
    expect(result).toEqual('Missouri Home');
  });
});
