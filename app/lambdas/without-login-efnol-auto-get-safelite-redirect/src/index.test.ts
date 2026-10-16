import { Secrets } from '@ace-clublabs/aws-lambda-v3';
import { EfnolApplication } from '@ace-clublabs/iss-common-auto-efnol-models';
import * as ClublabsCommonLambda from '@ace-clublabs/iss-common-lambda-v3';
import { LambdaHelper, Metrics, EncryptionAlgorithmType } from '@ace-clublabs/iss-common-lambda-v3';
import { DateHelper, ITenant, PolicyTypeAndTenantHelper } from '@ace-clublabs/iss-common-util';
import * as commonUtils from '@lib/common-utils';
import { AutoEfnolLoggerOptions } from '@lib/common-utils';
import { LoginFlowType } from '@lib/shared-contracts';
import { baseEvent } from '@lib/types';
import * as LibUtility from '@lib/utility';

import { mockContext, RSAKey, SAFELITE_CLIENT_TAG, SAFELITE_REDIRECT, SAFELITE_CLIENT_TAG_WINSURANCE, SAFELITE_REDIRECT_WINSURANCE } from './fixtures';
import app from './index';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import { ClaimsAuthorizationHelper, ClientApplication } from '@ace-clublabs/iss-cci-clients';

// mock modules

jest.mock('@ace-clublabs/iss-common-lambda-v3');
jest.mock('@ace-clublabs/iss-common-util', () => {
  const actual = jest.requireActual('@ace-clublabs/iss-common-util');
  return {
    ...actual,
    DateHelper: {
      ...actual.DateHelper,
      formatYYYYMMDDHHMMSS: jest.fn()
    }
  };
});
jest.mock('@lib/common-utils');
jest.mock('@lib/utility');
jest.mock('@ace-clublabs/aws-lambda-logger');
jest.mock('@ace-clublabs/iss-cci-clients');

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

const extractBehindLoginOrAnonymousPropsSpy: jest.SpyInstance<
  ReturnType<typeof commonUtils.extractBehindLoginOrAnonymousProps>
> = jest.spyOn(commonUtils, 'extractBehindLoginOrAnonymousProps');

const getRequestHeadersSpy: jest.SpyInstance<ReturnType<typeof commonUtils.getRequestHeaders>> =
  jest.spyOn(commonUtils, 'getRequestHeaders');

const inferClubCodeSpy = jest.spyOn(LibUtility, 'inferClubCode');
const getPolicyPrefixSpy = jest.spyOn(commonUtils, 'getPolicyPrefix');

// set up lambda spies

const dateHelperSpy = jest.spyOn(DateHelper, 'formatYYYYMMDDHHMMSS');

const cryptoSpy = jest.spyOn(
  ClublabsCommonLambda.CryptoHelper,
  'GetEncodedSignatureWithBase64AndURI'
);

const lambdaSuccessSpy: jest.SpyInstance<ReturnType<typeof commonUtils.lambdaSuccess>> = jest.spyOn(
  commonUtils,
  'lambdaSuccess'
);

// set up mock implementations

const loggerMockInstance = {
  initialize: jest.fn().mockResolvedValue(true),
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  getClientContext: jest.fn(() => ({
    correlationId: 'someCorrelationId',
    sessionId: 'someSessionId'
  }))
};

const mockAuthorizationHelper = {
  isPolicyAuthorizedAsync: jest.fn().mockResolvedValue(true)
};

