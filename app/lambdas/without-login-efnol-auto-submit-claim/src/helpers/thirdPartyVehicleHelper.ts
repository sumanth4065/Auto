import { ISingleOtherVehicleInfo, YesNoUnknown } from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  ACEDriverOccupiedType,
  GuideWireLossParty,
  IGuideWireContact,
  IGuideWireVehicleIncident,
  PhoneType,
} from '@lib/types';

export const thirdPartyVehicleHelper = (
  incidentSingleOtherVehicle: ISingleOtherVehicleInfo | undefined
): IGuideWireVehicleIncident | undefined => {
  if (!incidentSingleOtherVehicle || !incidentSingleOtherVehicle.vehicleInfo)
    return undefined;

  const thirdPartyVehicleIncident = {
    vehicle: {
      year: incidentSingleOtherVehicle.vehicleInfo.year,
      make: incidentSingleOtherVehicle.vehicleInfo.make,
      model: incidentSingleOtherVehicle.vehicleInfo.model,
      country: 'US'
    },
    ace_LossParty: GuideWireLossParty.THIRD_PARTY
  } as IGuideWireVehicleIncident;

  if (
    incidentSingleOtherVehicle.wasSomeoneDrivingOtherVehicle ===
    YesNoUnknown.Yes
  ) {
    thirdPartyVehicleIncident.driver = {
      firstName: incidentSingleOtherVehicle?.driver?.firstName,
      lastName: incidentSingleOtherVehicle?.driver?.lastName
    } as IGuideWireContact;
    thirdPartyVehicleIncident.ACE_DriverOccupiedType =
      ACEDriverOccupiedType.KnownDriver;

    if (incidentSingleOtherVehicle?.driver?.mobilePhone) {
      thirdPartyVehicleIncident.driver.cellNumber =
        incidentSingleOtherVehicle?.driver?.mobilePhone;
      thirdPartyVehicleIncident.driver.primaryPhoneType = PhoneType.Mobile;
    }
  } else if (
    incidentSingleOtherVehicle.wasSomeoneDrivingOtherVehicle === YesNoUnknown.No
  ) {
    thirdPartyVehicleIncident.ACE_DriverOccupiedType =
      ACEDriverOccupiedType.NoDriver;
  } else if (
    incidentSingleOtherVehicle.wasSomeoneDrivingOtherVehicle ===
    YesNoUnknown.Unknown
  ) {
    thirdPartyVehicleIncident.ACE_DriverOccupiedType =
      ACEDriverOccupiedType.UnknownDriver;
  }
  return thirdPartyVehicleIncident;
};
