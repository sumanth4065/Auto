import { vi, describe, it } from 'vitest';
import {
  ClubCodes,
  dtoDeepClone,
  ITenant,
  PolicyType,
  PolicyTypeAndTenantHelper
} from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { CarKineticStatus, ClaimType, KnockoutReason, LossCause } from '@lib/types';
import { StaticTagParts } from './AceMediaTag.model';
import * as DeviceHelper from './checkIsMobileDevice';
import { shouldIncludeFlowTag, TaggingService, TEALIUM_CONFIG } from './TaggingService';
import { clearTagTrackLog, readTagTrackLog } from './tagTrackLog';
import * as TaggingUtils from './taggingUtils';
import { Pages } from '../../shared/pages';

const appStateMock = Object.freeze({
  carStatus: 'beingDriven',
  claimNumber: '123456789',
  claimType: 'ALL_OTHER_DAMAGE',
  clubCode: '240',
  errorReason: '%%ERRORREASON%%',
  knockoutReason: '%%KNOCKOUTREASON%%',
  lossDateISO: '2025-12-13T17:25:00.000Z',
  policyNumber: 'RIA123456',
  statusVehicleWhileDriven: {
    code: 'animalcomp'
  }
});

const appStateBeforeWhenIncidentSubmitted = Object.freeze({
  ...appStateMock,
  lossDateISO: undefined
});

