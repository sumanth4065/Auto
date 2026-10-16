#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {
  LambdaConfig,
  LambdaName,
  AutoEFNOLNoAuthApiStack,
  DynamoDbAction
} from '../lib/app-stack';
import { Regions } from '@ace-clublabs/aws-cdk-codepipeline';
import * as tag from '@ace-clublabs/aws-tags';
import path = require('path');
import { constants } from '../constants';
import { EFNOLCacheTableName } from '@lib/common-utils';

const app = new cdk.App();

const sharedLambdaEnvironmentVariables = {
  ALLOW_HEADERS: {
    id: 'AllowedHeaders',
    description: '',
    defaultValue: ''
  },
  ALLOW_ORIGINS: {
    id: 'AllowedOrigins',
    description: '',
    defaultValue: ''
  },
  AD_PROXY_ACCOUNT_ID: {
    id: 'AdProxyAccountID',
    description: '',
    defaultValue: ''
  },
  SAFELITE_CLIENT_TAG: {
    id: 'SafeliteClientTag',
    description: '',
    defaultValue: ''
  },
  SAFELITE_REDIRECT: {
    id: 'SafeliteRedirect',
    description: '',
    defaultValue: ''
  },
  WORKLOAD_ACCOUNT_ID: {
    id: 'WorkloadAccountId',
    description: '',
    defaultValue: ''
  }
};

const { WORKLOAD_NAME, CDK_STACK_NAME } = constants;

