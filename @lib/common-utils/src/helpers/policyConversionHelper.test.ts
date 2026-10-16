import * as IssCommonLambda from '@ace-clublabs/iss-common-lambda-v3';
import * as IssCommonUtil from '@ace-clublabs/iss-common-util';
import { policyConversionCheck } from './policyConversionHelper';

jest.mock('@ace-clublabs/iss-common-lambda-v3');
jest.mock('@ace-clublabs/aws-lambda-v3');
jest.mock('@ace-clublabs/iss-common-util');

const axiosHelperSpy = jest.spyOn(IssCommonLambda.AxiosPostHelper.prototype, 'executePostCallv2');
const getCommonApiDomainSpy = jest.spyOn(IssCommonUtil, 'getCommonApiDomain');
const getCommonGatewayIdSpy = jest.spyOn(IssCommonUtil, 'getCommonGatewayId');
const getTenantAndProductSpy = jest.spyOn(
  IssCommonLambda.PolicyTypeAndTenantHelper,
  'getTenantAndProductFromPolicyNumber'
);

const loggerMock = {
  debug: jest.fn()
};

const mockContext = {
  awsRequestId: 'some-request-id',
  invokedFunctionArn: 'arn:aws:lambda:us-west-2:018363016784:function:test-function:1'
};

const mockConversionResponse = {
  isConversionApplicable: true,
  legacyPolicyNumber: 'ATX189411101',
  targetPolicyNumber: 'NEW-POLICY-001',
  targetEffectiveDate: '2025-01-01',
  policyState: 'AL',
  conversionType: 'PSTAR_TO_GW'
};

describe('policyConversionHelper', () => {
  beforeEach(() => {
    axiosHelperSpy.mockResolvedValue(mockConversionResponse as any);
    getCommonApiDomainSpy.mockReturnValue('https://some-api-domain');
    getCommonGatewayIdSpy.mockReturnValue('some-gateway-id');
    getTenantAndProductSpy.mockReturnValue({
      tenant: (IssCommonLambda.ITenant as any).POLICYSTAR,
      productType: (IssCommonLambda.PolicyType as any).AUTO
    });
    delete process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK;
  });

  afterEach(() => {
    jest.resetAllMocks();
    delete process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK;
  });

  it('calls the /v2/common/policy-conversion endpoint with correct URL', async () => {
    await policyConversionCheck(
      mockContext as any,
      'ATX189411101',
      'PSTAR_TO_GW' as any,
      'some-token',
      loggerMock as any,
      {},
      'BEHIND_LOGIN' as any
    );

    expect(axiosHelperSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://some-api-domain/v2/common/policy-conversion'),
      'some-gateway-id',
      JSON.stringify({ policyNumber: 'ATX189411101', conversionType: 'PSTAR_TO_GW' }),
      'some-token',
      mockContext,
      {}
    );
  });

  it('derives the gateway ID using commonInsuranceClaimsV2Services type', async () => {
    await policyConversionCheck(
      mockContext as any,
      'ATX189411101',
      'PSTAR_TO_GW' as any,
      'some-token',
      loggerMock as any,
      {},
      'BEHIND_LOGIN' as any
    );

    expect(getCommonGatewayIdSpy).toHaveBeenCalledWith(
      'commonInsuranceClaimsV2Services',
      mockContext.invokedFunctionArn
    );
  });

  it('serializes policyNumber and conversionType in the request body', async () => {
    await policyConversionCheck(
      mockContext as any,
      'A1536806',
      'PSTAR_TO_GW' as any,
      'bearer-token',
      loggerMock as any,
      {},
      'BEHIND_LOGIN' as any
    );

    const callArgs = axiosHelperSpy.mock.calls[0];
    const body = JSON.parse(callArgs[2] as string);
    expect(body).toEqual({ policyNumber: 'A1536806', conversionType: 'PSTAR_TO_GW' });
  });

  it('returns the response from the axios helper', async () => {
    const result = await policyConversionCheck(
      mockContext as any,
      'ATX189411101',
      'PSTAR_TO_GW' as any,
      'some-token',
      loggerMock as any,
      {},
      'BEHIND_LOGIN' as any
    );

    expect(result).toEqual(mockConversionResponse);
  });

  describe('mock data integration', () => {
    it('returns mock data when ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK is true and policy exists', async () => {
      process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK = 'true';

      const result = (await policyConversionCheck(
        mockContext as any,
        'A05441266',
        'PSTAR_TO_GW' as any,
        'some-token',
        loggerMock as any,
        {},
        'BEHIND_LOGIN' as any
      )) as any;

      expect(axiosHelperSpy).not.toHaveBeenCalled();
      expect(result.isConversionApplicable).toBe(true);
      expect(result.legacyPolicyNumber).toBe('A05441266');
      expect(result.targetPolicyNumber).toBe('AAR000202121');
      expect(result.policyState).toBe('AR');
    });

    it('calls real API when mock is disabled even if policy exists in mock data', async () => {
      process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK = 'false';

      await policyConversionCheck(
        mockContext as any,
        'A05441266',
        'PSTAR_TO_GW' as any,
        'some-token',
        loggerMock as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(axiosHelperSpy).toHaveBeenCalled();
    });

    it('calls real API when mock data does not exist for policy', async () => {
      process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK = 'true';

      await policyConversionCheck(
        mockContext as any,
        'UNKNOWN123456',
        'PSTAR_TO_GW' as any,
        'some-token',
        loggerMock as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(axiosHelperSpy).toHaveBeenCalled();
    });

    it('logs when using mock data', async () => {
      process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK = 'true';

      await policyConversionCheck(
        mockContext as any,
        'A05404136',
        'PSTAR_TO_GW' as any,
        'some-token',
        loggerMock as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(loggerMock.debug).toHaveBeenCalledWith(
        expect.stringContaining('Using mock conversion data for policy A05404136')
      );
    });
  });
});
