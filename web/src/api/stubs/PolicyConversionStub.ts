import {
  ConversionType,
  type IPolicyConversionResult
} from '@ace-clublabs/iss-common-shared-claims-models';
import { PolicyConversionSource } from '../contracts';

export const PolicyConversionStub: PolicyConversionSource =
  async (): Promise<IPolicyConversionResult> => {
    return Promise.resolve({
      isConversionApplicable: false,
      legacyPolicyNumber: 'CAA123456789',
      targetPolicyNumber: 'CAA123456789',
      targetEffectiveDate: undefined,
      conversionType: ConversionType.PSTAR_TO_GW
    });

    // return Promise.resolve({
    //   isConversionApplicable: true,
    //   legacyPolicyNumber: 'A12345678',
    //   targetPolicyNumber: 'CAA123456789',
    //   targetEffectiveDate: '2026-07-01T00:00:00.000Z',
    //   conversionType: ConversionType.PSTAR_TO_GW
    // });
  };
