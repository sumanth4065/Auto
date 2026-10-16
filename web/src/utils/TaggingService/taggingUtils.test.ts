import { Pages } from '../../shared/pages';
import * as commonUtils from './taggingUtils';
import { CarKineticStatus, ClaimType, LossCause } from '@lib/types';

const TEXT_GLASS = 'glass';
const TEXT_ACCIDENT = 'accident';
const TEXT_PARKED = 'parked:';
const TEXT_DRIVEN = 'driven:';

describe('getProductAndFlowValue', () => {
  describe('In case for parkedWhatHappenedOptions', () => {
    it('should return correct tagging values for Product and Flow with CarKineticStatus.Parked and LossCause.PARKEDUNOCCUPIED', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.Parked,
        LossCause.PARKEDUNOCCUPIED
      );
      expect(result).toEqual('parked:hit by another vehicle');
    });

    it('should return correct tagging values for Product and Flow with CarKineticStatus.Parked and LossCause.ROLLAWAYCOLL', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.Parked,
        LossCause.ROLLAWAYCOLL
      );
      expect(result).toEqual(TEXT_PARKED + 'rolled away');
    });

    it('should return correct tagging values for Product and Flow with CarKineticStatus.Parked and LossCause.FLYINGCOMP', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.Parked,
        LossCause.FLYINGCOMP
      );
      expect(result).toEqual(TEXT_PARKED + 'struck by a falling or flying object');
    });

    it('should return correct tagging values for Product and Flow with CarKineticStatus.Parked and LossCause.VANDALISM', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.Parked,
        LossCause.VANDALISMCOMP
      );
      expect(result).toEqual(TEXT_PARKED + 'vandalized');
    });

    it('should return correct tagging values for Product and Flow with CarKineticStatus.Parked and LossCause.TOTALTHEFTCOMP', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.Parked,
        LossCause.TOTALTHEFTCOMP
      );
      expect(result).toEqual(TEXT_PARKED + 'stolen');
    });

    it('should return correct tagging values for Product and Flow with CarKineticStatus.Parked and LossCause.FIRE', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.Parked,
        LossCause.FIRECOMP
      );
      expect(result).toEqual(TEXT_PARKED + 'involved in a fire');
    });

    it.skip('should return correct tagging values for Product and Flow with CarKineticStatus.Parked and LossCause.HAILCOMP', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.Parked,
        LossCause.HAILCOMP
      );
      expect(result).toEqual(TEXT_PARKED + 'hail');
    });

    // OTHERCOMP removed from parked options per ISS-14909; no test for parked + Other
  });

  describe('In case for drivenWhatHappenedOptions', () => {
    it('should return correct tagging values for Product and Flow with CarKineticStatus.BeingDriven and LossCause.IMPACTEDWITHANOTHERVEHICLE', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.BeingDriven,
        LossCause.IMPACTEDWITHANOTHERVEHICLE
      );
      expect(result).toEqual(TEXT_DRIVEN + 'impact with other vehicle(s)');
    });

    it('should return correct tagging values for Product and Flow with CarKineticStatus.BeingDriven and LossCause.ANIMALCOMP', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.BeingDriven,
        LossCause.ANIMALCOMP
      );
      expect(result).toEqual(TEXT_DRIVEN + 'impact with an animal');
    });

    it('should return correct tagging values for Product and Flow with CarKineticStatus.BeingDriven and LossCause.WITHFIXEDOBJECTCOLL', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.BeingDriven,
        LossCause.FIXEDCOLL
      );

      expect(result).toEqual(TEXT_DRIVEN + 'impact with a fixed object or structure');
    });

    it('should return correct tagging values for Product and Flow with CarKineticStatus.BeingDriven and LossCause.PEDBIKECOLLISION', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.BeingDriven,
        LossCause.PEDBIKECOLLISION
      );
      expect(result).toEqual(TEXT_DRIVEN + 'impact with a pedestrian or cyclist');
    });

    it.skip('should return correct tagging values for Product and Flow with CarKineticStatus.BeingDriven and LossCause.WINDCOMP', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.BeingDriven,
        LossCause.WINDCOMP
      );
      expect(result).toEqual(TEXT_DRIVEN + 'wind');
    });
  });

  describe('In case for no CarkineticStatus and/or no LossCause', () => {
    it('should return glass for the Product and Flow for tagging for ClaimType.GLASS_ONLY_DAMAGE', () => {
      let result = commonUtils.getFlowValue(ClaimType.GLASS_ONLY_DAMAGE, undefined, undefined);
      expect(result).toEqual(TEXT_GLASS);
    });

    it('should return accident for the Product and Flow for tagging for ClaimType.ALL_OTHER_DAMAGE', () => {
      let result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        undefined,
        LossCause.PARKEDUNOCCUPIED
      );
      expect(result).toEqual(TEXT_ACCIDENT);

      result = commonUtils.getFlowValue(
        ClaimType.ALL_OTHER_DAMAGE,
        CarKineticStatus.Parked,
        undefined
      );
      expect(result).toEqual(TEXT_ACCIDENT);

      result = commonUtils.getFlowValue(ClaimType.ALL_OTHER_DAMAGE, undefined, undefined);
      expect(result).toEqual(TEXT_ACCIDENT);
    });
  });

  describe('When there is no claimType', () => {
    it('should return undefined', () => {
      let result = commonUtils.getFlowValue(undefined, undefined, LossCause.PARKEDUNOCCUPIED);
      expect(result).toBeUndefined();
    });
  });
});

