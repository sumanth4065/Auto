import { getPolicyPrefix } from './getPolicyPrefix';

describe('getPolicyPrefix', () => {
  it('should return the policy prefix', () => {
    const policyNumber = 'CAA123456789';
    const policyPrefix = getPolicyPrefix(policyNumber);
    expect(policyPrefix).toEqual('CAA');
  });
  it('should return the policy prefix for a policy number with a non-alphanumeric character', () => {
    const policyNumber = 'CAA?123456789';
    const policyPrefix = getPolicyPrefix(policyNumber);
    expect(policyPrefix).toEqual('CAA');
  });
  it('should return the empty string for a policy number with a numbers only', () => {
    const policyNumber = '123456789';
    const policyPrefix = getPolicyPrefix(policyNumber);
    expect(policyPrefix).toEqual('');
  });
});
