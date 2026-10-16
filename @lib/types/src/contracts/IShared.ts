import {
  LossCause,
  LossType,
  PreferredContactMethod,
  Relationship
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { ACEDriverOccupiedType, GuideWireAceLossOccured, GuideWireLossParty } from '../enums';

export interface IDriverViewModel {
  firstName: string;
  lastName: string;
  driverId?: string;
  email?: string;
  mobileNumber?: string;
  id?: string;
}

export interface IVehicleViewModel {
  year: string;
  make: string;
  model: string;
  vehicleId?: string;
  RUNumber?: string;
  vin: string;
}

export interface IGuideWireAutoPolicy extends IPolicyViewModel {
  status: string; //TODO create a PolicyStatus enum
  coverages?: any[];
  publicID: string;
  lobs?: IGuideWireAutoLobs;
}

export interface IPolicyViewModel {
  policyNumber: string;
  effectiveDate: string;
  expirationDate: string;
  policyType: string;
  priorPolicyNumber?: string;
  loggedInPolicyNumber?: string;
  /** Frontend-resolved policy number for conversion scenarios */
  resolvedPolicyNumber?: string;
}

export interface IGuideWireAutoLobs {
  personalAuto: IGuideWirePersonalAutoLob;
}

export interface IGuideWirePersonalAutoLob {
  vehicles: IGuideWireAutoVehicle[];
  vehicleIncidents?: IGuideWireVehicleIncident[];
}

export interface IGuideWireAutoVehicleCoverage {
  name: string;
  exposureLimit?: {
    currency: string;
    amount: number;
  };
  incidentLimit?: {
    currency: string;
    amount: number;
  };
  deductible?: {
    currency: string;
    amount: number;
  };
}
export interface IGuideWireAutoVehicle {
  state: string;
  country: string;
  year?: number;
  make: string;
  model: string;
  policyVehicle: boolean;
  coverages?: IGuideWireAutoVehicleCoverage[];
  publicID: string;
  vin: string;
}

export interface IGuideWireVehicleIncident {
  ace_LossParty: GuideWireLossParty;
  vehicle: IGuideWireAutoVehicle;
  ACE_DriverOccupiedType: ACEDriverOccupiedType;
  driver?: IGuideWireContact; //may not have this for third party vehicle
  passengers?: IGuideWireContact[]; //may not have this for third party vehicle
  damageDescription?: string; //may not have this for third party vehicle
  vehicleTowed?: boolean; //may not have this for third party vehicle
  ace_LossOccured?: GuideWireAceLossOccured;
}

export interface IGuideWireContact {
  firstName: string;
  lastName: string;
  ace_PreferredDeliveryMethod?: PreferredContactMethod;
  displayName?: string;
  primaryPhoneType?: string;
  publicID?: string;
  primaryAddress?: IGuideWireAddress;
  subtype?: string; //could be a enum "Person",
  dateOfBirth?: string;
  gender?: string; //could be a enum "F",
  contactType?: string; //could be a enum "Person",
  workNumber?: string;
  policyRole?: string; //GuideWirePolicyRole;
  emailAddress1?: string;
  homeNumber?: string;
  cellNumber?: string;
  tempID?: string;
  automatedServiceUpdates_Ext?: boolean;
  ace_EnrolledInHiMarley_Acc?: boolean;
}

export interface IGuideWireClaimReporter {
  reportedBy: IGuideWireContact;
  relationToInsured: Relationship;
}

export interface IGuideWireAdjusterNote {
  subject: string;
  body: string;
}

export interface IGuideWireAdjusterNoteInfo {
  numberOfThirdPartyVehiclesLine: string;
  insuredVehicleYearMakePassengersInjuriesLine: string;
  lossDescriptionLine: string;
  claimantVehicleYearMakePassengersInjuriesLine?: string;
  cyclistLine?: string;
  pedestrianLine?: string;
  nonVehicleRealPropertyLine?: string;
  thirdPartyInsuranceLine?: string;
  isMobileAppAccidentDetectionLine?: string;
  driverIdLine?: string;
  dateOfCrashPredictionLine?: string;
}

export interface IGuideWireRelatedContact {
  role: string;
  injured: boolean;
  contact: IGuideWireContact;
}
export interface IGuideWireAddress {
  city: string;
  state: string;
  country: string;
  displayName?: string;
  postalCode?: string;
  county?: string;
  addressLine1?: string;
  publicID?: string;
  addressType?: string;
}

export interface ICachedAutoClaim {
  policy: IGuideWireAutoPolicy;
  lossType: LossType;
  lossCause: LossCause;
  claimNumber: string;
  mainContact: IGuideWireContact;
  predefinedLossLocations?: any;
  publicID?: string;
  contacts?: ICachedAutoContact[];
  canUploadDocument?: boolean;
  lobs?: ICachedAutoLobs;
  lossLocation?: IGuideWireAddress;
  description?: string;
  ace_NotificationOnly?: boolean;
  lossDate: IGuideWireLossDate;
  lossTime: IGuideWireLossTime;
}

export interface ICachedAutoPolicy {
  status: string;
  coverages: any[];
  expirationDate: string;
  effectiveDate: string;
  publicID: string;
  policyNumber: string;
  policyType: string;
  lobs: ICachedAutoLobs;
}
export interface ICachedAutoContact extends IGuideWireContact {
  contactId: string;
}

export interface ICachedAutoLobs {
  personalAuto: ICachedPersonalAutoLob;
}

//TODO: Create a model for IGuideWireVehicleIncident - with some items optional - used in particular scenarios
export interface ICachedPersonalAutoLob {
  vehicles: ICachedAutoVehicle[];
  vehicleIncidents?: any[];
}

export interface ICachedAutoVehicle extends IGuideWireAutoVehicle {
  vehicleId: string;
}

export interface IAdjuster {
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  extension?: string;
}
export interface ILossLocation {
  city: string;
  state: string;
}

export interface IReporter {
  driverId: string;
  nonListedReporter?: INonListedReporter;
}

export interface INonListedReporter {
  firstName: string;
  lastName: string;
  relationshipToPolicyHolder: Relationship;
}

export interface IGuideWireLossDate {
  year: number;
  month: number; //zero-based
  day: number;
}

export interface IGuideWireLossTime {
  hour: number;
  minute: number;
  second: number;
}
