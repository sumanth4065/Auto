import process, { version } from 'process';
import StatusCode from 'status-code-enum';
import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll
} from '@jest/globals';
import { Logger, Uuid } from '@ace-clublabs/aws-lambda-v3';
import * as CommonLambda from '@ace-clublabs/iss-common-lambda-v3';
import { Cache } from '@ace-clublabs/iss-common-lambda-v3';
import { getReferrerUrl } from '@lib/common-utils';
import app, { getCacheExpiration } from './index';

process.env.REFERRER_URL = 'https://appdev1.ace.aaa.com/insurance/auto/efnol';
process.env.LOCAL = 'true';
jest.mock('@ace-clublabs/iss-common-lambda-v3', () => ({
  __esModule: true,
  ...(jest.requireActual('@ace-clublabs/iss-common-lambda-v3') as {
    [key: string]: any;
  })
}));
jest.mock('@ace-clublabs/iss-common-util', () => ({
  __esModule: true,
  ...(jest.requireActual('@ace-clublabs/iss-common-util') as {
    [key: string]: any;
  })
}));
const mockGetPolicyPrefixAllowed = jest.fn<(logger: any, policyPrefix: string) => Promise<boolean>>().mockResolvedValue(true);
jest.mock('@lib/common-utils', () => ({
  __esModule: true,
  ...(jest.requireActual('@lib/common-utils') as {
    [key: string]: any;
  }),
  getReferrerUrl: jest.fn(),
  SplitIOHelper: {
    getPolicyPrefixAllowed: (logger, policyPrefix) => mockGetPolicyPrefixAllowed(logger, policyPrefix)
  }
}));

