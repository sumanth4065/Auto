import { ITenant, PolicyTypeAndTenantHelper } from '@ace-clublabs/iss-common-lambda-v3';
import {
  IPolicyConversionResult,
  ConversionType
} from '@ace-clublabs/iss-common-shared-claims-models';

/**
 * Mock policy conversion dataset for testing.
 * Maps legacy policy numbers to their GW equivalents and states.
 * Only valid for PSTAR_TO_GW conversion type.
 */
export const MOCK_POLICY_CONVERSION_DATA: Record<
  string,
  { gwPolicyNumber: string; state: string }
> = {
  A05441266: { gwPolicyNumber: 'AAR000202121', state: 'AR' },
  A05404136: { gwPolicyNumber: 'AAL000202006', state: 'AL' },
  A16301266: { gwPolicyNumber: 'ALA000201982', state: 'LA' },
  A18242411: { gwPolicyNumber: 'AIN000202158', state: 'IN' },
  A65147076: { gwPolicyNumber: 'AIL000198722', state: 'IL' },
  A68609876: { gwPolicyNumber: 'AMS000199412', state: 'MS' }
};

/**
 * Generates a mock conversion result for a given policy number.
 * Used when ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK is set to 'true'.
 */
export const generatePStarToGWMockConversionResult = (
  policyNumber: string
): IPolicyConversionResult | null => {
  const { tenant } = PolicyTypeAndTenantHelper.getTenantAndProductFromPolicyNumber(policyNumber);
  const mockData =
    tenant === ITenant.POLICYSTAR
      ? MOCK_POLICY_CONVERSION_DATA[policyNumber]
      : Object.values(MOCK_POLICY_CONVERSION_DATA).find(
          data => data.gwPolicyNumber === policyNumber
        );
  const legacyPolicyNumber =
    tenant === ITenant.POLICYSTAR
      ? policyNumber
      : Object.keys(MOCK_POLICY_CONVERSION_DATA).find(
          key => MOCK_POLICY_CONVERSION_DATA[key].gwPolicyNumber === policyNumber
        );

  if (!mockData) {
    return null;
  }

  return {
    isConversionApplicable: true,
    legacyPolicyNumber: legacyPolicyNumber!,
    targetPolicyNumber: mockData.gwPolicyNumber,
    targetEffectiveDate: '2026-05-01T00:00:00Z',
    policyState: mockData.state,
    conversionType: ConversionType.PSTAR_TO_GW
  };
};

/**
 * Checks if policy conversion mocking is enabled via environment variable.
 */
export const isPStarToGWMockingEnabled = (): boolean => {
  return process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK === 'true';
};
