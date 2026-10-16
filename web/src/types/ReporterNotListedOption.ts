import { IReporterOption } from './IReporterOption';

/** Sentinel option for "Reporter not listed" in Select (stable reference for fullscreen mode). */
export type ReporterNotListedOption = IReporterOption & {
  readonly isReporterNotListedOption: true;
};
