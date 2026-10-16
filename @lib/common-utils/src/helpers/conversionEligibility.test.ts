import {
  ITenant,
  PolicyTypeAndTenantHelper,
  inferStateAcronymFromPolicyPrefix
} from '@ace-clublabs/iss-common-lambda-v3';
import { ConversionType } from '@ace-clublabs/iss-common-shared-claims-models';
import { Features } from '@ace-clublabs/feature-flags';
import { getConversionResult } from './conversionEligibility';
import { policyConversionCheck } from './policyConversionHelper';

// Module mocks

jest.mock('@ace-clublabs/iss-common-lambda-v3', () => {
  const actual = jest.requireActual('@ace-clublabs/iss-common-lambda-v3');
  return {
    ...actual,
    PolicyTypeAndTenantHelper: {
      ...actual.PolicyTypeAndTenantHelper,
      getTenantAndProductFromPolicyNumber: jest.fn()
    },
    inferStateAcronymFromPolicyPrefix: jest.fn()
  };
});

jest.mock('./policyConversionHelper', () => ({
  policyConversionCheck: jest.fn()
}));

// Typed mock references

const getTenantSpy = PolicyTypeAndTenantHelper.getTenantAndProductFromPolicyNumber as jest.Mock;
const inferStateSpy = inferStateAcronymFromPolicyPrefix as jest.Mock;
const policyConversionCheckMock = policyConversionCheck as jest.Mock;

// Test data

const mockGwPolicyNumber = 'ATX189411101';
const mockPstarPolicyNumber = 'A1536806';
const mockToken = 'some-token';

const mockContext = {
  awsRequestId: 'some-request-id',
  invokedFunctionArn: 'arn:aws:lambda:us-west-2:018363016784:function:test-function:1'
};

const mockConversionResult = {
  isConversionApplicable: true,
  legacyPolicyNumber: mockPstarPolicyNumber,
  targetPolicyNumber: mockGwPolicyNumber,
  targetEffectiveDate: '2025-01-01',
  policyState: 'AL',
  conversionType: ConversionType.PSTAR_TO_GW
};

const noConversionSentinel = (policyNumber: string) => ({
  isConversionApplicable: false,
  legacyPolicyNumber: policyNumber,
  targetPolicyNumber: policyNumber,
  targetEffectiveDate: undefined,
  policyState: undefined,
  conversionType: ConversionType.PSTAR_TO_GW
});

/**
 * Creates a minimal FeatureFlagService mock with controllable getTreatment /
 * getTreatmentWithConfig stubs.
 */
const createFeatureFlagServiceMock = () => ({
  getTreatmentWithConfig: jest
    .fn()
    .mockResolvedValue({ treatment: 'on', config: JSON.stringify({ AL: { auto: true } }) })
});

const createLoggerMock = () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
});

// Tests

