import { version } from 'process';
import { PutItemCommandOutput } from '@aws-sdk/client-dynamodb';
import * as ClublabsAwsLambda from '@ace-clublabs/aws-lambda-v3';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import { dtoDeepClone, TTL } from '@ace-clublabs/iss-common-util';
import { ClaimsAuthorizationHelper } from '@ace-clublabs/iss-cci-clients';
import {
  AccessTokenHelper,
  CacheError,
  MulesoftSecretsHelper
} from '@ace-clublabs/iss-common-lambda-v3';
import { EfnolApplication, LoginFlowType } from '@ace-clublabs/iss-common-auto-efnol-models';
import { createAutoClaimBackendResponseFixture, createAutoClaimRequestFixture } from '@lib/types';
import * as commonUtils from '@lib/common-utils';
import * as LibUtility from '@lib/utility';
import * as RemoteV2 from './api/CreateClaimV2Api.remote';
import * as PolicyRetrievalAPI from './api/PolicyRetrievalAPI.remote';
import * as helpers from './helpers';
import app from './index';

process.env = {
  AD_PROXY_ACCOUNT_ID: 'some-ad-proxy-account-id',
  AWS_REGION: 'some-aws-region',
  ALLOW_AUTOPAY_FLOW: 'true'
};

// mock modules

jest.mock('@ace-clublabs/iss-common-lambda-v3');
jest.mock('@lib/common-utils');
jest.mock('@lib/utility');
jest.mock('./helpers');

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

const policyUnauthorizedSpy: jest.SpyInstance<ReturnType<typeof commonUtils.policyUnauthorized>> =
  jest.spyOn(commonUtils, 'policyUnauthorized');

const getPolicyConversionDateAllowedSpy = jest.spyOn(commonUtils, 'getPolicyConversionDateAllowed');

// set up secret spies

const accessTokenHelperSpy = jest.spyOn(AccessTokenHelper, 'verifyScopePolicy');
const adTokenHelperSpy = jest.spyOn(ClublabsAwsLambda.AdTokenHelper, 'getAdToken');
const getMulesoftSecretSpy = jest.spyOn(MulesoftSecretsHelper, 'getMulesoftSecret');

// set up utility spies
const inferClubcodeSpy: jest.SpyInstance<ReturnType<typeof LibUtility.inferClubCode>> = jest.spyOn(
  LibUtility,
  'inferClubCode'
);
const extractBehindLoginOrAnonymousPropsSpy = jest.spyOn(
  commonUtils,
  'extractBehindLoginOrAnonymousProps'
);
// set up lambda spies

const createClaimv2ApiSpy = jest.spyOn(RemoteV2, 'createAutoClaimV2');
const policyRetrievalApiSpy = jest.spyOn(PolicyRetrievalAPI, 'policyRetrievalRemoteApi');
const transformCanonicalRequestV2Spy = jest.spyOn(helpers, 'transformCanonicalRequestV2');

const errorCacheSetItemSpy = jest.spyOn(CacheError.prototype, 'setItem');

const lambdaErrorSpy: jest.SpyInstance<ReturnType<typeof commonUtils.lambdaError>> = jest.spyOn(
  commonUtils,
  'lambdaError'
);

const lambdaSuccessSpy: jest.SpyInstance<ReturnType<typeof commonUtils.lambdaSuccess>> = jest.spyOn(
  commonUtils,
  'lambdaSuccess'
);

const extractErrorDetailsSpy: jest.SpyInstance<ReturnType<typeof commonUtils.extractErrorDetails>> =
  jest.spyOn(commonUtils, 'extractErrorDetails');

const loggerSpy = jest.spyOn(MaskedLogger.prototype, 'initialize');
const authorizationHelperSpy = jest.spyOn(
  ClaimsAuthorizationHelper.prototype,
  'isPolicyAuthorizedAsync'
);
// set up mock implementations

