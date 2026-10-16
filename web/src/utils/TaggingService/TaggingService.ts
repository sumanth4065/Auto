import { Subset } from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { LoginFlowType } from '@lib/shared-contracts';
import { CarKineticStatus, ClaimType, KnockoutReason } from '@lib/types';
import { resolvePolicyStateCode } from '../policyNumberHelper';
import { mobileOrDesktop } from './checkIsMobileDevice';
import { getFlowValue } from './taggingUtils';
import { appendTagTrackEntry, sanitizeTagForTrackLog } from './tagTrackLog';
import { Pages } from '../../shared/pages';
import { State } from '../../store/reducer';
import { AppPathname } from '../../types';
import type { Brand } from '../../types';

declare var utag: any;

enum UTagAction {
  View,
  Link
}

export const TEALIUM_CONFIG: Record<Brand, { scriptSrc: string; dataLayerKey: string }> = {
  AAA: {
    scriptSrc: '//tms.ace.aaa.com/ace/prod/utag.js',
    dataLayerKey: 'aceMediaTagValues'
  },
  WInsurance: {
    scriptSrc: '//tms.w-insurance.com/wins/prod/utag.js',
    dataLayerKey: 'wins_data_layer'
  }
};

export enum KnockoutReasonTag {
  unsupportedMarket = 'market not supported',
  unlistedDriver = 'driver not listed',
  unlistedReporter = 'reporter not listed',
  unlistedVehicle = 'vehicle not listed'
}

export const BASE_TAGGING_PAGE_STRING = 'my account:insurance';
const channel = 'my account';
const subchannel1 = 'insurance';
const subchannel2 = 'easy auto fnol';
const behindLoginSubchannel2 = 'auto fnol';
const PAGE_TAG_MAP: Record<string, string> = Object.freeze({
  [Pages.IntroTransition]: 'introtransition',
  [Pages.WhenAccident]: 'incidentdetails',
  [Pages.WhereAccident]: 'whereaccident',
  [Pages.AdditionalDetailsTransition]: 'additionaldetailstransition',
  [Pages.SessionTimedOut]: 'error-timeout',
  [Pages.SystemError]: 'error-system',
  [Pages.PolicyError]: 'error-policy'
});

export const commonTags = (loginFlowType: LoginFlowType, policyNumber?: string) => {
  const subchannel2Value =
    loginFlowType === LoginFlowType.BEHIND_LOGIN ? behindLoginSubchannel2 : subchannel2;
  const state = resolvePolicyStateCode(policyNumber);
  return Object.freeze({
    category: [`${channel}:${subchannel1}:${subchannel2Value}`],
    channel,
    subchannel1,
    subchannel2: subchannel2Value,
    ...(state !== undefined ? { state } : {})
  });
};

const booleanToTagValue = (value: boolean | undefined): string | undefined =>
  value === true ? 'true' : value === false ? 'false' : undefined;

function isPathBeforeIncidentInfoIntro(pathname: string): boolean {
  return (
    pathname === Pages.IntroTransition ||
    pathname === Pages.Intro ||
    pathname === Pages.FilingClaim
  );
}

/**
 * Omit `flow` on the shared early-funnel pathnames (`/`, `/whattoexpect`, `/claimtype`) until the user
 * passes that stage (e.g. **IncidentInfoIntro** `/transitionpage`). This is **not** keyed on
 * `loginFlowType`: behind-login uses the same routes, so those three paths omit `flow` there too.
 * Only **BehindLoginEntry** (`/behindlogin`) sits outside that trio and may carry `flow` when
 * `getFlowValue` can compute it. If `claimType` / kinetic data are still incomplete, `getFlowValue`
 * is undefined and `flow` stays omitted in `BuildTag` even when this returns true. Glass-only
 * always includes `flow` on any path once claim type is glass.
 */
export const shouldIncludeFlowTag = (appState: State, pathname: string): boolean => {
  if (appState.claimType === ClaimType.GLASS_ONLY_DAMAGE) {
    return true;
  }
  return !isPathBeforeIncidentInfoIntro(pathname);
};

