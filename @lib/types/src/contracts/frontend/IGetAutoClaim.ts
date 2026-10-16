import { ICanonicalAdjuster } from '@ace-clublabs/iss-common-auto-efnol-models';
import { APIResult } from '../../enums';
export enum IClaimStatus {
  Open = 'open',
  Closed = 'closed'
}
export interface IClaimsSummaryFrontendResponse {
  APIResult: APIResult;
  duplicateClaimExists: boolean;
  claimFound?: IClaimsStatusViewModel;
}
export interface IClaimsStatusViewModel {
  insuredVehicleName: string;
  claimNumber: string;
  reportedDate: string;
  lossDate: string;
  deductibleStatus: string;
  lossType: string;
  lossCause: string;
  claimStatus: IClaimStatus;
  incidentLocationStreet: string;
  adjuster: ICanonicalAdjuster;
}
