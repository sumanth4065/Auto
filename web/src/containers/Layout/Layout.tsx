import { Features } from '@ace-clublabs/feature-flags';
import { MaskData } from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { Container, ThemeProvider } from '@ace-clublabs/shared-component-library';
import { LoginFlowType } from '@lib/shared-contracts';
import { AppSource } from '@lib/types';
import { ClubCodeValues } from '@lib/utility';
import { useEffect, useMemo, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { AppErrorBoundary, Header, SlideOut } from '../../components';
import {
  useAuthenticatedTokenAndPolicyNumber,
  useGetUrlParams,
  useTimeout
} from '../../hooks';
import { Pages } from '../../shared/pages';
import {
  setArea,
  setBrand,
  setClubCode,
  setCrashDatePrediction,
  setIsMobileApp,
  setIsMobileAppAccidentDetection,
  setPolicyGuid,
  setSplashEnd,
  setSplashStart
} from '../../store/actions';
import { useAppState } from '../../store/AppStateContext';
import { AppPathname } from '../../types';
import { getLogData, navigateToHome, setUnhandledErrorContextProvider } from '../../utils';
import {
  clearClaimSession,
  isEntryOrErrorPage,
  isStaleClaimSession,
  markClaimInProgress
} from '../../utils/claimSessionGuard';
import { CindySection } from '../CindySection';
import { RedirectToTimeoutPage } from '../ErrorPages';

function shouldNotDisplayBackButton(pathname: string, isMobileNativeApp = false): boolean {
  if (isMobileNativeApp) {
    switch (pathname) {
      case Pages.IntroTransition:
      case Pages.BehindLoginEntry:
      case Pages.Intro:
        return true;
      default:
        if (pathname.includes(Pages.BehindLoginEntry)) {
          return true;
        }
        return false;
    }
  }

  switch (pathname) {
    case Pages.CreateClaimTransition:
    case Pages.SubmitClaimTransition:
    case Pages.RedirectToSafelite:
    case Pages.Confirmation:
      return true;
    default:
      return false;
  }
}

const getCurrentNavigation = (pathname: string, appState) => {
  switch (pathname) {
    case Pages.WhenAccident:
    case Pages.WhereAccident:
    case Pages.ContactInformation:
    case Pages.WhoIsReporting:
    case Pages.CustomReporter:
      return <SlideOut step={1} appState={appState}></SlideOut>;

    case Pages.VehicleInvolved:
    case Pages.CustomVehicle:
    case Pages.DrivenOrParked:
    case Pages.DrivenIncidentDetails:
    case Pages.ParkedIncidentDetails:
    case Pages.DamageByWeather:
    case Pages.WhoWasDriving:
    case Pages.CustomDriver:
    case Pages.Passengers:
    case Pages.AnyoneInjured:
    case Pages.WhatHappened:
    case Pages.VehicleTowed:
    case Pages.VehicleDamage:
    case Pages.NumberOfVehiclesInvolved:
      return <SlideOut step={2} appState={appState}></SlideOut>;
    case Pages.OtherPartyYMM:
    case Pages.OtherPartyDriverInformation:
    case Pages.OtherPartyPassengers:
    case Pages.OtherPartyInsurance:
    case Pages.OtherPartyAnyoneInjured:
      return <SlideOut step={3} appState={appState}></SlideOut>;
    case Pages.OtherPartyPedestrian:
    case Pages.OtherPartyWitnesses:
    case Pages.OtherPartyPropertyDamage:
      return <SlideOut step={4} appState={appState}></SlideOut>;
    case Pages.ReviewClaim:
      return <SlideOut step={5} appState={appState}></SlideOut>;
    default:
      return <></>;
  }
};

const getCurrentProgress = (path: string) => {
  switch (path) {
    /**
     * Steps 1/5
     */
    case Pages.WhenAccident:
    case Pages.WhereAccident:
      return 10;
    case Pages.WhoIsReporting:
    case Pages.CustomReporter:
      return 75;
    case Pages.ContactInformation:
      return 100;
    /**
     * Steps 2/5
     */
    case Pages.VehicleInvolved:
    case Pages.CustomVehicle:
      return 10;
    case Pages.DrivenOrParked:
      return 20;
    case Pages.ParkedIncidentDetails:
    case Pages.DrivenIncidentDetails:
      return 30;
    case Pages.DamageByWeather:
    case Pages.WhoWasDriving:
      return 40;
    case Pages.CustomDriver:
      return 45;
    case Pages.Passengers:
      return 50;
    case Pages.AnyoneInjured:
      return 60;
    case Pages.WhatHappened:
      return 70;
    case Pages.VehicleTowed:
      return 80;
    case Pages.VehicleDamage:
      return 90;
    case Pages.NumberOfVehiclesInvolved:
      return 100;
    /**
     * Steps 3/5
     */
    case Pages.OtherPartyYMM:
      return 20;
    case Pages.OtherPartyInsurance:
      return 40;
    case Pages.OtherPartyDriverInformation:
      return 60;
    case Pages.OtherPartyPassengers:
      return 80;
    case Pages.OtherPartyAnyoneInjured:
      return 100;

    /**
     * Step 4/5
     */
    case Pages.OtherPartyPedestrian:
      return 33.3;
    case Pages.OtherPartyWitnesses:
      return 66.6;
    case Pages.OtherPartyPropertyDamage:
      return 100;

    /**
     * Step 5/5
     */
    case Pages.ReviewClaim:
      return 100;
    default:
      return undefined;
  }
};

export const Layout = () => {
  const { appState, dispatch } = useAppState();
  const location = useLocation();
  const urlParams = useGetUrlParams();
  const hasCheckedSession = useRef(false);

  const isBehindLoginFlow = useMemo(() => {
    // Check if we're in behind login flow based on state (persists across navigation)
    if (appState.loginFlowType === LoginFlowType.BEHIND_LOGIN || appState.policyGuid) {
      return true;
    }
    // Check pathname as fallback for initial determination
    return location.pathname.toLowerCase().includes(Pages.BehindLoginEntry.toLowerCase());
  }, [appState.loginFlowType, appState.policyGuid, location.pathname]);

  const { loading, clubCode, clubCodeError, isTokenInfoError } =
    useAuthenticatedTokenAndPolicyNumber({
      appState,
      dispatch,
      isAnonymous: !isBehindLoginFlow
    });
  const { isIDLE } = useTimeout(dispatch);
  const navigate = useNavigate();
  const logData = useMemo(
    () => MaskData.maskJSONFields(getLogData(appState, location.pathname)),
    [
      appState.clubCode,
      appState.policyNumber,
      appState.loginFlowType,
      appState.policyGuid,
      appState.sourceApp,
      location.pathname
    ]
  );

  const isErrorPage = [Pages.SessionTimedOut, Pages.SystemError].includes(
    location.pathname as Pages
  );

  const canRender =
    (appState.token && !loading && (appState.policyNumber || isBehindLoginFlow)) || isErrorPage;

  const hasRequiredLogData = Boolean(
    !loading && logData['policyNumber'] && logData['loginFlowType']
  );

  useEffect(() => {
    if (hasRequiredLogData) {
      LogCannon.blast(`Navigate to ${location.pathname}`, { ...logData });
    }
  }, [location.pathname, logData, hasRequiredLogData]);

  useEffect(() => {
    LogCannon.blast('AppState snapshot', {
      hasAuth: Boolean(appState.token),
      hasClaimant: Boolean(appState.policyNumber),
      hasMarket: Boolean(appState.clubCode),
      loading,
      path: '/' + (location.pathname.split('/')[1] ?? '')
    });
  }, [appState.token, appState.policyNumber, appState.clubCode, loading, location.pathname]);

  useEffect(() => {
    setUnhandledErrorContextProvider(() => logData);

    return () => {
      setUnhandledErrorContextProvider(undefined);
    };
  }, [logData]);

  // Persist URL params to app state
  useEffect(() => {
    const {
      policyGuidFromParams,
      area,
      clubCode: clubCodeFromParams,
      isMobileApp: isMobileAppFromParams,
      isMobileAppAccidentDetection,
      crashDatePrediction,
      splashStart,
      splashEnd,
      isW
    } = urlParams;

    // Persist policyGuid from route params or session storage
    const policyGuidFromSession = sessionStorage.getItem('policyGuid');
    if (policyGuidFromSession && !policyGuidFromParams) {
      dispatch(setPolicyGuid(policyGuidFromSession));
    } else if (policyGuidFromParams) {
      dispatch(setPolicyGuid(policyGuidFromParams));
      sessionStorage.setItem('policyGuid', policyGuidFromParams);
    }

    // Persist optional query parameters
    if (area) {
      dispatch(setArea(area));
    }
    if (clubCodeFromParams) {
      sessionStorage.setItem('clubCode', clubCodeFromParams as string);
      dispatch(setClubCode(clubCodeFromParams as ClubCodeValues));
    }
    if (isMobileAppFromParams === 'true') {
      dispatch(setIsMobileApp(true));
    }
    if (isMobileAppAccidentDetection) {
      dispatch(setIsMobileAppAccidentDetection(isMobileAppAccidentDetection));
    }
    if (crashDatePrediction) {
      dispatch(setCrashDatePrediction(crashDatePrediction));
    }
    if (splashStart) {
      dispatch(setSplashStart(splashStart));
    }
    if (splashEnd) {
      dispatch(setSplashEnd(splashEnd));
    }

    // Persist brand (WInsurance vs AAA) from URL param or sessionStorage.
    // Once a WInsurance session is established via isW=true, it persists for the
    // entire browser session — URL changes (removing isW or setting isW=false) do
    // not reset it. Only a fresh session (new tab, cleared sessionStorage) resets to AAA.
    if (isW === 'true') {
      dispatch(setBrand('WInsurance'));
      sessionStorage.setItem('brand', 'WInsurance');
    } else {
      const brandFromSession = sessionStorage.getItem('brand');
      dispatch(setBrand(brandFromSession === 'WInsurance' ? 'WInsurance' : 'AAA'));
    }

    // Detect back navigation from Safelite redirect
    const wasRedirected = sessionStorage.getItem('safeliteRedirectInitiated') === 'true';
    const navEntries =
      typeof performance !== 'undefined' && performance.getEntriesByType
        ? (performance.getEntriesByType('navigation') as PerformanceNavigationTiming[])
        : [];
    const isBackForward = navEntries.length > 0 && navEntries[0].type === 'back_forward';

    if (wasRedirected && isBackForward) {
      sessionStorage.removeItem('safeliteRedirectInitiated');

      const clubCode = sessionStorage.getItem('clubCode');
      const policyNumber = sessionStorage.getItem('policyNumber');
      const sourceApp = sessionStorage.getItem('sourceApp');

      const brandFromSession = sessionStorage.getItem('brand');
      navigateToHome(
        clubCode as string,
        sourceApp as AppSource,
        policyNumber as string,
        brandFromSession === 'WInsurance' ? 'WInsurance' : 'AAA'
      );
    }
  }, []);

  useEffect(() => {
    if (appState.brand !== 'WInsurance') return;
    if (new URLSearchParams(location.search).get('isW') === 'true') return;
    const next = new URLSearchParams(location.search);
    next.set('isW', 'true');
    navigate({ search: next.toString() }, { replace: true });
  }, [location.pathname, location.search, appState.brand]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const isMobileAppAccidentDetection = localStorage.getItem('isMobileAppAccidentDetection');
    LogCannon.blast(`in Layout component, UBI: ${isMobileAppAccidentDetection ? 'true' : 'false'}`);

    // add class to body to change the background color for transition pages
    const isTransitionPage = [
      Pages.IncidentInfoIntro,
      Pages.CarDetailsTransitionPage,
      Pages.OtherPartyTransition,
      Pages.AdditionalDetailsTransition
    ].includes(location.pathname as Pages);
    if (isTransitionPage) {
      document.body.classList.add('transition-container');
    } else {
      document.body.classList.remove('transition-container');
    }

    return () => {
      document.body.classList.remove('transition-container');
    };
  }, [location]);

  const isMobileNativeApp =
    appState.isMobileApp === true || appState.isMobileAppAccidentDetection === 'true';

  const hideBackButton = useMemo(
    () => shouldNotDisplayBackButton(location.pathname, isMobileNativeApp),
    [location, isMobileNativeApp]
  );
  const navigation = useMemo(() => getCurrentNavigation(location.pathname, appState), [location]);
  const progress = useMemo(() => getCurrentProgress(location.pathname), [location]);

  useEffect(() => {
    if (isIDLE) {
      LogCannon.error('Session Timeout', { ...logData });
    } else if (isTokenInfoError) {
      LogCannon.blast(`Step: navigate to SystemError`, { ...logData });
      LogCannon.error('Token info retrieval error', { ...logData });
      navigate(Pages.SystemError);
    }
  }, [isIDLE, isTokenInfoError]);

  useEffect(() => {
    if (!canRender) return;

    if (!hasCheckedSession.current) {
      hasCheckedSession.current = true;

      if (isStaleClaimSession(location.pathname)) {
        LogCannon.error('session-expired-on-refresh', {
          ...logData,
          stalePathname: location.pathname
        });
        clearClaimSession();
        navigate(Pages.SystemError, { replace: true });
        return;
      }
    }

    if (!isEntryOrErrorPage(location.pathname)) {
      markClaimInProgress();
    } else {
      clearClaimSession();
    }
  }, [canRender, location.pathname]);

  useEffect(() => {
    // check if market is supported; otherwise KO
    if (clubCode && !clubCodeError) {
    } else if (clubCodeError) {
      LogCannon.error('Unsupported market detected', {
        ...logData,
        clubCode,
        error: clubCodeError,
        errorData: appState.serializedError
      });
      navigate(Pages.Knockout);
    }
  }, [clubCode, clubCodeError, navigate]);

  // ISS-18069: WInsurance feature flag guard — redirect WInsurance users when flag is off
  useEffect(() => {
    if (
      appState.autoEFNOLFeatureFlags &&
      appState.brand === 'WInsurance' &&
      !appState.autoEFNOLFeatureFlags[Features.AutoEFNOLEnableWInsurance] &&
      location.pathname !== Pages.SystemError
    ) {
      LogCannon.blast(
        'WInsurance feature flag is off — redirecting WInsurance user to system error',
        {
          ...logData
        }
      );
      navigate(Pages.SystemError, { replace: true });
    }
  }, [appState.autoEFNOLFeatureFlags, appState.brand, location.pathname]);

  if (canRender) {
    return (
      <ThemeProvider>
        <Container
          maxWidth='sm'
          sx={{
            paddingBottom: '50px'
          }}>
          <div className='header'>
            <Header
              appState={appState}
              showBackButton={!hideBackButton}
              hideLogo={isMobileNativeApp}
              dispatch={dispatch}
              navigation={navigation}
              progress={progress}
              currentPath={location.pathname as AppPathname}
            />
          </div>

          <div id='content' className={'content'}>
            <AppErrorBoundary logData={logData as Record<string, string>} dispatch={dispatch}>
              <Outlet context={[appState, dispatch]} />
            </AppErrorBoundary>
            <div className='content-cindy'>
              <CindySection
                pathName={location.pathname as AppPathname}
                clubCode={appState.clubCode!}
                brand={appState.brand}
              />
            </div>
          </div>
          {isIDLE && <RedirectToTimeoutPage />}
        </Container>
      </ThemeProvider>
    );
  } else {
    return <div id='white-container'></div>;
  }
};
