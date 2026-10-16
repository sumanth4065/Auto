import * as router from 'react-router';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { createAutoClaimResponseFixture } from '@lib/types';
import { mockPolicyNumber } from '@lib/types';
import { useCreateClaim } from './useCreateClaim';
import * as SourcesDictionary from '../../api/sources';
import { Sources } from '../../api/sources';
import dayjs from 'dayjs';
import { transformDateTimeFormat } from '../../utils/dayjsDateHelper';

let mockedFn = vi.fn();
const mockedDispatch = vi.fn();

const mockLossDateISO = '2024-05-09T02:00:00-07:00';

const lossDateTimeFormat = transformDateTimeFormat(dayjs('05/09/2024'), '02:00');
const lossTimeUTC = '02:00';
describe('useCreateClaim', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        policyNumber: mockPolicyNumber,
        incidentDate: dayjs('05/09/2024'),
        incidentTime: '02:00:00',
        lossDateFormat: lossDateTimeFormat,
        lossDateISO: mockLossDateISO,
        token: 'some-token',
        expirationDate: '1970-01-01T00:00:00.000Z',
        effectiveDate: '2024-01-01T00:00:00.000Z',
        duplicatedClaim: false
      },
      mockedDispatch
    ]);
    vi.spyOn(SourcesDictionary, 'sources').mockImplementation(
      () =>
        ({
          createAutoClaim: mockedFn
        }) as unknown as Sources
    );
  });
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('Should not execute the call when shouldExecute is false', () => {
    const { result, waitForNextUpdate } = renderHook(() => useCreateClaim(false));
    expect(result.current).toEqual({
      error: null,
      loading: true
    });
    expect(mockedFn).not.toBeCalled();
  });

  it('test custom hook lifecycle with vehicles that have RUNumber', async () => {
    mockedFn.mockImplementation(() => createAutoClaimResponseFixture);
    const { result, waitForNextUpdate } = renderHook(() => useCreateClaim(true));
    expect(result.current).toEqual({
      error: null,
      loading: true
    });
    expect(mockedFn).toHaveBeenCalledWith({
      isNotificationOnly: false,
      lossCause: 'othercomp',
      lossDate: mockLossDateISO,
      lossTime: lossTimeUTC,
      lossType: 'AUTO',
      policy: {
        effectiveDate: '2024-01-01T00:00:00.000Z',
        expirationDate: '1970-01-01T00:00:00.000Z',
        policyNumber: mockPolicyNumber,
        resolvedPolicyNumber: mockPolicyNumber,
        policyType: 'RIA'
      }
    });
    await waitForNextUpdate();
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CREATE_CLAIM_INFORMATION',
      payload: {
        claimNumber: createAutoClaimResponseFixture.claimNumber,
        driverSummaries: [],
        vehicleOptions: [],
        vehicleSummaries: [],
        policyStatus: 'ACTIVE',
        policyType: 'CAA',
        policyState: 'CA',
        policyProduct: 'CAA'
      }
    });
    expect(result.current).toEqual({
      loading: false,
      error: null
    });
  });

  it('Should populate error state if something happens fetching create-claim', async () => {
    mockedFn.mockImplementation(() => {
      return Promise.reject({
        ErrorMessage: {
          error: {
            message: 'system error'
          }
        }
      });
    });
    const { result, waitForNextUpdate } = renderHook(() => useCreateClaim(true));
    expect(result.current).toEqual({
      error: null,
      loading: true
    });
    expect(mockedFn).toHaveBeenCalledWith({
      isNotificationOnly: false,
      lossCause: 'othercomp',
      lossDate: mockLossDateISO,
      lossTime: lossTimeUTC,
      lossType: 'AUTO',
      policy: {
        effectiveDate: '2024-01-01T00:00:00.000Z',
        expirationDate: '1970-01-01T00:00:00.000Z',
        policyNumber: mockPolicyNumber,
        resolvedPolicyNumber: mockPolicyNumber,
        policyType: 'RIA'
      }
    });
    await waitForNextUpdate();
    expect(result.current).toEqual({
      error: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useCreateClaim'
      },
      loading: false
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SERIALIZED_ERROR',
      payload: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useCreateClaim'
      }
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR_REASON',
      payload: 'system error'
    });
  });

  it('Should populate knockout state if something happens fetching create-claim', async () => {
    mockedFn.mockImplementation(() => {
      return Promise.reject({
        ErrorMessage: {
          error: {
            message: 'system error'
          }
        }
      });
    });
    const { result, waitForNextUpdate } = renderHook(() => useCreateClaim(true));
    expect(result.current).toEqual({
      error: null,
      loading: true
    });
    expect(mockedFn).toHaveBeenCalledWith({
      isNotificationOnly: false,
      lossCause: 'othercomp',
      lossDate: mockLossDateISO,
      lossTime: lossTimeUTC,
      lossType: 'AUTO',
      policy: {
        effectiveDate: '2024-01-01T00:00:00.000Z',
        expirationDate: '1970-01-01T00:00:00.000Z',
        policyNumber: mockPolicyNumber,
        resolvedPolicyNumber: mockPolicyNumber,
        policyType: 'RIA'
      }
    });
    await waitForNextUpdate();
    expect(result.current).toEqual({
      error: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useCreateClaim'
      },
      loading: false
    });
  });

  it('test custom hook lifecycle with GW policy that has priorPolicyNumber and RUNumber', async () => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        policyNumber: mockPolicyNumber,
        incidentDate: dayjs('05/09/2024'),
        incidentTime: '02:00:00',
        lossDateFormat: lossDateTimeFormat,
        lossDateISO: mockLossDateISO,
        token: 'some-token',
        expirationDate: '1970-01-01T00:00:00.000Z',
        effectiveDate: '2024-01-01T00:00:00.000Z',
        priorPolicyNumber: undefined
      },
      mockedDispatch
    ]);

    mockedFn.mockImplementation(() => createAutoClaimResponseFixture);
    const { result, waitForNextUpdate } = renderHook(() => useCreateClaim(true));
    expect(result.current).toEqual({
      error: null,
      loading: true
    });
    expect(mockedFn).toHaveBeenCalledWith({
      isNotificationOnly: false,
      lossCause: 'othercomp',
      lossDate: mockLossDateISO,
      lossTime: lossTimeUTC,
      lossType: 'AUTO',
      policy: {
        effectiveDate: '2024-01-01T00:00:00.000Z',
        expirationDate: '1970-01-01T00:00:00.000Z',
        policyNumber: mockPolicyNumber,
        resolvedPolicyNumber: mockPolicyNumber,
        policyType: 'RIA',
        priorPolicyNumber: undefined
      }
    });
    await waitForNextUpdate();
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CREATE_CLAIM_INFORMATION',
      payload: {
        claimNumber: createAutoClaimResponseFixture.claimNumber,
        driverSummaries: [],
        vehicleOptions: [],
        vehicleSummaries: [],
        policyStatus: 'ACTIVE',
        policyType: 'CAA',
        policyState: 'CA',
        policyProduct: 'CAA'
      }
    });
    expect(result.current).toEqual({
      loading: false,
      error: null
    });
  });

  it('test custom hook lifecycle with vehicles without RUNumber', async () => {
    // Create a mock response for API 1 (vehicleId instead of RUNumber)
    const createAutoClaimResponseWithVehicleId = {
      ...createAutoClaimResponseFixture,
      vehicleSummaries: [
        {
          year: '2001',
          make: 'FORD',
          model: 'F350 CREW C CREW',
          vehicleId: 'someUniqueId1',
          vin: '*************6441'
        },
        {
          year: '2007',
          make: 'LINC',
          model: 'MKX',
          vehicleId: 'someUniqueId2',
          vin: '*************2379'
        }
      ]
    };

    mockedFn.mockImplementation(() => createAutoClaimResponseWithVehicleId);
    const { result, waitForNextUpdate } = renderHook(() => useCreateClaim(true));
    expect(result.current).toEqual({
      error: null,
      loading: true
    });
    expect(mockedFn).toHaveBeenCalledWith({
      isNotificationOnly: false,
      lossCause: 'othercomp',
      lossDate: mockLossDateISO,
      lossTime: lossTimeUTC,
      lossType: 'AUTO',
      policy: {
        effectiveDate: '2024-01-01T00:00:00.000Z',
        expirationDate: '1970-01-01T00:00:00.000Z',
        policyNumber: mockPolicyNumber,
        resolvedPolicyNumber: mockPolicyNumber,
        policyType: 'RIA',
        priorPolicyNumber: undefined
      }
    });
    await waitForNextUpdate();
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CREATE_CLAIM_INFORMATION',
      payload: {
        claimNumber: createAutoClaimResponseWithVehicleId.claimNumber,
        driverSummaries: [],
        vehicleOptions: createAutoClaimResponseWithVehicleId.vehicleSummaries.map(vehicle => ({
          ...vehicle,
          vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
        })),
        vehicleSummaries: createAutoClaimResponseWithVehicleId.vehicleSummaries,
        policyStatus: 'ACTIVE',
        policyType: 'CAA',
        policyState: 'CA',
        policyProduct: 'CAA'
      }
    });
    expect(result.current).toEqual({
      loading: false,
      error: null
    });
  });

  it('test custom hook lifecycle with drivers and vehicles in response (legacy flow)', async () => {
    const { createAutoClaimResponseWithDriversAndVehicles } = await import('@lib/types');

    mockedFn.mockImplementation(() => ({
      ...createAutoClaimResponseWithDriversAndVehicles,
      vehicleSummaries: [
        {
          year: '2001',
          make: 'FORD',
          model: 'F350 CREW C CREW',
          vin: '*************6441',
          RUNumber: 'RU12345'
        },
        {
          year: '2007',
          make: 'LINC',
          model: 'MKX',
          vin: '*************6441',
          RUNumber: 'RU67890'
        }
      ]
    }));
    const { result, waitForNextUpdate } = renderHook(() => useCreateClaim(true));
    expect(result.current).toEqual({
      error: null,
      loading: true
    });

    await waitForNextUpdate();

    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CREATE_CLAIM_INFORMATION',
      payload: {
        claimNumber: createAutoClaimResponseWithDriversAndVehicles.claimNumber,
        driverSummaries: [
          {
            driverId: 'someUniqueId3',
            id: 'someUniqueId3',
            email: 'm@aa.com',
            firstName: 'MARIALITA',
            lastName: 'SAMAYOA',
            mobileNumber: '3211111111'
          },
          {
            driverId: 'someUniqueId4',
            id: 'someUniqueId4',
            email: 'l@aa.com',
            firstName: 'LILIANA',
            lastName: 'SAMAYOA',
            mobileNumber: '3212222222'
          }
        ],
        vehicleSummaries: [
          {
            year: '2001',
            make: 'FORD',
            model: 'F350 CREW C CREW',
            vin: '*************6441',
            RUNumber: 'RU12345'
          },
          {
            year: '2007',
            make: 'LINC',
            model: 'MKX',
            vin: '*************6441',
            RUNumber: 'RU67890'
          }
        ],
        vehicleOptions: [
          {
            year: '2001',
            make: 'FORD',
            model: 'F350 CREW C CREW',
            vin: '*************6441',
            RUNumber: 'RU12345',
            vehicleTitle: '2001 FORD F350 CREW C CREW'
          },
          {
            year: '2007',
            make: 'LINC',
            model: 'MKX',
            vin: '*************6441',
            RUNumber: 'RU67890',
            vehicleTitle: '2007 LINC MKX'
          }
        ],
        policyStatus: 'ACTIVE',
        policyType: 'CAA',
        policyState: 'CA',
        policyProduct: 'CAA'
      }
    });
    expect(result.current).toEqual({
      loading: false,
      error: null
    });
  });

  it('should map emailAddress/phoneNumber from policy retrieval to email/mobileNumber', async () => {
    const responseWithCanonicalDrivers = {
      ...createAutoClaimResponseFixture,
      driverSummaries: [
        {
          firstName: 'JOHN',
          lastName: 'DOE',
          driverId: 'driver-1',
          emailAddress: 'john@example.com',
          phoneNumber: '5551234567'
        }
      ]
    };

    mockedFn.mockImplementation(() => responseWithCanonicalDrivers);
    const { result, waitForNextUpdate } = renderHook(() => useCreateClaim(true));

    await waitForNextUpdate();

    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CREATE_CLAIM_INFORMATION',
      payload: expect.objectContaining({
        driverSummaries: [
          expect.objectContaining({
            firstName: 'JOHN',
            lastName: 'DOE',
            driverId: 'driver-1',
            id: 'driver-1',
            email: 'john@example.com',
            mobileNumber: '5551234567'
          })
        ]
      })
    });
  });

  it('should populate insuredFullName in the state when it is present in the response', async () => {
    mockedFn.mockImplementation(() => ({
      ...createAutoClaimResponseFixture,
      insuredFullName: 'John Doe'
    }));

    const { result, waitForNextUpdate } = renderHook(() => useCreateClaim(true));

    expect(result.current).toEqual({
      error: null,
      loading: true
    });

    await waitForNextUpdate();

    expect(result.current).toEqual({
      loading: false,
      error: null
    });

    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CREATE_CLAIM_INFORMATION',
      payload: {
        claimNumber: '005048510',
        driverSummaries: [],
        vehicleOptions: [],
        vehicleSummaries: [],
        insuredFullName: 'John Doe',
        policyStatus: 'ACTIVE',
        policyType: 'CAA',
        policyState: 'CA',
        policyProduct: 'CAA'
      }
    });
  });

  describe('policy number resolution via conversion', () => {
    it('uses legacyPolicyNumber when loss date is before conversion effective date', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          policyNumber: mockPolicyNumber,
          lossDateFormat: lossDateTimeFormat,
          lossDateISO: '2024-12-15T10:00:00-07:00', // before 2025-01-01
          token: 'some-token',
          expirationDate: '1970-01-01T00:00:00.000Z',
          effectiveDate: '2024-01-01T00:00:00.000Z',
          duplicatedClaim: false,
          conversionResult: {
            isConversionApplicable: true,
            legacyPolicyNumber: 'LEGACY-001',
            targetPolicyNumber: 'GW-001',
            targetEffectiveDate: '2025-01-01T00:00:00.000Z'
          }
        },
        mockedDispatch
      ]);

      mockedFn.mockImplementation(() => createAutoClaimResponseFixture);
      const { waitForNextUpdate } = renderHook(() => useCreateClaim(true));
      await waitForNextUpdate();

      expect(mockedFn).toHaveBeenCalledWith(
        expect.objectContaining({
          policy: expect.objectContaining({
            policyNumber: mockPolicyNumber,
            resolvedPolicyNumber: 'LEGACY-001'
          })
        })
      );
    });

    it('uses targetPolicyNumber when loss date is on or after conversion effective date', async () => {
      vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
        {
          policyNumber: mockPolicyNumber,
          lossDateFormat: lossDateTimeFormat,
          lossDateISO: '2025-01-01T10:00:00-07:00', // on boundary
          token: 'some-token',
          expirationDate: '1970-01-01T00:00:00.000Z',
          effectiveDate: '2024-01-01T00:00:00.000Z',
          duplicatedClaim: false,
          conversionResult: {
            isConversionApplicable: true,
            legacyPolicyNumber: 'LEGACY-001',
            targetPolicyNumber: 'GW-001',
            targetEffectiveDate: '2025-01-01T00:00:00.000Z'
          }
        },
        mockedDispatch
      ]);

      mockedFn.mockImplementation(() => createAutoClaimResponseFixture);
      const { waitForNextUpdate } = renderHook(() => useCreateClaim(true));
      await waitForNextUpdate();

      expect(mockedFn).toHaveBeenCalledWith(
        expect.objectContaining({
          policy: expect.objectContaining({
            policyNumber: mockPolicyNumber,
            resolvedPolicyNumber: 'GW-001'
          })
        })
      );
    });
  });

  it('should not call createAutoClaim when a claim was already submitted in session', async () => {
    mockedFn.mockClear();
    mockedDispatch.mockClear();
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        policyNumber: mockPolicyNumber,
        incidentDate: dayjs('05/09/2024'),
        incidentTime: '02:00:00',
        lossDateFormat: lossDateTimeFormat,
        token: 'some-token',
        expirationDate: '1970-01-01T00:00:00.000Z',
        effectiveDate: '2024-01-01T00:00:00.000Z',
        claimSubmittedForClaimNumber: 'CLM-12345'
      },
      mockedDispatch
    ]);
    mockedFn.mockReset();

    const { result } = renderHook(() => useCreateClaim(true));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedFn).not.toHaveBeenCalled();
    expect(mockedDispatch).not.toHaveBeenCalled();
    expect(result.current).toEqual({
      loading: false,
      error: null
    });
  });
});
