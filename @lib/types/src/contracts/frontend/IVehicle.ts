import { IVehicleViewModel } from '../IShared';
import { IYearMakeModel } from './IYearMakeModel';

//TODO: THIS SHOULD BE UPDATED WHEN WE CREATE THE SOURCE TO FIND ALL THE VEHICLES AND REMOVE IT IF ITS NOT BEING USE
export interface IVehicleOption extends IVehicleViewModel {
  vehicleTitle: string;
  vin: string;
  customVehicle?: IYearMakeModel;
}
