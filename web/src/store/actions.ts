import {
  CarKineticStatus,
  VehicleCount,
  YesNo,
  YesNoUnknown,
  PassengerCount
} from '@ace-clublabs/iss-common-auto-efnol-models';
import type { IPolicyConversionResult } from '@ace-clublabs/iss-common-shared-claims-models';
import {
  IAdjuster,
  IAnyWitness,
  IContactInfoPrefill,
  IDriverViewModel,
  IFrontendOtherPartyDriverInformation,
  IFrontendOtherPartyInsurance,
  IFrontendOtherPartyPedestrian,
  IFrontendOtherPartyPropertyDamage,
  IIncidentDetailsOptions,
  ISelectedReporter,
  IVehicleOption,
  IVehicleViewModel,
  IWebContactInfo,
  IYearMakeModel,
  IWeatherDamageOptions,
  IInitialPolicyData,
  AppSource,
  LossCause,
  IAccidentDetailsOptions
} from '@lib/types';
import { Dayjs } from '@ace-clublabs/shared-component-library';
import { ClubCodeValues } from '@lib/utility';
import { LoginFlowType } from '@lib/shared-contracts';
import {
  IWhenInformation,
  IWhereInformation,
  AutoEFNOLFeatureFlags,
  ISerializedError
} from '../types';
import { State } from './reducer';

export interface Actions {
  type: string;
  payload:
    | undefined
    | string
    | boolean
    | { vehicleTitle: string; vin: string }
    | {
        claimNumber: string;
        driverSummaries?: IDriverViewModel[];
        vehicleSummaries?: IVehicleViewModel[];
        vehicleOptions?: IVehicleOption[];
        insuredFullName?: string;
        policyStatus?: string;
        policyType?: string;
        policyState?: string;
        policyProduct?: string;
      }
    | {
        driverSummaries: IDriverViewModel[];
        vehicleSummaries: IVehicleViewModel[];
        vehicleOptions: IVehicleOption[];
      }
    | {
        claimNumber: string;
        duplicatedClaim: boolean;
        adjuster: IAdjuster | undefined;
      }
    | IWebContactInfo
    | IContactInfoPrefill
    | IIncidentDetailsOptions
    | YesNoUnknown
    | YesNo
    | IFrontendOtherPartyInsurance
    | IFrontendOtherPartyDriverInformation
    | IFrontendOtherPartyPropertyDamage
    | IFrontendOtherPartyPedestrian
    | IYearMakeModel
    | IAnyWitness
    | ISelectedReporter
    | CarKineticStatus
    | IDriverViewModel
    | IAdjuster
    | ClubCodeValues
    | IWeatherDamageOptions
    | Dayjs
    | State
    | LoginFlowType
    | IInitialPolicyData
    | PassengerCount
    | IWhenInformation
    | IWhereInformation
    | LossCause
    | IAccidentDetailsOptions
    | AutoEFNOLFeatureFlags
    | ISerializedError
    | IPolicyConversionResult;
}

