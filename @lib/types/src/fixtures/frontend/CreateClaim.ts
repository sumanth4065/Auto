import { LossCause, LossType } from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  ICanonicalDriver,
  ICreateAutoClaimRequest,
  ICreateAutoClaimResponse
} from '../../contracts';
import { IVehicleViewModel } from '../../contracts';
import { CreateAutoClaimAPIResult } from '../../enums';

export const driverSummariesFixture: ICanonicalDriver[] = [
  {
    driverId: 'someUniqueId3',
    email: 'm@aa.com',
    firstName: 'MARIALITA',
    lastName: 'SAMAYOA',
    mobileNumber: '3211111111'
  },
  {
    driverId: 'someUniqueId4',
    email: 'l@aa.com',
    firstName: 'LILIANA',
    lastName: 'SAMAYOA',
    mobileNumber: '3212222222'
  }
];

export const vehicleSummariesFixture: IVehicleViewModel[] = [
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
  },
  {
    year: '2008',
    make: 'LINC',
    model: 'MKX',
    vin: '*************6441',
    RUNumber: 'RU678901'
  },
  {
    year: '2009',
    make: 'LINC',
    model: 'MKX',
    vin: '*************6441',
    RUNumber: 'RU678902'
  },
  {
    year: '2010',
    make: 'LINC',
    model: 'MKX',
    vin: '*************6441',
    RUNumber: 'RU678903'
  }
];

export const vehicleSummariesWithVehicleIdFixture: IVehicleViewModel[] = [
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
    vin: '*************6441'
  }
];

export const createAutoClaimRequestFixture: ICreateAutoClaimRequest = {
  lossDate: '2022-10-01T07:00:00.000Z',
  lossTime: '14:05',
  policy: {
    expirationDate: '2022-10-06T00:00:00.000Z',
    policyNumber: 'CAA047514589',
    policyType: 'CAA',
    effectiveDate: '2021-10-06T00:00:00.000Z'
  },
  lossType: LossType.AUTO,
  lossCause: LossCause.OTHERCOMP,
  isNotificationOnly: false,
  isMobileAppAccidentDetection: 'false'
};

export const createAutoClaimRequestFixtureACMO: ICreateAutoClaimRequest = {
  lossDate: '2022-10-01T07:00:00.000Z',
  lossTime: '14:05',
  policy: {
    expirationDate: '2025-10-06T00:00:00.000Z',
    policyNumber: 'AMO12345678',
    policyType: 'AMO',
    effectiveDate: '2024-04-01T00:00:00.000Z',
    priorPolicyNumber: 'MOA12345689'
  },
  lossType: LossType.AUTO,
  lossCause: LossCause.OTHERCOMP,
  isNotificationOnly: false,
  isMobileAppAccidentDetection: 'false'
};

export const createAutoClaimRequestFixtureTexas: ICreateAutoClaimRequest = {
  lossDate: '2024-11-05T07:00:00.000Z',
  lossTime: '14:05',
  policy: {
    expirationDate: '2025-10-06T00:00:00.000Z',
    policyNumber: 'ATX12345689',
    policyType: 'ATX',
    effectiveDate: '2024-11-01T00:00:00.000Z',
    priorPolicyNumber: 'TPA12345689'
  },
  lossType: LossType.AUTO,
  lossCause: LossCause.OTHERCOMP,
  isNotificationOnly: false,
  isMobileAppAccidentDetection: 'false'
};

export const createAutoClaimResponseFixture: ICreateAutoClaimResponse = {
  claimNumber: '005048510',
  APIResult: CreateAutoClaimAPIResult.Success,
  vehicleSummaries: [],
  driverSummaries: [],
  policyStatus: 'ACTIVE',
  policyType: 'CAA',
  policyState: 'CA',
  policyProduct: 'CAA'
};
export const createAutoClaimResponseFixtureWithVehicleId: ICreateAutoClaimResponse = {
  claimNumber: '005048510',
  APIResult: CreateAutoClaimAPIResult.Success,
  vehicleSummaries: [],
  driverSummaries: [],
  policyStatus: 'ACTIVE',
  policyType: 'CAA',
  policyState: 'CA',
  policyProduct: 'CAA'
};

export const createAutoClaimResponseWithDriversAndVehicles: ICreateAutoClaimResponse = {
  claimNumber: '005048510',
  driverSummaries: driverSummariesFixture,
  vehicleSummaries: vehicleSummariesFixture,
  APIResult: CreateAutoClaimAPIResult.Success,
  policyStatus: 'ACTIVE',
  policyType: 'CAA',
  policyState: 'CA',
  policyProduct: 'CAA'
};
