/**
 * When the user backs out of Custom Driver, Header passes this on navigate so
 * WhoWasDriving can show the listed-driver dropdown without auto-redirecting to Custom Driver.
 */
export const ALLOW_LISTED_DRIVER_SELECTION_KEY = 'allowListedDriverSelection' as const;

export const listedDriverPickerLocationState = Object.freeze({
  [ALLOW_LISTED_DRIVER_SELECTION_KEY]: true
});
