import { IGetInitialDataResponse } from '@lib/types';

export type GetInitialDataSource = () => Promise<IGetInitialDataResponse>;

export function GetInitialDataContractTest(source: GetInitialDataSource) {
  describe('GetInitialDataSource', () => {
    it('returns expected GetInitialDataSource', async () => {
      const response = await source();
      expect(response).toHaveProperty('policyData');
      expect(response.policyData).toHaveProperty('policy');
      expect(response.policyData).toHaveProperty('claim');
      expect(response.policyData).toHaveProperty('clubCode');
      expect(response.policyData).toHaveProperty('mode');
      expect(response.policyData).toHaveProperty('EnableSplash');
      expect(response.policyData).toHaveProperty('SplashStart');
      expect(response.policyData).toHaveProperty('SplashEnd');
      expect(response.policyData).toHaveProperty('ERSURL');
    });
  });
}
