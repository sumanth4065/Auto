import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { IContext, IEvent, LambdaInvokeState } from '@ace-clublabs/aws-lambda-v3';
import { MaskedLogger as Logger } from '@ace-clublabs/aws-lambda-logger';
import { ClaimsAuthorizationHelper, ClientApplication } from '@ace-clublabs/iss-cci-clients';
import { ITenant, PolicyTypeAndTenantHelper } from '@ace-clublabs/iss-common-util';
import {
  AutoEfnolLoggerOptions,
  BackendCallError,
  extractBehindLoginOrAnonymousProps,
  getAuthorizationToken,
  getGuidewireSecrets,
  getPolicyPrefix,
  getRequestHeaders,
  GUIDEWIRE_SECRET_ID,
  lambdaError,
  lambdaSuccess,
  notAuthorized,
  policyNotFound,
  policyUnauthorized,
  SplitIOHelper
} from '@lib/common-utils';
import { AppName, LoginFlowType } from '@lib/shared-contracts';
import { GetPolicyInfoAPIResult, IPolicyInfoAutoResponse, Metrics } from '@lib/types';
import { getPolicyInfo } from './helpers';
import { DataMappingHelper } from './helpers';

const AWSXRay = require('aws-xray-sdk-core');
AWSXRay.captureAWSv3Client(new SecretsManagerClient({}));
AWSXRay.captureHTTPsGlobal(require('http'));

const logger = Logger.getInstance();
let logInfo;

export const handler = async (event: IEvent, context: IContext) => {
  try {
    // start

    await logger.initialize(AutoEfnolLoggerOptions, context, event?.headers);
    logger.info(LambdaInvokeState.Start, logInfo);

    // extract/test token

    const token: string = getAuthorizationToken(event);

    if (!token) {
      return notAuthorized(context, logInfo);
    }

    const policyGuid: string | null = event['queryStringParameters']?.['policyGuid'] || null;
    logInfo = { ...logInfo, policyGuid };

    // decode policyGuid to get policyNumber
    const {
      policyNumber,
      loginFlowType,
      efnolApplication,
      clubCode: cacheClubCode
    } = await extractBehindLoginOrAnonymousProps(policyGuid, token);

    if (!policyNumber) {
      return policyNotFound(context, logInfo, 'Policy number not found');
    }

    const policyPrefix = getPolicyPrefix(policyNumber);
    const { clubCode: derivedClubCode, tenant } =
      PolicyTypeAndTenantHelper.getTenantAndProductFromPolicyNumber(policyNumber);
    const clubCode = derivedClubCode || cacheClubCode;
    const policyTenant = Object.keys(ITenant).find(key => ITenant[key] === tenant);
    logInfo = {
      ...logInfo,
      policyNumber,
      clubCode,
      loginFlowType,
      efnolApplication,
      policyPrefix,
      policyTenant
    };

    // get secrets

    const guidewireCreds = await getGuidewireSecrets(GUIDEWIRE_SECRET_ID);

    logger.debug('Received secrets from secrets manager', logInfo);
    const requestHeaders = getRequestHeaders(
      event?.headers,
      guidewireCreds,
      logger.getClientContext().correlationId,
      logger.getClientContext().sessionId,
      AppName.clublabsAutoEFNOL,
      clubCode
    );

    // Policy authorization with CCI
    const isFlowTypeBehindLogin = loginFlowType === LoginFlowType.BEHIND_LOGIN;
    if (isFlowTypeBehindLogin) {
      const customerId = event.requestContext?.authorizer?.customerId;
      const authorizationHelper = new ClaimsAuthorizationHelper();
      const isAuthorized = await authorizationHelper.isPolicyAuthorizedAsync(
        policyNumber,
        customerId,
        event,
        requestHeaders,
        logger,
        ClientApplication.AUTO_CLAIMS
      );

      if (!isAuthorized) {
        return policyUnauthorized(context, logInfo);
      }
    }

    // get policy info
    logger.info('Retrieving get policy information for auto efnol app', logInfo);

    // check flag v2
    const isIntegrationGatewayEnabled: boolean =
      await SplitIOHelper.getEnableIntegrationGateway(logger);

    logger.info(
      `IntegrationGatewayEnabled = ${isIntegrationGatewayEnabled} for policy-info`,
      logInfo
    );

    // if it's ON → DO NOT call the backend
    if (isIntegrationGatewayEnabled) {
      logger.info(
        'IG v2 enabled → skipping Yosemite backend invocation and returning null',
        logInfo
      );

      const responseBody = {
        APIResult: GetPolicyInfoAPIResult.PolicyNotFound,
        statusCode: 200,
        message: GetPolicyInfoAPIResult.PolicyNotFound,
        data: {
          policyGeneralInfo: {},
          driverSummaries: {}
        }
      } as unknown as IPolicyInfoAutoResponse;

      return lambdaSuccess(context, logInfo, responseBody, Metrics.GetPolicyInfo);
    }

    let commonInsPolicyInfoResponse;

    // @TODO: if the backend is finicky about the token format, we will have to re-introduce it as the original authBearer token
    // const authBearer: string = `Bearer ${token}`;

    try {
      commonInsPolicyInfoResponse = await getPolicyInfo(
        context,
        policyNumber,
        token,
        logger,
        requestHeaders
      );
    } catch (backendErr) {
      throw new BackendCallError('get-policy-info', backendErr);
    }

    let responseBody: IPolicyInfoAutoResponse;
    if (
      commonInsPolicyInfoResponse == null ||
      commonInsPolicyInfoResponse == undefined ||
      commonInsPolicyInfoResponse?.overview?.policyNumber !== policyNumber
    ) {
      responseBody = {
        APIResult: GetPolicyInfoAPIResult.PolicyNotFound,
        statusCode: 200,
        message: GetPolicyInfoAPIResult.PolicyNotFound,
        data: {
          policyGeneralInfo: {},
          driverSummaries: {}
        }
      } as unknown as IPolicyInfoAutoResponse;
    } else {
      responseBody = DataMappingHelper.mapToIPolicyInfoResponse(commonInsPolicyInfoResponse);
      //responseBody.data.policyGeneralInfo.conversionInfo; //TODO: Should verify if We already have this value in the response
    }

    // log metrics and return response
    return lambdaSuccess(context, logInfo, responseBody, Metrics.GetPolicyInfo);
  } catch (err) {
    return lambdaError(context, logInfo, err, 'Unable to get policy info');
  }
};

export default exports;
