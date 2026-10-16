const fs = require('fs');

const environment = process.env.ENVIRONMENT;
const BuildVersion = process.env.BUILD_VERSION;

const constants = {
  SAFELITE_CLIENT_TAG: 'FF61D366-97A7-4D67-ABCD-4D390DAF5DA3',
  SAFELITE_REDIRECT_PROD: 'https://submit.glassclaim.com/SelfService/Default.aspx',
  SAFELITE_REDIRECT_NON_PROD: 'https://submittest.glassclaim.com/SelfService/Default.aspx',

  SAFELITE_CLIENT_TAG_WINSURANCE: 'd2fd3766-dfe2-46c3-b96c-372a234ca42e',
  SAFELITE_REDIRECT_WINSURANCE_PROD: 'https://submit.glassclaim.com/self-service/Welcome.aspx',
  SAFELITE_REDIRECT_WINSURANCE_NON_PROD:
    'https://submittest.glassclaim.com/SelfService/Default.aspx',

  DEV_WORKLOAD_ACCOUNT_ID: '018363016784',
  QA_WORKLOAD_ACCOUNT_ID: '027449218986',
  UAT_WORKLOAD_ACCOUNT_ID: '387467002603',
  PROD_WORKLOAD_ACCOUNT_ID: '260742508131',

  DEV_AUTHORIZER_ACCOUNT_ID: '952398449877',
  QA_AUTHORIZER_ACCOUNT_ID: '124390951973',
  UAT_AUTHORIZER_ACCOUNT_ID: '918306374831',
  PROD_AUTHORIZER_ACCOUNT_ID: '663915535548',

  DEV_OREGON_DOMAIN_NAME_HOSTED_ZONE_ID: 'Z2OJLYMUO9EFXC',
  DEV_VIRGINIA_DOMAIN_NAME_HOSTED_ZONE_ID: 'Z1UJRXOUMOOFQ8',
  QA_OREGON_DOMAIN_NAME_HOSTED_ZONE_ID: 'Z2OJLYMUO9EFXC',
  QA_VIRGINIA_DOMAIN_NAME_HOSTED_ZONE_ID: 'Z1UJRXOUMOOFQ8',
  UAT_OREGON_DOMAIN_NAME_HOSTED_ZONE_ID: 'Z2OJLYMUO9EFXC',
  UAT_VIRGINIA_DOMAIN_NAME_HOSTED_ZONE_ID: 'Z1UJRXOUMOOFQ8',
  PROD_OREGON_DOMAIN_NAME_HOSTED_ZONE_ID: 'Z2OJLYMUO9EFXC',
  PROD_VIRGINIA_DOMAIN_NAME_HOSTED_ZONE_ID: 'Z1UJRXOUMOOFQ8',

  DEV_OREGON_DOMAIN_NAME_TARGET: 'd-hb4nj5iqvb.execute-api.us-west-2.amazonaws.com',
  DEV_VIRGINIA_DOMAIN_NAME_TARGET: 'd-kg712b5dn6.execute-api.us-east-1.amazonaws.com',
  QA_OREGON_DOMAIN_NAME_TARGET: 'd-xcogvr16qh.execute-api.us-west-2.amazonaws.com',
  QA_VIRGINIA_DOMAIN_NAME_TARGET: 'd-kuvhe6o12k.execute-api.us-east-1.amazonaws.com',
  UAT_OREGON_DOMAIN_NAME_TARGET: 'd-9y1sroapf2.execute-api.us-west-2.amazonaws.com',
  UAT_VIRGINIA_DOMAIN_NAME_TARGET: 'd-tzib1v4bec.execute-api.us-east-1.amazonaws.com',
  PROD_OREGON_DOMAIN_NAME_TARGET: 'd-3hp2lvr5t7.execute-api.us-west-2.amazonaws.com',
  PROD_VIRGINIA_DOMAIN_NAME_TARGET: 'd-79i4tmzhbb.execute-api.us-east-1.amazonaws.com',

  DEV_ALLOWED_ORIGINS:
    'https://appdev1.ace.aaa.com|https://appdev2.ace.aaa.com|http://localhost:3000|https://account.app.dev.ace.aaa.com',
  QA_ALLOWED_ORIGINS:
    'https://appqa1.ace.aaa.com|https://appqa2.ace.aaa.com|https://account.app.qa.ace.aaa.com',
  UAT_ALLOWED_ORIGINS:
    'https://appuat1.ace.aaa.com|https://appuat2.ace.aaa.com|https://account.app.uat.ace.aaa.com',
  PROD_ALLOWED_ORIGINS: 'https://app.ace.aaa.com|https://account.app.ace.aaa.com',

  DEV_ALLOWED_HEADERS:
    'X-Ace-Test-Region,X-Ace-Mock,X-Ace-Test-Scenario,X-Request-Id,X-Ace-Session-Id,Accept,X-Ace-MockScenario,X-Ace-Correlation-Id,X-Ace-Test-Track',
  QA_ALLOWED_HEADERS:
    'X-Ace-Test-Region,X-Ace-Mock,X-Ace-Test-Scenario,X-Request-Id,X-Ace-Session-Id,Accept,X-Ace-MockScenario,X-Ace-Correlation-Id,X-Ace-Test-Track',
  UAT_ALLOWED_HEADERS:
    'X-Ace-Test-Region,X-Ace-Mock,X-Ace-Test-Scenario,X-Request-Id,X-Ace-Session-Id,Accept,X-Ace-MockScenario,X-Ace-Correlation-Id,X-Ace-Test-Track',
  PROD_ALLOWED_HEADERS: 'X-Request-Id,X-Ace-Session-Id,Accept',

  DYNAMODB_ENCRYPTION_KEYS: {
    DEV: {
      ['us-west-2']: 'b2de1ad5-a8a0-425f-be8f-eba4e52d288d',
      ['us-east-1']: '2f7de1c5-b20a-46f0-8f7e-28c70c9be858'
    },
    QA: {
      ['us-west-2']: '1869e38b-d641-4ec8-8298-c280145b542a',
      ['us-east-1']: '3b51dc93-6024-4128-bc91-476e98466cc3'
    },
    UAT: {
      ['us-west-2']: 'ef7ca1d0-57d8-41ad-8158-73788f983d45',
      ['us-east-1']: 'af171593-05a3-4b80-9a65-3d769ca50a7b'
    },
    PROD: {
      ['us-west-2']: 'b528a274-690d-4dba-a910-44958c8f55a7',
      ['us-east-1']: '2be46534-20b2-41d3-a3ec-15ad8a9c3704'
    }
  }
};

