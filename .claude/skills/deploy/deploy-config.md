# Deployment Configuration

## Environment Variables

### Development
```bash
NODE_ENV=development
AWS_REGION=us-west-2
LOG_LEVEL=debug
```

### Test
```bash
NODE_ENV=test
AWS_REGION=us-west-2
LOG_LEVEL=info
```

### Production
```bash
NODE_ENV=production
AWS_REGION=us-west-2
LOG_LEVEL=error
```

## GitHub Actions Secrets

Required secrets in repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCOUNT_ID`
- `GITHUB_TOKEN`

## Deployment Matrix

| Component | Dev | Test | Prod | Approval Required |
|-----------|-----|------|------|------------------|
| Web | Auto | Auto | Manual | Yes |
| Lambdas | Auto | Auto | Manual | Yes |
| API Gateway | Auto | Auto | Manual | Yes |
| DynamoDB | Manual | Manual | Manual | Yes |
