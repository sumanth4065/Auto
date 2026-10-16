import { VehicleNotListedOption } from '../types';

/**
 * Value for the "Vehicle not listed" MenuItem. Must stay a stable object reference
 * so SCL fullscreen Select (which replaces MenuItem onClick) still delivers a value
 * we can recognize in form submit — unlike the string `unlistedVehicle`, which was
 * spread into bogus state.
 */
export const VEHICLE_NOT_LISTED_OPTION: VehicleNotListedOption = Object.freeze({
  vehicleTitle: 'Vehicle not listed',
  vin: '',
  year: '',
  make: '',
  model: '',
  isVehicleNotListedOption: true
});

export function isVehicleNotListedSelection(value: unknown): value is VehicleNotListedOption {
  return (
    typeof value === 'object' &&
    value !== null &&
    'isVehicleNotListedOption' in value &&
    (value as { isVehicleNotListedOption?: boolean }).isVehicleNotListedOption === true
  );
}
