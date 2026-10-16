import { DataMappingHelper } from './dataMappingHelper';
import { guidewireBackendResponse } from '@lib/types';

describe('dataMappingHelper', () => {
  it('should map IAutoPolicyInfoResponse instance to IPolicyInfoBackendResponse', () => {
    const result = DataMappingHelper.mapToIPolicyInfoResponse(guidewireBackendResponse);

    expect(result).toEqual({
      APIResult: 'Policy Found',
      data: {
        policyGeneralInfo: {
          policyType: 'Auto',
          termEffectiveDate: '02/27/2024',
          termExpirationDate: '08/27/2024',
          policyClass: 'PPA',
          priorPolicyNumber: 'MOA189411101'
        }
      }
    });
  });

  it('should map IAutoPolicyInfoResponse instance to IPolicyInfoBackendResponse WHEN priorPolicyNumber is not present', () => {
    const backendResponse = {
      overview: {
        ...guidewireBackendResponse.overview,
        priorPolicyNumber: undefined
      }
    };
    const result = DataMappingHelper.mapToIPolicyInfoResponse(backendResponse);

    expect(result).toEqual({
      APIResult: 'Policy Found',
      data: {
        policyGeneralInfo: {
          policyType: 'Auto',
          termEffectiveDate: '02/27/2024',
          termExpirationDate: '08/27/2024',
          policyClass: 'PPA'
        }
      }
    });
  });
});
