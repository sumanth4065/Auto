import { IPolicyInfoAutoResponse } from '@lib/types';

export type GetAutoPolicyInfoSource = () => Promise<IPolicyInfoAutoResponse>;

export function GetAutoPolicyContractTest(source: GetAutoPolicyInfoSource) {
  describe('GetAutoPolicyInfoSource', () => {
    it('returns expected GetAutoPolicyInfoSource', async () => {
      const response = await source();
      expect(response).toHaveProperty('APIResult');
      expect(response.data).toHaveProperty('policyGeneralInfo');
      expect(response.data.policyGeneralInfo).toHaveProperty('policyType');
      expect(response.data.policyGeneralInfo).toHaveProperty('policyClass');
      expect(response.data.policyGeneralInfo).toHaveProperty('termEffectiveDate');
      expect(response.data.policyGeneralInfo).toHaveProperty('termExpirationDate');
    });
  });
}
