import {
  createAutoClaimRequestFixture,
  ICreateAutoClaimRequest,
  ICreateAutoClaimResponse
} from '@lib/types';

export type CreateAutoClaimSource = (
  request: ICreateAutoClaimRequest
) => Promise<ICreateAutoClaimResponse>;

export function CreateAutoClaimContractTest(source: CreateAutoClaimSource) {
  describe('CreateAutoClaimSource', () => {
    it('returns expected CreateAutoClaimSource', async () => {
      const response = await source(createAutoClaimRequestFixture);
      expect(response).toHaveProperty('APIResult');
      expect(response).toHaveProperty('claimNumber');
      expect(response).toHaveProperty('vehicleSummaries');
      expect(response).toHaveProperty('driverSummaries');
    });
  });
}