const setupMocks = () => {
  (MaskedLogger.getInstance as jest.Mock).mockReturnValue(loggerMockInstance);
  (ClaimsAuthorizationHelper as jest.Mock).mockImplementation(() => mockAuthorizationHelper);
  (ClientApplication as unknown as Record<string, string>).AUTO_CLAIMS = 'AUTO_CLAIMS';

  // Ensure CryptoHelper method exists for the spy to work
  if (!ClublabsCommonLambda.CryptoHelper.GetEncodedSignatureWithBase64AndURI) {
    (ClublabsCommonLambda.CryptoHelper as any).GetEncodedSignatureWithBase64AndURI = jest.fn();
  }

  // Ensure EncryptionAlgorithmType enum has the expected value
  (EncryptionAlgorithmType as unknown as Record<string, string>).RSA_SHA256 = 'RSA_SHA256';

  if (LambdaHelper.response) {
    (LambdaHelper.response as jest.Mock).mockImplementation(config => ({
      statusCode: config.statusCode,
      headers: config.headers,
      body: config.body
    }));
  }

  // authorization spies
  getAuthorizationTokenSpy.mockImplementation(() => 'some-token');
  notAuthorizedSpy.mockImplementation(() => commonUtils.noAuthorizedMockResponse);
  policyNotFoundSpy.mockImplementation(() => commonUtils.policyNotFoundMockResponse);
  policyUnauthorizedSpy.mockImplementation(() => commonUtils.policyUnauthorizedMockResponse);
  getRequestHeadersSpy.mockReturnValue({});
  inferClubCodeSpy.mockReturnValue('240' as any);
  getPolicyPrefixSpy.mockReturnValue('RIA');
  mockAuthorizationHelper.isPolicyAuthorizedAsync.mockResolvedValue(true);

  // lambda spies
  cryptoSpy.mockReturnValue(
    // value comes from CryptoHelper.test.ts' commented signature.toString('base64')
    'some-crypto'
  );

  dateHelperSpy.mockReturnValue('20221116233441');

  extractBehindLoginOrAnonymousPropsSpy.mockResolvedValue({
    policyNumber: mockPolicyNumber,
    loginFlowType: LoginFlowType.ANONYMOUS,
    efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
  });
};

// set up variables

const mockPolicyNumber = 'RIA045290824';
const mockPolicyGuid = 'Ukl-BMD-Q1M-jkw-ODI-0';
const mockQueryStringParameters = { policyGuid: mockPolicyGuid };
const mockLogInfo = {
  clubCode: '240',
  policyGuid: mockPolicyGuid,
  policyNumber: mockPolicyNumber,
  loginFlowType: LoginFlowType.ANONYMOUS,
  efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous,
  policyPrefix: 'RIA',
  policyTenant: 'GUIDEWIRE'
};
let mockEvent;

