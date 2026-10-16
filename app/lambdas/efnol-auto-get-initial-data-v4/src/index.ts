import { StatusCode } from 'status-code-enum';
import { jwtDecode } from 'jwt-decode';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import {
  IContext,
  IEvent,
  IProxyIntegrationRequest,
  LambdaInvokeState
} from '@ace-clublabs/aws-lambda-v3';
import {
  ClaimsAuthorizationHelper,
  ClientApplication,
  ServiceFactory
} from '@ace-clublabs/iss-cci-clients';
import {
  Cache,
  extractTestRegionFromProxyRequest,
  LambdaHelper
} from '@ace-clublabs/iss-common-lambda-v3';
import {
  FeatureFlagService,
  Features,
  NodeFeatureFlagClient,
  SecretsManagerKeyProvider
} from '@ace-clublabs/feature-flags';
import { ConversionType } from '@ace-clublabs/iss-common-shared-claims-models';
import {
  EfnolApplication,
  LoginFlowType
} from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  ClientConfigHelper,
  commonConstants,
  getGuidewireSecrets,
  getRequestHeaders,
  GUIDEWIRE_SECRET_ID,
  IBuildClientConfigParams,
  BehindLoginAutoEfnolLoggerOptions,
  splitIOSecretName
} from '@lib/common-utils';
import { AppName } from '@lib/shared-contracts';
import { IExtendedPolicyData, IRequestHeaders, Metrics } from '@lib/types';
import { getConversionResult, getERSURL, noConversionResult } from './helpers';

const AWSXRay = require('aws-xray-sdk-core');

AWSXRay.captureAWSv3Client(new SecretsManagerClient({}));
AWSXRay.captureHTTPsGlobal(require('http'));

const logger = MaskedLogger.getInstance();
const cache = new Cache('ISSCache');

const authorizationHelper = new ClaimsAuthorizationHelper();

/**
 * Module-level client and service — instantiated once outside the handler to
 * avoid redundant Secrets Manager calls on warm Lambda invocations.
 */
const featureFlagClient = new NodeFeatureFlagClient({
  logger,
  sdkKeyProvider: new SecretsManagerKeyProvider({
    secretId: splitIOSecretName
  })
});

const featureFlagService = new FeatureFlagService({
  client: featureFlagClient,
  logger
});

async function findItem(cacheId) {
  return await cache.findItem(cacheId);
}

const parseError = (error: any): any => {
  try {
    const jsonStr = JSON.stringify(error);
    if (jsonStr === '{}') {
      return {
        message: error.toString()
      };
    } else {
      return error;
    }
  } catch {
    return {
      message: error?.message
    };
  }
};

async function addCustomerDetails(
  object: Object,
  token: string,
  clubCode: string,
  testRegion: string,
  policyNumber: string
) {
  const clientConfigParams: IBuildClientConfigParams = {
    authBearer: token,
    clubCode,
    testRegion,
    clientApplication: ClientApplication.AUTO_CLAIMS
  };

  const clientConfig = ClientConfigHelper.buildClientConfig(clientConfigParams);

  const serviceFactory = new ServiceFactory({
    clientConfig,
    logger
  });

  const customerService = serviceFactory.createCustomerService();
  const jwtToken = jwtDecode<{ customerId: string }>(token);
  const customerId = jwtToken.customerId;

  const customer = await customerService.getCustomerFullInfo({
    customerId,
    clientConfig,
    policyNumber
  });

  const email = customer?.customer?.contact?.email?.address || '';
  const phone = customer?.customer?.contact?.phones?.[0]?.phoneNumber || '';

  return {
    ...object,
    email,
    phone
  };
}

