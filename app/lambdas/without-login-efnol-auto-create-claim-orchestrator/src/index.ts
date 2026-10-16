import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { IContext, IEvent, LambdaInvokeState } from '@ace-clublabs/aws-lambda-v3';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import { CacheError } from '@ace-clublabs/iss-common-lambda-v3';
import { ITenant, PolicyTypeAndTenantHelper, TTL } from '@ace-clublabs/iss-common-util';
import { ClaimsAuthorizationHelper, ClientApplication } from '@ace-clublabs/iss-cci-clients';
import { LoginFlowType } from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  AutoEfnolLoggerOptions,
  BackendCallError,
  extractErrorDetails,
  getAuthorizationToken,
  lambdaError,
  lambdaSuccess,
  notAuthorized,
  policyNotFound,
  extractBehindLoginOrAnonymousProps,
  policyUnauthorized,
  getRequestHeaders,
  getPolicyPrefix
} from '@lib/common-utils';
import { ICreateAutoClaimRequest, Metrics } from '@lib/types';
import { AppName } from '@lib/shared-contracts';

import { createAutoClaimV2 } from './api/CreateClaimV2Api.remote';
import { transformCanonicalRequestV2 } from './helpers';
import { policyRetrievalRemoteApi } from './api/PolicyRetrievalAPI.remote';

const AWSXRay = require('aws-xray-sdk-core');
AWSXRay.captureAWSv3Client(new SecretsManagerClient({}));
AWSXRay.captureHTTPsGlobal(require('http'));

const logger = MaskedLogger.getInstance();
const errorCache = new CacheError('ErrorCache');

export const handler = async (event: IEvent, context: IContext) => {
  const reqBody: ICreateAutoClaimRequest = JSON.parse(event.body) || {};
  let logInfo;

  try {
    // start

    await logger.initialize(AutoEfnolLoggerOptions, context, event?.headers);

    // extract/test token

    const token: string = getAuthorizationToken(event);

    if (!token) {
      return notAuthorized(context, logInfo);
    }

    // extract policyNumber from the body
    const { policyNumber } = reqBody.policy;

    // extract policy context
    // eslint-disable-next-line dot-notation
    const policyGuid: string | null = event['queryStringParameters']?.['policyGuid'] || null;
    const {
      policyNumber: extractedPolicyNumber,
      loginFlowType,
      efnolApplication,
      clubCode: cacheClubCode
    } = await extractBehindLoginOrAnonymousProps(policyGuid, token);

    if (policyNumber != extractedPolicyNumber) {
      logger.warn('Policy number in request body does not match extracted policy number', {
        policyNumberInBody: policyNumber,
        extractedPolicyNumber: extractedPolicyNumber
      });
      return policyNotFound(context, logInfo, 'Policy number mismatch');
    }

    // After auth passes, substitute the frontend-resolved policy number if provided.
    // This supports conversion scenarios where the original policyNumber (used for auth)
    // differs from the target policy number (legacy or GW) used for claim creation.
    if (reqBody.policy.resolvedPolicyNumber) {
      reqBody.policy.policyNumber = reqBody.policy.resolvedPolicyNumber;
    }

    logInfo = {
      ...logInfo,
      policyNumber: reqBody.policy.policyNumber,
      loginFlowType,
      efnolApplication
    };

    // infer clubCode from policy prefix

    const { clubCode: derivedClubCode, tenant } =
      PolicyTypeAndTenantHelper.getTenantAndProductFromPolicyNumber(reqBody.policy.policyNumber);
    const clubCode = derivedClubCode || cacheClubCode;
    const policyTenant = Object.keys(ITenant).find(key => ITenant[key] === tenant);
    const policyPrefix = getPolicyPrefix(policyNumber);

    logInfo = {
      ...logInfo,
      policyNumber: reqBody.policy.policyNumber,
      clubCode,
      loginFlowType,
      efnolApplication,
      policyPrefix,
      policyTenant
    };

    logger.info(LambdaInvokeState.Start, logInfo);

    const requestHeaders = getRequestHeaders(
      event.headers,
      null,
      logger.getClientContext().correlationId,
      logger.getClientContext().sessionId,
      AppName.clublabsAutoEFNOL,
      clubCode
    );

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

    // extract date, cause

    const { lossDate, lossCause, isMobileAppAccidentDetection } = reqBody;
    logInfo = {
      ...logInfo,
      lossDate,
      lossCause,
      isMobileAppAccidentDetection: isMobileAppAccidentDetection ?? 'false'
    };

    logger.debug('Calling Create Auto Claim api', logInfo);

    logger.debug('Calling Create Auto Claim V2 and Policy Retrieval', logInfo);

    const [createClaimResponse, policyRetrievalRemoteResponse] = await Promise.all([
      createAutoClaimV2(
        transformCanonicalRequestV2(reqBody),
        event,
        loginFlowType,
        context,
        efnolApplication
      ).catch(backendErr => {
        throw new BackendCallError('cmn-auto-efnol-create-claim-v2', backendErr);
      }),
      policyRetrievalRemoteApi(
        { lossDate, policyNumber: reqBody.policy.policyNumber },
        event,
        loginFlowType,
        context,
        efnolApplication
      ).catch(backendErr => {
        throw new BackendCallError('cmn-auto-efnol-policy-retrieval', backendErr);
      })
    ]);

    logger.debug('create auto claim v2 response', createClaimResponse);
    logger.debug('policy retrieval response', policyRetrievalRemoteResponse);

    delete createClaimResponse.claimId;
    const policyRetrievalResponse = {
      vehicleSummaries: policyRetrievalRemoteResponse.vehicles,
      driverSummaries: policyRetrievalRemoteResponse.drivers,
      insuredFullName: policyRetrievalRemoteResponse.insuredFullName,
      policyStatus: policyRetrievalRemoteResponse.policyStatus,
      policyType: policyRetrievalRemoteResponse.policyType,
      policyState: policyRetrievalRemoteResponse.policyState,
      policyProduct: policyRetrievalRemoteResponse.policyProduct
    };

    return lambdaSuccess(
      context,
      logInfo,
      { ...createClaimResponse, ...policyRetrievalResponse },
      Metrics.CreateClaim
    );
  } catch (err) {
    const errorDetails = extractErrorDetails(err);
    logger.debug('error', errorDetails);
    await errorCache.setItem(
      event.headers['X-Request-Id'],
      JSON.stringify({
        request: reqBody,
        error: errorDetails
      }),
      TTL.SECONDS_IN_30_DAYS
    );

    return lambdaError(context, logInfo, err, 'Unable to create auto claim');
  }
};

export default exports;

// dummy change to force pipeline
