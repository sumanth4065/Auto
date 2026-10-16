import { ICachedAutoVehicle, IGuideWireAutoVehicle } from '@lib/types';

export const getVehicleFromCache = (
  cachedPolicyVehicles: ICachedAutoVehicle[],
  lossVehicleId: string
): IGuideWireAutoVehicle => {
  const lossVehicleCandidate: ICachedAutoVehicle | undefined =
    cachedPolicyVehicles.find(veh => veh.vehicleId === lossVehicleId);
  if (!lossVehicleCandidate) {
    throw new Error('Unable to find a matching vehicle');
  }
  delete lossVehicleCandidate.vehicleId;
  let cleanedVehicle: IGuideWireAutoVehicle = lossVehicleCandidate;
  return cleanedVehicle;
};
