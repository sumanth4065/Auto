import { CarKineticStatus, YesNoUnknown } from '@ace-clublabs/iss-common-auto-efnol-models';
import { LoginFlowType } from '@lib/shared-contracts';
import { LossCause } from '@lib/types';
import dayjs from 'dayjs';
import { State } from '../store/reducer';
import { transformDateTimeFormat } from '../utils/dayjsDateHelper';

export const mockState: Partial<State> = {
  policyNumber: 'CAA123456789',
  token: 'some-token',
  lossDate: dayjs('2021-01-01T08:00:00.000Z'),
  lossTime: '14:05',
  lossDateFormat: transformDateTimeFormat(dayjs('2021-01-01T08:00:00.000Z'), '14:05'),
  street: '123 Main Street',
  state: 'CA',
  city: 'Los Angeles',
  zipCode: '90012',
  lossLocationDescription: 'Near the intersection by city hall.',
  claimNumber: '005048510',
  driverSummaries: [
    {
      driverId: 'someUniqueId3',
      email: 'm@aa.com',
      firstName: 'MARIALITA',
      lastName: 'SAMAYOA',
      mobileNumber: '3211111111'
    },
    {
      driverId: 'someUniqueId4',
      email: 'l@aa.com',
      firstName: 'LILIANA',
      lastName: 'SAMAYOA',
      mobileNumber: '3212222222'
    }
  ],
  vehicleSummaries: [
    {
      year: '2001',
      make: 'FORD',
      model: 'F350 CREW C CREW',
      vin: '*************6441',
      RUNumber: 'RU12345'
    },
    {
      year: '2007',
      make: 'LINC',
      model: 'MKX',
      vin: '*************2379',
      RUNumber: 'RU67890'
    }
  ],
  mobileNumber: '9998887777',
  email: 'some-email-id@aaa.com',
  enableTextCommunication: true,
  incidentDescription: 'Incident description some-additional-details',
  wasAnyoneInjured: YesNoUnknown.Unknown,
  claimType: 'otherDamage',
  vehicleInIncident: {
    year: '2001',
    make: 'FORD',
    model: 'F350 CREW C CREW',
    vin: '*************6441',
    RUNumber: 'RU12345',
    vehicleTitle: '2001 FORD F350 CREW C CREW',
    vehicleId: 'someUniqueId1'
  },
  selectedDriver: {
    firstName: 'Jhon',
    lastName: 'Doe',
    driverId: 'someUniqueId3'
  },
  selectedReporter: {
    id: 'someReporterUniqueId3',
    fullName: 'MARIALITA SAMAYOA'
  },
  vehicleOptions: [
    {
      year: '2001',
      make: 'FORD',
      model: 'F350 CREW C CREW',
      RUNumber: 'RU12345',
      vehicleTitle: '2001 FORD F350 CREW C CREW',
      vin: '*************6441',
      vehicleId: 'someUniqueId1'
    },
    {
      year: '2007',
      make: 'LINC',
      model: 'MKX',
      vin: '*************2379',
      RUNumber: 'RU67890',
      vehicleTitle: '2007 LINC MKX',
      vehicleId: 'someUniqueId2'
    }
  ],
  isMobileAppAccidentDetection: 'true',
  dateOfCrashPrediction: '2023-10-06',
  driverId: 'DRIVER123456',
  vehicleTowed: YesNoUnknown.Yes,
  loginFlowType: LoginFlowType.ANONYMOUS
};

export const mockStateWithoutRUNumber: Partial<State> = {
  ...mockState,
  vehicleSummaries: [
    {
      year: '2001',
      make: 'FORD',
      model: 'F350 CREW C CREW',
      vehicleId: 'someUniqueId1',
      vin: '*************6441'
    },
    {
      year: '2007',
      make: 'LINC',
      model: 'MKX',
      vehicleId: 'someUniqueId2',
      vin: '*************2379'
    }
  ]
};

export const mockStateCarParked: Partial<State> = {
  ...mockState,
  carStatus: CarKineticStatus.Parked,
  damageDescription: 'some vehicle damage description while parked',
  statusVehicleWhileParked: {
    code: LossCause.VANDALISMCOMP,
    description: 'Vandalized'
  }
};

export const mockStateWeatherDamage: Partial<State> = {
  ...mockState,
  carStatus: CarKineticStatus.Parked,
  damageDescription: 'some vehicle damage description while parked',
  statusVehicleWhileParked: {
    code: LossCause.WEATHERRELATEDCOMP,
    description: 'Damaged by weather'
  },
  vehicleDamageWeather: {
    code: LossCause.TORNADOCOMP,
    description: 'Tornado'
  }
};

export const mockStateCarDrivenWithOneOtherParty: Partial<State> = {
  ...mockState,
  carStatus: CarKineticStatus.BeingDriven,
  damageDescription: 'some vehicle damage description while driven',
  statusVehicleWhileDriven: {
    description: 'Impacted with another vehicle',
    code: LossCause.OTHERCOLL
  },
  otherPartyInsuranceCompanyName: 'Geico',
  witness: {
    selection: YesNoUnknown.Yes,
    witnessInformation: {
      firstName: 'Sol',
      lastName: 'Sook',
      mobilePhone: '9493334444'
    }
  },
  wasAnyoneInjured: YesNoUnknown.Yes,
  vehicleTowed: YesNoUnknown.Yes,
  otherPartyCar: {
    year: 2018,
    make: 'Toyota',
    model: 'Prius'
  },
  otherPartyInsurancePolicyNumber: 'some other party policy number',
  enableTextCommunication: false,
  otherPartyAnyoneInjured: YesNoUnknown.No
};

export const mockStateCarDrivenWithOneOtherPartyAndDriver: Partial<State> = {
  ...mockStateCarDrivenWithOneOtherParty,
  otherPartyDriverFirstName: 'some-other-party-firstname',
  otherPartyDriverLastName: 'some-other-party-lastname',
  otherPartyDriverMobileNumber: 'some-mobile-number'
};

export const mockStateBehindLogin: Partial<State> = {
  ...mockState,
  loginFlowType: LoginFlowType.BEHIND_LOGIN
};

export const mockStateCarParkedBehindLogin: Partial<State> = {
  ...mockStateCarParked,
  loginFlowType: LoginFlowType.BEHIND_LOGIN
};
