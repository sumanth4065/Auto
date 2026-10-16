import * as awsLambdaLogger from '@ace-clublabs/aws-lambda-logger';
import { EfnolApplication } from '@ace-clublabs/iss-common-auto-efnol-models';
import { ITenant, PolicyTypeAndTenantHelper } from '@ace-clublabs/iss-common-util';
import * as commonUtils from '@lib/common-utils';
import { LoginFlowType } from '@lib/shared-contracts';
import { baseEvent, baseHeaders, IPolicyInfoAutoResponse } from '@lib/types';
import * as Helpers from './helpers';
import app from './index';
import { transformedCCIPolicyInfoStub } from './mocks/transformedCCIPolicyInfoStub';

// mock modules

jest.mock('@lib/common-utils');
jest.mock('@lib/utility');
jest.mock('./helpers');

jest.mock('@ace-clublabs/aws-lambda-logger', () => {
  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    getClientContext: jest.fn(),
    initialize: jest.fn()
  };
  return {
    MaskedLogger: {
      getInstance: jest.fn(() => mockLogger)
    },
    __mockLogger: mockLogger
  };
});
// set up authorization spies
const getAuthorizationTokenSpy: jest.SpyInstance<
  ReturnType<typeof commonUtils.getAuthorizationToken>
> = jest.spyOn(commonUtils, 'getAuthorizationToken');

const notAuthorizedSpy: jest.SpyInstance<ReturnType<typeof commonUtils.notAuthorized>> = jest.spyOn(
  commonUtils,
  'notAuthorized'
);

const policyNotFoundSpy: jest.SpyInstance<ReturnType<typeof commonUtils.policyNotFound>> =
  jest.spyOn(commonUtils, 'policyNotFound');

// set up secret spies

const getGuidewireSecretsSpy: jest.SpyInstance<ReturnType<typeof commonUtils.getGuidewireSecrets>> =
  jest.spyOn(commonUtils, 'getGuidewireSecrets');

// set up lambda spies

const getRequestHeadersSpy: jest.SpyInstance<ReturnType<typeof commonUtils.getRequestHeaders>> =
  jest.spyOn(commonUtils, 'getRequestHeaders');

const lambdaSuccessSpy: jest.SpyInstance<ReturnType<typeof commonUtils.lambdaSuccess>> = jest.spyOn(
  commonUtils,
  'lambdaSuccess'
);

const lambdaErrorSpy: jest.SpyInstance<ReturnType<typeof commonUtils.lambdaError>> = jest.spyOn(
  commonUtils,
  'lambdaError'
);

const extractBehindLoginOrAnonymousPropsSpy: jest.SpyInstance<
  ReturnType<typeof commonUtils.extractBehindLoginOrAnonymousProps>
> = jest.spyOn(commonUtils, 'extractBehindLoginOrAnonymousProps');

const mockLoggerRef = (awsLambdaLogger as any).__mockLogger;
const loggerInitializeSpy = mockLoggerRef.initialize;
const loggerGetInstanceSpy = (awsLambdaLogger.MaskedLogger as any).getInstance;
const loggerInfoSpy = mockLoggerRef.info;
const loggerGetClientContextSpy = mockLoggerRef.getClientContext;
const getPolicyPrefixSpy: jest.SpyInstance<ReturnType<typeof commonUtils.getPolicyPrefix>> =
  jest.spyOn(commonUtils, 'getPolicyPrefix');
const getPolicyInfoSpy = jest.spyOn(Helpers, 'getPolicyInfo');

const mapToIPolicyInfoResponseSpy = jest.spyOn(
  Helpers.DataMappingHelper,
  'mapToIPolicyInfoResponse'
);

const getEnableIntegrationGatewaySpy = jest.spyOn(
  commonUtils.SplitIOHelper,
  'getEnableIntegrationGateway'
);

// set process.env and variables

process.env = {
  AD_PROXY_ACCOUNT_ID: 'some-ad-proxy-account-id',
  AWS_REGION: 'some-aws-region'
};

