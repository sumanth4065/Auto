import {
  LossCause,
  LossType,
  IAutoCreateClaimCanonicalResponseV2
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { CreateAutoClaimAPIResult } from '../../enums';

import { IVehicleViewModel, IPolicyViewModel } from '../IShared';

// Use the canonical driver type from the create claim v2 response as the source of truth
export type ICanonicalDriver = NonNullable<
  IAutoCreateClaimCanonicalResponseV2['driverSummaries']
>[number];

export interface ICreateAutoClaimRequest {
  policy: IPolicyViewModel;
  lossDate: string;
  lossTime: string;
  lossType: LossType;
  lossCause: LossCause;
  isNotificationOnly: boolean;
  isMobileAppAccidentDetection?: string;
}

export interface ICreateAutoClaimResponse {
  APIResult: CreateAutoClaimAPIResult;
  claimNumber: string;
  vehicleSummaries: IVehicleViewModel[];
  driverSummaries: ICanonicalDriver[];
  insuredFullName?: string;
  policyStatus?: string;
  policyType?: string;
  policyState?: string;
  policyProduct?: string;
}