describe('getConversionResult', () => {
  beforeEach(() => {
    getTenantSpy.mockReturnValue({
      tenant: ITenant.GUIDEWIRE,
      productType: 1 as any,
      clubCode: '240'
    });
    inferStateSpy.mockReturnValue('AL');
    policyConversionCheckMock.mockResolvedValue(mockConversionResult);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PSTAR_TO_GW — tenant gate', () => {
    it('returns noConversionResult when tenant is UNKNOWN', async () => {
      getTenantSpy.mockReturnValue({ tenant: ITenant.UNKNOWN, productType: 6 as any });
      const ffService = createFeatureFlagServiceMock();
      const logger = createLoggerMock();

      const result = await getConversionResult(
        mockPstarPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        mockContext as any,
        ffService as any,
        logger as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(result).toEqual(noConversionSentinel(mockPstarPolicyNumber));
      expect(ffService.getTreatmentWithConfig).not.toHaveBeenCalled();
      expect(policyConversionCheckMock).not.toHaveBeenCalled();
    });

    it('returns noConversionResult when tenant is HUON', async () => {
      getTenantSpy.mockReturnValue({ tenant: ITenant.HUON, productType: 1 as any });
      const ffService = createFeatureFlagServiceMock();
      const logger = createLoggerMock();

      const result = await getConversionResult(
        mockPstarPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        mockContext as any,
        ffService as any,
        logger as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(result).toEqual(noConversionSentinel(mockPstarPolicyNumber));
      expect(ffService.getTreatmentWithConfig).not.toHaveBeenCalled();
      expect(policyConversionCheckMock).not.toHaveBeenCalled();
    });
  });

  describe('PSTAR_TO_GW — feature flag gate', () => {
    it('returns noConversionResult when conversion flag treatment is off', async () => {
      const ffService = createFeatureFlagServiceMock();
      ffService.getTreatmentWithConfig.mockResolvedValue({
        treatment: 'off',
        config: JSON.stringify({ AL: { auto: true } })
      });
      const logger = createLoggerMock();

      const result = await getConversionResult(
        mockPstarPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        mockContext as any,
        ffService as any,
        logger as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(result).toEqual(noConversionSentinel(mockPstarPolicyNumber));
      expect(ffService.getTreatmentWithConfig).toHaveBeenCalled();
      expect(policyConversionCheckMock).not.toHaveBeenCalled();
    });

    it('returns noConversionResult when conversion flag treatment is control', async () => {
      const ffService = createFeatureFlagServiceMock();
      ffService.getTreatmentWithConfig.mockResolvedValue({
        treatment: 'control',
        config: JSON.stringify({ AL: { auto: true } })
      });
      const logger = createLoggerMock();

      const result = await getConversionResult(
        mockPstarPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        mockContext as any,
        ffService as any,
        logger as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(result).toEqual(noConversionSentinel(mockPstarPolicyNumber));
      expect(ffService.getTreatmentWithConfig).toHaveBeenCalled();
      expect(policyConversionCheckMock).not.toHaveBeenCalled();
    });
  });

  describe('PSTAR_TO_GW — GW state eligibility check', () => {
    it('returns noConversionResult when state cannot be inferred from GW policy number', async () => {
      inferStateSpy.mockReturnValue(undefined);
      const ffService = createFeatureFlagServiceMock();
      const logger = createLoggerMock();

      const result = await getConversionResult(
        mockPstarPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        mockContext as any,
        ffService as any,
        logger as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(result).toEqual(noConversionSentinel(mockPstarPolicyNumber));
      expect(ffService.getTreatmentWithConfig).not.toHaveBeenCalled();
      expect(policyConversionCheckMock).not.toHaveBeenCalled();
    });

    it('throws an error when flag config is null', async () => {
      const ffService = createFeatureFlagServiceMock();
      ffService.getTreatmentWithConfig.mockResolvedValue({ treatment: 'on', config: null });
      const logger = createLoggerMock();

      await expect(
        getConversionResult(
          mockGwPolicyNumber,
          ConversionType.PSTAR_TO_GW,
          mockToken,
          mockContext as any,
          ffService as any,
          logger as any,
          {},
          'BEHIND_LOGIN' as any
        )
      ).rejects.toThrow(
        `Missing Dynamic Configuration for feature flag '${Features.EFNOLPStarConversionStates}'`
      );

      expect(policyConversionCheckMock).not.toHaveBeenCalled();
    });

    it('throws an error when flag config contains invalid JSON', async () => {
      const ffService = createFeatureFlagServiceMock();
      ffService.getTreatmentWithConfig.mockResolvedValue({ treatment: 'on', config: '{bad-json}' });
      const logger = createLoggerMock();

      await expect(
        getConversionResult(
          mockGwPolicyNumber,
          ConversionType.PSTAR_TO_GW,
          mockToken,
          mockContext as any,
          ffService as any,
          logger as any,
          {},
          'BEHIND_LOGIN' as any
        )
      ).rejects.toThrow(
        `Invalid JSON in Dynamic Configuration for feature flag '${Features.EFNOLPStarConversionStates}'`
      );

      expect(policyConversionCheckMock).not.toHaveBeenCalled();
    });

    it('returns noConversionResult when state is absent from the config map', async () => {
      const ffService = createFeatureFlagServiceMock();
      // AL is the inferred state but only GA is in the map
      ffService.getTreatmentWithConfig.mockResolvedValue({
        config: JSON.stringify({ GA: { auto: true } })
      });
      const logger = createLoggerMock();

      const result = await getConversionResult(
        mockPstarPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        mockContext as any,
        ffService as any,
        logger as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(result).toEqual(noConversionSentinel(mockPstarPolicyNumber));
      expect(policyConversionCheckMock).not.toHaveBeenCalled();
    });

    it('returns noConversionResult when state entry has auto=false', async () => {
      const ffService = createFeatureFlagServiceMock();
      ffService.getTreatmentWithConfig.mockResolvedValue({
        config: JSON.stringify({ AL: { auto: false } })
      });
      const logger = createLoggerMock();

      const result = await getConversionResult(
        mockPstarPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        mockContext as any,
        ffService as any,
        logger as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(result).toEqual(noConversionSentinel(mockPstarPolicyNumber));
      expect(policyConversionCheckMock).not.toHaveBeenCalled();
    });

    it('returns noConversionResult when state entry has no auto property', async () => {
      const ffService = createFeatureFlagServiceMock();
      ffService.getTreatmentWithConfig.mockResolvedValue({
        config: JSON.stringify({ AL: {} })
      });
      const logger = createLoggerMock();

      const result = await getConversionResult(
        mockPstarPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        mockContext as any,
        ffService as any,
        logger as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(result).toEqual(noConversionSentinel(mockPstarPolicyNumber));
      expect(policyConversionCheckMock).not.toHaveBeenCalled();
    });
  });

  describe('PSTAR_TO_GW — happy path (GW eligible)', () => {
    it('calls policyConversionCheck and returns its result for an eligible GW policy', async () => {
      const ffService = createFeatureFlagServiceMock();
      const logger = createLoggerMock();

      const result = await getConversionResult(
        mockGwPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        mockContext as any,
        ffService as any,
        logger as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(policyConversionCheckMock).toHaveBeenCalledWith(
        mockContext,
        mockGwPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        logger,
        {},
        'BEHIND_LOGIN',
        undefined
      );
      expect(result).toEqual(mockConversionResult);
    });

    it('passes the correct flag names to the feature flag service', async () => {
      const ffService = createFeatureFlagServiceMock();
      const logger = createLoggerMock();

      await getConversionResult(
        mockGwPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        mockContext as any,
        ffService as any,
        logger as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(ffService.getTreatmentWithConfig).toHaveBeenCalledWith(
        'efnol',
        'insuranceclaims_efnol_pstar-conversion-states'
      );
    });
  });

  describe('PSTAR_TO_GW — happy path (PStar eligible)', () => {
    it('calls policyConversionCheck directly without state check for PStar tenant', async () => {
      getTenantSpy.mockReturnValue({
        tenant: ITenant.POLICYSTAR,
        productType: 1 as any,
        clubCode: '001'
      });
      const pstarConversionResult = {
        ...mockConversionResult,
        legacyPolicyNumber: mockPstarPolicyNumber
      };
      policyConversionCheckMock.mockResolvedValue(pstarConversionResult);

      const ffService = createFeatureFlagServiceMock();
      const logger = createLoggerMock();

      const result = await getConversionResult(
        mockPstarPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        mockContext as any,
        ffService as any,
        logger as any,
        {},
        'BEHIND_LOGIN' as any
      );

      // State inference and config lookup must not be called for PStar
      expect(inferStateSpy).not.toHaveBeenCalled();
      expect(ffService.getTreatmentWithConfig).not.toHaveBeenCalled();

      expect(policyConversionCheckMock).toHaveBeenCalledWith(
        mockContext,
        mockPstarPolicyNumber,
        ConversionType.PSTAR_TO_GW,
        mockToken,
        logger,
        {},
        'BEHIND_LOGIN',
        undefined
      );
      expect(result).toEqual(pstarConversionResult);
    });
  });

  describe('unsupported conversion type', () => {
    it('returns noConversionResult for an unknown conversion type', async () => {
      const ffService = createFeatureFlagServiceMock();
      const logger = createLoggerMock();
      const unknownType = 'GW_RENEWAL' as unknown as ConversionType;

      const result = await getConversionResult(
        mockGwPolicyNumber,
        unknownType,
        mockToken,
        mockContext as any,
        ffService as any,
        logger as any,
        {},
        'BEHIND_LOGIN' as any
      );

      expect(result).toEqual({
        isConversionApplicable: false,
        legacyPolicyNumber: mockGwPolicyNumber,
        targetPolicyNumber: mockGwPolicyNumber,
        targetEffectiveDate: undefined,
        policyState: undefined,
        conversionType: unknownType
      });
      expect(getTenantSpy).not.toHaveBeenCalled();
      expect(policyConversionCheckMock).not.toHaveBeenCalled();
    });
  });
});
