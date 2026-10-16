import StatusCode from 'status-code-enum';
import * as AwsLambdaV3 from '@ace-clublabs/aws-lambda-v3';
import * as IssCommonLambda from '@ace-clublabs/iss-common-lambda-v3';
import { dtoDeepClone } from '@ace-clublabs/iss-common-util';
import {
  EfnolApplication,
  LossCause,
  LoginFlowType
} from '@ace-clublabs/iss-common-auto-efnol-models';
import * as commonUtils from '@lib/common-utils';
import * as LibUtility from '@lib/utility';
import {
  autoClaimCachedFixtureWithLossDateAndLossTimeObjects,
  baseEvent,
  baseHeaders,
  ISubmitAutoClaimBackendResponse,
  SendEmailAPIResult,
  submitAutoClaimBackendRequestFixtureWithLossDateAndLossTimeObjects,
  submitAutoClaimBackendResponseFixture,
  submitAutoClaimBackendResponseFixtureWithNoAdjuster,
  submitAutoClaimCarDrivenWithOneOtherParty,
  submitAutoClaimFrontendResponseFixture,
  SubmitAutoClaimFrontendResult,
  SubmitAutoClaimValidationResult
} from '@lib/types';
import * as Sac from './api/SubmitClaimApi.remote';
import * as Helpers from './helpers';
import app from './index';
import { ClaimsAuthorizationHelper, ClientApplication } from '@ace-clublabs/iss-cci-clients';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';

// mock modules

jest.mock('@ace-clublabs/iss-common-lambda-v3');
jest.mock('@lib/common-utils', () => ({
  ...jest.requireActual<typeof import('@lib/common-utils')>('@lib/common-utils'),
  ...jest.genMockFromModule<typeof import('@lib/common-utils')>('@lib/common-utils'),
  BackendCallError: jest.requireActual('@lib/common-utils').BackendCallError
}));
jest.mock('@lib/utility');
jest.mock('./helpers');

// set up authorization spies

const extractBehindLoginOrAnonymousPropsSpy: jest.SpyInstance<
  ReturnType<typeof commonUtils.extractBehindLoginOrAnonymousProps>
> = jest.spyOn(commonUtils, 'extractBehindLoginOrAnonymousProps');

const getAuthorizationTokenSpy: jest.SpyInstance<
  ReturnType<typeof commonUtils.getAuthorizationToken>
> = jest.spyOn(commonUtils, 'getAuthorizationToken');

const getEnableIntegrationGatewaySpy = jest.fn().mockResolvedValue(true);

const inferClubcodeSpy: jest.SpyInstance<ReturnType<typeof LibUtility.inferClubCode>> = jest.spyOn(
  LibUtility,
  'inferClubCode'
);

const notAuthorizedSpy: jest.SpyInstance<ReturnType<typeof commonUtils.notAuthorized>> = jest.spyOn(
  commonUtils,
  'notAuthorized'
);

const authorizer = {
  customerId: 'test-customer-id',
  sub: '',
  aud: '',
  iss: '',
  scope: ''
};

const policyNotFoundSpy: jest.SpyInstance<ReturnType<typeof commonUtils.policyNotFound>> =
  jest.spyOn(commonUtils, 'policyNotFound');

const policyUnauthorizedSpy: jest.SpyInstance<ReturnType<typeof commonUtils.policyUnauthorized>> =
  jest.spyOn(commonUtils, 'policyUnauthorized');

// secrets spies

const adTokenHelperSpy: jest.SpyInstance<ReturnType<typeof AwsLambdaV3.AdTokenHelper.getAdToken>> =
  jest.spyOn(AwsLambdaV3.AdTokenHelper, 'getAdToken');

export const getMulesoftSecretSpy: jest.SpyInstance<
  ReturnType<typeof IssCommonLambda.MulesoftSecretsHelper.getMulesoftSecret>
> = jest.spyOn(IssCommonLambda.MulesoftSecretsHelper, 'getMulesoftSecret');

export const getGuidewireSecretsSpy: jest.SpyInstance<
  ReturnType<typeof commonUtils.getGuidewireSecrets>
> = jest.spyOn(commonUtils, 'getGuidewireSecrets');

// logger spies - Updated to use MaskedLogger
export const loggerInitializeSpy: jest.SpyInstance<
  ReturnType<typeof MaskedLogger.prototype.initialize>
> = jest.spyOn(MaskedLogger.prototype, 'initialize');

export const loggerGetInstanceSpy: jest.SpyInstance<ReturnType<typeof MaskedLogger.getInstance>> =
  jest.spyOn(MaskedLogger, 'getInstance');

export const loggerInfoSpy: jest.SpyInstance<ReturnType<typeof MaskedLogger.prototype.info>> =
  jest.spyOn(MaskedLogger.prototype, 'info');

export const loggerGetClientContextSpy: jest.SpyInstance<
  ReturnType<typeof MaskedLogger.prototype.getClientContext>
> = jest.spyOn(MaskedLogger.prototype, 'getClientContext');