describe('Tagging Service', () => {
  const getSessionIdSpy = vi.spyOn(LogCannon, 'getSessionId');
  const deviceHelperSpy = vi.spyOn(DeviceHelper, 'mobileOrDesktop');
  const getCurrentPageSpy = vi.spyOn(TaggingUtils, 'getCurrentPage');
  const getFlowValueSpy = vi.spyOn(TaggingUtils, 'getFlowValue');
  const policyTenantHelperSpy = vi.spyOn(
    PolicyTypeAndTenantHelper,
    'getTenantAndProductFromPolicyNumber'
  );

  beforeEach(() => {
    getSessionIdSpy.mockImplementation(() => {
      119;

      return 'some-session-id';
    });

    deviceHelperSpy.mockImplementation(() => {
      return 'mobile';
    });

    policyTenantHelperSpy.mockImplementation(() => {
      return {
        tenant: ITenant.GUIDEWIRE,
        productType: PolicyType.AUTO,
        clubCode: ClubCodes.ANE
      };
    });
    getFlowValueSpy.mockReturnValue('accident');
    getCurrentPageSpy.mockImplementation(() => {
      return 'whattoexpect';
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('shouldIncludeFlowTag', () => {
    const stateNoLoss = { ...appStateMock, lossDateISO: undefined };

    it('is false on FilingClaim for all-other damage', () => {
      expect(shouldIncludeFlowTag(stateNoLoss as any, Pages.FilingClaim)).toBe(false);
    });

    it('is false on Intro for all-other damage', () => {
      expect(shouldIncludeFlowTag(stateNoLoss as any, Pages.Intro)).toBe(false);
    });

    it('is true on BehindLoginEntry when flow can be derived (not anonymous pre-claim funnel)', () => {
      expect(shouldIncludeFlowTag(stateNoLoss as any, Pages.BehindLoginEntry)).toBe(true);
    });

    it('is true on IncidentInfoIntro (transition page) without lossDateISO', () => {
      expect(shouldIncludeFlowTag(stateNoLoss as any, Pages.IncidentInfoIntro)).toBe(true);
    });

    it('is true on WhenAccident without lossDateISO', () => {
      expect(shouldIncludeFlowTag(stateNoLoss as any, Pages.WhenAccident)).toBe(true);
    });

    it('is true for glass-only on FilingClaim without lossDateISO', () => {
      expect(
        shouldIncludeFlowTag(
          {
            ...appStateMock,
            claimType: ClaimType.GLASS_ONLY_DAMAGE,
            lossDateISO: undefined
          } as any,
          Pages.FilingClaim
        )
      ).toBe(true);
    });
  });

  const baseTag: StaticTagParts = {
    channel: 'my account',
    subchannel1: 'insurance',
    subchannel2: 'easy auto fnol',
    category: ['my account:insurance:easy auto fnol']
  };

  const tagParams = {
    page: Pages.Intro,
    policyNumber: 'RIA000046910',
    error: '',
    claimType: ClaimType.ALL_OTHER_DAMAGE,
    kineticStatus: CarKineticStatus.BeingDriven,
    lossCause: LossCause.AIR_CRASH,
    claimNumber: '',
    isTextCommunicationOptIn: '',
    cta: ''
  };

  describe('BuildTag', () => {
    it('should set ins_policy to the first letter when policy is PStar (9 chars, starts with A or P)', () => {
      const appStatePStar = {
        ...appStateMock,
        policyNumber: 'A12345678' // 9 chars, starts with A → valid PStar
      };

      const service = new TaggingService();
      const result = service.BuildTag(appStatePStar as any, Pages.Intro);

      expect(result!.ins_policy).toEqual(['A']);
    });

    it('should set ins_policy to first 3 letters for 12-char HUON/Guidewire policies', () => {
      const appStateHUON = {
        ...appStateMock,
        policyNumber: 'CAA999999999' // 12 chars → prefix = CAA
      };

      const service = new TaggingService();
      const result = service.BuildTag(appStateHUON as any, Pages.Intro);

      expect(result!.ins_policy).toEqual(['CAA']);
    });

    it('should not set ins_policy when policy number does not match PStar or HUON patterns', () => {
      const appStateInvalid = {
        ...appStateMock,
        policyNumber: 'RIA123456' // no rule matched → undefined
      };

      const service = new TaggingService();
      const result = service.BuildTag(appStateInvalid as any, Pages.Intro);

      expect(result!.ins_policy).toBeUndefined();
    });

    describe('state tag', () => {
      it('includes state in tag for a known GW prefix (HTX → tx)', () => {
        const service = new TaggingService();
        const result = service.BuildTag(
          { ...appStateMock, policyNumber: 'HTX000046910' } as any,
          Pages.Intro
        );
        expect(result!.state).toBe('tx');
      });

      it('includes state in tag for a PStar policy when aaa-state cookie is present', () => {
        vi.spyOn(document, 'cookie', 'get').mockReturnValue('aaa-state=Arizona; othercookie=value');

        const service = new TaggingService();
        const result = service.BuildTag(
          { ...appStateMock, policyNumber: 'P09491031' } as any,
          Pages.Intro
        );
        expect(result!.state).toBe('az');
      });

      it('omits state for a PStar policy when no aaa-state cookie is present', () => {
        vi.spyOn(document, 'cookie', 'get').mockReturnValue('');

        const service = new TaggingService();
        const result = service.BuildTag(
          { ...appStateMock, policyNumber: 'P09491031' } as any,
          Pages.Intro
        );
        expect(result).not.toHaveProperty('state');
      });

      it('omits state for an unrecognized prefix', () => {
        const service = new TaggingService();
        const result = service.BuildTag(
          { ...appStateMock, policyNumber: 'ZZZ12345678' } as any,
          Pages.Intro
        );
        expect(result).not.toHaveProperty('state');
      });
    });

    it('should set text_opt_in and email_opt_in to "true" when enabled', () => {
      const appStateWithOptIns = {
        ...appStateMock,
        enableTextCommunication: true,
        enableEmailCommunication: true
      };
      const service = new TaggingService();
      const result = service.BuildTag(appStateWithOptIns as any, Pages.Intro);

      expect(result!.text_opt_in).toBe('true');
      expect(result!.email_opt_in).toBe('true');
    });

    it('should set text_opt_in and email_opt_in to "false" when disabled', () => {
      const appStateWithOptOuts = {
        ...appStateMock,
        enableTextCommunication: false,
        enableEmailCommunication: false
      };
      const service = new TaggingService();
      const result = service.BuildTag(appStateWithOptOuts as any, Pages.Intro);

      expect(result!.text_opt_in).toBe('false');
      expect(result!.email_opt_in).toBe('false');
    });

    it('should omit text_opt_in and email_opt_in when undefined', () => {
      const service = new TaggingService();
      const result = service.BuildTag(appStateMock as any, Pages.Intro);

      expect(result!.text_opt_in).toBeUndefined();
      expect(result!.email_opt_in).toBeUndefined();
    });

    it('should build a tag that contains all of the static tag values', () => {
      const service = new TaggingService();
      service.BuildTag(appStateMock as any, Pages.IncidentInfoIntro);
      const staticParts: StaticTagParts = (({ channel, subchannel1, subchannel2, category }) => ({
        channel,
        subchannel1,
        subchannel2,
        category
      }))(service.Tag);

      expect(staticParts).toEqual(baseTag);
    });

    it('should omit flow and product before incident intro (transition page)', () => {
      const tagParamWithPage = dtoDeepClone(tagParams);
      tagParamWithPage.page = Pages.Intro;
      const service = new TaggingService();
      service.BuildTag(appStateBeforeWhenIncidentSubmitted as any, Pages.Intro);

      const expected = {
        page: 'my account:insurance:easy auto fnol:whattoexpect',
        platform: 'mobile',
        sessionid: 'some-session-id',
        ins_claim_id: '123456789',
        category: ['my account:insurance:easy auto fnol'],
        channel: 'my account',
        state: 'ri',
        subchannel1: 'insurance',
        subchannel2: 'easy auto fnol'
      };

      expect(getFlowValueSpy).toBeCalledWith('ALL_OTHER_DAMAGE', 'beingDriven', 'animalcomp');
      expect(service.tag).toEqual(expected);
    });

    it('should include flow and product from transition page onward', () => {
      const service = new TaggingService();
      service.BuildTag(appStateMock as any, Pages.IncidentInfoIntro);

      expect(service.tag).toMatchObject({
        flow: 'accident',
        product: ['accident']
      });
    });
  });

  describe('setPageTag', () => {
    it.each([
      [Pages.IntroTransition, 'introtransition'],
      [Pages.WhenAccident, 'incidentdetails'],
      [Pages.WhereAccident, 'whereaccident'],
      [Pages.SessionTimedOut, 'error-timeout'],
      [Pages.SystemError, 'error-system'],
      [Pages.PolicyError, 'error-policy']
    ])('should use mapped tag for %s', (location, expectedPageTag) => {
      const service = new TaggingService();
      const result: { page?: string } = {};

      service.setPageTag(result as any, location as any, undefined);

      expect(result.page).toBe(`my account:insurance:easy auto fnol:${expectedPageTag}`);
    });

    it('should use loadefnol for behind login entry locations', () => {
      const service = new TaggingService();
      const result: { page?: string } = {};

      service.setPageTag(result as any, `${Pages.BehindLoginEntry}/step` as any, undefined);

      expect(result.page).toBe('my account:insurance:easy auto fnol:loadefnol');
    });

    it('should sanitize location for unmapped pages', () => {
      const service = new TaggingService();
      const result: { page?: string } = {};

      service.setPageTag(result as any, Pages.Intro as any, undefined);

      expect(result.page).toBe('my account:insurance:easy auto fnol:whattoexpect');
    });

    it('should use the custom page tag if provided', () => {
      const service = new TaggingService();
      const result: { page?: string } = {};

      service.setPageTag(result as any, Pages.Intro as any, undefined, 'custom-page-tag');

      expect(result.page).toBe('my account:insurance:easy auto fnol:custom-page-tag');
    });
  });

  describe('FireTag', () => {
    beforeEach(() => {
      clearTagTrackLog();
    });

    it('should set a universal data object to a passed in tag', () => {
      const service = new TaggingService();
      service.BuildTag(appStateMock as any, Pages.IncidentInfoIntro);
      service.FireTag();
      expect(window['aceMediaTagValues']).toEqual(service.Tag);
    });

    it('should call utag.view with our passed in tag', () => {
      global.utag = { view: vi.fn(), tag: undefined, link: vi.fn() };
      const testTag = {
        ...tagParams
      };

      const service = new TaggingService();
      service.BuildTag(appStateMock as any, Pages.IncidentInfoIntro);
      service.FireTag();
      expect(global.utag.view).toBeCalledWith(service.Tag);
    });

    it('should call utag.link with our passed in tag', () => {
      global.utag = { view: vi.fn(), tag: undefined, link: vi.fn() };
      const service = new TaggingService();
      const testTag = {
        ...tagParams,
        cta: 'testcta'
      };
      service.BuildTag(appStateMock as any, Pages.IncidentInfoIntro, 'some cta');
      service.FireTag();
      expect(global.utag.link).toBeCalledWith(service.Tag);
    });

    it('fires utag.view on each FireTag call with the same payload', () => {
      global.utag = { view: vi.fn(), tag: undefined, link: vi.fn() };
      const service = new TaggingService();
      service.BuildTag(appStateMock as any, Pages.IncidentInfoIntro);
      service.FireTag();
      service.FireTag();
      expect(global.utag.view).toHaveBeenCalledTimes(2);
      const log = readTagTrackLog();
      expect(log.map(e => e.kind)).toEqual(['utag_view', 'utag_view']);
    });

    it('appends tag track log on utag.view with sensitive keys stripped', () => {
      global.utag = { view: vi.fn(), tag: undefined, link: vi.fn() };
      const service = new TaggingService();
      service.BuildTag(appStateMock as any, Pages.IncidentInfoIntro);
      service.FireTag();
      const log = readTagTrackLog();
      expect(log).toHaveLength(1);
      expect(log[0].kind).toBe('utag_view');
      expect(log[0].pathname).toBe(Pages.IncidentInfoIntro);
      expect(log[0].tag).toBeDefined();
      expect(log[0].tag).not.toHaveProperty('ins_claim_id');
      expect(log[0].tag).not.toHaveProperty('sessionid');
    });

    it('appends utag_link to tag track log for CTA fires', () => {
      global.utag = { view: vi.fn(), tag: undefined, link: vi.fn() };
      const service = new TaggingService();
      service.BuildTag(appStateMock as any, Pages.IncidentInfoIntro, 'some cta');
      service.FireTag();
      const log = readTagTrackLog();
      expect(log).toHaveLength(1);
      expect(log[0].kind).toBe('utag_link');
    });

    it('should dispatch a custom event for A/B testing', () => {
      global.utag = { view: vi.fn(), tag: undefined, link: vi.fn() };
      document.dispatchEvent = vi.fn();
      const service = new TaggingService();
      const testTag = {
        ...tagParams
      };

      const event = new CustomEvent('tnt_spa', {
        detail: window['aceMediaTagValues']
      });

      const mockDispatchEvent = vi.spyOn(document, 'dispatchEvent').mockImplementation(() => true);

      service.BuildTag(appStateMock as any, Pages.IncidentInfoIntro);
      service.FireTag();
      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    it('retries utag.view after Tealium becomes available on a later tick', async () => {
      vi.useFakeTimers();
      const g = globalThis as unknown as {
        utag?: { view: ReturnType<typeof vi.fn>; link: ReturnType<typeof vi.fn> };
      };
      const prevUtag = g.utag;
      try {
        delete g.utag;
        const service = new TaggingService();
        service.BuildTag(appStateMock as any, Pages.IncidentInfoIntro);
        service.FireTag();
        g.utag = { view: vi.fn(), link: vi.fn() };
        await vi.advanceTimersByTimeAsync(1000);
        expect(g.utag.view).toHaveBeenCalledTimes(1);
        const log = readTagTrackLog();
        expect(log[0].kind).toBe('utag_view');
        expect(log[0].pathname).toBe(Pages.IncidentInfoIntro);
      } finally {
        vi.useRealTimers();
        if (prevUtag !== undefined) {
          g.utag = prevUtag;
        } else {
          delete g.utag;
        }
      }
    });

    describe('Page tag scenarios', () => {
      it('should call fire tag with proper values for intro page', async () => {
        const service = new TaggingService();
        const result = service.BuildTag(appStateBeforeWhenIncidentSubmitted as any, Pages.Intro);

        expect(result).toEqual({
          channel: 'my account',
          page: 'my account:insurance:easy auto fnol:whattoexpect',
          platform: 'mobile',
          sessionid: 'some-session-id',
          state: 'ri',
          subchannel1: 'insurance',
          subchannel2: 'easy auto fnol',
          category: ['my account:insurance:easy auto fnol'],
          ins_claim_id: '123456789'
        });
      });

      it('should call fire tag with proper values for confirmation page', async () => {
        getCurrentPageSpy.mockImplementation(() => {
          return 'confirmation';
        });
        const service = new TaggingService();
        const confirmationPageTag = {
          page: Pages.Confirmation,
          policyNumber: 'RIA000046910',
          isTextCommunicationOptIn: 'true',
          flow: 'accident',
          claimNumber: '123456789',
          claimType: ClaimType.ALL_OTHER_DAMAGE,
          platform: 'mobile',
          need_confirmation_id: true,
          product: ['driven:impact with an animal']
        };
        const result = service.BuildTag(appStateMock as any, Pages.Confirmation);

        expect(result).toEqual({
          category: ['my account:insurance:easy auto fnol'],
          channel: 'my account',
          confirmation_id: 'fnola123456789',
          flow: 'accident',
          ins_claim_id: '123456789',
          page: 'my account:insurance:easy auto fnol:confirmation',
          platform: 'mobile',
          product: ['accident'],
          quantity: ['1'],
          state: 'ri',
          subchannel1: 'insurance',
          subchannel2: 'easy auto fnol',
          sessionid: 'some-session-id'
        });
      });

      it('should call fire tag with proper values when user clicks continue button and on safelite redirect page and goes into the safelite page', async () => {
        getFlowValueSpy.mockReturnValue('glass');
        getCurrentPageSpy.mockImplementation(() => {
          return 'safeliteredirect';
        });
        const service = new TaggingService();
        const glassAppState = {
          ...appStateMock,
          claimType: ClaimType.GLASS_ONLY_DAMAGE,
          lossDateISO: undefined,
          carStatus: undefined,
          statusVehicleWhileDriven: undefined,
          statusVehicleWhileParked: undefined
        };
        const result = service.BuildTag(
          glassAppState as any,
          Pages.GlassDamage,
          'safeliteredirect-continue'
        );

        expect(result).toEqual({
          category: ['my account:insurance:easy auto fnol'],
          channel: 'my account',
          flow: 'glass',
          page: 'my account:insurance:easy auto fnol:safeliteredirect',
          platform: 'mobile',
          product: ['glass'],
          state: 'ri',
          subchannel1: 'insurance',
          subchannel2: 'easy auto fnol',
          sessionid: 'some-session-id',
          ins_claim_id: '123456789',
          cta: 'my account:insurance:easy auto fnol:safeliteredirect-continue'
        });
      });

      it('should call fire tag with proper values for  error-system page', async () => {
        getCurrentPageSpy.mockImplementation(() => {
          return 'error';
        });
        const newAppStateMock = Object.assign(
          {},
          { ...appStateMock, errorReason: 'session timeout' }
        );
        const service = new TaggingService();

        const result = service.BuildTag(newAppStateMock as any, Pages.SystemError);

        expect(result).toEqual({
          channel: 'my account',
          error: 'session timeout',
          flow: 'accident',
          page: 'my account:insurance:easy auto fnol:error-system',
          sessionid: 'some-session-id',
          state: 'ri',
          subchannel1: 'insurance',
          subchannel2: 'easy auto fnol',
          platform: 'mobile',
          product: ['accident'],
          ins_claim_id: '123456789',
          category: ['my account:insurance:easy auto fnol']
        });
      });

      it('should call fire tag with proper values for error-policy page', async () => {
        getCurrentPageSpy.mockImplementation(() => {
          return 'error';
        });
        const newAppStateMock = Object.assign(
          {},
          { ...appStateMock, errorReason: 'cancelled policy' }
        );
        const service = new TaggingService();
        const result = service.BuildTag(newAppStateMock as any, Pages.PolicyError);
        expect(result).toEqual({
          channel: 'my account',
          error: 'cancelled policy',
          flow: 'accident',
          page: 'my account:insurance:easy auto fnol:error-policy',
          sessionid: 'some-session-id',
          state: 'ri',
          subchannel1: 'insurance',
          subchannel2: 'easy auto fnol',
          platform: 'mobile',
          product: ['accident'],
          ins_claim_id: '123456789',
          category: ['my account:insurance:easy auto fnol']
        });
      });

      it('should call fire tag with proper values for knockout page', async () => {
        getCurrentPageSpy.mockImplementation(() => {
          return 'knockout';
        });
        const newAppStateMock = Object.assign(
          {},
          { ...appStateMock, knockoutReason: KnockoutReason.DriverNotListed }
        );
        const service = new TaggingService();

        const result = service.BuildTag(newAppStateMock as any, Pages.Knockout as any);

        expect(result).toEqual({
          channel: 'my account',
          error: 'driver not listed',
          flow: 'accident',
          page: 'my account:insurance:easy auto fnol:knockout',
          sessionid: 'some-session-id',
          state: 'ri',
          subchannel1: 'insurance',
          subchannel2: 'easy auto fnol',
          platform: 'mobile',
          product: ['accident'],
          ins_claim_id: '123456789',
          category: ['my account:insurance:easy auto fnol']
        });
      });
    });
  });

  describe('WInsurance brand tagging', () => {
    const winsAppState = Object.freeze({
      ...appStateMock,
      brand: 'WInsurance' as const
    });

    it('should return null for IntroTransition page', () => {
      const service = new TaggingService('WInsurance');
      const result = service.BuildTag(winsAppState as any, Pages.IntroTransition as any);
      expect(result).toBeNull();
    });

    it('should omit category on non-Confirmation pages', () => {
      const service = new TaggingService('WInsurance');
      const result = service.BuildTag(winsAppState as any, Pages.Intro);
      expect(result).not.toHaveProperty('category');
    });

    it('should keep category on Confirmation page', () => {
      const service = new TaggingService('WInsurance');
      const result = service.BuildTag(winsAppState as any, Pages.Confirmation);
      expect(result).toHaveProperty('category');
      expect(result!.category).toEqual(['my account:insurance:easy auto fnol']);
    });

    it('should omit platform', () => {
      const service = new TaggingService('WInsurance');
      const result = service.BuildTag(winsAppState as any, Pages.Intro);
      expect(result).not.toHaveProperty('platform');
    });

    it('should omit ins_policy', () => {
      const winsAppStateWithPolicy = { ...winsAppState, policyNumber: 'A12345678' };
      const service = new TaggingService('WInsurance');
      const result = service.BuildTag(winsAppStateWithPolicy as any, Pages.Intro);
      expect(result).not.toHaveProperty('ins_policy');
    });

    it('should use URL path slug for page tag', () => {
      const service = new TaggingService('WInsurance');
      const result = service.BuildTag(winsAppState as any, Pages.WhenAccident) as any;
      expect(result.page).toBe('my account:insurance:easy auto fnol:whenaccident');
    });

    it('should strip hyphens from URL path in page tag', () => {
      const service = new TaggingService('WInsurance');
      const result = service.BuildTag(winsAppState as any, Pages.WhereAccident) as any;
      expect(result.page).toBe('my account:insurance:easy auto fnol:whereaccident');
    });

    it('should use first path segment for behindlogin with policyGuid', () => {
      const service = new TaggingService('WInsurance');
      const result = service.BuildTag(
        winsAppState as any,
        `${Pages.BehindLoginEntry}/some-guid` as any
      );
      expect((result as any).page).toBe('my account:insurance:auto fnol:behindlogin');
    });

    it('should store tag in WInsurance data layer key', () => {
      const service = new TaggingService('WInsurance');
      service.BuildTag(winsAppState as any, Pages.Intro);
      expect(window[TEALIUM_CONFIG.WInsurance.dataLayerKey]).toBeDefined();
      expect(window[TEALIUM_CONFIG.WInsurance.dataLayerKey]).toEqual(service.tag);
      delete window[TEALIUM_CONFIG.WInsurance.dataLayerKey];
    });

    it('should build complete WInsurance tag for Confirmation page', () => {
      const service = new TaggingService('WInsurance');
      const result = service.BuildTag(winsAppState as any, Pages.Confirmation);
      expect(result).toEqual({
        category: ['my account:insurance:easy auto fnol'],
        channel: 'my account',
        confirmation_id: 'fnola123456789',
        flow: 'accident',
        ins_claim_id: '123456789',
        page: 'my account:insurance:easy auto fnol:confirmation',
        product: ['accident'],
        quantity: ['1'],
        state: 'ri',
        subchannel1: 'insurance',
        subchannel2: 'easy auto fnol',
        sessionid: 'some-session-id'
      });
      delete window[TEALIUM_CONFIG.WInsurance.dataLayerKey];
    });

    it('should build complete WInsurance tag for a flow page', () => {
      const service = new TaggingService('WInsurance');
      const result = service.BuildTag(winsAppState as any, Pages.IncidentInfoIntro);
      expect(result).toEqual({
        channel: 'my account',
        flow: 'accident',
        ins_claim_id: '123456789',
        page: 'my account:insurance:easy auto fnol:transitionpage',
        product: ['accident'],
        state: 'ri',
        subchannel1: 'insurance',
        subchannel2: 'easy auto fnol',
        sessionid: 'some-session-id'
      });
      delete window[TEALIUM_CONFIG.WInsurance.dataLayerKey];
    });
  });

  describe('TEALIUM_CONFIG', () => {
    it('should have AAA config with correct script URL', () => {
      expect(TEALIUM_CONFIG.AAA.scriptSrc).toBe('//tms.ace.aaa.com/ace/prod/utag.js');
      expect(TEALIUM_CONFIG.AAA.dataLayerKey).toBe('aceMediaTagValues');
    });

    it('should have WInsurance config with correct script URL', () => {
      expect(TEALIUM_CONFIG.WInsurance.scriptSrc).toBe(
        '//tms.w-insurance.com/wins/prod/utag.js'
      );
      expect(TEALIUM_CONFIG.WInsurance.dataLayerKey).toBe('wins_data_layer');
    });
  });
});
