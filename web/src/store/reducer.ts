import {
  VehicleCount,
  YesNoUnknown,
  CarKineticStatus,
  YesNo,
  PassengerCount
} from '@ace-clublabs/iss-common-auto-efnol-models';
import type { IPolicyConversionResult } from '@ace-clublabs/iss-common-shared-claims-models';
import { Dayjs } from '@ace-clublabs/shared-component-library';
import {
  IAdjuster,
  IAnyWitness,
  IDriverViewModel,
  IFrontendOtherPartyDriverInformation,
  IFrontendOtherPartyInsurance,
  IFrontendOtherPartyPropertyDamage,
  IFrontendOtherPartyPedestrian,
  IIncidentDetailsOptions,
  ISelectedReporter,
  IVehicleOption,
  IVehicleViewModel,
  IYearMakeModel,
  IWeatherDamageOptions,
  IWebContactInfo,
  IInitialPolicyData,
  AppSource,
  LossCause,
  IAccidentDetailsOptions
} from '@lib/types';
import { ClubCodeValues } from '@lib/utility';
import { LoginFlowType } from '@lib/shared-contracts';
import { ACTION_TYPE, Actions } from './actions';
import {
  IWhenInformation,
  IWhereInformation,
  AutoEFNOLFeatureFlags,
  ISerializedError,
  Brand
} from '../types';

