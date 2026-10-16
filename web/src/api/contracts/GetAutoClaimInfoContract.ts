import { IClaimsSummaryFrontendResponse } from '@lib/types';

export interface IGetAutoClaimInfoRequest {
  lossDate: string;
  policyNumber: string;
  timezone?: string;
}

export type GetAutoClaimInfoSource = (
  body: IGetAutoClaimInfoRequest
) => Promise<IClaimsSummaryFrontendResponse>;

export function GetAutoClaimContractTest(source: GetAutoClaimInfoSource) {
  describe('GetAutoClaimInfoSource', () => {
    it('returns expected GetAutoClaimInfoSource', async () => {
      const response = await source({ lossDate: '2024-01-01T00:00:00-07:00', policyNumber: 'TEST-001' });
      expect(response).toHaveProperty('APIResult');
      expect(response).toHaveProperty('claim');
      expect(response).toHaveProperty('duplicateClaimExists');

      if (response.duplicateClaimExists && response.claimFound) {
        expect(response.claimFound).toHaveProperty('claimNumber');
        expect(response.claimFound).toHaveProperty('lossDate');
        expect(response.claimFound).toHaveProperty('adjuster');
        expect(response.claimFound.adjuster).toHaveProperty('displayName');
        expect(response.claimFound.adjuster).toHaveProperty('email');
        expect(response.claimFound.adjuster).toHaveProperty('phoneNumber');
        expect(response.claimFound.adjuster).toHaveProperty('firstName');
        expect(response.claimFound.adjuster).toHaveProperty('lastName');
      } else {
        expect(response.claimFound).toBeUndefined();
      }
    });
  });
}
