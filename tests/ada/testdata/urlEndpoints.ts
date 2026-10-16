/**
 * URL Endpoint Constants for ADA Tests
 * 
 * This file contains all URL endpoints used in navigation verification
 * across page objects. Centralizing these values makes tests easier to maintain
 * when routes change.
 * 
 * Two types of endpoints:
 * 1. Short endpoints - Used with clickElement_WaitforNavigation() 
 * 2. Full URL patterns - Used with page.waitForURL()
 */

export const URL_ENDPOINTS = {
  // ============ Short Endpoints (for clickElement_WaitforNavigation) ============
  // Introduction & Initial Flow
  EMPTY: '',
  
  // Filing Claim Flow
  FILING_CLAIM: 'filing-claim',
  TRANSITION_PAGE: 'transitionpage',
  SAFELITE_REDIRECT: 'safeliteredirect',
  
  // Policyholder & Contact
  CONTACTINFO: 'contactinfo',
  CAR_DETAILS_TRANSITION: 'car-details-transition',
  
  // Vehicle Information
  CAR_INVOLVED: 'carinvolved',
  CAR_KINETIC_STATUS: 'carkineticstatus',
  
  // Incident Details Flow
  WHERE_WHEN_ACCIDENT: 'where-when-accident',
  WHEN_ACCIDENT: 'when-accident',
  DRIVEN_WHAT_HAPPENED: 'drivenwhathappened',
  PARKED_WHAT_HAPPENED: 'parkedwhathappened',
  TOWED: 'towed',
  
  // Driver & Passengers
  DRIVER: 'driver',
  PASSENGERS: 'passengers',
  
  // Injuries & Damage
  INJURED: 'injured',
  ADDITIONAL_DETAILS: 'additionaldetails',
  ADDITIONAL_DETAILS_TRANSITION: 'additional-details-transition',
  VEHICLE_DAMAGE: 'vehicledamage',
  VEHICLES_INVOLVED_NUMBER: 'vehiclesinvolvednumber',
  
  // Other Party Information
  OTHER_PARTY_INFO_TRANSITION: 'otherpartyinformationtransition',
  PEDESTRIAN_OR_CYCLIST_INVOLVED: 'pedestrianorcyclistinvolved',
  PROPERTY_DAMAGE: 'propertydamage',
  ADDITIONAL_PROPERTY_DAMAGE: 'additionalpropertydamage',
  YEAR_MAKE_MODEL: 'yearmakemodel',
  OTHER_PARTY_INSURANCE_INFO: 'otherpartyinsuranceinfo',
  OTHER_PARTY_VEHICLE_DRIVER_INFO: 'otherpartyvehicledriverinfo',
  OTHER_PARTY_INJURED_CHECK: 'otherpartyinjuredcheck',
  WITNESS_INFO: 'witnessinfo',
  
  // Review & Submit
  ACCIDENT_REVIEW: 'accidentreview',
  CONFIRMATION: 'confirmation',
  
  // Knockout Pages
  KNOCKOUT: 'knockout',
};

// ============ Full URL Patterns (for page.waitForURL) ============
export const FULL_URL_PATTERNS = {
  // Base paths
  CLAIM_TYPE: '**/file-a-claim/claimtype',
  
  // Auto claim paths
  AUTO_SAFELITE_REDIRECT: '**/auto/file-a-claim//safeliteredirect',
  AUTO_TRANSITION_PAGE: '**/auto/file-a-claim/transitionpage',
  AUTO_CARD_DAMAGE_TRANSITION: '**/auto/file-a-claim/cardamagetransition',
  AUTO_CAR_INVOLVED: '**/auto/file-a-claim/carinvolved',
  AUTO_CONTACTINFO: '**/auto/file-a-claim/contactinfo',
  AUTO_DRIVER: '**/auto/file-a-claim/driver',
  AUTO_VEHICLES_INVOLVED_NUMBER: '**/auto/file-a-claim/vehiclesinvolvednumber',
  AUTO_VEHICLE_DAMAGE_BY_WEATHER: '**/auto/file-a-claim/vehicledamagebyweather',
  AUTO_WHEN_ACCIDENT: '**/auto/file-a-claim/when-accident',
  AUTO_KNOCKOUT: '**/auto/file-a-claim/knockout',
};

/**
 * Helper function to get full URL pattern from short endpoint
 * Useful when you need to convert between formats
 */
export function getFullUrlPattern(shortEndpoint: string): string {
  return `**/auto/file-a-claim/${shortEndpoint}`;
}

// Export for backward compatibility
export default URL_ENDPOINTS;

