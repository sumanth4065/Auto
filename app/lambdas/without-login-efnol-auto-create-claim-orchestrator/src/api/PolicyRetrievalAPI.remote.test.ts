import { FunctionInvoke, IClientContext, IRequestProxy } from '@ace-clublabs/aws-lambda-v3';
import * as AwsLambdaV3 from '@ace-clublabs/aws-lambda-v3';
import { AxiosPostHelper } from '@ace-clublabs/iss-common-lambda-v3';
import { createAutoClaimBackendResponseFixture } from '@lib/types';
import {
  IAutoPolicyRetrievalCanonicalRequest,
  LoginFlowType
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { IApiAuthentication } from '@lib/types';
import { policyRetrievalRemoteApi } from './PolicyRetrievalAPI.remote';
import {
  getCommonApiDomain,
  getCommonGatewayId,
  CommonGatewayType
} from '@ace-clublabs/iss-common-util';
import { Logger } from '@ace-clublabs/aws-lambda-v3';
import { getRequestHeaders } from '@lib/common-utils';

// Mock dependencies
jest.mock('@ace-clublabs/iss-common-lambda-v3');
jest.mock('@ace-clublabs/iss-common-util');
jest.mock('@lib/common-utils');
jest.mock('@lib/utility');
process.env = {
  AWS_REGION: 'some-aws-region',
  WORKLOAD_ACCOUNT_ID: 'some-workload-account-id'
};

describe('PolicyRetrievalAPI', () => {
  const mockRequest: IAutoPolicyRetrievalCanonicalRequest = {
    lossDate: '11/10/2025',
    policyNumber: 'some-policy-number'
  };
  const policyRetrievalBackendResponseFixture = {
    vehicles: [
      {
        RUNumber: 'RU001',
        year: 2021,
        make: 'Toyota',
        model: 'Camry',
        VIN: '1HGBH41JXMN109186'
      }
    ],
    drivers: [
      {
        firstName: 'John',
        lastName: 'Doe'
      }
    ]
  };
  const mockContext = {
    awsRequestId: 'some-request-id',
    invokedFunctionArn: 'arn:aws:lambda:us-west-2:018363016784:function:test-function:1'
  } as AwsLambdaV3.IContext;
  let mockEvent;

  let axiosPostHelperSpy: jest.SpyInstance;
  let getCommonApiDomainSpy: jest.SpyInstance;
  let getCommonGatewayIdSpy: jest.SpyInstance;
  let loggerDebugSpy: jest.SpyInstance;
  let getRequestHeadersSpy: jest.SpyInstance;

  beforeEach(() => {
    mockEvent = {
      headers: {
        'X-Ace-Mock': 'True',
        Authorization: 'Bearer some-okta-token',
        Host: 'localhost:3000'
      },
      body: JSON.stringify(mockRequest)
    };

    // Mock AxiosPostHelper
    axiosPostHelperSpy = jest.spyOn(AxiosPostHelper.prototype, 'executePostCallv2');
    axiosPostHelperSpy.mockResolvedValue(policyRetrievalBackendResponseFixture);

    // Mock utility functions
    getCommonApiDomainSpy = getCommonApiDomain as jest.MockedFunction<typeof getCommonApiDomain>;
    getCommonApiDomainSpy.mockReturnValue('https://api.test.com');

    getCommonGatewayIdSpy = getCommonGatewayId as jest.MockedFunction<typeof getCommonGatewayId>;
    getCommonGatewayIdSpy.mockReturnValue('test-gateway-id');

    // Mock getRequestHeaders
    getRequestHeadersSpy = getRequestHeaders as jest.MockedFunction<typeof getRequestHeaders>;
    getRequestHeadersSpy.mockReturnValue({
      'Content-Type': 'application/json',
      Authorization: 'Bearer some-ad-token'
    });

    // Mock Logger
    loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug');
    loggerDebugSpy.mockImplementation(() => {});

    jest.spyOn(Logger, 'getInstance').mockReturnValue({
      debug: loggerDebugSpy,
      getClientContext: () => ({
        correlationId: 'some-correlation-id',
        sessionId: 'some-session-id'
      })
    } as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  fit('should call AxiosPostHelper with correct parameters', async () => {
    await policyRetrievalRemoteApi(mockRequest, mockEvent, LoginFlowType.ANONYMOUS, mockContext);

    expect(axiosPostHelperSpy).toHaveBeenCalledWith(
      'https://api.test.com/v2/auto/policy-retrieval/?loginFlowType=Anonymous',
      'test-gateway-id',
      JSON.stringify(mockRequest),
      'Bearer some-okta-token', // bearerToken
      mockContext,
      {
        'Content-Type': 'application/json',
        Authorization: 'Bearer some-ad-token'
      } // requestHeaders
    );
  });

  it('should return policy retrieval response when successful', async () => {
    const result = await policyRetrievalRemoteApi(
      mockRequest,
      mockEvent,
      LoginFlowType.ANONYMOUS,
      mockContext
    );
    expect(result).toEqual({
      drivers: [{ firstName: 'John', lastName: 'Doe', driverId: 'some-uuid-1' }],
      vehicles: [
        { RUNumber: 'RU001', VIN: '1HGBH41JXMN109186', make: 'Toyota', model: 'Camry', year: 2021 }
      ]
    });
  });

  describe('AxiosPostHelper error', () => {
    const axiosError = {
      code: 'XYZ',
      message: 'an error occurred',
      statusCode: 500
    };

    beforeEach(() => {
      axiosPostHelperSpy.mockRejectedValue(axiosError);
    });

    it('should throw error when AxiosPostHelper fails', async () => {
      try {
        await policyRetrievalRemoteApi(
          mockRequest,
          mockEvent,
          LoginFlowType.ANONYMOUS,
          mockContext
        );
        fail('Expected function to throw');
      } catch (error) {
        expect(error).toEqual(axiosError);
      }
    });
  });
});