const DEV_COMMON_PARAMS = {
  AllowedOrigins: constants.DEV_ALLOWED_ORIGINS,
  AllowedHeaders: constants.DEV_ALLOWED_HEADERS,
  allowedOrigin1: 'https://appdev1.ace.aaa.com',
  allowedOrigin2: 'https://appdev2.ace.aaa.com',
  AdProxyAccountID: '999858322247',
  AuthorizerAccountId: constants.DEV_AUTHORIZER_ACCOUNT_ID,
  WorkloadAccountId: constants.DEV_WORKLOAD_ACCOUNT_ID,
  DomainName: 'insurance-self-service-auto-efnol.common.api.dev.clublabs.net',
  SafeliteClientTag: constants.SAFELITE_CLIENT_TAG,
  SafeliteRedirect: constants.SAFELITE_REDIRECT_NON_PROD,
  SafeliteClientTagWInsurance: constants.SAFELITE_CLIENT_TAG_WINSURANCE,
  SafeliteRedirectWInsurance: constants.SAFELITE_REDIRECT_WINSURANCE_NON_PROD,
  BuildVersion: BuildVersion,
  Environment: 'dev'
};

const QA_COMMON_PARAMS = {
  AllowedOrigins: constants.QA_ALLOWED_ORIGINS,
  AllowedHeaders: constants.QA_ALLOWED_HEADERS,
  allowedOrigin1: 'https://appqa1.ace.aaa.com',
  allowedOrigin2: 'https://appqa2.ace.aaa.com',
  AdProxyAccountID: '528429295783',
  AuthorizerAccountId: constants.QA_AUTHORIZER_ACCOUNT_ID,
  WorkloadAccountId: constants.QA_WORKLOAD_ACCOUNT_ID,
  DomainName: 'insurance-self-service-auto-efnol.common.api.qa.clublabs.net',
  SafeliteClientTag: constants.SAFELITE_CLIENT_TAG,
  SafeliteRedirect: constants.SAFELITE_REDIRECT_NON_PROD,
  SafeliteClientTagWInsurance: constants.SAFELITE_CLIENT_TAG_WINSURANCE,
  SafeliteRedirectWInsurance: constants.SAFELITE_REDIRECT_WINSURANCE_NON_PROD,
  BuildVersion: BuildVersion,
  Environment: 'qa'
};