describe('flow-director', () => {
  const mockGuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  let eventQueryParams = {
    transactionId: 'some-transaction-id'
  };
  let pathQueryParams = {
    id: 'some-cache-id'
  };

  let mockCacheObject, mockCacheObjectB1;

  const expiryTime = 86400;

  let loggerSpy, getCacheSpy, setCacheSpy;
  const cacheExpirationTime = getCacheExpiration();
  let mockHeaders = {
    'Access-Control-Allow-Origin': '*',
    Authorization: 'someAuthorization',
    'X-Ace-RequestId': 'some-request-id',
    'X-Ace-Session-Id': undefined
  };

  beforeEach(() => {
    jest.spyOn(Uuid, 'getId').mockReturnValue(mockGuid);
  });

  describe('missing body guard', () => {
    it('should return 400 when request body is missing', async () => {
      const result = await app.handler(
        { headers: mockHeaders, body: null },
        { awsRequestId: 'some-request-id' }
      );
      expect(result.statusCode).toStrictEqual(400);
    });
  });

  describe('valid efnol-auto-flow-director Lambda case 1', function () {
    let mockPayload =
      'policy=CAA019550002&claim=someClaim&clubCode=someClubCode&testRegion=A1';
    let authorization = {
      Authorization: 'someAuthorization'
    };

    let mockContext = {
      awsRequestId: 'some-request-id'
    };

    mockCacheObject = {
      policy: 'CAA019550002',
      claim: 'someClaim',
      clubCode: 'someClubCode',
      testRegion: 'A1'
    };

    mockCacheObjectB1 = {
      policy: 'CAA019550002',
      claim: 'someClaim',
      clubCode: 'someClubCode',
      testRegion: 'B1'
    };

    beforeEach(() => {
      loggerSpy = jest.spyOn(Logger.prototype, 'initialize');
      loggerSpy.mockImplementation(() => {
        return Promise.resolve(true);
      });
      (getReferrerUrl as jest.Mock).mockReturnValue(
        'https://appdev1.ace.aaa.com/insurance/auto/file-a-claim/behindlogin'
      );
      mockGetPolicyPrefixAllowed.mockResolvedValue(true);
      getCacheSpy = jest
        .spyOn(Cache.prototype, 'findItem')
        .mockReturnValue(null);
      setCacheSpy = jest.spyOn(Cache.prototype, 'setItem');
    });
    beforeAll(() => jest.setTimeout(90 * 1000));
    afterEach(() => {
      jest.resetAllMocks();
    });
    afterAll(() => jest.setTimeout(5 * 1000));

    it('should return a status 500 if fail to retrieve cache data', async () => {
      const result = await app.handler(
        {
          headers: authorization,
          queryStringParameters: {},
          pathParameters: {},
          body: mockPayload
        },
        mockContext
      );
      expect(result.statusCode).toStrictEqual(500);
    });

    it('should have the X-Request-Id from the request event.header', async () => {
      await app.handler(
        {
          headers: {
            'X-Request-Id': 'some-x-request-id'
          },
          queryStringParameters: eventQueryParams,
          pathParameters: pathQueryParams
        },
        mockContext
      );

      expect(loggerSpy).toBeCalledWith(
        {
          component: 'insurance-auto-efnol-api',
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
      await app.handler(
        {
          headers: {
            'X-Ace-Session-Id': 'some-x-ace-session-id'
          },
          queryStringParameters: eventQueryParams,
          pathParameters: pathQueryParams
        },
        mockContext
      );

      expect(loggerSpy).toBeCalledWith(
        {
          component: 'insurance-auto-efnol-api',
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

    it('should cache the payload from the POST body for A1 test region.', async () => {
      const getCache1Spy = jest
        .spyOn(Cache.prototype, 'findItem')
        .mockReturnValue(null);
      const setCache1Spy = jest.spyOn(Cache.prototype, 'setItem');
      await app.handler(
        {
          headers: authorization,
          queryStringParameters: {},
          pathParameters: {},
          body: mockPayload
        },
        mockContext
      );
      expect(getCache1Spy).toBeCalledTimes(0);
      expect(setCache1Spy).toBeCalledWith(
        mockGuid,
        JSON.stringify(mockCacheObject),
        expiryTime
      );
    });
    it('should cache the payload from the POST body for B1 test region.', async () => {
      const mockPayloadB1 =
        'policy=CAA019550002&claim=someClaim&clubCode=someClubCode&testRegion=B1';
      const getCache1Spy = jest
        .spyOn(Cache.prototype, 'findItem')
        .mockReturnValue(null);
      const setCache1Spy = jest.spyOn(Cache.prototype, 'setItem');
      await app.handler(
        {
          headers: authorization,
          queryStringParameters: {},
          pathParameters: {},
          body: mockPayloadB1
        },
        mockContext
      );
      expect(getCache1Spy).toBeCalledTimes(0);
      expect(setCache1Spy).toBeCalledWith(
        mockGuid,
        JSON.stringify(mockCacheObjectB1),
        expiryTime
      );
    });
  });

  describe('valid efnol-auto-flow-director Lambda case 2', function () {
    let mockPayload =
      'policy=CAA104952527&claim=someClaim&clubCode=someClubCode&testRegion=A1';

    let authorization = {
      Authorization: 'someAuthorization'
    };

    let mockContext = {
      awsRequestId: 'some-request-id'
    };

    mockCacheObject = {
      policy: 'CAA019550002',
      claim: 'someClaim',
      clubCode: 'someClubCode',
      testRegion: 'A1'
    };
    beforeEach(() => {
      (getReferrerUrl as jest.Mock).mockReturnValue(
        'https://appdev1.ace.aaa.com/insurance/auto/file-a-claim/behindlogin'
      );
      mockGetPolicyPrefixAllowed.mockResolvedValue(true);
      getCacheSpy = jest
        .spyOn(Cache.prototype, 'findItem')
        .mockReturnValue(null);
      setCacheSpy = jest.spyOn(Cache.prototype, 'setItem');
    });
    beforeAll(async () => jest.setTimeout(90 * 1000));
    afterEach(() => {
      jest.resetAllMocks();
    });
    afterAll(async () => jest.setTimeout(5 * 1000));

    it('should cache the payload from the POST body', async () => {
      await app.handler(
        {
          headers: authorization,
          queryStringParameters: {},
          pathParameters: {},
          body: mockPayload
        },
        mockContext
      );
      mockCacheObject.policy = 'CAA104952527';
      expect(getCacheSpy).toBeCalledTimes(0);
      expect(setCacheSpy).toBeCalledTimes(1);
      expect(setCacheSpy).toBeCalledWith(
        mockGuid,
        JSON.stringify(mockCacheObject),
        expiryTime
      );
    });
  });

  describe('disallowed policy prefix in efnol-auto-flow-director Lambda case', function () {
    let mockPayload =
      'policy=WMK104952527&claim=someClaim&clubCode=someClubCode&testRegion=A1';

    let authorization = {
      Authorization: 'someAuthorization'
    };

    let mockContext = {
      awsRequestId: 'some-request-id'
    };
    beforeEach(() => {
      mockGetPolicyPrefixAllowed.mockResolvedValue(false);
      getCacheSpy = jest
        .spyOn(Cache.prototype, 'findItem')
        .mockReturnValue(null);
      setCacheSpy = jest.spyOn(Cache.prototype, 'setItem');
    });
    beforeAll(async () => jest.setTimeout(90 * 1000));
    afterEach(() => {
      jest.resetAllMocks();
    });
    afterAll(async () => jest.setTimeout(5 * 1000));

    it('response should return 404 when policy prefix is not allowed by feature flag', async () => {
      const getCache2Spy = jest
        .spyOn(Cache.prototype, 'findItem')
        .mockReturnValue(null);
      const setCache2Spy = jest.spyOn(Cache.prototype, 'setItem');
      const result = await app.handler(
        {
          headers: authorization,
          queryStringParameters: {},
          pathParameters: {},
          body: mockPayload
        },
        mockContext
      );

      expect(getCache2Spy).toBeCalledTimes(0);
      expect(setCache2Spy).toBeCalledTimes(0);
      expect(result.statusCode).toStrictEqual(404);
      expect(result.body).toContain('is not allowed to load Auto EFNOL');
    });
  });

  describe('redirectMode support', function () {
    let authorization = {
      Authorization: 'someAuthorization'
    };

    let mockContext = {
      awsRequestId: 'some-request-id'
    };

    beforeEach(() => {
      jest.spyOn(Cache.prototype, 'findItem').mockReturnValue(null);
      jest.spyOn(Cache.prototype, 'setItem').mockReturnValue(null);
      jest
        .spyOn(CommonLambda, 'extractTestRegionFromProxyRequest')
        .mockReturnValue('A1');
      (getReferrerUrl as jest.Mock).mockReturnValue(
        'https://appdev1.ace.aaa.com/insurance/auto/file-a-claim/behindlogin'
      );
      mockGetPolicyPrefixAllowed.mockResolvedValue(true);
      delete process.env.ENABLE_SPLASH;
      delete process.env.SPLASH_START;
      delete process.env.SPLASH_END;
    });
    beforeAll(async () => jest.setTimeout(90 * 1000));
    afterEach(() => {
      jest.resetAllMocks();
    });
    afterAll(async () => jest.setTimeout(5 * 1000));

    it('should return 302 redirect with Success body when redirectMode is not specified', async () => {
      const mockPayload =
        'policy=CAA104952527&claim=someClaim&clubCode=someClubCode';

      const result = await app.handler(
        {
          headers: authorization,
          queryStringParameters: {},
          pathParameters: {},
          body: mockPayload
        },
        mockContext
      );

      expect(result.statusCode).toEqual(302);
      expect(result.body).toEqual(JSON.stringify('Success'));
    });

    it('should return 200 OK with redirectUrl in body when redirectMode=manual', async () => {
      const mockPayload =
        'policy=CAA104952527&claim=someClaim&clubCode=someClubCode&redirectMode=manual';

      const result = await app.handler(
        {
          headers: authorization,
          queryStringParameters: {},
          pathParameters: {},
          body: mockPayload
        },
        mockContext
      );

      const expectedRedirectUrl = `https://appdev1.ace.aaa.com/insurance/auto/file-a-claim/behindlogin/${mockGuid}?clubCode=someClubCode`;
      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body)).toEqual({
        redirectUrl: expectedRedirectUrl
      });
      expect(result.headers.Location).toEqual(expectedRedirectUrl);
    });
  });

  describe('isMobileApp redirect URL forwarding', function () {
    let authorization = { Authorization: 'someAuthorization' };
    let mockContext = { awsRequestId: 'some-request-id' };

    beforeEach(() => {
      jest.spyOn(Cache.prototype, 'findItem').mockReturnValue(null);
      jest.spyOn(Cache.prototype, 'setItem').mockReturnValue(null);
      jest
        .spyOn(CommonLambda, 'extractTestRegionFromProxyRequest')
        .mockReturnValue('A1');
      (getReferrerUrl as jest.Mock).mockReturnValue(
        'https://appdev1.ace.aaa.com/insurance/auto/file-a-claim/behindlogin'
      );
      mockGetPolicyPrefixAllowed.mockResolvedValue(true);
      delete process.env.ENABLE_SPLASH;
    });
    beforeAll(async () => jest.setTimeout(90 * 1000));
    afterEach(() => jest.resetAllMocks());
    afterAll(async () => jest.setTimeout(5 * 1000));

    it('should append isMobileApp=true to redirect URL when isMobileApp is true', async () => {
      const mockPayload =
        'policy=CAA104952527&clubCode=someClubCode&isMobileApp=true&redirectMode=manual';

      const result = await app.handler(
        {
          headers: authorization,
          queryStringParameters: {},
          pathParameters: {},
          body: mockPayload
        },
        mockContext
      );

      expect(result.statusCode).toEqual(200);
      const { redirectUrl } = JSON.parse(result.body);
      expect(redirectUrl).toContain('isMobileApp=true');
    });

    it('should not append isMobileApp to redirect URL when isMobileApp is absent from the payload', async () => {
      const mockPayload =
        'policy=CAA104952527&clubCode=someClubCode&redirectMode=manual';

      const result = await app.handler(
        {
          headers: authorization,
          queryStringParameters: {},
          pathParameters: {},
          body: mockPayload
        },
        mockContext
      );

      expect(result.statusCode).toEqual(200);
      const { redirectUrl } = JSON.parse(result.body);
      expect(redirectUrl).not.toContain('isMobileApp');
    });

    it('should include both isMobileApp=true and isMobileAppAccidentDetection in redirect URL when both are set', async () => {
      const mockPayload =
        'policy=CAA104952527&clubCode=someClubCode&isMobileApp=true&isMobileAppAccidentDetection=true&crashDatePrediction=unknown&redirectMode=manual';

      const result = await app.handler(
        {
          headers: authorization,
          queryStringParameters: {},
          pathParameters: {},
          body: mockPayload
        },
        mockContext
      );

      expect(result.statusCode).toEqual(200);
      const { redirectUrl } = JSON.parse(result.body);
      expect(redirectUrl).toContain('isMobileAppAccidentDetection=true');
      expect(redirectUrl).toContain('isMobileApp=true');
    });
  });

  describe('isMobileApp testRegion resolution', function () {
    let authorization = { Authorization: 'someAuthorization' };
    let mockContext = { awsRequestId: 'some-request-id' };

    beforeEach(() => {
      jest.spyOn(Cache.prototype, 'findItem').mockReturnValue(null);
      jest.spyOn(Cache.prototype, 'setItem').mockReturnValue(null);
      mockGetPolicyPrefixAllowed.mockResolvedValue(true);
      delete process.env.ENABLE_SPLASH;
    });
    beforeAll(async () => jest.setTimeout(90 * 1000));
    afterEach(() => jest.resetAllMocks());
    afterAll(async () => jest.setTimeout(5 * 1000));

    it('should not default testRegion to A1 when isMobileApp=true and domain is prod', async () => {
      jest
        .spyOn(CommonLambda, 'extractTestRegionFromProxyRequest')
        .mockReturnValue(null);
      (getReferrerUrl as jest.Mock).mockReturnValue(
        'https://app.ace.aaa.com/insurance/auto/file-a-claim/behindlogin'
      );

      const mockPayload =
        'policy=CAA104952527&clubCode=someClubCode&isMobileApp=true&redirectMode=manual';

      const result = await app.handler(
        {
          headers: authorization,
          queryStringParameters: {},
          pathParameters: {},
          body: mockPayload,
          requestContext: { domainName: 'execute-api.prod.amazonaws.com' }
        },
        mockContext
      );

      // getReferrerUrl should have been called with empty testRegion (not 'A1')
      expect(getReferrerUrl).toHaveBeenCalledWith(
        expect.anything(),
        ''
      );
      expect(result.statusCode).toEqual(200);
    });

    it('should default testRegion to A1 when isMobileApp is absent and no testRegion provided', async () => {
      jest
        .spyOn(CommonLambda, 'extractTestRegionFromProxyRequest')
        .mockReturnValue(null);
      (getReferrerUrl as jest.Mock).mockReturnValue(
        'https://appdev1.ace.aaa.com/insurance/auto/file-a-claim/behindlogin'
      );

      const mockPayload =
        'policy=CAA104952527&clubCode=someClubCode&redirectMode=manual';

      await app.handler(
        {
          headers: authorization,
          queryStringParameters: {},
          pathParameters: {},
          body: mockPayload
        },
        mockContext
      );

      expect(getReferrerUrl).toHaveBeenCalledWith(
        expect.anything(),
        'A1'
      );
    });
  });
});
