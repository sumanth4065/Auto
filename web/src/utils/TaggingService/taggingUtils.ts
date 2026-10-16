import {
  CarKineticStatus,
  ClaimType,
  drivenIncidentOptions,
  LossCause,
  parkIncidentOptions
} from '@lib/types';
import { Pages } from '../../shared/pages';

export const getFlowValue = (
  claimType: ClaimType | undefined,
  kineticStatus: CarKineticStatus | undefined,
  lossCause: LossCause | undefined
) => {
  if (kineticStatus && lossCause) {
    const drivenOrParked = kineticStatus === CarKineticStatus.Parked ? 'parked' : 'driven';
    const options =
      kineticStatus === CarKineticStatus.Parked ? parkIncidentOptions : drivenIncidentOptions;

    const lossCauseOption = options.find(option => option.code === lossCause);
    const lossCauseText = lossCauseOption?.description || '';

    return `${drivenOrParked}:${lossCauseText.toLowerCase()}`;
  }

  if (claimType === ClaimType.GLASS_ONLY_DAMAGE) return 'glass';
  if (claimType === ClaimType.ALL_OTHER_DAMAGE) return 'accident';
};

export const getCurrentPage = (page: Pages): string => {
  switch (page) {
    case Pages.Intro:
      return 'whattoexpect';
    case Pages.FilingClaim:
      return 'claimtype';
    case Pages.GlassDamage:
      return 'safeliteredirect';
    case Pages.RedirectToSafelite:
      return 'loadsafeliteredirect';
    case Pages.IncidentInfoIntro:
      return 'incidentinfointro';
    case Pages.WhenAccident:
      return 'incidentdetails';
    case Pages.WhereAccident:
      return 'whereaccident';
    case Pages.CreateClaimTransition:
      return 'loadcreateautoclaim';
    case Pages.WhoIsReporting:
      return 'claimreporter';
    case Pages.ContactInformation:
      return 'contactinfo';
    case Pages.CarDetailsTransitionPage:
      return 'transitionpage';
    case Pages.CustomVehicle:
    case Pages.VehicleInvolved:
      return 'carinvolved';
    case Pages.DrivenOrParked:
      return 'carkineticstatus';
    case Pages.DrivenIncidentDetails:
      return 'drivenwhathappened';
    case Pages.ParkedIncidentDetails:
      return 'parkedwhathappened';
    case Pages.WhoWasDriving:
      return 'driver';
    case Pages.AnyoneInjured:
      return 'injured';
    case Pages.WhatHappened:
      return 'additionaldetails';
    case Pages.VehicleTowed:
      return 'towed';
    case Pages.VehicleDamage:
      return 'vehicledamage';
    case Pages.NumberOfVehiclesInvolved:
      return 'vehiclesinvolvednumber';
    case Pages.OtherPartyTransition:
      return 'otherpartyinformationtransition';
    case Pages.OtherPartyYMM:
      return 'yearmakemodel';
    case Pages.OtherPartyInsurance:
      return 'otherpartyinsuranceinfo';
    case Pages.OtherPartyWitnesses:
      return 'witness';
    case Pages.OtherPartyPropertyDamage:
      return 'additionalpropertydamage';
    case Pages.OtherPartyPedestrian:
      return 'pedestrianorcyclistinvolved';
    case Pages.OtherPartyDriverInformation:
      return 'otherpartyvehicledriver';
    case Pages.OtherPartyAnyoneInjured:
      return 'otherpartyinjuredcheck';
    case Pages.ReviewClaim:
      return 'accidentreview';
    case Pages.SubmitClaimTransition:
      return 'loadcreateautoclaim';
    case Pages.Confirmation:
      return 'confirmation';
    case Pages.SystemError:
    case Pages.PolicyError:
    case Pages.Knockout:
      return 'error';
    case Pages.BehindLoginEntry:
      return 'loadefnol';
  }

  return '';
};
