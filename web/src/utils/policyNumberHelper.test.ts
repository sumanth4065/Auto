import { describe, it, expect } from 'vitest';
import type { IPolicyConversionResult } from '@ace-clublabs/iss-common-shared-claims-models';
import { resolvePolicyStateCode, resolveClaimPolicyNumber } from './policyNumberHelper';

describe('resolvePolicyStateCode', () => {
  describe('GW / 3-letter prefix policies — resolved via PolicyLookup registry', () => {
    it('returns lowercase state for a known GW HOME prefix (HTX)', () => {
      expect(resolvePolicyStateCode('HTX000046910')).toBe('tx');
    });

    it('returns lowercase state for a known GW HOME prefix (HAL)', () => {
      expect(resolvePolicyStateCode('HAL000195549')).toBe('al');
    });

    it('returns lowercase state for a known GW AUTO prefix (ACA)', () => {
      expect(resolvePolicyStateCode('ACA123456789')).toBe('ca');
    });
  });

  describe('PStar (single-letter prefix) policies — falls back to aaa-state cookie', () => {
    it('maps a properly-cased full state name to a lowercase state code', () => {
      expect(resolvePolicyStateCode('P09491031', 'aaa-state=Alabama')).toBe('al');
      expect(resolvePolicyStateCode('P09491031', 'aaa-state=California')).toBe('ca');
      expect(resolvePolicyStateCode('P09491031', 'aaa-state=Illinois')).toBe('il');
    });

    it('is case-insensitive for the cookie value', () => {
      expect(resolvePolicyStateCode('P09491031', 'aaa-state=TEXAS')).toBe('tx');
      expect(resolvePolicyStateCode('P09491031', 'aaa-state=illinois')).toBe('il');
      expect(resolvePolicyStateCode('P09491031', 'aaa-state=cAlIfOrNiA')).toBe('ca');
    });

    it('handles multi-word state names', () => {
      expect(resolvePolicyStateCode('P09491031', 'aaa-state=New Mexico')).toBe('nm');
      expect(resolvePolicyStateCode('P09491031', 'aaa-state=West Virginia')).toBe('wv');
      expect(resolvePolicyStateCode('P09491031', 'aaa-state=NEW YORK')).toBe('ny');
    });

    it('returns undefined when PStar policy and cookie is absent', () => {
      expect(resolvePolicyStateCode('P09491031', '')).toBeUndefined();
    });

    it('returns undefined when PStar policy and cookie has no aaa-state key', () => {
      expect(resolvePolicyStateCode('P09491031', 'other=value; another=foo')).toBeUndefined();
    });

    it('returns undefined when cookie value is an unrecognized state name', () => {
      expect(resolvePolicyStateCode('P09491031', 'aaa-state=Unknown')).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('returns undefined when policyNumber is undefined', () => {
      expect(resolvePolicyStateCode(undefined)).toBeUndefined();
    });

    it('returns undefined for an unrecognized prefix (does not fall back to cookie)', () => {
      expect(resolvePolicyStateCode('ZZZ12345678', '')).toBeUndefined();
      expect(resolvePolicyStateCode('ZZZ12345678', 'aaa-state=California')).toBeUndefined();
    });
  });
});

const conversionBase: IPolicyConversionResult = {
  isConversionApplicable: true,
  legacyPolicyNumber: 'LEGACY-001',
  targetPolicyNumber: 'GW-001',
  targetEffectiveDate: '2025-01-01T00:00:00.000Z'
};

const FALLBACK = 'FALLBACK-001';

describe('resolveClaimPolicyNumber', () => {
  it('returns fallback when conversionResult is undefined', () => {
    expect(resolveClaimPolicyNumber(undefined, '2025-01-01T00:00:00-07:00', FALLBACK)).toBe(
      FALLBACK
    );
  });

  it('returns fallback when isConversionApplicable is false', () => {
    const notApplicable: IPolicyConversionResult = {
      ...conversionBase,
      isConversionApplicable: false
    };
    expect(resolveClaimPolicyNumber(notApplicable, '2025-01-01T00:00:00-07:00', FALLBACK)).toBe(
      FALLBACK
    );
  });

  it('returns fallback when targetEffectiveDate is missing', () => {
    const noEffectiveDate: IPolicyConversionResult = {
      ...conversionBase,
      targetEffectiveDate: undefined
    };
    expect(resolveClaimPolicyNumber(noEffectiveDate, '2025-01-01T00:00:00-07:00', FALLBACK)).toBe(
      FALLBACK
    );
  });

  it('returns fallback when lossDateISO is undefined', () => {
    expect(resolveClaimPolicyNumber(conversionBase, undefined, FALLBACK)).toBe(FALLBACK);
  });

  it('returns legacy policy number when loss date is before effective date', () => {
    // 2024-12-15 is before 2025-01-01
    expect(
      resolveClaimPolicyNumber(conversionBase, '2024-12-15T10:00:00-07:00', FALLBACK)
    ).toBe('LEGACY-001');
  });

  it('returns target policy number when loss date is on the effective date', () => {
    // 2025-01-01 is the boundary — should use target (GW)
    expect(
      resolveClaimPolicyNumber(conversionBase, '2025-01-01T10:00:00-07:00', FALLBACK)
    ).toBe('GW-001');
  });

  it('returns target policy number when loss date is after effective date', () => {
    // 2025-06-15 is after 2025-01-01
    expect(
      resolveClaimPolicyNumber(conversionBase, '2025-06-15T10:00:00-07:00', FALLBACK)
    ).toBe('GW-001');
  });

  it('handles Zulu midnight boundary: loss on effective date calendar day uses target', () => {
    // Effective: 2025-01-01T00:00:00.000Z (Zulu midnight = 2024-12-31 4pm PT)
    // Loss: 2025-01-01T10:00:00-07:00 (PT, same calendar day as effective in UTC)
    // Result: date strings "2025-01-01" vs "2025-01-01" → equal → use target
    const zuluMidnight: IPolicyConversionResult = {
      ...conversionBase,
      targetEffectiveDate: '2025-01-01T00:00:00.000Z'
    };
    expect(
      resolveClaimPolicyNumber(zuluMidnight, '2025-01-01T10:00:00-07:00', FALLBACK)
    ).toBe('GW-001');
  });

  it('handles day before Zulu midnight: loss day before effective uses legacy', () => {
    // Effective: 2025-01-01T00:00:00.000Z
    // Loss: 2024-12-31T10:00:00-07:00 (same calendar day as Zulu date - 1)
    // Result: date strings "2024-12-31" < "2025-01-01" → use legacy
    const zuluMidnight: IPolicyConversionResult = {
      ...conversionBase,
      targetEffectiveDate: '2025-01-01T00:00:00.000Z'
    };
    expect(
      resolveClaimPolicyNumber(zuluMidnight, '2024-12-31T10:00:00-07:00', FALLBACK)
    ).toBe('LEGACY-001');
  });

  it('ignores time portion and timezone offset in comparison', () => {
    // Both dates resolve to same calendar date (2025-01-15) regardless of time/tz
    const result: IPolicyConversionResult = {
      ...conversionBase,
      targetEffectiveDate: '2025-01-15T23:59:59.999Z'
    };
    expect(
      resolveClaimPolicyNumber(result, '2025-01-15T00:00:00+05:00', FALLBACK)
    ).toBe('GW-001');
  });
});
