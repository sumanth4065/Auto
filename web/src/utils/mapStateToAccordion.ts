import { OtherNonVehicleParties } from '@lib/types';
import {
  VehicleCount,
  YesNo,
  YesNoUnknown,
  CarKineticStatus,
  IPersonInfo
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { AccordionStateKeys } from '../containers/ClaimSubmission';
import { WOLI_AUTO_EFNOL_TIME_FORMAT } from '../shared/constants';
import { State } from '../store/reducer';
import { formatPhoneNumber } from '@ace-clublabs/iss-common-util';

// @Todo: move this to web/types
export type AccordionElementSummary = {
  title: Title;
  description: string;
  maskField: boolean;
};

// @Todo: move this to web/types
type Title =
  | 'cyclist'
  | 'driven or parked'
  | 'driver'
  | 'email'
  | 'incident location'
  | 'incident street'
  | 'injury'
  | 'insurance company'
  | 'loss date'
  | 'loss time'
  | 'location description'
  | 'mobile number'
  | 'number of vehicles involved'
  | 'pedestrian'
  | 'property damage'
  | 'vehicle towed'
  | 'vehicle'
  | 'what happened'
  | 'witness'
  | 'weather loss cause';

// @Todo: move this to web/shared or constants
const TITLES = Object.freeze({
  carStatus: 'driven or parked',
  carStatusDescription: 'what happened',
  weatherLossCause: 'weather loss cause',
  cyclist: 'cyclist',
  driver: 'driver',
  email: 'email',
  incidentDate: 'loss date',
  incidentLocation: 'incident location',
  incidentStreet: 'incident street',
  incidentTime: 'loss time',
  locationDescription: 'location description',
  mobileNumber: 'mobile number',
  numberOfVehiclesInvolved: 'number of vehicles involved',
  insuranceCompany: 'insurance company',
  pedestrian: 'pedestrian',
  propertyDamage: 'property damage',
  vehicle: 'vehicle',
  vehicleTowed: 'vehicle towed',
  wasAnyoneInjured: 'injury',
  witness: 'witness'
});

const getAccordionContentTitle = (title: keyof typeof TITLES) => TITLES[title];

const NONE = 'none';

// @TODO: for attr accordionSection, use enum in ReviewClaim.CLAIM_STEPS

export const mapStateToAccordion = (
  appState: Partial<State>,
  accordionSection: AccordionStateKeys
) => {
  const result: AccordionElementSummary[] = [];

  switch (accordionSection) {
    case 'IncidentInformation':
      addIncidentInformation(appState, result);
      break;

    case 'YourInformation':
      addYourInformation(appState, result);
      break;

    case 'OtherPartyInformation':
      addOtherPartyInformation(appState, result);
      break;

    case 'YourContactInformation':
      addYourContactInformation(appState, result);
      break;

    default:
      break;
  }

  return result;
};

// Incident Information

const addIncidentInformation = (appState: Partial<State>, result: AccordionElementSummary[]) => {
  if (appState.lossDate) {
    addAccordionContent(
      result,
      'incidentDate',
      appState.lossDate!.format(WOLI_AUTO_EFNOL_TIME_FORMAT)
    );
  }

  const formatLossTime = (time: string) => {
    const d = new Date(`1970-01-01T${time}`);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (appState.lossTime) {
    addAccordionContent(result, 'incidentTime', formatLossTime(appState.lossTime));
  }

  if (appState.street) {
    addAccordionContent(result, 'incidentStreet', appState.street);
  }

  if (appState.state && appState.city) {
    const locationParts = [appState.city, appState.state];
    if (appState.zipCode) {
      locationParts.push(appState.zipCode);
    }

    addAccordionContent(result, 'incidentLocation', locationParts.join(', '));
  }

  if (appState.lossLocationDescription) {
    addAccordionContent(result, 'locationDescription', appState.lossLocationDescription);
  }
};

// Your Information

const addYourInformation = (appState: Partial<State>, result: AccordionElementSummary[]) => {
  if (appState.vehicleInIncident?.customVehicle) {
    const { year, make, model } = appState.vehicleInIncident.customVehicle;
    addAccordionContent(result, 'vehicle', `${year} ${make} ${model}`);
  } else {
    addAccordionContent(result, 'vehicle', `${appState.vehicleInIncident!.vehicleTitle}`);
  }

  if (appState.selectedDriver) {
    addAccordionContent(
      result,
      'driver',
      getName(appState.selectedDriver!.firstName, appState.selectedDriver!.lastName),
      true
    );
  }

  if (appState.carStatus) {
    addAccordionContent(
      result,
      'carStatus',
      appState.carStatus === CarKineticStatus.BeingDriven ? 'Driven' : 'Parked'
    );

    const baseDescription =
      appState.carStatus === CarKineticStatus.BeingDriven
        ? appState.statusVehicleWhileDriven?.description
        : appState.statusVehicleWhileParked?.description;
    const accidentDetail =
      appState.carStatus === CarKineticStatus.BeingDriven
        ? appState.accidentDetailsWhileDriven?.description
        : undefined;
    const carStatusDescription = accidentDetail
      ? `${baseDescription} - ${accidentDetail}`
      : (baseDescription ?? YesNoUnknown.Unknown);

    addAccordionContent(result, 'carStatusDescription', carStatusDescription);

    if (appState.vehicleDamageWeather) {
      addAccordionContent(result, 'weatherLossCause', appState.vehicleDamageWeather.description);
    }
  }

  if (appState.wasAnyoneInjured) {
    addAccordionContent(result, 'wasAnyoneInjured', appState.wasAnyoneInjured!.toLowerCase());
  }

  if (appState.vehicleTowed) {
    addAccordionContent(result, 'vehicleTowed', appState.vehicleTowed!.toLowerCase());
  }
};

// Other Party Information

const addOtherPartyInformation = (appState: Partial<State>, result: AccordionElementSummary[]) => {
  addAccordionContent(
    result,
    'numberOfVehiclesInvolved',
    appState.numberOfVehiclesInvolved
      ? getNumberOfVehiclesInvolved(appState.numberOfVehiclesInvolved)
      : NONE
  );

  let vehicleInfo =
    appState.otherPartyCar &&
      appState.otherPartyCar.model != YesNoUnknown.Unknown &&
      appState.otherPartyCar.make != YesNoUnknown.Unknown
      ? `${appState.otherPartyCar.year} ${appState.otherPartyCar.make} ${appState.otherPartyCar.model}`
      : YesNoUnknown.Unknown;

  addAccordionContent(result, 'vehicle', vehicleInfo);

  addAccordionContent(
    result,
    'insuranceCompany',
    appState.otherPartyInsuranceCompanyName
      ? appState.otherPartyInsuranceCompanyName
      : YesNoUnknown.Unknown
  );

  addAccordionContent(
    result,
    'driver',
    appState.otherPartyDriverLastName && appState.otherPartyDriverFirstName
      ? appState.otherPartyDriverLastName != YesNoUnknown.Unknown &&
        appState.otherPartyDriverFirstName != YesNoUnknown.Unknown
        ? getName(appState.otherPartyDriverFirstName, appState.otherPartyDriverLastName)
        : YesNoUnknown.Unknown
      : YesNoUnknown.Unknown,

    true
  );

  addAccordionContent(
    result,
    'mobileNumber',
    appState.otherPartyDriverMobileNumber
      ? formatPhoneNumber(appState.otherPartyDriverMobileNumber)
      : YesNoUnknown.Unknown,
    true
  );

  addAccordionContent(
    result,
    'pedestrian',
    getPedestrianCyclistYesNo(
      appState.otherPartyPedestriansInvolved,
      OtherNonVehicleParties.Pedestrian
    )
  );

  addAccordionContent(
    result,
    'cyclist',
    getPedestrianCyclistYesNo(
      appState.otherPartyPedestriansInvolved,
      OtherNonVehicleParties.Cyclist
    )
  );

  addAccordionContent(
    result,
    'witness',
    appState.witness
      ? getWitness(appState.witness!.selection, appState.witness!.witnessInformation)
      : YesNoUnknown.Unknown,
    true
  );

  if (appState.otherPartyPropertyDamage) {
    addAccordionContent(result, 'propertyDamage', appState.otherPartyPropertyDamage);
  }

  if (appState.otherPartyAnyoneInjured) {
    addAccordionContent(
      result,
      'wasAnyoneInjured',
      appState.otherPartyAnyoneInjured!.toLowerCase()
    );
  }
};

// Your Contact Information

const addYourContactInformation = (appState: Partial<State>, result: AccordionElementSummary[]) => {
  if (appState.email) {
    addAccordionContent(result, 'email', appState.email, true);
  }

  if (appState.mobileNumber) {
    addAccordionContent(result, 'mobileNumber', formatPhoneNumber(appState.mobileNumber), true);
  }
};

// helpers

const addAccordionContent = (
  result: AccordionElementSummary[],
  title: keyof typeof TITLES,
  description: string,
  maskField: boolean = false
) => {
  result.push({
    title: getAccordionContentTitle(title),
    description,
    maskField
  });
};

const getName = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) {
    return YesNoUnknown.Unknown;
  }
  if (firstName == undefined) firstName = YesNoUnknown.Unknown;
  if (lastName == undefined) lastName = YesNoUnknown.Unknown;
  return `${firstName?.toLowerCase()} ${lastName?.toLowerCase()}`;
};

