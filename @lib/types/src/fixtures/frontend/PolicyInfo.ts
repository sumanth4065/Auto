import { GetPolicyInfoAPIResult } from '../../enums';
import { IPolicyInfoAutoResponse } from '../../contracts/frontend/IGetAutoPolicy';

export const policyInfoResponseFixture: IPolicyInfoAutoResponse = {
  APIResult: GetPolicyInfoAPIResult.PolicyFound,
  data: {
    policyGeneralInfo: {
      policyType: 'Auto',
      policyClass: 'PPA',
      termEffectiveDate: '12/10/2020',
      termExpirationDate: '12/10/2021',
      inceptionDate: '12/10/2020',
      status: 'ACTIVE'
    }
  }
};