const lambdaConfigs: LambdaConfig[] = [
  {
    lambdaName: LambdaName.AutoCorsHandlerWithoutLogin,
    lambdaDirName: LambdaName.AutoCorsHandlerWithoutLogin,
    timeout: 3,
    environmentVariables: {
      ALLOWED_ORIGINS: {
        id: 'AllowedOrigins',
        description: '',
        defaultValue: ''
      },
      ALLOWED_HEADERS: {
        id: 'AllowedHeaders',
        description: '',
        defaultValue: ''
      }
    },
    lambdaInvokePermissions: [{ action: 'OPTIONS', path: '*' }],
    gatewayApiResourcePath: {
      action: 'OPTIONS',
      endpoints: [
        { pathParts: ['claim'] },
        { pathParts: ['policy-info'] },
        { pathParts: ['claim-info'] },
        { pathParts: ['safelite-redirect'] },
        { pathParts: ['policy-conversion'] },
        { pathParts: ['flow-director'] },
        { pathParts: ['initial-data', '{id}'] }
      ]
    },
    bypassJwtAuth: true
  },
  {
    lambdaName: LambdaName.AutoGetPolicyWithoutLogin,
    lambdaDirName: LambdaName.AutoGetPolicyWithoutLogin,
    timeout: 29,
    environmentVariables: {
      ...sharedLambdaEnvironmentVariables
    },
    secrets: [
      'insuranceclaims/guidewirehub/policycenter*',
      'insuranceclaims/autoefnolwithoutlogin/splitioauthorizationkey*',
      'insuranceclaims/nativemule/cci*'
    ],
    lambdaInvokePermissions: [
      { action: 'GET', path: 'policy-info' },
      { action: 'GET', path: 'policy-info', pathParam: 'id' }
    ],
    gatewayApiResourcePath: {
      action: 'GET',
      endpoints: [{ pathParts: ['policy-info'] }]
    },
    dynamoDb: [
      {
        dbName: EFNOLCacheTableName.BehindLoginPolicyCache,
        dbActions: [DynamoDbAction.GetItem, DynamoDbAction.Query]
      },
      {
        dbName: EFNOLCacheTableName.ErrorCache,
        dbActions: [DynamoDbAction.PutItem]
      }
    ],
    enableVpc: true
  },
  {
    lambdaName: LambdaName.AutoGetClaimInfoWithoutLogin,
    lambdaDirName: LambdaName.AutoGetClaimInfoWithoutLogin,
    timeout: 29,
    environmentVariables: {
      ...sharedLambdaEnvironmentVariables
    },
    secrets: [
      'insuranceclaims/guidewirehub/policycenter*',
      'insuranceclaims/autoefnolwithoutlogin/splitioauthorizationkey*',
      'insuranceclaims/nativemule/cci*'
    ],
    lambdaInvokePermissions: [{ action: 'POST', path: 'claim-info' }],
    gatewayApiResourcePath: {
      action: 'POST',
      endpoints: [{ pathParts: ['claim-info'] }]
    },
    dynamoDb: [
      {
        dbName: EFNOLCacheTableName.BehindLoginPolicyCache,
        dbActions: [DynamoDbAction.GetItem, DynamoDbAction.Query]
      },
      {
        dbName: EFNOLCacheTableName.ErrorCache,
        dbActions: [DynamoDbAction.PutItem]
      }
    ],
    enableVpc: true
  },
  {
    lambdaName: LambdaName.AutoSubmitClaimWithoutLogin,
    lambdaDirName: LambdaName.AutoSubmitClaimWithoutLogin,
    timeout: 29,
    environmentVariables: {
      ...sharedLambdaEnvironmentVariables,
      WORKLOAD_ACCOUNT_ID: {
        id: 'WorkloadAccountId',
        description: '',
        defaultValue: ''
      }
    },
    secrets: [
      'insuranceclaims/guidewirehub/policycenter*',
      'insuranceclaims/autoefnolwithoutlogin/splitioauthorizationkey*',
      'insuranceclaims/nativemule/cci*'
    ],
    lambdaInvokePermissions: [{ action: 'PUT', path: 'claim' }],
    gatewayApiResourcePath: {
      action: 'PUT',
      endpoints: [{ pathParts: ['claim'] }]
    },
    dynamoDb: [
      {
        dbName: EFNOLCacheTableName.BehindLoginPolicyCache,
        dbActions: [DynamoDbAction.GetItem, DynamoDbAction.Query]
      },
      {
        dbName: EFNOLCacheTableName.ClaimNoAuthCache,
        dbActions: [DynamoDbAction.GetItem]
      },
      {
        dbName: EFNOLCacheTableName.ErrorCache,
        dbActions: [DynamoDbAction.PutItem]
      }
    ],
    enableVpc: true
  },
  {
    lambdaName: LambdaName.AutoGetSafeliteRedirectWithoutLogin,
    lambdaDirName: LambdaName.AutoGetSafeliteRedirectWithoutLogin,
    timeout: 25,
    environmentVariables: {
      SAFELITE_CLIENT_TAG: {
        id: 'SafeliteClientTag',
        description: '',
        defaultValue: ''
      },
      SAFELITE_REDIRECT: {
        id: 'SafeliteRedirect',
        description: '',
        defaultValue: ''
      },
      SAFELITE_CLIENT_TAG_WINSURANCE: {
        id: 'SafeliteClientTagWInsurance',
        description: 'Safelite ClientTag UUID for WInsurance glass claims',
        defaultValue: ''
      },
      SAFELITE_REDIRECT_WINSURANCE: {
        id: 'SafeliteRedirectWInsurance',
        description: 'Safelite redirect base URL for WInsurance glass claims',
        defaultValue: ''
      }
    },
    secrets: [
      'service/safelite/authentication*',
      'insuranceclaims/autoefnolwithoutlogin/splitioauthorizationkey*',
      'insuranceclaims/nativemule/cci*',
      'insuranceclaims/guidewirehub/policycenter*'
    ],
    lambdaInvokePermissions: [{ action: 'GET', path: 'safelite-redirect' }],
    gatewayApiResourcePath: {
      action: 'GET',
      endpoints: [{ pathParts: ['safelite-redirect'] }]
    },
    dynamoDb: [
      {
        dbName: EFNOLCacheTableName.BehindLoginPolicyCache,
        dbActions: [DynamoDbAction.GetItem, DynamoDbAction.Query]
      }
    ],
    enableVpc: true
  },
  {
    lambdaName: LambdaName.AutoGetPolicyConversionWithoutLogin,
    lambdaDirName: LambdaName.AutoGetPolicyConversionWithoutLogin,
    timeout: 25,
    environmentVariables: {
      ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK: {
        id: 'EnablePStarToGWPolicyConversionMock',
        description: 'Enable mock policy conversion data for testing',
        defaultValue: 'false'
      }
    },
    secrets: ['insuranceclaims/autoefnolwithoutlogin/splitioauthorizationkey*'],
    lambdaInvokePermissions: [{ action: 'POST', path: 'policy-conversion' }],
    gatewayApiResourcePath: {
      action: 'POST',
      endpoints: [{ pathParts: ['policy-conversion'] }]
    },
    enableVpc: true
  },
  {
    lambdaName: LambdaName.AutoCreateClaimOrchestrator,
    lambdaDirName: LambdaName.AutoCreateClaimOrchestrator,
    timeout: 29,
    environmentVariables: {
      ...sharedLambdaEnvironmentVariables
    },
    lambdaInvokePermissions: [{ action: 'POST', path: 'claim' }],
    gatewayApiResourcePath: {
      action: 'POST',
      endpoints: [{ pathParts: ['claim'] }]
    },
    dynamoDb: [
      {
        dbName: EFNOLCacheTableName.BehindLoginPolicyCache,
        dbActions: [DynamoDbAction.GetItem, DynamoDbAction.Query]
      },
      {
        dbName: EFNOLCacheTableName.ErrorCache,
        dbActions: [DynamoDbAction.PutItem]
      }
    ],
    secrets: [
      'insuranceclaims/autoefnolwithoutlogin/splitioauthorizationkey*',
      'insuranceclaims/guidewirehub/policycenter*',
      'insuranceclaims/nativemule/cci*'
    ],
    enableVpc: true
  },
  {
    lambdaName: LambdaName.EFNOLAutoFlowDirector,
    lambdaDirName: LambdaName.EFNOLAutoFlowDirector,
    timeout: 29,
    environmentVariables: {
      ENABLE_SPLASH: {
        id: 'EnableSplash',
        description: 'Enable splash page',
        defaultValue: 'false'
      },
      SPLASH_START: {
        id: 'SplashStart',
        description: 'Splash start time',
        defaultValue: ''
      },
      SPLASH_END: {
        id: 'SplashEnd',
        description: 'Splash end time',
        defaultValue: ''
      }
    },
    secrets: [
      'insuranceclaims/autoefnolwithoutlogin/splitioauthorizationkey*'
    ],
    lambdaInvokePermissions: [{ action: 'POST', path: 'flow-director' }],
    gatewayApiResourcePath: {
      action: 'POST',
      endpoints: [{ pathParts: ['flow-director'] }]
    },
    dynamoDb: [
      {
        dbName: EFNOLCacheTableName.BehindLoginPolicyCache,
        dbActions: [DynamoDbAction.GetItem, DynamoDbAction.PutItem, DynamoDbAction.Query]
      }
    ],
    bypassJwtAuth: true
  },
  {
    lambdaName: LambdaName.EFNOLAutoGetInitialData,
    lambdaDirName: LambdaName.EFNOLAutoGetInitialData,
    timeout: 29,
    environmentVariables: {
      ENABLE_SPLASH: {
        id: 'EnableSplash',
        description: 'Enable splash page',
        defaultValue: 'false'
      },
      SPLASH_START: {
        id: 'SplashStart',
        description: 'Splash start time',
        defaultValue: ''
      },
      SPLASH_END: {
        id: 'SplashEnd',
        description: 'Splash end time',
        defaultValue: ''
      },
      ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK: {
        id: 'EnablePStarToGWPolicyConversionMock',
        description: 'Enable mock policy conversion data for testing',
        defaultValue: 'false'
      }
    },
    secrets: [
      'adProxy/secrets/team/insuranceclaims*',
      'insuranceclaims/guidewirehub/policycenter*',
      'insuranceclaims/autoefnolwithoutlogin/splitioauthorizationkey*',
      'insuranceclaims/nativemule/cci*'
    ],
    lambdaInvokePermissions: [{ action: 'GET', path: 'initial-data', pathParam: 'id' }],
    gatewayApiResourcePath: {
      action: 'GET',
      endpoints: [{ pathParts: ['initial-data', '{id}'] }]
    },
    dynamoDb: [
      {
        dbName: EFNOLCacheTableName.BehindLoginPolicyCache,
        dbActions: [DynamoDbAction.GetItem, DynamoDbAction.Query]
      }
    ],
    enableVpc: true
  }
];

