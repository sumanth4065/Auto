import { DateHelper } from '@ace-clublabs/iss-common-util';
import {
  ACEDriverOccupiedType,
  CarKineticStatus,
  GuideWireAceLossOccured,
  GuideWireLossParty,
  ICachedAutoClaim,
  IGuideWireClaimReporter,
  IGuideWireContact,
  IGuideWireVehicleIncident,
  ISubmitAutoClaimBackendRequest,
  ISubmitAutoClaimFrontendRequest,
} from '@lib/types';
import { createAdjusterNote } from './createAdjusterNote';
import { getDriverFromCache } from './getDriverFromCache';
import { getExistingLossDriver } from './getExistingLossDriver';
import { getVehicleFromCache } from './getVehicleFromCache';
import { getReporterAndRelationship } from './reporterHelper';
import { thirdPartyVehicleHelper } from './thirdPartyVehicleHelper';
import { transformCacheContacts } from './transformCacheContacts';
import { transformCacheVehicles } from './transformCacheVehicles';
import { witnessHelper } from './witnessHelper';
import { LossCause, YesNoUnknown } from '@ace-clublabs/iss-common-auto-efnol-models';

export const createBackendRequest = async (
  reqBody: ISubmitAutoClaimFrontendRequest,
  claimFromCacheData: ICachedAutoClaim
): Promise<ISubmitAutoClaimBackendRequest> => {
  //Reporter
  const claimReporter: IGuideWireClaimReporter = getReporterAndRelationship(
    reqBody,
    claimFromCacheData
  );
  const reportedBy = claimReporter.reportedBy;

  //LossVehicle
  const lossVehicle = getVehicleFromCache(
    claimFromCacheData.lobs.personalAuto.vehicles,
    reqBody.lossVehicle.vehicleId
  );

  //LossDriver
  let lossDriverContact: IGuideWireContact | undefined = undefined;
  if (reqBody.lossVehicle.incidentDriverId) {
    lossDriverContact = getExistingLossDriver(
      reqBody.contactInfo,
      getDriverFromCache(claimFromCacheData.contacts, reqBody.lossVehicle.incidentDriverId),
      reportedBy.publicID,
      reqBody.isTextCommunicationOptIn
    );
  } else if (reqBody.lossVehicle.customDriver) {
    lossDriverContact = getExistingLossDriver(
      reqBody.contactInfo,
      {
        firstName: reqBody.lossVehicle.customDriver.firstName,
        lastName: reqBody.lossVehicle.customDriver.lastName,
        cellNumber: reqBody.lossVehicle.customDriver.cellPhone,
        emailAddress1: reqBody.lossVehicle.customDriver.email
      },
      reportedBy.publicID,
      reqBody.isTextCommunicationOptIn
    );
  }

  //LossLocation
  const updatedLossLocation = {
    city: reqBody.lossLocation.city,
    state: reqBody.lossLocation.state,
    country: 'US'
  };

  //Insured VehicleIncident
  const insuredVehicleIncident = {
    ACE_DriverOccupiedType: ACEDriverOccupiedType.KnownDriver,
    vehicle: lossVehicle,
    driver: lossDriverContact,
    damageDescription: reqBody.lossVehicle.damageDescription,
    ace_LossParty: GuideWireLossParty.INSURED,
    ace_LossOccured:
      reqBody.lossVehicle.vehicleDrivenOrParked &&
        reqBody.lossVehicle.vehicleDrivenOrParked === CarKineticStatus.BeingDriven
        ? GuideWireAceLossOccured.IN_TRANSIT
        : GuideWireAceLossOccured.PARKED,
    vehicleTowed: reqBody.lossVehicle.towed === YesNoUnknown.Yes ? true : false
  } as IGuideWireVehicleIncident;

  // LossCause - Map to OTHERCOLL for legacy backend (Claim Center doesn't recognize PARKCOLLISION or PARKEDUNOCCUPIED)
  let myLossCause;
  if (
    reqBody.lossCause === LossCause.PARKCOLLISION ||
    reqBody.lossCause === LossCause.PARKEDUNOCCUPIED ||
    reqBody.lossCause === LossCause.IMPACTEDWITHANOTHERVEHICLE
  ) {
    myLossCause = LossCause.OTHERCOLL;
  } else {
    myLossCause = reqBody.lossCause;
  }

  //Other party VehicleIncident
  const thirdPartyVehicleIncident = thirdPartyVehicleHelper(reqBody.incidentSingleOtherVehicle);

  // Create vehicleIncident array
  const vehicleIncidents = [insuredVehicleIncident];
  if (thirdPartyVehicleIncident) {
    vehicleIncidents.push(thirdPartyVehicleIncident);
  }

  // LossDate & Time
  const { dateObject: lossDate, timeObject: lossTime } = DateHelper.createLossDateAndTimeObject(
    reqBody.lossDate,
    reqBody.lossTime
  );

  // Start build the backend request body
  const backendSubmitAutoClaimRequestBodyCandidate: ISubmitAutoClaimBackendRequest = {
    ...claimFromCacheData,
    lossLocation: updatedLossLocation,
    description: reqBody.lossDescription,
    submitClaim: true,
    mainContact: reportedBy,
    contacts: transformCacheContacts(claimFromCacheData.contacts), //Contacts with surrogate ids removed
    lobs: {
      personalAuto: {
        vehicles: transformCacheVehicles(claimFromCacheData.lobs.personalAuto.vehicles), //Vehicles with surrogate ids removed
        vehicleIncidents
      }
    },
    lossCause: myLossCause,
    claimNumber: reqBody.claimNumber,
    claimReporter,
    adjusterNote: createAdjusterNote(' | ', 'eFNOL', reqBody, lossVehicle),
    relatedContacts: witnessHelper(reqBody.witness),
    lossDate,
    lossTime,
    sr1_VehicleNumber: reqBody.sr1_VehicleNumber
  };

  //Logic to clean up the postalCode if it ends with '-
  if (
    backendSubmitAutoClaimRequestBodyCandidate.mainContact.primaryAddress?.postalCode &&
    backendSubmitAutoClaimRequestBodyCandidate.mainContact.primaryAddress?.postalCode.endsWith('-')
  ) {
    backendSubmitAutoClaimRequestBodyCandidate.mainContact.primaryAddress.postalCode =
      backendSubmitAutoClaimRequestBodyCandidate.mainContact.primaryAddress?.postalCode.substring(
        0,
        backendSubmitAutoClaimRequestBodyCandidate.mainContact.primaryAddress?.postalCode?.length -
        1
      );
  }

  //No need to return  predefinedLossLocations, publicID, canUploadDocument, ace_NotificationOnly (?)

  return {
    ...transformBackendRequest(backendSubmitAutoClaimRequestBodyCandidate)
  };
};

function transformBackendRequest(req: ISubmitAutoClaimBackendRequest) {
  const { predefinedLossLocations, publicID, canUploadDocument, ace_NotificationOnly, ...res } =
    req;
  return { ...res };
}
