import { describe, it, expect, beforeEach } from 'vitest';

import {
  CLAIM_SESSION_KEY,
  markClaimInProgress,
  clearClaimSession,
  isStaleClaimSession,
  isEntryOrErrorPage
} from './claimSessionGuard';

describe('claimSessionGuard', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('markClaimInProgress', () => {
    it('should set the session marker', () => {
      markClaimInProgress();
      expect(sessionStorage.getItem(CLAIM_SESSION_KEY)).toBe('true');
    });
  });

  describe('clearClaimSession', () => {
    it('should remove the session marker', () => {
      markClaimInProgress();
      clearClaimSession();
      expect(sessionStorage.getItem(CLAIM_SESSION_KEY)).toBeNull();
    });
  });

  describe('isEntryOrErrorPage', () => {
    it('should return true for the intro transition page', () => {
      expect(isEntryOrErrorPage('/')).toBe(true);
    });

    it('should return true for the behind-login entry page', () => {
      expect(isEntryOrErrorPage('/behindlogin')).toBe(true);
    });

    it('should return true for behind-login entry with policyGuid', () => {
      expect(isEntryOrErrorPage('/behindlogin/some-guid')).toBe(true);
    });

    it('should return true for the system error page', () => {
      expect(isEntryOrErrorPage('/error')).toBe(true);
    });

    it('should return true for the session timeout page', () => {
      expect(isEntryOrErrorPage('/session-timeout')).toBe(true);
    });

    it('should return false for a flow page', () => {
      expect(isEntryOrErrorPage('/when-accident')).toBe(false);
    });

    it('should return false for the whattoexpect page', () => {
      expect(isEntryOrErrorPage('/whattoexpect')).toBe(false);
    });

    it('should return false for the filing claim page', () => {
      expect(isEntryOrErrorPage('/claimtype')).toBe(false);
    });

    it('should handle trailing slash', () => {
      expect(isEntryOrErrorPage('/error/')).toBe(true);
    });

    it('should handle different casing', () => {
      expect(isEntryOrErrorPage('/Error')).toBe(true);
    });
  });

  describe('isStaleClaimSession', () => {
    it('should return false when no marker is set', () => {
      expect(isStaleClaimSession('/when-accident')).toBe(false);
    });

    it('should return true on any flow page with marker set', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/when-accident')).toBe(true);
    });

    it('should return true on the whattoexpect page with marker set', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/whattoexpect')).toBe(true);
    });

    it('should return true on the filing claim page with marker set', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/claimtype')).toBe(true);
    });

    it('should return true on create-claim-transition with marker set', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/create-claim-transition')).toBe(true);
    });

    it('should return true on the review claim page with marker set', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/accidentreview')).toBe(true);
    });

    it('should return true on the confirmation page with marker set', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/confirmation')).toBe(true);
    });

    it('should return false on the intro transition page', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/')).toBe(false);
    });

    it('should return false on the behind-login entry page', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/behindlogin')).toBe(false);
    });

    it('should return false on behind-login entry with policyGuid', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/behindlogin/some-guid')).toBe(false);
    });

    it('should return false on the system error page', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/error')).toBe(false);
    });

    it('should return false on the session timeout page', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/session-timeout')).toBe(false);
    });

    it('should handle trailing slash on a flow page', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/claimtype/')).toBe(true);
    });

    it('should handle different casing on an entry page', () => {
      markClaimInProgress();
      expect(isStaleClaimSession('/BehindLogin')).toBe(false);
    });
  });
});
