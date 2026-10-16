import {
  IGuideWireAdjusterNote,
  IGuideWireAdjusterNoteInfo,
  IGuideWireAutoVehicle,
  ISubmitAutoClaimFrontendRequest,
} from '@lib/types';
import { VehicleCount, YesNo, YesNoUnknown, PassengerCount, OtherNonVehicleParties } from '@ace-clublabs/iss-common-auto-efnol-models';

export const createAdjusterNote = (
  lineDelimiter: string,
  subjectLine: string,
  frontendRequest: ISubmitAutoClaimFrontendRequest,
  guideWireLossVehicle: IGuideWireAutoVehicle
): IGuideWireAdjusterNote => {
  let noteInfo: IGuideWireAdjusterNoteInfo = {} as IGuideWireAdjusterNoteInfo;
  let adjusterNoteBodyString = ``;
  const {
    incidentOtherVehicleCount,
    lossVehicle,
    incidentSingleOtherVehicle,
    incidentOtherNonVehicleParties
  } = frontendRequest;

  //Incident OtherVehicleCount
  if (incidentOtherVehicleCount && incidentOtherVehicleCount === VehicleCount.One) {
    noteInfo.numberOfThirdPartyVehiclesLine = `${enumToTitleCase(
      incidentOtherVehicleCount
    )} third party vehicle involved`;
  } else if (incidentOtherVehicleCount && incidentOtherVehicleCount === VehicleCount.TwoOrMore) {
    noteInfo.numberOfThirdPartyVehiclesLine = `${enumToTitleCase(
      incidentOtherVehicleCount
    )} third party vehicles involved`;
  } else {
    noteInfo.numberOfThirdPartyVehiclesLine = `No third party vehicles involved`;
  }
  adjusterNoteBodyString += `${noteInfo.numberOfThirdPartyVehiclesLine}${lineDelimiter}`;

  //Insured Vehicle line - always has an insured vehicle - always has a passenger count - may or may not have injuries
  const insuredVehicleYearMakePassengersInjuriesLine = `IV: ${
    guideWireLossVehicle.year
  } ${guideWireLossVehicle.make}, ${getPassengerCount(
    lossVehicle.passengerCount
  )}, ${getInjuryIndication(lossVehicle.hadInjuries)}${lineDelimiter}`;

  adjusterNoteBodyString += `${insuredVehicleYearMakePassengersInjuriesLine}`;

  //Single Other Vehicle (Claimant) vehicle line - May or may not have a Single Other Vehicle
  //If Single Other Vehicle exists, will always have a passenger count and may or may not have injuries
  if (incidentSingleOtherVehicle) {
    noteInfo.claimantVehicleYearMakePassengersInjuriesLine = '';
    const { vehicleInfo } = incidentSingleOtherVehicle;

    if (vehicleInfo && vehicleInfo?.year && vehicleInfo?.make) {
      noteInfo.claimantVehicleYearMakePassengersInjuriesLine += `CV: ${vehicleInfo?.year} ${vehicleInfo?.make}, `;
    } else {
      noteInfo.claimantVehicleYearMakePassengersInjuriesLine += `CV: `;
    }

    noteInfo.claimantVehicleYearMakePassengersInjuriesLine += `${getPassengerCount(
      incidentSingleOtherVehicle?.passengerCount
    )}, ${getInjuryIndication(
      frontendRequest.incidentSingleOtherVehicle.hadInjuries
    )}${lineDelimiter}`;

    adjusterNoteBodyString += `${noteInfo.claimantVehicleYearMakePassengersInjuriesLine}`;
  }

  // Cyclist and Pedestrian - may have either or both or none
  if (incidentOtherNonVehicleParties) {
    if (
      incidentOtherNonVehicleParties === OtherNonVehicleParties.Cyclist ||
      incidentOtherNonVehicleParties ===
        OtherNonVehicleParties.CyclistAndPedestrian
    ) {
      noteInfo.cyclistLine = `Cyclist indicated`;
      adjusterNoteBodyString += `${noteInfo.cyclistLine}${lineDelimiter}`;
    }
    if (
      incidentOtherNonVehicleParties === OtherNonVehicleParties.Pedestrian ||
      incidentOtherNonVehicleParties ===
        OtherNonVehicleParties.CyclistAndPedestrian
    ) {
      noteInfo.pedestrianLine = `Pedestrian indicated`;
      adjusterNoteBodyString += `${noteInfo.pedestrianLine}${lineDelimiter}`;
    }
  }

  // Property Damage
  noteInfo.nonVehicleRealPropertyLine =
    frontendRequest?.hadOtherPropertyDamage === YesNo.Yes
      ? `Real Property indicated`
      : ``;
  if (noteInfo.nonVehicleRealPropertyLine !== '') {
    adjusterNoteBodyString += `${noteInfo.nonVehicleRealPropertyLine}${lineDelimiter}`;
  }

  // Additional Details
  noteInfo.lossDescriptionLine = frontendRequest?.lossDescription;
  if (noteInfo.lossDescriptionLine) {
    adjusterNoteBodyString += `Additional Details:${lineDelimiter}${noteInfo.lossDescriptionLine}${lineDelimiter}`;
  }

  // Third-party Insurance Company Name & Policy. Note that Policy is optional.
  let hasThirdPartyInsuranceCompany: boolean = false;
  if (
    frontendRequest?.incidentSingleOtherVehicle?.insuranceCompany?.companyName
  ) {
    hasThirdPartyInsuranceCompany = true;
    noteInfo.thirdPartyInsuranceLine = `Third-party insurance company is ${frontendRequest?.incidentSingleOtherVehicle?.insuranceCompany.companyName}`;
  }
  if (
    frontendRequest?.incidentSingleOtherVehicle?.insuranceCompany?.policyNumber
  ) {
    noteInfo.thirdPartyInsuranceLine += `, policyNumber is ${frontendRequest?.incidentSingleOtherVehicle?.insuranceCompany?.policyNumber}`;
  }
  if (hasThirdPartyInsuranceCompany) {
    adjusterNoteBodyString += `${noteInfo.thirdPartyInsuranceLine}${lineDelimiter}`;
  }

  // Accident Crash Detection
  if (frontendRequest?.isMobileAppAccidentDetection !== undefined) {
    noteInfo.isMobileAppAccidentDetectionLine = `Accident crash detection: ${
      frontendRequest.isMobileAppAccidentDetection === 'true' ? 'Yes' : 'No'
    }`;
    adjusterNoteBodyString += `${noteInfo.isMobileAppAccidentDetectionLine}${lineDelimiter}`;
  }

  // Date of Crash Prediction
  if (frontendRequest?.dateOfCrashPrediction) {
    noteInfo.dateOfCrashPredictionLine = `Date of Crash Prediction: ${frontendRequest.dateOfCrashPrediction}`;
    adjusterNoteBodyString += `${noteInfo.dateOfCrashPredictionLine}${lineDelimiter}`;
  }

  adjusterNoteBodyString = adjusterNoteBodyString.substring(
    0,
    adjusterNoteBodyString.length - 3
  );

  return {
    subject: subjectLine,
    body: adjusterNoteBodyString
  };
};

const enumToTitleCase = (input: String): String => {
  return input.charAt(0).toUpperCase() + input.substring(1).toLowerCase();
};

const getPassengerCount = (passengerCount: PassengerCount) => {
  // we no longer capture the number of passenger count in the UI
  return 'unknown number of passengers';
};

const getInjuryIndication = (isInjured: YesNoUnknown) =>
  `${
    isInjured === YesNoUnknown.Yes ? 'injury indicated' : 'injury not indicated'
  }`;