export const reducer: React.Reducer<State, Actions> = (state, action) => {
  switch (action.type) {
    case ACTION_TYPE.SET_PREVIOUS_PAGE: {
      return {
        ...state,
        goToPreviousPage: action.payload as string
      };
    }
    case ACTION_TYPE.RESET_PREVIOUS_PAGE: {
      return {
        ...state,
        goToPreviousPage: action.payload as undefined
      };
    }
    case ACTION_TYPE.SET_POLICY_NUMBER: {
      return {
        ...state,
        policyNumber: action.payload as string
      };
    }
    case ACTION_TYPE.SET_TOKEN: {
      return {
        ...state,
        token: action.payload as string
      };
    }
    case ACTION_TYPE.SET_WHEN_INFORMATION: {
      const payload = action.payload as IWhenInformation;
      return {
        ...state,
        ...payload
      };
    }
    case ACTION_TYPE.SET_LOSSDATEISO: {
      return {
        ...state,
        lossDateISO: action.payload as string
      };
    }
    case ACTION_TYPE.SET_WHERE_INFORMATION: {
      const payload = action.payload as IWhereInformation;
      return {
        ...state,
        ...payload
      };
    }
    case ACTION_TYPE.SET_CREATE_CLAIM_INFORMATION: {
      return {
        ...state,
        claimNumber: action.payload!['claimNumber'] as string,
        ...(action.payload!['driverSummaries'] !== undefined && {
          driverSummaries: action.payload!['driverSummaries'] as IDriverViewModel[],
          selectedDriver: undefined,
          selectedReporter: undefined
        }),
        ...(action.payload!['vehicleSummaries'] !== undefined && {
          vehicleSummaries: action.payload!['vehicleSummaries'] as IVehicleViewModel[]
        }),
        ...(action.payload!['vehicleOptions'] !== undefined && {
          vehicleOptions: action.payload!['vehicleOptions'] as IVehicleOption[],
          vehicleInIncident: undefined
        }),
        ...(action.payload!['insuredFullName'] && {
          insuredFullName: action.payload!['insuredFullName'] as string
        }),
        ...(action.payload!['policyStatus'] && {
          policyStatus: action.payload!['policyStatus'] as string
        }),
        ...(action.payload!['policyType'] && {
          policyType: action.payload!['policyType'] as string
        }),
        ...(action.payload!['policyState'] && {
          policyState: action.payload!['policyState'] as string
        }),
        ...(action.payload!['policyProduct'] && {
          policyProduct: action.payload!['policyProduct'] as string
        })
      };
    }
    case ACTION_TYPE.SET_POLICY_INFORMATION: {
      return {
        ...state,
        driverSummaries: action.payload!['driverSummaries'] as IDriverViewModel[],
        vehicleSummaries: action.payload!['vehicleSummaries'] as IVehicleViewModel[],
        vehicleOptions: action.payload!['vehicleOptions'] as IVehicleOption[],
        selectedDriver: undefined,
        selectedReporter: undefined,
        vehicleInIncident: undefined
      };
    }
    case ACTION_TYPE.SET_CONTACT_INFO: {
      const { email, mobileNumber, enableTextCommunication, enableEmailCommunication } =
        action.payload as IWebContactInfo;
      return {
        ...state,
        email,
        mobileNumber,
        enableTextCommunication,
        enableEmailCommunication
      };
    }
    case ACTION_TYPE.SET_CONTACT_INFO_PREFILL: {
      const { email, mobileNumber } = action.payload as { email: string; mobileNumber: string };
      return {
        ...state,
        email,
        mobileNumber
      };
    }
    case ACTION_TYPE.SET_VEHICLE_IN_INCIDENT: {
      return {
        ...state,
        vehicleInIncident: action.payload as IVehicleOption
      };
    }
    case ACTION_TYPE.SET_INCIDENT_DESCRIPTION: {
      return {
        ...state,
        incidentDescription: action.payload as string
      };
    }
    case ACTION_TYPE.SET_VEHICLE_PARKED_STATUS: {
      return {
        ...state,
        statusVehicleWhileParked: action.payload as IIncidentDetailsOptions
      };
    }
    case ACTION_TYPE.SET_ANYONE_INJURED: {
      return {
        ...state,
        wasAnyoneInjured: action.payload as YesNoUnknown
      };
    }
    case ACTION_TYPE.SET_VEHICLE_TOWED: {
      return {
        ...state,
        vehicleTowed: action.payload as YesNoUnknown //TODO Need to consider Unknown
      };
    }
    case ACTION_TYPE.SET_VEHICLE_DAMAGE: {
      return {
        ...state,
        damageDescription: action.payload as string
      };
    }
    case ACTION_TYPE.SET_OTHER_PARTY_INSURANCE: {
      const { otherPartyInsurancePolicyNumber, otherPartyInsuranceCompanyName } =
        action.payload as IFrontendOtherPartyInsurance;
      return {
        ...state,
        otherPartyInsuranceCompanyName,
        otherPartyInsurancePolicyNumber
      };
    }
    case ACTION_TYPE.SET_OTHER_PARTY_PROPERTY_DAMAGE: {
      const { otherPartyPropertyDamage } = action.payload as IFrontendOtherPartyPropertyDamage;
      return {
        ...state,
        otherPartyPropertyDamage
      };
    }
    case ACTION_TYPE.RESET_OTHER_PARTY_INSURANCE: {
      return {
        ...state,
        otherPartyInsuranceCompanyName: undefined,
        otherPartyInsurancePolicyNumber: undefined
      };
    }
    case ACTION_TYPE.SET_OTHER_PARTY_PEDESTRIAN: {
      const { otherPartyPedestriansInvolved } = action.payload as IFrontendOtherPartyPedestrian;
      return {
        ...state,
        otherPartyPedestriansInvolved
      };
    }
    case ACTION_TYPE.RESET_OTHER_PARTY_PEDESTRIAN: {
      return {
        ...state,
        otherPartyPedestriansInvolved: undefined
      };
    }
    case ACTION_TYPE.SET_OTHER_PARTY_DRIVER_INFORMATION: {
      const { otherPartyDriverFirstName, otherPartyDriverLastName, otherPartyDriverMobileNumber } =
        action.payload as IFrontendOtherPartyDriverInformation;
      return {
        ...state,
        otherPartyDriverFirstName,
        otherPartyDriverLastName,
        otherPartyDriverMobileNumber
      };
    }
    case ACTION_TYPE.RESET_OTHER_PARTY_DRIVER_INFORMATION: {
      return {
        ...state,
        otherPartyDriverFirstName: undefined,
        otherPartyDriverLastName: undefined,
        otherPartyDriverMobileNumber: undefined
      };
    }
    case ACTION_TYPE.SET_OTHER_PARTY_CAR: {
      return {
        ...state,
        otherPartyCar: action.payload as IYearMakeModel
      };
    }
    case ACTION_TYPE.SET_OTHER_PARTY_ANYONE_INJURED: {
      return {
        ...state,
        otherPartyAnyoneInjured: action.payload as YesNoUnknown
      };
    }
    case ACTION_TYPE.SET_VEHICLE_DRIVEN_STATUS: {
      return {
        ...state,
        statusVehicleWhileDriven: action.payload as IIncidentDetailsOptions
      };
    }
    case ACTION_TYPE.SET_CLAIMTYPE: {
      return {
        ...state,
        claimType: action.payload as string
      };
    }
    case ACTION_TYPE.RESET_CITY: {
      return {
        ...state,
        city: undefined
      };
    }
    case ACTION_TYPE.RESET_STATE: {
      return {
        ...(action.payload as State)
      };
    }
    case ACTION_TYPE.SET_WITNESS: {
      return {
        ...state,
        witness: action.payload as IAnyWitness
      };
    }
    case ACTION_TYPE.SET_SELECTED_REPORTER: {
      return {
        ...state,
        selectedReporter: action.payload as ISelectedReporter
      };
    }
    case ACTION_TYPE.SET_CAR_STATUS: {
      return {
        ...state,
        carStatus: action.payload as CarKineticStatus
      };
    }
    case ACTION_TYPE.SET_DRIVER: {
      return {
        ...state,
        selectedDriver: action.payload as IDriverViewModel
      };
    }
    case ACTION_TYPE.SET_SUBMIT_CLAIM_INFORMATION: {
      return {
        ...state,
        adjuster: action.payload as IAdjuster
      };
    }
    case ACTION_TYPE.SET_CLAIM_SUBMITTED_FOR_CLAIM_NUMBER: {
      return {
        ...state,
        claimSubmittedForClaimNumber: action.payload as string
      };
    }
    case ACTION_TYPE.SET_IS_REVIEW: {
      return {
        ...state,
        isReview: action.payload as boolean
      };
    }
    case ACTION_TYPE.SET_CLUB_CODE: {
      return {
        ...state,
        clubCode: action.payload as ClubCodeValues | undefined
      };
    }
    case ACTION_TYPE.SET_EXPIRATION_DATE: {
      return {
        ...state,
        expirationDate: action.payload as string
      };
    }
    case ACTION_TYPE.SET_EFFECTIVE_DATE: {
      return {
        ...state,
        effectiveDate: action.payload as string
      };
    }
    case ACTION_TYPE.SET_NUMBER_OF_VEHICLES_INVOLVED: {
      return {
        ...state,
        numberOfVehiclesInvolved: action.payload as VehicleCount
      };
    }
    case ACTION_TYPE.SET_KNOCKOUT_REASON: {
      return {
        ...state,
        knockoutReason: action.payload as string
      };
    }
    case ACTION_TYPE.SET_DRIVER_NOT_LISTED_BACK_NAV: {
      return {
        ...state,
        driverNotListedBackNav: action.payload as string
      };
    }
    case ACTION_TYPE.SET_ERROR_REASON: {
      return {
        ...state,
        errorReason: action.payload as string
      };
    }
    case ACTION_TYPE.SET_VEHICLE_WEATHER_DAMAGE: {
      return {
        ...state,
        vehicleDamageWeather: action.payload as IWeatherDamageOptions
      };
    }
    case ACTION_TYPE.RESET_VEHICLE_WEATHER_DAMAGE: {
      return {
        ...state,
        vehicleDamageWeather: undefined
      };
    }
    case ACTION_TYPE.SET_PRIOR_POLICY_NUMBER: {
      return {
        ...state,
        priorPolicyNumber: action.payload as string
      };
    }
    case ACTION_TYPE.GET_CREATE_CLAIM_INFORMATION: {
      return {
        ...state,
        claimNumber: action.payload!['claimNumber'] as string,
        duplicatedClaim: action.payload!['duplicatedClaim'] as boolean,
        adjuster: action.payload!['adjuster'] as IAdjuster
      };
    }
    case ACTION_TYPE.SET_IS_MOBILE_APP: {
      return {
        ...state,
        isMobileApp: action.payload as boolean
      };
    }
    case ACTION_TYPE.SET_IS_MOBILE_APP_ACCIDENT_DETECTION: {
      return {
        ...state,
        isMobileAppAccidentDetection: action.payload as string
      };
    }
    case ACTION_TYPE.SET_CRASH_DATE_PREDICTION: {
      return {
        ...state,
        dateOfCrashPrediction: action.payload as string
      };
    }
    case ACTION_TYPE.SET_REPORTED_DATE: {
      return {
        ...state,
        reportedDate: action.payload as Dayjs
      };
    }
    case ACTION_TYPE.SET_LOGIN_FLOW_TYPE: {
      return {
        ...state,
        loginFlowType: action.payload as LoginFlowType
      };
    }
    case ACTION_TYPE.SET_INITIAL_POLICY_DATA_BEHIND_LOGIN: {
      return {
        ...state,
        initialPolicyDataBehindLogin: action.payload as IInitialPolicyData
      };
    }
    case ACTION_TYPE.SET_POLICY_PREFIX: {
      return {
        ...state,
        policyPrefix: action.payload as string
      };
    }
    case ACTION_TYPE.SET_IS_ANONYMOUS: {
      return {
        ...state,
        isAnonymous: action.payload as boolean
      };
    }
    case ACTION_TYPE.SET_POLICY_GUID: {
      return {
        ...state,
        policyGuid: action.payload as string
      };
    }
    case ACTION_TYPE.SET_AREA: {
      return {
        ...state,
        area: action.payload as string
      };
    }
    case ACTION_TYPE.SET_SPLASH_START: {
      return {
        ...state,
        splashStart: action.payload as string
      };
    }
    case ACTION_TYPE.SET_SPLASH_END: {
      return {
        ...state,
        splashEnd: action.payload as string
      };
    }
    case ACTION_TYPE.SET_SOURCE_APP: {
      return {
        ...state,
        sourceApp: action.payload as AppSource
      };
    }
    case ACTION_TYPE.SET_CLAIMS_VIEW_GUID: {
      return {
        ...state,
        claimsViewGuid: action.payload as string
      };
    }
    case ACTION_TYPE.SET_PASSENGER_COUNT: {
      return {
        ...state,
        passengerCount: action.payload as PassengerCount
      };
    }
    case ACTION_TYPE.SET_OTHER_PARTY_PASSENGER_COUNT: {
      return {
        ...state,
        otherPartyPassengerCount: action.payload as PassengerCount
      };
    }
    case ACTION_TYPE.SET_LOSS_CAUSE: {
      return {
        ...state,
        lossCause: action.payload as LossCause
      };
    }
    case ACTION_TYPE.SET_ACCIDENT_DETAILS_WHILE_DRIVEN: {
      return {
        ...state,
        accidentDetailsWhileDriven: action.payload as IAccidentDetailsOptions
      };
    }
    case ACTION_TYPE.RESET_ACCIDENT_DETAILS_WHILE_DRIVEN: {
      return {
        ...state,
        accidentDetailsWhileDriven: undefined
      };
    }
    case ACTION_TYPE.RESET_VEHICLE_DRIVEN_STATUS: {
      return {
        ...state,
        statusVehicleWhileDriven: undefined
      };
    }
    case ACTION_TYPE.SET_AUTO_EFNOL_FEATURE_FLAGS: {
      return {
        ...state,
        autoEFNOLFeatureFlags: action.payload
      };
    }
    case ACTION_TYPE.SET_SERIALIZED_ERROR: {
      return {
        ...state,
        serializedError: action.payload as ISerializedError
      };
    }
    case ACTION_TYPE.SET_CONVERSION_RESULT: {
      return { ...state, conversionResult: action.payload as IPolicyConversionResult };
    }
    case ACTION_TYPE.CLEAR_CONVERSION_RESULT: {
      return { ...state, conversionResult: undefined };
    }
    case ACTION_TYPE.SET_BRAND: {
      return {
        ...state,
        brand: action.payload as Brand
      };
    }
    default:
      throw new Error('Action not supported');
  }
};