// lambda spies

const claimCacheGetItemSpy: jest.SpyInstance<
  ReturnType<typeof IssCommonLambda.Cache.prototype.getItem>
> = jest.spyOn(IssCommonLambda.Cache.prototype, 'getItem');

const createBackendRequestSpy: jest.SpyInstance<ReturnType<typeof Helpers.createBackendRequest>> =
  jest.spyOn(Helpers, 'createBackendRequest');

const errorCacheSetItemSpy: jest.SpyInstance<
  ReturnType<typeof IssCommonLambda.CacheError.prototype.setItem>
> = jest.spyOn(IssCommonLambda.CacheError.prototype, 'setItem');

const frontendRequestValidationSpy: jest.SpyInstance<
  ReturnType<typeof Helpers.frontendRequestValidation>
> = jest.spyOn(Helpers, 'frontendRequestValidation');

export const getRequestHeadersSpy: jest.SpyInstance<
  ReturnType<typeof commonUtils.getRequestHeaders>
> = jest.spyOn(commonUtils, 'getRequestHeaders');

const isMockEnvironmentSpy: jest.SpyInstance<
  ReturnType<typeof IssCommonLambda.LambdaHelper.isMockEnvironment>
> = jest.spyOn(IssCommonLambda.LambdaHelper, 'isMockEnvironment');

export const lambdaErrorSpy: jest.SpyInstance<ReturnType<typeof commonUtils.lambdaError>> =
  jest.spyOn(commonUtils, 'lambdaError');

export const extractErrorDetailsSpy: jest.SpyInstance<
  ReturnType<typeof commonUtils.extractErrorDetails>
> = jest.spyOn(commonUtils, 'extractErrorDetails');

export const lambdaSuccessSpy: jest.SpyInstance<ReturnType<typeof commonUtils.lambdaSuccess>> =
  jest.spyOn(commonUtils, 'lambdaSuccess');

const mockDataSpy: jest.SpyInstance<ReturnType<typeof commonUtils.mockData>> = jest.spyOn(
  commonUtils,
  'mockData'
);

const sendConfirmationEmailSpy = jest.fn();
const SubmitClaimApiSpy = jest.fn();

const SubmitClaimV2ApiSpy: jest.SpyInstance<ReturnType<typeof Sac.submitAutoClaimV2>> = jest.spyOn(
  Sac,
  'submitAutoClaimV2'
);

const dataHelperSpy: jest.SpyInstance<ReturnType<typeof commonUtils.sanitizeAllData>> = jest.spyOn(
  commonUtils,
  'sanitizeAllData'
);

const getPolicyPrefixSpy: jest.SpyInstance<ReturnType<typeof commonUtils.getPolicyPrefix>> =
  jest.spyOn(commonUtils, 'getPolicyPrefix');

// logger spies - Create a mock logger instance with spied methods
const mockLoggerInstance = {
  initialize: loggerInitializeSpy,
  info: loggerInfoSpy,
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  getClientContext: loggerGetClientContextSpy
};

// set up variables and mock data

const initEnv = process.env;

const mockContext: Partial<AwsLambdaV3.IContext> = {
  awsRequestId: 'some-request-id',
  invokedFunctionArn: 'arn:aws:lambda:us-west-2:018363016784:function:test-function:1'
} as AwsLambdaV3.IContext;

let mockEvent: typeof baseEvent;

const defaultPolicyNumber = 'CAA045290824';

const defaultRequestBody = {
  ...submitAutoClaimCarDrivenWithOneOtherParty,
  policyNumber: defaultPolicyNumber
};

const mockLogInfo = {
  claimNumber: '005048510',
  lossCause: 'othercoll',
  policyNumber: defaultPolicyNumber,
  loginFlowType: LoginFlowType.ANONYMOUS,
  efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous,
  clubCode: '004',
  isMobileAppAccidentDetection: 'true',
  policyPrefix: 'CAA',
  policyTenant: 'HUON'
};

let submitAutoClaimBackendResponse: ISubmitAutoClaimBackendResponse;

let headerResult: 'passed' | 'failed';

const testLoggerSpyCheckXRequestId =
  (evalHeader: 'X-Request-Id' | 'X-Ace-Session-Id') =>
  (_loggerOptions: any, _context: any, eventHeaders: { [key: string]: string }) => {
    const foundHeader = eventHeaders[evalHeader];
    if (eventHeaders && !!foundHeader) {
      headerResult = 'passed';
    } else {
      headerResult = 'failed';
    }
    return Promise.resolve(true);
  };

// set up mock implementations

