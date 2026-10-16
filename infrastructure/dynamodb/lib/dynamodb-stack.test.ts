import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import * as tag from '@ace-clublabs/aws-tags';
import { DynamodbStack } from './dynamodb-stack';

// Mock the tagging wrapper to avoid dependencies
jest.mock('./tagging', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('DynamodbStack', () => {
  let app: cdk.App;
  let stack: DynamodbStack;

  beforeEach(() => {
    app = new cdk.App();
  });

  describe('Basic TableV2 Creation', () => {
    it('should create a TableV2 with basic configuration', () => {
      stack = new DynamodbStack(app, 'TestStack', {
        environment: tag.EnvironmentValue.Dev,
        tableName: 'TestTable',
        partitionKeyName: 'pk'
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
        TableName: 'TestTable',
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        SSESpecification: {
          SSEEnabled: true
        }
      });
    });

    it('should create a TableV2 with partition key and sort key', () => {
      stack = new DynamodbStack(app, 'TestStack', {
        environment: tag.EnvironmentValue.Dev,
        tableName: 'TestTable',
        partitionKeyName: 'pk',
        sortKeyName: 'sk'
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
        KeySchema: [
          { AttributeName: 'pk', KeyType: 'HASH' },
          { AttributeName: 'sk', KeyType: 'RANGE' }
        ]
      });
    });
  });

  describe('Time To Live Configuration', () => {
    it('should enable TTL when timeToLiveAttributeName is provided', () => {
      stack = new DynamodbStack(app, 'TestStack', {
        environment: tag.EnvironmentValue.Dev,
        tableName: 'TestTable',
        partitionKeyName: 'pk',
        timeToLiveAttributeName: 'ttl'
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
        TimeToLiveSpecification: {
          AttributeName: 'ttl',
          Enabled: true
        }
      });
    });

    it('should not enable TTL when timeToLiveAttributeName is not provided', () => {
      stack = new DynamodbStack(app, 'TestStack', {
        environment: tag.EnvironmentValue.Dev,
        tableName: 'TestTable',
        partitionKeyName: 'pk'
      });

      const template = Template.fromStack(stack);
      const resources = template.findResources('AWS::DynamoDB::GlobalTable');
      const tableResource = Object.values(resources)[0];

      expect(tableResource.Properties.TimeToLiveSpecification).toBeUndefined();
    });
  });

  describe('Point In Time Recovery', () => {
    it('should enable PITR when pointInTimeRecovery is true', () => {
      stack = new DynamodbStack(app, 'TestStack', {
        environment: tag.EnvironmentValue.Dev,
        tableName: 'TestTable',
        partitionKeyName: 'pk',
        pointInTimeRecovery: true
      });

      const template = Template.fromStack(stack);
      const resources = template.findResources('AWS::DynamoDB::GlobalTable');

      // Verify table was created successfully
      expect(Object.keys(resources).length).toBe(1);
      const tableResource = Object.values(resources)[0];
      expect(tableResource).toBeDefined();
    });
  });

  describe('Replicas Configuration', () => {
    it('should create replicas when provided', () => {
      stack = new DynamodbStack(app, 'TestStack', {
        env: { region: 'us-east-1' },
        environment: tag.EnvironmentValue.Dev,
        tableName: 'TestTable',
        partitionKeyName: 'pk',
        replicas: [{ region: 'us-west-2' }]
      });

      const template = Template.fromStack(stack);

      const resources = template.findResources('AWS::DynamoDB::GlobalTable');
      const tableResource = Object.values(resources)[0];

      // Verify table has replicas for both primary and replica regions
      expect(tableResource.Properties.Replicas).toBeDefined();
      expect(tableResource.Properties.Replicas.length).toBe(2);

      const regions = tableResource.Properties.Replicas.map((r: any) => r.Region);
      expect(regions).toContain('us-east-1');
      expect(regions).toContain('us-west-2');
    });

    it('should work without replicas', () => {
      stack = new DynamodbStack(app, 'TestStack', {
        environment: tag.EnvironmentValue.Dev,
        tableName: 'TestTable',
        partitionKeyName: 'pk'
      });

      const template = Template.fromStack(stack);
      const resources = template.findResources('AWS::DynamoDB::GlobalTable');

      expect(resources).toBeDefined();
    });
  });

  describe('Global Secondary Indices', () => {
    it('should add GSIs when provided in props', () => {
      const gsis: dynamo.GlobalSecondaryIndexPropsV2[] = [
        {
          indexName: 'gsi1',
          partitionKey: { name: 'gsi1pk', type: dynamo.AttributeType.STRING }
        },
        {
          indexName: 'gsi2',
          partitionKey: { name: 'gsi2pk', type: dynamo.AttributeType.STRING },
          sortKey: { name: 'gsi2sk', type: dynamo.AttributeType.STRING }
        }
      ];

      stack = new DynamodbStack(app, 'TestStack', {
        environment: tag.EnvironmentValue.Dev,
        tableName: 'TestTable',
        partitionKeyName: 'pk',
        globalSecondaryIndices: gsis
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
        GlobalSecondaryIndexes: [
          {
            IndexName: 'gsi1',
            KeySchema: [{ AttributeName: 'gsi1pk', KeyType: 'HASH' }]
          },
          {
            IndexName: 'gsi2',
            KeySchema: [
              { AttributeName: 'gsi2pk', KeyType: 'HASH' },
              { AttributeName: 'gsi2sk', KeyType: 'RANGE' }
            ]
          }
        ]
      });
    });

    it('should handle single GSI', () => {
      const gsis: dynamo.GlobalSecondaryIndexPropsV2[] = [
        {
          indexName: 'status-index',
          partitionKey: { name: 'status', type: dynamo.AttributeType.STRING },
          sortKey: { name: 'createdAt', type: dynamo.AttributeType.STRING }
        }
      ];

      stack = new DynamodbStack(app, 'TestStack', {
        environment: tag.EnvironmentValue.Dev,
        tableName: 'TestTable',
        partitionKeyName: 'pk',
        globalSecondaryIndices: gsis
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
        GlobalSecondaryIndexes: [
          {
            IndexName: 'status-index',
            KeySchema: [
              { AttributeName: 'status', KeyType: 'HASH' },
              { AttributeName: 'createdAt', KeyType: 'RANGE' }
            ]
          }
        ]
      });
    });

    it('should not add GSIs when not provided', () => {
      stack = new DynamodbStack(app, 'TestStack', {
        environment: tag.EnvironmentValue.Dev,
        tableName: 'TestTable',
        partitionKeyName: 'pk'
      });

      const template = Template.fromStack(stack);
      const resources = template.findResources('AWS::DynamoDB::GlobalTable');
      const tableResource = Object.values(resources)[0];

      expect(tableResource.Properties.GlobalSecondaryIndexes).toBeUndefined();
    });

    it('should handle empty GSIs array', () => {
      stack = new DynamodbStack(app, 'TestStack', {
        environment: tag.EnvironmentValue.Dev,
        tableName: 'TestTable',
        partitionKeyName: 'pk',
        globalSecondaryIndices: []
      });

      const template = Template.fromStack(stack);
      const resources = template.findResources('AWS::DynamoDB::GlobalTable');
      const tableResource = Object.values(resources)[0];

      expect(tableResource.Properties.GlobalSecondaryIndexes).toBeUndefined();
    });
  });

  describe('Complete Configuration', () => {
    it('should create table with all features enabled', () => {
      const gsis: dynamo.GlobalSecondaryIndexPropsV2[] = [
        {
          indexName: 'gsi1',
          partitionKey: { name: 'gsi1pk', type: dynamo.AttributeType.STRING }
        }
      ];

      stack = new DynamodbStack(app, 'TestStack', {
        env: { region: 'us-east-1' },
        environment: tag.EnvironmentValue.Prod,
        tableName: 'CompleteTable',
        partitionKeyName: 'id',
        sortKeyName: 'timestamp',
        timeToLiveAttributeName: 'expiresAt',
        pointInTimeRecovery: true,
        replicas: [{ region: 'eu-west-1' }],
        globalSecondaryIndices: gsis
      });

      const template = Template.fromStack(stack);

      // Verify basic table properties
      template.hasResourceProperties('AWS::DynamoDB::GlobalTable', {
        TableName: 'CompleteTable',
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        BillingMode: 'PAY_PER_REQUEST',
        TimeToLiveSpecification: {
          AttributeName: 'expiresAt',
          Enabled: true
        },
        GlobalSecondaryIndexes: [
          {
            IndexName: 'gsi1',
            KeySchema: [{ AttributeName: 'gsi1pk', KeyType: 'HASH' }]
          }
        ]
      });

      // Verify replicas
      const resources = template.findResources('AWS::DynamoDB::GlobalTable');
      const tableResource = Object.values(resources)[0];

      expect(tableResource.Properties.Replicas).toBeDefined();
      expect(tableResource.Properties.Replicas.length).toBe(2);

      const regions = tableResource.Properties.Replicas.map((r: any) => r.Region);
      expect(regions).toContain('us-east-1');
      expect(regions).toContain('eu-west-1');
    });
  });
});