export const handler = async (event: IEvent, context: IContext) => {
  let logInfo;
  await logger.initialize(BehindLoginAutoEfnolLoggerOptions, context, event?.headers); //Required logging

  logger.debug('Request Headers extracted', event.headers);
  try {
    logger.info(LambdaInvokeState.Start, logInfo);
    const customerId = event.requestContext?.authorizer?.customerId;

    const cacheId = event.pathParameters?.id;
    logger.debug('Fetching Cache data', logInfo);
    const initialData = await findItem(cacheId);

    const count = initialData?.Count;
    if (typeof count === 'undefined' || count === 0) {
      logger.warn('Claim cache item with id ' + cacheId + ' not found');
      logger.info(LambdaInvokeState.Complete, logInfo);
      return LambdaHelper.response({
        statusCode: StatusCode.ClientErrorNotFound,
        requestId: context?.awsRequestId,
        body: {
          error: {
            message: 'Claim cache item not found'
          }
        }
      });
    } else {
      logger.debug('Found ' + count + ' items');
    }

    const cacheItem = initialData?.Items?.pop();
    const data: IExtendedPolicyData = JSON.parse(cacheItem['data']['S']);

    const { policy, claim, clubCode, sourceApp } = data;
    logInfo = {
      policy,
      claim,
      clubCode,
      sourceApp
    };

    const guidewireCreds = await getGuidewireSecrets(GUIDEWIRE_SECRET_ID);
    logger.debug('Received secrets from secrets manager');
    const requestHeaders: IRequestHeaders = getRequestHeaders(
      event?.headers,
      guidewireCreds,
      logger.getClientContext().correlationId,
      logger.getClientContext().sessionId,
      AppName.clublabsAutoEFNOL,
      clubCode
    );
    // retrieve split feature flag
    logger.debug('Retrieving split.io feature flag based on market', {
      logInfo
    });

    let policyUseIsAuthorized =
      await authorizationHelper.isPolicyAuthorizedAsync(
        policy,
        customerId,
        event,
        requestHeaders,
        logger,
        ClientApplication.AUTO_CLAIMS
      );

    if (!policyUseIsAuthorized) {
      logger.warn(commonConstants.POLICY_UNAUTHORIZED, logInfo);
      logger.info(LambdaInvokeState.Complete, logInfo);

      return LambdaHelper.response({
        statusCode: StatusCode.ClientErrorForbidden,
        requestId: context.awsRequestId,
        body: {
          error: {
            message: commonConstants.POLICY_UNAUTHORIZED
          }
        }
      });
    }

    const testRegion =
      process.env.ENVIRONMENT === 'prod'
        ? ''
        : extractTestRegionFromProxyRequest(
            event as unknown as IProxyIntegrationRequest
          ) || 'A1';

    // Conversion check feature flag
    const { treatment: pStarToGWConversionCheckTreatment } =
      await featureFlagService.getTreatment(
        'efnol',
        Features.AutoEFNOLPStarConversionCheck
      );

    // Check conversion eligibility — HARD FAIL on errors
    const pStarToGWConversionResult =
      pStarToGWConversionCheckTreatment !== 'on'
        ? noConversionResult(policy, ConversionType.PSTAR_TO_GW)
        : await getConversionResult(
            policy,
            ConversionType.PSTAR_TO_GW,
            event?.headers?.Authorization,
            context,
            featureFlagService,
            logger,
            requestHeaders,
            LoginFlowType.BEHIND_LOGIN,
            EfnolApplication.AutoEfnol1stPartyBehindLogin
          );

    // add customer details
    const updatedData = await addCustomerDetails(
      data,
      event?.headers?.Authorization,
      clubCode,
      testRegion,
      policy
    );

    logger.info(Metrics.GetInitialData, logInfo);
    logger.info(LambdaInvokeState.Complete, logInfo);

    const body = JSON.stringify({
      sourceApp,
      policyData: {
        ...updatedData,
        conversionResult: pStarToGWConversionResult,
        EnableSplash: process.env.ENABLE_SPLASH === 'true',
        SplashStart: process.env.SPLASH_START,
        SplashEnd: process.env.SPLASH_END,
        ERSURL: getERSURL()
      }
    });

    return {
      statusCode: StatusCode.SuccessOK,
      headers: {
        ['Access-Control-Allow-Origin']: '*'
      },
      body
    };
  } catch (error) {
    const parsedError = parseError(error);
    logger.debug('throwing error', { ...parsedError });
    logger.error(LambdaInvokeState.Error, { message: 'Unable to get initial data', error: parsedError, ...logInfo });
    return LambdaHelper.response({
      statusCode: StatusCode.ServerErrorInternal,
      requestId: context?.awsRequestId,
      body: {
        error: {
          message: parsedError?.message || 'Unable to get initial data'
        }
      }
    });
  }
};

export default exports;
