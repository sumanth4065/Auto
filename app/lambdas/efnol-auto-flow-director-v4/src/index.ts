import {
  IContext,
  IProxyIntegrationRequest,
  LambdaInvokeState,
  Logger,
  LoggerOptions,
  Uuid
} from '@ace-clublabs/aws-lambda-v3';
import { TaggingKey, TeamValue, WorkloadValue } from '@ace-clublabs/aws-tags';
import {
  Cache,
  extractTestRegionFromProxyRequest,
  getClaimExpiration,
  LambdaHelper
} from '@ace-clublabs/iss-common-lambda-v3';
import {
  getPolicyPrefix,
  getReferrerUrl,
  SplitIOHelper
} from '@lib/common-utils';
import { Metrics } from '@lib/types';
import { version } from 'process';
import { StatusCode } from 'status-code-enum';
import { autoUrls } from './constants/urls';

const logger = Logger.getInstance();
const issCache = new Cache('ISSCache');

const REDIRECT_MODE = {
  auto: StatusCode.RedirectFound,
  manual: StatusCode.SuccessOK
};

const REDIRECT_MODE_INPUT = {
  auto: 'auto',
  manual: 'manual'
};

const loggerOptions: LoggerOptions = {
  team: TeamValue.InsuranceSelfService,
  workload: WorkloadValue.Claims,
  /** component of your workload ie enterprise-forms-api or enterprise-forms-web-client */
  component: 'insurance-auto-efnol-api',
  /** your runtime/node version, can be pulled ie `import { version } from 'process';` */
  runtimeVersion: version
};

async function insertCache(cacheId, cacheObject, TTL) {
  return await issCache.setItem(cacheId, cacheObject, TTL);
}

async function retrieveCache(cacheId) {
  return await issCache.findItem(cacheId);
}

function createObject(str, outerDelimiter, innerDelimiter) {
  var obj = {};
  var pairs = str.split(outerDelimiter);
  for (var x = 0; x < pairs.length; x++) {
    var item = pairs[x].split(innerDelimiter);
    obj[item[0]] = item[1];
  }

  return obj;
}

