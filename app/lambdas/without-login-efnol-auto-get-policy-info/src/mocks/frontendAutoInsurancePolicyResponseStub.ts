import { GetPolicyInfoAPIResult } from '@lib/types';

export const frontendAutoInsurancePolicyResponseStub = {
  APIResult: GetPolicyInfoAPIResult.PolicyFound,
  data: {
    policyGeneralInfo: {
      policyClass: 'PPA',
      termEffectiveDate: '01/08/2021',
      termExpirationDate: '01/07/2022',
      policyType: 'Auto'
    }
  }
};
