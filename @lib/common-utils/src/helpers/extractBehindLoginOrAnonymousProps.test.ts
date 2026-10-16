import * as issCommonLambdaV3 from '@ace-clublabs/iss-common-lambda-v3';
import * as awsLambdaLogger from '@ace-clublabs/aws-lambda-logger';
import { EfnolApplication } from '@ace-clublabs/iss-common-auto-efnol-models';
import { LoginFlowType } from '@lib/shared-contracts';
import * as TokenHelper from './TokenHelper';
import { extractBehindLoginOrAnonymousProps } from './extractBehindLoginOrAnonymousProps';

// Mock dependencies
jest.mock('@ace-clublabs/aws-lambda-logger', () => {
  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
  return {
    MaskedLogger: {
      getInstance: jest.fn(() => mockLogger)
    },
    __mockLogger: mockLogger
  };
});

jest.mock('@ace-clublabs/iss-common-lambda-v3', () => {
  const mockFindItem = jest.fn();
  const mockCacheInstance = {
    findItem: mockFindItem
  };
  return {
    Cache: jest.fn(() => mockCacheInstance),
    __mockCache: mockCacheInstance,
    __mockFindItem: mockFindItem
  };
});

jest.mock('./TokenHelper');

describe('extractBehindLoginOrAnonymousProps', () => {
  const extractPolicyNumberFromTokenSpy = jest.spyOn(TokenHelper, 'extractPolicyNumberFromToken');
  const mockLogger = (awsLambdaLogger as any).__mockLogger;
  const mockFindItem = (issCommonLambdaV3 as any).__mockFindItem;
  const mockCache = (issCommonLambdaV3 as any).__mockCache;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when policyGuid is null (anonymous flow)', () => {
    it('should return policy number and Anonymous loginFlowType when token contains valid policy number', async () => {
      const token = 'valid-token';
      const validPolicyNumber = 'ABC123456789';
      extractPolicyNumberFromTokenSpy.mockReturnValue(validPolicyNumber);

      const result = await extractBehindLoginOrAnonymousProps(null, token);

      expect(extractPolicyNumberFromTokenSpy).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        policyNumber: validPolicyNumber,
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
      });
      expect(mockFindItem).not.toHaveBeenCalled();
    });

    it('should return policy number and Anonymous loginFlowType when token contains valid star policy number', async () => {
      const token = 'valid-token';
      const validStarPolicyNumber = 'A12345678';
      extractPolicyNumberFromTokenSpy.mockReturnValue(validStarPolicyNumber);

      const result = await extractBehindLoginOrAnonymousProps(null, token);

      expect(extractPolicyNumberFromTokenSpy).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        policyNumber: validStarPolicyNumber,
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
      });
      expect(mockFindItem).not.toHaveBeenCalled();
    });

    it('should return policy number and Anonymous loginFlowType when token contains valid WInsurance policy number', async () => {
      const token = 'valid-token';
      const validWInsurancePolicyNumber = '10000080';
      extractPolicyNumberFromTokenSpy.mockReturnValue(validWInsurancePolicyNumber);

      const result = await extractBehindLoginOrAnonymousProps(null, token);

      expect(result).toEqual({
        policyNumber: validWInsurancePolicyNumber,
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
      });
    });

    it('should throw error when token contains invalid policy number', async () => {
      const token = 'valid-token';
      const invalidPolicyNumber = 'INVALID123';
      extractPolicyNumberFromTokenSpy.mockReturnValue(invalidPolicyNumber);

      await expect(extractBehindLoginOrAnonymousProps(null, token)).rejects.toThrow(
        'Invalid AnonymousPolicy Number'
      );

      expect(extractPolicyNumberFromTokenSpy).toHaveBeenCalledWith(token);
      expect(mockFindItem).not.toHaveBeenCalled();
    });

    // it('should throw error when token extraction returns null', async () => {
    //   const token = 'valid-token';
    //   extractPolicyNumberFromTokenSpy.mockReturnValue(null);

    //   await expect(
    //     extractBehindLoginOrAnonymousProps(null, token)
    //   ).rejects.toThrow('Invalid AnonymousPolicy Number');

    //   expect(extractPolicyNumberFromTokenSpy).toHaveBeenCalledWith(token);
    // });

    // it('should throw error when token extraction returns undefined', async () => {
    //   const token = 'valid-token';
    //   extractPolicyNumberFromTokenSpy.mockReturnValue(undefined);

    //   await expect(
    //     extractBehindLoginOrAnonymousProps(null, token)
    //   ).rejects.toThrow('Invalid AnonymousPolicy Number');

    //   expect(extractPolicyNumberFromTokenSpy).toHaveBeenCalledWith(token);
    // });

    it('should throw error when token extraction returns empty string', async () => {
      const token = 'valid-token';
      extractPolicyNumberFromTokenSpy.mockReturnValue('');

      await expect(extractBehindLoginOrAnonymousProps(null, token)).rejects.toThrow(
        'Invalid AnonymousPolicy Number'
      );

      expect(extractPolicyNumberFromTokenSpy).toHaveBeenCalledWith(token);
    });
  });

  describe('when policyGuid is a valid GUID', () => {
    const validGuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

    it('should return policy number and BehindLogin loginFlowType from cache when item exists', async () => {
      const token = 'some-token';
      const expectedCachePolicyNumber = 'CAA000154017';
      const mockCacheResponse = {
        Count: 1,
        Items: [
          {
            data: {
              S: '{"policy":"CAA000154017","clubCode":"004","mode":"AUTO","origin":"efnol","pcf":"true","testRegion":"A1"}'
            },
            ttl: {
              N: '1767836709'
            },
            claimId: {
              S: 'SFR-YMD-AwM-TU0-MDE-3'
            }
          }
        ]
      };

      mockFindItem.mockResolvedValue(mockCacheResponse);

      const result = await extractBehindLoginOrAnonymousProps(validGuid, token);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Calling ISSCache to get Behind Login Policy Number'
      );
      expect(mockFindItem).toHaveBeenCalledWith(validGuid);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Response received from BL claims iss cache',
        expect.anything()
      );
      expect(result).toEqual({
        policyNumber: expectedCachePolicyNumber,
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
        clubCode: '004'
      });
      expect(extractPolicyNumberFromTokenSpy).not.toHaveBeenCalled();
    });

    it('should return undefined clubCode when cache payload does not include clubCode', async () => {
      const token = 'some-token';
      const mockCacheResponse = {
        Count: 1,
        Items: [
          {
            data: {
              S: '{"policy":"CAA000154017"}'
            }
          }
        ]
      };

      mockFindItem.mockResolvedValue(mockCacheResponse);
      const result = await extractBehindLoginOrAnonymousProps(validGuid, token);

      expect(result).toEqual({
        policyNumber: 'CAA000154017',
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
        clubCode: undefined
      });
    });

    it('should throw error when cache returns count 0', async () => {
      const token = 'some-token';
      const mockCacheResponse = {
        Count: 0,
        Items: []
      };

      mockFindItem.mockResolvedValue(mockCacheResponse);

      await expect(extractBehindLoginOrAnonymousProps(validGuid, token)).rejects.toThrow(
        `Behind Login Policy Number not found with guid: ${validGuid}.`
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        `Policy number not found with guid: ${validGuid}.`
      );
      expect(mockFindItem).toHaveBeenCalledWith(validGuid);
      expect(extractPolicyNumberFromTokenSpy).not.toHaveBeenCalled();
    });

    it('should throw error when cache returns undefined count', async () => {
      const token = 'some-token';
      const mockCacheResponse = {
        Count: undefined,
        Items: []
      };

      mockFindItem.mockResolvedValue(mockCacheResponse);

      await expect(extractBehindLoginOrAnonymousProps(validGuid, token)).rejects.toThrow(
        `Behind Login Policy Number not found with guid: ${validGuid}.`
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        `Policy number not found with guid: ${validGuid}.`
      );
      expect(mockFindItem).toHaveBeenCalledWith(validGuid);
    });

    it('should throw error when cache response is null', async () => {
      const token = 'some-token';
      mockFindItem.mockResolvedValue(null);

      await expect(extractBehindLoginOrAnonymousProps(validGuid, token)).rejects.toThrow(
        `Behind Login Policy Number not found with guid: ${validGuid}.`
      );

      expect(mockFindItem).toHaveBeenCalledWith(validGuid);
    });

    it('should throw error when cache response is undefined', async () => {
      const token = 'some-token';
      mockFindItem.mockResolvedValue(undefined);

      await expect(extractBehindLoginOrAnonymousProps(validGuid, token)).rejects.toThrow(
        `Behind Login Policy Number not found with guid: ${validGuid}.`
      );

      expect(mockFindItem).toHaveBeenCalledWith(validGuid);
    });

    it('should handle cache response with empty Items array', async () => {
      const token = 'some-token';
      const mockCacheResponse = {
        Count: 1,
        Items: []
      };

      mockFindItem.mockResolvedValue(mockCacheResponse);

      await expect(extractBehindLoginOrAnonymousProps(validGuid, token)).rejects.toThrow(
        `Cache item or its data is missing for guid: ${validGuid}.`
      );

      expect(mockFindItem).toHaveBeenCalledWith(validGuid);
    });

    it('should throw a descriptive error when cache item is missing data.S', async () => {
      const token = 'some-token';
      const mockCacheResponse = {
        Count: 1,
        Items: [{ ttl: { N: '1767836709' } }]
      };

      mockFindItem.mockResolvedValue(mockCacheResponse);

      await expect(extractBehindLoginOrAnonymousProps(validGuid, token)).rejects.toThrow(
        `Cache item or its data is missing for guid: ${validGuid}.`
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        `Cache item or its data is missing for guid: ${validGuid}.`
      );
    });

    it('should throw a descriptive error when cache item data.S is invalid JSON', async () => {
      const token = 'some-token';
      const mockCacheResponse = {
        Count: 1,
        Items: [{ data: { S: 'not-valid-json' } }]
      };

      mockFindItem.mockResolvedValue(mockCacheResponse);

      await expect(extractBehindLoginOrAnonymousProps(validGuid, token)).rejects.toThrow(
        `Failed to parse cache data for guid: ${validGuid}.`
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        `Failed to parse cache data for guid: ${validGuid}.`,
        expect.objectContaining({ parseError: expect.any(Error) })
      );
    });

    it('should not reject UUIDv4 policyGuid format', async () => {
      const token = 'some-token';
      const uuidPolicyGuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const mockCacheResponse = {
        Count: 1,
        Items: [
          {
            data: {
              S: '{"policy":"CAA000154017"}'
            }
          }
        ]
      };

      mockFindItem.mockResolvedValue(mockCacheResponse);
      await expect(
        extractBehindLoginOrAnonymousProps(uuidPolicyGuid, token)
      ).resolves.toEqual({
        policyNumber: 'CAA000154017',
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
        clubCode: undefined
      });
    });

    it('should handle different GUID formats that match the pattern', async () => {
      const token = 'some-token';
      const guidVariations = [
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '123e4567-e89b-12d3-a456-426614174000',
        'abc-123-XyZ-456-789-0',
        'ABC-DEF-GHI-JKL-MNO-P',
        'a1b-2c3-4d5-6e7-8f9-g',
        '000-111-222-333-444-5'
      ];

      for (const guid of guidVariations) {
        const expectedCachedPolicyNumber = 'CAA000154017';
        const mockCacheResponse = {
          Count: 1,
          Items: [
            {
              data: {
                S: '{"policy":"CAA000154017","clubCode":"004","mode":"AUTO","origin":"efnol","pcf":"true","testRegion":"A1"}'
              },
              ttl: {
                N: '1767836709'
              },
              claimId: {
                S: 'SFR-YMD-AwM-TU0-MDE-3'
              }
            }
          ]
        };

        mockFindItem.mockResolvedValue(mockCacheResponse);
        jest.clearAllMocks();

        const result = await extractBehindLoginOrAnonymousProps(guid, token);
        expect(result).toEqual({
          policyNumber: expectedCachedPolicyNumber,
          loginFlowType: LoginFlowType.BEHIND_LOGIN,
          efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
          clubCode: '004'
        });
      }
    });

    it('should continue to support legacy encoded GUID format', async () => {
      const token = 'some-token';
      const legacyGuid = 'SEl-IMT-c3M-jg4-MzM-2';
      const mockCacheResponse = {
        Count: 1,
        Items: [
          {
            data: {
              S: '{"policy":"CAA000154017","clubCode":"004","mode":"AUTO","origin":"efnol","pcf":"true","testRegion":"A1"}'
            }
          }
        ]
      };

      mockFindItem.mockResolvedValue(mockCacheResponse);
      const result = await extractBehindLoginOrAnonymousProps(legacyGuid, token);
      expect(result).toEqual({
        policyNumber: 'CAA000154017',
        loginFlowType: LoginFlowType.BEHIND_LOGIN,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
        clubCode: '004'
      });
    });
  });

  describe('when policyGuid is invalid (not a GUID and not null)', () => {
    it('should throw error for invalid policyGuid format', async () => {
      const invalidGuid = 'invalid-guid-format';
      const token = 'some-token';

      await expect(extractBehindLoginOrAnonymousProps(invalidGuid, token)).rejects.toThrow(
        'Invalid Guid or Policy Number'
      );

      expect(mockLogger.warn).toHaveBeenCalledWith('Invalid Guid or Behind Login Policy Number', {
        policyGuid: invalidGuid
      });
      expect(mockFindItem).not.toHaveBeenCalled();
      expect(extractPolicyNumberFromTokenSpy).not.toHaveBeenCalled();
    });

    it('should throw error for empty string policyGuid (treated as null)', async () => {
      const emptyGuid = '';
      const token = 'some-token';
      extractPolicyNumberFromTokenSpy.mockReturnValue('INVALID');

      await expect(extractBehindLoginOrAnonymousProps(emptyGuid, token)).rejects.toThrow(
        'Invalid AnonymousPolicy Number'
      );

      expect(extractPolicyNumberFromTokenSpy).toHaveBeenCalledWith(token);
    });

    it('should throw error for policyGuid with wrong segment lengths', async () => {
      const wrongLengthGuid = 'ABC-123-456-789-0123-4';
      const token = 'some-token';

      await expect(extractBehindLoginOrAnonymousProps(wrongLengthGuid, token)).rejects.toThrow(
        'Invalid Guid or Policy Number'
      );
    });

    it('should throw error for policyGuid with special characters', async () => {
      const specialCharGuid = 'ABC-123-456-789-012-@';
      const token = 'some-token';

      await expect(extractBehindLoginOrAnonymousProps(specialCharGuid, token)).rejects.toThrow(
        'Invalid Guid or Policy Number'
      );
    });

    it('should throw error for policyGuid with too many segments', async () => {
      const tooManySegments = 'ABC-123-456-789-012-3-4';
      const token = 'some-token';

      await expect(extractBehindLoginOrAnonymousProps(tooManySegments, token)).rejects.toThrow(
        'Invalid Guid or Policy Number'
      );
    });

    it('should throw error for policyGuid with too few segments', async () => {
      const tooFewSegments = 'ABC-123-456-789-012';
      const token = 'some-token';

      await expect(extractBehindLoginOrAnonymousProps(tooFewSegments, token)).rejects.toThrow(
        'Invalid Guid or Policy Number'
      );
    });
  });
});

