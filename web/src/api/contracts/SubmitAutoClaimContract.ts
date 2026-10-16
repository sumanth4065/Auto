import {
  submitAutoClaimCarDrivenWithOneOtherParty,
  ISubmitAutoClaimFrontendRequest,
  ISubmitAutoClaimFrontendResponse
} from '@lib/types';

export type SubmitAutoClaimSource = (
  request: ISubmitAutoClaimFrontendRequest
) => Promise<ISubmitAutoClaimFrontendResponse>;

export function SubmitAutoClaimContractTest(source: SubmitAutoClaimSource) {
  describe('SubmitAutoClaimSource', () => {
    it('returns expected SubmitAutoClaimSource', async () => {
      const response = await source(submitAutoClaimCarDrivenWithOneOtherParty);
      expect(response).toHaveProperty('APIResult');
      expect(response.adjuster).toHaveProperty('firstName');
      expect(response.adjuster).toHaveProperty('lastName');
      expect(response.adjuster).toHaveProperty('phoneNumber');
      expect(response.adjuster).toHaveProperty('email');
    });
  });
}
