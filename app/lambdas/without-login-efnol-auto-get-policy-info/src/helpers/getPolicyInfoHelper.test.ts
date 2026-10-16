import * as IssCommonLambda from '@ace-clublabs/iss-common-lambda-v3';
import { getPolicyInfo } from './getPolicyInfoHelper';
import * as AwsLambdaV3 from '@ace-clublabs/aws-lambda-v3';
// import { AxiosPostHelper } from "@ace-clublabs/iss-common-lambda-v3";
import * as IssCommonUtil from '@ace-clublabs/iss-common-util';

jest.mock('@ace-clublabs/iss-common-lambda-v3');
jest.mock('@ace-clublabs/aws-lambda-v3');
jest.mock('@ace-clublabs/iss-common-util');
const axiosHelperSpy = jest.spyOn(IssCommonLambda.AxiosPostHelper.prototype, 'executeRestCallv2');
const loggerMock = {
  debug: jest.fn()
};
const mockContext = {
  awsRequestId: 'some-request-id',
  invokedFunctionArn: 'some-function-arn'
};
const getCommonGatewayIdSpy = jest.spyOn(IssCommonUtil, 'getCommonGatewayId');
describe('getPolicyInfoHelper', () => {
  beforeEach(() => {
    axiosHelperSpy.mockImplementation(async () => ({
      effective_date: '01/01/1980',
      expiration_date: '01/01/1980'
    }));
    jest.spyOn(IssCommonUtil, 'getCommonApiDomain').mockImplementation(() => 'some-api-domain');
    getCommonGatewayIdSpy.mockImplementation(() => 'some-gateway-id');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('executes a remote call to the expected endpoint', async () => {
    const response = await getPolicyInfo(
      mockContext as any,
      'some-policy-number',
      'some-token',
      loggerMock as any,
      { some: 'headers' }
    );

    expect(response).toEqual({
      effective_date: '01/01/1980',
      expiration_date: '01/01/1980'
    });
    expect(axiosHelperSpy).toHaveBeenCalledWith(
      'some-api-domain/anonymous/v1/policies/auto/some-policy-number/details',
      'some-gateway-id',
      'some-token',
      { awsRequestId: 'some-request-id', invokedFunctionArn: 'some-function-arn' },
      { some: 'headers' }
    );
    expect(getCommonGatewayIdSpy).toHaveBeenCalledWith('insurancepolicyinfo', 'some-function-arn');
  });
});