// @TODO
// - define a single object to store otherPartyDriver as
//        otherPartyDriver?: IGuideWireContact;
// - remove otherPartyDriverFirstName && otherPartyDriverLastName && otherPartyDriverMobileNumber
// - refactor and change tests!!!

export interface State {
  adjuster?: IAdjuster;
  area?: string;
  carStatus?: CarKineticStatus;
  city?: string;
  street?: string;
  zipCode?: string;
  claimNumber?: string;
  claimSubmittedForClaimNumber?: string | undefined;
  claimType?: string;
  clubCode?: ClubCodeValues | undefined;
  clubCodeError?: string | undefined;
  damageDescription?: string;
  driverSummaries?: IDriverViewModel[];
  duplicatedClaim?: boolean;
  effectiveDate?: string;
  email: string | undefined;
  enableTextCommunication: boolean | undefined;
  enableEmailCommunication?: boolean;
  errorReason?: string | undefined;
  expirationDate?: string;
  goToPreviousPage?: string;
  incidentDescription: string | undefined;
  lossLocationDescription?: string;
  isReview: boolean;
  knockoutReason?: string | undefined;
  // Used only for custom-driver back navigation (Passengers -> CustomDriver).
  // Intentionally separate from `knockoutReason` so we don't treat "driver not listed"
  // as an actual "knockout" error state.
  driverNotListedBackNav?: string | undefined;
  lossDate?: Dayjs;
  lossDateFormat?: string;
  reportedDate?: Dayjs;
  lossTime?: string;
  lossDateISO?: string;
  mobileNumber: string | undefined;
  numberOfVehiclesInvolved?: VehicleCount;
  otherPartyAnyoneInjured?: YesNoUnknown;
  otherPartyCar?: IYearMakeModel;
  otherPartyDriverFirstName?: string;
  otherPartyDriverLastName?: string;
  otherPartyDriverMobileNumber?: string;
  otherPartyInsuranceCompanyName?: string;
  otherPartyInsurancePolicyNumber?: string;
  otherPartyPassengerCount?: PassengerCount;
  otherPartyPedestriansInvolved?: string[] | undefined;
  otherPartyPropertyDamage?: YesNo;
  passengerCount?: PassengerCount;
  policyGuid?: string;
  policyNumber?: string;
  selectedDriver?: IDriverViewModel;
  selectedReporter?: ISelectedReporter;
  splashEnd?: string;
  splashStart?: string;
  state?: string;
  statusVehicleWhileDriven?: IIncidentDetailsOptions;
  statusVehicleWhileParked?: IIncidentDetailsOptions;
  token?: string;
  vehicleInIncident?: IVehicleOption;
  vehicleOptions?: IVehicleOption[];
  vehicleSummaries?: IVehicleViewModel[];
  vehicleTowed?: YesNoUnknown;
  wasAnyoneInjured?: YesNoUnknown;
  witness?: IAnyWitness;
  vehicleDamageWeather?: IWeatherDamageOptions;
  priorPolicyNumber?: string;
  isMobileApp?: boolean;
  isMobileAppAccidentDetection?: string;
  driverId?: string;
  dateOfCrashPrediction?: string;
  insuredFullName?: string;
  loginFlowType?: LoginFlowType;
  initialPolicyDataBehindLogin?: IInitialPolicyData;
  policyPrefix?: string;
  isAnonymous?: boolean;
  sourceApp?: AppSource | undefined;
  claimsViewGuid?: string | undefined;
  policyStatus?: string;
  policyType?: string;
  policyState?: string;
  policyProduct?: string;
  lossCause?: LossCause;
  accidentDetailsWhileDriven?: IAccidentDetailsOptions;
  autoEFNOLFeatureFlags?: AutoEFNOLFeatureFlags;
  serializedError?: ISerializedError;
  conversionResult?: IPolicyConversionResult;
  brand: Brand;
}

