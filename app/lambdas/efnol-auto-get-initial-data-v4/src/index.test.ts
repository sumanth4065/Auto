// Mock MaskedLogger with getInstance returning a mock logger instance
// This needs to be defined before imports due to Jest hoisting
const mockLoggerInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  getClientContext: jest.fn().mockReturnValue({
    correlationId: 'some-correlation-id',
    sessionId: 'some-session-id'
  }),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

jest.mock('@ace-clublabs/aws-lambda-logger', () => ({
  MaskedLogger: {
    getInstance: jest.fn(() => mockLoggerInstance)
  }
}));

import {
  Cache,
  extractTestRegionFromProxyRequest,
  ITenant,
  LambdaHelper,
  PolicyType,
  PolicyTypeAndTenantHelper
} from '@ace-clublabs/iss-common-lambda-v3';
import { ServiceFactory } from '@ace-clublabs/iss-cci-clients';
import * as LibCommonUtils from '@lib/common-utils';
import { jwtDecode } from 'jwt-decode';
import { version } from 'process';
import * as Helpers from './helpers';
import app from './index';
import {
  ClaimsAuthorizationHelper,
  ClientApplication
} from '@ace-clublabs/iss-cci-clients';

jest.mock('@lib/common-utils');
jest.mock('@ace-clublabs/iss-common-lambda-v3');
jest.mock('@ace-clublabs/iss-cci-clients');
jest.mock('jwt-decode');
jest.mock('./helpers');
jest.mock('@ace-clublabs/feature-flags', () => {
  const mockGetTreatment = jest.fn().mockResolvedValue({ treatment: 'on' });
  const mockGetTreatmentWithConfig = jest.fn().mockResolvedValue({
    treatment: 'on',
    config: JSON.stringify({ AL: { auto: true }, CA: { auto: true } })
  });

  return {
    FeatureFlagService: jest.fn(function () {
      return {
        getTreatment: mockGetTreatment,
        getTreatmentWithConfig: mockGetTreatmentWithConfig
      };
    }),
    NodeFeatureFlagClient: jest.fn(),
    SecretsManagerKeyProvider: jest.fn(),
    Features: {
      AutoEFNOLPStarConversionCheck: 'AutoEFNOLPStarConversionCheck',
      EFNOLPStarConversionStates: 'EFNOLPStarConversionStates'
    },
    _mocks: {
      getTreatment: mockGetTreatment,
      getTreatmentWithConfig: mockGetTreatmentWithConfig
    }
  };
});

process.env = {
  ENABLE_SPLASH: 'true',
  SPLASH_START: 'March 10, 2023, 5 p.m.',
  SPLASH_END: 'March 13, 2023 at 3:30 a.m.'
};

const claimsAuthorizationHelperSpy = jest.spyOn(
  ClaimsAuthorizationHelper.prototype,
  'isPolicyAuthorizedAsync'
);
const getRequestHeadersSpy = jest.spyOn(LibCommonUtils, 'getRequestHeaders');
const lambdaHelperResponseSpy = jest.spyOn(LambdaHelper, 'response');
const getERSURLSpy = jest.spyOn(Helpers, 'getERSURL');

// Mock for extractTestRegionFromProxyRequest
const extractTestRegionFromProxyRequestMock =
  extractTestRegionFromProxyRequest as jest.MockedFunction<
    typeof extractTestRegionFromProxyRequest
  >;

// Mock for jwtDecode
const jwtDecodeMock = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

// Mock for ServiceFactory
let mockGetCustomerFullInfo: jest.Mock;
let mockCreateCustomerService: jest.Mock;

// Mock for ClientConfigHelper
const buildClientConfigSpy = jest.spyOn(
  LibCommonUtils.ClientConfigHelper,
  'buildClientConfig'
);

