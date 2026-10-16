import * as AwsLambdaV3 from '@ace-clublabs/aws-lambda-v3';
import { EfnolApplication } from '@ace-clublabs/iss-common-auto-efnol-models';
import * as commonUtils from '@lib/common-utils';
import { LoginFlowType } from '@lib/shared-contracts';
import { APIResult, Metrics, mockPolicyGuid } from '@lib/types';
import * as LibUtility from '@lib/utility';
import * as Helpers from './helpers';
import * as app from './index';
import { ClaimStatus, parseUtcOffsetMinutes } from './index';
import { IClaimInfoCanonicalResponse } from '@ace-clublabs/iss-common-shared-claims-models';
import { SplitIOHelper } from '@lib/common-utils';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import { LambdaHelper } from '@ace-clublabs/iss-common-lambda-v3';
import { ClaimsAuthorizationHelper, ClientApplication } from '@ace-clublabs/iss-cci-clients';

jest.mock('@ace-clublabs/iss-common-lambda-v3');
jest.mock('@lib/common-utils', () => ({
  ...jest.genMockFromModule<typeof import('@lib/common-utils')>('@lib/common-utils'),
  BackendCallError: jest.requireActual('@lib/common-utils').BackendCallError
}));
jest.mock('@lib/utility');
jest.mock('./helpers');
jest.mock('@ace-clublabs/iss-cci-clients');
jest.mock('@ace-clublabs/aws-lambda-logger');

const extractBehindLoginOrAnonymousPropsSpy = jest.spyOn(
  commonUtils,
  'extractBehindLoginOrAnonymousProps'
);
const getAuthorizationTokenSpy = jest.spyOn(commonUtils, 'getAuthorizationToken');
const getRequestHeadersSpy = jest.spyOn(commonUtils, 'getRequestHeaders');
const lambdaSuccessSpy = jest.spyOn(commonUtils, 'lambdaSuccess');
const lambdaErrorSpy = jest.spyOn(commonUtils, 'lambdaError');
const notAuthorizedSpy = jest.spyOn(commonUtils, 'notAuthorized');
const policyNotFoundSpy = jest.spyOn(commonUtils, 'policyNotFound');
const policyUnauthorizedSpy = jest.spyOn(commonUtils, 'policyUnauthorized');
const policyBlockedErrorSpy = jest.spyOn(commonUtils, 'policyBlockedError');
const inferClubCodeSpy = jest.spyOn(LibUtility, 'inferClubCode');
const getClaimsSummarySpy = jest.spyOn(Helpers, 'getClaimsSummary');
const claimNotFoundSpy = jest.spyOn(app, 'claimNotFound');
const getEnableIntegrationGatewaySpy = jest.spyOn(SplitIOHelper, 'getEnableIntegrationGateway');

const mockContext = {
  awsRequestId: 'some-request-id',
  invokedFunctionArn: 'arn:aws:lambda:us-west-2:000000000000:function:test'
} as AwsLambdaV3.IContext;

const mockEvent = {
  headers: {
    Authorization: 'Bearer super-secret-jwt-token'
  },
  body: JSON.stringify({ lossDate: '2025-03-25' }),
  queryStringParameters: {
    policyGuid: mockPolicyGuid
  },
  requestContext: {
    authorizer: {
      customerId: 'mock-customer-id'
    }
  }
} as any;

const mappedClaimInfoAutoResponseV1 = {
  APIResult: 'SUCCESS',
  claims: [
    {
      claimNumber: 'some-claim-number',
      lossDate: '2025-03-25',
      claimStatus: ClaimStatus.Open,
      adjusterDetails: {
        name: 'Laura Duck',
        phone: '714-885-1607',
        email: 'Duck.Laura@ace.aaa.com'
      }
    }
  ]
} as any;

