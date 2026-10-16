import * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import * as tag from '@ace-clublabs/aws-tags';
import tagWrapper from './tagging';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
export interface DynamodbStackProps extends cdk.StackProps {
  regions?: string[];
  replicas?: dynamo.ReplicaTableProps[];
  environment: tag.EnvironmentValue;
  tableName: string;
  partitionKeyName: string;
  sortKeyName?: string;
  timeToLiveAttributeName?: string;
  pointInTimeRecovery?: boolean;
  globalSecondaryIndices?: dynamo.GlobalSecondaryIndexPropsV2[];
}

export class DynamodbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DynamodbStackProps) {
    super(scope, id, props);

    const currentRegion = cdk.Stack.of(this).region as tag.RegionValue;

    const sortKey = !props.sortKeyName
      ? {}
      : {
          sortKey: {
            name: props.sortKeyName,
            type: dynamo.AttributeType.STRING
          }
        };

    const timeToLiveAttribute = !props.timeToLiveAttributeName
      ? {}
      : {
          timeToLiveAttribute: props.timeToLiveAttributeName
        };

    // Support both legacy 'regions' and new 'replicas' format
    const replicas = props.replicas ?? props.regions?.map(region => ({ region }));

    const ddb = new dynamo.TableV2(this, `DynamoDb-${props.tableName}`, {
      tableName: props.tableName,
      partitionKey: {
        name: props.partitionKeyName,
        type: dynamo.AttributeType.STRING
      },
      billing: dynamo.Billing.onDemand(),
      replicas: replicas,
      pointInTimeRecovery: props.pointInTimeRecovery,
      ...sortKey,
      ...timeToLiveAttribute,
      encryption: dynamo.TableEncryptionV2.awsManagedKey()
    });

    if (props.globalSecondaryIndices) {
      props.globalSecondaryIndices.forEach(gsi => {
        ddb.addGlobalSecondaryIndex(gsi);
      });
    }

    tagWrapper(ddb, currentRegion, props.environment);
  }
}