export class TaggingService {
  public tag: any;
  private lastPathname: AppPathname = '/' as AppPathname;
  private brand: Brand;

  constructor(brand: Brand = 'AAA') {
    this.brand = brand;
    if (!document.getElementById('initialUtagLoad')) {
      this.initialPage();
    }
  }

  public BuildTag(appState: State, location: AppPathname, cta?: string, customPageTag?: string) {
    this.lastPathname = location;

    // WInsurance: root path fires before state is available — skip entirely
    if (this.brand === 'WInsurance' && (location as string) === Pages.IntroTransition) {
      return null;
    }

    let effectiveLoginFlowType = appState.loginFlowType;
    if (!effectiveLoginFlowType) {
      if (location.startsWith('/behindlogin')) {
        effectiveLoginFlowType = LoginFlowType.BEHIND_LOGIN;
      } else {
        effectiveLoginFlowType = LoginFlowType.ANONYMOUS;
      }
    }
    let result = Object.assign({}, commonTags(effectiveLoginFlowType, appState.policyNumber));

    const rawFlow = getFlowValue(
      appState.claimType as ClaimType | undefined,
      appState.carStatus,
      appState.carStatus === CarKineticStatus.BeingDriven
        ? appState.statusVehicleWhileDriven?.code
        : appState.statusVehicleWhileParked?.code
    );
    const flow = shouldIncludeFlowTag(appState, location) ? rawFlow : undefined;

    // notes: the following 'set' calls will cause the object 'result' mutates with new values

    this.setPageTag(result, location, effectiveLoginFlowType, customPageTag, this.brand);
    this.setConfirmationTags(result, location, appState.claimNumber);
    this.setKnockoutTags(result, location, appState.knockoutReason);
    this.setSystemErrorTags(result, location, appState.errorReason);
    this.setPolicyErrorTags(result, location, appState.errorReason);
    this.setSessionTimeoutTags(result, location, appState.errorReason);

    const policyNumber = appState.policyNumber;

    let policyPrefix: string | undefined;

    if (
      typeof policyNumber === 'string' &&
      policyNumber.length === 9 &&
      /^[AP]/.test(policyNumber)
    ) {
      policyPrefix = policyNumber.charAt(0);
    } else if (typeof policyNumber === 'string' && policyNumber.length === 12) {
      policyPrefix = policyNumber.substring(0, 3);
    } else {
      policyPrefix = undefined;
    }

    const isWInsurance = this.brand === 'WInsurance';

    let tags = Subset.removeUndefinedProperties({
      cta: cta
        ? `${channel}:${subchannel1}:${
            appState.loginFlowType === LoginFlowType.BEHIND_LOGIN
              ? behindLoginSubchannel2
              : subchannel2
          }:${cta}`
        : undefined,
      flow,
      ins_claim_id: appState.claimNumber,
      ...(!isWInsurance ? { platform: mobileOrDesktop() } : {}),
      product: flow ? [flow] : undefined,
      sessionid: LogCannon.getSessionId(),
      text_opt_in: booleanToTagValue(appState.enableTextCommunication),
      email_opt_in: booleanToTagValue(appState.enableEmailCommunication),
      ...(!isWInsurance ? { ins_policy: policyPrefix ? [policyPrefix] : undefined } : {}),
      ...result
    });

    if (isWInsurance) {
      if (location !== Pages.Confirmation) {
        delete (tags as any).category;
      }
    }

    this.tag = tags;
    window[TEALIUM_CONFIG[this.brand].dataLayerKey] = this.tag;
    return tags;
  }

  public FireTag(): void {
    const filteredTag = this.tag
      ? Object.fromEntries(
          Object.entries(this.tag).filter(([_, value]) => typeof value !== 'undefined')
        )
      : undefined;

    const pathnameAtFire = String(this.lastPathname);
    const { dataLayerKey } = TEALIUM_CONFIG[this.brand];

    if (this.tag.cta) {
      void this.CallUtagWithRetry(filteredTag, UTagAction.Link, pathnameAtFire);
    } else {
      // required for analytics team to allow A/B tests
      document.dispatchEvent(
        new CustomEvent('tnt_spa', {
          detail: window[dataLayerKey]
        })
      );
      void this.CallUtagWithRetry(filteredTag, UTagAction.View, pathnameAtFire);
    }
  }

