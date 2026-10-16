import { ICachedAutoVehicle, IGuideWireAutoVehicle } from '@lib/types';

export const transformCacheVehicles = (
  cachedVehicles: ICachedAutoVehicle[]
): IGuideWireAutoVehicle[] =>
  cachedVehicles.map(({ vehicleId, ...gwVehicle }: ICachedAutoVehicle) => ({
    ...gwVehicle
  }));
