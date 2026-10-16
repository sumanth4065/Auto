import { IContext } from '@ace-clublabs/aws-lambda-v3';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import { AxiosPostHelper } from '@ace-clublabs/iss-common-lambda-v3';
import { EfnolApplication, LoginFlowType } from '@ace-clublabs/iss-common-auto-efnol-models';
import { IClaimInfoCanonicalResponse } from '@ace-clublabs/iss-common-shared-claims-models';
import {
  CommonGatewayType,
  getCommonApiDomain,
  getCommonGatewayId
} from '@ace-clublabs/iss-common-util';
import { DEFAULT_MASK_OPTIONS_FOR_CREDENTIALS, MaskData } from '@lib/common-utils';

export const getClaimsSummary = async (
  context: IContext,
  authBearer: string,
  logger: MaskedLogger,
  logInfo: any,
  isIntegrationGatewayEnabled: boolean,
  requestHeaders: { [key: string]: string },
  policyNumber: string,
  loginFlowType: LoginFlowType,
  efnolApplication?: EfnolApplication,
  timezone?: string | null
): Promise<ClaimsSummaryFrontendResponse | IClaimInfoCanonicalResponse[]> => {
  const axiosPostHelper = new AxiosPostHelper();

  // Build URL based on flag
  const getClaimInfoEndpoint = '/v1/claims-summary';
  const getClaimsInfoEndpointV2 = '/v2/common/claim';
  const invokedFunctionArn = context.invokedFunctionArn;
  const efnolApplicationQuery = efnolApplication ? `&efnolApplication=${efnolApplication}` : '';
  const timezoneQuery = timezone ? `&timezone=${encodeURIComponent(timezone)}` : '';
  const timezoneQueryV1 = timezone ? `?timezone=${encodeURIComponent(timezone)}` : '';
  const url = isIntegrationGatewayEnabled
    ? `${getCommonApiDomain(invokedFunctionArn)}${getClaimsInfoEndpointV2}/${policyNumber}?loginFlowType=${loginFlowType}${efnolApplicationQuery}${timezoneQuery}`
    : `${getCommonApiDomain(invokedFunctionArn)}${getClaimInfoEndpoint}`;

  // get gateway id
  const gatewayId = getCommonGatewayId(
    isIntegrationGatewayEnabled
      ? CommonGatewayType.commonInsuranceClaimsV2Services
      : CommonGatewayType.commonInsuranceClaimsThirdPartyServices,
    context.invokedFunctionArn
  );

  // call endpoint
  const maskRequestHeaders = MaskData.maskJSONFields(
    requestHeaders,
    DEFAULT_MASK_OPTIONS_FOR_CREDENTIALS
  );
  logger.debug(`Inside get-claims-summary url: ` + url + ' gatewayId: ' + gatewayId, {
    ...logInfo,
    requestHeaders: maskRequestHeaders
  });

  // Call the API (return raw response)
  return await axiosPostHelper.executeRestCallv2(
    url,
    gatewayId,
    authBearer,
    context,
    requestHeaders
  );
};

enum APIResult {
  Success = 'SUCCESS',
  Failed = 'FAILED'
}
enum ClaimStatus {
  Open = 'open',
  Closed = 'closed'
}
interface AdjusterDetails {
  name: string;
  phone: string;
  email: string;
}
interface ClaimsStatusViewModel {
  insuredVehicleName: string;
  claimNumber: string;
  reportedDate: string;
  lossDate: string;
  deductibleStatus: string;
  lossType: string;
  lossCause: string;
  claimStatus: ClaimStatus;
  incidentLocationStreet: string;
  adjusterDetails: AdjusterDetails;
}
interface ClaimsSummaryFrontendResponse {
  APIResult: APIResult;
  claims: ClaimsStatusViewModel[];
}