export enum ACTION_TYPE {
  RESET_CITY = 'RESET_CITY',
  RESET_OTHER_PARTY_DRIVER_INFORMATION = 'RESET_OTHER_PARTY_DRIVER_INFORMATION',
  RESET_OTHER_PARTY_INSURANCE = 'RESET_OTHER_PARTY_INSURANCE',
  RESET_OTHER_PARTY_PEDESTRIAN = 'RESET_OTHER_PARTY_PEDESTRIAN',
  RESET_PREVIOUS_PAGE = 'RESET_PREVIOUS_PAGE',
  RESET_STATE = 'RESET_STATE',
  SET_ANYONE_INJURED = 'SET_ANYONE_INJURED',
  SET_AREA = 'SET_AREA',
  SET_CAR_STATUS = 'SET_CAR_STATUS',
  SET_CLAIMTYPE = 'SET_CLAIMTYPE',
  SET_CLUB_CODE = 'SET_CLUB_CODE',
  SET_CLUB_CODE_ERROR = 'SET_CLUB_CODE_ERROR',
  SET_CONTACT_INFO = 'SET_CONTACT_INFO',
  SET_CONTACT_INFO_PREFILL = 'SET_CONTACT_INFO_PREFILL',
  SET_CREATE_CLAIM_INFORMATION = 'SET_CREATE_CLAIM_INFORMATION',
  SET_POLICY_INFORMATION = 'SET_POLICY_INFORMATION',
  SET_DRIVER = 'SET_DRIVER',
  SET_EFFECTIVE_DATE = 'SET_EFFECTIVE_DATE',
  SET_ERROR_REASON = 'SET_ERROR_REASON',
  SET_EXPIRATION_DATE = 'SET_EXPIRATION_DATE',
  SET_INCIDENT_DESCRIPTION = 'SET_INCIDENT_DESCRIPTION',
  SET_IS_REVIEW = 'SET_IS_REVIEW',
  SET_KNOCKOUT_REASON = 'SET_KNOCKOUT_REASON',
  SET_DRIVER_NOT_LISTED_BACK_NAV = 'SET_DRIVER_NOT_LISTED_BACK_NAV',
  SET_NUMBER_OF_VEHICLES_INVOLVED = 'SET_NUMBER_OF_VEHICLES_INVOLVED',
  SET_OTHER_PARTY_ANYONE_INJURED = 'SET_OTHER_PARTY_ANYONE_INJURED',
  SET_OTHER_PARTY_CAR = 'SET_OTHER_PARTY_CAR',
  SET_OTHER_PARTY_DRIVER_INFORMATION = 'SET_OTHER_PARTY_DRIVER_INFORMATION',
  SET_OTHER_PARTY_INSURANCE = 'SET_OTHER_PARTY_INSURANCE',
  SET_OTHER_PARTY_PASSENGER_COUNT = 'SET_OTHER_PARTY_PASSENGER_COUNT',
  SET_OTHER_PARTY_PEDESTRIAN = 'SET_OTHER_PARTY_PEDESTRIAN',
  SET_OTHER_PARTY_PROPERTY_DAMAGE = 'SET_OTHER_PARTY_PROPERTY_DAMAGE',
  SET_PASSENGER_COUNT = 'SET_PASSENGER_COUNT',
  SET_POLICY_GUID = 'SET_POLICY_GUID',
  SET_POLICY_NUMBER = 'SET_POLICY_NUMBER',
  SET_PREVIOUS_PAGE = 'SET_PREVIOUS_PAGE',
  SET_SELECTED_REPORTER = 'SET_SELECTED_REPORTER',
  SET_SPLASH_END = 'SET_SPLASH_END',
  SET_SPLASH_START = 'SET_SPLASH_START',
  SET_SUBMIT_CLAIM_INFORMATION = 'SET_SUBMIT_CLAIM_INFORMATION',
  SET_CLAIM_SUBMITTED_FOR_CLAIM_NUMBER = 'SET_CLAIM_SUBMITTED_FOR_CLAIM_NUMBER',
  SET_TOKEN = 'SET_TOKEN',
  SET_VEHICLE_DAMAGE = 'SET_VEHICLE_DAMAGE',
  SET_VEHICLE_DRIVEN_STATUS = 'SET_VEHICLE_DRIVEN_STATUS',
  SET_VEHICLE_IN_INCIDENT = 'SET_VEHICLE_IN_INCIDENT',
  SET_VEHICLE_PARKED_STATUS = 'SET_VEHICLE_PARKED_STATUS',
  SET_VEHICLE_TOWED = 'SET_VEHICLE_TOWED',
  SET_WHEN_INFORMATION = 'SET_WHEN_INFORMATION',
  SET_WHERE_INFORMATION = 'SET_WHERE_INFORMATION',
  SET_WITNESS = 'SET_WITNESS',
  SET_VEHICLE_WEATHER_DAMAGE = 'SET_VEHICLE_DAMAGE_WEATHER',
  RESET_VEHICLE_WEATHER_DAMAGE = 'RESET_VEHICLE_WEATHER_DAMAGE',
  SET_PRIOR_POLICY_NUMBER = 'SET_PRIOR_POLICY_NUMBER',
  GET_CREATE_CLAIM_INFORMATION = 'GET_CREATE_CLAIM_INFORMATION',
  SET_IS_MOBILE_APP = 'SET_IS_MOBILE_APP',
  SET_IS_MOBILE_APP_ACCIDENT_DETECTION = 'SET_IS_MOBILE_APP_ACCIDENT_DETECTION',
  SET_CRASH_DATE_PREDICTION = 'SET_CRASH_DATE_PREDICTION',
  SET_REPORTED_DATE = 'SET_REPORTED_DATE',
  SET_IS_ANONYMOUS = 'SET_IS_ANONYMOUS',
  SET_SOURCE_APP = 'SET_SOURCE_APP',
  SET_CLAIMS_VIEW_GUID = 'SET_CLAIMS_VIEW_GUID',
  SET_LOGIN_FLOW_TYPE = 'SET_LOGIN_FLOW_TYPE',
  SET_INITIAL_POLICY_DATA_BEHIND_LOGIN = 'SET_INITIAL_POLICY_DATA_BEHIND_LOGIN',
  SET_POLICY_PREFIX = 'SET_POLICY_PREFIX',
  SET_LOSS_CAUSE = 'SET_LOSS_CAUSE',
  SET_ACCIDENT_DETAILS_WHILE_DRIVEN = 'SET_ACCIDENT_DETAILS_WHILE_DRIVEN',
  RESET_ACCIDENT_DETAILS_WHILE_DRIVEN = 'RESET_ACCIDENT_DETAILS_WHILE_DRIVEN',
  RESET_VEHICLE_DRIVEN_STATUS = 'RESET_VEHICLE_DRIVEN_STATUS',
  SET_LOSSDATEISO = 'SET_LOSSDATEISO',
  SET_AUTO_EFNOL_FEATURE_FLAGS = 'SET_AUTO_EFNOL_FEATURE_FLAGS',
  SET_SERIALIZED_ERROR = 'SET_SERIALIZED_ERROR',
  SET_CONVERSION_RESULT = 'SET_CONVERSION_RESULT',
  CLEAR_CONVERSION_RESULT = 'CLEAR_CONVERSION_RESULT',
  SET_BRAND = 'SET_BRAND'
}

