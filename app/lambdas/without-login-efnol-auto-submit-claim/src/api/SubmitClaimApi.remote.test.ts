import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import {
  EfnolApplication,
  IAutoSubmitClaimCanonicalRequestV2,
  LoginFlowType
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { submitAutoClaimV2 } from './SubmitClaimApi.remote';

jest.mock('@lib/common-utils');
jest.mock('@ace-clublabs/iss-common-lambda-v3');
jest.mock('@ace-clublabs/iss-common-util');
jest.mock('@lib/utility');

describe('SubmitAutoClaimV2', () => {
  const processEnv = process.env;
  let mockEvent,
    mockContext,
    mockLogger,
    axiosPostHelperSpy,
    getCommonApiDomainSpy,
    getCommonGatewayIdSpy,
    mockRequestHeaders;

  const mockV2Request: IAutoSubmitClaimCanonicalRequestV2 = {
    claimNumber: '005048510',
    lossCause: 'othercoll',
    lossDate: '2024-11-13T00:00:00.000Z',
    policyNumber: 'CAA045290824',
    contactInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '555-1234'
    },
    hadOtherPropertyDamage: false,
    incidentOtherNonVehicleParties: [],
    vehiclesInvolved: [],
    driversInvolved: [],
    wasAnyoneInjured: false
  } as any;

  const mockV2Response = {
    claimNumber: '005048510',
    adjuster: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '555-0123'
    }
  };

  beforeEach(() => {
    process.env = {
      AWS_REGION: 'us-west-2'
    };

    mockEvent = {
      headers: {
        'X-Request-Id': 'some-request-id',
        'X-Ace-Session-Id': 'some-session-id'
      }
    };

    mockContext = {
      awsRequestId: 'some-request-id',
      invokedFunctionArn: 'arn:aws:lambda:us-west-2:123456789012:function:test-function',
      clientContext: {
        correlationId: 'some-correlation-id',
        sessionId: 'some-session-id'
      }
    };

    mockLogger = {
      debug: jest.fn(),
      getClientContext: jest.fn(() => ({
        correlationId: 'some-correlation-id',
        sessionId: 'some-session-id'
      }))
    };

    mockRequestHeaders = {
      'Content-Type': 'application/json',
      'X-Ace-Session-Id': 'some-session-id',
      'X-Request-Id': 'some-correlation-id'
    };

    jest.spyOn(MaskedLogger, 'getInstance').mockReturnValue(mockLogger as any);

    // Mock axios helper
    axiosPostHelperSpy = {
      executePutCallv2: jest.fn()
    };

    const { AxiosPostHelper } = require('@ace-clublabs/iss-common-lambda-v3');
    AxiosPostHelper.mockImplementation(() => axiosPostHelperSpy);

    const issCommonUtil = require('@ace-clublabs/iss-common-util');
    getCommonApiDomainSpy = jest.spyOn(issCommonUtil, 'getCommonApiDomain');
    getCommonApiDomainSpy.mockReturnValue('https://api.example.com');

    getCommonGatewayIdSpy = jest.spyOn(issCommonUtil, 'getCommonGatewayId');
    getCommonGatewayIdSpy.mockReturnValue('gateway-id-123');
  });

  afterEach(() => {
    jest.resetAllMocks();
    process.env = processEnv;
  });

  it('should call executePutCallv2 with correct parameters', async () => {
    // Arrange
    const authBearer = 'Bearer some-token';

    axiosPostHelperSpy.executePutCallv2.mockResolvedValue(mockV2Response);

    // Act
    const result = await submitAutoClaimV2(
      mockV2Request,
      authBearer,
      mockLogger,
      mockContext,
      mockRequestHeaders,
      LoginFlowType.ANONYMOUS
    );

    // Assert
    expect(axiosPostHelperSpy.executePutCallv2).toHaveBeenCalledTimes(1);
    expect(axiosPostHelperSpy.executePutCallv2).toHaveBeenCalledWith(
      'https://api.example.com/v2/auto/claim/?loginFlowType=Anonymous',
      'gateway-id-123',
      JSON.stringify(mockV2Request),
      authBearer,
      mockContext,
      {
        'Content-Type': 'application/json',
        'X-Request-Id': 'some-correlation-id',
        'X-Ace-Session-Id': 'some-session-id'
      }
    );

    expect(result).toEqual(mockV2Response);
  });

  it('should generate correct URL and gateway ID from context', async () => {
    // Arrange
    const authBearer = 'Bearer some-token';
    // const clubCode = '240';

    axiosPostHelperSpy.executePutCallv2.mockResolvedValue(mockV2Response);

    // Act
    await submitAutoClaimV2(
      mockV2Request,
      authBearer,
      mockLogger,
      mockContext,
      mockRequestHeaders,
      LoginFlowType.ANONYMOUS
    );

    // Assert
    expect(getCommonApiDomainSpy).toHaveBeenCalledWith(mockContext.invokedFunctionArn);
    expect(getCommonGatewayIdSpy).toHaveBeenCalledWith(
      'commonInsuranceClaimsV2Services',
      mockContext.invokedFunctionArn
    );
  });

  it('should handle successful V2 API response', async () => {
    // Arrange
    const authBearer = 'Bearer some-token';

    const expectedResponse = {
      claimNumber: '005048510',
      adjuster: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '555-9876'
      }
    };

    axiosPostHelperSpy.executePutCallv2.mockResolvedValue(expectedResponse);

    // Act
    const result = await submitAutoClaimV2(
      mockV2Request,
      authBearer,
      mockLogger,
      mockContext,
      mockRequestHeaders,
      LoginFlowType.ANONYMOUS
    );

    // Assert
    expect(result).toEqual(expectedResponse);
    expect(mockLogger.debug).toHaveBeenCalledWith('Invoking Submit Auto Claim V2 Rest API', {
      url: 'https://api.example.com/v2/auto/claim/?loginFlowType=Anonymous',
      gatewayId: 'gateway-id-123',
      request: mockV2Request
    });
    expect(mockLogger.debug).toHaveBeenCalledWith('Submit Auto Claim V2 Rest API Response', {
      response: expectedResponse
    });
  });

  it('should handle V2 API error correctly', async () => {
    // Arrange
    const authBearer = 'Bearer some-token';
    const clubCode = '004';

    const mockError = new Error('V2 API Error');
    axiosPostHelperSpy.executePutCallv2.mockRejectedValue(mockError);

    // Act & Assert
    await expect(
      submitAutoClaimV2(
        mockV2Request,
        authBearer,
        mockLogger,
        mockContext,
        mockRequestHeaders,
        LoginFlowType.ANONYMOUS
      )
    ).rejects.toThrow('V2 API Error');

    expect(mockLogger.debug).toHaveBeenCalledWith('Invoking Submit Auto Claim V2 Rest API', {
      url: 'https://api.example.com/v2/auto/claim/?loginFlowType=Anonymous',
      gatewayId: 'gateway-id-123',
      request: mockV2Request
    });
  });

  it('should handle response without adjuster', async () => {
    // Arrange
    const authBearer = 'Bearer some-token';

    const responseWithoutAdjuster = {
      claimNumber: '005048510'
      // No adjuster property
    };

    axiosPostHelperSpy.executePutCallv2.mockResolvedValue(responseWithoutAdjuster);

    // Act
    const result = await submitAutoClaimV2(
      mockV2Request,
      authBearer,
      mockLogger,
      mockContext,
      mockRequestHeaders,
      LoginFlowType.ANONYMOUS
    );

    // Assert
    expect(result).toEqual(responseWithoutAdjuster);
    expect(result.adjuster).toBeUndefined();
  });

  it('should use correct endpoint path for V2 API', async () => {
    // Arrange
    const authBearer = 'Bearer some-token';
    const clubCode = '004';

    axiosPostHelperSpy.executePutCallv2.mockResolvedValue(mockV2Response);

    // Act
    await submitAutoClaimV2(
      mockV2Request,
      authBearer,
      mockLogger,
      mockContext,
      mockRequestHeaders,
      LoginFlowType.ANONYMOUS
    );

    // Assert
    const expectedUrl = 'https://api.example.com/v2/auto/claim/?loginFlowType=Anonymous';
    expect(axiosPostHelperSpy.executePutCallv2).toHaveBeenCalledWith(
      expectedUrl,
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should append efnolApplication query parameter when provided', async () => {
    // Arrange
    const authBearer = 'Bearer some-token';
    axiosPostHelperSpy.executePutCallv2.mockResolvedValue(mockV2Response);

    // Act
    await submitAutoClaimV2(
      mockV2Request,
      authBearer,
      mockLogger,
      mockContext,
      mockRequestHeaders,
      LoginFlowType.ANONYMOUS,
      EfnolApplication.AutoEfnol1stPartyAnonymous
    );

    // Assert
    expect(axiosPostHelperSpy.executePutCallv2).toHaveBeenCalledWith(
      `https://api.example.com/v2/auto/claim/?loginFlowType=${LoginFlowType.ANONYMOUS}&efnolApplication=${EfnolApplication.AutoEfnol1stPartyAnonymous}`,
      'gateway-id-123',
      JSON.stringify(mockV2Request),
      authBearer,
      mockContext,
      mockRequestHeaders
    );
  });

  it('should not append efnolApplication query parameter when not provided', async () => {
    // Arrange
    const authBearer = 'Bearer some-token';
    axiosPostHelperSpy.executePutCallv2.mockResolvedValue(mockV2Response);

    // Act
    await submitAutoClaimV2(
      mockV2Request,
      authBearer,
      mockLogger,
      mockContext,
      mockRequestHeaders,
      LoginFlowType.ANONYMOUS
    );

    // Assert
    expect(axiosPostHelperSpy.executePutCallv2).toHaveBeenCalledWith(
      `https://api.example.com/v2/auto/claim/?loginFlowType=${LoginFlowType.ANONYMOUS}`,
      'gateway-id-123',
      JSON.stringify(mockV2Request),
      authBearer,
      mockContext,
      mockRequestHeaders
    );
  });

  it('should handle request with description and postalCode in lossLocation', async () => {
    // Arrange
    const authBearer = 'Bearer some-token';

    const mockV2RequestWithLocationDetails: IAutoSubmitClaimCanonicalRequestV2 = {
      ...mockV2Request,
      lossLocation: {
        streetAddress: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        description: 'Rear parking lot near entrance'
      }
    } as any;

    axiosPostHelperSpy.executePutCallv2.mockResolvedValue(mockV2Response);

    // Act
    const result = await submitAutoClaimV2(
      mockV2RequestWithLocationDetails,
      authBearer,
      mockLogger,
      mockContext,
      mockRequestHeaders,
      LoginFlowType.ANONYMOUS
    );

    // Assert
    expect(axiosPostHelperSpy.executePutCallv2).toHaveBeenCalledWith(
      'https://api.example.com/v2/auto/claim/?loginFlowType=Anonymous',
      'gateway-id-123',
      JSON.stringify(mockV2RequestWithLocationDetails),
      authBearer,
      mockContext,
      mockRequestHeaders
    );

    expect(result).toEqual(mockV2Response);
  });
});