let mockEvent: typeof baseEvent;
const mockPolicyNumber = 'MOA189411101';
const mockPolicyGuid = 'TU9-BMT-g5N-DEx-MTA-x';
const mockLogInfo = {
  clubCode: '065',
  policyGuid: mockPolicyGuid,
  policyNumber: mockPolicyNumber,
  efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
};

const mappedPolicyInfoAutoResponse: IPolicyInfoAutoResponse = {
  overview: {
    policyNumber: 'MOA189411101',
    productType: 'Auto',
    effective: { start: '08/27/2023', end: '02/27/2024' },
    class: 'PPA',
    policyTenant: 'Huon',
    priorPolicyNumber: 'A78351418'
  }
} as any as IPolicyInfoAutoResponse;

// set mock implementations

const mockImplementations = () => {
  // deep clone the mockEvent object for our test
  mockEvent = JSON.parse(JSON.stringify(baseEvent));
  mockEvent.queryStringParameters = { policyGuid: mockPolicyGuid };
  getEnableIntegrationGatewaySpy.mockResolvedValue(false);

  // authorization spies
  getAuthorizationTokenSpy.mockImplementation(() => 'some-token');
  getPolicyPrefixSpy.mockReturnValue('MOA');
  notAuthorizedSpy.mockImplementation(() => commonUtils.noAuthorizedMockResponse);
  policyNotFoundSpy.mockImplementation(() => commonUtils.policyNotFoundMockResponse);

  extractBehindLoginOrAnonymousPropsSpy.mockResolvedValue({
    policyNumber: mockPolicyNumber,
    loginFlowType: LoginFlowType.ANONYMOUS,
    efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
  });

  // secrets spies

  getGuidewireSecretsSpy.mockImplementation(() => {
    return Promise.resolve({
      clientId: 'some-guidewire-client-id',
      clientSecret: 'some-guidewire-client-secret'
    });
  });

  //lambda spies

  getPolicyInfoSpy.mockImplementation(async () => mappedPolicyInfoAutoResponse);

  getRequestHeadersSpy.mockReturnValue(baseHeaders);

  lambdaSuccessSpy.mockImplementation(() => commonUtils.mockLambdaSuccess);

  lambdaErrorSpy.mockImplementation(() => commonUtils.mockLambdaError);

  loggerInitializeSpy.mockImplementation(() => {
    return Promise.resolve(true);
  });

  loggerInfoSpy.mockImplementation(() => {
    return true;
  });

  loggerGetClientContextSpy.mockImplementation(() => ({
    correlationId: 'someCorrelationId',
    sessionId: 'someSessionId'
  }));

  mapToIPolicyInfoResponseSpy.mockImplementation(() => transformedCCIPolicyInfoStub);
};

const clearAllMocks = () => {
  getAuthorizationTokenSpy.mockClear();
  getGuidewireSecretsSpy.mockClear();
  getRequestHeadersSpy.mockClear();
  lambdaErrorSpy.mockClear();
  lambdaSuccessSpy.mockClear();
  loggerGetClientContextSpy.mockClear();
  loggerInfoSpy.mockClear();
  loggerInitializeSpy.mockClear();
  notAuthorizedSpy.mockClear();
  policyNotFoundSpy.mockClear();
};

const mockContext = {
  awsRequestId: 'some-request-id',
  invokedFunctionArn: 'arn:aws:lambda:us-west-2:018363016784:function:test-function:1'
};