const mockImplementations = () => {
  process.env = {
    ...initEnv,
    USE_BACKEND_LOSS_DATE_AND_LOSS_TIME_OBJECTS: 'false',
    ALLOW_MOCK: 'false',
    AD_PROXY_ACCOUNT_ID: 'some-ad-proxy-account-id',
    AWS_REGION: 'some-aws-region'
  };

  mockEvent = dtoDeepClone(baseEvent);
  mockEvent.body = JSON.stringify(defaultRequestBody);

  // authorization spies
  inferClubcodeSpy.mockImplementation(() => '004' as any);
  getPolicyPrefixSpy.mockReturnValue('CAA');
  getAuthorizationTokenSpy.mockImplementation(() => 'some-token');
  extractBehindLoginOrAnonymousPropsSpy.mockImplementation(() =>
    Promise.resolve({
      policyNumber: defaultPolicyNumber,
      loginFlowType: LoginFlowType.ANONYMOUS,
      efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
    })
  );
  policyNotFoundSpy.mockImplementation(() => commonUtils.policyNotFoundMockResponse);
  notAuthorizedSpy.mockImplementation(() => commonUtils.noAuthorizedMockResponse);
  policyUnauthorizedSpy.mockImplementation(() => ({
    statusCode: 403,
    headers: {
      'X-Ace-RequestId': 'some-request-id',
      'Access-Control-Allow-Origin': '*',
      'X-Ace-Session-Id': 'some-session-id'
    },
    body: JSON.stringify({ message: 'Policy Unauthorized' })
  }));

  // secret spies

  adTokenHelperSpy.mockImplementation(() => Promise.resolve({ adToken: 'someToken' }));
  getMulesoftSecretSpy.mockImplementation(() => {
    return Promise.resolve({
      clientId: 'some-mulesoft-client-id',
      clientSecret: 'some-mulesoft-client-secret'
    });
  });
  getGuidewireSecretsSpy.mockImplementation(() => {
    return Promise.resolve({
      clientId: 'some-guidewire-client-id',
      clientSecret: 'some-guidewire-client-secret'
    });
  });

  loggerInitializeSpy.mockResolvedValue(true);
  loggerInfoSpy.mockImplementation(() => {});
  loggerGetClientContextSpy.mockReturnValue({
    correlationId: 'someCorrelationId',
    sessionId: 'someSessionId'
  });

  // Make getInstance return the mock instance with spied methods
  loggerGetInstanceSpy.mockReturnValue(mockLoggerInstance as any);

  // lambda spies

  getRequestHeadersSpy.mockReturnValue(baseHeaders);
  lambdaSuccessSpy.mockImplementation(() => commonUtils.mockLambdaSuccess);
  lambdaErrorSpy.mockImplementation(() => commonUtils.mockLambdaError);
  extractErrorDetailsSpy.mockReturnValue({
    errorSource: 'backend',
    backendName: 'Mulesoft',
    message: 'Backend call failed',
    name: 'BackendCallError'
  } as any);

  submitAutoClaimBackendResponse = dtoDeepClone(submitAutoClaimBackendResponseFixture);
  isMockEnvironmentSpy.mockImplementation(() => false);
  claimCacheGetItemSpy.mockImplementation(() => {
    return Promise.resolve({
      $metadata: {} as any,
      Item: {
        claimId: {
          S: '12345'
        },
        ttl: {
          N: '1597863071'
        },
        data: {
          S: JSON.stringify(autoClaimCachedFixtureWithLossDateAndLossTimeObjects)
        }
      }
    });
  });
  frontendRequestValidationSpy.mockImplementation(() => {
    return {
      isValid: true,
      resultType: SubmitAutoClaimValidationResult.PassedAllValidations
    };
  });
  SubmitClaimApiSpy.mockImplementation(() => {
    return Promise.resolve(submitAutoClaimBackendResponse);
  });
  sendConfirmationEmailSpy.mockImplementation(() => {
    return Promise.resolve({
      statusCode: StatusCode.SuccessOK,
      requestId: 'some-awsRequestId',
      body: {
        templateId: 'some-templateId',
        email: 'some-email',
        success: SendEmailAPIResult.Success
      }
    });
  });
  errorCacheSetItemSpy.mockImplementation(() => {
    return Promise.resolve('save cache data with some cacheId') as unknown as any;
  });
  mockDataSpy.mockImplementation(() => commonUtils.mockDataFixture);
  createBackendRequestSpy.mockImplementation(
    async () => submitAutoClaimBackendRequestFixtureWithLossDateAndLossTimeObjects
  );
  dataHelperSpy.mockImplementation(
    () => submitAutoClaimBackendRequestFixtureWithLossDateAndLossTimeObjects
  );
  SubmitClaimV2ApiSpy.mockImplementation(() => {
    return Promise.resolve({
      adjuster: submitAutoClaimBackendResponse.adjuster,
      claimNumber: '005048510'
    } as any);
  });
};

const clearAllMocks = () => {
  jest.clearAllMocks();
  process.env = initEnv;
};

