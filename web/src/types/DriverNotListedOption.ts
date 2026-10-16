import { IDriverOption } from './IDriverOption';

export type DriverNotListedOption = IDriverOption & {
  readonly isDriverNotListedOption: true;
};