describe('auto-get-policy-info-v2 Lambda', function () {
  describe('Happy paths', () => {
    beforeEach(() => {
      mockImplementations();
    });

    afterEach(() => {
      jest.clearAllMocks();
      clearAllMocks();
    });

    it('it should execute properly and returns 200', async () => {
      const result = await app.handler(mockEvent, mockContext);

      expect(loggerInitializeSpy).toHaveBeenCalled();
      expect(loggerInfoSpy).toHaveBeenCalledTimes(3);
      expect(loggerInitializeSpy).toHaveBeenCalledWith(
        {
          component: 'insurance-auto-efnol-no-auth-api',
          enableStackTraces: true,
          runtimeVersion: expect.anything(),
          team: 'insurance-self-service',
          workload: 'insurance-claims'
        },
        mockContext,
        mockEvent.headers
      );
      expect(getAuthorizationTokenSpy).toHaveBeenCalledWith(mockEvent);
      expect(getGuidewireSecretsSpy).toHaveBeenCalledWith(
        'insuranceclaims/guidewirehub/policycenter'
      );

      expect(getRequestHeadersSpy).toHaveBeenCalledWith(
        mockEvent.headers,
        {
          clientId: 'some-guidewire-client-id',
          clientSecret: 'some-guidewire-client-secret'
        },
        'someCorrelationId',
        'someSessionId',
        'Clublabs-AutoEFNOL',
        '065'
      );
      expect(getPolicyInfoSpy).toHaveBeenCalledWith(
        mockContext,
        'MOA189411101',
        'some-token',
        expect.anything(),
        baseHeaders
      );
      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        {
          ...mockLogInfo,
          loginFlowType: LoginFlowType.ANONYMOUS,
          policyPrefix: 'MOA',
          policyTenant: 'HUON'
        },
        transformedCCIPolicyInfoStub,
        'Get_Policy_Info'
      );
      expect(mapToIPolicyInfoResponseSpy).toHaveBeenCalled();
      expect(result).toEqual(commonUtils.mockLambdaSuccess);
    });

    it('should fallback to cache clubCode when derived clubCode is unavailable', async () => {
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValue({
        policyNumber: 'A15368066',
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous,
        clubCode: '001'
      });
      const tenantAndProductSpy = jest
        .spyOn(PolicyTypeAndTenantHelper, 'getTenantAndProductFromPolicyNumber')
        .mockReturnValue({
          clubCode: undefined,
          tenant: ITenant.POLICYSTAR
        } as any);

      await app.handler(mockEvent, mockContext);

      expect(getRequestHeadersSpy).toHaveBeenCalledWith(
        mockEvent.headers,
        {
          clientId: 'some-guidewire-client-id',
          clientSecret: 'some-guidewire-client-secret'
        },
        'someCorrelationId',
        'someSessionId',
        'Clublabs-AutoEFNOL',
        '001'
      );
      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        expect.objectContaining({ clubCode: '001' }),
        expect.anything(),
        'Get_Policy_Info'
      );
      tenantAndProductSpy.mockRestore();
    });

    it(`it should execute properly and returns 200 with message 'Policy Not Found' when getPolicyInfo remote call returns no info response`, async () => {
      // Override pathParameters with a non-matching policy number to trigger "Policy Not Found"
      mockEvent.queryStringParameters = { policyGuid: 'some-policy-guid' };
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValue({
        policyNumber: 'some-policy-number',
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
      });

      const result = await app.handler(mockEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        {
          clubCode: undefined,
          policyGuid: 'some-policy-guid',
          policyNumber: 'some-policy-number',
          loginFlowType: LoginFlowType.ANONYMOUS,
          efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous,
          policyPrefix: 'MOA',
          policyTenant: 'UNKNOWN'
        },
        {
          APIResult: 'Policy Not Found',
          data: {
            driverSummaries: {},
            policyGeneralInfo: {}
          },
          message: 'Policy Not Found',
          statusCode: 200
        },
        'Get_Policy_Info'
      );
      expect(result).toEqual(commonUtils.mockLambdaSuccess);
    });

    it('should skip backend and return Policy Not Found when IG v2 flag is enabled', async () => {
      // mock the feature flag as ON
      getEnableIntegrationGatewaySpy.mockResolvedValue(true);

      // clear backend spy to ensure it is not called
      getPolicyInfoSpy.mockClear();

      const result = await app.handler(mockEvent, mockContext);

      // backend call must NOT happen when IG v2 is enabled
      expect(getPolicyInfoSpy).not.toHaveBeenCalled();

      // lambda must return the same fallback response used in the handler
      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        {
          clubCode: '065',
          policyGuid: mockPolicyGuid,
          policyNumber: mockPolicyNumber,
          loginFlowType: LoginFlowType.ANONYMOUS,
          efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous,
          policyPrefix: 'MOA',
          policyTenant: 'HUON'
        },
        {
          APIResult: 'Policy Not Found',
          statusCode: 200,
          message: 'Policy Not Found',
          data: {
            policyGeneralInfo: {},
            driverSummaries: {}
          }
        },
        'Get_Policy_Info'
      );

      // final response must match the mocked lambda success wrapper
      expect(result).toEqual(commonUtils.mockLambdaSuccess);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      mockImplementations();
    });

    afterEach(() => {
      jest.clearAllMocks();
      clearAllMocks();
    });

    it('should return 404 if policyNumber is missing', async () => {
      // Set queryStringParameters.policyGuid to empty/undefined to trigger "Policy Not Found"
      mockEvent.queryStringParameters = { policyGuid: '' };
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: null as any,
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
      });

      const result = await app.handler(mockEvent, mockContext);

      expect(result).toEqual({
        body: '{"error":{"message":"Not found"}}',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'X-Ace-RequestId': 'some-request-id',
          'X-Ace-Session-Id': 'some-session-id'
        },
        statusCode: 404
      });
    });

    it('returns not authorized when token is missing', async () => {
      delete mockEvent.headers.Authorization;
      getAuthorizationTokenSpy.mockImplementation(() => '');

      const result = await app.handler(mockEvent, mockContext);

      expect(result).toEqual({
        body: '{"error":{"message":"Not authorized"}}',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'X-Ace-RequestId': 'some-request-id',
          'X-Ace-Session-Id': 'some-session-id'
        },
        statusCode: 404
      });
      expect(getAuthorizationTokenSpy).toBeCalledWith(mockEvent);
    });

    it('returns error when getPolicyInfo is not reachable', async () => {
      getPolicyInfoSpy.mockImplementation(() => {
        return Promise.reject('some-error');
      });

      const result = await app.handler(mockEvent, mockContext);

      expect(result).toEqual({
        body: '{"error":{"message":{"message":"Error: some-error"}}}',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'X-Ace-RequestId': 'some-request-id',
          'X-Ace-Session-Id': 'some-session-id'
        },
        statusCode: 500
      });
    });

    it('returns error when getGuidewireSecrets is not reachable', async () => {
      getGuidewireSecretsSpy.mockImplementation(() => {
        return Promise.reject('some-error');
      });

      const result = await app.handler(mockEvent, mockContext);

      expect(result).toEqual({
        body: '{"error":{"message":{"message":"Error: some-error"}}}',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'X-Ace-RequestId': 'some-request-id',
          'X-Ace-Session-Id': 'some-session-id'
        },
        statusCode: 500
      });
    });
  });

  describe('Anonymous vs Behind-Login flows', () => {
    beforeEach(() => {
      mockImplementations();
    });

    afterEach(() => {
      jest.clearAllMocks();
      clearAllMocks();
    });

    it('returns policyNotFound when policyNumber cannot be resolved', async () => {
      mockEvent.queryStringParameters = { policyGuid: '' };
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: null as any,
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
      });

      await app.handler(mockEvent, mockContext);

      expect(extractBehindLoginOrAnonymousPropsSpy).toHaveBeenCalledWith(null, 'some-token');
      expect(policyNotFoundSpy).toHaveBeenCalled();
    });

    it('handles behind-login flow with GUID policyGuid', async () => {
      const behindLoginPolicyGuid = 'abc-123-def-456-ghi-7';
      mockEvent.queryStringParameters = { policyGuid: behindLoginPolicyGuid };

      await app.handler(mockEvent, mockContext);

      expect(extractBehindLoginOrAnonymousPropsSpy).toHaveBeenCalledWith(
        behindLoginPolicyGuid,
        'some-token'
      );
      expect(lambdaSuccessSpy).toHaveBeenCalled();
    });
  });
});