export const handler = async (
  event: IProxyIntegrationRequest,
  context: IContext
) => {
  let lambdaHelperResponse;
  let logInfo;

  try {
    await logger.initialize(loggerOptions, context, event?.headers);
    logger.info(LambdaInvokeState.Start);

    if (!event?.body) {
      logger.warn(`payload is missing`);
      lambdaHelperResponse = LambdaHelper.response({
        statusCode: StatusCode.ClientErrorBadRequest,
        requestId: context.awsRequestId,
        body: { error: { message: 'Error: payload is missing' } }
      });
      return lambdaHelperResponse;
    }

    var pairs = event.body.split('&');
    var policyId = '';
    var clubCode = '';
    let isMobileApp = false;
    let isMobileAppAccidentDetection = false;
    let crashDatePrediction = '';
    let area = '';
    let testRegion = '';
    let sourceApp = '';
    let redirectMode = '';
    for (let i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      var words = pair.split('=');

      if (words[0].includes('clubCode')) clubCode = words[1];
      else if (words[0].includes('policy')) policyId = words[1];
      else if (words[0].includes('redirectMode')) redirectMode = words[1];
      else if (words[0].includes('area')) area = words[1];
      else if (words[0].includes('testRegion')) testRegion = words[1];
      else if (words[0].includes('isMobileAppAccidentDetection')) {
        isMobileAppAccidentDetection = words[1].toLowerCase() === 'true';
      } else if (words[0].includes('isMobileApp'))
        isMobileApp = words[1].toLowerCase() === 'true';
      else if (words[0].includes('crashDatePrediction')) {
        crashDatePrediction = words[1];
      } else if (words[0].includes('sourceApp')) {
        sourceApp = words[1];
      }
    }
    logInfo = {
      policyId,
      clubCode,
      isMobileApp,
      isMobileAppAccidentDetection,
      crashDatePrediction,
      sourceApp
    };

    const policyPrefix = getPolicyPrefix(policyId);
    const policyPrefixAllowed = await SplitIOHelper.getPolicyPrefixAllowed(logger, policyPrefix);

    if (!policyPrefixAllowed) {
      const policyTypeError = `Policy prefix ${policyPrefix} is not allowed to load Auto EFNOL.`;
      logger.warn(policyTypeError);
      logger.info(LambdaInvokeState.Complete, logInfo);

      lambdaHelperResponse = LambdaHelper.response({
        statusCode: StatusCode.ClientErrorNotFound,
        requestId: context.awsRequestId,
        body: {
          error: {
            message: JSON.stringify(policyTypeError)
          }
        },
      });
      return lambdaHelperResponse;
    }

    const guid = Uuid.getId();
    var obj = createObject(event?.body, '&', '=');
    var s = JSON.stringify(obj);
    await insertCache(guid, s, getCacheExpiration());
    logger.debug(`Item ${policyId} was added to cache`);

    const testRegionFromHeader = extractTestRegionFromProxyRequest(event);
    if (testRegionFromHeader != null) {
      testRegion = testRegionFromHeader;
    }

    const currentLambdaDomainName = event?.requestContext?.domainName?.split('.')[1] || '';
    let envKey = '';
    if (isMobileApp && !testRegion) {
      if (currentLambdaDomainName.toLowerCase() === 'prod') envKey = 'prod';
      if (currentLambdaDomainName.toLowerCase() === 'uat') envKey = 'uat';
      if (currentLambdaDomainName.toLowerCase() === 'qa') envKey = 'qa';
    } else {
      if (testRegion === 'A1') {
        if (currentLambdaDomainName.toLowerCase() === 'uat') envKey = 'uat';
        if (currentLambdaDomainName.toLowerCase() === 'qa') envKey = 'qa';
      } else if (testRegion === 'B1') {
        if (currentLambdaDomainName.toLowerCase() === 'uat') envKey = 'uat2';
        if (currentLambdaDomainName.toLowerCase() === 'qa') envKey = 'qa2';
      }
    }
    // Default testRegion to A1 for non-prod when not set by header, body, or mobile+prod path
    if (envKey !== 'prod' && testRegion === '') {
      testRegion = 'A1';
    }

    logger.debug('testRegion is set to :', { testRegion });

    const referrerURL = getReferrerUrl(autoUrls, testRegion);
    let redirectUrl = `${referrerURL}/${guid}`;

    if (isMobileAppAccidentDetection && crashDatePrediction !== '') {
      const separator = redirectUrl.includes('?') ? '&' : '?';
      redirectUrl += `${separator}isMobileAppAccidentDetection=true&crashDatePrediction=${crashDatePrediction}`;
    }

    if (isMobileApp) {
      const separator = redirectUrl.includes('?') ? '&' : '?';
      redirectUrl += `${separator}isMobileApp=true`;
    }

    if (process.env.ENABLE_SPLASH === 'true') {
      redirectUrl = `${referrerURL}/maintenance?clubCode=${clubCode}&splashStart=${process.env.SPLASH_START}&splashEnd=${process.env.SPLASH_END}`;
    }
    if (clubCode) {
      if (!redirectUrl.includes('?')) {
        redirectUrl += `?clubCode=${clubCode}`;
      } else {
        redirectUrl += `&clubCode=${clubCode}`;
      }
    }
    const locationUrl = decodeURI(redirectUrl);
    const responseBody =
      redirectMode === REDIRECT_MODE_INPUT.manual
        ? { redirectUrl: locationUrl }
        : 'Success';
    const responseStatusCode =
      REDIRECT_MODE[redirectMode] || REDIRECT_MODE.auto;

    logger.debug('redirectUrl', {
      logInfo,
      redirectUrl,
      redirectMode,
      responseStatusCode
    });
    logger.debug('Redirecting to authcodeLogin endpoint', logInfo);

    logger.info(Metrics.FlowDirector, logInfo);
    logger.info(LambdaInvokeState.Complete, logInfo);
    lambdaHelperResponse = LambdaHelper.response({
      statusCode: responseStatusCode,
      requestId: context.awsRequestId,
      body: responseBody,
      headers: {
        Location: locationUrl
      }
    });
    return lambdaHelperResponse;
  } catch (error) {
    logger.debug('throwing error', error as any);
    logger.error(LambdaInvokeState.Error, { error, ...logInfo });

    lambdaHelperResponse = LambdaHelper.response({
      statusCode: StatusCode.ServerErrorInternal,
      requestId: context.awsRequestId,
      body: {
        error: {
          message: JSON.stringify('Error Response: ' + error)
        }
      }
    });

    return lambdaHelperResponse;
  }
};

export function getCacheExpiration(): number {
  try {
    const env = logger.getMeta()[TaggingKey.Environment]
      ? logger.getMeta()[TaggingKey.Environment]
      : 'dev';
    const cacheExpMilliseconds: number = getClaimExpiration(env);
    return cacheExpMilliseconds;
  } catch (error) {
    return 86400;
  }
}

export default exports;
