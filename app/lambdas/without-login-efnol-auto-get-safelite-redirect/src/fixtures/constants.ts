export const RSAKey = `some-rsa-key`;

export const SAFELITE_CLIENT_TAG = 'some-safelite-client-tag';

export const SAFELITE_REDIRECT = 'some-safelite-redirect';

export const SAFELITE_CLIENT_TAG_WINSURANCE = 'some-winsurance-client-tag';

export const SAFELITE_REDIRECT_WINSURANCE = 'some-winsurance-redirect';

export const mockEvent = {
  headers: {
    'X-Request-Id': 'some-x-request-id',
    'X-Ace-Session-Id': 'some-x-ace-session-id',
    Authorization: 'Bearer super-secret-jwt-token'
  },
  requestContext: {
    authorizer: {
      sub: 'someSub',
      aud: 'someAud',
      iss: 'someIss',
      scope: JSON.stringify(['someStuff: some-policy']),
      customerId: 'someCustomerId',
      clubCode: 'some-club-code'
    },
    resourcePath: 'someResourcePath',
    httpMethod: 'someHttpMethod',
    path: 'somePath'
  },
  pathParameters: {},
  queryStringParameters: {
    policyNumber: 'some-policy-number'
  }
};

export const mockContext = {
  awsRequestId: 'some-request-id',
  invokedFunctionArn:
    'arn:aws:lambda:us-west-2:018363016784:function:test-function:1'
};

export const cachedItem = {
  claimId: {
    S: '123456789'
  },
  ttl: {
    N: '1597863071'
  },
  data: {
    S: JSON.stringify({
      policy: 'some-policy'
    })
  }
};
