import { Subset } from '@ace-clublabs/iss-common-util';
import {
  IContactInfo,
  ICustomDriver,
  ILossVehicle,
  IPersonInfo,
  IReporter,
  IVehicle,
  LossCause,
  OtherNonVehicleParties,
  PreferredContactMethod,
  VehicleCount,
  YesNo,
  YesNoUnknown
} from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  CarKineticStatus,
  ISingleOtherVehicleInfo,
  ISubmitAutoClaimFrontendRequest
} from '@lib/types';
import { State } from '../../store/reducer';
import { resolveClaimPolicyNumber } from '../../utils/policyNumberHelper';

export const createRequestBody = (appState: Partial<State>): ISubmitAutoClaimFrontendRequest => {
  const {
    claimNumber,
    selectedReporter,
    mobileNumber,
    email,
    street,
    city,
    state,
    zipCode,
    lossLocationDescription,
    carStatus,
    statusVehicleWhileDriven,
    statusVehicleWhileParked,
    incidentDescription,
    damageDescription,
    vehicleInIncident,
    selectedDriver,
    wasAnyoneInjured,
    vehicleTowed,
    otherPartyCar,
    otherPartyInsuranceCompanyName,
    otherPartyInsurancePolicyNumber,
    witness,
    enableTextCommunication,
    enableEmailCommunication,
    lossDateFormat,
    vehicleDamageWeather,
    isMobileAppAccidentDetection,
    dateOfCrashPrediction,
    passengerCount,
    otherPartyPassengerCount,
    policyNumber = '',
    loginFlowType,
    accidentDetailsWhileDriven
  } = appState;
  const [lossDate, lossTime] = lossDateFormat!.split(' '); // UTC conversion
  const { id, customReporter } = selectedReporter!;
  const reporter: IReporter = {
    driverId: id,
    customReporter
  };
  const contactInfo: IContactInfo = {
    phone: mobileNumber!,
    email: email!,
    preferredContactMethod: PreferredContactMethod.email
  };
  if (enableTextCommunication) {
    contactInfo.preferredContactMethod = PreferredContactMethod.himarley;
  }
  const lossLocation = {
    streetAddress: street || 'N/A',
    city: city!,
    state: state!,
    postalCode: zipCode || undefined,
    description: lossLocationDescription || undefined
  };

  const insuredVehicle: IVehicle = {
    RUNumber: vehicleInIncident?.RUNumber ?? '',
    year: vehicleInIncident?.year ? Number(vehicleInIncident.year) : 1900,
    make: vehicleInIncident?.make ?? '',
    model: vehicleInIncident?.model ?? '',
    vin: vehicleInIncident?.vin ?? ''
  };

  const customDriver: ICustomDriver | undefined = selectedDriver?.driverId
    ? undefined
    : {
        firstName: selectedDriver?.firstName ?? '',
        lastName: selectedDriver?.lastName ?? '',
        cellPhone: selectedDriver?.mobileNumber ?? '',
        email: selectedDriver?.email ?? ''
      };

  const lossVehicle: ILossVehicle = {
    vehicleId: vehicleInIncident?.vehicleId ?? '',
    vehicleDrivenOrParked: carStatus!,
    damageDescription: damageDescription!,
    incidentDriverId: selectedDriver?.driverId,
    passengerCount: passengerCount,
    hadInjuries: wasAnyoneInjured,
    towed: vehicleTowed,
    insuredVehicle,
    customVehicle: vehicleInIncident?.customVehicle,
    customDriver
  };
  const incidentSingleOtherVehicle: ISingleOtherVehicleInfo = Subset.removeUndefinedProperties({
    vehicleInfo: otherPartyCar
      ? {
          year: otherPartyCar.year ? Number(otherPartyCar.year) : 1900,
          make: otherPartyCar.make,
          model: otherPartyCar.model
        }
      : undefined,
    insuranceCompany: otherPartyInsuranceCompanyName
      ? {
          companyName: otherPartyInsuranceCompanyName!,
          policyNumber: otherPartyInsurancePolicyNumber!
        }
      : undefined,
    passengerCount: otherPartyPassengerCount,
    hadInjuries: appState.otherPartyAnyoneInjured,
    wasSomeoneDrivingOtherVehicle:
      appState.otherPartyDriverFirstName && appState.otherPartyDriverLastName
        ? YesNoUnknown.Yes
        : YesNoUnknown.Unknown,
    driver:
      appState.otherPartyDriverFirstName && appState.otherPartyDriverLastName
        ? {
            firstName: appState.otherPartyDriverFirstName!,
            lastName: appState.otherPartyDriverLastName!,
            mobilePhone: appState.otherPartyDriverMobileNumber!
          }
        : undefined
  });

  let witnessInfo: IPersonInfo | undefined;
  if (
    witness?.selection === YesNoUnknown.Yes &&
    witness?.witnessInformation?.firstName &&
    witness?.witnessInformation?.lastName
  ) {
    witnessInfo = {
      firstName: witness.witnessInformation.firstName,
      lastName: witness.witnessInformation.lastName,
      mobilePhone: witness.witnessInformation.mobilePhone
    };
  }

  const lossCauseByWeatherDamage =
    appState.statusVehicleWhileDriven?.code === LossCause.WEATHERRELATEDCOMP ||
    appState.statusVehicleWhileParked?.code === LossCause.WEATHERRELATEDCOMP
      ? vehicleDamageWeather?.code
      : undefined;
  let sr1_VehicleNumber = 1;
  if (appState.numberOfVehiclesInvolved && appState.numberOfVehiclesInvolved != VehicleCount.None) {
    sr1_VehicleNumber = appState.numberOfVehiclesInvolved === VehicleCount.One ? 2 : 3;
  }

  const getLossCause = () => {
    if (lossCauseByWeatherDamage) return lossCauseByWeatherDamage;
    if (carStatus === CarKineticStatus.BeingDriven) {
      return statusVehicleWhileDriven?.code === LossCause.IMPACTEDWITHANOTHERVEHICLE
        ? accidentDetailsWhileDriven?.code!
        : statusVehicleWhileDriven?.code!;
    }
    return statusVehicleWhileParked?.code!;
  };

  const lossCause = getLossCause();

  const resolvedPolicyNumber = resolveClaimPolicyNumber(
    appState.conversionResult,
    appState.lossDateISO,
    policyNumber
  );

  const submitAutoClaimRequest: ISubmitAutoClaimFrontendRequest = Subset.removeUndefinedProperties({
    policyNumber,
    resolvedPolicyNumber: resolvedPolicyNumber !== policyNumber ? resolvedPolicyNumber : undefined,
    claimNumber: claimNumber!,
    contactInfo,
    hadOtherPropertyDamage: appState.otherPartyPropertyDamage ?? YesNo.No,
    incidentOtherNonVehicleParties: getPedestrianCyclist(appState.otherPartyPedestriansInvolved), // pedestrian or cyclist
    incidentOtherVehicleCount: appState.numberOfVehiclesInvolved!,
    incidentSingleOtherVehicle,
    isTextCommunicationOptIn: enableTextCommunication!,
    isEmailCommunicationOptIn: enableEmailCommunication!,
    lossDate,
    lossDescription: incidentDescription!,
    lossLocation,
    lossCause: lossCause as LossCause,
    lossTime,
    lossVehicle,
    reporter,
    sr1_VehicleNumber,
    witness: witnessInfo!,
    // UBI Mobile fields
    isMobileAppAccidentDetection,
    dateOfCrashPrediction,
    loginFlowType
  });
  return submitAutoClaimRequest;
};

const getPedestrianCyclist = (
  otherPartyPedestriansInvolved: string[] | undefined
): OtherNonVehicleParties => {
  if (!otherPartyPedestriansInvolved || otherPartyPedestriansInvolved.length == 0) {
    return OtherNonVehicleParties.None;
  } else if (otherPartyPedestriansInvolved.length == 2) {
    return OtherNonVehicleParties.CyclistAndPedestrian;
  } else if (otherPartyPedestriansInvolved.length == 1) {
    return otherPartyPedestriansInvolved[0] as OtherNonVehicleParties;
  }
  return OtherNonVehicleParties.None;
};