export const setPolicyNumber = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_POLICY_NUMBER,
  payload
});

export const setToken = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_TOKEN,
  payload
});

export const setSelectedReporter = (payload: ISelectedReporter): Actions => ({
  type: ACTION_TYPE.SET_SELECTED_REPORTER,
  payload
});

export const setWhenInformation = (payload: IWhenInformation): Actions => ({
  type: ACTION_TYPE.SET_WHEN_INFORMATION,
  payload
});

export const setWhereInformation = (payload: IWhereInformation): Actions => ({
  type: ACTION_TYPE.SET_WHERE_INFORMATION,
  payload
});

export const setVehicleInvolvedInIncident = (payload: {
  vehicleTitle: string;
  vin: string;
  customVehicle?: IYearMakeModel;
}): Actions => ({
  type: ACTION_TYPE.SET_VEHICLE_IN_INCIDENT,
  payload
});

export const setCreateClaimInformation = (payload: {
  claimNumber: string;
  driverSummaries?: IDriverViewModel[];
  vehicleSummaries?: IVehicleViewModel[];
  vehicleOptions?: IVehicleOption[];
  insuredFullName?: string;
  policyStatus?: string;
  policyType?: string;
  policyState?: string;
  policyProduct?: string;
}): Actions => ({
  type: ACTION_TYPE.SET_CREATE_CLAIM_INFORMATION,
  payload
});

export const setPolicyInformation = (payload: {
  driverSummaries: IDriverViewModel[];
  vehicleSummaries: IVehicleViewModel[];
  vehicleOptions: IVehicleOption[];
}): Actions => ({
  type: ACTION_TYPE.SET_POLICY_INFORMATION,
  payload
});

export const setSubmitClaimInformation = (payload: IAdjuster): Actions => ({
  type: ACTION_TYPE.SET_SUBMIT_CLAIM_INFORMATION,
  payload
});

export const setClaimSubmittedForClaimNumber = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_CLAIM_SUBMITTED_FOR_CLAIM_NUMBER,
  payload
});

export const setContactInfo = (payload: IWebContactInfo): Actions => ({
  type: ACTION_TYPE.SET_CONTACT_INFO,
  payload
});

export const setContactInfoPrefill = (payload: IContactInfoPrefill): Actions => ({
  type: ACTION_TYPE.SET_CONTACT_INFO_PREFILL,
  payload
});

export const setIncidentDescription = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_INCIDENT_DESCRIPTION,
  payload
});

export const setVehicleParkedStatus = (payload: IIncidentDetailsOptions): Actions => ({
  type: ACTION_TYPE.SET_VEHICLE_PARKED_STATUS,
  payload
});

