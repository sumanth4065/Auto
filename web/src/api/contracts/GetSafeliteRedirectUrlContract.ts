import { ISafeliteRedirectUrlResponse } from '@lib/types';

export type GetSafeliteRedirectUrlSource = () => Promise<ISafeliteRedirectUrlResponse>;

export function GetSafeliteRedirectUrlContractTest(source: GetSafeliteRedirectUrlSource) {
  describe('GetRedirectToSafeliteSource', () => {
    it('returns expected response.data', async () => {
      const response = await source();
      expect(response).toHaveProperty('message');
    });
  });
}