const mappedClaimsInfoResponseV2: IClaimInfoCanonicalResponse[] = [
  {
    claimId: 'cc:Srwdek3n80iXeA0J731WR',
    claimNumber: '002193219',
    lossDate: '2025-10-13T11:04:00.000Z',
    status: 'open',
    isCatastropheEvent: false
  },
  {
    claimId: 'cc:SCORcFbnT0fqr0S4A1Blv',
    claimNumber: '002193231',
    lossDate: '2025-09-08T18:26:00.000Z',
    status: 'open',
    isCatastropheEvent: false
  },
  {
    claimId: 'cc:SJz4VVJbwaY6CVRXuMsIY',
    claimNumber: '002193232',
    lossDate: '2025-10-07T18:26:00.000Z',
    status: 'draft', // closed, open, draft @todo: confirm with backend team for GWCC IG return codes
    isCatastropheEvent: false
  }
];

// Claim filed at 11 PM CDT (UTC-5) on Sep 8 — stored by GW as Sep 9 UTC
const mappedClaimsInfoResponseV2CrossMidnight: IClaimInfoCanonicalResponse[] = [
  {
    claimId: 'cc:STimezoneEdgeCase001',
    claimNumber: '002193299',
    lossDate: '2025-09-09T04:00:00.000Z',
    status: 'open',
    isCatastropheEvent: false
  }
];

const mockPolicyNumber = 'HTX000040825';
const mockClubCode = '252';
const mockLogInfo = { policyNumber: mockPolicyNumber, clubCode: mockClubCode };

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
(MaskedLogger.getInstance as jest.Mock).mockReturnValue(loggerMockInstance);
(ClaimsAuthorizationHelper as jest.Mock).mockImplementation(() => mockAuthorizationHelper);
(LambdaHelper.response as jest.Mock).mockImplementation(config => ({
  statusCode: config.statusCode,
  headers: config.headers,
  body: config.body
}));

const setupMocks = () => {
  extractBehindLoginOrAnonymousPropsSpy.mockResolvedValue({
    policyNumber: mockPolicyNumber,
    loginFlowType: LoginFlowType.ANONYMOUS,
    efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
  });
  getAuthorizationTokenSpy.mockReturnValue('super-secret-jwt-token');
  inferClubCodeSpy.mockReturnValue(mockClubCode as any);
  getClaimsSummarySpy.mockResolvedValue(mappedClaimInfoAutoResponseV1);
  getRequestHeadersSpy.mockReturnValue({ some: 'header' });
  mockAuthorizationHelper.isPolicyAuthorizedAsync.mockResolvedValue(true);

  lambdaSuccessSpy.mockReturnValue({ statusCode: 200, body: 'ok' } as any);
  lambdaErrorSpy.mockReturnValue({ statusCode: 500, body: 'err' } as any);
  notAuthorizedSpy.mockReturnValue({ statusCode: 401, body: 'unauthorized' } as any);
  policyNotFoundSpy.mockReturnValue({ statusCode: 404, body: 'policy not found' } as any);
  policyUnauthorizedSpy.mockReturnValue({ statusCode: 401, body: 'policy unauthorized' } as any);
  policyBlockedErrorSpy.mockReturnValue({ statusCode: 403, body: 'policy blocked' } as any);
  claimNotFoundSpy.mockImplementation(() => ({
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'X-Ace-RequestId': 'some-request-id',
      'X-Ace-Session-Id': 'some-session-id'
    },
    body: JSON.stringify({
      message: 'No existing claim found',
      APIResult: APIResult.Success,
      duplicateClaimExists: false
    })
  }));
  getEnableIntegrationGatewaySpy.mockResolvedValue(false);
};