const mockImplementations = () => {
  // authorization spies

  getAuthorizationTokenSpy.mockImplementation(() => 'some-token');
  notAuthorizedSpy.mockImplementation(() => commonUtils.noAuthorizedMockResponse);
  policyNotFoundSpy.mockImplementation(() => commonUtils.policyNotFoundMockResponse);
  policyUnauthorizedSpy.mockImplementation(() => commonUtils.policyUnauthorizedMockResponse);
  extractErrorDetailsSpy.mockReturnValue({
    errorSource: 'backend',
    backendName: 'without-login-efnol-auto-create-claim',
    message: 'Backend call failed [without-login-efnol-auto-create-claim]: Cannot create Auto claim',
    name: 'BackendCallError'
  } as any);

  getPolicyConversionDateAllowedSpy.mockImplementation(() => {
    return Promise.resolve(false);
  });

  // secrets spies

  accessTokenHelperSpy.mockImplementation(() => true);
  adTokenHelperSpy.mockImplementation(() => {
    return Promise.resolve({
      adToken: 'some-ad-token'
    });
  });
  getMulesoftSecretSpy.mockImplementation(() => {
    return Promise.resolve({
      clientId: 'some-client-id',
      clientSecret: 'some-client-secret'
    });
  });

  // utility spies
  inferClubcodeSpy.mockImplementation(() => '240' as any);

  // helper spies
  transformCanonicalRequestV2Spy.mockImplementation(req => ({
    lossDate: 'some-loss-date',
    lossTime: 'some-loss-time',
    policyNumber: 'some-policy-number'
  }));

  createAutoClaimBackendResponseWithLossDateAndLossTimeObjects = dtoDeepClone(
    createAutoClaimBackendResponseFixture
  );

  createClaimv2ApiSpy.mockImplementation(async () =>
    Promise.resolve({
      ...createAutoClaimBackendResponseWithLossDateAndLossTimeObjects,
      claimId: 'some-claim-id-123'
    })
  );

  policyRetrievalApiSpy.mockImplementation(async () =>
    Promise.resolve({
      vehicles: [
        { vehicleId: 'vehicle-1', year: '2020', make: 'Toyota', model: 'Camry' },
        { vehicleId: 'vehicle-2', year: '2018', make: 'Honda', model: 'Civic' }
      ],
      drivers: [
        { driverId: 'driver-uuid-1', firstName: 'John', lastName: 'Doe' },
        { driverId: 'driver-uuid-2', firstName: 'Jane', lastName: 'Smith' }
      ],
      insuredFullName: 'John Doe'
    } as any)
  );

  errorCacheSetItemSpy.mockImplementation(() => Promise.resolve({} as PutItemCommandOutput));

  lambdaErrorSpy.mockImplementation(() => commonUtils.mockLambdaError);

  lambdaSuccessSpy.mockImplementation(() => commonUtils.mockLambdaSuccess);

  loggerSpy.mockImplementation(() => {
    return Promise.resolve(true);
  });

  extractBehindLoginOrAnonymousPropsSpy.mockImplementation(() =>
    Promise.resolve({
      policyNumber: 'CAA047514589',
      loginFlowType: 'Anonymous' as any,
      efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
    })
  );

  authorizationHelperSpy.mockImplementation(() => Promise.resolve(true));
};

// mock data

let createAutoClaimBackendResponseWithLossDateAndLossTimeObjects;
const mockPolicyNumber = 'RIA045290824';

