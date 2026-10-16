# DynamoDB Table Deployment

This is used to deploy a DynamoDB table using AWS CDK TableV2 construct.

## TableV2 Benefits

The stack now uses the modern `TableV2` construct which provides several advantages:

- **No Lambda Dependencies**: Eliminates replica provider lambdas and nested CloudFormation stacks
- **Reduced Maintenance**: No need to manage Node runtime updates for table infrastructure
- **Cleaner Stack Structure**: Avoids nested stacks and simplifies CloudFormation templates
- **Future-Proof**: Avoids forced table/stack deletions due to lambda deprecation

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npm run test:watch` run tests in watch mode
- `npm run test:coverage` run tests with coverage report
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## Testing

The DynamoDB stack includes comprehensive unit tests covering:

- Basic table creation with partition and sort keys
- Time-to-Live (TTL) configuration
- Point-in-Time Recovery (PITR)
- Multi-region replicas
- Global Secondary Indices (GSI)
- Complete configuration scenarios

Run tests with:

```bash
npm test
```

For continuous testing during development:

```bash
npm run test:watch
```

To generate coverage reports:

```bash
npm run test:coverage
```

## Deployment

With TableV2, the deployment process is simplified as it no longer requires nested CloudFormation stacks or special bootstrap configurations.

# Linking KMS key to dynamoDB

When deploying the DynamoDB for the first time (in the account or recreating), deploy the kms keys and run the script: scripts/set-encryption-keys.sh to set the encryption keys
