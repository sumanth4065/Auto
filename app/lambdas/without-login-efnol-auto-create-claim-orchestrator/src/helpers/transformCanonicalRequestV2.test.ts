import { createAutoClaimRequestFixture } from '@lib/types';
import { transformCanonicalRequestV2 } from './transformCanonicalRequestV2';

describe('transformCanonicalRequestV2', () => {
  it('transforms create claim canonical request into private v2 create claim body', () => {
    const result = transformCanonicalRequestV2(createAutoClaimRequestFixture);

    expect(result).toEqual({
      policyNumber: 'CAA047514589',
      lossDate: '2022-10-01T07:00:00.000Z',
      lossTime: '14:05'
    });
  });
});