const getWitness = (selection: YesNoUnknown, witnessInformation?: IPersonInfo) => {
  switch (selection) {
    case YesNoUnknown.Yes:
      return getName(witnessInformation?.firstName, witnessInformation?.lastName);
    case YesNoUnknown.No:
      return 'No witness';
    default:
      return YesNoUnknown.Unknown;
  }
};

const getNumberOfVehiclesInvolved = (numberOfVehiclesInvolved: VehicleCount) => {
  switch (numberOfVehiclesInvolved) {
    case VehicleCount.None:
      return 'none';
    case VehicleCount.One:
      return 'one';
    case VehicleCount.TwoOrMore:
      return 'two or more';
    default:
      return 'none';
  }
};

const getPedestrianCyclistYesNo = (
  otherPartyPedestrianInvolved: string[] | undefined,
  option: string
) => {
  if (!otherPartyPedestrianInvolved || otherPartyPedestrianInvolved.length == 0) return YesNo.No;
  return otherPartyPedestrianInvolved.find(el => el === option) ? YesNo.Yes : YesNo.No;
};

// @Todo: move this to utils
export const textTransformBasedOnTitle = (title: Title) => {
  switch (title) {
    case 'driver':
      return { textTransform: 'capitalize' };
    case 'email':
      return { ':first-letter': { textTransform: 'none' } };
    default:
      return { ':first-letter': { textTransform: 'uppercase' } };
  }
};
