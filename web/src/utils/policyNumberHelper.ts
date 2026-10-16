import type { IPolicyConversionResult } from '@ace-clublabs/iss-common-shared-claims-models';
import {
  CookieHelper,
  getState,
  isPolicyStarPolicy,
  US_STATE_NAME_TO_CODE
} from '@ace-clublabs/iss-common-util';

const AAA_STATE_COOKIE = 'aaa-state';

/**
 * Resolves a 2-letter lowercase state code for use in analytics tagging.
 *
 * For GW/Huon (3-letter prefix) policies: delegates to the PolicyLookup registry via getState().
 * For PStar (single-letter P/A prefix): getState() returns undefined; falls back to the
 * 'aaa-state' cookie set by AEM, which stores the full state name (e.g. "California").
 * Returns undefined if state cannot be determined — callers should omit the tag entirely.
 */
export const resolvePolicyStateCode = (
  policyNumber: string | undefined,
  cookies: string = typeof document !== 'undefined' ? document.cookie : ''
): string | undefined => {
  if (!policyNumber) return undefined;

  const stateFromPrefix = getState(policyNumber);
  if (stateFromPrefix !== undefined) {
    return stateFromPrefix.toLowerCase();
  }

  // Cookie fallback is only valid for legacy PStar policy numbers (single-letter A/P prefix)
  const isPStarPolicyNumber = isPolicyStarPolicy(policyNumber);
  if (!isPStarPolicyNumber) return undefined;

  const cookieValue = CookieHelper.getCookieValue(cookies, AAA_STATE_COOKIE);
  if (!cookieValue) return undefined;

  // Normalize the cookie value to title case for map lookup (cookie may arrive in any casing)
  const normalized = cookieValue
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  const code = US_STATE_NAME_TO_CODE[normalized];
  return code ? code.toLowerCase() : undefined;
};

/**
 * Resolves the policy number to use for a claim based on the conversion result and loss date.
 *
 * When a policy has been converted (e.g. PSTAR → GW), the correct policy number to use
 * depends on whether the loss occurred before or after the GW effective date:
 * - Loss before effective date → use the legacy policy number
 * - Loss on or after effective date → use the target (GW) policy number
 *
 * Both dates are compared as calendar dates (YYYY-MM-DD) to avoid timezone midnight traps:
 * - Effective date from backend arrives in Zulu time (Z), e.g., 2025-01-01T00:00:00.000Z
 * - Loss date includes local timezone offset, e.g., 2025-01-01T10:00:00-07:00
 * - Direct comparison could incorrectly place 2025-01-01 PT on the wrong side of Zulu midnight
 * - Solution: extract date-only portions and compare as YYYY-MM-DD strings
 */
export const resolveClaimPolicyNumber = (
  conversionResult: IPolicyConversionResult | undefined,
  lossDateISO: string | undefined,
  fallbackPolicyNumber?: string
): string => {
  if (
    !conversionResult ||
    !conversionResult?.isConversionApplicable ||
    !conversionResult?.targetEffectiveDate ||
    !lossDateISO
  ) {
    return fallbackPolicyNumber ?? '';
  }

  const effectiveDateStr = conversionResult.targetEffectiveDate.split('T')[0];
  const lossDateStr = lossDateISO.split('T')[0];

  return lossDateStr < effectiveDateStr
    ? conversionResult.legacyPolicyNumber
    : conversionResult.targetPolicyNumber;
};
