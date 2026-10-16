import { thirdPartyVehicleHelper } from './thirdPartyVehicleHelper';
import { PassengerCount, YesNoUnknown } from '@ace-clublabs/iss-common-auto-efnol-models';

describe('thirdPartyVehicleHelper', () => {
  it('returns incidentSingleOtherVehicle information when is present in the request body and nobody was driving the other party', () => {
    const result = thirdPartyVehicleHelper({
      wasSomeoneDrivingOtherVehicle: 'no' as YesNoUnknown,
      vehicleInfo: {
        year: 1,
        make: 'some-vehicle-make',
        model: 'some-vehicle-model'
      },
      passengerCount: PassengerCount.Two,
      hadInjuries: YesNoUnknown.Yes
    });

    expect(result).toEqual({
      vehicle: {
        year: 1,
        make: 'some-vehicle-make',
        model: 'some-vehicle-model',
        country: 'US'
      },
      ace_LossParty: 'third_party',
      ACE_DriverOccupiedType: 'No-Driver'
    });
  });
  it('returns incidentSingleOtherVehicle information when is present in the request body and somebody was driving the other party', () => {
    const result = thirdPartyVehicleHelper({
      wasSomeoneDrivingOtherVehicle: 'yes' as YesNoUnknown,
      vehicleInfo: {
        year: 1,
        make: 'some-vehicle-make',
        model: 'some-vehicle-model'
      },
      driver: {
        firstName: 'some-driver-first-name',
        lastName: 'some-driver-last-name',
        mobilePhone: 'some-driver-mobile-phone'
      },
      passengerCount: PassengerCount.Two,
      hadInjuries: YesNoUnknown.Yes
    });

    expect(result).toEqual({
      vehicle: {
        year: 1,
        make: 'some-vehicle-make',
        model: 'some-vehicle-model',
        country: 'US'
      },
      driver: {
        firstName: 'some-driver-first-name',
        lastName: 'some-driver-last-name',
        cellNumber: 'some-driver-mobile-phone',
        primaryPhoneType: 'mobile'
      },
      ace_LossParty: 'third_party',
      ACE_DriverOccupiedType: 'Known-Driver'
    });
  });
  it("returns incidentSingleOtherVehicle information when is present in the request body and it's unknown the driver of the other party", () => {
    const result = thirdPartyVehicleHelper({
      wasSomeoneDrivingOtherVehicle: 'unknown' as YesNoUnknown,
      vehicleInfo: {
        year: 1,
        make: 'some-vehicle-make',
        model: 'some-vehicle-model'
      },
      passengerCount: PassengerCount.Two,
      hadInjuries: YesNoUnknown.Yes
    });

    expect(result).toEqual({
      vehicle: {
        year: 1,
        make: 'some-vehicle-make',
        model: 'some-vehicle-model',
        country: 'US'
      },
      ace_LossParty: 'third_party',
      ACE_DriverOccupiedType: 'Unknown-Driver'
    });
  });
  it('returns undefined when incidentSingleOtherVehicle information is not present in the request body', () => {
    const result = thirdPartyVehicleHelper(undefined);

    expect(result).toBe(undefined);
  });

  it('returns base vehicle information when vehicle information is not present in the request body', () => {
    const result = thirdPartyVehicleHelper({
      wasSomeoneDrivingOtherVehicle: 'no' as YesNoUnknown,
      hadInjuries: 'unknown' as YesNoUnknown,
      passengerCount: 'unknown' as PassengerCount
    });

    expect(result).toEqual(undefined);
  });
  it('returns incidentSingleOtherVehicle information when YMM is unknown', () => {
    const result = thirdPartyVehicleHelper({
      wasSomeoneDrivingOtherVehicle: 'no' as YesNoUnknown,
      vehicleInfo: {
        make: 'unknown',
        model: 'unknown',
        year: 1900
      },
      passengerCount: PassengerCount.Two,
      hadInjuries: YesNoUnknown.Yes
    });

    expect(result).toEqual({
      vehicle: {
        make: 'unknown',
        model: 'unknown',
        country: 'US',
        year: 1900
      },
      ace_LossParty: 'third_party',
      ACE_DriverOccupiedType: 'No-Driver'
    });
  });
});
