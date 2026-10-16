import { describe, it, expect } from 'vitest';
import type { IPolicyConversionResult } from '@ace-clublabs/iss-common-shared-claims-models';
import { Dayjs } from '@ace-clublabs/shared-component-library';
import dayjs from 'dayjs';
import { reducer, initialState, State } from './reducer';
import { ACTION_TYPE } from './actions';
import type {
  IAdjuster,
  IAnyWitness,
  IDriverViewModel,
  IIncidentDetailsOptions,
  ISelectedReporter,
  IVehicleOption,
  IVehicleViewModel,
  IYearMakeModel,
  IWeatherDamageOptions,
  IInitialPolicyData,
  AppSource,
  IAccidentDetailsOptions
} from '@lib/types';
import {
  YesNo,
  YesNoUnknown,
  CarKineticStatus,
  LossCause,
  PassengerCount,
  VehicleCount
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { Features } from '@ace-clublabs/feature-flags';
import { LoginFlowType } from '@lib/shared-contracts';
import { ClubCodeValues } from '@lib/utility';
import type {
  IWhenInformation,
  IWhereInformation,
  AutoEFNOLFeatureFlags,
  ISerializedError
} from '../types';
import { SerializedErrorType } from '../types';

describe('reducer', () => {
  describe('SET_PREVIOUS_PAGE', () => {
    it('should set goToPreviousPage in state', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_PREVIOUS_PAGE,
        payload: 'policy-info'
      });
      expect(nextState.goToPreviousPage).toBe('policy-info');
    });
  });

  describe('RESET_PREVIOUS_PAGE', () => {
    it('should reset goToPreviousPage to undefined', () => {
      const stateWithPage = { ...initialState, goToPreviousPage: 'policy-info' };
      const nextState = reducer(stateWithPage, {
        type: ACTION_TYPE.RESET_PREVIOUS_PAGE,
        payload: undefined
      });
      expect(nextState.goToPreviousPage).toBeUndefined();
    });
  });

  describe('SET_POLICY_NUMBER', () => {
    it('should set policyNumber in state', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_POLICY_NUMBER,
        payload: 'POL-123456'
      });
      expect(nextState.policyNumber).toBe('POL-123456');
    });
  });

  describe('SET_TOKEN', () => {
    it('should set token in state', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_TOKEN,
        payload: 'token-abc123'
      });
      expect(nextState.token).toBe('token-abc123');
    });
  });

  describe('SET_WHEN_INFORMATION', () => {
    it('should merge when information into state', () => {
      const whenInfo: IWhenInformation = {
        lossDate: dayjs('2026-05-20'),
        lossTime: '14:30',
        lossDateFormat: 'MM/DD/YYYY'
      };
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_WHEN_INFORMATION,
        payload: whenInfo
      });
      expect(nextState.lossDate).toEqual(whenInfo.lossDate);
      expect(nextState.lossTime).toBe('14:30');
      expect(nextState.lossDateFormat).toBe('MM/DD/YYYY');
    });
  });

  describe('SET_LOSSDATEISO', () => {
    it('should set lossDateISO in state', () => {
      const iso = '2026-05-20T00:00:00.000Z';
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_LOSSDATEISO,
        payload: iso
      });
      expect(nextState.lossDateISO).toBe(iso);
    });
  });

  describe('SET_WHERE_INFORMATION', () => {
    it('should merge where information into state', () => {
      const whereInfo: IWhereInformation = {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        lossLocationDescription: 'Downtown area'
      };
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_WHERE_INFORMATION,
        payload: whereInfo
      });
      expect(nextState.street).toBe('123 Main St');
      expect(nextState.city).toBe('Springfield');
      expect(nextState.state).toBe('IL');
      expect(nextState.zipCode).toBe('62701');
      expect(nextState.lossLocationDescription).toBe('Downtown area');
    });
  });

  describe('SET_CREATE_CLAIM_INFORMATION', () => {
    it('should set claim information with all optional fields', () => {
      const mockDriver: IDriverViewModel = {
        driverId: 'DRV-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        mobileNumber: '5551234567'
      };
      const mockVehicle: IVehicleViewModel = {
        vehicleId: 'VEH-001',
        vin: 'VIN123456',
        year: '2020',
        make: 'Toyota',
        model: 'Camry'
      };
      const mockVehicleOption: IVehicleOption = {
        vehicleId: 'VEH-001',
        vehicleTitle: 'Toyota Camry',
        vin: 'VIN123456',
        year: '2020',
        make: 'Toyota',
        model: 'Camry'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_CREATE_CLAIM_INFORMATION,
        payload: {
          claimNumber: 'CLAIM-001',
          driverSummaries: [mockDriver],
          vehicleSummaries: [mockVehicle],
          vehicleOptions: [mockVehicleOption],
          insuredFullName: 'Jane Doe',
          policyStatus: 'Active',
          policyType: 'Auto',
          policyState: 'CA',
          policyProduct: 'Premium'
        }
      });

      expect(nextState.claimNumber).toBe('CLAIM-001');
      expect(nextState.driverSummaries).toEqual([mockDriver]);
      expect(nextState.vehicleSummaries).toEqual([mockVehicle]);
      expect(nextState.vehicleOptions).toEqual([mockVehicleOption]);
      expect(nextState.insuredFullName).toBe('Jane Doe');
      expect(nextState.policyStatus).toBe('Active');
      expect(nextState.policyType).toBe('Auto');
      expect(nextState.policyState).toBe('CA');
      expect(nextState.policyProduct).toBe('Premium');
    });

    it('should set only required claim information', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_CREATE_CLAIM_INFORMATION,
        payload: { claimNumber: 'CLAIM-002' }
      });
      expect(nextState.claimNumber).toBe('CLAIM-002');
      expect(nextState.driverSummaries).toEqual(initialState.driverSummaries);
      expect(nextState.vehicleSummaries).toEqual(initialState.vehicleSummaries);
    });

    it('should clear stale selections when driverSummaries are refreshed', () => {
      const staleState: Partial<State> = {
        ...initialState,
        selectedDriver: { driverId: 'OLD-DRV', firstName: 'Old', lastName: 'Driver' },
        selectedReporter: { id: 'OLD-RPT', fullName: 'Old Reporter' } as ISelectedReporter,
        vehicleInIncident: {
          vehicleId: 'OLD-VEH',
          vehicleTitle: 'Old Car',
          vin: 'VIN',
          year: '2020',
          make: 'Honda',
          model: 'Civic'
        } as IVehicleOption
      };

      const nextState = reducer(staleState as State, {
        type: ACTION_TYPE.SET_CREATE_CLAIM_INFORMATION,
        payload: {
          claimNumber: 'CLAIM-RETRY',
          driverSummaries: [{ driverId: 'NEW-DRV', firstName: 'New', lastName: 'Driver' }],
          vehicleOptions: [
            {
              vehicleId: 'NEW-VEH',
              vehicleTitle: 'New Car',
              vin: 'VIN2',
              year: '2022',
              make: 'Toyota',
              model: 'Corolla'
            }
          ]
        }
      });

      expect(nextState.selectedDriver).toBeUndefined();
      expect(nextState.selectedReporter).toBeUndefined();
      expect(nextState.vehicleInIncident).toBeUndefined();
      expect(nextState.claimNumber).toBe('CLAIM-RETRY');
      expect(nextState.driverSummaries).toEqual([
        { driverId: 'NEW-DRV', firstName: 'New', lastName: 'Driver' }
      ]);
    });

    it('should not clear selections when only claimNumber is set (no new summaries)', () => {
      const stateWithSelections: Partial<State> = {
        ...initialState,
        selectedDriver: { driverId: 'DRV-001', firstName: 'John', lastName: 'Doe' },
        selectedReporter: { id: 'DRV-001', fullName: 'John Doe' } as ISelectedReporter
      };

      const nextState = reducer(stateWithSelections as State, {
        type: ACTION_TYPE.SET_CREATE_CLAIM_INFORMATION,
        payload: { claimNumber: 'CLAIM-NEW' }
      });

      expect(nextState.selectedDriver).toEqual({
        driverId: 'DRV-001',
        firstName: 'John',
        lastName: 'Doe'
      });
      expect(nextState.selectedReporter).toEqual({ id: 'DRV-001', fullName: 'John Doe' });
    });
  });

  describe('SET_POLICY_INFORMATION', () => {
    it('should set driver, vehicle summaries and options', () => {
      const mockDriver: IDriverViewModel = {
        driverId: 'DRV-001',
        firstName: 'John',
        lastName: 'Doe'
      };
      const mockVehicle: IVehicleViewModel = {
        vehicleId: 'VEH-001',
        vin: 'VIN123456',
        year: '2020',
        make: 'Toyota',
        model: 'Camry'
      };
      const mockOption: IVehicleOption = {
        vehicleId: 'VEH-001',
        vehicleTitle: 'Vehicle 1',
        vin: 'VIN123456',
        year: '2020',
        make: 'Toyota',
        model: 'Camry'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_POLICY_INFORMATION,
        payload: {
          driverSummaries: [mockDriver],
          vehicleSummaries: [mockVehicle],
          vehicleOptions: [mockOption]
        }
      });

      expect(nextState.driverSummaries).toEqual([mockDriver]);
      expect(nextState.vehicleSummaries).toEqual([mockVehicle]);
      expect(nextState.vehicleOptions).toEqual([mockOption]);
    });

    it('should clear stale selections when policy information is refreshed', () => {
      const staleState: Partial<State> = {
        ...initialState,
        selectedDriver: { driverId: 'OLD-DRV', firstName: 'Stale', lastName: 'Driver' },
        selectedReporter: { id: 'OLD-RPT', fullName: 'Stale Reporter' } as ISelectedReporter,
        vehicleInIncident: {
          vehicleId: 'OLD-VEH',
          vehicleTitle: 'Stale Car',
          vin: 'VIN',
          year: '2019',
          make: 'Ford',
          model: 'Focus'
        } as IVehicleOption
      };

      const nextState = reducer(staleState as State, {
        type: ACTION_TYPE.SET_POLICY_INFORMATION,
        payload: {
          driverSummaries: [{ driverId: 'NEW-DRV', firstName: 'Fresh', lastName: 'Driver' }],
          vehicleSummaries: [
            { vehicleId: 'NEW-VEH', vin: 'VIN2', year: '2022', make: 'Kia', model: 'Soul' }
          ],
          vehicleOptions: [
            {
              vehicleId: 'NEW-VEH',
              vehicleTitle: 'Kia Soul',
              vin: 'VIN2',
              year: '2022',
              make: 'Kia',
              model: 'Soul'
            }
          ]
        }
      });

      expect(nextState.selectedDriver).toBeUndefined();
      expect(nextState.selectedReporter).toBeUndefined();
      expect(nextState.vehicleInIncident).toBeUndefined();
    });
  });

  describe('SET_CONTACT_INFO', () => {
    it('should set contact information', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_CONTACT_INFO,
        payload: {
          email: 'user@example.com',
          mobileNumber: '5551234567',
          enableTextCommunication: true,
          enableEmailCommunication: false
        }
      });

      expect(nextState.email).toBe('user@example.com');
      expect(nextState.mobileNumber).toBe('5551234567');
      expect(nextState.enableTextCommunication).toBe(true);
      expect(nextState.enableEmailCommunication).toBe(false);
    });
  });

  describe('SET_CONTACT_INFO_PREFILL', () => {
    it('should prefill contact information', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_CONTACT_INFO_PREFILL,
        payload: {
          email: 'prefill@example.com',
          mobileNumber: '5559876543'
        }
      });

      expect(nextState.email).toBe('prefill@example.com');
      expect(nextState.mobileNumber).toBe('5559876543');
    });
  });

  describe('SET_VEHICLE_IN_INCIDENT', () => {
    it('should set vehicle involved in incident', () => {
      const vehicle: IVehicleOption = {
        vehicleId: 'VEH-001',
        vehicleTitle: 'Toyota Camry',
        vin: 'VIN123456',
        year: '2020',
        make: 'Toyota',
        model: 'Camry'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_VEHICLE_IN_INCIDENT,
        payload: vehicle
      });

      expect(nextState.vehicleInIncident).toEqual(vehicle);
    });
  });

  describe('SET_INCIDENT_DESCRIPTION', () => {
    it('should set incident description', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_INCIDENT_DESCRIPTION,
        payload: 'Minor fender bender in parking lot'
      });

      expect(nextState.incidentDescription).toBe('Minor fender bender in parking lot');
    });
  });

  describe('SET_VEHICLE_PARKED_STATUS', () => {
    it('should set vehicle parked status', () => {
      const status: IIncidentDetailsOptions = {
        code: LossCause.PARKCOLLISION,
        description: 'Parked with engine running'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_VEHICLE_PARKED_STATUS,
        payload: status
      });

      expect(nextState.statusVehicleWhileParked).toEqual(status);
    });
  });

  describe('SET_ANYONE_INJURED', () => {
    it('should set whether anyone was injured', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_ANYONE_INJURED,
        payload: YesNoUnknown.Yes
      });

      expect(nextState.wasAnyoneInjured).toBe(YesNoUnknown.Yes);
    });
  });

  describe('SET_VEHICLE_TOWED', () => {
    it('should set whether vehicle was towed', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_VEHICLE_TOWED,
        payload: YesNoUnknown.No
      });

      expect(nextState.vehicleTowed).toBe(YesNoUnknown.No);
    });
  });

  describe('SET_VEHICLE_DAMAGE', () => {
    it('should set vehicle damage description', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_VEHICLE_DAMAGE,
        payload: 'Dented front bumper'
      });

      expect(nextState.damageDescription).toBe('Dented front bumper');
    });
  });

  describe('SET_OTHER_PARTY_INSURANCE', () => {
    it('should set other party insurance information', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_OTHER_PARTY_INSURANCE,
        payload: {
          otherPartyInsurancePolicyNumber: 'POL-999',
          otherPartyInsuranceCompanyName: 'Other Insurance Co'
        }
      });

      expect(nextState.otherPartyInsurancePolicyNumber).toBe('POL-999');
      expect(nextState.otherPartyInsuranceCompanyName).toBe('Other Insurance Co');
    });
  });

  describe('SET_OTHER_PARTY_PROPERTY_DAMAGE', () => {
    it('should set other party property damage', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_OTHER_PARTY_PROPERTY_DAMAGE,
        payload: { otherPartyPropertyDamage: YesNo.Yes }
      });

      expect(nextState.otherPartyPropertyDamage).toBe(YesNo.Yes);
    });
  });

  describe('RESET_OTHER_PARTY_INSURANCE', () => {
    it('should reset other party insurance information', () => {
      const stateWithInsurance = {
        ...initialState,
        otherPartyInsurancePolicyNumber: 'POL-999',
        otherPartyInsuranceCompanyName: 'Other Insurance Co'
      };

      const nextState = reducer(stateWithInsurance, {
        type: ACTION_TYPE.RESET_OTHER_PARTY_INSURANCE,
        payload: undefined
      });

      expect(nextState.otherPartyInsurancePolicyNumber).toBeUndefined();
      expect(nextState.otherPartyInsuranceCompanyName).toBeUndefined();
    });
  });

  describe('SET_OTHER_PARTY_PEDESTRIAN', () => {
    it('should set other party pedestrian information', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_OTHER_PARTY_PEDESTRIAN,
        payload: { otherPartyPedestriansInvolved: ['Ped-1', 'Ped-2'] }
      });

      expect(nextState.otherPartyPedestriansInvolved).toEqual(['Ped-1', 'Ped-2']);
    });
  });

  describe('RESET_OTHER_PARTY_PEDESTRIAN', () => {
    it('should reset other party pedestrian information', () => {
      const stateWithPedestrians = {
        ...initialState,
        otherPartyPedestriansInvolved: ['Ped-1']
      };

      const nextState = reducer(stateWithPedestrians, {
        type: ACTION_TYPE.RESET_OTHER_PARTY_PEDESTRIAN,
        payload: undefined
      });

      expect(nextState.otherPartyPedestriansInvolved).toBeUndefined();
    });
  });

  describe('SET_OTHER_PARTY_DRIVER_INFORMATION', () => {
    it('should set other party driver information', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_OTHER_PARTY_DRIVER_INFORMATION,
        payload: {
          otherPartyDriverFirstName: 'Jane',
          otherPartyDriverLastName: 'Smith',
          otherPartyDriverMobileNumber: '5559876543'
        }
      });

      expect(nextState.otherPartyDriverFirstName).toBe('Jane');
      expect(nextState.otherPartyDriverLastName).toBe('Smith');
      expect(nextState.otherPartyDriverMobileNumber).toBe('5559876543');
    });
  });

  describe('RESET_OTHER_PARTY_DRIVER_INFORMATION', () => {
    it('should reset other party driver information', () => {
      const stateWithDriver = {
        ...initialState,
        otherPartyDriverFirstName: 'Jane',
        otherPartyDriverLastName: 'Smith',
        otherPartyDriverMobileNumber: '5559876543'
      };

      const nextState = reducer(stateWithDriver, {
        type: ACTION_TYPE.RESET_OTHER_PARTY_DRIVER_INFORMATION,
        payload: undefined
      });

      expect(nextState.otherPartyDriverFirstName).toBeUndefined();
      expect(nextState.otherPartyDriverLastName).toBeUndefined();
      expect(nextState.otherPartyDriverMobileNumber).toBeUndefined();
    });
  });

  describe('SET_OTHER_PARTY_CAR', () => {
    it('should set other party car information', () => {
      const car: IYearMakeModel = {
        year: 2018,
        make: 'Honda',
        model: 'Civic'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_OTHER_PARTY_CAR,
        payload: car
      });

      expect(nextState.otherPartyCar).toEqual(car);
    });
  });

  describe('SET_OTHER_PARTY_ANYONE_INJURED', () => {
    it('should set whether other party anyone injured', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_OTHER_PARTY_ANYONE_INJURED,
        payload: YesNoUnknown.Unknown
      });

      expect(nextState.otherPartyAnyoneInjured).toBe(YesNoUnknown.Unknown);
    });
  });

  describe('SET_VEHICLE_DRIVEN_STATUS', () => {
    it('should set vehicle driven status', () => {
      const status: IIncidentDetailsOptions = {
        code: LossCause.OTHERCOLL,
        description: 'Normal driving'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_VEHICLE_DRIVEN_STATUS,
        payload: status
      });

      expect(nextState.statusVehicleWhileDriven).toEqual(status);
    });
  });

  describe('SET_CLAIMTYPE', () => {
    it('should set claim type', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_CLAIMTYPE,
        payload: 'collision'
      });

      expect(nextState.claimType).toBe('collision');
    });
  });

  describe('RESET_CITY', () => {
    it('should reset city to undefined', () => {
      const stateWithCity = { ...initialState, city: 'Springfield' };
      const nextState = reducer(stateWithCity, {
        type: ACTION_TYPE.RESET_CITY,
        payload: undefined
      });

      expect(nextState.city).toBeUndefined();
    });
  });

  describe('RESET_STATE', () => {
    it('should replace entire state', () => {
      const newState: State = { ...initialState, policyNumber: 'NEW-POL' };
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.RESET_STATE,
        payload: newState
      });

      expect(nextState).toEqual(newState);
      expect(nextState.policyNumber).toBe('NEW-POL');
    });
  });

  describe('SET_WITNESS', () => {
    it('should set witness information', () => {
      const witness: IAnyWitness = {
        selection: YesNoUnknown.Yes,
        witnessInformation: {
          firstName: 'Bob',
          lastName: 'Johnson',
          mobilePhone: '5551111111'
        }
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_WITNESS,
        payload: witness
      });

      expect(nextState.witness).toEqual(witness);
    });
  });

  describe('SET_SELECTED_REPORTER', () => {
    it('should set selected reporter', () => {
      const reporter: ISelectedReporter = {
        id: 'insured',
        fullName: 'John Doe'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_SELECTED_REPORTER,
        payload: reporter
      });

      expect(nextState.selectedReporter).toEqual(reporter);
    });
  });

  describe('SET_CAR_STATUS', () => {
    it('should set car kinetic status', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_CAR_STATUS,
        payload: CarKineticStatus.Parked
      });

      expect(nextState.carStatus).toBe(CarKineticStatus.Parked);
    });
  });

  describe('SET_DRIVER', () => {
    it('should set selected driver', () => {
      const driver: IDriverViewModel = {
        driverId: 'DRV-001',
        firstName: 'John',
        lastName: 'Doe'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_DRIVER,
        payload: driver
      });

      expect(nextState.selectedDriver).toEqual(driver);
    });
  });

  describe('SET_SUBMIT_CLAIM_INFORMATION', () => {
    it('should set adjuster information', () => {
      const adjuster: IAdjuster = {
        displayName: 'John Smith',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@adjuster.com',
        phoneNumber: '5551234567'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_SUBMIT_CLAIM_INFORMATION,
        payload: adjuster
      });

      expect(nextState.adjuster).toEqual(adjuster);
    });
  });

  describe('SET_CLAIM_SUBMITTED_FOR_CLAIM_NUMBER', () => {
    it('should set claim submitted for claim number', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_CLAIM_SUBMITTED_FOR_CLAIM_NUMBER,
        payload: 'CLAIM-123'
      });

      expect(nextState.claimSubmittedForClaimNumber).toBe('CLAIM-123');
    });
  });

  describe('SET_IS_REVIEW', () => {
    it('should set review flag', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_IS_REVIEW,
        payload: true
      });

      expect(nextState.isReview).toBe(true);
    });
  });

  describe('SET_CLUB_CODE', () => {
    it('should set club code', () => {
      const clubCodeValue = 'AAA' as unknown as ClubCodeValues;
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_CLUB_CODE,
        payload: clubCodeValue
      });

      expect(nextState.clubCode).toBe(clubCodeValue);
    });

    it('should set club code to undefined', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_CLUB_CODE,
        payload: undefined
      });

      expect(nextState.clubCode).toBeUndefined();
    });
  });

  describe('SET_EXPIRATION_DATE', () => {
    it('should set expiration date', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_EXPIRATION_DATE,
        payload: '2026-12-31'
      });

      expect(nextState.expirationDate).toBe('2026-12-31');
    });
  });

  describe('SET_EFFECTIVE_DATE', () => {
    it('should set effective date', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_EFFECTIVE_DATE,
        payload: '2026-01-01'
      });

      expect(nextState.effectiveDate).toBe('2026-01-01');
    });
  });

  describe('SET_NUMBER_OF_VEHICLES_INVOLVED', () => {
    it('should set number of vehicles involved', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_NUMBER_OF_VEHICLES_INVOLVED,
        payload: VehicleCount.One
      });

      expect(nextState.numberOfVehiclesInvolved).toBe(VehicleCount.One);
    });
  });

  describe('SET_KNOCKOUT_REASON', () => {
    it('should set knockout reason', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_KNOCKOUT_REASON,
        payload: 'policy_expired'
      });

      expect(nextState.knockoutReason).toBe('policy_expired');
    });
  });

  describe('SET_DRIVER_NOT_LISTED_BACK_NAV', () => {
    it('should set driver not listed back navigation', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_DRIVER_NOT_LISTED_BACK_NAV,
        payload: 'passengers'
      });

      expect(nextState.driverNotListedBackNav).toBe('passengers');
    });
  });

  describe('SET_ERROR_REASON', () => {
    it('should set error reason', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_ERROR_REASON,
        payload: 'server_error'
      });

      expect(nextState.errorReason).toBe('server_error');
    });
  });

  describe('SET_VEHICLE_WEATHER_DAMAGE', () => {
    it('should set vehicle weather damage', () => {
      const weatherDamage: IWeatherDamageOptions = {
        code: LossCause.HAILCOMP,
        description: 'Hail damage'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_VEHICLE_WEATHER_DAMAGE,
        payload: weatherDamage
      });

      expect(nextState.vehicleDamageWeather).toEqual(weatherDamage);
    });
  });

  describe('RESET_VEHICLE_WEATHER_DAMAGE', () => {
    it('should reset vehicle weather damage', () => {
      const stateWithWeatherDamage: State = {
        ...initialState,
        vehicleDamageWeather: { code: LossCause.HAILCOMP, description: 'Hail damage' }
      };

      const nextState = reducer(stateWithWeatherDamage, {
        type: ACTION_TYPE.RESET_VEHICLE_WEATHER_DAMAGE,
        payload: undefined
      });

      expect(nextState.vehicleDamageWeather).toBeUndefined();
    });
  });

  describe('SET_PRIOR_POLICY_NUMBER', () => {
    it('should set prior policy number', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_PRIOR_POLICY_NUMBER,
        payload: 'PRIOR-POL-001'
      });

      expect(nextState.priorPolicyNumber).toBe('PRIOR-POL-001');
    });
  });

  describe('GET_CREATE_CLAIM_INFORMATION', () => {
    it('should set claim information from get response', () => {
      const adjuster: IAdjuster = {
        displayName: 'Jane Smith',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@adjuster.com',
        phoneNumber: '5559876543'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.GET_CREATE_CLAIM_INFORMATION,
        payload: {
          claimNumber: 'CLAIM-GET-001',
          duplicatedClaim: true,
          adjuster: adjuster
        }
      });

      expect(nextState.claimNumber).toBe('CLAIM-GET-001');
      expect(nextState.duplicatedClaim).toBe(true);
      expect(nextState.adjuster).toEqual(adjuster);
    });
  });

  describe('SET_IS_MOBILE_APP_ACCIDENT_DETECTION', () => {
    it('should set mobile app accident detection flag', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_IS_MOBILE_APP_ACCIDENT_DETECTION,
        payload: 'true'
      });

      expect(nextState.isMobileAppAccidentDetection).toBe('true');
    });
  });

  describe('SET_CRASH_DATE_PREDICTION', () => {
    it('should set crash date prediction', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_CRASH_DATE_PREDICTION,
        payload: '2026-05-20T14:30:00Z'
      });

      expect(nextState.dateOfCrashPrediction).toBe('2026-05-20T14:30:00Z');
    });
  });

  describe('SET_REPORTED_DATE', () => {
    it('should set reported date', () => {
      const reportedDate: Dayjs = dayjs('2026-05-21');
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_REPORTED_DATE,
        payload: reportedDate
      });

      expect(nextState.reportedDate).toEqual(reportedDate);
    });
  });

  describe('SET_LOGIN_FLOW_TYPE', () => {
    it('should set login flow type', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_LOGIN_FLOW_TYPE,
        payload: 'behind-login' as LoginFlowType
      });

      expect(nextState.loginFlowType).toBe('behind-login');
    });
  });

  describe('SET_INITIAL_POLICY_DATA_BEHIND_LOGIN', () => {
    it('should set initial policy data for behind login flow', () => {
      const policyData: IInitialPolicyData = {
        policy: 'POL-BL-001',
        claim: '',
        clubCode: '004',
        mode: 'anonymous',
        EnableSplash: false,
        ERSURL: ''
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_INITIAL_POLICY_DATA_BEHIND_LOGIN,
        payload: policyData
      });

      expect(nextState.initialPolicyDataBehindLogin).toEqual(policyData);
    });
  });

  describe('SET_POLICY_PREFIX', () => {
    it('should set policy prefix', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_POLICY_PREFIX,
        payload: 'AC'
      });

      expect(nextState.policyPrefix).toBe('AC');
    });
  });

  describe('SET_IS_ANONYMOUS', () => {
    it('should set anonymous flag', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_IS_ANONYMOUS,
        payload: false
      });

      expect(nextState.isAnonymous).toBe(false);
    });
  });

  describe('SET_POLICY_GUID', () => {
    it('should set policy GUID', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_POLICY_GUID,
        payload: 'guid-12345'
      });

      expect(nextState.policyGuid).toBe('guid-12345');
    });
  });

  describe('SET_AREA', () => {
    it('should set area', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_AREA,
        payload: 'downtown'
      });

      expect(nextState.area).toBe('downtown');
    });
  });

  describe('SET_SPLASH_START', () => {
    it('should set splash start time', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_SPLASH_START,
        payload: '2026-05-20T14:00:00Z'
      });

      expect(nextState.splashStart).toBe('2026-05-20T14:00:00Z');
    });
  });

  describe('SET_SPLASH_END', () => {
    it('should set splash end time', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_SPLASH_END,
        payload: '2026-05-20T14:30:00Z'
      });

      expect(nextState.splashEnd).toBe('2026-05-20T14:30:00Z');
    });
  });

  describe('SET_SOURCE_APP', () => {
    it('should set source app', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_SOURCE_APP,
        payload: 'myaccount' as AppSource
      });

      expect(nextState.sourceApp).toBe('myaccount');
    });

    it('should set source app to undefined', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_SOURCE_APP,
        payload: undefined
      });

      expect(nextState.sourceApp).toBeUndefined();
    });
  });

  describe('SET_CLAIMS_VIEW_GUID', () => {
    it('should set claims view GUID', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_CLAIMS_VIEW_GUID,
        payload: 'claims-guid-001'
      });

      expect(nextState.claimsViewGuid).toBe('claims-guid-001');
    });
  });

  describe('SET_PASSENGER_COUNT', () => {
    it('should set passenger count', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_PASSENGER_COUNT,
        payload: PassengerCount.Two
      });

      expect(nextState.passengerCount).toBe(PassengerCount.Two);
    });
  });

  describe('SET_OTHER_PARTY_PASSENGER_COUNT', () => {
    it('should set other party passenger count', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_OTHER_PARTY_PASSENGER_COUNT,
        payload: PassengerCount.Three
      });

      expect(nextState.otherPartyPassengerCount).toBe(PassengerCount.Three);
    });
  });

  describe('SET_LOSS_CAUSE', () => {
    it('should set loss cause', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_LOSS_CAUSE,
        payload: 'collision' as LossCause
      });

      expect(nextState.lossCause).toBe('collision');
    });
  });

  describe('SET_ACCIDENT_DETAILS_WHILE_DRIVEN', () => {
    it('should set accident details while driven', () => {
      const details: IAccidentDetailsOptions = {
        code: LossCause.FIXEDCOLL,
        description: 'Frontal collision'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_ACCIDENT_DETAILS_WHILE_DRIVEN,
        payload: details
      });

      expect(nextState.accidentDetailsWhileDriven).toEqual(details);
    });
  });

  describe('RESET_ACCIDENT_DETAILS_WHILE_DRIVEN', () => {
    it('should reset accident details while driven', () => {
      const stateWithDetails: State = {
        ...initialState,
        accidentDetailsWhileDriven: {
          code: LossCause.FIXEDCOLL,
          description: 'Frontal collision'
        }
      };

      const nextState = reducer(stateWithDetails, {
        type: ACTION_TYPE.RESET_ACCIDENT_DETAILS_WHILE_DRIVEN,
        payload: undefined
      });

      expect(nextState.accidentDetailsWhileDriven).toBeUndefined();
    });
  });

  describe('RESET_VEHICLE_DRIVEN_STATUS', () => {
    it('should reset vehicle driven status', () => {
      const stateWithStatus: State = {
        ...initialState,
        statusVehicleWhileDriven: {
          code: LossCause.OTHERCOLL,
          description: 'Normal driving'
        }
      };

      const nextState = reducer(stateWithStatus, {
        type: ACTION_TYPE.RESET_VEHICLE_DRIVEN_STATUS,
        payload: undefined
      });

      expect(nextState.statusVehicleWhileDriven).toBeUndefined();
    });
  });

  describe('SET_AUTO_EFNOL_FEATURE_FLAGS', () => {
    it('should set auto EFNOL feature flags', () => {
      const flags: AutoEFNOLFeatureFlags = {
        [Features.AutoEFNOLCustomVehicle]: true,
        [Features.AutoEFNOLCustomReporter]: false,
        [Features.AutoEFNOLCustomDriver]: true,
        [Features.AutoEFNOLEnableWInsurance]: false
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_AUTO_EFNOL_FEATURE_FLAGS,
        payload: flags
      });

      expect(nextState.autoEFNOLFeatureFlags).toEqual(flags);
    });
  });

  describe('SET_SERIALIZED_ERROR', () => {
    it('should set serialized error', () => {
      const error: ISerializedError = {
        errorType: SerializedErrorType.api,
        errorLabel: 'API Error',
        errorMessage: 'An error occurred',
        errorCode: 'ERROR_001',
        errorLocation: 'reducer.test'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_SERIALIZED_ERROR,
        payload: error
      });

      expect(nextState.serializedError).toEqual(error);
    });
  });

  describe('SET_CONVERSION_RESULT', () => {
    it('should set conversionResult in state', () => {
      const conversionResult: IPolicyConversionResult = {
        isConversionApplicable: true,
        legacyPolicyNumber: 'LEGACY-001',
        targetPolicyNumber: 'GW-001',
        targetEffectiveDate: '2026-07-01T00:00:00.000Z'
      };

      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_CONVERSION_RESULT,
        payload: conversionResult
      });

      expect(nextState.conversionResult).toEqual(conversionResult);
    });

    it('should not mutate other state fields when setting conversionResult', () => {
      const conversionResult: IPolicyConversionResult = {
        isConversionApplicable: false,
        legacyPolicyNumber: 'LEGACY-002',
        targetPolicyNumber: 'GW-002'
      };
      const stateWithPolicy = { ...initialState, policyNumber: 'POLICY-123' };

      const nextState = reducer(stateWithPolicy, {
        type: ACTION_TYPE.SET_CONVERSION_RESULT,
        payload: conversionResult
      });

      expect(nextState.policyNumber).toBe('POLICY-123');
      expect(nextState.conversionResult).toEqual(conversionResult);
    });
  });

  describe('initialState', () => {
    it('should have expected initial values', () => {
      expect(initialState.isReview).toBe(false);
      expect(initialState.isAnonymous).toBe(true);
      expect(initialState.driverSummaries).toEqual([]);
      expect(initialState.vehicleSummaries).toEqual([]);
      expect(initialState.conversionResult).toBeUndefined();
    });
  });

  describe('SET_BRAND', () => {
    it('should set brand to WInsurance', () => {
      const nextState = reducer(initialState, {
        type: ACTION_TYPE.SET_BRAND,
        payload: 'WInsurance'
      });
      expect(nextState.brand).toBe('WInsurance');
    });

    it('should set brand to AAA', () => {
      const stateWithWInsurance = { ...initialState, brand: 'WInsurance' as const };
      const nextState = reducer(stateWithWInsurance, {
        type: ACTION_TYPE.SET_BRAND,
        payload: 'AAA'
      });
      expect(nextState.brand).toBe('AAA');
    });

    it('should default brand to AAA in initialState', () => {
      expect(initialState.brand).toBe('AAA');
    });
  });

  describe('invalid action', () => {
    it('should throw error for unsupported action type', () => {
      expect(() => {
        reducer(initialState, {
          type: 'UNSUPPORTED_ACTION',
          payload: undefined
        });
      }).toThrow('Action not supported');
    });
  });
});
