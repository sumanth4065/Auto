import { type ClubCode, lookupPolicy } from '@ace-clublabs/iss-common-util';

export type ClubCodeValues = ClubCode;

// @TODO: use split.io to inject allowed markets
const isClubSupported = (clubCode: ClubCode): boolean => {
  const supported: ClubCode[] = [
    '258', // Tidewater
    '004', // Calif
    '252', // Texas
    '065', // ACMO
    '240', // ANE
    '601', // NewMexico
    '018', // Hawaii
    '188', // Northampton
    '001', // Alabama
    '260', // Washington
    '036', // NNE
    '215' // EastCentral
  ];
  return supported.includes(clubCode);
};

const isTenantSupported = (tenant: string) =>
  tenant === 'GUIDEWIRE' || tenant === 'HUON' || tenant === 'POLICYSTAR' || tenant === 'WINSURANCE';

/**
 * Extracts clubcode from policy number and validates expected market.
 * @param policyNumber valid policy number.
 * @returns string representation of the clubcode inferred from the policy prefix, or undefined if club code cannot be inferred from prefix alone.
 * @throws Error when market is not supported or policy is not valid.
 */
export const inferClubCode = (policyNumber: string): ClubCodeValues | undefined => {
  const result = lookupPolicy(policyNumber);

  if (!result || !isTenantSupported(result.tenant)) {
    throw new Error('Policy not valid');
  }

  // WINSURANCE policies carry no productType or clubCode — skip productType validation
  if (result.tenant !== 'WINSURANCE' && result.productType !== 'AUTO') {
    throw new Error('Policy not valid');
  }

  if (result.clubCode && !isClubSupported(result.clubCode)) {
    throw new Error('Market not supported');
  }

  return result.clubCode;
};
