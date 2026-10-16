import { CreateAutoClaimAPIResult } from '../../../enums';
import {
  ICreateAutoClaimRequest,
  ICreateAutoClaimResponse
} from '../../../contracts/frontend/ICreateClaim';
import { LossCause, LossType } from '@ace-clublabs/iss-common-auto-efnol-models';

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

export const createAutoClaimResponseFixture: ICreateAutoClaimResponse = {
  claimNumber: '005048510',
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
      vin: '*************2379',
      RUNumber: 'RU67890'
    }
  ],
  driverSummaries: [
    {
      firstName: 'MARIALITA',
      lastName: 'SAMAYOA',
      driverId: 'someUniqueId3'
    },
    {
      firstName: 'LILIANA',
      lastName: 'SAMAYOA',
      driverId: 'someUniqueId4'
    }
  ],
  policyStatus: 'ACTIVE',
  policyType: 'CAA',
  policyState: 'CA',
  policyProduct: 'CAA',
  APIResult: CreateAutoClaimAPIResult.Success
};
