import {
  VehicleCount,
  LossCause,
  YesNoUnknown,
  PreferredContactMethod,
  CarKineticStatus,
  YesNo
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { ISubmitAutoClaimFrontendRequest, ISubmitAutoClaimFrontendResponse } from '../../contracts';
import { SubmitAutoClaimFrontendResult } from '../../enums';

const submitAutoClaim: ISubmitAutoClaimFrontendRequest = {
  claimNumber: '005048510',
  policyNumber: 'POL123456789',
  lossDate: '01/01/2021',
  lossTime: '14:05',
  lossLocation: {
    city: 'Los Angeles',
    state: 'CA',
    streetAddress: '123 Main Street',
    postalCode: '90012',
    description: 'Near the intersection by city hall.'
  },
  contactInfo: {
    phone: '9998887777',
    email: 'some-email-id@aaa.com',
    preferredContactMethod: PreferredContactMethod.email
  },
  reporter: {
    driverId: 'someReporterUniqueId3'
  },
  lossDescription: 'Incident description some-additional-details',
  hadOtherPropertyDamage: YesNo.No,
  incidentOtherNonVehicleParties: undefined,
  lossCause: LossCause.OTHERCOLL,
  lossVehicle: {
    damageDescription: 'vehicle damage description',
    hadInjuries: YesNoUnknown.No,
    incidentDriverId: 'someUniqueId3',
    towed: YesNoUnknown.Yes,
    vehicleDrivenOrParked: CarKineticStatus.BeingDriven,
    vehicleId: 'someUniqueId1',
    insuredVehicle: undefined
  },
  incidentOtherVehicleCount: VehicleCount.None,
  isTextCommunicationOptIn: false,
  isMobileAppAccidentDetection: 'true',
  dateOfCrashPrediction: '2023-10-06',
  sr1_VehicleNumber: 1
} as ISubmitAutoClaimFrontendRequest;

export const submitAutoClaimCarDrivenWithOneOtherParty: ISubmitAutoClaimFrontendRequest = {
  ...submitAutoClaim,
  lossCause: LossCause.OTHERCOLL,
  lossVehicle: {
    damageDescription: 'some vehicle damage description while driven',
    hadInjuries: YesNoUnknown.Yes,
    incidentDriverId: 'someUniqueId3',
    // see notes on createRequestBody - This field is not captured, so not required to map
    // passengerCount: PassengerCount.Three,
    towed: YesNoUnknown.Yes,
    vehicleDrivenOrParked: CarKineticStatus.BeingDriven,
    vehicleId: 'someUniqueId1',
    insuredVehicle: undefined
  },
  incidentOtherVehicleCount: VehicleCount.One,
  // see notes on createRequestBody - This field is not captured, so not required to map
  // incidentOtherNonVehicleParties: OtherNonVehicleParties.Cyclist,
  incidentSingleOtherVehicle: {
    wasSomeoneDrivingOtherVehicle: YesNoUnknown.Yes,
    // see notes on createRequestBody - This field is not captured, so not required to map
    // passengerCount: PassengerCount.Two,
    hadInjuries: YesNoUnknown.No,
    driver: {
      firstName: 'some-other-party-firstname',
      lastName: 'some-other-party-lastname',
      mobilePhone: 'some-mobile-number'
    },
    insuranceCompany: {
      companyName: 'Geico',
      policyNumber: 'some other party policy number'
    },
    vehicleInfo: {
      year: 2018,
      make: 'Toyota',
      model: 'Prius'
    }
  },
  witness: {
    firstName: 'Sol',
    lastName: 'Sook',
    mobilePhone: '9493334444'
  },
  hadOtherPropertyDamage: YesNo.No,
  isTextCommunicationOptIn: false,
  isMobileAppAccidentDetection: 'true'
};

export const submitAutoClaimCarParked: ISubmitAutoClaimFrontendRequest = {
  ...submitAutoClaim,
  lossCause: LossCause.VANDALISMCOMP,
  lossVehicle: {
    damageDescription: 'some vehicle damage description while parked',
    hadInjuries: YesNoUnknown.Yes,
    incidentDriverId: 'someUniqueId3',
    vehicleDrivenOrParked: CarKineticStatus.Parked,
    vehicleId: 'someUniqueId1',
    insuredVehicle: undefined,
  },
  incidentSingleOtherVehicle: {
    wasSomeoneDrivingOtherVehicle: YesNoUnknown.Unknown
  },
  isTextCommunicationOptIn: true,
  incidentOtherVehicleCount: VehicleCount.None,
  isMobileAppAccidentDetection: 'true'
};

export const submitAutoClaimCarParkedWeatherDamage: ISubmitAutoClaimFrontendRequest = {
  ...submitAutoClaim,
  lossCause: LossCause.TORNADOCOMP,
  lossVehicle: {
    damageDescription: 'some vehicle damage description while parked',
    hadInjuries: YesNoUnknown.Yes,
    incidentDriverId: 'someUniqueId3',
    towed: YesNoUnknown.Yes,
    vehicleDrivenOrParked: CarKineticStatus.Parked,
    vehicleId: 'someUniqueId1',
    insuredVehicle: undefined
  },
  incidentSingleOtherVehicle: {
    wasSomeoneDrivingOtherVehicle: YesNoUnknown.Unknown
  },
  isTextCommunicationOptIn: true,
  incidentOtherVehicleCount: VehicleCount.None,
  isMobileAppAccidentDetection: 'false'
};

//TODO maybe add a response fixture for SubmitAutoClaimFrontendResult.SuccessWithEmailFailure
export const submitAutoClaimFrontendResponseFixture: ISubmitAutoClaimFrontendResponse = {
  APIResult: SubmitAutoClaimFrontendResult.SuccessWithEmailSuccess,
  adjuster: {
    displayName: 'Anna So',
    firstName: 'Anna',
    lastName: 'So',
    phoneNumber: '8006705080',
    email: 'test-adjuster@aaa-calif.com'
  }
};
