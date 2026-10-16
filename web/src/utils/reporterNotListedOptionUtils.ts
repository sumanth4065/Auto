import { ReporterNotListedOption } from '../types';

/**
 * Value for the "Reporter not listed" MenuItem. Must stay a stable object reference
 * so SCL fullscreen Select (which replaces MenuItem onClick) still delivers a value
 * we can recognize on form submit — unlike the string `unlistedreporter`, which was
 * spread into bogus state.
 */
export const REPORTER_NOT_LISTED_OPTION: ReporterNotListedOption = Object.freeze({
  fullName: 'Reporter not listed',
  id: '',
  driver: {} as ReporterNotListedOption['driver'],
  isReporterNotListedOption: true
});

export function isReporterNotListedSelection(value: unknown): value is ReporterNotListedOption {
  return (
    typeof value === 'object' &&
    value !== null &&
    'isReporterNotListedOption' in value &&
    (value as { isReporterNotListedOption?: boolean }).isReporterNotListedOption === true
  );
}