export const setAnyoneInjured = (payload: YesNoUnknown): Actions => ({
  type: ACTION_TYPE.SET_ANYONE_INJURED,
  payload
});

export const setVehicleTowed = (payload: YesNoUnknown): Actions => ({
  type: ACTION_TYPE.SET_VEHICLE_TOWED,
  payload
});

export const setVehicleDamage = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_VEHICLE_DAMAGE,
  payload
});

export const setOtherPartyInsurance = (payload: IFrontendOtherPartyInsurance) => ({
  type: ACTION_TYPE.SET_OTHER_PARTY_INSURANCE,
  payload
});

export const resetOtherPartyInsurance = () => ({
  type: ACTION_TYPE.RESET_OTHER_PARTY_INSURANCE,
  payload: undefined
});

export const setOtherPartyDriverInformation = (payload: IFrontendOtherPartyDriverInformation) => ({
  type: ACTION_TYPE.SET_OTHER_PARTY_DRIVER_INFORMATION,
  payload
});

export const resetOtherPartyDriverInformation = () => ({
  type: ACTION_TYPE.RESET_OTHER_PARTY_DRIVER_INFORMATION,
  payload: undefined
});

export const setOtherPartyPropertyDamage = (payload: IFrontendOtherPartyPropertyDamage) => ({
  type: ACTION_TYPE.SET_OTHER_PARTY_PROPERTY_DAMAGE,
  payload
});

export const setOtherPartyPedestrian = (payload: IFrontendOtherPartyPedestrian) => ({
  type: ACTION_TYPE.SET_OTHER_PARTY_PEDESTRIAN,
  payload
});

export const resetOtherPartyPedestrian = () => ({
  type: ACTION_TYPE.RESET_OTHER_PARTY_PEDESTRIAN,
  payload: undefined
});

export const setOtherPartyCar = (payload: IYearMakeModel): Actions => ({
  type: ACTION_TYPE.SET_OTHER_PARTY_CAR,
  payload
});

export const setVehicleDrivenStatus = (payload: IIncidentDetailsOptions): Actions => ({
  type: ACTION_TYPE.SET_VEHICLE_DRIVEN_STATUS,
  payload
});

export const setWitness = (payload: IAnyWitness): Actions => ({
  type: ACTION_TYPE.SET_WITNESS,
  payload
});

export const setClaimType = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_CLAIMTYPE,
  payload
});

export const resetState = (payload: State): Actions => ({
  type: ACTION_TYPE.RESET_STATE,
  payload
});

export const resetCity = (): Actions => ({
  type: ACTION_TYPE.RESET_CITY,
  payload: undefined
});

export const setCarStatus = (payload: CarKineticStatus): Actions => ({
  type: ACTION_TYPE.SET_CAR_STATUS,
  payload
});

export const setDriver = (payload: IDriverViewModel): Actions => ({
  type: ACTION_TYPE.SET_DRIVER,
  payload
});

export const setIsReview = (payload: boolean): Actions => ({
  type: ACTION_TYPE.SET_IS_REVIEW,
  payload
});

export const setClubCode = (payload: ClubCodeValues | undefined) => ({
  type: ACTION_TYPE.SET_CLUB_CODE,
  payload
});

export const setEffectiveDate = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_EFFECTIVE_DATE,
  payload
});

export const setExpirationDate = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_EXPIRATION_DATE,
  payload
});

export const setOtherPartyAnyoneInjured = (payload: YesNoUnknown): Actions => ({
  type: ACTION_TYPE.SET_OTHER_PARTY_ANYONE_INJURED,
  payload
});

export const setNumberOfVehiclesInvolved = (payload: VehicleCount): Actions => ({
  type: ACTION_TYPE.SET_NUMBER_OF_VEHICLES_INVOLVED,
  payload
});

export const setKnockoutReason = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_KNOCKOUT_REASON,
  payload
});

export const setDriverNotListedBackNav = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_DRIVER_NOT_LISTED_BACK_NAV,
  payload
});

export const setErrorReason = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_ERROR_REASON,
  payload
});

export const setClubCodeError = (payload: ClubCodeValues) => ({
  type: ACTION_TYPE.SET_CLUB_CODE_ERROR,
  payload
});

export const setWeatherDamage = (payload: IWeatherDamageOptions) => ({
  type: ACTION_TYPE.SET_VEHICLE_WEATHER_DAMAGE,
  payload
});

