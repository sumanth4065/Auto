import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import StatusCode from 'status-code-enum';
import { IContext, IEvent, LambdaInvokeState } from '@ace-clublabs/aws-lambda-v3';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import { LambdaHelper } from '@ace-clublabs/iss-common-lambda-v3';
import { ClaimsAuthorizationHelper, ClientApplication } from '@ace-clublabs/iss-cci-clients';
import { ITenant, PolicyTypeAndTenantHelper } from '@ace-clublabs/iss-common-util';
import {
  AutoEfnolLoggerOptions,
  BackendCallError,
  getAuthorizationToken,
  SplitIOHelper,
  getRequestHeaders,
  lambdaError,
  lambdaSuccess,
  notAuthorized,
  policyNotFound,
  policyBlockedError,
  extractBehindLoginOrAnonymousProps,
  policyUnauthorized,
  getPolicyPrefix
} from '@lib/common-utils';
import { AppName, LoginFlowType } from '@lib/shared-contracts';
import { APIResult, Metrics } from '@lib/types';
import { getClaimsSummary } from './helpers';

export const claimNotFound = (
  context: IContext,
  logger: MaskedLogger,
  logInfo: any,
  errorMessage?: string
) => {
  const message: string = errorMessage ?? 'Cannot find a claim with same lossDate for policyNumber';

  logger.info(LambdaInvokeState.Complete, {
    ...logInfo,
    message
  });

  return LambdaHelper.response({
    statusCode: StatusCode.SuccessOK,
    requestId: context.awsRequestId,
    body: {
      message: 'No existing claim found',
      APIResult: APIResult.Success,
      duplicateClaimExists: false
    }
  });
};

export enum ClaimStatus {
  Open = 'open',
  Closed = 'closed'
}

/**
 * Extracts the UTC offset in minutes from an ISO-8601 date string.
 *
 * AWS Lambda runs in UTC, so dayjs() discards the original ±HH:MM offset when
 * parsing. This helper reads the offset directly from the raw string so that
 * date comparisons always use the user's local calendar day rather than UTC.
 *
 * Examples:
 *   "2026-04-09T23:00:00-07:00" → -420
 *   "2026-04-09T12:00:00+05:30" → +330
 *   "2026-04-09"                →   0  (no offset present; falls back to UTC)
 *   "2026-04-09T12:00:00Z"      →   0  (UTC explicit)
 */