describe('handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('returns 200 when valid claim is found', async () => {
    const result = await app.handler(mockEvent, mockContext);
    const expectedClaimResponse = {
      claimNumber: 'some-claim-number',
      lossDate: '2025-03-25',
      claimStatus: ClaimStatus.Open,
      adjuster: {
        name: 'Laura Duck',
        phone: '714-885-1607',
        email: 'Duck.Laura@ace.aaa.com'
      }
    };
    expect(lambdaSuccessSpy).toHaveBeenCalledWith(
      mockContext,
      expect.objectContaining(mockLogInfo),
      {
        message: `Existing claim found for policyNumber ${mockPolicyNumber}`,
        APIResult: APIResult.Success,
        duplicateClaimExists: true,
        claimFound: expectedClaimResponse
      },
      Metrics.GetClaimInfo
    );

    expect(result).toEqual({ statusCode: 200, body: 'ok' });
  });

  it('returns 200 when valid claim is found (v2 Response)', async () => {
    getEnableIntegrationGatewaySpy.mockResolvedValue(true);
    getClaimsSummarySpy.mockResolvedValue(mappedClaimsInfoResponseV2 as any);

    const result = await app.handler(
      {
        ...mockEvent,
        body: JSON.stringify({ lossDate: '2025-09-08' })
      },
      mockContext
    );

    expect(lambdaSuccessSpy).toHaveBeenCalledWith(
      mockContext,
      expect.objectContaining(mockLogInfo),
      {
        message: `Existing claim found for policyNumber ${mockPolicyNumber}`,
        APIResult: APIResult.Success,
        duplicateClaimExists: true,
        claimFound: {
          claimId: 'cc:SCORcFbnT0fqr0S4A1Blv',
          claimNumber: '002193231',
          lossDate: '2025-09-08T18:26:00.000Z',
          status: 'open',
          isCatastropheEvent: false
        }
      },
      Metrics.GetClaimInfo
    );

    expect(result).toEqual({ statusCode: 200, body: 'ok' });
  });

  it('returns not authorized when token is missing', async () => {
    getAuthorizationTokenSpy.mockReturnValue('');

    const result = await app.handler(mockEvent, mockContext);

    expect(notAuthorizedSpy).toHaveBeenCalledWith(mockContext, expect.anything());
    expect(result.statusCode).toBe(401);
  });

  it('returns 404 when policy number is missing', async () => {
    extractBehindLoginOrAnonymousPropsSpy.mockResolvedValue({
      policyNumber: '',
      loginFlowType: LoginFlowType.ANONYMOUS,
      efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
    });

    const result = await app.handler(mockEvent, mockContext);

    expect(policyNotFoundSpy).toHaveBeenCalledWith(mockContext, expect.anything());
    expect(result.statusCode).toBe(404);
  });

  it('returns 401 when policy is not authorized by CCI', async () => {
    mockAuthorizationHelper.isPolicyAuthorizedAsync.mockResolvedValue(false);
    extractBehindLoginOrAnonymousPropsSpy.mockResolvedValue({
      policyNumber: mockPolicyNumber,
      loginFlowType: LoginFlowType.BEHIND_LOGIN,
      efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
      clubCode: '001'
    });
    const result = await app.handler(mockEvent, mockContext);

    expect(mockAuthorizationHelper.isPolicyAuthorizedAsync).toHaveBeenCalledWith(
      mockPolicyNumber,
      'mock-customer-id',
      mockEvent,
      { some: 'header' },
      expect.objectContaining({
        initialize: expect.any(Function),
        info: expect.any(Function),
        debug: expect.any(Function),
        error: expect.any(Function),
        warn: expect.any(Function),
        getClientContext: expect.any(Function)
      }),
      ClientApplication.AUTO_CLAIMS
    );
    expect(policyUnauthorizedSpy).toHaveBeenCalledWith(
      mockContext,
      expect.objectContaining(mockLogInfo)
    );
    expect(result.statusCode).toBe(401);
  });

  it('returns 200 when policy is authorized by CCI and claim is found', async () => {
    mockAuthorizationHelper.isPolicyAuthorizedAsync.mockResolvedValue(true);
    extractBehindLoginOrAnonymousPropsSpy.mockResolvedValue({
      policyNumber: mockPolicyNumber,
      loginFlowType: LoginFlowType.BEHIND_LOGIN,
      efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
      clubCode: '001'
    });

    const result = await app.handler(mockEvent, mockContext);

    expect(mockAuthorizationHelper.isPolicyAuthorizedAsync).toHaveBeenCalledWith(
      mockPolicyNumber,
      'mock-customer-id',
      mockEvent,
      { some: 'header' },
      expect.objectContaining({
        initialize: expect.any(Function),
        info: expect.any(Function),
        debug: expect.any(Function),
        error: expect.any(Function),
        warn: expect.any(Function),
        getClientContext: expect.any(Function)
      }),
      ClientApplication.AUTO_CLAIMS
    );
    expect(lambdaSuccessSpy).toHaveBeenCalledWith(
      mockContext,
      expect.objectContaining(mockLogInfo),
      {
        message: `Existing claim found for policyNumber ${mockPolicyNumber}`,
        APIResult: APIResult.Success,
        duplicateClaimExists: true,
        claimFound: expect.any(Object)
      },
      Metrics.GetClaimInfo
    );
    expect(result.statusCode).toBe(200);
  });

  it('returns 200 with duplicateClaimExists false when claim not found', async () => {
    getClaimsSummarySpy.mockResolvedValue({
      APIResult: 'FAILED',
      claims: []
    } as any);

    const result = await app.handler(mockEvent, mockContext);
    expect(claimNotFoundSpy).toHaveBeenCalledWith(
      mockContext,
      expect.anything(),
      expect.objectContaining(mockLogInfo)
    );

    expect(result.statusCode).toBe(200);
  });

  it('returns 200 with duplicateClaimExists false when claim not found (v2 Response)', async () => {
    getEnableIntegrationGatewaySpy.mockResolvedValue(true);
    getClaimsSummarySpy.mockResolvedValue(mappedClaimsInfoResponseV2 as any);

    const result = await app.handler(mockEvent, mockContext);

    expect(claimNotFoundSpy).toHaveBeenCalledWith(
      mockContext,
      expect.anything(),
      expect.objectContaining(mockLogInfo)
    );

    expect(result.statusCode).toBe(200);
  });

  it('returns 200 with duplicateClaimExists false when lossDate matches but claim is in draft status (v2 Response)', async () => {
    getEnableIntegrationGatewaySpy.mockResolvedValue(true);
    getClaimsSummarySpy.mockResolvedValue(mappedClaimsInfoResponseV2 as any);

    const result = await app.handler(
      {
        ...mockEvent,
        body: JSON.stringify({ lossDate: '2025-10-07' })
      },
      mockContext
    );

    expect(claimNotFoundSpy).toHaveBeenCalledWith(
      mockContext,
      expect.anything(),
      expect.objectContaining(mockLogInfo)
    );

    expect(result.statusCode).toBe(200);
  });

  it('detects duplicate claim when GW UTC datetime crosses midnight into user local timezone (v2 Response)', async () => {
    getEnableIntegrationGatewaySpy.mockResolvedValue(true);
    getClaimsSummarySpy.mockResolvedValue(mappedClaimsInfoResponseV2CrossMidnight as any);

    // User in CDT (UTC-5) enters Sep 8 at 11 PM local — GW stores as Sep 9 04:00 UTC
    const result = await app.handler(
      {
        ...mockEvent,
        body: JSON.stringify({ lossDate: '2025-09-08T23:00:00-05:00' })
      },
      mockContext
    );

    expect(lambdaSuccessSpy).toHaveBeenCalledWith(
      mockContext,
      expect.objectContaining(mockLogInfo),
      {
        message: `Existing claim found for policyNumber ${mockPolicyNumber}`,
        APIResult: APIResult.Success,
        duplicateClaimExists: true,
        claimFound: {
          claimId: 'cc:STimezoneEdgeCase001',
          claimNumber: '002193299',
          lossDate: '2025-09-09T04:00:00.000Z',
          status: 'open',
          isCatastropheEvent: false
        }
      },
      Metrics.GetClaimInfo
    );

    expect(result).toEqual({ statusCode: 200, body: 'ok' });
  });

  it('detects duplicate claim at noon local time when stored claim crosses UTC midnight (v2 Response)', async () => {
    getEnableIntegrationGatewaySpy.mockResolvedValue(true);
    getClaimsSummarySpy.mockResolvedValue(mappedClaimsInfoResponseV2CrossMidnight as any);

    // The existing claim was filed at 11 PM CDT (UTC-5) on Sep 8, which GW stored
    // as Sep 9 04:00 UTC. A second submission attempt at noon CDT on the same day
    // must still be caught as a duplicate. Previously this failed because the Lambda
    // compared dates in UTC (noon CDT = Sep 8 UTC, stored = Sep 9 UTC → no match).
    const result = await app.handler(
      {
        ...mockEvent,
        body: JSON.stringify({ lossDate: '2025-09-08T12:00:00-05:00' })
      },
      mockContext
    );

    expect(lambdaSuccessSpy).toHaveBeenCalledWith(
      mockContext,
      expect.objectContaining(mockLogInfo),
      {
        message: `Existing claim found for policyNumber ${mockPolicyNumber}`,
        APIResult: APIResult.Success,
        duplicateClaimExists: true,
        claimFound: {
          claimId: 'cc:STimezoneEdgeCase001',
          claimNumber: '002193299',
          lossDate: '2025-09-09T04:00:00.000Z',
          status: 'open',
          isCatastropheEvent: false
        }
      },
      Metrics.GetClaimInfo
    );

    expect(result).toEqual({ statusCode: 200, body: 'ok' });
  });

  it('falls back to UTC comparison when lossDate has no timezone offset (v2 Response)', async () => {
    getEnableIntegrationGatewaySpy.mockResolvedValue(true);
    getClaimsSummarySpy.mockResolvedValue(mappedClaimsInfoResponseV2 as any);

    // Plain date string with no offset — parseUtcOffsetMinutes returns 0 so we
    // compare in UTC, which is the same behaviour as before the fix.
    const result = await app.handler(
      {
        ...mockEvent,
        body: JSON.stringify({ lossDate: '2025-09-08' })
      },
      mockContext
    );

    expect(lambdaSuccessSpy).toHaveBeenCalledWith(
      mockContext,
      expect.objectContaining(mockLogInfo),
      expect.objectContaining({
        duplicateClaimExists: true
      }),
      Metrics.GetClaimInfo
    );
  });

  it('passes timezone to getClaimsSummary when timezone is present in body', async () => {
    await app.handler(
      { ...mockEvent, body: JSON.stringify({ lossDate: '2025-03-25', timezone: 'America/Los_Angeles' }) },
      mockContext
    );

    expect(getClaimsSummarySpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      'America/Los_Angeles'
    );
  });

  it('passes null timezone to getClaimsSummary when timezone is absent from body', async () => {
    await app.handler(mockEvent, mockContext);

    expect(getClaimsSummarySpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      null
    );
  });

  it('passes null timezone to getClaimsSummary when body has no timezone field', async () => {
    await app.handler(
      { ...mockEvent, body: JSON.stringify({ lossDate: '2025-03-25' }) },
      mockContext
    );

    expect(getClaimsSummarySpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      null
    );
  });

  it('returns 500 on unexpected error and wraps it in a BackendCallError with backendName "get-claims-summary" (v1 flow)', async () => {
    getClaimsSummarySpy.mockRejectedValue(new Error('something went wrong'));

    const result = await app.handler(mockEvent, mockContext);

    expect(lambdaErrorSpy).toHaveBeenCalledWith(
      mockContext,
      expect.anything(),
      expect.objectContaining({ backendName: 'get-claims-summary' }),
      'Unable to get claim info'
    );

    expect(result.statusCode).toBe(500);
  });

  it('returns 500 on unexpected error and wraps it in a BackendCallError with backendName "cmn-claims-info-v2" (v2 flow)', async () => {
    getEnableIntegrationGatewaySpy.mockResolvedValue(true);
    getClaimsSummarySpy.mockRejectedValue(new Error('something went wrong'));

    const result = await app.handler(mockEvent, mockContext);

    expect(lambdaErrorSpy).toHaveBeenCalledWith(
      mockContext,
      expect.anything(),
      expect.objectContaining({ backendName: 'cmn-claims-info-v2' }),
      'Unable to get claim info'
    );

    expect(result.statusCode).toBe(500);
  });

  it('returns 403 when BackendCallError cause has ComponentErrorCode 403', async () => {
    const blockedCause = {
      ComponentErrorCode: 403,
      ErrorMessage: 'Policy not allowed to file claims'
    };
    getClaimsSummarySpy.mockRejectedValue(blockedCause);

    const result = await app.handler(mockEvent, mockContext);

    expect(policyBlockedErrorSpy).toHaveBeenCalledWith(mockContext, expect.anything());
    expect(lambdaErrorSpy).not.toHaveBeenCalled();
    expect(result.statusCode).toBe(403);
  });

  describe('Anonymous vs Behind-Login flows', () => {
    it('handles anonymous flow (no policyGuid, extracts from token)', async () => {
      const anonymousEvent = {
        ...mockEvent,
        body: JSON.stringify({ lossDate: '2025-03-25' }),
        queryStringParameters: { policyGuid: undefined }
      };

      await app.handler(anonymousEvent, mockContext);

      expect(extractBehindLoginOrAnonymousPropsSpy).toHaveBeenCalledWith(
        null,
        'super-secret-jwt-token'
      );
      expect(lambdaSuccessSpy).toHaveBeenCalled();
    });

    it('handles behind-login flow (valid policyGuid, retrieves from cache)', async () => {
      const behindLoginPolicyGuid = 'Q0F-BOT-g3N-jQ1-MjM-x';
      const behindLoginEvent = {
        ...mockEvent,
        body: JSON.stringify({ lossDate: '2025-03-25' }),
        queryStringParameters: { policyGuid: behindLoginPolicyGuid }
      };

      await app.handler(behindLoginEvent, mockContext);

      expect(extractBehindLoginOrAnonymousPropsSpy).toHaveBeenCalledWith(
        behindLoginPolicyGuid,
        'super-secret-jwt-token'
      );
      expect(lambdaSuccessSpy).toHaveBeenCalled();
    });
  });
});