const getBuiltArtifactsBucketName = (projectName: string, region: Regions | string) => {
  return `${projectName}-pipeline-built-artifacts-v2-${region}`;
};

const stackProps = {
  stackName: `${WORKLOAD_NAME}-${CDK_STACK_NAME}`,
  workloadName: WORKLOAD_NAME,
  ssmVersionParameterName: '/service/pipeline/deploy/auto-efnol-no-auth-app/version',
  lambdaRootDir: path.resolve(__dirname, '../lambdas'),
  lambdaConfigs,
  tags: {
    [tag.TaggingKey.Region]: tag.RegionValue.USWest2,
    [tag.TaggingKey.Workload]: tag.WorkloadValue.Claims,
    [tag.TaggingKey.Team]: tag.TeamValue.InsuranceSelfService,
    [tag.TaggingKey.Department]: tag.DepartmentValue.Ebiz,
    [tag.TaggingKey.DataProfile]: tag.DataProfileValue.Confidential
  },
  synthesizer: new cdk.DefaultStackSynthesizer({
    fileAssetsBucketName: getBuiltArtifactsBucketName(WORKLOAD_NAME, Regions.USWest2),
    bucketPrefix: 'cdkapps/assets/',
    deployRoleArn: 'arn:aws:iam::${AWS::AccountId}:role/' + WORKLOAD_NAME + '-github-deploy-role',
    lookupRoleArn: 'arn:aws:iam::${AWS::AccountId}:role/' + WORKLOAD_NAME + '-github-deploy-role',
    cloudFormationExecutionRole:
      'arn:aws:iam::${AWS::AccountId}:role/' + WORKLOAD_NAME + '-github-deploy-role',
    fileAssetPublishingRoleArn:
      'arn:aws:iam::910727532400:role/' + WORKLOAD_NAME + '-github-file-publishing-role'
  }),
  gateway: {
    basePath: 'auto-efnol',
    restApiName: 'Auto EFNOL Public Api'
  },
  appId: 'auto-efnol'
};