const UAT_COMMON_PARAMS = {
  AllowedOrigins: constants.UAT_ALLOWED_ORIGINS,
  AllowedHeaders: constants.UAT_ALLOWED_HEADERS,
  allowedOrigin1: 'https://appuat1.ace.aaa.com',
  allowedOrigin2: 'https://appuat2.ace.aaa.com',
  AdProxyAccountID: '982699866693',
  AuthorizerAccountId: constants.UAT_AUTHORIZER_ACCOUNT_ID,
  WorkloadAccountId: constants.UAT_WORKLOAD_ACCOUNT_ID,
  DomainName: 'insurance-self-service-auto-efnol.common.api.uat.clublabs.net',
  SafeliteClientTag: constants.SAFELITE_CLIENT_TAG,
  SafeliteRedirect: constants.SAFELITE_REDIRECT_NON_PROD,
  SafeliteClientTagWInsurance: constants.SAFELITE_CLIENT_TAG_WINSURANCE,
  SafeliteRedirectWInsurance: constants.SAFELITE_REDIRECT_WINSURANCE_NON_PROD,
  BuildVersion: BuildVersion,
  Environment: 'uat'
};

const PROD_COMMON_PARAMS = {
  AllowedOrigins: constants.PROD_ALLOWED_ORIGINS,
  AllowedHeaders: constants.PROD_ALLOWED_HEADERS,
  allowedOrigin1: 'https://app.ace.aaa.com',
  allowedOrigin2: 'https://app.ace.aaa.com',
  AdProxyAccountID: '137986100447',
  AuthorizerAccountId: constants.PROD_AUTHORIZER_ACCOUNT_ID,
  WorkloadAccountId: constants.PROD_WORKLOAD_ACCOUNT_ID,
  DomainName: 'insurance-self-service-auto-efnol.common.api.prod.clublabs.net',
  SafeliteClientTag: constants.SAFELITE_CLIENT_TAG,
  SafeliteRedirect: constants.SAFELITE_REDIRECT_PROD,
  SafeliteClientTagWInsurance: constants.SAFELITE_CLIENT_TAG_WINSURANCE,
  SafeliteRedirectWInsurance: constants.SAFELITE_REDIRECT_WINSURANCE_PROD,
  BuildVersion: BuildVersion,
  Environment: 'prod'
};

