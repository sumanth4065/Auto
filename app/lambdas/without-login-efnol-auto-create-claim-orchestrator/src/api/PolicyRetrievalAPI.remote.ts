import { IContext, IEvent } from '@ace-clublabs/aws-lambda-v3';
import { MaskedLogger as Logger } from '@ace-clublabs/aws-lambda-logger';
import {
  EfnolApplication,
  IAutoPolicyRetrievalCanonicalRequest,
  IAutoPolicyRetrievalCanonicalResponse,
  LoginFlowType
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { AxiosPostHelper } from '@ace-clublabs/iss-common-lambda-v3';
import {
  CommonGatewayType,
  getCommonApiDomain,
  getCommonGatewayId
} from '@ace-clublabs/iss-common-util';
import { getRequestHeaders } from '@lib/common-utils';
import { AppName } from '@lib/shared-contracts';

export const policyRetrievalRemoteApi = async (
  request: IAutoPolicyRetrievalCanonicalRequest,
  event: IEvent,
  loginFlowType: LoginFlowType,
  context: IContext,
  efnolApplication?: EfnolApplication
): Promise<IAutoPolicyRetrievalCanonicalResponse> => {
  const logger = Logger.getInstance();
  // get endpoint
  const axiosPostHelper = new AxiosPostHelper();
  const policyRetrievalEndpoint = `/v2/auto/policy-retrieval`;

  const invokedFunctionArn = context.invokedFunctionArn;
  const efnolApplicationQuery = efnolApplication ? `&efnolApplication=${efnolApplication}` : '';
  const url = `${getCommonApiDomain(invokedFunctionArn)}${policyRetrievalEndpoint}/?loginFlowType=${loginFlowType}${efnolApplicationQuery}`;
  const gatewayId = getCommonGatewayId(
    CommonGatewayType.commonInsuranceClaimsV2Services,
    invokedFunctionArn
  );
  logger.debug('Invoking Policy Retrieval Rest API', {
    url,
    gatewayId,
    request: request
  });
  const requestHeaders = getRequestHeaders(
    event.headers,
    null,
    logger.getClientContext().correlationId,
    logger.getClientContext().sessionId,
    AppName.clublabsAutoEFNOL
  );
  const response = await axiosPostHelper.executePostCallv2(
    url,
    gatewayId,
    JSON.stringify(request),
    event.headers.Authorization,
    context,
    requestHeaders
  );

  logger.debug('Policy retrieval response', response);

  return response;
};