describe('efnol-auto-get-safelite-redirect-v2', () => {
  let secretManagerSpy;
  beforeEach(() => {
    mockEvent = JSON.parse(JSON.stringify(baseEvent));
    mockEvent.queryStringParameters = mockQueryStringParameters;
    process.env = {
      SAFELITE_CLIENT_TAG,
      SAFELITE_REDIRECT,
      SAFELITE_CLIENT_TAG_WINSURANCE,
      SAFELITE_REDIRECT_WINSURANCE
    };

    secretManagerSpy = jest.spyOn(Secrets.prototype, 'getSecretValue');
    secretManagerSpy.mockImplementation(() => {
      return Promise.resolve({
        ARN: 'some-arn',
        CreatedDate: '0123456789',
        Name: 'service/safelite/authentication/RSAKey',
        SecretBinary: '0912',
        SecretString: RSAKey,
        VersionId: 'some-version',
        VersionStages: ['some-version-stage']
      });
    });

    setupMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('helpers', () => {
    it('should have the X-Request-Id, X-Ace-Session-Id from the request event.header', async () => {
      await app.handler(mockEvent, mockContext);

      expect(loggerMockInstance.initialize).toHaveBeenCalledWith(
        AutoEfnolLoggerOptions,
        mockContext,
        {
          'X-Ace-Correlation-Id': 'someCorrelationId',
          'X-Ace-Mock': false,
          'X-Ace-Session-Id': 'someSessionId',
          'X-Request-Id': 'someRequestId',
          Accept: '*/*',
          Authorization: 'Bearer super-secret-jwt-token',
          Host: 'api.uat.clublabs.net'
        }
      );
    });

    it('should call aws secret manager to get a public RSA key of Safelite.', async () => {
      await app.handler(mockEvent, mockContext);

      expect(secretManagerSpy).toBeCalledWith('service/safelite/authentication/RSAKey');
    });

    it('should call CryptoHelper to get signature', async () => {
      await app.handler(mockEvent, mockContext);
      expect(cryptoSpy).toBeCalledTimes(1);
    });
  });

  describe('Error Scenarios', () => {
    beforeEach(() => {});

    it('should return 200 and an unauthenticated safelite URL (no token/signature embedded) when RSAKey is not found', async () => {
      secretManagerSpy.mockImplementationOnce(() => {
        return Promise.resolve({
          ARN: 'some-arn',
          CreatedDate: '0123456789',
          Name: 'service/safelite/authentication/RSAKey',
          SecretBinary: '0912',
          SecretString: undefined,
          VersionId: 'some-version',
          VersionStages: ['some-version-stage']
        });
      });

      await app.handler(mockEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        mockLogInfo,
        {
          safeliteRedirectUrl: `some-safelite-redirect?ClientTag=some-safelite-client-tag`,
          safeliteRedirectMessage: 'Success'
        },
        Metrics.AutoGetSafeliteRediretURL
      );
    });

    it('should return status 200 and a safelite redirect URL if fail to retrieve secrets', async () => {
      secretManagerSpy.mockImplementation(() => {
        return Promise.reject({});
      });

      await app.handler(mockEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        mockLogInfo,
        {
          safeliteRedirectUrl: `some-safelite-redirect?ClientTag=some-safelite-client-tag`,
          safeliteRedirectMessage: 'Success'
        },
        Metrics.AutoGetSafeliteRediretURL
      );
    });

    it('should return 401 if policy is not authorized', async () => {
      // Authorization check only runs for BEHIND_LOGIN flow
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValue({
        policyNumber: mockPolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
        clubCode: '001'
      });
      mockAuthorizationHelper.isPolicyAuthorizedAsync.mockResolvedValue(false);

      const result = await app.handler(mockEvent, mockContext);

      expect(policyUnauthorizedSpy).toHaveBeenCalledWith(mockContext, {
        ...mockLogInfo,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin
      });
      expect(result).toEqual(commonUtils.policyUnauthorizedMockResponse);
      expect(result.statusCode).toBe(401);
    });
  });

  describe('Success Scenario', () => {
    beforeEach(() => {
      lambdaSuccessSpy.mockImplementation(() => commonUtils.mockLambdaSuccess);
    });

    it('should return correct Safelite url', async () => {
      await app.handler(mockEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        mockLogInfo,
        {
          safeliteRedirectUrl: `some-safelite-redirect?ClientTag=some-safelite-client-tag&PolicyNumber=${mockPolicyNumber}&Token=20221116233441%7C${mockPolicyNumber}&Signature=some-crypto`,
          safeliteRedirectMessage: 'Success'
        },
        Metrics.AutoGetSafeliteRediretURL
      );
    });

    it('should return 200 and a safelite redirect URL if policy is authorized', async () => {
      mockAuthorizationHelper.isPolicyAuthorizedAsync.mockResolvedValue(true);

      const result = await app.handler(mockEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        mockLogInfo,
        expect.objectContaining({
          safeliteRedirectUrl: expect.any(String),
          safeliteRedirectMessage: 'Success'
        }),
        Metrics.AutoGetSafeliteRediretURL
      );
      expect(result).toEqual(commonUtils.mockLambdaSuccess);
      expect(result.statusCode).toBe(200);
    });
  });

  describe('Brand credential selection', () => {
    beforeEach(() => {
      lambdaSuccessSpy.mockImplementation(() => commonUtils.mockLambdaSuccess);
    });

    it('should use WInsurance env vars when brand=WInsurance', async () => {
      const winsuranceEvent = JSON.parse(JSON.stringify(mockEvent));
      winsuranceEvent.queryStringParameters = { ...mockQueryStringParameters, brand: 'WInsurance' };

      await app.handler(winsuranceEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        expect.anything(),
        expect.objectContaining({
          safeliteRedirectUrl: expect.stringContaining(`${SAFELITE_REDIRECT_WINSURANCE}?ClientTag=${SAFELITE_CLIENT_TAG_WINSURANCE}`)
        }),
        Metrics.AutoGetSafeliteRediretURL
      );
    });

    it('should use AAA env vars when brand is not WInsurance', async () => {
      const aaaEvent = JSON.parse(JSON.stringify(mockEvent));
      aaaEvent.queryStringParameters = { ...mockQueryStringParameters, brand: 'AAA' };

      await app.handler(aaaEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        expect.anything(),
        expect.objectContaining({
          safeliteRedirectUrl: expect.stringContaining(`${SAFELITE_REDIRECT}?ClientTag=${SAFELITE_CLIENT_TAG}`)
        }),
        Metrics.AutoGetSafeliteRediretURL
      );
    });

    it('should default to AAA env vars when brand is absent', async () => {
      await app.handler(mockEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        expect.anything(),
        expect.objectContaining({
          safeliteRedirectUrl: expect.stringContaining(`${SAFELITE_REDIRECT}?ClientTag=${SAFELITE_CLIENT_TAG}`)
        }),
        Metrics.AutoGetSafeliteRediretURL
      );
    });

    it('should not crash and return backup redirect URL when WInsurance env vars are missing', async () => {
      delete process.env.SAFELITE_REDIRECT_WINSURANCE;
      delete process.env.SAFELITE_CLIENT_TAG_WINSURANCE;

      const winsuranceEvent = JSON.parse(JSON.stringify(mockEvent));
      winsuranceEvent.queryStringParameters = { ...mockQueryStringParameters, brand: 'WInsurance' };

      await app.handler(winsuranceEvent, mockContext);

      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        expect.anything(),
        expect.objectContaining({
          safeliteRedirectUrl: expect.stringContaining('https://submittest.glassclaim.com/SelfService/Default.aspx'),
          safeliteRedirectMessage: 'Success'
        }),
        Metrics.AutoGetSafeliteRediretURL
      );
      const actualUrl = lambdaSuccessSpy.mock.calls[0][2].safeliteRedirectUrl;
      expect(actualUrl).not.toContain('undefined');
      expect(actualUrl).not.toContain('ClientTag=');
      expect(actualUrl).toMatch(/\?&?PolicyNumber=/);
    });
  });

  describe('Anonymous vs Behind-Login flows', () => {
    beforeEach(() => {
      lambdaSuccessSpy.mockImplementation(() => commonUtils.mockLambdaSuccess);
    });

    it('returns policyNotFound when policyNumber cannot be resolved', async () => {
      const eventWithoutGuid = { ...mockEvent };
      eventWithoutGuid.queryStringParameters = { policyGuid: undefined };
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValueOnce({
        policyNumber: null as any,
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
      });

      await app.handler(eventWithoutGuid, mockContext);

      expect(extractBehindLoginOrAnonymousPropsSpy).toHaveBeenCalledWith(null, 'some-token');
      expect(policyNotFoundSpy).toHaveBeenCalled();
    });

    it('handles behind-login flow with GUID policyGuid', async () => {
      const behindLoginPolicyGuid = 'abc-123-def-456-ghi-7';
      const behindLoginEvent = { ...mockEvent };
      behindLoginEvent.queryStringParameters = { policyGuid: behindLoginPolicyGuid };

      await app.handler(behindLoginEvent, mockContext);

      expect(extractBehindLoginOrAnonymousPropsSpy).toHaveBeenCalledWith(
        behindLoginPolicyGuid,
        'some-token'
      );
      expect(lambdaSuccessSpy).toHaveBeenCalled();
    });
  });
});
