import {
  CarKineticStatus,
  IAutoSubmitClaimCanonicalRequestV2,
  PassengerCount,
  YesNoUnknown
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { SubmitAutoClaimFrontendResult, SubmitAutoClaimValidationResult } from '../../enums';
import { LoginFlowType } from '@lib/shared-contracts';

import { IAdjuster, IReporter } from '../IShared';

export interface IOtherPartyInsuranceInfo {
  companyName: string;
  policyNumber?: string;
}

export interface ILossVehicle {
  vehicleId: string;
  vehicleDrivenOrParked: CarKineticStatus;
  damageDescription: string;
  incidentDriverId?: string;
  passengerCount?: PassengerCount;
  hadInjuries?: YesNoUnknown;
  towed?: YesNoUnknown;
}

export interface IBasicVehicleInfo {
  year: number;
  make: string;
  model: string;
}

export interface IPersonInfo {
  firstName: string;
  lastName: string;
  mobilePhone?: string;
}
export interface ISingleOtherVehicleInfo {
  wasSomeoneDrivingOtherVehicle?: YesNoUnknown;
  passengerCount?: PassengerCount;
  hadInjuries?: YesNoUnknown;
  vehicleInfo?: IBasicVehicleInfo;
  insuranceCompany?: IOtherPartyInsuranceInfo;
  driver?: IPersonInfo;
}

export interface ISubmitAutoClaimFrontendRequest extends IAutoSubmitClaimCanonicalRequestV2 {
  // Following attributes just for V1
  lossTime?: string;
  lossDate?: string;
  isMobileAppAccidentDetection?: string;
  loginFlowType?: LoginFlowType;
  resolvedPolicyNumber?: string;
}
export interface ISubmitAutoClaimFrontendResponse {
  APIResult: SubmitAutoClaimFrontendResult;
  adjuster?: IAdjuster;
}

export interface ISubmitAutoClaimRequestValidatorResult {
  isValid: boolean;
  resultType: SubmitAutoClaimValidationResult;
}
