import { AxiosPostHelper } from '@ace-clublabs/iss-common-lambda-v3';
import { IContext } from '@ace-clublabs/aws-lambda-v3';
import {
  CommonGatewayType,
  getCommonApiDomain,
  getCommonGatewayId
} from '@ace-clublabs/iss-common-util';
import {
  EfnolApplication,
  IAutoSubmitClaimCanonicalRequestV2,
  LoginFlowType
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import { SubmitClaimV2 } from './SubmitClaimApi.contract';

export const submitAutoClaimV2: SubmitClaimV2 = async (
  request: IAutoSubmitClaimCanonicalRequestV2,
  authBearer: string,
  logger: MaskedLogger,
  context: IContext,
  requestHeaders: {
    [key: string]: string;
  },
  loginFlowType: LoginFlowType,
  efnolApplication?: EfnolApplication
) => {
  // get endpoint
  const axiosPostHelper = new AxiosPostHelper();
  const submitAutoClaimEndpoint = `/v2/auto/claim`;

  const invokedFunctionArn = context.invokedFunctionArn;
  const efnolApplicationQuery = efnolApplication ? `&efnolApplication=${efnolApplication}` : '';
  const url = `${getCommonApiDomain(invokedFunctionArn)}${submitAutoClaimEndpoint}/?loginFlowType=${loginFlowType}${efnolApplicationQuery}`;
  const gatewayId = getCommonGatewayId(
    CommonGatewayType.commonInsuranceClaimsV2Services,
    invokedFunctionArn
  );
  logger.debug('Invoking Submit Auto Claim V2 Rest API', {
    url,
    gatewayId,
    request
  });

  const response = await axiosPostHelper.executePutCallv2(
    url,
    gatewayId,
    JSON.stringify(request),
    authBearer,
    context,
    requestHeaders
  );

  logger.debug('Submit Auto Claim V2 Rest API Response', { response });

  return response;
};
