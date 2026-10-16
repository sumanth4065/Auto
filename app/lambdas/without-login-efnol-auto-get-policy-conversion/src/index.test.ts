import { ConversionType } from '@ace-clublabs/iss-common-shared-claims-models';
import * as commonUtils from '@lib/common-utils';
import { BackendCallError } from '@lib/common-utils';
import { baseEvent } from '@lib/types';
import * as Helpers from './helpers';
import app from './index';

var mockGetTreatment: jest.Mock;

// ── Module mocks ──────────────────────────────────────────────────────────────

jest.mock('@lib/common-utils', () => ({
  ...jest.genMockFromModule<typeof import('@lib/common-utils')>('@lib/common-utils'),
  BackendCallError: jest.requireActual('@lib/common-utils').BackendCallError
}));

jest.mock('@ace-clublabs/aws-lambda-logger', () => ({
  MaskedLogger: {
    getInstance: jest.fn(() => ({
      initialize: jest.fn().mockResolvedValue(true),
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      getClientContext: jest.fn(() => ({
        correlationId: 'someCorrelationId',
        sessionId: 'someSessionId'
      }))
    }))
  }
}));

jest.mock('@ace-clublabs/feature-flags', () => {
  mockGetTreatment = jest.fn().mockResolvedValue({ treatment: 'on' });

  return {
    NodeFeatureFlagClient: jest.fn(),
    SecretsManagerKeyProvider: jest.fn(),
    FeatureFlagService: jest.fn(() => ({
      getTreatment: mockGetTreatment
    })),
    Features: {
      AutoEFNOLPStarConversionCheck: 'AutoEFNOLPStarConversionCheck',
      EFNOLPStarConversionStates: 'EFNOLPStarConversionStates'
    }
  };
});

jest.mock('./helpers');

// ── Spies ─────────────────────────────────────────────────────────────────────

const getAuthorizationTokenSpy: jest.SpyInstance<
  ReturnType<typeof commonUtils.getAuthorizationToken>
> = jest.spyOn(commonUtils, 'getAuthorizationToken');

const notAuthorizedSpy: jest.SpyInstance<ReturnType<typeof commonUtils.notAuthorized>> = jest.spyOn(
  commonUtils,
  'notAuthorized'
);

const policyNotFoundSpy: jest.SpyInstance<ReturnType<typeof commonUtils.policyNotFound>> =
  jest.spyOn(commonUtils, 'policyNotFound');

const extractBehindLoginOrAnonymousPropsSpy: jest.SpyInstance<
  ReturnType<typeof commonUtils.extractBehindLoginOrAnonymousProps>
> = jest.spyOn(commonUtils, 'extractBehindLoginOrAnonymousProps');

const lambdaSuccessSpy: jest.SpyInstance<ReturnType<typeof commonUtils.lambdaSuccess>> = jest.spyOn(
  commonUtils,
  'lambdaSuccess'
);

const lambdaErrorSpy: jest.SpyInstance<ReturnType<typeof commonUtils.lambdaError>> = jest.spyOn(
  commonUtils,
  'lambdaError'
);

const getRequestHeadersSpy: jest.SpyInstance<ReturnType<typeof commonUtils.getRequestHeaders>> =
  jest.spyOn(commonUtils, 'getRequestHeaders');

const getConversionResultSpy = jest.spyOn(Helpers, 'getConversionResult');

// ── Test data ─────────────────────────────────────────────────────────────────

process.env = {
  AD_PROXY_ACCOUNT_ID: 'some-ad-proxy-account-id',
  AWS_REGION: 'some-aws-region'
};

const mockGwPolicyNumber = 'ATX189411101';
const mockConversionType = 'PSTAR_TO_GW';
const mockToken = 'some-token';

const mockContext = {
  awsRequestId: 'some-request-id',
  invokedFunctionArn: 'arn:aws:lambda:us-west-2:018363016784:function:test-function:1'
};

