import { IVehicleOption } from '@lib/types';

export type VehicleNotListedOption = IVehicleOption & { readonly isVehicleNotListedOption: true };