describe('efnol-auto-get-initial-data Lambda', () => {
  const getGuidewireSecretSpy = jest.spyOn(
    LibCommonUtils,
    'getGuidewireSecrets'
  );

  let lambdaResult;
  let eventQueryParams = {
    transactionId: 'some-transaction-id'
  };
  let pathQueryParams = {
    id: 'some-cache-id'
  };
  const expectedNotFoundBody = {
    error: {
      message: 'Claim cache item not found'
    }
  };

  const mockContext = {
    awsRequestId: 'some-request-id'
  };

  let getCacheSpy, loggerSpy;

  let partialInitialDataCache = {
    policy: 'some-policy',
    claim: 'some-cache-id'
  };

  let initialDataCache = {
    ...partialInitialDataCache,
    clubCode: 'some-club-code',
    sourceApp: 'some-source-app'
  };

  let partialCachedItem = {
    claimId: { S: '123456789' },
    ttl: { N: '1597863071' },
    data: { S: JSON.stringify(partialInitialDataCache) }
  };

  let cachedItem = {
    claimId: { S: '123456789' },
    ttl: { N: '1597863071' },
    data: { S: JSON.stringify(initialDataCache) }
  };

  const mockHeader = {
    'X-Request-Id': 'some-x-request-id',
    'Access-Control-Allow-Origin': '*',
    'X-Ace-Session-Id': 'some-x-ace-session-id'
  };

  const mockEvent = {
    headers: {
      Authorization: 'Bearer some-jwt-token'
    },
    queryStringParameters: eventQueryParams,
    pathParameters: pathQueryParams,
    requestContext: {
      authorizer: {
        clubCode: 'some-club-code',
        customerId: 'some-customer-id'
      }
    }
  };

  beforeEach(() => {
    getGuidewireSecretSpy.mockImplementation(() => {
      return Promise.resolve({
        clientId: 'some-guidewire-client-id',
        clientSecret: 'some-guidewire-client-secret'
      });
    });

    claimsAuthorizationHelperSpy.mockImplementation(() => {
      return Promise.resolve(false);
    });
    getRequestHeadersSpy.mockImplementation(() => {
      return { some: 'headers' };
    });

    getCacheSpy = jest.spyOn(Cache.prototype, 'findItem');
    getCacheSpy.mockImplementation(() => {
      return Promise.resolve({
        Count: 1,
        Items: [cachedItem]
      });
    });

    mockLoggerInstance.initialize.mockClear();
    mockLoggerInstance.initialize.mockResolvedValue(true);
    mockLoggerInstance.getClientContext.mockReturnValue({
      correlationId: 'some-correlation-id',
      sessionId: 'some-session-id'
    });
    loggerSpy = mockLoggerInstance.initialize;

    getERSURLSpy.mockImplementation(() => 'https://chat.ace.aaa.com');

    const featureFlagMocks = jest.requireMock(
      '@ace-clublabs/feature-flags'
    )._mocks;
    featureFlagMocks.getTreatment.mockResolvedValue({ treatment: 'on' });
    featureFlagMocks.getTreatmentWithConfig.mockResolvedValue({
      treatment: 'on',
      config: JSON.stringify({ AL: { auto: true }, CA: { auto: true } })
    });

    (Helpers.getConversionResult as jest.Mock).mockResolvedValue({
      isConversionApplicable: false,
      legacyPolicyNumber: 'some-policy',
      targetPolicyNumber: 'some-policy',
      targetEffectiveDate: undefined,
      policyState: undefined,
      conversionType: 'PSTAR_TO_GW'
    });

    (Helpers.noConversionResult as jest.Mock).mockReturnValue({
      isConversionApplicable: false,
      legacyPolicyNumber: 'some-policy',
      targetPolicyNumber: 'some-policy',
      targetEffectiveDate: undefined,
      policyState: undefined,
      conversionType: 'PSTAR_TO_GW'
    });

    const { PolicyTypeAndTenantHelper } = require('@ace-clublabs/iss-common-lambda-v3');
    (PolicyTypeAndTenantHelper.getTenantAndProductFromPolicyNumber as jest.Mock).mockReturnValue({
      tenant: 'GUIDEWIRE',
      product: 'AUTO'
    });

    extractTestRegionFromProxyRequestMock.mockReturnValue('A1' as any);
    jwtDecodeMock.mockReturnValue({ customerId: 'some-customer-id' });
    buildClientConfigSpy.mockReturnValue({
      authBearer: 'some-token',
      clubCode: 'some-club-code',
      testRegion: 'A1',
      clientApplication: 'test-app',
      gwScopes: 'test-scopes',
      gwSecretId: 'test-gw-secret',
      mulesoftSecretId: 'test-mulesoft-secret',
      teamId: 'test-team'
    } as any);

    mockGetCustomerFullInfo = jest.fn().mockResolvedValue({
      customer: {
        contact: {
          email: { address: 'test@example.com' },
          phones: [{ phoneNumber: '555-123-4567' }]
        }
      }
    });
    mockCreateCustomerService = jest.fn(() => ({
      getCustomerFullInfo: mockGetCustomerFullInfo
    }));
    (ServiceFactory as jest.Mock).mockImplementation(() => ({
      createCustomerService: mockCreateCustomerService
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should have the X-Request-Id from the request event.header', async () => {
    await app.handler(
      {
        headers: { 'X-Request-Id': 'some-x-request-id' },
        queryStringParameters: eventQueryParams,
        pathParameters: pathQueryParams
      },
      mockContext
    );

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        component: 'insurance-auto-efnol-api',
        enableStackTraces: true
      }),
      mockContext,
      { 'X-Request-Id': 'some-x-request-id' }
    );
  });

  it('should call the getGuidewireSecret method', async () => {
    await app.handler(mockEvent);
    expect(getGuidewireSecretSpy).toBeCalledWith(
      'insuranceclaims/guidewirehub/policycenter'
    );
  });

  describe('calling cache', () => {
    it('should retrieve cache from dynamodb', async () => {
      await app.handler(
        {
          headers: mockHeader,
          queryStringParameters: eventQueryParams,
          pathParameters: pathQueryParams
        },
        mockContext
      );

      expect(getCacheSpy).toBeCalledWith('some-cache-id');
    });
  });

  describe('when item in cache', () => {
    beforeEach(async () => {
      claimsAuthorizationHelperSpy.mockImplementation(() => {
        return Promise.resolve(true);
      });

      lambdaResult = await app.handler(
        {
          headers: { ...mockHeader, Authorization: 'Bearer some-jwt-token' },
          queryStringParameters: eventQueryParams,
          pathParameters: pathQueryParams
        },
        mockContext
      );
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return 200 along with the cached object including customer email and phone', () => {
      expect(lambdaResult).toEqual({
        headers: { 'Access-Control-Allow-Origin': '*' },
        statusCode: 200,
        body: JSON.stringify({
          sourceApp: 'some-source-app',
          policyData: {
            ...initialDataCache,
            email: 'test@example.com',
            phone: '555-123-4567',
            conversionResult: {
              isConversionApplicable: false,
              legacyPolicyNumber: 'some-policy',
              targetPolicyNumber: 'some-policy',
              targetEffectiveDate: undefined,
              policyState: undefined,
              conversionType: 'PSTAR_TO_GW'
            },
            EnableSplash: true,
            SplashStart: 'March 10, 2023, 5 p.m.',
            SplashEnd: 'March 13, 2023 at 3:30 a.m.',
            ERSURL: 'https://chat.ace.aaa.com'
          }
        })
      });
    });
  });

  describe('when item not in cache', () => {
    beforeEach(async () => {
      getCacheSpy.mockImplementation(() => {
        return Promise.resolve({ Count: 0, Items: [] });
      });

      lambdaResult = await app.handler(
        {
          headers: mockHeader,
          queryStringParameters: eventQueryParams,
          pathParameters: pathQueryParams
        },
        mockContext
      );
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 404', () => {
      expect(lambdaHelperResponseSpy).toHaveBeenCalledWith({
        statusCode: 404,
        requestId: 'some-request-id',
        body: expectedNotFoundBody
      });
    });
  });

  describe('when cache exception occurs', () => {
    beforeEach(async () => {
      getCacheSpy.mockImplementation(() => {
        throw Error('A random exception occurred');
      });

      lambdaResult = await app.handler(
        {
          headers: mockHeader,
          queryStringParameters: eventQueryParams
        },
        mockContext
      );
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return 500', () => {
      expect(lambdaHelperResponseSpy).toHaveBeenCalledWith({
        statusCode: 500,
        requestId: 'some-request-id',
        body: {
          error: {
            message: 'Error: A random exception occurred'
          }
        }
      });
    });
  });

  describe('Policy authorization scenarios', () => {
    beforeEach(() => {
      process.env = {
        ENABLE_SPLASH: 'true',
        SPLASH_START: 'March 10, 2023, 5 p.m.',
        SPLASH_END: 'March 13, 2023 at 3:30 a.m.',
        AWS_REGION: 'some-aws-region'
      };
      getCacheSpy.mockImplementation(() => {
        return Promise.resolve({
          Count: 1,
          Items: [cachedItem]
        });
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should authorize policy and return 200', async () => {
      claimsAuthorizationHelperSpy.mockImplementation(() => {
        return Promise.resolve(true);
      });

      const response = await app.handler(mockEvent, mockContext);

      expect(claimsAuthorizationHelperSpy).toHaveBeenCalledTimes(1);
      expect(claimsAuthorizationHelperSpy).toHaveBeenCalledWith(
        'some-policy',
        'some-customer-id',
        mockEvent,
        { some: 'headers' },
        mockLoggerInstance,
        ClientApplication.AUTO_CLAIMS
      );
      expect(response.statusCode).toEqual(200);
    });

    it('should return 403 when authorization fails', async () => {
      claimsAuthorizationHelperSpy.mockImplementation(() => {
        return Promise.resolve(false);
      });

      await app.handler(mockEvent, mockContext);

      expect(lambdaHelperResponseSpy).toHaveBeenCalledWith({
        statusCode: 403,
        requestId: 'some-request-id',
        body: {
          error: {
            message: 'Customer not authorized to access the Policy'
          }
        }
      });
    });
  });
});