export const resetWeatherDamage = () => ({
  type: ACTION_TYPE.RESET_VEHICLE_WEATHER_DAMAGE,
  payload: undefined
});

export const setPriorPolicyNumber = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_PRIOR_POLICY_NUMBER,
  payload
});

export const setGetClaimInformation = (payload: {
  claimNumber: string;
  duplicatedClaim: boolean;
  adjuster: IAdjuster | undefined;
}): Actions => ({
  type: ACTION_TYPE.GET_CREATE_CLAIM_INFORMATION,
  payload
});

export const setIsMobileApp = (payload: boolean): Actions => ({
  type: ACTION_TYPE.SET_IS_MOBILE_APP,
  payload
});

export const setIsMobileAppAccidentDetection = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_IS_MOBILE_APP_ACCIDENT_DETECTION,
  payload
});

export const setCrashDatePrediction = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_CRASH_DATE_PREDICTION,
  payload
});

export const setReportedDate = (payload: Dayjs): Actions => ({
  type: ACTION_TYPE.SET_REPORTED_DATE,
  payload
});

export const setLoginFlowType = (payload: LoginFlowType): Actions => ({
  type: ACTION_TYPE.SET_LOGIN_FLOW_TYPE,
  payload
});

export const setInitialPolicyDataBehindLogin = (payload: IInitialPolicyData): Actions => ({
  type: ACTION_TYPE.SET_INITIAL_POLICY_DATA_BEHIND_LOGIN,
  payload
});

export const setPolicyPrefix = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_POLICY_PREFIX,
  payload
});

export const setIsAnonymous = (payload: boolean): Actions => ({
  type: ACTION_TYPE.SET_IS_ANONYMOUS,
  payload
});

export const setPolicyGuid = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_POLICY_GUID,
  payload
});

export const setArea = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_AREA,
  payload
});

export const setSplashStart = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_SPLASH_START,
  payload
});

export const setSplashEnd = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_SPLASH_END,
  payload
});

export const setSourceApp = (payload: AppSource | undefined): Actions => ({
  type: ACTION_TYPE.SET_SOURCE_APP,
  payload
});

export const setClaimsViewGuid = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_CLAIMS_VIEW_GUID,
  payload
});

export const setPassengerCount = (payload: PassengerCount): Actions => ({
  type: ACTION_TYPE.SET_PASSENGER_COUNT,
  payload
});

export const setOtherPartyPassengerCount = (payload: PassengerCount): Actions => ({
  type: ACTION_TYPE.SET_OTHER_PARTY_PASSENGER_COUNT,
  payload
});

export const setLossCause = (payload: LossCause): Actions => ({
  type: ACTION_TYPE.SET_LOSS_CAUSE,
  payload
});

export const setAccidentDetailsWhileDriven = (payload: IAccidentDetailsOptions): Actions => ({
  type: ACTION_TYPE.SET_ACCIDENT_DETAILS_WHILE_DRIVEN,
  payload
});

export const resetAccidentDetailsWhileDriven = () => ({
  type: ACTION_TYPE.RESET_ACCIDENT_DETAILS_WHILE_DRIVEN,
  payload: undefined
});

export const resetVehicleDrivenStatus = () => ({
  type: ACTION_TYPE.RESET_VEHICLE_DRIVEN_STATUS,
  payload: undefined
});

export const setLossDateISO = (payload: string): Actions => ({
  type: ACTION_TYPE.SET_LOSSDATEISO,
  payload
});

export const setAutoEFNOLFeatureFlags = (payload: AutoEFNOLFeatureFlags): Actions => ({
  type: ACTION_TYPE.SET_AUTO_EFNOL_FEATURE_FLAGS,
  payload
});

export const setSerializedError = (payload: ISerializedError): Actions => ({
  type: ACTION_TYPE.SET_SERIALIZED_ERROR,
  payload
});

export const setConversionResult = (payload: IPolicyConversionResult): Actions => ({
  type: ACTION_TYPE.SET_CONVERSION_RESULT,
  payload
});

export const clearConversionResult = (): Actions => ({
  type: ACTION_TYPE.CLEAR_CONVERSION_RESULT,
  payload: undefined
});

export const setBrand = (payload: 'AAA' | 'WInsurance'): Actions => ({
  type: ACTION_TYPE.SET_BRAND,
  payload
});