export const initialState: State = {
  adjuster: undefined,
  area: undefined,
  carStatus: undefined,
  city: undefined,
  street: undefined,
  zipCode: undefined,
  claimNumber: undefined,
  claimSubmittedForClaimNumber: undefined,
  claimType: undefined,
  clubCode: undefined,
  clubCodeError: undefined,
  damageDescription: undefined,
  driverSummaries: [],
  duplicatedClaim: undefined,
  email: undefined,
  enableTextCommunication: undefined,
  enableEmailCommunication: undefined,
  errorReason: undefined,
  goToPreviousPage: undefined,
  incidentDescription: undefined,
  lossLocationDescription: undefined,
  isReview: false,
  knockoutReason: undefined,
  driverNotListedBackNav: undefined,
  lossDate: undefined,
  lossTime: undefined,
  lossDateISO: undefined,
  reportedDate: undefined,
  mobileNumber: undefined,
  otherPartyAnyoneInjured: undefined,
  otherPartyPedestriansInvolved: undefined,
  otherPartyPropertyDamage: undefined,
  policyGuid: undefined,
  policyNumber: undefined,
  selectedReporter: undefined,
  splashEnd: undefined,
  splashStart: undefined,
  state: undefined,
  token: undefined,
  vehicleInIncident: undefined,
  vehicleSummaries: [],
  vehicleTowed: undefined,
  wasAnyoneInjured: undefined,
  witness: undefined,
  vehicleDamageWeather: undefined,
  priorPolicyNumber: undefined,
  isMobileApp: undefined,
  isMobileAppAccidentDetection: undefined,
  driverId: undefined,
  dateOfCrashPrediction: undefined,
  insuredFullName: undefined,
  isAnonymous: true,
  sourceApp: undefined,
  claimsViewGuid: undefined,
  loginFlowType: undefined,
  initialPolicyDataBehindLogin: undefined,
  policyPrefix: undefined,
  policyStatus: undefined,
  policyType: undefined,
  policyState: undefined,
  policyProduct: undefined,
  lossCause: undefined,
  accidentDetailsWhileDriven: undefined,
  autoEFNOLFeatureFlags: undefined,
  serializedError: undefined,
  conversionResult: undefined,
  brand: 'AAA'
};
