
import { LossCause, LossType } from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  IGuideWireAddress,
  IGuideWireAutoLobs,
  IGuideWireAutoPolicy,
  IGuideWireContact,
  IPolicyViewModel,
  IGuideWireLossDate,
  IGuideWireLossTime
} from '../IShared';

export interface ICreateAutoClaimBackendRequest {
  policy: IPolicyViewModel;
  lossType: LossType;
  lossCause: LossCause;
  ace_NotificationOnly: boolean;
  lossDate: IGuideWireLossDate;
  lossTime: IGuideWireLossTime;
}

export interface ICreateAutoClaimBackendResponse {
  policy: IGuideWireAutoPolicy;
  lossType: LossType;
  lossCause: LossCause;
  claimNumber: string;
  mainContact: IGuideWireContact;
  predefinedLossLocations?: any;
  publicID?: string;
  contacts?: IGuideWireContact[];
  canUploadDocument?: boolean;
  lobs?: IGuideWireAutoLobs;
  description: string;
  lossLocation?: IGuideWireAddress;
  ace_NotificationOnly?: boolean;
  lossDate: IGuideWireLossDate;
  lossTime: IGuideWireLossTime;
}

export interface ICreateAutoClaimBackendResponseV2 {
  claimNumber: string;
}
