import { describe, it } from 'vitest';
import {
  IVehicleOption,
  submitAutoClaimCarDrivenWithOneOtherParty,
  submitAutoClaimCarParked,
  submitAutoClaimCarParkedWeatherDamage
} from '@lib/types';
import { LoginFlowType } from '@lib/shared-contracts';
import { createRequestBody } from './createSubmitClaimRequest';
import {
  mockStateCarDrivenWithOneOtherPartyAndDriver,
  mockStateCarParked,
  mockStateWeatherDamage,
  mockStateBehindLogin,
  mockStateCarParkedBehindLogin
} from '../../shared/fixtures';
import {
  CarKineticStatus,
  LossCause,
  OtherNonVehicleParties,
  VehicleCount,
  YesNoUnknown
} from '@ace-clublabs/iss-common-auto-efnol-models';
describe('createSubmitClaimRequest', () => {
  const insuredVehicle = {
    RUNumber: 'RU12345',
    year: 2001,
    make: 'FORD',
    model: 'F350 CREW C CREW',
    vin: '*************6441'
  };
  const expectedLossTime = mockStateCarParked.lossDateFormat!.split(' ')[1]!;

  it('should return appropriate request payload for loss while driving', () => {
    const submitAutoClaimCarDrivenWithOneOtherPartyClone: typeof submitAutoClaimCarDrivenWithOneOtherParty =
      JSON.parse(JSON.stringify(submitAutoClaimCarDrivenWithOneOtherParty));
    submitAutoClaimCarDrivenWithOneOtherPartyClone.lossTime = expectedLossTime;
    submitAutoClaimCarDrivenWithOneOtherPartyClone.incidentOtherNonVehicleParties =
      OtherNonVehicleParties.None;
    delete submitAutoClaimCarDrivenWithOneOtherPartyClone.incidentOtherVehicleCount;
    submitAutoClaimCarDrivenWithOneOtherPartyClone.sr1_VehicleNumber = 1;
    submitAutoClaimCarDrivenWithOneOtherPartyClone.policyNumber = 'CAA123456789';
    submitAutoClaimCarDrivenWithOneOtherPartyClone.lossVehicle.insuredVehicle = insuredVehicle;
    submitAutoClaimCarDrivenWithOneOtherPartyClone.lossVehicle.passengerCount = undefined;
    submitAutoClaimCarDrivenWithOneOtherPartyClone.loginFlowType = LoginFlowType.ANONYMOUS;
    const result = createRequestBody(mockStateCarDrivenWithOneOtherPartyAndDriver);
    expect(result).toEqual(submitAutoClaimCarDrivenWithOneOtherPartyClone);
  });

  it('should return appropriate request payload for claim while parked with no otherparty vehicle involved', () => {
    const result = createRequestBody(mockStateCarParked);
    const expectedResult = JSON.parse(JSON.stringify(submitAutoClaimCarParked));

    expectedResult.lossCause = 'vandalismcomp' as LossCause;
    expectedResult.isTextCommunicationOptIn = true;
    expectedResult.contactInfo.preferredContactMethod = 'himarley';
    expectedResult.incidentOtherNonVehicleParties = 'none' as OtherNonVehicleParties;
    delete expectedResult.incidentOtherVehicleCount;

    expectedResult.incidentSingleOtherVehicle.wasSomeoneDrivingOtherVehicle =
      'unknown' as YesNoUnknown;
    expectedResult.lossVehicle = {
      vehicleDrivenOrParked: 'parked' as CarKineticStatus,
      hadInjuries: YesNoUnknown.Unknown,
      vehicleId: 'someUniqueId1',
      damageDescription: 'some vehicle damage description while parked',
      incidentDriverId: 'someUniqueId3',
      passengerCount: undefined,
      insuredVehicle,
      towed: 'yes'
    };
    expectedResult.lossTime = expectedLossTime;
    expectedResult.sr1_VehicleNumber = 1;
    expectedResult.policyNumber = 'CAA123456789';
    expectedResult.loginFlowType = LoginFlowType.ANONYMOUS;
    expect(result).toEqual(expectedResult);
  });

  it('should return appropriate request payload for claim while parked with weather damage selected', () => {
    const result = createRequestBody(mockStateWeatherDamage);
    const expectedResult = JSON.parse(JSON.stringify(submitAutoClaimCarParkedWeatherDamage));

    expectedResult.lossCause = LossCause.TORNADOCOMP;
    expectedResult.isTextCommunicationOptIn = true;
    expectedResult.contactInfo.preferredContactMethod = 'himarley';
    expectedResult.incidentOtherNonVehicleParties = 'none' as OtherNonVehicleParties;
    expectedResult.isMobileAppAccidentDetection = 'true';
    delete expectedResult.incidentOtherVehicleCount;

    expectedResult.incidentSingleOtherVehicle.wasSomeoneDrivingOtherVehicle =
      'unknown' as YesNoUnknown;
    expectedResult.lossVehicle = {
      vehicleDrivenOrParked: 'parked' as CarKineticStatus,
      hadInjuries: YesNoUnknown.Unknown,
      vehicleId: 'someUniqueId1',
      damageDescription: 'some vehicle damage description while parked',
      incidentDriverId: 'someUniqueId3',
      passengerCount: undefined,
      insuredVehicle,
      towed: 'yes'
    };
    expectedResult.lossTime = expectedLossTime;
    expectedResult.sr1_VehicleNumber = 1;
    expectedResult.policyNumber = 'CAA123456789';
    expectedResult.loginFlowType = LoginFlowType.ANONYMOUS;
    expect(result).toEqual(expectedResult);
  });

  it('should return appropriate request payload for claim while driven with weather damage selected', () => {
    const mockStateWeatherDamageDriven = {
      ...mockStateWeatherDamage,
      damageDescription: 'some vehicle damage description while driven',
      carStatus: 'beingDriven' as CarKineticStatus,
      statusVehicleWhileDriven: {
        code: LossCause.WEATHERRELATEDCOMP,
        description: 'Damaged by weather'
      }
    };

    const submitAutoClaimCarDrivenWeatherDamage = {
      ...submitAutoClaimCarParkedWeatherDamage,
      lossVehicle: {
        ...submitAutoClaimCarParkedWeatherDamage.lossVehicle,
        damageDescription: 'some vehicle damage description while driven',
        vehicleDrivenOrParked: 'beingDriven' as CarKineticStatus,
        towed: undefined
      }
    };
    const result = createRequestBody(mockStateWeatherDamageDriven);

    const expectedResult = JSON.parse(JSON.stringify(submitAutoClaimCarDrivenWeatherDamage));

    expectedResult.lossCause = LossCause.TORNADOCOMP;
    expectedResult.isTextCommunicationOptIn = true;
    expectedResult.contactInfo.preferredContactMethod = 'himarley';
    expectedResult.incidentOtherNonVehicleParties = 'none' as OtherNonVehicleParties;
    expectedResult.isMobileAppAccidentDetection = 'true';
    delete expectedResult.incidentOtherVehicleCount;

    expectedResult.incidentSingleOtherVehicle.wasSomeoneDrivingOtherVehicle =
      'unknown' as YesNoUnknown;
    expectedResult.lossVehicle = {
      vehicleDrivenOrParked: 'beingDriven' as CarKineticStatus,
      hadInjuries: YesNoUnknown.Unknown,
      vehicleId: 'someUniqueId1',
      damageDescription: 'some vehicle damage description while driven',
      incidentDriverId: 'someUniqueId3',
      passengerCount: undefined,
      insuredVehicle,
      towed: 'yes'
    };
    expectedResult.lossTime = expectedLossTime;
    expectedResult.sr1_VehicleNumber = 1;
    expectedResult.policyNumber = 'CAA123456789';
    expectedResult.loginFlowType = LoginFlowType.ANONYMOUS;
    expect(result).toEqual(expectedResult);
  });

  it('should return appropriate request payload for claim while parked with NO otherparty vehicle involved', () => {
    const mockStateCarParkedCloned = JSON.parse(JSON.stringify(mockStateCarParked));
    mockStateCarParkedCloned.numberOfVehiclesInvolved = VehicleCount.None;

    const result = createRequestBody(mockStateCarParkedCloned);
    const expectedResult = JSON.parse(JSON.stringify(submitAutoClaimCarParked));

    expectedResult.lossCause = 'vandalismcomp' as LossCause;
    expectedResult.isTextCommunicationOptIn = true;
    expectedResult.contactInfo.preferredContactMethod = 'himarley';
    expectedResult.incidentOtherNonVehicleParties = 'none' as OtherNonVehicleParties;
    expectedResult.incidentOtherVehicleCount = VehicleCount.None;

    expectedResult.incidentSingleOtherVehicle.wasSomeoneDrivingOtherVehicle =
      'unknown' as YesNoUnknown;
    expectedResult.lossVehicle = {
      vehicleDrivenOrParked: 'parked' as CarKineticStatus,
      hadInjuries: YesNoUnknown.Unknown,
      vehicleId: 'someUniqueId1',
      damageDescription: 'some vehicle damage description while parked',
      incidentDriverId: 'someUniqueId3',
      passengerCount: undefined,
      insuredVehicle,
      towed: 'yes'
    };
    expectedResult.lossTime = expectedLossTime;
    expectedResult.sr1_VehicleNumber = 1;
    expectedResult.policyNumber = 'CAA123456789';
    expectedResult.loginFlowType = LoginFlowType.ANONYMOUS;
    expect(result).toEqual(expectedResult);
  });

  it('should return appropriate request payload for claim while parked with one otherparty vehicle involved', () => {
    const mockStateCarParkedCloned = JSON.parse(JSON.stringify(mockStateCarParked));
    mockStateCarParkedCloned.numberOfVehiclesInvolved = VehicleCount.One;

    const result = createRequestBody(mockStateCarParkedCloned);
    const expectedResult = JSON.parse(JSON.stringify(submitAutoClaimCarParked));

    expectedResult.lossCause = 'vandalismcomp' as LossCause;
    expectedResult.isTextCommunicationOptIn = true;
    expectedResult.contactInfo.preferredContactMethod = 'himarley';
    expectedResult.incidentOtherNonVehicleParties = 'none' as OtherNonVehicleParties;
    expectedResult.incidentOtherVehicleCount = VehicleCount.One;

    expectedResult.incidentSingleOtherVehicle.wasSomeoneDrivingOtherVehicle =
      'unknown' as YesNoUnknown;
    expectedResult.lossVehicle = {
      vehicleDrivenOrParked: 'parked' as CarKineticStatus,
      hadInjuries: YesNoUnknown.Unknown,
      vehicleId: 'someUniqueId1',
      damageDescription: 'some vehicle damage description while parked',
      incidentDriverId: 'someUniqueId3',
      passengerCount: undefined,
      insuredVehicle,
      towed: 'yes'
    };
    expectedResult.lossTime = expectedLossTime;
    expectedResult.sr1_VehicleNumber = 2;
    expectedResult.policyNumber = 'CAA123456789';
    expectedResult.loginFlowType = LoginFlowType.ANONYMOUS;
    expect(result).toEqual(expectedResult);
  });

  it('should return appropriate request payload for claim while parked with two or more otherparty vehicle involved', () => {
    const mockStateCarParkedCloned = JSON.parse(JSON.stringify(mockStateCarParked));
    mockStateCarParkedCloned.numberOfVehiclesInvolved = VehicleCount.TwoOrMore;

    const result = createRequestBody(mockStateCarParkedCloned);
    const expectedResult = JSON.parse(JSON.stringify(submitAutoClaimCarParked));

    expectedResult.lossCause = 'vandalismcomp' as LossCause;
    expectedResult.isTextCommunicationOptIn = true;
    expectedResult.contactInfo.preferredContactMethod = 'himarley';
    expectedResult.incidentOtherNonVehicleParties = 'none' as OtherNonVehicleParties;
    expectedResult.incidentOtherVehicleCount = VehicleCount.TwoOrMore;

    expectedResult.incidentSingleOtherVehicle.wasSomeoneDrivingOtherVehicle =
      'unknown' as YesNoUnknown;
    expectedResult.lossVehicle = {
      vehicleDrivenOrParked: 'parked' as CarKineticStatus,
      hadInjuries: YesNoUnknown.Unknown,
      vehicleId: 'someUniqueId1',
      damageDescription: 'some vehicle damage description while parked',
      incidentDriverId: 'someUniqueId3',
      passengerCount: undefined,
      insuredVehicle,
      towed: 'yes'
    };
    expectedResult.lossTime = expectedLossTime;
    expectedResult.sr1_VehicleNumber = 3;
    expectedResult.policyNumber = 'CAA123456789';
    expectedResult.loginFlowType = LoginFlowType.ANONYMOUS;
    expect(result).toEqual(expectedResult);
  });

  it('includes isMobileAppAccidentDetection and dateOfCrashPrediction when present', () => {
    const stateWithUbi = {
      ...mockStateCarParked,
      isMobileAppAccidentDetection: 'true',
      dateOfCrashPrediction: '2025-10-08'
    } as any; // partial
    const result = createRequestBody(stateWithUbi);
    expect(result.isMobileAppAccidentDetection).toBe('true');
    expect(result.dateOfCrashPrediction).toBe('2025-10-08');
  });

  it('maps loss location street, zipCode and incident location description', () => {
    const result = createRequestBody(mockStateCarParked);
    expect(result.lossLocation).toEqual({
      streetAddress: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90012',
      description: 'Near the intersection by city hall.'
    });
  });

  it('falls back to N/A street and omits optional location fields when empty', () => {
    const stateWithoutExtendedLocation = {
      ...mockStateCarParked,
      street: undefined,
      zipCode: undefined,
      lossLocationDescription: undefined
    };

    const result = createRequestBody(stateWithoutExtendedLocation);
    expect(result.lossLocation).toEqual({
      streetAddress: 'N/A',
      city: 'Los Angeles',
      state: 'CA'
    });
  });

  it('should return appropriate loss cause in payload when driven with accident details selected', () => {
    const mockStateCarDrivenCloned = JSON.parse(
      JSON.stringify(mockStateCarDrivenWithOneOtherPartyAndDriver)
    );
    mockStateCarDrivenCloned.statusVehicleWhileDriven = {
      code: LossCause.IMPACTEDWITHANOTHERVEHICLE,
      description: 'Impact with other vehicle(s)'
    };
    mockStateCarDrivenCloned.accidentDetailsWhileDriven = {
      code: 'rearendcoll',
      description: 'Rear-end'
    };

    const result = createRequestBody(mockStateCarDrivenCloned);
    expect(result.lossCause).toBe('rearendcoll');
  });

  describe('Witness handling', () => {
    it('should include witness when selection is Yes with first and last name provided', () => {
      const stateWithWitness = {
        ...mockStateCarParked,
        witness: {
          selection: YesNoUnknown.Yes,
          witnessInformation: {
            firstName: 'John',
            lastName: 'Doe',
            mobilePhone: '5551234567'
          }
        }
      };
      const result = createRequestBody(stateWithWitness);
      expect(result.witness).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        mobilePhone: '5551234567'
      });
    });

    it('should include witness with optional phone number when not provided', () => {
      const stateWithWitness = {
        ...mockStateCarParked,
        witness: {
          selection: YesNoUnknown.Yes,
          witnessInformation: {
            firstName: 'Jane',
            lastName: 'Smith',
            mobilePhone: undefined
          }
        }
      };
      const result = createRequestBody(stateWithWitness);
      expect(result.witness).toEqual({
        firstName: 'Jane',
        lastName: 'Smith',
        mobilePhone: undefined
      });
    });

    it('should NOT include witness when selection is No', () => {
      const stateWithNoWitness = {
        ...mockStateCarParked,
        witness: {
          selection: YesNoUnknown.No,
          witnessInformation: undefined
        }
      };
      const result = createRequestBody(stateWithNoWitness);
      expect(result.witness).toBeUndefined();
      expect(result).not.toHaveProperty('witness');
    });

    it('should NOT include witness when selection is Yes but first name is missing', () => {
      const stateWithIncompleteWitness = {
        ...mockStateCarParked,
        witness: {
          selection: YesNoUnknown.Yes,
          witnessInformation: {
            firstName: undefined,
            lastName: 'Doe',
            mobilePhone: '5551234567'
          }
        }
      } as any; // Testing invalid data
      const result = createRequestBody(stateWithIncompleteWitness);
      expect(result.witness).toBeUndefined();
      expect(result).not.toHaveProperty('witness');
    });

    it('should NOT include witness when selection is Yes but last name is missing', () => {
      const stateWithIncompleteWitness = {
        ...mockStateCarParked,
        witness: {
          selection: YesNoUnknown.Yes,
          witnessInformation: {
            firstName: 'John',
            lastName: undefined,
            mobilePhone: '5551234567'
          }
        }
      } as any; // Testing invalid data
      const result = createRequestBody(stateWithIncompleteWitness);
      expect(result.witness).toBeUndefined();
      expect(result).not.toHaveProperty('witness');
    });

    it('should NOT include witness when witness is undefined', () => {
      const stateWithoutWitness = {
        ...mockStateCarParked,
        witness: undefined
      };
      const result = createRequestBody(stateWithoutWitness);
      expect(result.witness).toBeUndefined();
      expect(result).not.toHaveProperty('witness');
    });
  });

  describe('Passenger count handling', () => {
    it('should include passengerCount in lossVehicle when provided', () => {
      const stateWithPassengers = {
        ...mockStateCarParked,
        passengerCount: 'two' as any
      };
      const result = createRequestBody(stateWithPassengers);
      expect(result.lossVehicle.passengerCount).toBe('two');
    });

    it('should include otherPartyPassengerCount in incidentSingleOtherVehicle when provided', () => {
      const stateWithOtherPartyPassengers = {
        ...mockStateCarParked,
        otherPartyPassengerCount: 'three' as any
      };
      const result = createRequestBody(stateWithOtherPartyPassengers);
      expect(result.incidentSingleOtherVehicle?.passengerCount).toBe('three');
    });

    it('should include both passengerCount fields when both are provided', () => {
      const stateWithBothPassengerCounts = {
        ...mockStateCarParked,
        passengerCount: 'one' as any,
        otherPartyPassengerCount: 'four' as any
      };
      const result = createRequestBody(stateWithBothPassengerCounts);
      expect(result.lossVehicle.passengerCount).toBe('one');
      expect(result.incidentSingleOtherVehicle?.passengerCount).toBe('four');
    });

    it('should handle passengerCount as undefined when not provided', () => {
      const stateWithoutPassengers = {
        ...mockStateCarParked,
        passengerCount: undefined,
        otherPartyPassengerCount: undefined
      };
      const result = createRequestBody(stateWithoutPassengers);
      expect(result.lossVehicle.passengerCount).toBeUndefined();
      expect(result.incidentSingleOtherVehicle?.passengerCount).toBeUndefined();
    });

    it('should include passengerCount none when explicitly set', () => {
      const stateWithNoPassengers = {
        ...mockStateCarParked,
        passengerCount: 'none' as any,
        otherPartyPassengerCount: 'none' as any
      };
      const result = createRequestBody(stateWithNoPassengers);
      expect(result.lossVehicle.passengerCount).toBe('none');
      expect(result.incidentSingleOtherVehicle?.passengerCount).toBe('none');
    });
  });

  it.todo(
    `returns appropiate request payload for the new fields: other party property damage, number of vehicles involved, other party driver info, other party injury indicator, pedestrian or cyclist involved`,
    () => {}
  );

  describe('Custom vehicle handling', () => {
    it('should default insuredVehicle.year to 1900 instead of NaN/null when the insured vehicle is custom', () => {
      // vehicleInIncident intentionally omits year/make/model, matching CustomVehicle.tsx's dispatch shape,
      // which relies on the same IVehicleOption cast used in reducer.ts.
      const stateWithCustomVehicle = {
        ...mockStateCarParked,
        vehicleInIncident: {
          vehicleTitle: '',
          vin: '',
          customVehicle: { year: 2022, make: 'Subaru', model: 'Outback' }
        } as IVehicleOption
      };

      const result = createRequestBody(stateWithCustomVehicle);

      expect(result.lossVehicle.insuredVehicle.year).toBe(1900);
      expect(result.lossVehicle.insuredVehicle.make).toBe('');
      expect(result.lossVehicle.customVehicle).toEqual({ year: 2022, make: 'Subaru', model: 'Outback' });
    });
  });

  describe('LoginFlowType handling', () => {
    it('should include loginFlowType as BEHIND_LOGIN when present in state', () => {
      const result = createRequestBody(mockStateBehindLogin);
      expect(result.loginFlowType).toBe(LoginFlowType.BEHIND_LOGIN);
    });

    it('should include loginFlowType as ANONYMOUS when present in state', () => {
      const result = createRequestBody(mockStateCarParked);
      expect(result.loginFlowType).toBe(LoginFlowType.ANONYMOUS);
    });

    it('should return appropriate request payload for claim with BEHIND_LOGIN flow type', () => {
      const result = createRequestBody(mockStateCarParkedBehindLogin);
      const expectedResult = JSON.parse(JSON.stringify(submitAutoClaimCarParked));

      expectedResult.lossCause = 'vandalismcomp' as LossCause;
      expectedResult.isTextCommunicationOptIn = true;
      expectedResult.contactInfo.preferredContactMethod = 'himarley';
      expectedResult.incidentOtherNonVehicleParties = 'none' as OtherNonVehicleParties;
      delete expectedResult.incidentOtherVehicleCount;

      expectedResult.incidentSingleOtherVehicle.wasSomeoneDrivingOtherVehicle =
        'unknown' as YesNoUnknown;
      expectedResult.lossVehicle = {
        vehicleDrivenOrParked: 'parked' as CarKineticStatus,
        hadInjuries: YesNoUnknown.Unknown,
        vehicleId: 'someUniqueId1',
        damageDescription: 'some vehicle damage description while parked',
        incidentDriverId: 'someUniqueId3',
        passengerCount: undefined,
        insuredVehicle,
        towed: 'yes'
      };
      expectedResult.lossTime = expectedLossTime;
      expectedResult.sr1_VehicleNumber = 1;
      expectedResult.policyNumber = 'CAA123456789';
      expectedResult.loginFlowType = LoginFlowType.BEHIND_LOGIN;
      expect(result).toEqual(expectedResult);
    });

    it('should handle undefined loginFlowType gracefully', () => {
      const stateWithoutLoginFlowType = {
        ...mockStateCarParked,
        loginFlowType: undefined
      };
      const result = createRequestBody(stateWithoutLoginFlowType);
      expect(result.loginFlowType).toBeUndefined();
      expect(result).not.toHaveProperty('loginFlowType');
    });
  });

  describe('resolvedPolicyNumber handling', () => {
    const conversionResult = {
      isConversionApplicable: true,
      legacyPolicyNumber: 'CAA123456789', // same as mockStateCarParked.policyNumber
      targetPolicyNumber: 'GW-CONVERTED-001',
      targetEffectiveDate: '2025-01-01T00:00:00.000Z'
    };

    it('omits resolvedPolicyNumber when conversionResult is undefined', () => {
      const state = { ...mockStateCarParked, conversionResult: undefined };
      const result = createRequestBody(state);
      expect(result).not.toHaveProperty('resolvedPolicyNumber');
    });

    it('omits resolvedPolicyNumber when conversion is not applicable', () => {
      const state = {
        ...mockStateCarParked,
        conversionResult: { ...conversionResult, isConversionApplicable: false }
      };
      const result = createRequestBody(state);
      expect(result).not.toHaveProperty('resolvedPolicyNumber');
    });

    it('omits resolvedPolicyNumber when loss date is before effective date (uses legacy = policyNumber)', () => {
      const state = {
        ...mockStateCarParked,
        conversionResult,
        lossDateISO: '2024-12-15T10:00:00Z' // before 2025-01-01
      };
      const result = createRequestBody(state);
      // resolveClaimPolicyNumber returns legacyPolicyNumber which equals policyNumber → omitted
      expect(result).not.toHaveProperty('resolvedPolicyNumber');
    });

    it('includes resolvedPolicyNumber as target policy when loss date is on or after effective date', () => {
      const state = {
        ...mockStateCarParked,
        conversionResult,
        lossDateISO: '2025-06-15T10:00:00Z' // after 2025-01-01
      };
      const result = createRequestBody(state);
      expect(result.resolvedPolicyNumber).toBe('GW-CONVERTED-001');
    });

    it('includes resolvedPolicyNumber as target policy exactly on effective date boundary', () => {
      const state = {
        ...mockStateCarParked,
        conversionResult,
        lossDateISO: '2025-01-01T10:00:00Z' // same calendar day as effective
      };
      const result = createRequestBody(state);
      expect(result.resolvedPolicyNumber).toBe('GW-CONVERTED-001');
    });
  });
});