const mockConversionResult = {
  isConversionApplicable: true,
  legacyPolicyNumber: mockGwPolicyNumber,
  targetPolicyNumber: 'NEW-POLICY-001',
  targetEffectiveDate: '2025-01-01T00:00:00.000Z',
  policyState: 'AL',
  conversionType: mockConversionType
};

let mockEvent: typeof baseEvent;

const setupMocks = () => {
  mockEvent = JSON.parse(JSON.stringify(baseEvent));
  mockEvent.body = JSON.stringify({
    policyNumber: mockGwPolicyNumber,
    conversionType: mockConversionType
  });

  getAuthorizationTokenSpy.mockReturnValue(mockToken);
  notAuthorizedSpy.mockReturnValue(commonUtils.noAuthorizedMockResponse);
  policyNotFoundSpy.mockReturnValue(commonUtils.policyNotFoundMockResponse);
  lambdaSuccessSpy.mockReturnValue(commonUtils.mockLambdaSuccess);
  lambdaErrorSpy.mockReturnValue(commonUtils.mockLambdaError);

  extractBehindLoginOrAnonymousPropsSpy.mockResolvedValue({
    policyNumber: mockGwPolicyNumber,
    loginFlowType: 'ANONYMOUS' as any,
    efnolApplication: 'AutoEfnol1stPartyAnonymous' as any,
    clubCode: '240'
  });

  getRequestHeadersSpy.mockReturnValue({});
  getConversionResultSpy.mockResolvedValue(mockConversionResult as any);
  mockGetTreatment.mockResolvedValue({ treatment: 'on' });
};

