import { GetPolicyInfoAPIResult } from '../../enums';
import { ISafeliteRedirectUrlRequest } from './IGetSafeliteRedirectUrl';

export interface IConversionInfo {
  toSystem?: string;
  toPolicyId?: string;
  fromSystem?: string;
  fromPolicyId?: string;
}
export interface IPolicyGeneralInfo {
  policyType: string;
  policyClass: string;
  termEffectiveDate: string;
  termExpirationDate: string;
  inceptionDate?: string; //Not used in Web
  status?: string; //Not used in Web
  priorPolicyNumber?: string;
}

export interface IAutoPolicySummary {
  policyGeneralInfo: IPolicyGeneralInfo;
}

// TO-DO:Rename the following interface to IAutoPolicyInfoResponse
export interface IPolicyInfoAutoResponse {
  APIResult: GetPolicyInfoAPIResult;
  data: IAutoPolicySummary;
}

export interface IGetAutoPolicyInfoRequest extends ISafeliteRedirectUrlRequest {}
