import { IAutoPolicyInfoBackendResponse, IPolicyInfoAutoResponse } from '@lib/types';
import { GetPolicyInfoAPIResult } from '@lib/types';

export class DataMappingHelper {
  public static mapToIPolicyInfoResponse(
    incomingPolicyInfo: IAutoPolicyInfoBackendResponse
  ): IPolicyInfoAutoResponse {
    const convertedPolicyInfo: IPolicyInfoAutoResponse = {
      APIResult: GetPolicyInfoAPIResult.PolicyFound,
      data: {
        policyGeneralInfo: {
          policyType: incomingPolicyInfo.overview?.productType,
          termEffectiveDate: incomingPolicyInfo.overview?.effective?.start,
          termExpirationDate: incomingPolicyInfo.overview?.effective?.end,
          policyClass: incomingPolicyInfo.overview?.class,
          priorPolicyNumber: incomingPolicyInfo.overview?.priorPolicyNumber
        }
      }
    };

    return convertedPolicyInfo;
  }
}
