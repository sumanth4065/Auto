import { APIResult } from '../../enums';
import {
  IClaimsSummaryFrontendResponse,
  IClaimStatus
} from '../../contracts/frontend/IGetAutoClaim';

export const foundClaimInfoResponseFixture: IClaimsSummaryFrontendResponse = {
  APIResult: APIResult.Success,
  duplicateClaimExists: true,
  claimFound: {
    insuredVehicleName: 'Chevrolet C-1500 XCAB : BASE',
    claimNumber: '123456',
    reportedDate: 'January 8, 2025',
    lossDate: 'January 30, 2024',
    deductibleStatus: '',
    lossType: 'Auto',
    lossCause: 'Other than listed losses (COLL)',
    claimStatus: IClaimStatus.Open,
    incidentLocationStreet: '',
    adjuster: {
      displayName: 'James Bond',
      firstName: 'James',
      lastName: 'Bond',
      phoneNumber: '562-221-9596',
      email: 'james.bond@test.com',
      extension: '4455'
    }
  }
};

export const notFoundClaimInfoResponseFixture: IClaimsSummaryFrontendResponse = {
  APIResult: APIResult.Success,
  duplicateClaimExists: false,
  claimFound: undefined
};