new AutoEFNOLNoAuthApiStack(
  app,
  `${WORKLOAD_NAME}-${CDK_STACK_NAME}-${Regions.USWest2}`,
  stackProps
);

new AutoEFNOLNoAuthApiStack(app, `${WORKLOAD_NAME}-${CDK_STACK_NAME}-${Regions.USEast1}`, {
  ...stackProps,
  tags: {
    ...stackProps.tags,
    [tag.TaggingKey.Region]: tag.RegionValue.USEast1
  },
  synthesizer: new cdk.DefaultStackSynthesizer({
    fileAssetsBucketName: getBuiltArtifactsBucketName(WORKLOAD_NAME, Regions.USEast1),
    bucketPrefix: 'cdkapps/assets/',
    deployRoleArn: 'arn:aws:iam::${AWS::AccountId}:role/' + WORKLOAD_NAME + '-github-deploy-role',
    lookupRoleArn: 'arn:aws:iam::${AWS::AccountId}:role/' + WORKLOAD_NAME + '-github-deploy-role',
    cloudFormationExecutionRole:
      'arn:aws:iam::${AWS::AccountId}:role/' + WORKLOAD_NAME + '-github-deploy-role',
    fileAssetPublishingRoleArn:
      'arn:aws:iam::910727532400:role/' + WORKLOAD_NAME + '-github-file-publishing-role'
  })
});