let PARAMETERS_VIRGINIA, PARAMETERS_OREGON;
if (environment === 'dev') {
  PARAMETERS_OREGON = JSON.stringify({
    ...DEV_COMMON_PARAMS,
    DynamoDbEncryptionKey: constants.DYNAMODB_ENCRYPTION_KEYS.DEV['us-west-2'],
    DomainNameAliasHostedZoneId: constants.DEV_OREGON_DOMAIN_NAME_HOSTED_ZONE_ID,
    DomainNameAliasTarget: constants.DEV_OREGON_DOMAIN_NAME_TARGET
  }).replace(/"/g, '\\"');
  PARAMETERS_VIRGINIA = JSON.stringify({
    ...DEV_COMMON_PARAMS,
    DynamoDbEncryptionKey: constants.DYNAMODB_ENCRYPTION_KEYS.DEV['us-east-1'],
    DomainNameAliasHostedZoneId: constants.DEV_VIRGINIA_DOMAIN_NAME_HOSTED_ZONE_ID,
    DomainNameAliasTarget: constants.DEV_VIRGINIA_DOMAIN_NAME_TARGET
  }).replace(/"/g, '\\"');
}
if (environment === 'qa') {
  PARAMETERS_OREGON = JSON.stringify({
    ...QA_COMMON_PARAMS,
    DynamoDbEncryptionKey: constants.DYNAMODB_ENCRYPTION_KEYS.QA['us-west-2'],
    DomainNameAliasHostedZoneId: constants.QA_OREGON_DOMAIN_NAME_HOSTED_ZONE_ID,
    DomainNameAliasTarget: constants.QA_OREGON_DOMAIN_NAME_TARGET
  }).replace(/"/g, '\\"');
  PARAMETERS_VIRGINIA = JSON.stringify({
    ...QA_COMMON_PARAMS,
    DynamoDbEncryptionKey: constants.DYNAMODB_ENCRYPTION_KEYS.QA['us-east-1'],
    DomainNameAliasHostedZoneId: constants.QA_VIRGINIA_DOMAIN_NAME_HOSTED_ZONE_ID,
    DomainNameAliasTarget: constants.QA_VIRGINIA_DOMAIN_NAME_TARGET
  }).replace(/"/g, '\\"');
}
if (environment === 'uat') {
  PARAMETERS_OREGON = JSON.stringify({
    ...UAT_COMMON_PARAMS,
    DynamoDbEncryptionKey: constants.DYNAMODB_ENCRYPTION_KEYS.UAT['us-west-2'],
    DomainNameAliasHostedZoneId: constants.UAT_OREGON_DOMAIN_NAME_HOSTED_ZONE_ID,
    DomainNameAliasTarget: constants.UAT_OREGON_DOMAIN_NAME_TARGET
  }).replace(/"/g, '\\"');
  PARAMETERS_VIRGINIA = JSON.stringify({
    ...UAT_COMMON_PARAMS,
    DynamoDbEncryptionKey: constants.DYNAMODB_ENCRYPTION_KEYS.UAT['us-east-1'],
    DomainNameAliasHostedZoneId: constants.UAT_VIRGINIA_DOMAIN_NAME_HOSTED_ZONE_ID,
    DomainNameAliasTarget: constants.UAT_VIRGINIA_DOMAIN_NAME_TARGET
  }).replace(/"/g, '\\"');
}
if (environment === 'prod') {
  PARAMETERS_OREGON = JSON.stringify({
    ...PROD_COMMON_PARAMS,
    DynamoDbEncryptionKey: constants.DYNAMODB_ENCRYPTION_KEYS.PROD['us-west-2'],
    DomainNameAliasHostedZoneId: constants.PROD_OREGON_DOMAIN_NAME_HOSTED_ZONE_ID,
    DomainNameAliasTarget: constants.PROD_OREGON_DOMAIN_NAME_TARGET
  }).replace(/"/g, '\\"');
  PARAMETERS_VIRGINIA = JSON.stringify({
    ...PROD_COMMON_PARAMS,
    DynamoDbEncryptionKey: constants.DYNAMODB_ENCRYPTION_KEYS.PROD['us-east-1'],
    DomainNameAliasHostedZoneId: constants.PROD_VIRGINIA_DOMAIN_NAME_HOSTED_ZONE_ID,
    DomainNameAliasTarget: constants.PROD_VIRGINIA_DOMAIN_NAME_TARGET
  }).replace(/"/g, '\\"');
}

fs.appendFileSync(
  process.env.GITHUB_ENV,
  `PARAMETERS_OREGON=${PARAMETERS_OREGON}\nPARAMETERS_VIRGINIA=${PARAMETERS_VIRGINIA}\n`
);