describe('getCurrentPageName', () => {
  it('should return whattoexpect for intro page', () => {
    let result = commonUtils.getCurrentPage(Pages.Intro);
    expect(result).toEqual('whattoexpect');
  });
  it('should return claimtype for FilingClaim page', () => {
    let result = commonUtils.getCurrentPage(Pages.FilingClaim);
    expect(result).toEqual('claimtype');
  });
  it('should return safeliteredirect for GlassDamage page', () => {
    let result = commonUtils.getCurrentPage(Pages.GlassDamage);
    expect(result).toEqual('safeliteredirect');
  });
  it('should return loadsafeliteredirect for RedirectToSafelite page', () => {
    let result = commonUtils.getCurrentPage(Pages.RedirectToSafelite);
    expect(result).toEqual('loadsafeliteredirect');
  });
  it('should return incidentdetails for WhenAccident page', () => {
    let result = commonUtils.getCurrentPage(Pages.WhenAccident);
    expect(result).toEqual('incidentdetails');
  });
  it('should return whereaccident for WhereAccident page', () => {
    let result = commonUtils.getCurrentPage(Pages.WhereAccident);
    expect(result).toEqual('whereaccident');
  });
  it('should return loadcreateautoclaim for CreateClaimTransition page', () => {
    let result = commonUtils.getCurrentPage(Pages.CreateClaimTransition);
    expect(result).toEqual('loadcreateautoclaim');
  });
  it('should return claimreporter for WhoIsReporting page', () => {
    let result = commonUtils.getCurrentPage(Pages.WhoIsReporting);
    expect(result).toEqual('claimreporter');
  });
  it('should return contactinfo for ContactInformation page', () => {
    let result = commonUtils.getCurrentPage(Pages.ContactInformation);
    expect(result).toEqual('contactinfo');
  });
  it('should return transitionpage for CarDetailsTransitionPage page', () => {
    let result = commonUtils.getCurrentPage(Pages.CarDetailsTransitionPage);
    expect(result).toEqual('transitionpage');
  });
  it('should return carinvolved for VehicleInvolved page', () => {
    let result = commonUtils.getCurrentPage(Pages.VehicleInvolved);
    expect(result).toEqual('carinvolved');
  });
  it('should return carkineticstatus for DrivenOrParked page', () => {
    let result = commonUtils.getCurrentPage(Pages.DrivenOrParked);
    expect(result).toEqual('carkineticstatus');
  });
  it('should return drivenwhathappened for DrivenIncidentDetails page', () => {
    let result = commonUtils.getCurrentPage(Pages.DrivenIncidentDetails);
    expect(result).toEqual('drivenwhathappened');
  });
  it('should return parkedwhathappened for ParkedIncidentDetails page', () => {
    let result = commonUtils.getCurrentPage(Pages.ParkedIncidentDetails);
    expect(result).toEqual('parkedwhathappened');
  });
  it('should return driver for WhoWasDriving page', () => {
    let result = commonUtils.getCurrentPage(Pages.WhoWasDriving);
    expect(result).toEqual('driver');
  });
  it('should return injured for AnyoneInjured page', () => {
    let result = commonUtils.getCurrentPage(Pages.AnyoneInjured);
    expect(result).toEqual('injured');
  });
  it('should return additionaldetails for WhatHappened page', () => {
    let result = commonUtils.getCurrentPage(Pages.WhatHappened);
    expect(result).toEqual('additionaldetails');
  });
  it('should return towed for VehicleTowed page', () => {
    let result = commonUtils.getCurrentPage(Pages.VehicleTowed);
    expect(result).toEqual('towed');
  });
  it('should return vehicledamage for VehicleDamage page', () => {
    let result = commonUtils.getCurrentPage(Pages.VehicleDamage);
    expect(result).toEqual('vehicledamage');
  });
  it('should return otherpartyinformationtransition for OtherPartyTransition page', () => {
    let result = commonUtils.getCurrentPage(Pages.OtherPartyTransition);
    expect(result).toEqual('otherpartyinformationtransition');
  });
  it('should return yearmakemodel for OtherPartyYMM page', () => {
    let result = commonUtils.getCurrentPage(Pages.OtherPartyYMM);
    expect(result).toEqual('yearmakemodel');
  });
  it('should return otherpartyinsuranceinfo for OtherPartyInsurance page', () => {
    let result = commonUtils.getCurrentPage(Pages.OtherPartyInsurance);
    expect(result).toEqual('otherpartyinsuranceinfo');
  });
  it('should return witness for OtherPartyWitnesses page', () => {
    let result = commonUtils.getCurrentPage(Pages.OtherPartyWitnesses);
    expect(result).toEqual('witness');
  });
  it('should return accidentreview for ReviewClaim page', () => {
    let result = commonUtils.getCurrentPage(Pages.ReviewClaim);
    expect(result).toEqual('accidentreview');
  });
  it('should return loadcreateautoclaim for SubmitClaimTransition page', () => {
    let result = commonUtils.getCurrentPage(Pages.SubmitClaimTransition);
    expect(result).toEqual('loadcreateautoclaim');
  });
  it('should return confirmation for Confirmation page', () => {
    let result = commonUtils.getCurrentPage(Pages.Confirmation);
    expect(result).toEqual('confirmation');
  });
  it('should return error for System Error page', () => {
    let result = commonUtils.getCurrentPage(Pages.SystemError);
    expect(result).toEqual('error');
  });
  it('should return error for Policy Error page', () => {
    let result = commonUtils.getCurrentPage(Pages.PolicyError);
    expect(result).toEqual('error');
  });
  it('should return error for Knockout page', () => {
    let result = commonUtils.getCurrentPage(Pages.Knockout);
    expect(result).toEqual('error');
  });
  it('should return error for NumberOfVehiclesInvolved page', () => {
    let result = commonUtils.getCurrentPage(Pages.NumberOfVehiclesInvolved);
    expect(result).toEqual('vehiclesinvolvednumber');
  });
  it('should return error for OtherPartyPropertyDamage page', () => {
    let result = commonUtils.getCurrentPage(Pages.OtherPartyPropertyDamage);
    expect(result).toEqual('additionalpropertydamage');
  });
  it('should return error for OtherPartyPedestrian page', () => {
    let result = commonUtils.getCurrentPage(Pages.OtherPartyPedestrian);
    expect(result).toEqual('pedestrianorcyclistinvolved');
  });
  it('should return error for OtherPartyDriverInformation page', () => {
    let result = commonUtils.getCurrentPage(Pages.OtherPartyDriverInformation);
    expect(result).toEqual('otherpartyvehicledriver');
  });
  it('should return error for OtherPartyAnyoneInjured page', () => {
    let result = commonUtils.getCurrentPage(Pages.OtherPartyAnyoneInjured);
    expect(result).toEqual('otherpartyinjuredcheck');
  });
  it('should return loadefnol for BehindLoginEntry page', () => {
    let result = commonUtils.getCurrentPage(Pages.BehindLoginEntry);
    expect(result).toEqual('loadefnol');
  });
});
