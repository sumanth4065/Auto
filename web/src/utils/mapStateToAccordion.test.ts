import {
  VehicleCount,
  LossCause,
  YesNo,
  YesNoUnknown
} from '@ace-clublabs/iss-common-auto-efnol-models';
import dayjs from 'dayjs';
import { describe, expect } from 'vitest';
import { UnknownYearMakeModel } from '../containers/OtherParty/YearMakeModel/YearMakeViewModel';
import { State } from '../store/reducer';
import { mapStateToAccordion, textTransformBasedOnTitle } from './mapStateToAccordion';

// TODO: update mockState properties, shared, fixtures

const mockState: Partial<State> = {
  carStatus: 'beingDriven' as any,
  lossDate: dayjs('2021-01-01T08:00:00.000Z'),
  lossTime: '00:00:00',
  city: 'some-city',
  email: 'some@email.com',
  mobileNumber: '3131313131',
  otherPartyCar: {
    year: 1900,
    make: 'some-make',
    model: 'some-model'
  },
  otherPartyInsuranceCompanyName: 'otherPartyInsuranceCompanyName',
  selectedDriver: {
    firstName: 'some-selected-driver-first-name',
    lastName: 'some-selected-driver-last-name',
    driverId: 'some-driver-id'
  },
  state: 'some-state',
  statusVehicleWhileDriven: {
    description: 'Impacted with another vehicle',
    code: 'impactedwithanothervehicle' as any
  },
  witness: {
    selection: 'yes' as any,
    witnessInformation: {
      firstName: 'witness-first-name',
      lastName: 'witness-last-name'
    }
  },
  vehicleInIncident: {
    year: '2017',
    make: 'Toyota',
    model: 'Corolla LE/SE',
    vin: 'some-vin',
    vehicleId: 'some-id',
    vehicleTitle: '2017 Toyota Corolla LE/SE'
  },
  vehicleTowed: 'yes' as any,
  wasAnyoneInjured: 'yes' as any
};

