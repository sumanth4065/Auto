#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as tag from '@ace-clublabs/aws-tags';

import { DynamodbStack } from '../lib/dynamodb-stack';

export const init = (app: cdk.App) => {
  const databaseCreationStackProps: cdk.StackProps = {
    stackName: 'insurance-efnol-app-claim-no-auth-cache-table'
  };

  const TABLE_NAME = 'ClaimNoAuthCache';
  const partitionKeyName = 'claimId';
  const timeToLiveAttributeName = 'ttl';

  /*
   * Dev
   */
  // tslint:disable-next-line: no-unused-expression
  new DynamodbStack(app, 'dev-insurance-efnol-app-claim-no-auth-cache-table-global', {
    ...databaseCreationStackProps,
    tableName: TABLE_NAME,
    regions: ['us-east-1'], // In addition to us-west-2
    environment: tag.EnvironmentValue.Dev,
    partitionKeyName,
    timeToLiveAttributeName
  });

  /*
   * Qa
   */
  // tslint:disable-next-line: no-unused-expression
  new DynamodbStack(app, 'qa-insurance-efnol-app-claim-no-auth-cache-table-global', {
    ...databaseCreationStackProps,
    tableName: TABLE_NAME,
    regions: ['us-east-1'], // In addition to us-west-2
    environment: tag.EnvironmentValue.Qa,
    partitionKeyName,
    timeToLiveAttributeName
  });

  /**
   * UAT
   */
  // tslint:disable-next-line: no-unused-expression
  new DynamodbStack(app, 'uat-insurance-efnol-app-claim-no-auth-cache-table-global', {
    ...databaseCreationStackProps,
    tableName: TABLE_NAME,
    regions: ['us-east-1'], // In addition to us-west-2
    environment: tag.EnvironmentValue.Uat,
    partitionKeyName,
    timeToLiveAttributeName
  });

  /**
   * Prod
   */
  // tslint:disable-next-line: no-unused-expression
  new DynamodbStack(app, 'prod-insurance-efnol-app-claim-no-auth-cache-table-global', {
    ...databaseCreationStackProps,
    tableName: TABLE_NAME,
    regions: ['us-east-1'], // In addition to us-west-2
    environment: tag.EnvironmentValue.Prod,
    partitionKeyName,
    timeToLiveAttributeName
  });
};
