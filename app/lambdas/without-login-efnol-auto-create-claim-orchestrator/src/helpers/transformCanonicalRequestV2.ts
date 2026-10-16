import { IAutoCreateClaimCanonicalRequestV2 } from '@ace-clublabs/iss-common-auto-efnol-models';
import { ICreateAutoClaimRequest } from '@lib/types';

export const transformCanonicalRequestV2 = (
  body: ICreateAutoClaimRequest
): IAutoCreateClaimCanonicalRequestV2 => {
  const {
    policy: { policyNumber },
    lossDate,
    lossTime
  } = body;
  return {
    policyNumber,
    lossDate,
    lossTime
  };
};
