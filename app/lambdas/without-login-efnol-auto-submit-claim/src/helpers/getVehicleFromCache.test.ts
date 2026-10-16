import { getVehicleFromCache } from './getVehicleFromCache';

import { ICachedAutoVehicle } from '@lib/types';

describe('getVehicleFromCache', () => {
  const testCachedAutoVehicle: ICachedAutoVehicle = {
    vehicleId: 'some-vehicle-id',
    state: 'some-state',
    country: 'some-country',
    year: 1,
    make: 'some-make',
    model: 'some-model',
    policyVehicle: true,
    publicID: 'some-public-id',
    vin: 'some-vin'
  };

  it('should return a vehicle object for a valid given Loss Vehicle Id', () => {
    let mockICacheAutoVehicleArray: ICachedAutoVehicle[] = [
      testCachedAutoVehicle
    ];

    let result = getVehicleFromCache(
      mockICacheAutoVehicleArray,
      'some-vehicle-id'
    );

    expect(result).toEqual({
      state: 'some-state',
      country: 'some-country',
      year: 1,
      make: 'some-make',
      model: 'some-model',
      policyVehicle: true,
      publicID: 'some-public-id',
      vin: 'some-vin'
    });
  });

  it('should throw Error: `Unable to find a matching vehicle` for a invalid given Loss Vehicle Id', () => {
    let mockICacheAutoVehicleArray: ICachedAutoVehicle[] = [
      testCachedAutoVehicle
    ];

    let result;
    try {
      result = getVehicleFromCache(
        mockICacheAutoVehicleArray,
        'invalid-vehicle-id'
      );
    } catch (err) {
      expect(err.message).toEqual('Unable to find a matching vehicle');
    }
  });
});
