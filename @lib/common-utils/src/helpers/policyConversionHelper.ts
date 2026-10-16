import { IContext } from '@ace-clublabs/aws-lambda-v3';
import { AxiosPostHelper } from '@ace-clublabs/iss-common-lambda-v3';
import {
  ConversionType,
  IPolicyConversionResult
} from '@ace-clublabs/iss-common-shared-claims-models';
import {
  LoginFlowType,
  EfnolApplication
} from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  CommonGatewayType,
  getCommonApiDomain,
  getCommonGatewayId
} from '@ace-clublabs/iss-common-util';
import { ILogger } from '@ace-clublabs/aws-lambda-logger';
import {
  generatePStarToGWMockConversionResult,
  isPStarToGWMockingEnabled
} from './mockPolicyConversionData';

/**
 * Calls the /v2/common/policy-conversion endpoint to check whether the given policy
 * has a conversion path available. Returns mock data if ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK is 'true'
 * and the policy number exists in the mock dataset.
 */
export const policyConversionCheck = async (
  context: IContext,
  policyNumber: string,
  conversionType: ConversionType,
  authBearer: string,
  logger: ILogger,
  requestHeaders: {
    [key: string]: string;
  },
  loginFlowType: LoginFlowType,
  efnolApplication?: EfnolApplication
): Promise<IPolicyConversionResult> => {
  // Check if mocking is enabled and we have mock data for this policy
  if (
    conversionType === ConversionType.PSTAR_TO_GW &&
    isPStarToGWMockingEnabled()
  ) {
    const mockResult = generatePStarToGWMockConversionResult(policyNumber);
    if (mockResult) {
      logger.debug(`Using mock conversion data for policy ${policyNumber}`);
      return mockResult;
    }
  }

  const axiosPostHelper = new AxiosPostHelper();
  const efnolApplicationQuery = efnolApplication
    ? `&efnolApplication=${efnolApplication}`
    : '';
  const endpoint = `/v2/common/policy-conversion?loginFlowType=${loginFlowType}${efnolApplicationQuery}`;
  const url = `${getCommonApiDomain(context.invokedFunctionArn)}${endpoint}`;
  const gatewayId = getCommonGatewayId(
    CommonGatewayType.commonInsuranceClaimsV2Services,
    context.invokedFunctionArn
  );

  logger.debug(`policyConversionCheck url: ${url}`);

  return await axiosPostHelper.executePostCallv2(
    url,
    gatewayId,
    JSON.stringify({ policyNumber, conversionType }),
    authBearer,
    context,
    requestHeaders
  );
};
