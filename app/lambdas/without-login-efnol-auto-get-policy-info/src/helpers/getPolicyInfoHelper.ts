import { IContext } from '@ace-clublabs/aws-lambda-v3';
import { MaskedLogger as Logger } from '@ace-clublabs/aws-lambda-logger';
import { AxiosPostHelper } from '@ace-clublabs/iss-common-lambda-v3';
import {
  CommonGatewayType,
  getCommonApiDomain,
  getCommonGatewayId
} from '@ace-clublabs/iss-common-util';
import { DEFAULT_MASK_OPTIONS_FOR_CREDENTIALS, MaskData } from '@lib/common-utils';
import { inferClubCode } from '@lib/utility';

export const getPolicyInfo = async <T>(
  context: IContext,
  policyNumber: string,
  authBearer: string,
  logger: Logger,
  requestHeaders?: { [key: string]: string }
): Promise<T | JSON> => {
  // get endpoint
  const axiosPostHelper = new AxiosPostHelper();
  const getPolicyInfoDetailsProxyEndpoint = `/anonymous/v1/policies/auto/${policyNumber}/details`;

  // get gateway id

  const invokedFunctionArn = context.invokedFunctionArn;
  const url = `${getCommonApiDomain(invokedFunctionArn)}${getPolicyInfoDetailsProxyEndpoint}`;
  const gatewayId = getCommonGatewayId(CommonGatewayType.insurancepolicyinfo, invokedFunctionArn);

  // call endpoint
  const maskRequestHeaders = MaskData.maskJSONFields(
    requestHeaders,
    DEFAULT_MASK_OPTIONS_FOR_CREDENTIALS
  );

  logger.debug(`Inside getPolicy. Url: ` + url + 'gatewayId: ' + gatewayId, {
    policyNumber,
    requestHeaders: maskRequestHeaders
  });

  return await axiosPostHelper.executeRestCallv2(
    url,
    gatewayId,
    authBearer,
    context,
    requestHeaders
  );
};
