import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import { IContext, IEvent, LambdaInvokeState, Secrets } from '@ace-clublabs/aws-lambda-v3';
import { ClaimsAuthorizationHelper, ClientApplication } from '@ace-clublabs/iss-cci-clients';
import { CryptoHelper, EncryptionAlgorithmType, Metrics } from '@ace-clublabs/iss-common-lambda-v3';
import { DateHelper, ITenant, PolicyTypeAndTenantHelper } from '@ace-clublabs/iss-common-util';
import {
  AutoEfnolLoggerOptions,
  extractBehindLoginOrAnonymousProps,
  getAuthorizationToken,
  getPolicyPrefix,
  getRequestHeaders,
  lambdaSuccess,
  notAuthorized,
  policyNotFound,
  policyUnauthorized
} from '@lib/common-utils';
import { AppName, LoginFlowType } from '@lib/shared-contracts';
import { ISafeliteRedirectUrlResponse } from '@lib/types';

const AWSXRay = require('aws-xray-sdk-core');
AWSXRay.captureAWSv3Client(new SecretsManagerClient({}));
AWSXRay.captureHTTPsGlobal(require('http'));

const secretManager = new Secrets(process.env.AWS_REGION);

const SAFELITE_SECRET_ID = 'service/safelite/authentication/RSAKey';

const SAFELITE_BACKUP_REDIRECT_PROD = 'https://submit.glassclaim.com/SelfService/Default.aspx';
const SAFELITE_BACKUP_REDIRECT_NONPROD =
  'https://submittest.glassclaim.com/SelfService/Default.aspx';

export const handler = async (event: IEvent, context: IContext) => {
  const logger = MaskedLogger.getInstance();
  let logInfo;

  const brand: 'AAA' | 'WInsurance' =
    event['queryStringParameters']?.['brand'] === 'WInsurance' ? 'WInsurance' : 'AAA';

  const backupRedirect =
    process.env.ENVIRONMENT === 'prod'
      ? SAFELITE_BACKUP_REDIRECT_PROD
      : SAFELITE_BACKUP_REDIRECT_NONPROD;

  const redirectBase =
    (brand === 'WInsurance'
      ? process.env.SAFELITE_REDIRECT_WINSURANCE
      : process.env.SAFELITE_REDIRECT) || backupRedirect;
  const clientTag =
    (brand === 'WInsurance'
      ? process.env.SAFELITE_CLIENT_TAG_WINSURANCE
      : process.env.SAFELITE_CLIENT_TAG) || '';

  const hasQuery = redirectBase.includes('?');
  const baseWithQuery = hasQuery ? redirectBase : `${redirectBase}?`;
  const delimiter = hasQuery ? '&' : '';
  const safeliteUrl = clientTag
    ? `${baseWithQuery}${delimiter}ClientTag=${encodeURIComponent(clientTag)}`
    : baseWithQuery;

  try {
    // start
    await logger.initialize(AutoEfnolLoggerOptions, context, event.headers);

    logger.info(LambdaInvokeState.Start, { ...logInfo, brand: brand || 'AAA' });

    // extract/test token

    const token: string = getAuthorizationToken(event);

    if (!token) {
      return notAuthorized(context, logInfo);
    }

    // decode policyGuid from URL to get policyNumber

    const policyGuid: string | null = event['queryStringParameters']?.['policyGuid'] || null;

    logInfo = { ...logInfo, policyGuid };

    const {
      policyNumber,
      loginFlowType,
      efnolApplication,
      clubCode: cacheClubCode
    } = await extractBehindLoginOrAnonymousProps(policyGuid, token);

    if (!policyNumber) {
      return policyNotFound(context, logInfo, 'Policy number not found');
    }

    // infer clubCode from policy prefix

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

    // Policy authorization with CCI
    logger.info('Calling Claims Authorization Helper', logInfo);

    const isFlowTypeBehindLogin = loginFlowType === LoginFlowType.BEHIND_LOGIN;
    // generate request headers
    if (isFlowTypeBehindLogin) {
      const customerId = event.requestContext?.authorizer?.customerId;
      const authorizationHelper = new ClaimsAuthorizationHelper();
      const requestHeaders = getRequestHeaders(
        event.headers,
        null,
        logger.getClientContext().correlationId,
        logger.getClientContext().sessionId,
        AppName.clublabsAutoEFNOL,
        clubCode
      );
      let isAuthorized = await authorizationHelper.isPolicyAuthorizedAsync(
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

    // get safelite payload: encodedToken

    const currentDateTime = DateHelper.formatYYYYMMDDHHMMSS(new Date());
    const safeliteToken = currentDateTime + '|' + policyNumber;
    const buffer = Buffer.from(safeliteToken);
    const encodedSafeliteToken = encodeURIComponent(safeliteToken);

    // Get the Safelite private certificate from aws secret manager

    logger.debug('Calling secrets manager', logInfo);
    const secretResponse = await secretManager.getSecretValue(SAFELITE_SECRET_ID);

    let safeliteCert = secretResponse.SecretString;

    if (!safeliteCert) {
      throw new Error('Safelite RSA public key not found');
    }

    logger.debug('Getting the encoded signature', logInfo);
    let encodedSignature = CryptoHelper.GetEncodedSignatureWithBase64AndURI(
      buffer,
      EncryptionAlgorithmType.RSA_SHA256,
      safeliteCert
    );

    const body: ISafeliteRedirectUrlResponse = {
      safeliteRedirectUrl: `${safeliteUrl}&PolicyNumber=${policyNumber}&Token=${encodedSafeliteToken}&Signature=${encodedSignature}`,
      safeliteRedirectMessage: 'Success'
    };
    return lambdaSuccess(context, logInfo, body, Metrics.AutoGetSafeliteRediretURL);
  } catch (error) {
    // for all errors, we will return a success, but the safeliteRedirectUrl will not include the safeliteToken & policyNumber
    const body: ISafeliteRedirectUrlResponse = {
      safeliteRedirectUrl: `${safeliteUrl}`,
      safeliteRedirectMessage: 'Success'
    };
    return lambdaSuccess(context, logInfo, body, Metrics.AutoGetSafeliteRediretURL);
  }
};

export default exports;