describe('efnol-auto-submit-claim', () => {
  beforeEach(() => {
    mockImplementations();
  });

  afterEach(() => {
    clearAllMocks();
  });

  afterAll(() => {
    process.env = initEnv;
  });

  describe('Set up', () => {
    it('returns a mock response with http status 200 if useMock has value true', async () => {
      process.env = {
        ...process.env,
        ALLOW_MOCK: 'true'
      };
      mockEvent.headers = {
        ...mockEvent.headers,
        'X-Ace-Mock': true
      };

      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
      });
      isMockEnvironmentSpy.mockImplementation(() => true);

      const result = await app.handler(mockEvent, mockContext);

      expect(isMockEnvironmentSpy).toBeCalledWith('true', mockEvent.headers);
      expect(mockDataSpy).toBeCalledWith(
        mockContext,
        { claimNumber: '005048510', lossCause: 'othercoll', isMobileAppAccidentDetection: 'true' },
        submitAutoClaimFrontendResponseFixture
      );
      expect(result).toEqual(commonUtils.mockDataFixture);
      expect(loggerInfoSpy).toHaveBeenNthCalledWith(1, 'Invoke Start', {
        claimNumber: '005048510',
        isMobileAppAccidentDetection: 'true',
        lossCause: 'othercoll'
      });
      expect(isMockEnvironmentSpy).toBeCalledWith('true', mockEvent.headers);
    });

    it('should have the X-Ace-Session-Id among the headers from the request event.headers - negative', async () => {
      const testLoggerSpyCheckXAceSessionId = testLoggerSpyCheckXRequestId('X-Ace-Session-Id');

      loggerInitializeSpy.mockImplementation(testLoggerSpyCheckXAceSessionId);
      delete mockEvent.headers['X-Ace-Session-Id'];
      await app.handler(mockEvent, mockContext);
      expect(headerResult).toStrictEqual('failed');
    });

    it('should have the X-Ace-Session-Id among the headers from the request event.headers - positive', async () => {
      const testLoggerSpyCheckXAceSessionId = testLoggerSpyCheckXRequestId('X-Ace-Session-Id');

      loggerInitializeSpy.mockImplementation(testLoggerSpyCheckXAceSessionId);
      await app.handler(mockEvent, mockContext);
      expect(headerResult).toStrictEqual('passed');
    });
  });

  // Important!!!
  // (TODO) add validation checks in the frontendRequestValidator tdd and code implementation.
  // TODO: add validations at the gateway level

  describe('Happy paths', () => {
    it('should log isMobileAppAccidentDetection in lambdaSuccess', async () => {
      const result = await app.handler(mockEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        expect.objectContaining(mockLogInfo),
        {
          APIResult: SubmitAutoClaimFrontendResult.SuccessWithEmailSuccess,
          adjuster: submitAutoClaimBackendResponse.adjuster
        },
        'Submit_claim'
      );

      expect(result).toEqual(commonUtils.mockLambdaSuccess);
    });
  });

  describe('Authorization scenarios', () => {
    it('should return 400 is Bearer token does not exist', async () => {
      delete mockEvent.headers.Authorization;
      getAuthorizationTokenSpy.mockImplementation(() => '');
      const { lossCause: mockLossCause } = mockLogInfo;
      const result = await app.handler(mockEvent, mockContext);

      expect(getAuthorizationTokenSpy).toBeCalledWith(mockEvent);
      expect(notAuthorizedSpy).toHaveBeenCalledWith(mockContext, {
        claimNumber: '005048510',
        isMobileAppAccidentDetection: 'true',
        lossCause: mockLossCause
      });
      expect(result).toEqual(commonUtils.noAuthorizedMockResponse);
    });

    it('should succeed without body policy number for BEHIND_LOGIN flow', async () => {
      extractBehindLoginOrAnonymousPropsSpy.mockImplementation(() =>
        Promise.resolve({
          policyNumber: defaultPolicyNumber,
          loginFlowType: LoginFlowType.BEHIND_LOGIN,
          efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
          clubCode: '001'
        })
      );
      mockEvent.body = JSON.stringify({
        ...submitAutoClaimCarDrivenWithOneOtherParty,
        policyNumber: ''
      });
      const result = await app.handler(mockEvent, mockContext);
      // Should not call policyNotFound for missing body policy number in BEHIND_LOGIN flow
      expect(policyNotFoundSpy).not.toHaveBeenCalledWith(
        mockContext,
        expect.anything(),
        'Policy number missing from request body'
      );
      expect(result.statusCode).toBe(403);
    });

    it('should succeed even if policy number in body does not match for BEHIND_LOGIN flow', async () => {
      getEnableIntegrationGatewaySpy.mockResolvedValueOnce(true);
      const differentPolicyNumber = 'DIFFERENT123456';
      extractBehindLoginOrAnonymousPropsSpy.mockImplementation(() =>
        Promise.resolve({
          policyNumber: differentPolicyNumber,
          loginFlowType: LoginFlowType.BEHIND_LOGIN,
          efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
          clubCode: '001'
        })
      );

      const isPolicyAuthorizedAsyncSpy = jest.spyOn(
        require('@ace-clublabs/iss-cci-clients').ClaimsAuthorizationHelper.prototype,
        'isPolicyAuthorizedAsync'
      );
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      // Also set up the authorizer in requestContext
      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer: {
          customerId: 'test-customer-id',
          sub: '',
          aud: '',
          iss: '',
          scope: ''
        }
      };

      const result = await app.handler(mockEvent, mockContext);

      expect(policyNotFoundSpy).not.toHaveBeenCalledWith(
        mockContext,
        expect.anything(),
        'Policy number mismatch between body and token'
      );
      expect(result.statusCode).toBe(200);
    });
  });

  describe('CCI Policy Authorization for BL', () => {
    let isPolicyAuthorizedAsyncSpy: jest.SpyInstance;

    beforeEach(() => {
      isPolicyAuthorizedAsyncSpy = jest.spyOn(
        ClaimsAuthorizationHelper.prototype,
        'isPolicyAuthorizedAsync'
      );
    });

    afterEach(() => {
      isPolicyAuthorizedAsyncSpy.mockRestore();
    });

    it('should authorize policy and proceed when loginFlowType is BEHIND_LOGIN and policy is authorized', async () => {
      // Arrange
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
        clubCode: '001'
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer
      };

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(isPolicyAuthorizedAsyncSpy).toHaveBeenCalledTimes(1);
      expect(isPolicyAuthorizedAsyncSpy).toHaveBeenCalledWith(
        defaultPolicyNumber,
        'test-customer-id',
        mockEvent,
        baseHeaders,
        expect.anything(),
        ClientApplication.AUTO_CLAIMS
      );
      expect(policyUnauthorizedSpy).not.toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
    });

    it('should return 403 when loginFlowType is BEHIND_LOGIN and policy is not authorized', async () => {
      // Arrange
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
        clubCode: '001'
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(false);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer
      };

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(isPolicyAuthorizedAsyncSpy).toHaveBeenCalledTimes(1);
      expect(isPolicyAuthorizedAsyncSpy).toHaveBeenCalledWith(
        defaultPolicyNumber,
        'test-customer-id',
        mockEvent,
        baseHeaders,
        expect.anything(),
        ClientApplication.AUTO_CLAIMS
      );
      expect(policyUnauthorizedSpy).toHaveBeenCalledWith(mockContext, expect.any(Object));
      expect(result.statusCode).toBe(403);
    });

    it('should skip authorization check when loginFlowType is ANONYMOUS', async () => {
      // Arrange
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
      });

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer
      };

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(isPolicyAuthorizedAsyncSpy).not.toHaveBeenCalled();
      expect(policyUnauthorizedSpy).not.toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
    });

    it('should call authorization with undefined customerId when not present in event', async () => {
      // Arrange
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
        clubCode: '001'
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      delete mockEvent.requestContext?.authorizer?.customerId;

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(isPolicyAuthorizedAsyncSpy).toHaveBeenCalledTimes(1);
      expect(isPolicyAuthorizedAsyncSpy).toHaveBeenCalledWith(
        defaultPolicyNumber,
        undefined,
        mockEvent,
        baseHeaders,
        expect.anything(),
        ClientApplication.AUTO_CLAIMS
      );
      expect(result.statusCode).toBe(200);
    });

    it('should handle authorization check error and propagate to error handler', async () => {
      // Arrange
      const authError = new Error('Authorization service unavailable');
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
        clubCode: '001'
      });
      isPolicyAuthorizedAsyncSpy.mockRejectedValueOnce(authError);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer
      };

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(isPolicyAuthorizedAsyncSpy).toHaveBeenCalledTimes(1);
      expect(lambdaErrorSpy).toHaveBeenCalledWith(
        mockContext,
        expect.any(Object),
        authError,
        'Unable to submit non-glass claim'
      );
      expect(result).toEqual(commonUtils.mockLambdaError);
    });

    it('should use correct policyNumber extracted from body for authorization', async () => {
      // Arrange
      getEnableIntegrationGatewaySpy.mockResolvedValueOnce(true); // Enable V2 flow to bypass cache
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      mockEvent.body = JSON.stringify({
        ...submitAutoClaimCarDrivenWithOneOtherParty,
        policyNumber: defaultPolicyNumber
      });

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer
      };

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(isPolicyAuthorizedAsyncSpy).toHaveBeenCalledWith(
        defaultPolicyNumber,
        'test-customer-id',
        mockEvent,
        baseHeaders,
        expect.anything(),
        ClientApplication.AUTO_CLAIMS
      );
      expect(result.statusCode).toBe(200);
    });

    it('should pass correct logger instance to authorization helper', async () => {
      // Arrange
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer
      };

      // Act
      await app.handler(mockEvent, mockContext);

      // Assert
      const loggerArg = isPolicyAuthorizedAsyncSpy.mock.calls[0][4];
      expect(loggerArg).toBeDefined();
      expect(loggerArg.info).toBeDefined();
      expect(loggerArg.error).toBeDefined();
      expect(loggerArg.debug).toBeDefined();
    });

    it('should pass correct request headers to authorization helper', async () => {
      // Arrange
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer
      };

      // Act
      await app.handler(mockEvent, mockContext);

      // Assert
      expect(isPolicyAuthorizedAsyncSpy).toHaveBeenCalledWith(
        defaultPolicyNumber,
        'test-customer-id',
        mockEvent,
        baseHeaders,
        expect.anything(),
        ClientApplication.AUTO_CLAIMS
      );
    });

    it('should use AUTO_CLAIMS as the client application', async () => {
      // Arrange
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer
      };

      // Act
      await app.handler(mockEvent, mockContext);

      // Assert
      const clientApplicationArg = isPolicyAuthorizedAsyncSpy.mock.calls[0][5];
      expect(clientApplicationArg).toBe(ClientApplication.AUTO_CLAIMS);
    });

    it('should call submit-claim backend if authorized', async () => {
      // Arrange
      getEnableIntegrationGatewaySpy.mockResolvedValueOnce(true);
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer
      };

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(isPolicyAuthorizedAsyncSpy).toHaveBeenCalledTimes(1);
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);
      expect(result.statusCode).toBe(200);
    });

    it('should include customerId in V2 request body for BEHIND_LOGIN flow', async () => {
      // Arrange
      getEnableIntegrationGatewaySpy.mockResolvedValueOnce(true);
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer
      };

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);
      const requestBody = SubmitClaimV2ApiSpy.mock.calls[0][0];
      expect(requestBody.customerId).toBe('test-customer-id');
      expect(result.statusCode).toBe(200);
    });

    it('should not include customerId in V2 request body for ANONYMOUS flow', async () => {
      // Arrange
      getEnableIntegrationGatewaySpy.mockResolvedValueOnce(true);
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
      });

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(isPolicyAuthorizedAsyncSpy).not.toHaveBeenCalled();
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);
      const requestBody = SubmitClaimV2ApiSpy.mock.calls[0][0];
      expect(requestBody.customerId).toBeUndefined();
      expect(result.statusCode).toBe(200);
    });

    it('should not include customerId in V2 request body when customerId is not present in authorizer', async () => {
      // Arrange
      getEnableIntegrationGatewaySpy.mockResolvedValueOnce(true);
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer: {
          ...authorizer,
          customerId: undefined
        }
      };

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);
      const requestBody = SubmitClaimV2ApiSpy.mock.calls[0][0];
      expect(requestBody.customerId).toBeUndefined();
      expect(result.statusCode).toBe(200);
    });

    it('should not forward customerId from request body when not present in authorizer (ANONYMOUS flow)', async () => {
      // Arrange
      getEnableIntegrationGatewaySpy.mockResolvedValueOnce(true);
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
      });

      // Inject customerId in request body to test it gets removed
      const bodyWithCustomerId = {
        ...defaultRequestBody,
        customerId: 'injected-customer-id'
      };
      mockEvent.body = JSON.stringify(bodyWithCustomerId);

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);
      const requestBody = SubmitClaimV2ApiSpy.mock.calls[0][0];
      expect(requestBody.customerId).toBeUndefined();
      expect(result.statusCode).toBe(200);
    });

    it('should not forward customerId from request body when not present in authorizer (BEHIND_LOGIN flow)', async () => {
      // Arrange
      getEnableIntegrationGatewaySpy.mockResolvedValueOnce(true);
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      // Inject customerId in request body to test it gets removed and not used
      const bodyWithCustomerId = {
        ...defaultRequestBody,
        customerId: 'injected-customer-id'
      };
      mockEvent.body = JSON.stringify(bodyWithCustomerId);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer: {
          ...authorizer,
          customerId: undefined
        }
      };

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);
      const requestBody = SubmitClaimV2ApiSpy.mock.calls[0][0];
      // Should be undefined, not the injected value
      expect(requestBody.customerId).toBeUndefined();
      expect(result.statusCode).toBe(200);
    });

    it('should use authorizer customerId and ignore body customerId when both present (BEHIND_LOGIN flow)', async () => {
      // Arrange
      getEnableIntegrationGatewaySpy.mockResolvedValueOnce(true);
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      // Inject different customerId in request body
      const bodyWithCustomerId = {
        ...defaultRequestBody,
        customerId: 'injected-customer-id-from-body'
      };
      mockEvent.body = JSON.stringify(bodyWithCustomerId);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer: {
          ...authorizer,
          customerId: 'test-customer-id'
        }
      };

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);
      const requestBody = SubmitClaimV2ApiSpy.mock.calls[0][0];
      // Should use authorizer value, not the injected body value
      expect(requestBody.customerId).toBe('test-customer-id');
      expect(result.statusCode).toBe(200);
    });

    it('should not call submit-claim backend if unauthorized', async () => {
      // Arrange
      getEnableIntegrationGatewaySpy.mockResolvedValueOnce(true);
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin
      });
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(false);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer
      };

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(isPolicyAuthorizedAsyncSpy).toHaveBeenCalledTimes(1);
      expect(SubmitClaimV2ApiSpy).not.toHaveBeenCalled();
      expect(policyUnauthorizedSpy).toHaveBeenCalled();
      expect(result.statusCode).toBe(403);
    });
  });

  describe('V2 Integration Gateway', () => {
    beforeEach(() => {
      mockImplementations();
      getEnableIntegrationGatewaySpy.mockResolvedValue(true);
    });

    afterEach(() => {
      clearAllMocks();
    });

    it('should not call sanitizeAllData for V2 flow', async () => {
      await app.handler(mockEvent, mockContext);

      expect(dataHelperSpy).not.toHaveBeenCalled();
    });

    it('should call submitAutoClaimV2 with correct parameters when Integration Gateway is enabled', async () => {
      // Arrange
      const mockV2Response = {
        adjuster: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '555-0123'
        },
        claimNumber: '005048510',
        clubCode: '004'
      };

      SubmitClaimV2ApiSpy.mockResolvedValueOnce(mockV2Response as any);

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert - Verify V2 API is called with correct parameters
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);

      // Verify loginFlowType was added
      const callArgs = SubmitClaimV2ApiSpy.mock.calls[0];
      expect(callArgs[0]).toMatchObject({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.ANONYMOUS
      });
      expect(callArgs[1]).toBe('some-token');
      expect(callArgs[2]).toBe(mockLoggerInstance);
      expect(callArgs[3]).toBe(mockContext);

      // Assert - Verify successful response processing
      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        mockLogInfo,
        {
          APIResult: SubmitAutoClaimFrontendResult.SuccessWithEmailSuccess,
          adjuster: mockV2Response.adjuster
        },
        'Submit_claim'
      );

      // Assert - Verify V1-specific functions are bypassed
      expect(claimCacheGetItemSpy).not.toHaveBeenCalled();
      expect(createBackendRequestSpy).not.toHaveBeenCalled();
      expect(dataHelperSpy).not.toHaveBeenCalled();
      expect(SubmitClaimApiSpy).not.toHaveBeenCalled();
      expect(sendConfirmationEmailSpy).not.toHaveBeenCalled();

      expect(result).toEqual(commonUtils.mockLambdaSuccess);
    });

    it('should handle V2 response without adjuster correctly', async () => {
      // Arrange
      const mockV2ResponseNoAdjuster = {
        claimNumber: '005048510'
        // No adjuster property
      };
      SubmitClaimV2ApiSpy.mockResolvedValueOnce(mockV2ResponseNoAdjuster as any);

      // Act
      const result = await app.handler(mockEvent, mockContext);

      // Assert
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);
      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        mockLogInfo,
        {
          APIResult: SubmitAutoClaimFrontendResult.SuccessWithEmailSuccess,
          adjuster: undefined // Should handle undefined adjuster gracefully
        },
        'Submit_claim'
      );

      expect(result).toEqual(commonUtils.mockLambdaSuccess);
    });

    it('should pass through PARKEDUNOCCUPIED loss cause in V2 flow (parked scenario)', async () => {
      // Frontend sends PARKEDUNOCCUPIED for "Hit by another vehicle"; lambda proxies without mapping
      const requestBody = {
        ...submitAutoClaimCarDrivenWithOneOtherParty,
        policyNumber: defaultPolicyNumber,
        lossCause: LossCause.PARKEDUNOCCUPIED
      };
      mockEvent.body = JSON.stringify(requestBody);

      const mockV2Response = {
        adjuster: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '555-0123'
        },
        claimNumber: '005048510'
      };
      SubmitClaimV2ApiSpy.mockResolvedValueOnce(mockV2Response as any);

      // Act
      await app.handler(mockEvent, mockContext);

      // Assert - loss cause is passed through to common v2 without override
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          lossCause: LossCause.PARKEDUNOCCUPIED
        }),
        'some-token',
        mockLoggerInstance,
        mockContext,
        expect.anything(),
        LoginFlowType.ANONYMOUS,
        EfnolApplication.AutoEfnol1stPartyAnonymous
      );
    });

    it('should default loginFlowType to ANONYMOUS when not provided in V2 flow', async () => {
      // Arrange - Create request body without loginFlowType
      const requestBodyWithoutLoginFlowType = {
        ...submitAutoClaimCarDrivenWithOneOtherParty,
        policyNumber: defaultPolicyNumber
        // loginFlowType is intentionally not set
      };
      mockEvent.body = JSON.stringify(requestBodyWithoutLoginFlowType);

      const mockV2Response = {
        adjuster: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '555-0123'
        },
        claimNumber: '005048510'
      };
      SubmitClaimV2ApiSpy.mockResolvedValueOnce(mockV2Response as any);

      // Act
      await app.handler(mockEvent, mockContext);

      // Assert - Verify that submitAutoClaimV2 was called with loginFlowType defaulted to ANONYMOUS
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          loginFlowType: LoginFlowType.ANONYMOUS
        }),
        'some-token',
        mockLoggerInstance,
        mockContext,
        expect.anything(),
        LoginFlowType.ANONYMOUS,
        EfnolApplication.AutoEfnol1stPartyAnonymous
      );
    });

    it('should preserve loginFlowType when provided as BEHIND_LOGIN in V2 flow', async () => {
      mockEvent.queryStringParameters = {
        policyGuid: '111-222-333-444-555-666'
      };

      // Arrange - Mock extractBehindLoginOrAnonymousProps to return BEHIND_LOGIN
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin
      });

      // Mock CCI authorization for BEHIND_LOGIN flow
      const isPolicyAuthorizedAsyncSpy = jest.spyOn(
        ClaimsAuthorizationHelper.prototype,
        'isPolicyAuthorizedAsync'
      );
      isPolicyAuthorizedAsyncSpy.mockResolvedValueOnce(true);

      mockEvent.requestContext = {
        ...mockEvent.requestContext,
        authorizer
      };

      // Arrange - Create request body with loginFlowType set to BEHIND_LOGIN
      const requestBodyWithLoginFlowType = {
        ...submitAutoClaimCarDrivenWithOneOtherParty,
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN
      };
      mockEvent.body = JSON.stringify(requestBodyWithLoginFlowType);

      const mockV2Response = {
        adjuster: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '555-0123'
        },
        claimNumber: '005048510'
      };
      SubmitClaimV2ApiSpy.mockResolvedValueOnce(mockV2Response as any);

      // Act
      await app.handler(mockEvent, mockContext);

      isPolicyAuthorizedAsyncSpy.mockRestore();

      // Assert - Verify that submitAutoClaimV2 was called with the provided loginFlowType
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          loginFlowType: LoginFlowType.BEHIND_LOGIN
        }),
        'some-token',
        mockLoggerInstance,
        mockContext,
        expect.anything(),
        LoginFlowType.BEHIND_LOGIN,
        EfnolApplication.AutoEfnol1stPartyBehindLogin
      );
    });

    it('should preserve loginFlowType when provided as ANONYMOUS in V2 flow', async () => {
      // Arrange - Create request body with loginFlowType explicitly set to ANONYMOUS
      const requestBodyWithLoginFlowType = {
        ...submitAutoClaimCarDrivenWithOneOtherParty,
        policyNumber: defaultPolicyNumber,
        loginFlowType: LoginFlowType.ANONYMOUS
      };
      mockEvent.body = JSON.stringify(requestBodyWithLoginFlowType);

      const mockV2Response = {
        adjuster: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '555-0123'
        },
        claimNumber: '005048510'
      };
      SubmitClaimV2ApiSpy.mockResolvedValueOnce(mockV2Response as any);

      // Act
      await app.handler(mockEvent, mockContext);

      // Assert - Verify that submitAutoClaimV2 was called with the provided loginFlowType
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledTimes(1);
      expect(SubmitClaimV2ApiSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          loginFlowType: LoginFlowType.ANONYMOUS
        }),
        'some-token',
        mockLoggerInstance,
        mockContext,
        expect.anything(),
        LoginFlowType.ANONYMOUS,
        EfnolApplication.AutoEfnol1stPartyAnonymous
      );
    });

    describe('resolvedPolicyNumber substitution', () => {
      it('should use resolvedPolicyNumber when provided in request body', async () => {
        // Arrange
        getEnableIntegrationGatewaySpy.mockResolvedValueOnce(true); // V2 flow
        const resolvedPolicynumber = 'LEGACY-POL-123';
        extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
          policyNumber: defaultPolicyNumber,
          loginFlowType: LoginFlowType.ANONYMOUS,
          efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
        });
        const mockV2Response = {
          adjuster: { firstName: 'John', lastName: 'Doe' },
          claimNumber: '005048510'
        };
        SubmitClaimV2ApiSpy.mockResolvedValueOnce(mockV2Response as any);

        mockEvent.body = JSON.stringify({
          ...submitAutoClaimCarDrivenWithOneOtherParty,
          policyNumber: defaultPolicyNumber,
          resolvedPolicyNumber: resolvedPolicynumber
        });

        // Act
        await app.handler(mockEvent, mockContext);

        // Assert - resolvedPolicyNumber should be used in the backend request
        expect(SubmitClaimV2ApiSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            policyNumber: resolvedPolicynumber
          }),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything()
        );
      });

      it('should use token-derived policyNumber when resolvedPolicyNumber is not provided', async () => {
        // Arrange
        getEnableIntegrationGatewaySpy.mockResolvedValueOnce(true); // V2 flow
        extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
          policyNumber: defaultPolicyNumber,
          loginFlowType: LoginFlowType.ANONYMOUS,
          efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
        });
        const mockV2Response = {
          adjuster: { firstName: 'John', lastName: 'Doe' },
          claimNumber: '005048510'
        };
        SubmitClaimV2ApiSpy.mockResolvedValueOnce(mockV2Response as any);

        mockEvent.body = JSON.stringify({
          ...submitAutoClaimCarDrivenWithOneOtherParty,
          policyNumber: defaultPolicyNumber
        });

        // Act
        await app.handler(mockEvent, mockContext);

        // Assert - token-derived policyNumber should be used
        expect(SubmitClaimV2ApiSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            policyNumber: defaultPolicyNumber
          }),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything()
        );
      });
    });
  });
});
