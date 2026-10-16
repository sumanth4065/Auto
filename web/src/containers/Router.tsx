import React, { useRef } from 'react';
import type { RouterProviderProps } from 'react-router-dom';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom';
import { FeatureFlagProvider } from '@ace-clublabs/feature-flags/react';
import LogCannon from '@ace-clublabs/log-cannon';

import { Pages } from '../shared/pages';

import { GlassDamage, RedirectToSafelite } from './GlassClaim';
import { Knockout } from './Knockout';
import { Layout } from './Layout';

import {
  CreateClaimTransition,
  FilingClaim,
  IncidentInfoContactInfo,
  IncidentInfoIntro,
  WhenAccident,
  WhereAccident,
  WhoIsReporting,
  CustomDriver,
  WhoWasDriving
} from './IncidentInfo';

import {
  OtherPartyAnyoneInjured,
  OtherPartyDriverInformation,
  OtherPartyInsuranceCompany,
  OtherPartyPassengers,
  OtherPartyTransition,
  Witness,
  YearMakeModel,
  OtherPartyPropertyDamage,
  OtherPartyPedestrian
} from './OtherParty';

import {
  AnyoneInjured,
  CarDetailsTransitionPage,
  DamageByWeather,
  DrivenIncidentDetails,
  DrivenOrParked,
  ParkedIncidentDetails,
  Passengers,
  VehicleDamage,
  VehicleInvolvedPage,
  VehicleTowed,
  WhatHappened
} from './YourInfo';

import { ConfirmationPage, ReviewClaim, SubmitClaimTransition } from './ClaimSubmission';
import { PolicyError, SessionTimedOut, SystemError } from './ErrorPages';
import { NumberOfVehiclesInvolved } from './IncidentInfo/NumberOfVehiclesInvolved/NumberOfVehiclesInvolved';
import { IntroPage, IntroTransition } from './Intro';
import { AdditionalDetailsTransition } from './OtherParty/AdditionalDetailsTransition';
import { CustomReporter } from './IncidentInfo/CustomReporter';
import { CustomVehiclePage } from './YourInfo';
import { getHarnessConfiguration } from '../utils';

const CLOUDFRONT_PATH = '/insurance/auto/file-a-claim';

const { clientSecretId, userId } = getHarnessConfiguration();

// Routes are extracted to module scope so the router instance is never recreated on re-render.
const routes = createRoutesFromElements(
  <Route path='/' element={<Layout />}>
    <Route index element={<IntroTransition />} />

    {/* behind login */}

    <Route path={`${Pages.BehindLoginEntry}/:policyGuid`} element={<IntroTransition />} />
    <Route path={Pages.BehindLoginEntry} element={<IntroTransition />} />
    <Route path={Pages.Intro} element={<IntroPage />} />

    {/* // glass claim */}

    <Route path={Pages.GlassDamage} element={<GlassDamage />} />
    <Route path={Pages.RedirectToSafelite} element={<RedirectToSafelite />} />

    {/* // step 1 : incident info */}

    <Route path={Pages.ContactInformation} element={<IncidentInfoContactInfo />} />
    <Route path={Pages.CreateClaimTransition} element={<CreateClaimTransition />} />
    <Route path={Pages.FilingClaim} element={<FilingClaim />} />
    <Route path={Pages.IncidentInfoIntro} element={<IncidentInfoIntro />} />
    <Route path={Pages.WhenAccident} element={<WhenAccident />} />
    <Route path={Pages.WhereAccident} element={<WhereAccident />} />
    <Route path={Pages.WhoIsReporting} element={<WhoIsReporting />} />
    <Route path={Pages.CustomReporter} element={<CustomReporter />} />
    <Route path={Pages.WhoWasDriving} element={<WhoWasDriving />} />
    <Route path={Pages.CustomDriver} element={<CustomDriver />} />

    {/* // step 2 : your info */}

    <Route path={Pages.AnyoneInjured} element={<AnyoneInjured />} />
    <Route path={Pages.CarDetailsTransitionPage} element={<CarDetailsTransitionPage />} />
    <Route path={Pages.DrivenOrParked} element={<DrivenOrParked />} />
    <Route path={Pages.DrivenIncidentDetails} element={<DrivenIncidentDetails />} />
    <Route path={Pages.NumberOfVehiclesInvolved} element={<NumberOfVehiclesInvolved />} />
    <Route path={Pages.ParkedIncidentDetails} element={<ParkedIncidentDetails />} />
    <Route path={Pages.Passengers} element={<Passengers />} />
    <Route path={Pages.VehicleDamage} element={<VehicleDamage />} />
    <Route path={Pages.DamageByWeather} element={<DamageByWeather />} />
    <Route path={Pages.VehicleInvolved} element={<VehicleInvolvedPage />} />
    <Route path={Pages.CustomVehicle} element={<CustomVehiclePage />} />
    <Route path={Pages.VehicleTowed} element={<VehicleTowed />} />
    <Route path={Pages.WhatHappened} element={<WhatHappened />} />

    {/* // step 3 :  Other Party */}

    <Route path={Pages.OtherPartyAnyoneInjured} element={<OtherPartyAnyoneInjured />} />
    <Route
      path={Pages.OtherPartyDriverInformation}
      element={<OtherPartyDriverInformation />}
    />
    <Route path={Pages.OtherPartyInsurance} element={<OtherPartyInsuranceCompany />} />
    <Route path={Pages.OtherPartyPassengers} element={<OtherPartyPassengers />} />
    <Route path={Pages.OtherPartyTransition} element={<OtherPartyTransition />} />
    <Route path={Pages.OtherPartyYMM} element={<YearMakeModel />} />

    {/* // step 4 :  Additional details */}
    <Route
      path={Pages.AdditionalDetailsTransition}
      element={<AdditionalDetailsTransition />}
    />
    <Route path={Pages.OtherPartyPedestrian} element={<OtherPartyPedestrian />} />
    <Route path={Pages.OtherPartyWitnesses} element={<Witness />} />
    <Route path={Pages.OtherPartyPropertyDamage} element={<OtherPartyPropertyDamage />} />

    {/* // step 5 :   Review */}

    <Route path={Pages.ReviewClaim} element={<ReviewClaim />} />

    {/* // confirmation */}

    <Route path={Pages.Confirmation} element={<ConfirmationPage />} />
    <Route path={Pages.SubmitClaimTransition} element={<SubmitClaimTransition />} />

    {/* error pages */}

    <Route path={Pages.Knockout} element={<Knockout />} />
    <Route path={Pages.SessionTimedOut} element={<SessionTimedOut />} />
    <Route path={Pages.SystemError} element={<SystemError />} />
    <Route path={Pages.PolicyError} element={<PolicyError />} />
  </Route>
);

interface OptionalProps {
  basename?: string;
}

/**
 * Router uses a module-scoped routes definition and a useRef guard so that
 * createBrowserRouter is called exactly once per page load, preventing the
 * route tree from remounting and triggering duplicate auth / API call loops.
 */
export const Router: React.FC<OptionalProps> = props => {
  const { basename } = props;
  const routerRef = useRef<RouterProviderProps['router'] | null>(null);
  if (!routerRef.current) {
    routerRef.current = createBrowserRouter(routes, { basename: basename || CLOUDFRONT_PATH });
  }
  return (
    <FeatureFlagProvider authorizationKey={clientSecretId} userKey={userId} logger={LogCannon}>
      <RouterProvider router={routerRef.current!} />
    </FeatureFlagProvider>
  );
};
