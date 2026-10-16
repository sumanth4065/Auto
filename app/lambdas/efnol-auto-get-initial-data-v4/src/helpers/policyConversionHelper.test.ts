import * as IssCommonLambda from '@ace-clublabs/iss-common-lambda-v3';
import * as IssCommonUtil from '@ace-clublabs/iss-common-util';
import {
  EfnolApplication,
  LoginFlowType
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { policyConversionCheck } from '@lib/common-utils';

jest.mock('@ace-clublabs/iss-common-lambda-v3');
jest.mock('@ace-clublabs/aws-lambda-v3');
jest.mock('@ace-clublabs/iss-common-util', () => ({
  ...jest.requireActual('@ace-clublabs/iss-common-util'),
  getCommonApiDomain: jest.fn(),
  getCommonGatewayId: jest.fn()
}));

const axiosHelperSpy = jest.spyOn(
  IssCommonLambda.AxiosPostHelper.prototype,
  'executePostCallv2'
);
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
  invokedFunctionArn:
    'arn:aws:lambda:us-west-2:018363016784:function:test-function:1'
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

  describe('mock data integration', () => {
    it('returns mock result when mocking is enabled and policy exists in mock data', async () => {
      process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK = 'true';
      getTenantAndProductSpy.mockReturnValue({
        tenant: (IssCommonLambda.ITenant as any).POLICYSTAR,
        productType: (IssCommonLambda.PolicyType as any).AUTO
      });

      const result = await policyConversionCheck(
        mockContext as any,
        'A05441266',
        'PSTAR_TO_GW' as any,
        'some-token',
        loggerMock as any,
        { Authorization: 'Bearer test' },
        LoginFlowType.BEHIND_LOGIN,
        EfnolApplication.AutoEfnol1stPartyBehindLogin
      );

      expect(result.isConversionApplicable).toBe(true);
      expect(result.targetPolicyNumber).toBe('AAR000202121');
      expect(axiosHelperSpy).not.toHaveBeenCalled();
    });

    it('calls real API when mocking is enabled but policy not in mock data', async () => {
      process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK = 'true';
      getTenantAndProductSpy.mockReturnValue({
        tenant: (IssCommonLambda.ITenant as any).POLICYSTAR,
        productType: (IssCommonLambda.PolicyType as any).AUTO
      });

      await policyConversionCheck(
        mockContext as any,
        'UNKNOWN_POLICY',
        'PSTAR_TO_GW' as any,
        'some-token',
        loggerMock as any,
        { Authorization: 'Bearer test' },
        LoginFlowType.BEHIND_LOGIN,
        EfnolApplication.AutoEfnol1stPartyBehindLogin
      );

      expect(axiosHelperSpy).toHaveBeenCalled();
    });

    it('calls real API when mocking is disabled', async () => {
      process.env.ENABLE_PSTAR_TO_GW_POLICY_CONVERSION_MOCK = 'false';

      await policyConversionCheck(
        mockContext as any,
        'A05441266',
        'PSTAR_TO_GW' as any,
        'some-token',
        loggerMock as any,
        { Authorization: 'Bearer test' },
        LoginFlowType.BEHIND_LOGIN,
        EfnolApplication.AutoEfnol1stPartyBehindLogin
      );

      expect(axiosHelperSpy).toHaveBeenCalled();
    });
  });

  it('calls the correct endpoint with efnolApplication parameter', async () => {
    await policyConversionCheck(
      mockContext as any,
      'ATX189411101',
      'PSTAR_TO_GW' as any,
      'some-token',
      loggerMock as any,
      { Authorization: 'Bearer test' },
      LoginFlowType.BEHIND_LOGIN,
      EfnolApplication.AutoEfnol1stPartyBehindLogin
    );

    expect(axiosHelperSpy).toHaveBeenCalledWith(
      expect.stringContaining(`/v2/common/policy-conversion?loginFlowType=${LoginFlowType.BEHIND_LOGIN}&efnolApplication=`),
      'some-gateway-id',
      expect.any(String),
      'some-token',
      mockContext,
      { Authorization: 'Bearer test' }
    );
  });
});
