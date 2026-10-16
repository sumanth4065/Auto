import { GetPolicyInfoAPIResult, IPolicyInfoAutoResponse } from '@lib/types';

export const transformedCCIPolicyInfoStub: IPolicyInfoAutoResponse = {
  APIResult: GetPolicyInfoAPIResult.PolicyFound,
  data: {
    policyGeneralInfo: {
      policyClass: 'some-subType',
      policyType: 'some-policyType',
      termEffectiveDate: 'some-termInceptionDate',
      termExpirationDate: 'some-expirationDate',
      priorPolicyNumber: 'some-priorPolicy'
    }
  }
};
