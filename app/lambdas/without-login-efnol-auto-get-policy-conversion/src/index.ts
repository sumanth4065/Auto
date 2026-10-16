import { IContext, IEvent, LambdaInvokeState } from '@ace-clublabs/aws-lambda-v3';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import { ConversionType } from '@ace-clublabs/iss-common-shared-claims-models';
import {
  FeatureFlagService,
  Features,
  NodeFeatureFlagClient,
  SecretsManagerKeyProvider
} from '@ace-clublabs/feature-flags';
import {
  AutoEfnolLoggerOptions,
  BackendCallError,
  extractBehindLoginOrAnonymousProps,
  getAuthorizationToken,
  getRequestHeaders,
  lambdaError,
  lambdaSuccess,
  notAuthorized,
  policyNotFound,
  SPLIT_IO_SECRET_ID
} from '@lib/common-utils';
import { Metrics } from '@lib/types';
import { AppName } from '@lib/shared-contracts';
import { getConversionResult, noConversionResult } from './helpers';

const logger = MaskedLogger.getInstance();

/**
 * Module-level client and service — instantiated once outside the handler to
 * avoid redundant Secrets Manager calls on warm Lambda invocations.
 */
const featureFlagClient = new NodeFeatureFlagClient({
  logger,
  sdkKeyProvider: new SecretsManagerKeyProvider({ secretId: SPLIT_IO_SECRET_ID })
});

const featureFlagService = new FeatureFlagService({ client: featureFlagClient, logger });

export const handler = async (event: IEvent, context: IContext) => {
  let logInfo: Record<string, unknown> | undefined;

  try {
    await logger.initialize(AutoEfnolLoggerOptions, context, event?.headers);
    logger.info(LambdaInvokeState.Start, logInfo);

    // Auth
    const token: string = getAuthorizationToken(event);
    if (!token) {
      return notAuthorized(context, logInfo);
    }

    const autoEFNOLPStarConversionCheckFlag = await featureFlagService.getTreatment(
      'efnol',
      Features.AutoEFNOLPStarConversionCheck
    );

    // Extract request body
    const requestBody: { policyNumber?: string; conversionType?: ConversionType } =
      JSON.parse(event.body) || {};
    const { policyNumber, conversionType } = requestBody;

    if (!policyNumber) {
      return policyNotFound(context, logInfo, 'Policy number missing from request body');
    }

    if (!conversionType) {
      return policyNotFound(context, logInfo, 'Conversion type missing from request body');
    }

    logInfo = { policyNumber, conversionType };

    // Validate policy number against token / cache
    const policyGuid: string | null = event['queryStringParameters']?.['policyGuid'] || null;
    const {
      policyNumber: extractedPolicyNumber,
      loginFlowType,
      efnolApplication,
      clubCode
    } = await extractBehindLoginOrAnonymousProps(policyGuid, token);

    logInfo = { policyNumber, conversionType, loginFlowType, efnolApplication, clubCode };

    if (policyNumber !== extractedPolicyNumber) {
      return policyNotFound(context, logInfo, 'Policy number mismatch');
    }

    if (autoEFNOLPStarConversionCheckFlag.treatment !== 'on') {
      logger.info('Conversion check feature flag is off, returning no conversion result');
      const result = noConversionResult(policyNumber, conversionType);
      return lambdaSuccess(context, logInfo, result, Metrics.PolicyConversion);
    }

    const requestHeaders = getRequestHeaders(
      event.headers,
      null,
      logger.getClientContext()?.correlationId || context?.clientContext?.correlationId || '',
      logger.getClientContext()?.sessionId || context?.clientContext?.sessionId || '',
      AppName.clublabsAutoEFNOL,
      clubCode
    );

    // Resolve conversion eligibility and call downstream
    const result = await getConversionResult(
      policyNumber,
      conversionType,
      token,
      context,
      featureFlagService,
      logger,
      requestHeaders,
      loginFlowType,
      efnolApplication
    );

    return lambdaSuccess(context, logInfo, result, Metrics.PolicyConversion);
  } catch (err) {
    const wrappedErr = err instanceof BackendCallError ? err : new BackendCallError('cmn-efnol-policy-conversion-check', err);
    return lambdaError(context, logInfo, wrappedErr, 'Unable to get policy conversion');
  }
};

export default exports;