describe('resolvedPolicyNumber in request body', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
    getEnableIntegrationGatewaySpy.mockResolvedValue(true);
    getClaimsSummarySpy.mockResolvedValue(mappedClaimsInfoResponseV2 as any);
  });

  it('uses resolvedPolicyNumber for claims-summary lookup when provided in body', async () => {
    const resolvedPolicyNumber = 'GW-CONVERTED-999';

    await app.handler(
      {
        ...mockEvent,
        body: JSON.stringify({ lossDate: '2025-09-08', policyNumber: resolvedPolicyNumber })
      },
      mockContext
    );

    expect(getClaimsSummarySpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      resolvedPolicyNumber,
      expect.anything(),
      expect.anything(),
      null
    );
  });

  it('uses token-derived policyNumber for claims-summary lookup when resolvedPolicyNumber is absent', async () => {
    await app.handler(mockEvent, mockContext);

    expect(getClaimsSummarySpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      mockPolicyNumber,
      expect.anything(),
      expect.anything(),
      null
    );
  });
});

describe('parseUtcOffsetMinutes', () => {
  it('parses a negative Pacific offset (-07:00 → -420)', () => {
    expect(parseUtcOffsetMinutes('2026-04-09T23:00:00-07:00')).toBe(-420);
  });

  it('parses a positive half-hour offset (+05:30 → +330)', () => {
    expect(parseUtcOffsetMinutes('2026-04-09T12:00:00+05:30')).toBe(330);
  });

  it('returns 0 for a plain date string with no offset', () => {
    expect(parseUtcOffsetMinutes('2026-04-09')).toBe(0);
  });

  it('returns 0 for a UTC Z-suffix string', () => {
    expect(parseUtcOffsetMinutes('2026-04-09T12:00:00Z')).toBe(0);
  });

  it('returns 0 for a positive zero offset (+00:00)', () => {
    expect(parseUtcOffsetMinutes('2026-04-09T12:00:00+00:00')).toBe(0);
  });
});
