import { IEvent } from '@ace-clublabs/aws-lambda-v3';

export const mockEvent = {
  resource: 'someResource',
  path: 'somePath',
  httpMethod: 'somehttpMethod',
  requestContext: {
    authorizer: {
      sub: 'someSub',
      aud: 'someAud',
      iss: 'someIss',
      scope: JSON.stringify(['someStuff: somePolicyNumberA', 'someStuff: somePolicyNumberB']),
      customerId: 'somecustomerid',
      clubCode: '004'
    },
    resourcePath: 'someResourcePath',
    httpMethod: 'someHttpMethod',
    path: 'somePath'
  },
  headers: {
    Accept: '*/*',
    Authorization: 'some-token',
    Host: 'api.uat.clublabs.net',
    'X-Request-Id': 'someRequestId',
    'X-Ace-Correlation-Id': 'someCorrelationId',
    'X-Ace-Session-Id': 'someSessionId',
    'X-Bypass-Context': 'true'
  },
  pathParameters: {
    policyNumber: 'somePolicyNumberA'
  },
  body: {}
} as IEvent;
