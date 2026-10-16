import {
  VehicleCount,
  CarKineticStatus,
  LossCause,
  YesNoUnknown
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { FaqType } from '@lib/common-utils';
import { KnockoutReason } from '@lib/types';

import { RouteType } from '../types';

export enum Pages {
  IntroTransition = '/',
  BehindLoginEntry = '/behindlogin',
  AnyoneInjured = '/injured',
  CarDetailsTransitionPage = '/cardamagetransition',
  Confirmation = '/confirmation',
  ContactInformation = '/contactinfo',
  CreateClaimTransition = '/create-claim-transition',
  DrivenIncidentDetails = '/drivenwhathappened',
  DrivenOrParked = '/carkineticstatus',
  FilingClaim = '/claimtype',
  GlassDamage = '/safeliteredirect',
  IncidentInfoIntro = '/transitionpage',
  Intro = '/whattoexpect',
  Knockout = '/knockout',
  NumberOfVehiclesInvolved = '/vehiclesinvolvednumber',
  OtherPartyAnyoneInjured = '/otherpartyinjuredcheck',
  OtherPartyDriverInformation = '/otherpartyvehicledriverinfo',
  OtherPartyInsurance = '/otherpartyinsuranceinfo',
  OtherPartyPassengers = '/otherpartypassengers',
  OtherPartyPedestrian = '/pedestrianorcyclistinvolved',
  OtherPartyPropertyDamage = '/additionalpropertydamage',
  OtherPartyTransition = '/otherpartyinformationtransition',
  OtherPartyWitnesses = '/witnessinfo',
  OtherPartyYMM = '/yearmakemodel',
  ParkedIncidentDetails = '/parkedwhathappened',
  Passengers = '/passengers',
  CustomDriver = '/customdriver',
  RedirectToSafelite = '/safeliteredirect-continue',
  ReviewClaim = '/accidentreview',
  SessionTimedOut = '/session-timeout',
  SubmitClaimTransition = '/submit-claim-transition',
  SystemError = '/error',
  VehicleDamage = '/vehicledamage',
  VehicleInvolved = '/carinvolved',
  CustomVehicle = '/customvehicle',
  VehicleTowed = '/towed',
  WhatHappened = '/additionaldetails',
  WhenAccident = '/when-accident',
  WhereAccident = '/where-accident',
  WhoIsReporting = '/claimreporter',
  CustomReporter = '/customreporter',
  WhoWasDriving = '/driver',
  DamageByWeather = '/vehicledamagebyweather',
  PolicyError = '/policy-error',
  TBD = '/to-be-defined', // TODO: This route will be removed by EOW
  AdditionalDetailsTransition = '/additional-details-transition'
}

// navigation : back
// @TODO: spread this objects in different files: NavigationHelper
export const master_pages = Object.freeze({
  [Pages.AnyoneInjured]: Pages.Passengers,
  [Pages.CarDetailsTransitionPage]: Pages.ContactInformation,
  [Pages.Confirmation]: '/',
  [Pages.ContactInformation]: {
    appState: 'selectedReporter.id',
    default: Pages.WhoIsReporting,
    true: Pages.WhoIsReporting,
    false: Pages.CustomReporter,
  },
  [Pages.CustomReporter]: Pages.WhoIsReporting,
  [Pages.DrivenIncidentDetails]: Pages.DrivenOrParked,
  [Pages.DrivenOrParked]: {
    appState: 'vehicleInIncident.customVehicle.make',
    true: Pages.CustomVehicle,
    false: Pages.VehicleInvolved,
    default: Pages.VehicleInvolved
  } as RouteType,
  [Pages.CustomVehicle]: Pages.VehicleInvolved,
  [Pages.FilingClaim]: '/',
  [Pages.GlassDamage]: Pages.FilingClaim,
  [Pages.IncidentInfoIntro]: Pages.FilingClaim,
  [Pages.Intro]: '/logout', // intro page goes back to authenticate/anon (via logout)  => will point to getLogoutUrl()
  [Pages.NumberOfVehiclesInvolved]: Pages.VehicleDamage,
  [Pages.DamageByWeather]: {
    appState: 'carStatus',
    [CarKineticStatus.BeingDriven]: Pages.DrivenIncidentDetails,
    [CarKineticStatus.Parked]: Pages.ParkedIncidentDetails
  } as RouteType,
  [Pages.OtherPartyAnyoneInjured]: Pages.OtherPartyPassengers,
  [Pages.OtherPartyDriverInformation]: Pages.OtherPartyInsurance,
  [Pages.OtherPartyInsurance]: Pages.OtherPartyYMM,
  [Pages.OtherPartyPassengers]: Pages.OtherPartyDriverInformation,
  [Pages.OtherPartyPedestrian]: Pages.AdditionalDetailsTransition,
  [Pages.AdditionalDetailsTransition]: {
    appState: 'numberOfVehiclesInvolved',
    [VehicleCount.One]: Pages.OtherPartyAnyoneInjured,
    [VehicleCount.TwoOrMore]: Pages.NumberOfVehiclesInvolved,
    [VehicleCount.None]: Pages.NumberOfVehiclesInvolved
  } as RouteType,
  [Pages.OtherPartyPropertyDamage]: Pages.OtherPartyWitnesses,
  [Pages.OtherPartyTransition]: Pages.NumberOfVehiclesInvolved,
  [Pages.OtherPartyWitnesses]: Pages.OtherPartyPedestrian,
  [Pages.OtherPartyYMM]: Pages.OtherPartyTransition,
  [Pages.ParkedIncidentDetails]: Pages.DrivenOrParked,
  [Pages.Passengers]: {
    appState: 'driverNotListedBackNav',
    [KnockoutReason.DriverNotListed]: Pages.CustomDriver,
    default: Pages.WhoWasDriving
  } as RouteType,
  [Pages.RedirectToSafelite]: Pages.FilingClaim,
  [Pages.ReviewClaim]: {
    appState: 'witness.selection',
    [YesNoUnknown.Yes]: Pages.OtherPartyPropertyDamage,
    [YesNoUnknown.No]: Pages.OtherPartyWitnesses,
    [YesNoUnknown.Unknown]: Pages.OtherPartyWitnesses
  } as RouteType,
  [Pages.SessionTimedOut]: '/',
  [Pages.SystemError]: '/',
  [Pages.Knockout]: '/',
  [Pages.PolicyError]: '/',
  [Pages.VehicleDamage]: Pages.VehicleTowed,
  [Pages.VehicleInvolved]: Pages.CarDetailsTransitionPage,  
  [Pages.VehicleTowed]: Pages.WhatHappened,
  [Pages.WhatHappened]: Pages.AnyoneInjured,
  [Pages.WhenAccident]: Pages.IncidentInfoIntro,
  [Pages.WhereAccident]: Pages.WhenAccident,
  [Pages.WhoIsReporting]: Pages.WhereAccident,
  [Pages.CustomDriver]: Pages.WhoWasDriving,
  [Pages.WhoWasDriving]: {
    appState: 'carStatus',
    [CarKineticStatus.BeingDriven]: Pages.DrivenIncidentDetails,
    [CarKineticStatus.Parked]: {
      appState: 'statusVehicleWhileParked.code',
      default: Pages.ParkedIncidentDetails,
      [LossCause.WEATHERRELATEDCOMP]: Pages.ParkedIncidentDetails
    } as RouteType
  } as RouteType
});

// FAQs
// @TODO: spread this objects in different files: FaqHelper
export const master_faqs = Object.freeze({
  [Pages.AnyoneInjured]: FaqType.AllOtherPages,
  [Pages.CarDetailsTransitionPage]: FaqType.AllOtherPages,
  [Pages.Confirmation]: FaqType.ReviewAndSummaryConfirmation,
  [Pages.ContactInformation]: FaqType.ReporterContact,
  [Pages.DrivenIncidentDetails]: FaqType.KineticStatusWhatHappened,
  [Pages.DrivenOrParked]: FaqType.KineticStatusWhatHappened,
  [Pages.FilingClaim]: FaqType.FilingClaim,
  [Pages.GlassDamage]: FaqType.DateAndTimeLocation,
  [Pages.IncidentInfoIntro]: FaqType.AllOtherPages,
  [Pages.Intro]: FaqType.AllOtherPages,
  [Pages.NumberOfVehiclesInvolved]: FaqType.AllOtherPages,
  [Pages.OtherPartyAnyoneInjured]: FaqType.OtherPartyInsuranceCompany,
  [Pages.OtherPartyDriverInformation]: FaqType.OtherPartyInsuranceCompany,
  [Pages.OtherPartyInsurance]: FaqType.OtherPartyInsuranceCompany,
  [Pages.OtherPartyPassengers]: FaqType.AllOtherPages,
  [Pages.OtherPartyPedestrian]: FaqType.AllOtherPages,
  [Pages.OtherPartyPropertyDamage]: FaqType.OtherPartyInsuranceCompany,
  [Pages.OtherPartyTransition]: FaqType.AllOtherPages,
  [Pages.OtherPartyWitnesses]: FaqType.PedestrianWitness,
  [Pages.OtherPartyYMM]: FaqType.Vehicle,
  [Pages.ParkedIncidentDetails]: FaqType.KineticStatusWhatHappened,
  [Pages.Passengers]: FaqType.AllOtherPages,
  [Pages.CustomDriver]: FaqType.AllOtherPages,
  [Pages.RedirectToSafelite]: FaqType.AllOtherPages,
  [Pages.ReviewClaim]: FaqType.ReviewAndSummaryConfirmation,
  [Pages.SessionTimedOut]: FaqType.AllOtherPages,
  [Pages.SystemError]: FaqType.AllOtherPages,
  [Pages.PolicyError]: FaqType.AllOtherPages,
  [Pages.VehicleDamage]: FaqType.TowedOrDamaged,
  [Pages.VehicleInvolved]: FaqType.Vehicle,
  [Pages.CustomVehicle]: FaqType.Vehicle,
  [Pages.VehicleTowed]: FaqType.TowedOrDamaged,
  [Pages.WhatHappened]: FaqType.KineticStatusWhatHappened,
  [Pages.WhenAccident]: FaqType.DateAndTimeLocation,
  [Pages.WhereAccident]: FaqType.DateAndTimeLocation,
  [Pages.WhoIsReporting]: FaqType.ReporterContact,
  [Pages.CustomReporter]: FaqType.ReporterContact,
  [Pages.WhoWasDriving]: FaqType.AllOtherPages
});
