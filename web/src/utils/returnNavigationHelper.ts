import { LoginFlowType } from '@lib/shared-contracts';
import { AppSource } from '@lib/types';
import { State } from '../store/reducer';
import { getHomeUrl } from './ComponentHelper';
import {
  callAutoPolicyFlowDirector,
  navigateToClaimsView,
  navigateToClaimsViewRedesign,
  navigateToMyAccount
} from './backToHomeRedirectHelper';

export interface ReturnNavigationState extends Partial<Pick<State, 'loginFlowType' | 'sourceApp' | 'policyNumber' | 'clubCode' | 'brand'>> { }

export interface ReturnNavigationResult {
  onClick: () => void;
  label: string;
}

export type ReturnNavigationScenario =
  | 'anonymousHomepage'
  | 'autoPolicy'
  | 'policyFallback'
  | 'myAccount'
  | 'autoClaim'
  | 'claimsFallback';

export interface GetReturnNavigationOptions {
  labelOverrides?: Partial<Record<ReturnNavigationScenario, string>>;
}

const applyLabelOverride = (
  scenario: ReturnNavigationScenario,
  defaultLabel: string,
  options?: GetReturnNavigationOptions
): string => options?.labelOverrides?.[scenario] ?? defaultLabel;

export const getReturnNavigation = (
  appState?: ReturnNavigationState | null,
  options?: GetReturnNavigationOptions
): ReturnNavigationResult => {
  if (!appState || Object.keys(appState).length === 0) {
    return {
      onClick: () => {
        window.location.replace(getHomeUrl());
      },
      label: applyLabelOverride('anonymousHomepage', 'Return to Homepage', options)
    };
  }

  const { loginFlowType, sourceApp, policyNumber, clubCode, brand } = appState;

  if (loginFlowType !== LoginFlowType.BEHIND_LOGIN) {
    return {
      onClick: () => {
        const url = getHomeUrl(clubCode, brand);
        window.location.assign(url);
      },
      label: applyLabelOverride('anonymousHomepage', 'Return to Homepage', options)
    };
  }

  if (sourceApp === AppSource.PolicyView) {
    if (policyNumber && clubCode) {
      return {
        onClick: () => {
          callAutoPolicyFlowDirector(policyNumber, clubCode);
        },
        label: applyLabelOverride('autoPolicy', 'Return to Auto Policy', options)
      };
    }
    return {
      onClick: () => {
        window.location.replace(getHomeUrl(clubCode, brand));
      },
      label: applyLabelOverride('policyFallback', 'Return to Homepage', options)
    };
  }

  if (sourceApp === AppSource.MyAccount) {
    return {
      onClick: () => {
        const url = navigateToMyAccount();
        window.location.assign(url);
      },
      label: applyLabelOverride('myAccount', 'Return to My Account', options)
    };
  }

  const claimsViewRedesignGuid = sessionStorage.getItem('ClaimsViewRedesignGUID');
  if (sourceApp === AppSource.ClaimsViewRedesign && claimsViewRedesignGuid) {
    return {
      onClick: () => {
        const url = navigateToClaimsViewRedesign(claimsViewRedesignGuid);
        window.location.assign(url);
      },
      label: applyLabelOverride('autoClaim', 'Return to Auto Claim', options)
    };
  }

  const claimsViewGuid = sessionStorage.getItem('ClaimsViewGUID');
  if (sourceApp === AppSource.ClaimsView && claimsViewGuid) {
    return {
      onClick: () => {
        const url = navigateToClaimsView(claimsViewGuid);
        window.location.assign(url);
      },
      label: applyLabelOverride('autoClaim', 'Return to Auto Claim', options)
    };
  }

  return {
    onClick: () => {
      window.location.replace(getHomeUrl(clubCode, brand));
    },
    label: applyLabelOverride('claimsFallback', 'Return to Homepage', options)
  };
};