describe('mapStateToAccordion', () => {
  it('maps state for IncidentInformation accordion', () => {
    const mockStateCustom: Partial<State> = {
      ...mockState,
      lossDate: dayjs('2025-11-19T00:15:00'),
      lossTime: '00:15:00',
      street: '123 Main Street',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      lossLocationDescription: 'Near the intersection by city hall.'
    };

    const result = mapStateToAccordion(mockStateCustom, 'IncidentInformation');

    expect(result).toEqual([
      {
        title: 'loss date',
        description: '11/19/2025',
        maskField: false
      },
      {
        title: 'loss time',
        description: '12:15 AM',
        maskField: false
      },
      {
        title: 'incident street',
        description: '123 Main Street',
        maskField: false
      },
      {
        title: 'incident location',
        description: 'Denver, CO, 80202',
        maskField: false
      },
      {
        title: 'location description',
        description: 'Near the intersection by city hall.',
        maskField: false
      }
    ]);
  });

  it('maps state for yourInformation accordion', () => {
    const result = mapStateToAccordion(mockState, 'YourInformation');

    expect(result).toEqual([
      {
        title: 'vehicle',
        description: '2017 Toyota Corolla LE/SE',
        maskField: false
      },
      {
        title: 'driver',
        description: 'some-selected-driver-first-name some-selected-driver-last-name',
        maskField: true
      },
      {
        title: 'driven or parked',
        description: 'Driven',
        maskField: false
      },
      {
        title: 'what happened',
        description: 'Impacted with another vehicle',
        maskField: false
      },
      {
        title: 'injury',
        description: 'yes',
        maskField: false
      },
      {
        title: 'vehicle towed',
        description: 'yes',
        maskField: false
      }
    ]);
  });

  it('maps state for yourInformation accordion with accident detail', () => {
    const mockStateWithAccidentDetail: Partial<State> = {
      ...mockState,
      accidentDetailsWhileDriven: {
        code: LossCause.BACKCOLLISION,
        description: 'Backing'
      }
    };
    const result = mapStateToAccordion(mockStateWithAccidentDetail, 'YourInformation');

    expect(result).toEqual([
      {
        title: 'vehicle',
        description: '2017 Toyota Corolla LE/SE',
        maskField: false
      },
      {
        title: 'driver',
        description: 'some-selected-driver-first-name some-selected-driver-last-name',
        maskField: true
      },
      {
        title: 'driven or parked',
        description: 'Driven',
        maskField: false
      },
      {
        title: 'what happened',
        description: 'Impacted with another vehicle - Backing',
        maskField: false
      },
      {
        title: 'injury',
        description: 'yes',
        maskField: false
      },
      {
        title: 'vehicle towed',
        description: 'yes',
        maskField: false
      }
    ]);
  });

  it('maps state for yourInformation accordion when damage by weather selected', () => {
    let mockStateDamageByWeather = {
      ...mockState,
      statusVehicleWhileDriven: {
        code: LossCause.WEATHERRELATEDCOMP,
        description: 'Damaged by weather'
      },
      vehicleDamageWeather: {
        code: LossCause.TORNADOCOMP,
        description: 'Tornado'
      }
    };
    const result = mapStateToAccordion(mockStateDamageByWeather, 'YourInformation');

    expect(result).toEqual([
      {
        title: 'vehicle',
        description: '2017 Toyota Corolla LE/SE',
        maskField: false
      },
      {
        title: 'driver',
        description: 'some-selected-driver-first-name some-selected-driver-last-name',
        maskField: true
      },
      {
        title: 'driven or parked',
        description: 'Driven',
        maskField: false
      },
      {
        title: 'what happened',
        description: 'Damaged by weather',
        maskField: false
      },
      {
        title: 'weather loss cause',
        description: 'Tornado',
        maskField: false
      },
      {
        title: 'injury',
        description: 'yes',
        maskField: false
      },
      {
        title: 'vehicle towed',
        description: 'yes',
        maskField: false
      }
    ]);
  });

  it('maps state for otherPartyInformation accordion with subset of data', () => {
    const result = mapStateToAccordion(mockState, 'OtherPartyInformation');

    expect(result).toEqual([
      {
        title: 'number of vehicles involved',
        description: 'none',
        maskField: false
      },
      {
        title: 'vehicle',
        description: '1900 some-make some-model',
        maskField: false
      },
      {
        title: 'insurance company',
        description: 'otherPartyInsuranceCompanyName',
        maskField: false
      },
      {
        title: 'driver',
        description: 'unknown',
        maskField: true
      },
      {
        title: 'mobile number',
        description: 'unknown',
        maskField: true
      },
      {
        title: 'pedestrian',
        description: 'no',
        maskField: false
      },
      {
        title: 'cyclist',
        description: 'no',
        maskField: false
      },
      {
        title: 'witness',
        description: 'witness-first-name witness-last-name',
        maskField: true
      }
    ]);
  });

  it('maps state for otherPartyInformation accordion with full set of data', () => {
    const mockStateWithAllInfoForOtherParty = {
      ...mockState,
      numberOfVehiclesInvolved: VehicleCount.One,
      otherPartyAnyoneInjured: YesNoUnknown.Yes,
      otherPartyDriverFirstName: 'other-first-name',
      otherPartyDriverLastName: 'other-last-name',
      otherPartyDriverMobileNumber: '6666666666',
      otherPartyInsurancePolicyNumber: 'other-policy-number',
      otherPartyPedestriansInvolved: ['cyclist', 'pedestrian'],
      otherPartyPropertyDamage: YesNo.Yes
    };

    const result = mapStateToAccordion(mockStateWithAllInfoForOtherParty, 'OtherPartyInformation');

    expect(result).toEqual([
      {
        title: 'number of vehicles involved',
        description: 'one',
        maskField: false
      },
      {
        title: 'vehicle',
        description: '1900 some-make some-model',
        maskField: false
      },
      {
        title: 'insurance company',
        description: 'otherPartyInsuranceCompanyName',
        maskField: false
      },
      {
        title: 'driver',
        description: 'other-first-name other-last-name',
        maskField: true
      },
      {
        title: 'mobile number',
        description: '666-666-6666',
        maskField: true
      },
      {
        title: 'pedestrian',
        description: 'yes',
        maskField: false
      },
      {
        title: 'cyclist',
        description: 'yes',
        maskField: false
      },
      {
        title: 'witness',
        description: 'witness-first-name witness-last-name',
        maskField: true
      },
      {
        title: 'property damage',
        description: 'yes',
        maskField: false
      },
      {
        title: 'injury',
        description: 'yes',
        maskField: false
      }
    ]);
  });

  it('maps state for otherPartyInformation accordion when no data is available', () => {
    const { otherPartyInsuranceCompanyName, witness, otherPartyCar, ...rest } = mockState;

    const modifiedState: Partial<State> = {
      ...rest,
      witness: {
        selection: YesNoUnknown.Unknown,
        witnessInformation: undefined
      }
    };
    const result = mapStateToAccordion(modifiedState, 'OtherPartyInformation');

    expect(result).toEqual([
      {
        title: 'number of vehicles involved',
        description: 'none',
        maskField: false
      },
      {
        title: 'vehicle',
        description: 'unknown',
        maskField: false
      },
      {
        title: 'insurance company',
        description: 'unknown',
        maskField: false
      },
      {
        title: 'driver',
        description: 'unknown',
        maskField: true
      },
      {
        title: 'mobile number',
        description: 'unknown',
        maskField: true
      },
      {
        title: 'pedestrian',
        description: 'no',
        maskField: false
      },
      {
        title: 'cyclist',
        description: 'no',
        maskField: false
      },
      {
        title: 'witness',
        description: 'unknown',
        maskField: true
      }
    ]);
  });
  
  it('maps state for yourContactInformation accordion', () => {
    const result = mapStateToAccordion(mockState, 'YourContactInformation');

    expect(result).toEqual([
      {
        title: 'email',
        description: 'some@email.com',
        maskField: true
      },
      {
        title: 'mobile number',
        description: '313-131-3131',
        maskField: true
      }
    ]);
  });

  it('maps state for otherPartyInformation accordion when YMM and Driver is Unknown', () => {
    const mockStateWithAllInfoForOtherParty = {
      ...mockState,
      otherPartyCar: UnknownYearMakeModel,
      numberOfVehiclesInvolved: VehicleCount.One,
      otherPartyAnyoneInjured: YesNoUnknown.Yes,
      otherPartyDriverFirstName: YesNoUnknown.Unknown,
      otherPartyDriverLastName: YesNoUnknown.Unknown,
      otherPartyDriverMobileNumber: '',
      otherPartyInsurancePolicyNumber: 'other-policy-number',
      otherPartyPedestriansInvolved: ['cyclist', 'pedestrian'],
      otherPartyPropertyDamage: YesNo.Yes
    };

    const result = mapStateToAccordion(mockStateWithAllInfoForOtherParty, 'OtherPartyInformation');

    expect(result).toEqual([
      {
        title: 'number of vehicles involved',
        description: 'one',
        maskField: false
      },
      {
        title: 'vehicle',
        description: 'unknown',
        maskField: false
      },
      {
        title: 'insurance company',
        description: 'otherPartyInsuranceCompanyName',
        maskField: false
      },
      {
        title: 'driver',
        description: 'unknown',
        maskField: true
      },
      {
        title: 'mobile number',
        description: 'unknown',
        maskField: true
      },
      {
        title: 'pedestrian',
        description: 'yes',
        maskField: false
      },
      {
        title: 'cyclist',
        description: 'yes',
        maskField: false
      },
      {
        title: 'witness',
        description: 'witness-first-name witness-last-name',
        maskField: true
      },
      {
        title: 'property damage',
        description: 'yes',
        maskField: false
      },
      {
        title: 'injury',
        description: 'yes',
        maskField: false
      }
    ]);
  });
});

describe('textTransformBasedOnTitle', () => {
  it('returns valid css for driver information', () => {
    const result = textTransformBasedOnTitle('driver');

    expect(result).toEqual({
      textTransform: 'capitalize'
    });
  });
  it('returns valid css for email information', () => {
    const result = textTransformBasedOnTitle('email');

    expect(result).toEqual({ ':first-letter': { textTransform: 'none' } });
  });
  it('returns valid css for any other information', () => {
    const result = textTransformBasedOnTitle('incident location');

    expect(result).toEqual({ ':first-letter': { textTransform: 'uppercase' } });
  });
});