const clearAllMocks = () => {
  getAuthorizationTokenSpy.mockClear();
  notAuthorizedSpy.mockClear();
  policyNotFoundSpy.mockClear();
  extractBehindLoginOrAnonymousPropsSpy.mockClear();
  getRequestHeadersSpy.mockClear();
  lambdaSuccessSpy.mockClear();
  lambdaErrorSpy.mockClear();
  getConversionResultSpy.mockClear();
  mockGetTreatment.mockClear();
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('without-login-efnol-auto-get-policy-conversion Lambda', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    clearAllMocks();
  });

  describe('Authorization', () => {
    it('returns 401 when authorization token is missing', async () => {
      getAuthorizationTokenSpy.mockReturnValue('');

      const result = await app.handler(mockEvent, mockContext);

      expect(notAuthorizedSpy).toHaveBeenCalledWith(mockContext, undefined);
      expect(result).toEqual(commonUtils.noAuthorizedMockResponse);
      expect(extractBehindLoginOrAnonymousPropsSpy).not.toHaveBeenCalled();
    });
  });

  describe('Policy number validation', () => {
    it('returns policyNotFound when policyNumber is missing from request body', async () => {
      mockEvent.body = JSON.stringify({ conversionType: mockConversionType });

      const result = await app.handler(mockEvent, mockContext);

      expect(policyNotFoundSpy).toHaveBeenCalledWith(
        mockContext,
        undefined,
        'Policy number missing from request body'
      );
      expect(result).toEqual(commonUtils.policyNotFoundMockResponse);
    });

    it('returns policyNotFound when conversionType is missing from request body', async () => {
      mockEvent.body = JSON.stringify({ policyNumber: mockGwPolicyNumber });

      const result = await app.handler(mockEvent, mockContext);

      expect(policyNotFoundSpy).toHaveBeenCalledWith(
        mockContext,
        undefined,
        'Conversion type missing from request body'
      );
      expect(result).toEqual(commonUtils.policyNotFoundMockResponse);
    });

    it('returns policyNotFound when policy number does not match token/cache', async () => {
      extractBehindLoginOrAnonymousPropsSpy.mockResolvedValue({
        policyNumber: 'DIFFERENT-POLICY',
        loginFlowType: 'ANONYMOUS' as any,
        efnolApplication: 'AutoEfnol1stPartyAnonymous' as any,
        clubCode: '240'
      });

      const result = await app.handler(mockEvent, mockContext);

      expect(policyNotFoundSpy).toHaveBeenCalledWith(
        mockContext,
        expect.objectContaining({ policyNumber: mockGwPolicyNumber }),
        'Policy number mismatch'
      );
      expect(result).toEqual(commonUtils.policyNotFoundMockResponse);
    });

    it('returns no conversion result when conversion check feature flag is off', async () => {
      mockGetTreatment.mockResolvedValue({ treatment: 'off' });

      const mockNoConversionResult = {
        isConversionApplicable: false,
        legacyPolicyNumber: mockGwPolicyNumber,
        conversionType: ConversionType.PSTAR_TO_GW,
        policyState: undefined,
        targetEffectiveDate: '2025-01-01T00:00:00.000Z',
        targetPolicyNumber: mockGwPolicyNumber
      };
      jest.spyOn(Helpers, 'noConversionResult').mockReturnValue(mockNoConversionResult);

      const result = await app.handler(mockEvent, mockContext);

      expect(Helpers.noConversionResult).toHaveBeenCalledWith(
        mockGwPolicyNumber,
        mockConversionType
      );
      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        { policyNumber: mockGwPolicyNumber, conversionType: 'PSTAR_TO_GW', loginFlowType: 'ANONYMOUS', efnolApplication: 'AutoEfnol1stPartyAnonymous', clubCode: '240' },
        mockNoConversionResult,
        'Policy_Conversion'
      );
      expect(result).toEqual(commonUtils.mockLambdaSuccess);
    });
  });

  describe('Happy path', () => {
    it('calls getConversionResult with correct args and returns lambdaSuccess', async () => {
      const result = await app.handler(mockEvent, mockContext);

      expect(getConversionResultSpy).toHaveBeenCalledWith(
        mockGwPolicyNumber,
        mockConversionType,
        mockToken,
        mockContext,
        expect.anything(), // featureFlagService (module-level instance)
        expect.anything(), // logger (module-level instance)
        expect.anything(), // requestHeaders
        'ANONYMOUS', // loginFlowType
        'AutoEfnol1stPartyAnonymous' // efnolApplication
      );
      expect(lambdaSuccessSpy).toHaveBeenCalledWith(
        mockContext,
        expect.objectContaining({ policyNumber: mockGwPolicyNumber }),
        mockConversionResult,
        'Policy_Conversion'
      );
      expect(result).toEqual(commonUtils.mockLambdaSuccess);
    });
  });

  describe('Error handling', () => {
    it('wraps getConversionResult failure in BackendCallError and calls lambdaError', async () => {
      getConversionResultSpy.mockRejectedValue(new Error('eligibility check failure'));

      const result = await app.handler(mockEvent, mockContext);

      expect(lambdaErrorSpy).toHaveBeenCalledWith(
        mockContext,
        expect.anything(),
        expect.objectContaining({ backendName: 'cmn-efnol-policy-conversion-check' }),
        'Unable to get policy conversion'
      );
      expect(result).toEqual(commonUtils.mockLambdaError);
    });

    it('wraps extractBehindLoginOrAnonymousProps failure in BackendCallError and calls lambdaError', async () => {
      extractBehindLoginOrAnonymousPropsSpy.mockRejectedValue(new Error('cache failure'));

      const result = await app.handler(mockEvent, mockContext);

      expect(lambdaErrorSpy).toHaveBeenCalledWith(
        mockContext,
        expect.anything(),
        expect.objectContaining({ backendName: 'cmn-efnol-policy-conversion-check' }),
        'Unable to get policy conversion'
      );
      expect(result).toEqual(commonUtils.mockLambdaError);
    });

    it('does not double-wrap a BackendCallError thrown by getConversionResult', async () => {
      const original = new BackendCallError('some-downstream', new Error('downstream failure'));
      getConversionResultSpy.mockRejectedValue(original);

      await app.handler(mockEvent, mockContext);

      expect(lambdaErrorSpy).toHaveBeenCalledWith(
        mockContext,
        expect.anything(),
        expect.objectContaining({ backendName: 'some-downstream' }),
        'Unable to get policy conversion'
      );
    });
  });
});