export const parseUtcOffsetMinutes = (isoString: string): number => {
  const match = isoString.match(/([+-])(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const sign = match[1] === '+' ? 1 : -1;
  return sign * (parseInt(match[2], 10) * 60 + parseInt(match[3], 10));
};

let logInfo;

export const handler = async (event: IEvent, context: IContext) => {
  const logger = MaskedLogger.getInstance();
  const {
    lossDate: userInputlossDate,
    policyNumber: resolvedPolicyNumber,
    timezone: bodyTimezone
  } = JSON.parse(event.body || '{}');
  try {
    // start
    await logger.initialize(AutoEfnolLoggerOptions, context, event?.headers);
    logger.info(LambdaInvokeState.Start, logInfo);

    // extract/test token
    const token: string = getAuthorizationToken(event);
    if (!token) {
      return notAuthorized(context, logInfo);
    }

    // extract/test policyNumber from token
    const policyGuid: string | null = event['queryStringParameters']?.['policyGuid'] || null;
    const rawTimezone: string | null = bodyTimezone || null;
    const {
      policyNumber,
      loginFlowType,
      efnolApplication,
      clubCode: cacheClubCode
    } = await extractBehindLoginOrAnonymousProps(policyGuid, token);

    if (!policyNumber) {
      return policyNotFound(context, logInfo);
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

    logger.debug('Received secrets from secrets manager', logInfo);

    // generate request headers
    const requestHeaders = getRequestHeaders(
      event.headers,
      null,
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
    // Check if Integration Gateway is enabled via feature flag
    const isIntegrationGatewayEnabled = await SplitIOHelper.getEnableIntegrationGateway(logger);

    const decodedTimezone: string | null = rawTimezone ?? null;

    // get claim info
    // If the frontend resolved a different policy number (e.g. legacy → GW conversion),
    // use it for the claims-summary lookup. Token-derived policyNumber is kept for auth only.
    const lookupPolicyNumber = resolvedPolicyNumber ?? policyNumber;
    logger.info('Retrieving get claim information for auto efnol app', logInfo);
    let getClaimInfoResponse: any;
    try {
      getClaimInfoResponse = await getClaimsSummary(
        context,
        event?.headers?.Authorization,
        logger,
        logInfo,
        isIntegrationGatewayEnabled,
        requestHeaders,
        lookupPolicyNumber,
        loginFlowType,
        efnolApplication,
        decodedTimezone
      );
    } catch (backendErr) {
      throw new BackendCallError(
        isIntegrationGatewayEnabled ? 'cmn-claims-info-v2' : 'get-claims-summary',
        backendErr
      );
    }

    let existingClaim;
    // Parse the user's timezone offset directly from the raw ISO string.
    // dayjs() in a UTC Lambda environment converts the date to UTC and loses the
    // original ±HH:MM offset, so utcOffset() would always return 0. Reading the
    // offset from the string ensures both dates are compared on the user's local
    // calendar day rather than the UTC calendar day.
    const userUtcOffset = parseUtcOffsetMinutes(userInputlossDate);
    const userDate = dayjs.utc(userInputlossDate).utcOffset(userUtcOffset);
    if (isIntegrationGatewayEnabled) {
      /**
       * V2 existing claim check.
       * Convert both dates to the user's local timezone before formatting so
       * that claims filed near midnight are compared on the correct local day.
       */
      existingClaim = getClaimInfoResponse?.find(claim => {
        const existingClaimLossDate = dayjs
          .utc(claim.lossDate)
          .utcOffset(userUtcOffset)
          .format('MM/DD/YYYY');
        const requestClaimLossDate = userDate.format('MM/DD/YYYY');
        logger.debug('Existing claim?', { lossDate: claim.lossDate, existingClaim, userDate });

        const isClaimOpenOrClosed =
          claim.status === ClaimStatus.Open || claim.status === ClaimStatus.Closed;
        return existingClaimLossDate === requestClaimLossDate && isClaimOpenOrClosed;
      });
    } else {
      /**
       * V1 existing claim check
       */
      existingClaim = getClaimInfoResponse?.claims?.find(claim => {
        const existingClaimLossDate = dayjs(claim.lossDate).format('MM/DD/YYYY');
        const requestClaimLossDate = userDate.format('MM/DD/YYYY');
        const isClaimOpenOrClosed =
          claim.claimStatus === ClaimStatus.Open || claim.claimStatus === ClaimStatus.Closed;
        return existingClaimLossDate === requestClaimLossDate && isClaimOpenOrClosed;
      });
      existingClaim = existingClaim
        ? { ...existingClaim, adjuster: existingClaim.adjusterDetails }
        : undefined;
      delete existingClaim?.adjusterDetails;
    }

    if (!existingClaim) {
      return claimNotFound(context, logger, logInfo);
    }
    logger.warn('Duplicate claim found', existingClaim);
    // log metrics and return response
    const body = {
      message: `Existing claim found for policyNumber ${policyNumber}`,
      APIResult: APIResult.Success,
      duplicateClaimExists: true,
      claimFound: existingClaim
    };
    return lambdaSuccess(context, logInfo, body, Metrics.GetClaimInfo);
  } catch (err: unknown) {
    const backendStatusCode =
      err instanceof BackendCallError
        ? (err.cause as { ComponentErrorCode?: number })?.ComponentErrorCode
        : undefined;

    if (backendStatusCode === 403) {
      return policyBlockedError(context, logInfo);
    }
    return lambdaError(context, logInfo, err, 'Unable to get claim info');
  }
};

export default exports;
