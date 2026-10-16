import { Relationship } from '../../enums';
import { ICreateAutoClaimBackendResponse } from './ICreateClaim';
import {
  IAdjuster,
  IGuideWireContact,
  IGuideWireVehicleIncident,
  IGuideWireRelatedContact,
  IGuideWireClaimReporter,
  IGuideWireAdjusterNote
} from '../IShared';

export interface ISubmitAutoClaimBackendRequest extends ICreateAutoClaimBackendResponse {
  ace_RelationshipToInsured?: Relationship; //only have when reporter is not-listed
  adjusterNote: IGuideWireAdjusterNote;
  claimReporter: IGuideWireClaimReporter;
  contacts: IGuideWireContact[];
  documents?: [];
  relatedContacts?: IGuideWireRelatedContact[];
  submitClaim: boolean;
  vehicleIncidents?: IGuideWireVehicleIncident;
  sr1_VehicleNumber: number;
}

export interface ISubmitAutoClaimBackendResponse {
  status_message: string;
  claimNumber: string;
  adjuster?: IAdjuster;
}
