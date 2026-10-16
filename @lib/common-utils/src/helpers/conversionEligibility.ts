import type { IContext } from '@ace-clublabs/aws-lambda-v3';
import type { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import {
  inferStateAcronymFromPolicyPrefix,
  ITenant,
  PolicyTypeAndTenantHelper
} from '@ace-clublabs/iss-common-lambda-v3';
import {
  ConversionType,
  type IPolicyConversionResult
} from '@ace-clublabs/iss-common-shared-claims-models';
import {
  LoginFlowType,
  EfnolApplication
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { FeatureFlagService, Features } from '@ace-clublabs/feature-flags';
import { policyConversionCheck } from './policyConversionHelper';

/**
 * Builds a no-conversion sentinel result when the policy is ineligible for
 * conversion (feature flag off, wrong tenant, state not in allowed list, etc.).
 */
export const noConversionResult = (
  policyNumber: string,
  conversionType?: ConversionType
): IPolicyConversionResult => ({
  isConversionApplicable: false,
  legacyPolicyNumber: policyNumber,
  targetPolicyNumber: policyNumber,
  targetEffectiveDate: undefined,
  policyState: undefined,
  conversionType
});

/**
 * PStar → GW eligibility checker.
 *
 * Gates (in order):
 * 1. Tenant must be GUIDEWIRE or POLICYSTAR.
 * 2. The EFNOLPStarConversionStates feature flag must be 'on'.
 * 3. For GW policies only: the inferred state abbreviation must appear in the
 *    flag's Dynamic Configuration map with `auto: true`.
 *
 * PStar policies bypass the state check and proceed directly to the downstream
 * conversion API call.
 */
const checkPStarToGWEligibility = async (
  policyNumber: string,
  conversionType: ConversionType,
  token: string,
  context: IContext,
  featureFlagService: FeatureFlagService,
  logger: MaskedLogger,
  requestHeaders: {
    [key: string]: string;
  },
  loginFlowType: LoginFlowType,
  efnolApplication?: EfnolApplication
): Promise<IPolicyConversionResult> => {
  const logInfo = { policyNumber, conversionType };

  // Tenant gate
  const { tenant } =
    PolicyTypeAndTenantHelper.getTenantAndProductFromPolicyNumber(policyNumber);
  if (tenant !== ITenant.GUIDEWIRE && tenant !== ITenant.POLICYSTAR) {
    logger.info('Tenant not eligible for PStar→GW conversion', {
      ...logInfo,
      tenant
    });
    return noConversionResult(policyNumber, conversionType);
  }

  // GW-specific state eligibility — PStar policies skip this block
  if (tenant === ITenant.GUIDEWIRE) {
    const stateAcronym = inferStateAcronymFromPolicyPrefix(policyNumber);
    if (!stateAcronym) {
      logger.info('Could not infer state from GW policy number', logInfo);
      return noConversionResult(policyNumber, conversionType);
    }

    const { treatment, config } =
      await featureFlagService.getTreatmentWithConfig(
        'efnol',
        Features.EFNOLPStarConversionStates
      );

    if (treatment !== 'on') {
      logger.info(
        `Conversion flag '${Features.EFNOLPStarConversionStates}' is off`,
        logInfo
      );
      return noConversionResult(policyNumber, conversionType);
    }

    if (!config) {
      logger.error(
        `Feature flag '${Features.EFNOLPStarConversionStates}' is missing Dynamic Configuration`,
        logInfo
      );
      throw new Error(
        `Missing Dynamic Configuration for feature flag '${Features.EFNOLPStarConversionStates}'`
      );
    }

    let statesMap: Record<string, { auto?: boolean }> | null = null;
    try {
      statesMap = config
        ? (JSON.parse(config) as Record<string, { auto?: boolean }>)
        : null;
    } catch {
      logger.error(
        `Feature flag '${Features.EFNOLPStarConversionStates}' has invalid JSON in Dynamic Configuration`,
        logInfo
      );
      throw new Error(
        `Invalid JSON in Dynamic Configuration for feature flag '${Features.EFNOLPStarConversionStates}'`
      );
    }

    if (!statesMap?.[stateAcronym]?.auto) {
      logger.info(
        `State '${stateAcronym}' not eligible for conversion`,
        logInfo
      );
      return noConversionResult(policyNumber, conversionType);
    }
  }

  // All gates passed — call downstream conversion API
  return policyConversionCheck(
    context,
    policyNumber,
    conversionType,
    token,
    logger,
    requestHeaders,
    loginFlowType,
    efnolApplication
  );
};

/**
 * Main dispatcher. Resolves the conversion result for the given policy and type.
 *
 * Add new per-type checkers here as new {@link ConversionType} values are
 * introduced. Each checker is responsible for its own tenant gate, feature flag
 * checks, eligibility sub-checks, and downstream API call.
 */
export const getConversionResult = async (
  policyNumber: string,
  conversionType: ConversionType,
  token: string,
  context: IContext,
  featureFlagService: FeatureFlagService,
  logger: MaskedLogger,
  requestHeaders: {
    [key: string]: string;
  },
  loginFlowType: LoginFlowType,
  efnolApplication?: EfnolApplication
): Promise<IPolicyConversionResult> => {
  switch (conversionType) {
    case ConversionType.PSTAR_TO_GW:
      return checkPStarToGWEligibility(
        policyNumber,
        conversionType,
        token,
        context,
        featureFlagService,
        logger,
        requestHeaders,
        loginFlowType,
        efnolApplication
      );
    default:
      logger.info(
        `Unsupported conversion type '${conversionType}' — returning noConversionResult`,
        { policyNumber, conversionType }
      );
      return noConversionResult(policyNumber, conversionType);
  }
};
