import { IContext } from '@ace-clublabs/aws-lambda-v3';
import * as IssCommonLambda from '@ace-clublabs/iss-common-lambda-v3';
import * as IssCommonUtil from '@ace-clublabs/iss-common-util';
import { EfnolApplication, LoginFlowType } from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  CommonGatewayType,
  getCommonApiDomain,
  getCommonGatewayId
} from '@ace-clublabs/iss-common-util';
import { getClaimsSummary } from './getClaimsSummaryHelper';

jest.mock('@ace-clublabs/iss-common-util');
const loggerMock = {
  debug: jest.fn()
};

describe('getClaimsSummary', () => {
  let mockContext: IContext;
  const axiosGetHelperSpy = jest.spyOn(
    IssCommonLambda.AxiosPostHelper.prototype,
    'executeRestCallv2'
  );
  const getCommonGatewayIdSpy = jest.spyOn(IssCommonUtil, 'getCommonGatewayId');

  jest.spyOn(IssCommonUtil, 'getCommonApiDomain').mockImplementation(() => 'some-api-domain');

  beforeEach(() => {
    jest.clearAllMocks();

    mockContext = {
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function'
    } as IContext;
    getCommonGatewayIdSpy.mockImplementation(() => 'some-gateway-id');
  });

  describe('when integration gateway is ENABLED', () => {
    beforeEach(() => {
      const mockAxiosResponse = { mockRes: 'banana' };
      axiosGetHelperSpy.mockResolvedValue(mockAxiosResponse);
      jest.spyOn(IssCommonUtil, 'getCommonApiDomain').mockImplementation(() => 'some-api-domain');
    });

    it('should use v2 endpoint and correct gateway type', async () => {
      const mockIsIntegrationGatewayEnabled = true;
      const result = await getClaimsSummary(
        mockContext,
        'Bearer token',
        loggerMock as any,
        { clubCode: '123' },
        mockIsIntegrationGatewayEnabled,
        { 'Content-Type': 'application/json' },
        'ATX123456789',
        LoginFlowType.ANONYMOUS
      );

      expect(getCommonApiDomain).toHaveBeenCalledWith(mockContext.invokedFunctionArn);
      expect(getCommonGatewayId).toHaveBeenCalledWith(
        CommonGatewayType.commonInsuranceClaimsV2Services,
        mockContext.invokedFunctionArn
      );
      expect(axiosGetHelperSpy).toHaveBeenCalledWith(
        'some-api-domain/v2/common/claim/ATX123456789?loginFlowType=Anonymous',
        'some-gateway-id',
        'Bearer token',
        mockContext,
        { 'Content-Type': 'application/json' }
      );
      expect(result).toEqual({ mockRes: 'banana' });
    });

    describe('efnolApplication query parameter', () => {
      it('should append efnolApplication to v2 url when provided', async () => {
        await getClaimsSummary(
          mockContext,
          'Bearer token',
          loggerMock as any,
          { clubCode: '123' },
          true,
          { 'Content-Type': 'application/json' },
          'ATX123456789',
          LoginFlowType.ANONYMOUS,
          EfnolApplication.AutoEfnol1stPartyAnonymous
        );

        expect(axiosGetHelperSpy).toHaveBeenCalledWith(
          `some-api-domain/v2/common/claim/ATX123456789?loginFlowType=${LoginFlowType.ANONYMOUS}&efnolApplication=${EfnolApplication.AutoEfnol1stPartyAnonymous}`,
          'some-gateway-id',
          'Bearer token',
          mockContext,
          { 'Content-Type': 'application/json' }
        );
      });

      it('should keep v2 url unchanged when efnolApplication is undefined', async () => {
        await getClaimsSummary(
          mockContext,
          'Bearer token',
          loggerMock as any,
          { clubCode: '123' },
          true,
          { 'Content-Type': 'application/json' },
          'ATX123456789',
          LoginFlowType.ANONYMOUS,
          undefined
        );

        expect(axiosGetHelperSpy).toHaveBeenCalledWith(
          `some-api-domain/v2/common/claim/ATX123456789?loginFlowType=${LoginFlowType.ANONYMOUS}`,
          'some-gateway-id',
          'Bearer token',
          mockContext,
          { 'Content-Type': 'application/json' }
        );
      });
    });

    describe('timezone query parameter', () => {
      it('should append timezone to v2 url when provided', async () => {
        await getClaimsSummary(
          mockContext,
          'Bearer token',
          loggerMock as any,
          { clubCode: '123' },
          true,
          { 'Content-Type': 'application/json' },
          'ATX123456789',
          LoginFlowType.ANONYMOUS,
          undefined,
          'America/Los_Angeles'
        );

        expect(axiosGetHelperSpy).toHaveBeenCalledWith(
          `some-api-domain/v2/common/claim/ATX123456789?loginFlowType=${LoginFlowType.ANONYMOUS}&timezone=America%2FLos_Angeles`,
          'some-gateway-id',
          'Bearer token',
          mockContext,
          { 'Content-Type': 'application/json' }
        );
      });

      it('should keep v2 url unchanged when timezone is null', async () => {
        await getClaimsSummary(
          mockContext,
          'Bearer token',
          loggerMock as any,
          { clubCode: '123' },
          true,
          { 'Content-Type': 'application/json' },
          'ATX123456789',
          LoginFlowType.ANONYMOUS,
          undefined,
          null
        );

        expect(axiosGetHelperSpy).toHaveBeenCalledWith(
          `some-api-domain/v2/common/claim/ATX123456789?loginFlowType=${LoginFlowType.ANONYMOUS}`,
          'some-gateway-id',
          'Bearer token',
          mockContext,
          { 'Content-Type': 'application/json' }
        );
      });
    });
  });

  describe('when integration gateway is DISABLED', () => {
    beforeEach(() => {
      const mockAxiosResponse = { mockRes: 'apple' };
      axiosGetHelperSpy.mockResolvedValue(mockAxiosResponse);
      jest.spyOn(IssCommonUtil, 'getCommonApiDomain').mockImplementation(() => 'some-api-domain');
    });

    it('should use v1 endpoint and correct gateway type', async () => {
      const mockIsIntegrationGatewayEnabled = false;
      const result = await getClaimsSummary(
        mockContext,
        'Bearer token',
        loggerMock as any,
        { clubCode: '123' },
        mockIsIntegrationGatewayEnabled,
        { 'Content-Type': 'application/json' },
        'ATX123456789',
        LoginFlowType.ANONYMOUS
      );

      expect(getCommonApiDomain).toHaveBeenCalledWith(mockContext.invokedFunctionArn);
      expect(getCommonGatewayId).toHaveBeenCalledWith(
        CommonGatewayType.commonInsuranceClaimsThirdPartyServices,
        mockContext.invokedFunctionArn
      );
      expect(axiosGetHelperSpy).toHaveBeenCalledWith(
        'some-api-domain/v1/claims-summary',
        'some-gateway-id',
        'Bearer token',
        mockContext,
        { 'Content-Type': 'application/json' }
      );
      expect(result).toEqual({ mockRes: 'apple' });
    });
  });

  describe('additional test coverage', () => {
    describe('logging behavior', () => {
      it('should log debug message with masked headers', async () => {
        const mockAxiosResponse = { data: 'test' };
        axiosGetHelperSpy.mockResolvedValue(mockAxiosResponse);

        const requestHeaders = {
          Authorization: 'Bearer secret',
          'Content-Type': 'application/json'
        };
        const logInfo = { clubCode: '123' };

        await getClaimsSummary(
          mockContext,
          'Bearer token',
          loggerMock as any,
          logInfo,
          true,
          requestHeaders,
          'ATX123456789',
          LoginFlowType.ANONYMOUS
        );

        expect(loggerMock.debug).toHaveBeenCalledWith(
          expect.stringContaining(
            'Inside get-claims-summary url: some-api-domain/v2/common/claim/ATX123456789?loginFlowType=Anonymous gatewayId: some-gateway-id'
          ),
          expect.objectContaining({
            clubCode: '123',
            requestHeaders: expect.any(Object)
          })
        );
      });
    });

    describe('error handling', () => {
      it('should propagate errors from axiosPostHelper', async () => {
        const mockError = new Error('API call failed');
        axiosGetHelperSpy.mockRejectedValue(mockError);

        await expect(
          getClaimsSummary(
            mockContext,
            'Bearer token',
            loggerMock as any,
            { clubCode: '123' },
            true,
            { 'Content-Type': 'application/json' },
            'ATX123456789',
            LoginFlowType.ANONYMOUS
          )
        ).rejects.toThrow('API call failed');
      });
    });

    describe('function ARN handling', () => {
      it('should use context.invokedFunctionArn for domain and gateway configuration', async () => {
        const customContext = {
          invokedFunctionArn: 'arn:aws:lambda:us-west-2:987654321098:function:custom-function'
        } as IContext;

        const mockAxiosResponse = { data: 'test' };
        axiosGetHelperSpy.mockResolvedValue(mockAxiosResponse);

        await getClaimsSummary(
          customContext,
          'Bearer token',
          loggerMock as any,
          { clubCode: '123' },
          false,
          { 'Content-Type': 'application/json' },
          'ATX123456789',
          LoginFlowType.ANONYMOUS
        );

        expect(getCommonApiDomain).toHaveBeenCalledWith(customContext.invokedFunctionArn);
        expect(getCommonGatewayId).toHaveBeenCalledWith(
          CommonGatewayType.commonInsuranceClaimsThirdPartyServices,
          customContext.invokedFunctionArn
        );
      });
    });
  });
});
