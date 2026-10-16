import { IDriverViewModel } from '@lib/types';
import { DriverNotListedOption } from '../types';

/**
 * Value for the "Driver not listed" MenuItem. Must stay a stable object reference
 * so SCL fullscreen Select (which replaces MenuItem onClick) still delivers a value
 * we can recognize on form submit — unlike the string `drivernotlisted`, which was
 * spread into bogus driver state.
 */
export const DRIVER_NOT_LISTED_OPTION: DriverNotListedOption = Object.freeze({
  fullName: 'Driver not listed',
  id: 'driver-not-listed',
  driver: Object.freeze({}) as IDriverViewModel,
  isDriverNotListedOption: true
});

export function isDriverNotListedSelection(value: unknown): value is DriverNotListedOption {
  return (
    typeof value === 'object' &&
    value !== null &&
    'isDriverNotListedOption' in value &&
    (value as { isDriverNotListedOption?: boolean }).isDriverNotListedOption === true
  );
}