  private async CallUtagWithRetry(
    inputTag: any,
    method: UTagAction,
    pathnameForTrackLog: string,
    retryCount = 0
  ): Promise<void> {
    const maxRetryCount = 5;

    if (retryCount > maxRetryCount) {
      return;
    }

    if (typeof utag === 'undefined') {
      setTimeout(() => {
        void this.CallUtagWithRetry(inputTag, method, pathnameForTrackLog, retryCount + 1);
      }, 1000);
    } else {
      const kind = method === UTagAction.View ? 'utag_view' : 'utag_link';
      appendTagTrackEntry({
        t: Date.now(),
        pathname: pathnameForTrackLog,
        kind,
        tag: sanitizeTagForTrackLog(inputTag as Record<string, unknown>)
      });
      switch (method) {
        case UTagAction.View:
          utag.view(inputTag);
          break;
        case UTagAction.Link:
          utag.link(inputTag);
          break;
        default:
          return;
      }
    }
  }

  private async initialPage() {
    const { scriptSrc } = TEALIUM_CONFIG[this.brand];
    let a = scriptSrc as any;
    let b = document;
    let c = 'script';
    let d = b.createElement(c) as any;
    d.src = a;
    d.type = 'text/java' + c;
    d.async = true;
    d.id = 'initialUtagLoad';

    a = b.getElementsByTagName(c)[0];

    if (a) {
      a.parentNode.insertBefore(d, a);
    } else {
      document.body.appendChild(d);
    }
  }

  get Tag() {
    return this.tag;
  }

  setPageTag = (
    result,
    location,
    loginFlowType: LoginFlowType | undefined,
    customPageTag?: string,
    brand: Brand = 'AAA'
  ) => {
    let pageTag: string;

    if (customPageTag) {
      pageTag = customPageTag;
    } else if (brand === 'WInsurance') {
      pageTag = location.replace(/^\//, '').split('/')[0].replace(/-/g, '');
    } else {
      pageTag = PAGE_TAG_MAP[location];
      if (!pageTag) {
        if (location.includes(Pages.BehindLoginEntry)) {
          pageTag = 'loadefnol';
        } else {
          pageTag = location.replace(/[ /,]/g, '').toLowerCase();
        }
      }
    }

    result.page = `${channel}:${subchannel1}:${
      loginFlowType === LoginFlowType.BEHIND_LOGIN ? behindLoginSubchannel2 : subchannel2
    }:${pageTag}`;
  };

  setKnockoutTags = (result, location, error) => {
    if (!location || location != (Pages.Knockout as any)) return;

    switch (error) {
      case KnockoutReason.DriverNotListed:
        error = KnockoutReasonTag.unlistedDriver;
        break;
      case KnockoutReason.MarketNotSupported:
        error = KnockoutReasonTag.unsupportedMarket;
        break;
      case KnockoutReason.ReporterNotListed:
        error = KnockoutReasonTag.unlistedReporter;
        break;
      case KnockoutReason.VehicleNotListed:
        error = KnockoutReasonTag.unlistedVehicle;
        break;
    }
    result.error = error ?? 'knockout';
  };

  setSystemErrorTags = (result, location, error) => {
    if (!location || location != (Pages.SystemError as any)) return;
    result.error = error ?? 'system error';
  };

  setPolicyErrorTags = (result, location, error) => {
    if (!location || location != (Pages.PolicyError as any)) return;
    result.error = error ?? 'policy error';
  };

  setSessionTimeoutTags = (result, location, error) => {
    if (!location || location != (Pages.SessionTimedOut as any)) return;
    result.error = error ?? 'session timeout';
  };

  setConfirmationTags = (result, location, claimNumber) => {
    if (!location || location != (Pages.Confirmation as any)) return;
    result.confirmation_id = `fnola${claimNumber}`;
    result.quantity = ['1'];
  };
}
