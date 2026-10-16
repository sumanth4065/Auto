import { IContext, IEvent } from '@ace-clublabs/aws-lambda-v3';
import { MaskedLogger as Logger } from '@ace-clublabs/aws-lambda-logger';
import { AxiosPostHelper } from '@ace-clublabs/iss-common-lambda-v3';
import {
  CommonGatewayType,
  getCommonApiDomain,
  getCommonGatewayId
} from '@ace-clublabs/iss-common-util';
import { CreateClaimV2 } from './CreateClaimApi.contract';
import { getRequestHeaders } from '@lib/common-utils';
import { AppName } from '@lib/shared-contracts';
import {
  EfnolApplication,
  IAutoCreateClaimCanonicalRequestV2,
  LoginFlowType
} from '@ace-clublabs/iss-common-auto-efnol-models';

export const createAutoClaimV2: CreateClaimV2 = async (
  request: IAutoCreateClaimCanonicalRequestV2,
  event: IEvent,
  loginFlowType: LoginFlowType,
  context: IContext,
  efnolApplication?: EfnolApplication
) => {
  const logger = Logger.getInstance();
  // get endpoint
  const axiosPostHelper = new AxiosPostHelper();
  const createAutoClaimEndpoint = `/v2/auto/claim`;

  const invokedFunctionArn = context.invokedFunctionArn;
  const efnolApplicationQuery = efnolApplication ? `&efnolApplication=${efnolApplication}` : '';
  const url = `${getCommonApiDomain(invokedFunctionArn)}${createAutoClaimEndpoint}/?loginFlowType=${loginFlowType}${efnolApplicationQuery}`;
  const gatewayId = getCommonGatewayId(
    CommonGatewayType.commonInsuranceClaimsV2Services,
    invokedFunctionArn
  );
  logger.debug('Invoking Create Auto Claim V2 Rest API', {
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

  logger.debug('create claim v2 response', response);
  return response;
};