describe('efnol-auto-create-claim-noauth Lambda', () => {
  let cacheSetItemSpy, mockEvent;

  const mockContext = {
    awsRequestId: 'some-request-id'
  };

  beforeEach(() => {
    mockImplementations();

    const createAutoClaimBackendResponseWithLossDateAndLossTimeObjects = dtoDeepClone(
      createAutoClaimBackendResponseFixture
    );

    cacheSetItemSpy = jest.spyOn(CacheError.prototype, 'setItem');
    cacheSetItemSpy.mockImplementation(() => {
      return Promise.resolve('save cache data with some cacheId');
    });

    mockEvent = {
      resource: 'some-resource',
      path: 'some-path',
      httpMethod: 'some-http-method',
      requestContext: {
        authorizer: {
          sub: 'some-sub',
          aud: 'some-aud',
          iss: 'some-iss',
          scope: JSON.stringify([
            'some-stuff: some-policy-number-a',
            'some-stuff: some-policy-number-b'
          ]),
          clubCode: 'some-club-code',
          customerId: 'some-customer-id'
        },
        resourcePath: 'some-resource-path',
        httpMethod: 'some-http-method',
        path: 'some-path'
      },
      headers: {
        'X-Ace-Mock': 'False',
        Authorization: 'Bearer some-access-token',
        'X-Request-Id': 'some-x-request-id',
        'X-Ace-Session-Id': 'some-x-ace-session-id',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(createAutoClaimRequestFixture)
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Set up', () => {
    beforeEach(async () => {
      mockImplementations();
    });

    it('should have the X-Request-Id from the request event.header', async () => {
      mockEvent.headers = {
        'X-Request-Id': 'some-x-request-id'
      };
      await app.handler(mockEvent, mockContext);
      expect(loggerSpy).toHaveBeenCalledWith(
        {
          component: 'insurance-auto-efnol-no-auth-api',
          enableStackTraces: true,
          runtimeVersion: version,
          team: 'insurance-self-service',
          workload: 'insurance-claims'
        },
        mockContext,
        {
          'X-Request-Id': 'some-x-request-id'
        }
      );
    });

    it('should have the X-Ace-Session-Id from the request event.header', async () => {
      mockEvent.headers = { 'X-Ace-Session-Id': 'some-x-ace-session-id' };
      await app.handler(mockEvent, mockContext);
      expect(loggerSpy).toHaveBeenCalledWith(
        {
          component: 'insurance-auto-efnol-no-auth-api',
          enableStackTraces: true,
          runtimeVersion: version,
          team: 'insurance-self-service',
          workload: 'insurance-claims'
        },
        mockContext,
        {
          'X-Ace-Session-Id': 'some-x-ace-session-id'
        }
      );
    });
  });

  describe('Happy paths', () => {
    let lambdaResult;
    beforeEach(async () => {
      mockImplementations();
    });

    afterEach(async () => {
      jest.resetAllMocks();
    });

    it('should return create auto claim frontend response', async () => {
      const policyNumber = 'CAA047514589';
      mockEvent.body = JSON.stringify({
        policy: {
          policyNumber
        },
        lossDate: '2022-10-01T07:00:00.000Z',
        lossCause: 'othercomp',
        isMobileAppAccidentDetection: 'true'
      });
      lambdaResult = await app.handler(mockEvent, mockContext);
      expect(lambdaResult.statusCode).toBe(200);
      expect(lambdaResult.headers).toEqual({
        'Access-Control-Allow-Origin': '*',
        'X-Ace-RequestId': 'some-request-id',
        'X-Ace-Session-Id': 'some-session-id'
      });

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        expect.objectContaining({
          policyNumber,
          clubCode: '004',
          lossDate: '2022-10-01T07:00:00.000Z',
          lossCause: 'othercomp'
        }),
        expect.objectContaining({
          claimNumber: '005048510'
        }),
        'Create_claim'
      );
    });

    it('should log isMobileAppAccidentDetection in lambdaSuccess', async () => {
      const policyNumber = 'CAA047514589';
      mockEvent.body = JSON.stringify({
        policy: {
          policyNumber
        },
        lossDate: '2022-10-01T07:00:00.000Z',
        lossCause: 'othercomp',
        isMobileAppAccidentDetection: 'true'
      });
      lambdaResult = await app.handler(mockEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        expect.objectContaining({
          policyNumber,
          clubCode: '004',
          lossDate: '2022-10-01T07:00:00.000Z',
          lossCause: 'othercomp',
          isMobileAppAccidentDetection: 'true'
        }),
        expect.objectContaining({
          claimNumber: '005048510'
        }),
        'Create_claim'
      );
    });
  });

  describe('Authorization scenarios', () => {
    beforeEach(async () => {
      mockImplementations();
    });

    it('should return 400 is Bearer token does not exist', async () => {
      getAuthorizationTokenSpy.mockImplementation(() => '');

      const result = await app.handler(mockEvent, mockContext);

      expect(getAuthorizationTokenSpy).toBeCalledWith(mockEvent);
      expect(notAuthorizedSpy).toHaveBeenCalledWith(mockContext, undefined);
      expect(result).toEqual(commonUtils.noAuthorizedMockResponse);
    });

    it('should return 400 is policy number not exist', async () => {
      mockEvent.body = JSON.stringify({
        policy: {
          policyNumber: ''
        }
      });
      const result = await app.handler(mockEvent, mockContext);

      expect(policyNotFoundSpy).toHaveBeenCalledWith(
        mockContext,
        undefined,
        'Policy number mismatch'
      );
      expect(result).toEqual(commonUtils.policyNotFoundMockResponse);
    });

    it('should return 401 if it is not authorized', async () => {
      extractBehindLoginOrAnonymousPropsSpy.mockImplementation(() =>
        Promise.resolve({
          policyNumber: 'CAA047514589',
          loginFlowType: 'BehindLogin' as any,
          efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
          clubCode: '001'
        })
      );
      authorizationHelperSpy.mockImplementation(() => Promise.resolve(false));
      const result = await app.handler(mockEvent, mockContext);

      expect(result).toEqual(commonUtils.policyUnauthorizedMockResponse);
    });
  });

  describe('Errors', () => {
    beforeEach(async () => {
      mockImplementations();
    });

    it('will catch backend error and save the request object and error response payload into DDB ErrorCache', async () => {
      createClaimv2ApiSpy.mockImplementation(() => Promise.reject('Cannot create Auto claim'));

      await app.handler(mockEvent, mockContext);

      expect(errorCacheSetItemSpy).toBeCalledWith(
        mockEvent.headers['X-Request-Id'],
        JSON.stringify({
          request: JSON.parse(mockEvent.body),
          error: {
            errorSource: 'backend',
            backendName: 'without-login-efnol-auto-create-claim',
            message: 'Backend call failed [without-login-efnol-auto-create-claim]: Cannot create Auto claim',
            name: 'BackendCallError'
          }
        }),
        TTL.SECONDS_IN_30_DAYS
      );
    });
  });

  describe('resolvedPolicyNumber substitution', () => {
    beforeEach(async () => {
      mockImplementations();
    });

    it('uses resolvedPolicyNumber for downstream call when present in request body', async () => {
      const authPolicyNumber = 'CAA047514589';
      const resolvedPolicyNumber = 'GW-CONVERTED-999';

      extractBehindLoginOrAnonymousPropsSpy.mockImplementation(() =>
        Promise.resolve({
          policyNumber: authPolicyNumber,
          loginFlowType: 'Anonymous' as any,
          efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
        })
      );

      mockEvent.body = JSON.stringify({
        policy: {
          policyNumber: authPolicyNumber,
          resolvedPolicyNumber
        },
        lossDate: '2022-10-01T07:00:00.000Z',
        lossCause: 'othercomp'
      });

      await app.handler(mockEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        expect.objectContaining({ policyNumber: resolvedPolicyNumber }),
        expect.anything(),
        expect.anything()
      );
    });

    it('uses original policyNumber when resolvedPolicyNumber is absent', async () => {
      const policyNumber = 'CAA047514589';

      extractBehindLoginOrAnonymousPropsSpy.mockImplementation(() =>
        Promise.resolve({
          policyNumber,
          loginFlowType: 'Anonymous' as any,
          efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
        })
      );

      mockEvent.body = JSON.stringify({
        policy: { policyNumber },
        lossDate: '2022-10-01T07:00:00.000Z',
        lossCause: 'othercomp'
      });

      await app.handler(mockEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        expect.objectContaining({ policyNumber }),
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('V2 Integration Gateway', () => {
    it('calls V2 create claim and policy retrieval APIs', async () => {
      const lambdaResult = await app.handler(mockEvent, mockContext);

      expect(createClaimv2ApiSpy).toHaveBeenCalledWith(
        {
          lossDate: 'some-loss-date',
          lossTime: 'some-loss-time',
          policyNumber: 'some-policy-number'
        },
        expect.anything(),
        LoginFlowType.ANONYMOUS,
        expect.anything(),
        EfnolApplication.AutoEfnol1stPartyAnonymous
      );
      expect(lambdaResult).toEqual({
        body: '{"some":"body"}',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'X-Ace-RequestId': 'some-request-id',
          'X-Ace-Session-Id': 'some-session-id'
        },
        statusCode: 200
      });
    });

    it('returns claimNumber without claimId and includes policy retrieval data', async () => {
      let capturedResponse: any;
      lambdaSuccessSpy.mockImplementation((context, logInfo, response, metric) => {
        capturedResponse = response;
        return commonUtils.mockLambdaSuccess;
      });

      await app.handler(mockEvent, mockContext);

      expect(createClaimv2ApiSpy).toHaveBeenCalled();
      expect(policyRetrievalApiSpy).toHaveBeenCalled();

      expect(capturedResponse).toBeDefined();
      expect(capturedResponse.claimNumber).toBeDefined();
      expect(capturedResponse.claimId).toBeUndefined();
      expect(capturedResponse.vehicleSummaries).toBeDefined();
      expect(capturedResponse.driverSummaries).toBeDefined();
    });

    it('should set the insuredFullName in the response', async () => {
      await app.handler(mockEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        expect.anything(),
        expect.objectContaining({
          insuredFullName: 'John Doe'
        }),
        'Create_claim'
      );
    });
  });

  describe('Parallel API calls', () => {
    beforeEach(async () => {
      mockImplementations();
    });

    it('should call createAutoClaimV2 and policyRetrievalRemoteApi in parallel using Promise.all', async () => {
      const promiseAllSpy = jest.spyOn(Promise, 'all');

      await app.handler(mockEvent, mockContext);

      // Verify Promise.all was called
      expect(promiseAllSpy).toHaveBeenCalledTimes(1);

      // Verify both APIs were called
      expect(createClaimv2ApiSpy).toHaveBeenCalledTimes(1);
      expect(policyRetrievalApiSpy).toHaveBeenCalledTimes(1);

      promiseAllSpy.mockRestore();
    });
  });
});
