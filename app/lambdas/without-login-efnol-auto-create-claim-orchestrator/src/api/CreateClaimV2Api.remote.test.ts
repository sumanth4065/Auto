import { IContext, IEvent } from '@ace-clublabs/aws-lambda-v3';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import { AxiosPostHelper } from '@ace-clublabs/iss-common-lambda-v3';
import {
  CommonGatewayType,
  getCommonApiDomain,
  getCommonGatewayId
} from '@ace-clublabs/iss-common-util';
import {
  createAutoClaimBackendResponseFixture,
  createAutoClaimRequestFixture,
  IApiAuthentication
} from '@lib/types';
import { createAutoClaimV2 } from './CreateClaimV2Api.remote';
import {
  IAutoCreateClaimCanonicalRequestV2,
  LoginFlowType
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { transformCanonicalRequestV2 } from '../helpers';

// Mock dependencies
jest.mock('@ace-clublabs/iss-common-lambda-v3');
jest.mock('@ace-clublabs/iss-common-util');

describe('CreateClaimV2Api.remote', () => {
  let mockRequest: IAutoCreateClaimCanonicalRequestV2;
  let mockAuth: IApiAuthentication;
  let mockEvent: IEvent;
  let mockContext: IContext;
  let axiosPostHelperSpy: jest.SpyInstance;
  let getCommonApiDomainSpy: jest.SpyInstance;
  let getCommonGatewayIdSpy: jest.SpyInstance;
  let loggerDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = transformCanonicalRequestV2(createAutoClaimRequestFixture);
    mockAuth = {
      clientId: 'some-client-id',
      clientSecret: 'some-client-secret',
      bearerToken: 'some-bearer-token'
    };
    mockEvent = {
      resource: '/test',
      path: '/test',
      httpMethod: 'POST',
      headers: {
        Accept: 'application/json',
        'X-Ace-Mock': 'True',
        Authorization: 'Bearer some-okta-token',
        Host: 'localhost:3000'
      },
      requestContext: {} as any,
      body: ''
    } as IEvent;
    mockContext = {
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function'
    } as IContext;

    // Mock AxiosPostHelper
    axiosPostHelperSpy = jest.spyOn(AxiosPostHelper.prototype, 'executePostCallv2');
    axiosPostHelperSpy.mockResolvedValue(createAutoClaimBackendResponseFixture);

    // Mock utility functions
    getCommonApiDomainSpy = getCommonApiDomain as jest.MockedFunction<typeof getCommonApiDomain>;
    getCommonApiDomainSpy.mockReturnValue('https://api.test.com');

    getCommonGatewayIdSpy = getCommonGatewayId as jest.MockedFunction<typeof getCommonGatewayId>;
    getCommonGatewayIdSpy.mockReturnValue('test-gateway-id');

    // Mock Logger
    loggerDebugSpy = jest.spyOn(MaskedLogger.prototype, 'debug');
    loggerDebugSpy.mockImplementation(() => {});

    jest.spyOn(MaskedLogger.prototype, 'getClientContext').mockReturnValue({
      correlationId: 'some-correlation-id',
      sessionId: 'some-session-id'
    } as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createAutoClaimV2', () => {
    it('should successfully create auto claim with correct parameters', async () => {
      const result = await createAutoClaimV2(
        mockRequest,
        mockEvent,
        LoginFlowType.ANONYMOUS,
        mockContext
      );

      expect(getCommonApiDomainSpy).toHaveBeenCalledWith(mockContext.invokedFunctionArn);
      expect(getCommonGatewayIdSpy).toHaveBeenCalledWith(
        CommonGatewayType.commonInsuranceClaimsV2Services,
        mockContext.invokedFunctionArn
      );
      expect(loggerDebugSpy).toHaveBeenCalledWith('Invoking Create Auto Claim V2 Rest API', {
        url: 'https://api.test.com/v2/auto/claim/?loginFlowType=Anonymous',
        gatewayId: 'test-gateway-id',
        request: mockRequest
      });
      expect(axiosPostHelperSpy).toHaveBeenCalledWith(
        'https://api.test.com/v2/auto/claim/?loginFlowType=Anonymous',
        'test-gateway-id',
        JSON.stringify(mockRequest),
        'Bearer some-okta-token',
        mockContext,
        expect.objectContaining({
          Origin: 'https://api.ace.aaa.com',
          'X-Ace-Correlation-Id': 'some-correlation-id',
          'X-Ace-Session-Id': 'some-session-id',
          'X-Ace-Team-Id': 'insuranceselfservice',
          'X-Ace-UserApplication': 'Clublabs-AutoEFNOL',
          'X-Bypass-Context': ''
        })
      );
      expect(result).toEqual(createAutoClaimBackendResponseFixture);
    });

    it('should construct correct endpoint URL', async () => {
      await createAutoClaimV2(mockRequest, mockEvent, LoginFlowType.ANONYMOUS, mockContext);

      expect(axiosPostHelperSpy).toHaveBeenCalledWith(
        expect.stringContaining('/v2/auto/claim'),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should pass correct gateway type to getCommonGatewayId', async () => {
      await createAutoClaimV2(mockRequest, mockEvent, LoginFlowType.ANONYMOUS, mockContext);

      expect(getCommonGatewayIdSpy).toHaveBeenCalledWith(
        CommonGatewayType.commonInsuranceClaimsV2Services,
        mockContext.invokedFunctionArn
      );
    });

    it('should serialize request body correctly', async () => {
      await createAutoClaimV2(mockRequest, mockEvent, LoginFlowType.ANONYMOUS, mockContext);

      expect(axiosPostHelperSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        JSON.stringify(mockRequest),
        expect.any(String),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should use bearer token from auth parameter', async () => {
      await createAutoClaimV2(mockRequest, mockEvent, LoginFlowType.ANONYMOUS, mockContext);

      expect(axiosPostHelperSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        'Bearer some-okta-token',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should pass processed request headers to axios call', async () => {
      await createAutoClaimV2(mockRequest, mockEvent, LoginFlowType.ANONYMOUS, mockContext);

      expect(axiosPostHelperSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          Origin: 'https://api.ace.aaa.com',
          'X-Ace-Correlation-Id': 'some-correlation-id',
          'X-Ace-Session-Id': 'some-session-id',
          'X-Ace-Team-Id': 'insuranceselfservice',
          'X-Ace-UserApplication': 'Clublabs-AutoEFNOL'
        })
      );
    });

    it('should log debug information with correct parameters', async () => {
      await createAutoClaimV2(mockRequest, mockEvent, LoginFlowType.ANONYMOUS, mockContext);

      expect(loggerDebugSpy).toHaveBeenCalledWith('Invoking Create Auto Claim V2 Rest API', {
        url: 'https://api.test.com/v2/auto/claim/?loginFlowType=Anonymous',
        gatewayId: 'test-gateway-id',
        request: mockRequest
      });
    });
  });

  describe('Error handling', () => {
    it('should propagate axios errors', async () => {
      const axiosError = new Error('Network error');
      axiosPostHelperSpy.mockRejectedValue(axiosError);

      await expect(
        createAutoClaimV2(mockRequest, mockEvent, LoginFlowType.ANONYMOUS, mockContext)
      ).rejects.toThrow('Network error');
    });

    it('should handle getCommonApiDomain errors', async () => {
      const domainError = new Error('Domain resolution failed');
      getCommonApiDomainSpy.mockImplementation(() => {
        throw domainError;
      });

      await expect(
        createAutoClaimV2(mockRequest, mockEvent, LoginFlowType.ANONYMOUS, mockContext)
      ).rejects.toThrow('Domain resolution failed');
    });

    it('should handle getCommonGatewayId errors', async () => {
      const gatewayError = new Error('Gateway ID resolution failed');
      getCommonGatewayIdSpy.mockImplementation(() => {
        throw gatewayError;
      });

      await expect(
        createAutoClaimV2(mockRequest, mockEvent, LoginFlowType.ANONYMOUS, mockContext)
      ).rejects.toThrow('Gateway ID resolution failed');
    });
  });

  describe('Different response scenarios', () => {
    it('should handle successful response with different data', async () => {
      const customResponse = { claimId: 'CUSTOM-123', status: 'success' };
      axiosPostHelperSpy.mockResolvedValue(customResponse);

      const result = await createAutoClaimV2(
        mockRequest,
        mockEvent,
        LoginFlowType.ANONYMOUS,
        mockContext
      );

      expect(result).toEqual(customResponse);
    });

    it('should handle empty response', async () => {
      axiosPostHelperSpy.mockResolvedValue(null);

      const result = await createAutoClaimV2(
        mockRequest,
        mockEvent,
        LoginFlowType.ANONYMOUS,
        mockContext
      );

      expect(result).toBeNull();
    });
  });

  describe('Parameter validation', () => {
    it('should work with different ARN formats', async () => {
      const differentArn = 'arn:aws:lambda:us-west-2:987654321098:function:different-function';
      mockContext.invokedFunctionArn = differentArn;

      await createAutoClaimV2(mockRequest, mockEvent, LoginFlowType.ANONYMOUS, mockContext);

      expect(getCommonApiDomainSpy).toHaveBeenCalledWith(differentArn);
      expect(getCommonGatewayIdSpy).toHaveBeenCalledWith(
        CommonGatewayType.commonInsuranceClaimsV2Services,
        differentArn
      );
    });

    it('should handle different event headers', async () => {
      const customHeaders = {
        Accept: 'application/json',
        Host: 'localhost:3000',
        'Custom-Header': 'custom-value',
        'Another-Header': 'another-value',
        Authorization: 'Bearer some-okta-token'
      };
      mockEvent.headers = customHeaders;

      await createAutoClaimV2(mockRequest, mockEvent, LoginFlowType.ANONYMOUS, mockContext);

      expect(axiosPostHelperSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          Origin: 'https://api.ace.aaa.com',
          'X-Ace-Correlation-Id': 'some-correlation-id',
          'X-Ace-Session-Id': 'some-session-id',
          'X-Ace-Team-Id': 'insuranceselfservice',
          'X-Ace-UserApplication': 'Clublabs-AutoEFNOL'
        })
      );
    });
  });
});
