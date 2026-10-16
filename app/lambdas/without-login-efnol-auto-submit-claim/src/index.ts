import { IContext, IEvent, LambdaInvokeState } from '@ace-clublabs/aws-lambda-v3';
import { CacheError, LambdaHelper } from '@ace-clublabs/iss-common-lambda-v3';
import { ITenant, PolicyTypeAndTenantHelper, Subset, TTL } from '@ace-clublabs/iss-common-util';
import {
  IAutoSubmitClaimCanonicalRequestV2,
  IAutoSubmitClaimCanonicalResponseV2,
  LoginFlowType
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { ClaimsAuthorizationHelper, ClientApplication } from '@ace-clublabs/iss-cci-clients';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import {
  AutoEfnolLoggerOptions,
  BackendCallError,
  DEFAULT_MASK_OPTIONS_ALL_PII,
  extractErrorDetails,
  getAuthorizationToken,
  lambdaError,
  lambdaSuccess,
  MaskData,
  mockData,
  notAuthorized,
  policyNotFound,
  getRequestHeaders,
  policyUnauthorized,
  extractBehindLoginOrAnonymousProps,
  getPolicyPrefix
} from '@lib/common-utils';
import {
  ISubmitAutoClaimFrontendRequest,
  Metrics,
  submitAutoClaimFrontendResponseFixture,
  SubmitAutoClaimFrontendResult
} from '@lib/types';
import { AppName } from '@lib/shared-contracts';
import { submitAutoClaimV2 } from './api/SubmitClaimApi.remote';

export const handler = async (event: IEvent, context: IContext) => {
  const logger = MaskedLogger.getInstance();
  const errorCache = new CacheError('ErrorCache');
  let logInfo;
  let backendSubmitAutoClaimRequestBody: IAutoSubmitClaimCanonicalRequestV2;
  let submitAutoClaimResponse: IAutoSubmitClaimCanonicalResponseV2;

  const reqBody: ISubmitAutoClaimFrontendRequest = JSON.parse(event?.body);
  const { lossCause, claimNumber, isMobileAppAccidentDetection } = reqBody;
  logInfo = {
    claimNumber,
    lossCause,
    isMobileAppAccidentDetection: isMobileAppAccidentDetection ?? false
  };

  try {
    await logger.initialize(AutoEfnolLoggerOptions, context, event.headers);
    // @TODO : validate request body to use json schema validation
    // extract/test token
    const token: string = getAuthorizationToken(event);
    logger.info(LambdaInvokeState.Start, logInfo);

    if (!token) {
      return notAuthorized(context, logInfo);
    }
    // check mock
    const useMock: boolean = LambdaHelper.isMockEnvironment(
      process.env.ALLOW_MOCK || 'false',
      event.headers
    );
    if (useMock) {
      return mockData(context, logInfo, submitAutoClaimFrontendResponseFixture);
    }

    const policyGuid: string | null = event['queryStringParameters']?.['policyGuid'] || null;
    const {
      policyNumber,
      loginFlowType,
      efnolApplication,
      clubCode: cacheClubCode
    } = await extractBehindLoginOrAnonymousProps(policyGuid, token);
    const policyPrefix = getPolicyPrefix(policyNumber);
    const { clubCode: derivedClubCode, tenant } =
      PolicyTypeAndTenantHelper.getTenantAndProductFromPolicyNumber(policyNumber);
    const clubCode = derivedClubCode || cacheClubCode;
    const policyTenant = Object.keys(ITenant).find(key => ITenant[key] === tenant);
    logInfo = {
      ...logInfo,
      clubCode,
      policyNumber,
      loginFlowType,
      efnolApplication,
      policyPrefix,
      policyTenant
    };

    logger.debug('Client context', {
      logger: logger.getClientContext(),
      context: context?.clientContext
    });

    // Generate request headers
    const requestHeaders = getRequestHeaders(
      event.headers,
      null,
      logger.getClientContext()?.correlationId || context?.clientContext?.correlationId,
      logger.getClientContext()?.sessionId || context?.clientContext?.sessionId,
      AppName.clublabsAutoEFNOL,
      clubCode
    );

    // Validate policy authorization with CCI
    const isFlowTypeBehindLogin = loginFlowType === LoginFlowType.BEHIND_LOGIN;

    // Always remove customerId from request body to prevent client injection
    delete reqBody.customerId;

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

      // Include customerId in the submit-claim request body (BL only) so the backend can correlate crash-detection / behind-login flows
      // Only source from authorizer, never from request body
      if (customerId) {
        reqBody.customerId = customerId;
      }
    }

    let lambdaResponse = {
      APIResult: '',
      adjuster: undefined
    };

    logger.debug('Using V2 Integration Gateway API', logInfo);
    const finalPolicyNumber = reqBody.resolvedPolicyNumber || policyNumber;
    delete reqBody.resolvedPolicyNumber;

    backendSubmitAutoClaimRequestBody = {
      ...reqBody,
      policyNumber: finalPolicyNumber
    } as IAutoSubmitClaimCanonicalRequestV2;

    backendSubmitAutoClaimRequestBody.loginFlowType = loginFlowType;

    logger.debug(
      'backendSubmitAutoClaimRequestBody',
      MaskData.maskJSONFields(backendSubmitAutoClaimRequestBody, DEFAULT_MASK_OPTIONS_ALL_PII)
    );
    try {
      submitAutoClaimResponse = await submitAutoClaimV2(
        backendSubmitAutoClaimRequestBody,
        token,
        logger,
        context,
        requestHeaders,
        loginFlowType,
        efnolApplication
      );
    } catch (backendErr) {
      throw new BackendCallError('cmn-auto-efnol-submit-claim-v2', backendErr);
    }

    if (!submitAutoClaimResponse) throw new Error('Backend call failed to return a response');

    lambdaResponse = Subset.removeUndefinedProperties({
      APIResult: lambdaResponse.APIResult
        ? lambdaResponse.APIResult
        : SubmitAutoClaimFrontendResult.SuccessWithEmailSuccess,
      adjuster: submitAutoClaimResponse.adjuster
    });
    logger.debug('Lambda response constructed', { lambdaResponse });

    return lambdaSuccess(context, logInfo, lambdaResponse, Metrics.SubmitClaim);
  } catch (err) {
    const errorDetails = extractErrorDetails(err);
    await errorCache.setItem(
      event.headers['X-Request-Id'],
      JSON.stringify({
        frontendRequest: reqBody,
        backendRequest: backendSubmitAutoClaimRequestBody,
        backendResponse: submitAutoClaimResponse,
        error: errorDetails
      }),
      TTL.SECONDS_IN_30_DAYS
    );
    return lambdaError(context, logInfo, err, 'Unable to submit non-glass claim');
  }
};

export default exports;
