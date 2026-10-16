import { DateHelper, dtoDeepClone } from '@ace-clublabs/iss-common-util';
import {
  ICachedAutoClaim,
  ISubmitAutoClaimFrontendRequest,
  NotListed,
  PhoneType
} from '@lib/types';
import {
  CarKineticStatus,
  YesNoUnknown,
  YesNo,
  PreferredContactMethod,
  VehicleCount,
  OtherNonVehicleParties,
  PassengerCount,
  LossCause,
  Relationship
} from '@ace-clublabs/iss-common-auto-efnol-models';

import * as BackendRequestMapper from './backendRequestMapper';
import * as CreateAdjusterNote from './createAdjusterNote';
import {
  autoClaimCachedFixture,
  backendRequestMapperReturn,
  submitAutoClaimRequestTestFixture
} from './fixtures';
import * as GetDriverFromCache from './getDriverFromCache';
import * as GetExistingLossDriver from './getExistingLossDriver';
import * as GetVehicleFromCache from './getVehicleFromCache';
import * as ReportHelper from './reporterHelper';
import * as ThirdPartyVehicleHelper from './thirdPartyVehicleHelper';
import * as TransformCacheContacts from './transformCacheContacts';
import * as TransformCacheVehicles from './transformCacheVehicles';
import * as WitnessHelper from './witnessHelper';
import * as commonUtils from '@lib/common-utils';

jest.mock('@lib/common-utils');

const dateHelperObjectsSpy = jest.spyOn(DateHelper, 'createLossDateAndTimeObject');
const createAdjusterNoteSpy = jest.spyOn(CreateAdjusterNote, 'createAdjusterNote');
const getReporterAndRelationshipSpy = jest.spyOn(ReportHelper, 'getReporterAndRelationship');
const getVehicleFromCacheSpy = jest.spyOn(GetVehicleFromCache, 'getVehicleFromCache');
const getDriverFromCacheSpy = jest.spyOn(GetDriverFromCache, 'getDriverFromCache');
const getExistingLossDriverSpy = jest.spyOn(GetExistingLossDriver, 'getExistingLossDriver');
const transformCacheVehiclesSpy = jest.spyOn(TransformCacheVehicles, 'transformCacheVehicles');
const transformCacheContactsSpy = jest.spyOn(TransformCacheContacts, 'transformCacheContacts');
const thirdPartyVehicleHelperSpy = jest.spyOn(ThirdPartyVehicleHelper, 'thirdPartyVehicleHelper');
const witnessHelperSpy = jest.spyOn(WitnessHelper, 'witnessHelper');
const getPolicyConversionDateAllowedSpy = jest.spyOn(commonUtils, 'getPolicyConversionDateAllowed');

describe('createBackendRequest', () => {
  beforeEach(() => {
    dateHelperObjectsSpy.mockImplementation(() => ({
      dateObject: {
        day: 1,
        month: 1,
        year: 1
      },
      timeObject: {
        hour: 1,
        minute: 1,
        second: 0
      }
    }));
    createAdjusterNoteSpy.mockImplementation(() => ({
      subject: 'E/R Material Damage',
      body: `some-mock adjuster note body`
    }));
    getReporterAndRelationshipSpy.mockImplementation(() => ({
      reportedBy: {
        firstName: 'some-mock-reported-by-first-name',
        lastName: 'some-mock-reported-by-last-name',
        tempID: 'some-mock-reported-by-temp-id',
        cellNumber: 'some-mock-reported-by-cell-number',
        primaryPhoneType: 'mobile' as PhoneType,
        emailAddress1: 'some-mock-reported-by-email-address-1',
        publicID: 'reported-by-public-id',
        ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
      },
      relationToInsured: 'other' as Relationship
    }));
    getVehicleFromCacheSpy.mockImplementation(() => ({
      state: 'some-mock-state',
      country: 'some-mock-country',
      year: 1,
      make: 'some-mock-make',
      model: 'some-mock-model',
      policyVehicle: true,
      publicID: 'some-mock-public-id',
      vin: 'some-mock-vin'
    }));
    getDriverFromCacheSpy.mockImplementation(() => ({
      firstName: 'some-mock-first-name',
      lastName: 'some-mock-last-name',
      displayName: 'some-mock-display-name',
      policyRole: 'insured'
    }));
    getExistingLossDriverSpy.mockImplementation(() => ({
      cellNumber: 'reporter-phone',
      ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod,
      emailAddress1: 'reporter-first-name',
      primaryPhoneType: 'mobile',
      firstName: 'some-mock-first-name',
      lastName: 'some-mock-last-name',
      displayName: 'some-mock-display-name',
      policyRole: 'insured',
      publicID: 'some-mock-public-id',
      automatedServiceUpdates_Ext: false,
      ace_EnrolledInHiMarley_Acc: false
    }));
    transformCacheVehiclesSpy.mockImplementation(() => [
      {
        state: 'some-mock-vehicle-state',
        country: 'some-mock-vehicle-country',
        year: 1,
        make: 'some-mock-vehicle-make',
        model: 'some-mock-vehicle-model',
        policyVehicle: true,
        coverages: [
          {
            name: 'some-mock-coverage-name',
            incidentLimit: {
              currency: 'some-mock-currency',
              amount: 1
            }
          }
        ],
        publicID: 'some-mock-public-id',
        vin: 'some-mock-vehicle-vin'
      }
    ]);
    transformCacheContactsSpy.mockImplementation(() => [
      {
        displayName: 'some-mock-contact-display-name',
        publicID: 'some-mock-contact-public-id',
        subtype: 'some-mock-contact-subtype',
        workNumber: 'some-mock-contact-worknumber',
        policyRole: 'some-mock-contact-policy-role',
        primaryAddress: {
          state: 'some-mock-contact-primary-address-state',
          country: 'some-mock-contact-primary-address-country',
          displayName: 'some-mock-contact-primary-address-display-name',
          publicID: 'some-mock-contact-primary-address-public-id',
          county: 'some-mock-contact-primary-address-country',
          addressLine1: 'some-mock-contact-primary-address-adress-line-1',
          city: 'some-mock-contact-primary-address-city',
          postalCode: 'some-mock-contact-primary-address-postal-code',
          addressType: 'some-mock-contact-primary-address-address-type'
        },
        dateOfBirth: 'some-mock-contact-date-of-birth',
        gender: 'some-mock-contact-gender',
        lastName: 'some-mock-contact-last-name',
        firstName: 'some-mock-contact-first-name',
        contactType: 'some-mock-contact-type',
        primaryPhoneType: 'some-mock-conctact-primary-phone-type'
      }
    ]);
    thirdPartyVehicleHelperSpy.mockImplementation(
      () =>
        ({
          vehicle: {
            year: 1,
            make: 'some-mock-vehicle-make',
            model: 'some-mock-vehicle-model',
            country: 'US'
          },
          ace_LossParty: 'third_party',
          ACE_DriverOccupiedType: 'No-Driver'
        } as any)
    );
    witnessHelperSpy.mockImplementation(() => [
      {
        role: 'witness',
        injured: false,
        contact: {
          firstName: 'some-mock-witness-first-name',
          lastName: 'some-mock-witness-last-name',
          cellNumber: 'some-mock-witness-mobile-phone',
          primaryPhoneType: 'mobile'
        }
      }
    ]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it(`should map the front-end request body with cache data when useBackendLossDateAndLossTimeObjects is false`, async () => {
    const result = await BackendRequestMapper.createBackendRequest(
      submitAutoClaimRequestTestFixture,
      autoClaimCachedFixture
    );

    expect(getReporterAndRelationshipSpy).toHaveBeenCalledTimes(1);
    expect(getReporterAndRelationshipSpy).toBeCalledWith(
      submitAutoClaimRequestTestFixture,
      autoClaimCachedFixture
    );
    expect(getVehicleFromCacheSpy).toHaveBeenCalledTimes(1);
    expect(getVehicleFromCacheSpy).toBeCalledWith(
      autoClaimCachedFixture.lobs.personalAuto.vehicles,
      'some-vehicle-id'
    );
    expect(getDriverFromCacheSpy).toHaveBeenCalledTimes(1);
    expect(getDriverFromCacheSpy).toBeCalledWith(
      autoClaimCachedFixture.contacts,
      'some-incident-driver-id-related-to-this-vehicle'
    );
    expect(getExistingLossDriverSpy).toHaveBeenCalledTimes(1);
    expect(getExistingLossDriverSpy).toHaveBeenCalledWith(
      {
        phone: 'reporter-phone',
        email: 'reporter-first-name',
        preferredContactMethod: 'main_email' as PreferredContactMethod
      },
      {
        displayName: 'some-mock-display-name',
        firstName: 'some-mock-first-name',
        lastName: 'some-mock-last-name',
        policyRole: 'insured'
      },
      'reported-by-public-id',
      false
    );
    expect(transformCacheVehiclesSpy).toHaveBeenCalledTimes(1);
    expect(transformCacheVehiclesSpy).toHaveBeenCalledWith(
      autoClaimCachedFixture.lobs.personalAuto.vehicles
    );
    expect(transformCacheContactsSpy).toHaveBeenCalledTimes(1);
    expect(transformCacheContactsSpy).toHaveBeenCalledWith(autoClaimCachedFixture.contacts);
    expect(thirdPartyVehicleHelperSpy).toHaveBeenCalledTimes(1);
    expect(thirdPartyVehicleHelperSpy).toHaveBeenCalledWith(
      submitAutoClaimRequestTestFixture.incidentSingleOtherVehicle
    );
    expect(witnessHelperSpy).toHaveBeenCalledTimes(1);
    expect(witnessHelperSpy).toHaveBeenCalledWith(submitAutoClaimRequestTestFixture.witness);
    expect(createAdjusterNoteSpy).toHaveBeenCalledTimes(1);
    expect(createAdjusterNoteSpy).toHaveBeenCalledWith(
      ' | ',
      'eFNOL',
      submitAutoClaimRequestTestFixture,
      {
        state: 'some-mock-state',
        country: 'some-mock-country',
        year: 1,
        make: 'some-mock-make',
        model: 'some-mock-model',
        policyVehicle: true,
        publicID: 'some-mock-public-id',
        vin: 'some-mock-vin'
      }
    );
    expect(dateHelperObjectsSpy).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      policy: {
        status: 'some-policy-status',
        coverages: [],
        expirationDate: 'some-expiration-date',
        effectiveDate: 'some-effective-date',
        publicID: 'some-public-id',
        policyNumber: 'some-policy-number',
        policyType: 'some-policy-type',
        priorPolicyNumber: 'some-prior-policy',
        lobs: {
          personalAuto: {
            vehicles: [
              {
                state: 'some-vehicle-state',
                country: 'some-vehicle-country',
                year: 1,
                make: 'some-vehicle-make',
                model: 'some-vehicle-model',
                policyVehicle: true,
                coverages: [
                  {
                    name: 'some-coverage-name',
                    incidentLimit: {
                      currency: 'some-currency',
                      amount: 1
                    }
                  }
                ],
                publicID: 'some-public-id',
                vin: 'some-vehicle-vin',
                vehicleId: 'some-lobs-personal-auto-vehicles-vehicleId'
              }
            ]
          }
        }
      },
      contacts: [
        {
          displayName: 'some-mock-contact-display-name',
          publicID: 'some-mock-contact-public-id',
          subtype: 'some-mock-contact-subtype',
          workNumber: 'some-mock-contact-worknumber',
          policyRole: 'some-mock-contact-policy-role',
          primaryAddress: {
            state: 'some-mock-contact-primary-address-state',
            country: 'some-mock-contact-primary-address-country',
            displayName: 'some-mock-contact-primary-address-display-name',
            publicID: 'some-mock-contact-primary-address-public-id',
            county: 'some-mock-contact-primary-address-country',
            addressLine1: 'some-mock-contact-primary-address-adress-line-1',
            city: 'some-mock-contact-primary-address-city',
            postalCode: 'some-mock-contact-primary-address-postal-code',
            addressType: 'some-mock-contact-primary-address-address-type'
          },
          dateOfBirth: 'some-mock-contact-date-of-birth',
          gender: 'some-mock-contact-gender',
          lastName: 'some-mock-contact-last-name',
          firstName: 'some-mock-contact-first-name',
          contactType: 'some-mock-contact-type',
          primaryPhoneType: 'some-mock-conctact-primary-phone-type'
        }
      ],
      lossDate: {
        day: 1,
        month: 1,
        year: 1
      },
      lossTime: {
        hour: 1,
        minute: 1,
        second: 0
      },
      lossType: 'AUTO',
      claimNumber: 'incident-claim-number',
      mainContact: {
        firstName: 'some-mock-reported-by-first-name',
        lastName: 'some-mock-reported-by-last-name',
        tempID: 'some-mock-reported-by-temp-id',
        cellNumber: 'some-mock-reported-by-cell-number',
        primaryPhoneType: 'mobile' as PhoneType,
        emailAddress1: 'some-mock-reported-by-email-address-1',
        publicID: 'reported-by-public-id',
        ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
      },
      lobs: {
        personalAuto: {
          vehicles: [
            {
              state: 'some-mock-vehicle-state',
              country: 'some-mock-vehicle-country',
              year: 1,
              make: 'some-mock-vehicle-make',
              model: 'some-mock-vehicle-model',
              policyVehicle: true,
              coverages: [
                {
                  name: 'some-mock-coverage-name',
                  incidentLimit: {
                    currency: 'some-mock-currency',
                    amount: 1
                  }
                }
              ],
              publicID: 'some-mock-public-id',
              vin: 'some-mock-vehicle-vin'
            }
          ],
          vehicleIncidents: [
            {
              ACE_DriverOccupiedType: 'Known-Driver',
              vehicle: {
                state: 'some-mock-state',
                country: 'some-mock-country',
                year: 1,
                make: 'some-mock-make',
                model: 'some-mock-model',
                policyVehicle: true,
                publicID: 'some-mock-public-id',
                vin: 'some-mock-vin'
              },
              driver: {
                cellNumber: 'reporter-phone',
                ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod,
                emailAddress1: 'reporter-first-name',
                primaryPhoneType: 'mobile',
                firstName: 'some-mock-first-name',
                lastName: 'some-mock-last-name',
                displayName: 'some-mock-display-name',
                policyRole: 'insured',
                publicID: 'some-mock-public-id',
                automatedServiceUpdates_Ext: false,
                ace_EnrolledInHiMarley_Acc: false
              },
              damageDescription: 'some-loss-vehicle-damage-description',
              ace_LossParty: 'insured',
              ace_LossOccured: 'InTransit',
              vehicleTowed: true
            },
            {
              vehicle: {
                year: 1,
                make: 'some-mock-vehicle-make',
                model: 'some-mock-vehicle-model',
                country: 'US'
              },
              ace_LossParty: 'third_party',
              ACE_DriverOccupiedType: 'No-Driver'
            }
          ]
        }
      },
      lossLocation: {
        city: 'incident-loss-location-city',
        state: 'incident-loss-location-state',
        country: 'US'
      },
      description: 'some-valid-incident-loss-description',
      submitClaim: true,
      lossCause: 'othercoll',
      claimReporter: {
        reportedBy: {
          firstName: 'some-mock-reported-by-first-name',
          lastName: 'some-mock-reported-by-last-name',
          tempID: 'some-mock-reported-by-temp-id',
          cellNumber: 'some-mock-reported-by-cell-number',
          primaryPhoneType: 'mobile' as PhoneType,
          emailAddress1: 'some-mock-reported-by-email-address-1',
          publicID: 'reported-by-public-id',
          ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
        },
        relationToInsured: 'other'
      },
      adjusterNote: {
        subject: 'E/R Material Damage',
        body: `some-mock adjuster note body`
      },
      relatedContacts: [
        {
          role: 'witness',
          injured: false,
          contact: {
            firstName: 'some-mock-witness-first-name',
            lastName: 'some-mock-witness-last-name',
            cellNumber: 'some-mock-witness-mobile-phone',
            primaryPhoneType: 'mobile'
          }
        }
      ],
      sr1_VehicleNumber: 1
    });
  });

  it(`should map the front-end request body with cache data when useBackendLossDateAndLossTimeObjects is true`, async () => {
    const result = await BackendRequestMapper.createBackendRequest(
      submitAutoClaimRequestTestFixture,
      autoClaimCachedFixture
    );

    expect(getReporterAndRelationshipSpy).toHaveBeenCalledTimes(1);
    expect(getReporterAndRelationshipSpy).toBeCalledWith(
      submitAutoClaimRequestTestFixture,
      autoClaimCachedFixture
    );
    expect(getVehicleFromCacheSpy).toHaveBeenCalledTimes(1);
    expect(getVehicleFromCacheSpy).toBeCalledWith(
      autoClaimCachedFixture.lobs.personalAuto.vehicles,
      'some-vehicle-id'
    );
    expect(getDriverFromCacheSpy).toHaveBeenCalledTimes(1);
    expect(getDriverFromCacheSpy).toBeCalledWith(
      autoClaimCachedFixture.contacts,
      'some-incident-driver-id-related-to-this-vehicle'
    );
    expect(getExistingLossDriverSpy).toHaveBeenCalledTimes(1);
    expect(getExistingLossDriverSpy).toHaveBeenCalledWith(
      {
        phone: 'reporter-phone',
        email: 'reporter-first-name',
        preferredContactMethod: 'main_email' as PreferredContactMethod
      },
      {
        displayName: 'some-mock-display-name',
        firstName: 'some-mock-first-name',
        lastName: 'some-mock-last-name',
        policyRole: 'insured'
      },
      'reported-by-public-id',
      false
    );
    expect(transformCacheVehiclesSpy).toHaveBeenCalledTimes(1);
    expect(transformCacheVehiclesSpy).toHaveBeenCalledWith(
      autoClaimCachedFixture.lobs.personalAuto.vehicles
    );
    expect(transformCacheContactsSpy).toHaveBeenCalledTimes(1);
    expect(transformCacheContactsSpy).toHaveBeenCalledWith(autoClaimCachedFixture.contacts);
    expect(thirdPartyVehicleHelperSpy).toHaveBeenCalledTimes(1);
    expect(thirdPartyVehicleHelperSpy).toHaveBeenCalledWith(
      submitAutoClaimRequestTestFixture.incidentSingleOtherVehicle
    );
    expect(witnessHelperSpy).toHaveBeenCalledTimes(1);
    expect(witnessHelperSpy).toHaveBeenCalledWith(submitAutoClaimRequestTestFixture.witness);
    expect(createAdjusterNoteSpy).toHaveBeenCalledTimes(1);
    expect(createAdjusterNoteSpy).toHaveBeenCalledWith(
      ' | ',
      'eFNOL',
      submitAutoClaimRequestTestFixture,
      {
        state: 'some-mock-state',
        country: 'some-mock-country',
        year: 1,
        make: 'some-mock-make',
        model: 'some-mock-model',
        policyVehicle: true,
        publicID: 'some-mock-public-id',
        vin: 'some-mock-vin'
      }
    );
    expect(dateHelperObjectsSpy).toHaveBeenCalledTimes(1);
    expect(dateHelperObjectsSpy).toHaveBeenCalledWith('2021-11-11T08:00:00.000Z', '14:05');

    // TODO: update this expectation when refactor is complete.

    expect(result).toEqual({
      policy: {
        status: 'some-policy-status',
        coverages: [],
        expirationDate: 'some-expiration-date',
        effectiveDate: 'some-effective-date',
        publicID: 'some-public-id',
        policyNumber: 'some-policy-number',
        policyType: 'some-policy-type',
        priorPolicyNumber: 'some-prior-policy',
        lobs: {
          personalAuto: {
            vehicles: [
              {
                state: 'some-vehicle-state',
                country: 'some-vehicle-country',
                year: 1,
                make: 'some-vehicle-make',
                model: 'some-vehicle-model',
                policyVehicle: true,
                coverages: [
                  {
                    name: 'some-coverage-name',
                    incidentLimit: {
                      currency: 'some-currency',
                      amount: 1
                    }
                  }
                ],
                publicID: 'some-public-id',
                vin: 'some-vehicle-vin',
                vehicleId: 'some-lobs-personal-auto-vehicles-vehicleId'
              }
            ]
          }
        }
      },
      contacts: [
        {
          displayName: 'some-mock-contact-display-name',
          publicID: 'some-mock-contact-public-id',
          subtype: 'some-mock-contact-subtype',
          workNumber: 'some-mock-contact-worknumber',
          policyRole: 'some-mock-contact-policy-role',
          primaryAddress: {
            state: 'some-mock-contact-primary-address-state',
            country: 'some-mock-contact-primary-address-country',
            displayName: 'some-mock-contact-primary-address-display-name',
            publicID: 'some-mock-contact-primary-address-public-id',
            county: 'some-mock-contact-primary-address-country',
            addressLine1: 'some-mock-contact-primary-address-adress-line-1',
            city: 'some-mock-contact-primary-address-city',
            postalCode: 'some-mock-contact-primary-address-postal-code',
            addressType: 'some-mock-contact-primary-address-address-type'
          },
          dateOfBirth: 'some-mock-contact-date-of-birth',
          gender: 'some-mock-contact-gender',
          lastName: 'some-mock-contact-last-name',
          firstName: 'some-mock-contact-first-name',
          contactType: 'some-mock-contact-type',
          primaryPhoneType: 'some-mock-conctact-primary-phone-type'
        }
      ],
      lossDate: {
        day: 1,
        month: 1,
        year: 1
      },
      lossTime: {
        hour: 1,
        minute: 1,
        second: 0
      },
      lossType: 'AUTO',
      claimNumber: 'incident-claim-number',
      mainContact: {
        firstName: 'some-mock-reported-by-first-name',
        lastName: 'some-mock-reported-by-last-name',
        tempID: 'some-mock-reported-by-temp-id',
        cellNumber: 'some-mock-reported-by-cell-number',
        primaryPhoneType: 'mobile' as PhoneType,
        emailAddress1: 'some-mock-reported-by-email-address-1',
        publicID: 'reported-by-public-id',
        ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
      },
      lobs: {
        personalAuto: {
          vehicles: [
            {
              state: 'some-mock-vehicle-state',
              country: 'some-mock-vehicle-country',
              year: 1,
              make: 'some-mock-vehicle-make',
              model: 'some-mock-vehicle-model',
              policyVehicle: true,
              coverages: [
                {
                  name: 'some-mock-coverage-name',
                  incidentLimit: {
                    currency: 'some-mock-currency',
                    amount: 1
                  }
                }
              ],
              publicID: 'some-mock-public-id',
              vin: 'some-mock-vehicle-vin'
            }
          ],
          vehicleIncidents: [
            {
              ACE_DriverOccupiedType: 'Known-Driver',
              vehicle: {
                state: 'some-mock-state',
                country: 'some-mock-country',
                year: 1,
                make: 'some-mock-make',
                model: 'some-mock-model',
                policyVehicle: true,
                publicID: 'some-mock-public-id',
                vin: 'some-mock-vin'
              },
              driver: {
                cellNumber: 'reporter-phone',
                ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod,
                emailAddress1: 'reporter-first-name',
                primaryPhoneType: 'mobile',
                firstName: 'some-mock-first-name',
                lastName: 'some-mock-last-name',
                displayName: 'some-mock-display-name',
                policyRole: 'insured',
                publicID: 'some-mock-public-id',
                automatedServiceUpdates_Ext: false,
                ace_EnrolledInHiMarley_Acc: false
              },
              damageDescription: 'some-loss-vehicle-damage-description',
              ace_LossParty: 'insured',
              ace_LossOccured: 'InTransit',
              vehicleTowed: true
            },
            {
              vehicle: {
                year: 1,
                make: 'some-mock-vehicle-make',
                model: 'some-mock-vehicle-model',
                country: 'US'
              },
              ace_LossParty: 'third_party',
              ACE_DriverOccupiedType: 'No-Driver'
            }
          ]
        }
      },
      lossLocation: {
        city: 'incident-loss-location-city',
        state: 'incident-loss-location-state',
        country: 'US'
      },
      description: 'some-valid-incident-loss-description',
      submitClaim: true,
      lossCause: 'othercoll',
      claimReporter: {
        reportedBy: {
          firstName: 'some-mock-reported-by-first-name',
          lastName: 'some-mock-reported-by-last-name',
          tempID: 'some-mock-reported-by-temp-id',
          cellNumber: 'some-mock-reported-by-cell-number',
          primaryPhoneType: 'mobile' as PhoneType,
          emailAddress1: 'some-mock-reported-by-email-address-1',
          publicID: 'reported-by-public-id',
          ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
        },
        relationToInsured: 'other'
      },
      adjusterNote: {
        subject: 'E/R Material Damage',
        body: `some-mock adjuster note body`
      },
      relatedContacts: [
        {
          role: 'witness',
          injured: false,
          contact: {
            firstName: 'some-mock-witness-first-name',
            lastName: 'some-mock-witness-last-name',
            cellNumber: 'some-mock-witness-mobile-phone',
            primaryPhoneType: 'mobile'
          }
        }
      ],
      sr1_VehicleNumber: 1
    });
  });

  it(`should map the front-end request body with cache data when useBackendLossDateAndLossTimeObjects is true and lossVehicle is parked`, async () => {
    const result = await BackendRequestMapper.createBackendRequest(
      {
        claimNumber: 'incident-claim-number',
        lossDate: 'incident-loss-date',
        lossTime: 'incident-loss-time',
        contactInfo: {
          phone: 'reporter-phone',
          email: 'reporter-first-name',
          preferredContactMethod: 'main_email' as PreferredContactMethod
        },
        reporter: {
          driverId: 'reporter_not_listed' as NotListed,
          nonListedReporter: {
            firstName: 'reporter-first-name',
            lastName: 'reporter-last-name',
            relationshipToPolicyHolder: 'other' as Relationship
          }
        },
        lossCause: 'parkcollision' as LossCause,
        lossDescription: 'some-valid-incident-loss-description',
        lossLocation: {
          city: 'incident-loss-location-city',
          state: 'incident-loss-location-state',
          streetAddress: 'N/A'
        },
        lossVehicle: {
          vehicleDrivenOrParked: 'parked' as CarKineticStatus,
          vehicleId: 'some-vehicle-id',
          passengerCount: 'three' as PassengerCount,
          hadInjuries: 'yes' as YesNoUnknown,
          towed: 'yes' as YesNoUnknown,
          damageDescription: 'some-loss-vehicle-damage-description',
          incidentDriverId: 'some-incident-driver-id-related-to-this-vehicle',
          insuredVehicle: undefined
        },
        incidentOtherVehicleCount: 'one' as VehicleCount,
        incidentSingleOtherVehicle: {
          wasSomeoneDrivingOtherVehicle: 'yes' as YesNoUnknown,
          vehicleInfo: {
            year: 1,
            make: 'some-vehicle-make',
            model: 'some-vehicle-model'
          },
          insuranceCompany: {
            companyName: 'some-insurance-company-name',
            policyNumber: 'some-insurance-company-policy-number'
          },
          driver: {
            firstName: 'some-driver-first-name',
            lastName: 'some-driver-last-name',
            mobilePhone: 'some-driver-mobile-phone'
          },
          passengerCount: 'two' as PassengerCount,
          hadInjuries: 'yes' as YesNoUnknown
        },
        incidentOtherNonVehicleParties: 'cyclist' as OtherNonVehicleParties,
        witness: {
          firstName: 'some-witness-first-name',
          lastName: 'some-witness-last-name',
          mobilePhone: 'some-witness-mobile-phone'
        },
        hadOtherPropertyDamage: 'no' as YesNo,
        isTextCommunicationOptIn: false,
        sr1_VehicleNumber: 1,
        policyNumber: '',
        isMobileAppAccidentDetection: 'false'
      },
      autoClaimCachedFixture
    );

    expect(result).toEqual({
      policy: {
        status: 'some-policy-status',
        coverages: [],
        expirationDate: 'some-expiration-date',
        effectiveDate: 'some-effective-date',
        publicID: 'some-public-id',
        policyNumber: 'some-policy-number',
        policyType: 'some-policy-type',
        priorPolicyNumber: 'some-prior-policy',
        lobs: {
          personalAuto: {
            vehicles: [
              {
                state: 'some-vehicle-state',
                country: 'some-vehicle-country',
                year: 1,
                make: 'some-vehicle-make',
                model: 'some-vehicle-model',
                policyVehicle: true,
                coverages: [
                  {
                    name: 'some-coverage-name',
                    incidentLimit: {
                      currency: 'some-currency',
                      amount: 1
                    }
                  }
                ],
                publicID: 'some-public-id',
                vin: 'some-vehicle-vin',
                vehicleId: 'some-lobs-personal-auto-vehicles-vehicleId'
              }
            ]
          }
        }
      },
      contacts: [
        {
          displayName: 'some-mock-contact-display-name',
          publicID: 'some-mock-contact-public-id',
          subtype: 'some-mock-contact-subtype',
          workNumber: 'some-mock-contact-worknumber',
          policyRole: 'some-mock-contact-policy-role',
          primaryAddress: {
            state: 'some-mock-contact-primary-address-state',
            country: 'some-mock-contact-primary-address-country',
            displayName: 'some-mock-contact-primary-address-display-name',
            publicID: 'some-mock-contact-primary-address-public-id',
            county: 'some-mock-contact-primary-address-country',
            addressLine1: 'some-mock-contact-primary-address-adress-line-1',
            city: 'some-mock-contact-primary-address-city',
            postalCode: 'some-mock-contact-primary-address-postal-code',
            addressType: 'some-mock-contact-primary-address-address-type'
          },
          dateOfBirth: 'some-mock-contact-date-of-birth',
          gender: 'some-mock-contact-gender',
          lastName: 'some-mock-contact-last-name',
          firstName: 'some-mock-contact-first-name',
          contactType: 'some-mock-contact-type',
          primaryPhoneType: 'some-mock-conctact-primary-phone-type'
        }
      ],
      lossDate: {
        day: 1,
        month: 1,
        year: 1
      },
      lossTime: {
        hour: 1,
        minute: 1,
        second: 0
      },
      lossType: 'AUTO',
      claimNumber: 'incident-claim-number',
      mainContact: {
        firstName: 'some-mock-reported-by-first-name',
        lastName: 'some-mock-reported-by-last-name',
        tempID: 'some-mock-reported-by-temp-id',
        cellNumber: 'some-mock-reported-by-cell-number',
        primaryPhoneType: 'mobile' as PhoneType,
        emailAddress1: 'some-mock-reported-by-email-address-1',
        publicID: 'reported-by-public-id',
        ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
      },
      lobs: {
        personalAuto: {
          vehicles: [
            {
              state: 'some-mock-vehicle-state',
              country: 'some-mock-vehicle-country',
              year: 1,
              make: 'some-mock-vehicle-make',
              model: 'some-mock-vehicle-model',
              policyVehicle: true,
              coverages: [
                {
                  name: 'some-mock-coverage-name',
                  incidentLimit: {
                    currency: 'some-mock-currency',
                    amount: 1
                  }
                }
              ],
              publicID: 'some-mock-public-id',
              vin: 'some-mock-vehicle-vin'
            }
          ],
          vehicleIncidents: [
            {
              ACE_DriverOccupiedType: 'Known-Driver',
              vehicle: {
                state: 'some-mock-state',
                country: 'some-mock-country',
                year: 1,
                make: 'some-mock-make',
                model: 'some-mock-model',
                policyVehicle: true,
                publicID: 'some-mock-public-id',
                vin: 'some-mock-vin'
              },
              driver: {
                cellNumber: 'reporter-phone',
                ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod,
                emailAddress1: 'reporter-first-name',
                primaryPhoneType: 'mobile',
                firstName: 'some-mock-first-name',
                lastName: 'some-mock-last-name',
                displayName: 'some-mock-display-name',
                policyRole: 'insured',
                publicID: 'some-mock-public-id',
                automatedServiceUpdates_Ext: false,
                ace_EnrolledInHiMarley_Acc: false
              },
              damageDescription: 'some-loss-vehicle-damage-description',
              ace_LossParty: 'insured',
              ace_LossOccured: 'Parked',
              vehicleTowed: true
            },
            {
              vehicle: {
                year: 1,
                make: 'some-mock-vehicle-make',
                model: 'some-mock-vehicle-model',
                country: 'US'
              },
              ace_LossParty: 'third_party',
              ACE_DriverOccupiedType: 'No-Driver'
            }
          ]
        }
      },
      lossLocation: {
        city: 'incident-loss-location-city',
        state: 'incident-loss-location-state',
        country: 'US'
      },
      description: 'some-valid-incident-loss-description',
      submitClaim: true,
      lossCause: 'othercoll',
      claimReporter: {
        reportedBy: {
          firstName: 'some-mock-reported-by-first-name',
          lastName: 'some-mock-reported-by-last-name',
          tempID: 'some-mock-reported-by-temp-id',
          cellNumber: 'some-mock-reported-by-cell-number',
          primaryPhoneType: 'mobile' as PhoneType,
          emailAddress1: 'some-mock-reported-by-email-address-1',
          publicID: 'reported-by-public-id',
          ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
        },
        relationToInsured: 'other'
      },
      adjusterNote: {
        subject: 'E/R Material Damage',
        body: `some-mock adjuster note body`
      },
      relatedContacts: [
        {
          role: 'witness',
          injured: false,
          contact: {
            firstName: 'some-mock-witness-first-name',
            lastName: 'some-mock-witness-last-name',
            cellNumber: 'some-mock-witness-mobile-phone',
            primaryPhoneType: 'mobile'
          }
        }
      ],
      sr1_VehicleNumber: 1
    });
  });

  it(`should map the front-end request body with cache data when useBackendLossDateAndLossTimeObjects is true and lossVehicle is parked and is not towed`, async () => {
    const result = await BackendRequestMapper.createBackendRequest(
      {
        claimNumber: 'incident-claim-number',
        lossDate: 'incident-loss-date',
        lossTime: 'incident-loss-time',
        contactInfo: {
          phone: 'reporter-phone',
          email: 'reporter-first-name',
          preferredContactMethod: 'main_email' as PreferredContactMethod
        },
        reporter: {
          driverId: 'reporter_not_listed' as NotListed,
          nonListedReporter: {
            firstName: 'reporter-first-name',
            lastName: 'reporter-last-name',
            relationshipToPolicyHolder: 'other' as Relationship
          }
        },
        lossCause: 'parkcollision' as LossCause,
        lossDescription: 'some-valid-incident-loss-description',
        lossLocation: {
          city: 'incident-loss-location-city',
          state: 'incident-loss-location-state',
          streetAddress: 'N/A'
        },
        lossVehicle: {
          vehicleDrivenOrParked: 'parked' as CarKineticStatus,
          vehicleId: 'some-vehicle-id',
          passengerCount: 'three' as PassengerCount,
          hadInjuries: 'yes' as YesNoUnknown,
          towed: 'no' as YesNoUnknown,
          damageDescription: 'some-loss-vehicle-damage-description',
          incidentDriverId: 'some-incident-driver-id-related-to-this-vehicle',
          insuredVehicle: undefined
        },
        incidentOtherVehicleCount: 'one' as VehicleCount,
        incidentSingleOtherVehicle: {
          wasSomeoneDrivingOtherVehicle: 'yes' as YesNoUnknown,
          vehicleInfo: {
            year: 1,
            make: 'some-vehicle-make',
            model: 'some-vehicle-model'
          },
          insuranceCompany: {
            companyName: 'some-insurance-company-name',
            policyNumber: 'some-insurance-company-policy-number'
          },
          driver: {
            firstName: 'some-driver-first-name',
            lastName: 'some-driver-last-name',
            mobilePhone: 'some-driver-mobile-phone'
          },
          passengerCount: 'two' as PassengerCount,
          hadInjuries: 'yes' as YesNoUnknown
        },
        incidentOtherNonVehicleParties: 'cyclist' as OtherNonVehicleParties,
        witness: {
          firstName: 'some-witness-first-name',
          lastName: 'some-witness-last-name',
          mobilePhone: 'some-witness-mobile-phone'
        },
        hadOtherPropertyDamage: 'no' as YesNo,
        isTextCommunicationOptIn: false,
        sr1_VehicleNumber: 1,
        policyNumber: '',
        isMobileAppAccidentDetection: 'false'
      },
      autoClaimCachedFixture
    );

    expect(result).toEqual({
      policy: {
        status: 'some-policy-status',
        coverages: [],
        expirationDate: 'some-expiration-date',
        effectiveDate: 'some-effective-date',
        publicID: 'some-public-id',
        policyNumber: 'some-policy-number',
        policyType: 'some-policy-type',
        priorPolicyNumber: 'some-prior-policy',
        lobs: {
          personalAuto: {
            vehicles: [
              {
                state: 'some-vehicle-state',
                country: 'some-vehicle-country',
                year: 1,
                make: 'some-vehicle-make',
                model: 'some-vehicle-model',
                policyVehicle: true,
                coverages: [
                  {
                    name: 'some-coverage-name',
                    incidentLimit: {
                      currency: 'some-currency',
                      amount: 1
                    }
                  }
                ],
                publicID: 'some-public-id',
                vin: 'some-vehicle-vin',
                vehicleId: 'some-lobs-personal-auto-vehicles-vehicleId'
              }
            ]
          }
        }
      },
      contacts: [
        {
          displayName: 'some-mock-contact-display-name',
          publicID: 'some-mock-contact-public-id',
          subtype: 'some-mock-contact-subtype',
          workNumber: 'some-mock-contact-worknumber',
          policyRole: 'some-mock-contact-policy-role',
          primaryAddress: {
            state: 'some-mock-contact-primary-address-state',
            country: 'some-mock-contact-primary-address-country',
            displayName: 'some-mock-contact-primary-address-display-name',
            publicID: 'some-mock-contact-primary-address-public-id',
            county: 'some-mock-contact-primary-address-country',
            addressLine1: 'some-mock-contact-primary-address-adress-line-1',
            city: 'some-mock-contact-primary-address-city',
            postalCode: 'some-mock-contact-primary-address-postal-code',
            addressType: 'some-mock-contact-primary-address-address-type'
          },
          dateOfBirth: 'some-mock-contact-date-of-birth',
          gender: 'some-mock-contact-gender',
          lastName: 'some-mock-contact-last-name',
          firstName: 'some-mock-contact-first-name',
          contactType: 'some-mock-contact-type',
          primaryPhoneType: 'some-mock-conctact-primary-phone-type'
        }
      ],
      lossDate: {
        day: 1,
        month: 1,
        year: 1
      },
      lossTime: {
        hour: 1,
        minute: 1,
        second: 0
      },
      lossType: 'AUTO',
      claimNumber: 'incident-claim-number',
      mainContact: {
        firstName: 'some-mock-reported-by-first-name',
        lastName: 'some-mock-reported-by-last-name',
        tempID: 'some-mock-reported-by-temp-id',
        cellNumber: 'some-mock-reported-by-cell-number',
        primaryPhoneType: 'mobile' as PhoneType,
        emailAddress1: 'some-mock-reported-by-email-address-1',
        publicID: 'reported-by-public-id',
        ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
      },
      lobs: {
        personalAuto: {
          vehicles: [
            {
              state: 'some-mock-vehicle-state',
              country: 'some-mock-vehicle-country',
              year: 1,
              make: 'some-mock-vehicle-make',
              model: 'some-mock-vehicle-model',
              policyVehicle: true,
              coverages: [
                {
                  name: 'some-mock-coverage-name',
                  incidentLimit: {
                    currency: 'some-mock-currency',
                    amount: 1
                  }
                }
              ],
              publicID: 'some-mock-public-id',
              vin: 'some-mock-vehicle-vin'
            }
          ],
          vehicleIncidents: [
            {
              ACE_DriverOccupiedType: 'Known-Driver',
              vehicle: {
                state: 'some-mock-state',
                country: 'some-mock-country',
                year: 1,
                make: 'some-mock-make',
                model: 'some-mock-model',
                policyVehicle: true,
                publicID: 'some-mock-public-id',
                vin: 'some-mock-vin'
              },
              driver: {
                cellNumber: 'reporter-phone',
                ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod,
                emailAddress1: 'reporter-first-name',
                primaryPhoneType: 'mobile',
                firstName: 'some-mock-first-name',
                lastName: 'some-mock-last-name',
                displayName: 'some-mock-display-name',
                policyRole: 'insured',
                publicID: 'some-mock-public-id',
                automatedServiceUpdates_Ext: false,
                ace_EnrolledInHiMarley_Acc: false
              },
              damageDescription: 'some-loss-vehicle-damage-description',
              ace_LossParty: 'insured',
              ace_LossOccured: 'Parked',
              vehicleTowed: false
            },
            {
              vehicle: {
                year: 1,
                make: 'some-mock-vehicle-make',
                model: 'some-mock-vehicle-model',
                country: 'US'
              },
              ace_LossParty: 'third_party',
              ACE_DriverOccupiedType: 'No-Driver'
            }
          ]
        }
      },
      lossLocation: {
        city: 'incident-loss-location-city',
        state: 'incident-loss-location-state',
        country: 'US'
      },
      description: 'some-valid-incident-loss-description',
      submitClaim: true,
      lossCause: 'othercoll',
      claimReporter: {
        reportedBy: {
          firstName: 'some-mock-reported-by-first-name',
          lastName: 'some-mock-reported-by-last-name',
          tempID: 'some-mock-reported-by-temp-id',
          cellNumber: 'some-mock-reported-by-cell-number',
          primaryPhoneType: 'mobile' as PhoneType,
          emailAddress1: 'some-mock-reported-by-email-address-1',
          publicID: 'reported-by-public-id',
          ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
        },
        relationToInsured: 'other'
      },
      adjusterNote: {
        subject: 'E/R Material Damage',
        body: `some-mock adjuster note body`
      },
      relatedContacts: [
        {
          role: 'witness',
          injured: false,
          contact: {
            firstName: 'some-mock-witness-first-name',
            lastName: 'some-mock-witness-last-name',
            cellNumber: 'some-mock-witness-mobile-phone',
            primaryPhoneType: 'mobile'
          }
        }
      ],
      sr1_VehicleNumber: 1
    });
  });

  it(`should map the front-end request body with cache data when useBackendLossDateAndLossTimeObjects is true
    and lossVehicle is parked and is not towed and lossCause is park collision
  `, async () => {
    const result = await BackendRequestMapper.createBackendRequest(
      {
        claimNumber: 'incident-claim-number',
        lossDate: 'incident-loss-date',
        lossTime: 'incident-loss-time',
        contactInfo: {
          phone: 'reporter-phone',
          email: 'reporter-first-name',
          preferredContactMethod: 'main_email' as PreferredContactMethod
        },
        reporter: {
          driverId: 'reporter_not_listed' as NotListed,
          nonListedReporter: {
            firstName: 'reporter-first-name',
            lastName: 'reporter-last-name',
            relationshipToPolicyHolder: 'other' as Relationship
          }
        },
        lossCause: 'parkcollision' as LossCause,
        lossDescription: 'some-valid-incident-loss-description',
        lossLocation: {
          city: 'incident-loss-location-city',
          state: 'incident-loss-location-state',
          streetAddress: 'N/A'
        },
        lossVehicle: {
          vehicleDrivenOrParked: 'parked' as CarKineticStatus,
          vehicleId: 'some-vehicle-id',
          passengerCount: 'three' as PassengerCount,
          hadInjuries: 'yes' as YesNoUnknown,
          towed: 'no' as YesNoUnknown,
          damageDescription: 'some-loss-vehicle-damage-description',
          incidentDriverId: 'some-incident-driver-id-related-to-this-vehicle',
          insuredVehicle: undefined
        },
        incidentOtherVehicleCount: 'one' as VehicleCount,
        incidentSingleOtherVehicle: {
          wasSomeoneDrivingOtherVehicle: 'yes' as YesNoUnknown,
          vehicleInfo: {
            year: 1,
            make: 'some-vehicle-make',
            model: 'some-vehicle-model'
          },
          insuranceCompany: {
            companyName: 'some-insurance-company-name',
            policyNumber: 'some-insurance-company-policy-number'
          },
          driver: {
            firstName: 'some-driver-first-name',
            lastName: 'some-driver-last-name',
            mobilePhone: 'some-driver-mobile-phone'
          },
          passengerCount: 'two' as PassengerCount,
          hadInjuries: 'yes' as YesNoUnknown
        },
        incidentOtherNonVehicleParties: 'cyclist' as OtherNonVehicleParties,
        witness: {
          firstName: 'some-witness-first-name',
          lastName: 'some-witness-last-name',
          mobilePhone: 'some-witness-mobile-phone'
        },
        hadOtherPropertyDamage: 'no' as YesNo,
        isTextCommunicationOptIn: false,
        sr1_VehicleNumber: 1,
        policyNumber: '',
        isMobileAppAccidentDetection: 'false'
      },
      autoClaimCachedFixture
    );

    expect(result).toEqual({
      policy: {
        status: 'some-policy-status',
        coverages: [],
        expirationDate: 'some-expiration-date',
        effectiveDate: 'some-effective-date',
        publicID: 'some-public-id',
        policyNumber: 'some-policy-number',
        policyType: 'some-policy-type',
        priorPolicyNumber: 'some-prior-policy',
        lobs: {
          personalAuto: {
            vehicles: [
              {
                state: 'some-vehicle-state',
                country: 'some-vehicle-country',
                year: 1,
                make: 'some-vehicle-make',
                model: 'some-vehicle-model',
                policyVehicle: true,
                coverages: [
                  {
                    name: 'some-coverage-name',
                    incidentLimit: {
                      currency: 'some-currency',
                      amount: 1
                    }
                  }
                ],
                publicID: 'some-public-id',
                vin: 'some-vehicle-vin',
                vehicleId: 'some-lobs-personal-auto-vehicles-vehicleId'
              }
            ]
          }
        }
      },
      contacts: [
        {
          displayName: 'some-mock-contact-display-name',
          publicID: 'some-mock-contact-public-id',
          subtype: 'some-mock-contact-subtype',
          workNumber: 'some-mock-contact-worknumber',
          policyRole: 'some-mock-contact-policy-role',
          primaryAddress: {
            state: 'some-mock-contact-primary-address-state',
            country: 'some-mock-contact-primary-address-country',
            displayName: 'some-mock-contact-primary-address-display-name',
            publicID: 'some-mock-contact-primary-address-public-id',
            county: 'some-mock-contact-primary-address-country',
            addressLine1: 'some-mock-contact-primary-address-adress-line-1',
            city: 'some-mock-contact-primary-address-city',
            postalCode: 'some-mock-contact-primary-address-postal-code',
            addressType: 'some-mock-contact-primary-address-address-type'
          },
          dateOfBirth: 'some-mock-contact-date-of-birth',
          gender: 'some-mock-contact-gender',
          lastName: 'some-mock-contact-last-name',
          firstName: 'some-mock-contact-first-name',
          contactType: 'some-mock-contact-type',
          primaryPhoneType: 'some-mock-conctact-primary-phone-type'
        }
      ],
      lossDate: {
        day: 1,
        month: 1,
        year: 1
      },
      lossTime: {
        hour: 1,
        minute: 1,
        second: 0
      },
      lossType: 'AUTO',
      claimNumber: 'incident-claim-number',
      mainContact: {
        firstName: 'some-mock-reported-by-first-name',
        lastName: 'some-mock-reported-by-last-name',
        tempID: 'some-mock-reported-by-temp-id',
        cellNumber: 'some-mock-reported-by-cell-number',
        primaryPhoneType: 'mobile' as PhoneType,
        emailAddress1: 'some-mock-reported-by-email-address-1',
        publicID: 'reported-by-public-id',
        ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
      },
      lobs: {
        personalAuto: {
          vehicles: [
            {
              state: 'some-mock-vehicle-state',
              country: 'some-mock-vehicle-country',
              year: 1,
              make: 'some-mock-vehicle-make',
              model: 'some-mock-vehicle-model',
              policyVehicle: true,
              coverages: [
                {
                  name: 'some-mock-coverage-name',
                  incidentLimit: {
                    currency: 'some-mock-currency',
                    amount: 1
                  }
                }
              ],
              publicID: 'some-mock-public-id',
              vin: 'some-mock-vehicle-vin'
            }
          ],
          vehicleIncidents: [
            {
              ACE_DriverOccupiedType: 'Known-Driver',
              vehicle: {
                state: 'some-mock-state',
                country: 'some-mock-country',
                year: 1,
                make: 'some-mock-make',
                model: 'some-mock-model',
                policyVehicle: true,
                publicID: 'some-mock-public-id',
                vin: 'some-mock-vin'
              },
              driver: {
                cellNumber: 'reporter-phone',
                ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod,
                emailAddress1: 'reporter-first-name',
                primaryPhoneType: 'mobile',
                firstName: 'some-mock-first-name',
                lastName: 'some-mock-last-name',
                displayName: 'some-mock-display-name',
                policyRole: 'insured',
                publicID: 'some-mock-public-id',
                automatedServiceUpdates_Ext: false,
                ace_EnrolledInHiMarley_Acc: false
              },
              damageDescription: 'some-loss-vehicle-damage-description',
              ace_LossParty: 'insured',
              ace_LossOccured: 'Parked',
              vehicleTowed: false
            },
            {
              vehicle: {
                year: 1,
                make: 'some-mock-vehicle-make',
                model: 'some-mock-vehicle-model',
                country: 'US'
              },
              ace_LossParty: 'third_party',
              ACE_DriverOccupiedType: 'No-Driver'
            }
          ]
        }
      },
      lossLocation: {
        city: 'incident-loss-location-city',
        state: 'incident-loss-location-state',
        country: 'US'
      },
      description: 'some-valid-incident-loss-description',
      submitClaim: true,
      lossCause: 'othercoll',
      claimReporter: {
        reportedBy: {
          firstName: 'some-mock-reported-by-first-name',
          lastName: 'some-mock-reported-by-last-name',
          tempID: 'some-mock-reported-by-temp-id',
          cellNumber: 'some-mock-reported-by-cell-number',
          primaryPhoneType: 'mobile' as PhoneType,
          emailAddress1: 'some-mock-reported-by-email-address-1',
          publicID: 'reported-by-public-id',
          ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
        },
        relationToInsured: 'other'
      },
      adjusterNote: {
        subject: 'E/R Material Damage',
        body: `some-mock adjuster note body`
      },
      relatedContacts: [
        {
          role: 'witness',
          injured: false,
          contact: {
            firstName: 'some-mock-witness-first-name',
            lastName: 'some-mock-witness-last-name',
            cellNumber: 'some-mock-witness-mobile-phone',
            primaryPhoneType: 'mobile'
          }
        }
      ],
      sr1_VehicleNumber: 1
    });
  });

  it(`should map the front-end request body with cache data when useBackendLossDateAndLossTimeObjects is true and LossCause = IMPACTEDWITHANOTHERVEHICLE`, async () => {
    const result = await BackendRequestMapper.createBackendRequest(
      {
        claimNumber: 'incident-claim-number',
        lossDate: 'incident-loss-date',
        lossTime: 'incident-loss-time',
        contactInfo: {
          phone: 'reporter-phone',
          email: 'reporter-first-name',
          preferredContactMethod: 'main_email' as PreferredContactMethod
        },
        reporter: {
          driverId: 'reporter_not_listed' as NotListed,
          nonListedReporter: {
            firstName: 'reporter-first-name',
            lastName: 'reporter-last-name',
            relationshipToPolicyHolder: 'other' as Relationship
          }
        },
        lossCause: 'impactedwithanothervehicle' as LossCause,
        lossDescription: 'some-valid-incident-loss-description',
        lossLocation: {
          city: 'incident-loss-location-city',
          state: 'incident-loss-location-state',
          streetAddress: 'N/A'
        },
        lossVehicle: {
          vehicleDrivenOrParked: 'parked' as CarKineticStatus,
          vehicleId: 'some-vehicle-id',
          passengerCount: 'three' as PassengerCount,
          hadInjuries: 'yes' as YesNoUnknown,
          towed: 'yes' as YesNoUnknown,
          damageDescription: 'some-loss-vehicle-damage-description',
          incidentDriverId: 'some-incident-driver-id-related-to-this-vehicle',
          insuredVehicle: undefined
        },
        incidentOtherVehicleCount: 'one' as VehicleCount,
        incidentSingleOtherVehicle: {
          wasSomeoneDrivingOtherVehicle: 'yes' as YesNoUnknown,
          vehicleInfo: {
            year: 1,
            make: 'some-vehicle-make',
            model: 'some-vehicle-model'
          },
          insuranceCompany: {
            companyName: 'some-insurance-company-name',
            policyNumber: 'some-insurance-company-policy-number'
          },
          driver: {
            firstName: 'some-driver-first-name',
            lastName: 'some-driver-last-name',
            mobilePhone: 'some-driver-mobile-phone'
          },
          passengerCount: 'two' as PassengerCount,
          hadInjuries: 'yes' as YesNoUnknown
        },
        incidentOtherNonVehicleParties: 'cyclist' as OtherNonVehicleParties,
        witness: {
          firstName: 'some-witness-first-name',
          lastName: 'some-witness-last-name',
          mobilePhone: 'some-witness-mobile-phone'
        },
        hadOtherPropertyDamage: 'no' as YesNo,
        isTextCommunicationOptIn: false,
        sr1_VehicleNumber: 1,
        policyNumber: '',
        isMobileAppAccidentDetection: 'false'
      },
      autoClaimCachedFixture
    );

    expect(result).toEqual({
      policy: {
        status: 'some-policy-status',
        coverages: [],
        expirationDate: 'some-expiration-date',
        effectiveDate: 'some-effective-date',
        publicID: 'some-public-id',
        policyNumber: 'some-policy-number',
        policyType: 'some-policy-type',
        priorPolicyNumber: 'some-prior-policy',
        lobs: {
          personalAuto: {
            vehicles: [
              {
                state: 'some-vehicle-state',
                country: 'some-vehicle-country',
                year: 1,
                make: 'some-vehicle-make',
                model: 'some-vehicle-model',
                policyVehicle: true,
                coverages: [
                  {
                    name: 'some-coverage-name',
                    incidentLimit: {
                      currency: 'some-currency',
                      amount: 1
                    }
                  }
                ],
                publicID: 'some-public-id',
                vin: 'some-vehicle-vin',
                vehicleId: 'some-lobs-personal-auto-vehicles-vehicleId'
              }
            ]
          }
        }
      },
      contacts: [
        {
          displayName: 'some-mock-contact-display-name',
          publicID: 'some-mock-contact-public-id',
          subtype: 'some-mock-contact-subtype',
          workNumber: 'some-mock-contact-worknumber',
          policyRole: 'some-mock-contact-policy-role',
          primaryAddress: {
            state: 'some-mock-contact-primary-address-state',
            country: 'some-mock-contact-primary-address-country',
            displayName: 'some-mock-contact-primary-address-display-name',
            publicID: 'some-mock-contact-primary-address-public-id',
            county: 'some-mock-contact-primary-address-country',
            addressLine1: 'some-mock-contact-primary-address-adress-line-1',
            city: 'some-mock-contact-primary-address-city',
            postalCode: 'some-mock-contact-primary-address-postal-code',
            addressType: 'some-mock-contact-primary-address-address-type'
          },
          dateOfBirth: 'some-mock-contact-date-of-birth',
          gender: 'some-mock-contact-gender',
          lastName: 'some-mock-contact-last-name',
          firstName: 'some-mock-contact-first-name',
          contactType: 'some-mock-contact-type',
          primaryPhoneType: 'some-mock-conctact-primary-phone-type'
        }
      ],
      lossDate: {
        day: 1,
        month: 1,
        year: 1
      },
      lossTime: {
        hour: 1,
        minute: 1,
        second: 0
      },
      lossType: 'AUTO',
      claimNumber: 'incident-claim-number',
      mainContact: {
        firstName: 'some-mock-reported-by-first-name',
        lastName: 'some-mock-reported-by-last-name',
        tempID: 'some-mock-reported-by-temp-id',
        cellNumber: 'some-mock-reported-by-cell-number',
        primaryPhoneType: 'mobile' as PhoneType,
        emailAddress1: 'some-mock-reported-by-email-address-1',
        publicID: 'reported-by-public-id',
        ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
      },
      lobs: {
        personalAuto: {
          vehicles: [
            {
              state: 'some-mock-vehicle-state',
              country: 'some-mock-vehicle-country',
              year: 1,
              make: 'some-mock-vehicle-make',
              model: 'some-mock-vehicle-model',
              policyVehicle: true,
              coverages: [
                {
                  name: 'some-mock-coverage-name',
                  incidentLimit: {
                    currency: 'some-mock-currency',
                    amount: 1
                  }
                }
              ],
              publicID: 'some-mock-public-id',
              vin: 'some-mock-vehicle-vin'
            }
          ],
          vehicleIncidents: [
            {
              ACE_DriverOccupiedType: 'Known-Driver',
              vehicle: {
                state: 'some-mock-state',
                country: 'some-mock-country',
                year: 1,
                make: 'some-mock-make',
                model: 'some-mock-model',
                policyVehicle: true,
                publicID: 'some-mock-public-id',
                vin: 'some-mock-vin'
              },
              driver: {
                cellNumber: 'reporter-phone',
                ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod,
                emailAddress1: 'reporter-first-name',
                primaryPhoneType: 'mobile',
                firstName: 'some-mock-first-name',
                lastName: 'some-mock-last-name',
                displayName: 'some-mock-display-name',
                policyRole: 'insured',
                publicID: 'some-mock-public-id',
                automatedServiceUpdates_Ext: false,
                ace_EnrolledInHiMarley_Acc: false
              },
              damageDescription: 'some-loss-vehicle-damage-description',
              ace_LossParty: 'insured',
              ace_LossOccured: 'Parked',
              vehicleTowed: true
            },
            {
              vehicle: {
                year: 1,
                make: 'some-mock-vehicle-make',
                model: 'some-mock-vehicle-model',
                country: 'US'
              },
              ace_LossParty: 'third_party',
              ACE_DriverOccupiedType: 'No-Driver'
            }
          ]
        }
      },
      lossLocation: {
        city: 'incident-loss-location-city',
        state: 'incident-loss-location-state',
        country: 'US'
      },
      description: 'some-valid-incident-loss-description',
      submitClaim: true,
      lossCause: 'othercoll',
      claimReporter: {
        reportedBy: {
          firstName: 'some-mock-reported-by-first-name',
          lastName: 'some-mock-reported-by-last-name',
          tempID: 'some-mock-reported-by-temp-id',
          cellNumber: 'some-mock-reported-by-cell-number',
          primaryPhoneType: 'mobile' as PhoneType,
          emailAddress1: 'some-mock-reported-by-email-address-1',
          publicID: 'reported-by-public-id',
          ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod
        },
        relationToInsured: 'other'
      },
      adjusterNote: {
        subject: 'E/R Material Damage',
        body: `some-mock adjuster note body`
      },
      relatedContacts: [
        {
          role: 'witness',
          injured: false,
          contact: {
            firstName: 'some-mock-witness-first-name',
            lastName: 'some-mock-witness-last-name',
            cellNumber: 'some-mock-witness-mobile-phone',
            primaryPhoneType: 'mobile'
          }
        }
      ],
      sr1_VehicleNumber: 1
    });
  });

  it(`should map customDriver to lossDriverContact when customDriver is provided`, async () => {
    const result = await BackendRequestMapper.createBackendRequest(
      {
        claimNumber: 'incident-claim-number',
        lossDate: 'incident-loss-date',
        lossTime: 'incident-loss-time',
        contactInfo: {
          phone: 'reporter-phone',
          email: 'reporter-email@example.com',
          preferredContactMethod: 'main_email' as PreferredContactMethod
        },
        reporter: {
          driverId: 'reporter_not_listed' as NotListed,
          nonListedReporter: {
            firstName: 'reporter-first-name',
            lastName: 'reporter-last-name',
            relationshipToPolicyHolder: 'other' as Relationship
          }
        },
        lossCause: 'parkcollision' as LossCause,
        lossDescription: 'some-valid-incident-loss-description',
        lossLocation: {
          city: 'incident-loss-location-city',
          state: 'incident-loss-location-state',
          streetAddress: 'N/A'
        },
        lossVehicle: {
          vehicleDrivenOrParked: 'driven' as CarKineticStatus,
          vehicleId: 'some-vehicle-id',
          passengerCount: 'one' as PassengerCount,
          hadInjuries: 'no' as YesNoUnknown,
          towed: 'no' as YesNoUnknown,
          damageDescription: 'some-loss-vehicle-damage-description',
          customDriver: {
            firstName: 'custom-driver-first-name',
            lastName: 'custom-driver-last-name',
            cellPhone: 'custom-driver-phone',
            email: 'custom-driver@example.com'
          },
          insuredVehicle: undefined
        },
        incidentOtherVehicleCount: 'none' as VehicleCount,
        witness: {
          firstName: 'some-witness-first-name',
          lastName: 'some-witness-last-name',
          mobilePhone: 'some-witness-mobile-phone'
        },
        hadOtherPropertyDamage: 'no' as YesNo,
        isTextCommunicationOptIn: true,
        sr1_VehicleNumber: 0,
        policyNumber: '',
        isMobileAppAccidentDetection: 'false',
        incidentOtherNonVehicleParties: OtherNonVehicleParties.Cyclist
      },
      autoClaimCachedFixture
    );

    expect(getExistingLossDriverSpy).toHaveBeenCalledTimes(1);
    expect(getExistingLossDriverSpy).toHaveBeenCalledWith(
      {
        phone: 'reporter-phone',
        email: 'reporter-email@example.com',
        preferredContactMethod: 'main_email' as PreferredContactMethod
      },
      {
        firstName: 'custom-driver-first-name',
        lastName: 'custom-driver-last-name',
        cellNumber: 'custom-driver-phone',
        emailAddress1: 'custom-driver@example.com'
      },
      'reported-by-public-id',
      true
    );
    expect(result.lobs.personalAuto.vehicleIncidents[0].driver).toEqual({
      cellNumber: 'reporter-phone',
      ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod,
      emailAddress1: 'reporter-first-name',
      primaryPhoneType: 'mobile',
      firstName: 'some-mock-first-name',
      lastName: 'some-mock-last-name',
      displayName: 'some-mock-display-name',
      policyRole: 'insured',
      publicID: 'some-mock-public-id',
      automatedServiceUpdates_Ext: false,
      ace_EnrolledInHiMarley_Acc: false
    });
  });

  it(`should not call getDriverFromCache when customDriver is provided and incidentDriverId is undefined`, async () => {
    const result = await BackendRequestMapper.createBackendRequest(
      {
        claimNumber: 'incident-claim-number',
        lossDate: 'incident-loss-date',
        lossTime: 'incident-loss-time',
        contactInfo: {
          phone: 'reporter-phone',
          email: 'reporter-email@example.com',
          preferredContactMethod: 'main_email' as PreferredContactMethod
        },
        reporter: {
          driverId: 'reporter_not_listed' as NotListed,
          nonListedReporter: {
            firstName: 'reporter-first-name',
            lastName: 'reporter-last-name',
            relationshipToPolicyHolder: 'other' as Relationship
          }
        },
        lossCause: 'othercoll' as LossCause,
        lossDescription: 'some-valid-incident-loss-description',
        lossLocation: {
          city: 'incident-loss-location-city',
          state: 'incident-loss-location-state',
          streetAddress: 'N/A'
        },
        lossVehicle: {
          vehicleDrivenOrParked: 'driven' as CarKineticStatus,
          vehicleId: 'some-vehicle-id',
          passengerCount: 'two' as PassengerCount,
          hadInjuries: 'yes' as YesNoUnknown,
          towed: 'no' as YesNoUnknown,
          damageDescription: 'some-loss-vehicle-damage-description',
          customDriver: {
            firstName: 'another-custom-driver-first-name',
            lastName: 'another-custom-driver-last-name',
            cellPhone: 'another-custom-driver-phone',
            email: 'another-custom@example.com'
          },
          insuredVehicle: undefined
        },
        incidentOtherVehicleCount: 'none' as VehicleCount,
        witness: {
          firstName: 'some-witness-first-name',
          lastName: 'some-witness-last-name',
          mobilePhone: 'some-witness-mobile-phone'
        },
        hadOtherPropertyDamage: 'no' as YesNo,
        isTextCommunicationOptIn: false,
        sr1_VehicleNumber: 0,
        policyNumber: '',
        isMobileAppAccidentDetection: 'false',
        incidentOtherNonVehicleParties: OtherNonVehicleParties.Cyclist
      },
      autoClaimCachedFixture
    );

    expect(getDriverFromCacheSpy).toHaveBeenCalledTimes(0);
    expect(getExistingLossDriverSpy).toHaveBeenCalledTimes(1);
    expect(getExistingLossDriverSpy).toHaveBeenCalledWith(
      {
        phone: 'reporter-phone',
        email: 'reporter-email@example.com',
        preferredContactMethod: 'main_email' as PreferredContactMethod
      },
      {
        firstName: 'another-custom-driver-first-name',
        lastName: 'another-custom-driver-last-name',
        cellNumber: 'another-custom-driver-phone',
        emailAddress1: 'another-custom@example.com'
      },
      'reported-by-public-id',
      false
    );
  });

  it(`should map customDriver to lossDriverContact when customDriver is provided and incidentDriverId is undefined`, async () => {
    const result = await BackendRequestMapper.createBackendRequest(
      {
        claimNumber: 'incident-claim-number',
        lossDate: 'incident-loss-date',
        lossTime: 'incident-loss-time',
        contactInfo: {
          phone: 'reporter-phone',
          email: 'reporter-email@example.com',
          preferredContactMethod: 'main_email' as PreferredContactMethod
        },
        reporter: {
          driverId: 'reporter_not_listed' as NotListed,
          nonListedReporter: {
            firstName: 'reporter-first-name',
            lastName: 'reporter-last-name',
            relationshipToPolicyHolder: 'other' as Relationship
          }
        },
        lossCause: 'parkcollision' as LossCause,
        lossDescription: 'some-valid-incident-loss-description',
        lossLocation: {
          city: 'incident-loss-location-city',
          state: 'incident-loss-location-state',
          streetAddress: 'N/A'
        },
        lossVehicle: {
          vehicleDrivenOrParked: 'driven' as CarKineticStatus,
          vehicleId: 'some-vehicle-id',
          passengerCount: 'one' as PassengerCount,
          hadInjuries: 'no' as YesNoUnknown,
          towed: 'no' as YesNoUnknown,
          damageDescription: 'some-loss-vehicle-damage-description',
          incidentDriverId: undefined,
          customDriver: {
            firstName: 'custom-driver-first-name',
            lastName: 'custom-driver-last-name',
            cellPhone: 'custom-driver-phone',
            email: 'custom-driver@example.com'
          },
          insuredVehicle: undefined
        },
        incidentOtherVehicleCount: 'none' as VehicleCount,
        witness: {
          firstName: 'some-witness-first-name',
          lastName: 'some-witness-last-name',
          mobilePhone: 'some-witness-mobile-phone'
        },
        hadOtherPropertyDamage: 'no' as YesNo,
        isTextCommunicationOptIn: true,
        sr1_VehicleNumber: 0,
        policyNumber: '',
        isMobileAppAccidentDetection: 'false',
        incidentOtherNonVehicleParties: OtherNonVehicleParties.Cyclist
      },
      autoClaimCachedFixture
    );

    expect(getDriverFromCacheSpy).toHaveBeenCalledTimes(0);
    expect(getExistingLossDriverSpy).toHaveBeenCalledTimes(1);
    expect(getExistingLossDriverSpy).toHaveBeenCalledWith(
      {
        phone: 'reporter-phone',
        email: 'reporter-email@example.com',
        preferredContactMethod: 'main_email' as PreferredContactMethod
      },
      {
        firstName: 'custom-driver-first-name',
        lastName: 'custom-driver-last-name',
        cellNumber: 'custom-driver-phone',
        emailAddress1: 'custom-driver@example.com'
      },
      'reported-by-public-id',
      true
    );
  });

  it(`should not set lossDriverContact when neither incidentDriverId nor customDriver is provided`, async () => {
    const result = await BackendRequestMapper.createBackendRequest(
      {
        claimNumber: 'incident-claim-number',
        lossDate: 'incident-loss-date',
        lossTime: 'incident-loss-time',
        contactInfo: {
          phone: 'reporter-phone',
          email: 'reporter-email@example.com',
          preferredContactMethod: 'main_email' as PreferredContactMethod
        },
        reporter: {
          driverId: 'reporter_not_listed' as NotListed,
          nonListedReporter: {
            firstName: 'reporter-first-name',
            lastName: 'reporter-last-name',
            relationshipToPolicyHolder: 'other' as Relationship
          }
        },
        lossCause: 'othercoll' as LossCause,
        lossDescription: 'some-valid-incident-loss-description',
        lossLocation: {
          city: 'incident-loss-location-city',
          state: 'incident-loss-location-state',
          streetAddress: 'N/A'
        },
        lossVehicle: {
          vehicleDrivenOrParked: 'driven' as CarKineticStatus,
          vehicleId: 'some-vehicle-id',
          passengerCount: 'two' as PassengerCount,
          hadInjuries: 'yes' as YesNoUnknown,
          towed: 'no' as YesNoUnknown,
          damageDescription: 'some-loss-vehicle-damage-description',
          incidentDriverId: undefined,
          customDriver: undefined,
          insuredVehicle: undefined
        },
        incidentOtherVehicleCount: 'none' as VehicleCount,
        witness: {
          firstName: 'some-witness-first-name',
          lastName: 'some-witness-last-name',
          mobilePhone: 'some-witness-mobile-phone'
        },
        hadOtherPropertyDamage: 'no' as YesNo,
        isTextCommunicationOptIn: false,
        sr1_VehicleNumber: 0,
        policyNumber: '',
        isMobileAppAccidentDetection: 'false',
        incidentOtherNonVehicleParties: OtherNonVehicleParties.Cyclist
      },
      autoClaimCachedFixture
    );

    expect(getDriverFromCacheSpy).toHaveBeenCalledTimes(0);
    expect(getExistingLossDriverSpy).toHaveBeenCalledTimes(0);
    expect(result.lobs.personalAuto.vehicleIncidents[0].driver).toBeUndefined();
  });

  it(`should map the front-end request body with cache data when the postalCode has the hyphen at the end such as '92626-`, async () => {
    getReporterAndRelationshipSpy.mockImplementation(() => ({
      reportedBy: {
        firstName: 'some-mock-reported-by-first-name',
        lastName: 'some-mock-reported-by-last-name',
        tempID: 'some-mock-reported-by-temp-id',
        cellNumber: 'some-mock-reported-by-cell-number',
        primaryPhoneType: 'mobile' as PhoneType,
        emailAddress1: 'some-mock-reported-by-email-address-1',
        publicID: 'reported-by-public-id',
        ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod,
        primaryAddress: {
          state: 'some-mock-contact-primary-address-state',
          country: 'some-mock-contact-primary-address-country',
          displayName: 'some-mock-contact-primary-address-display-name',
          publicID: 'some-mock-contact-primary-address-public-id',
          county: 'some-mock-contact-primary-address-country',
          addressLine1: 'some-mock-contact-primary-address-address-line-1',
          city: 'some-mock-contact-primary-address-city',
          postalCode: '92626',
          addressType: 'some-mock-contact-primary-address-address-type'
        }
      },
      relationToInsured: 'other' as Relationship
    }));

    transformCacheContactsSpy.mockImplementation(() => [
      {
        displayName: 'some-mock-contact-display-name',
        publicID: 'some-mock-contact-public-id',
        subtype: 'some-mock-contact-subtype',
        workNumber: 'some-mock-contact-worknumber',
        policyRole: 'some-mock-contact-policy-role',
        primaryAddress: {
          state: 'some-mock-contact-primary-address-state',
          country: 'some-mock-contact-primary-address-country',
          displayName: 'some-mock-contact-primary-address-display-name',
          publicID: 'some-mock-contact-primary-address-public-id',
          county: 'some-mock-contact-primary-address-country',
          addressLine1: 'some-mock-contact-primary-address-address-line-1',
          city: 'some-mock-contact-primary-address-city',
          postalCode: '92626',
          addressType: 'some-mock-contact-primary-address-address-type'
        },
        dateOfBirth: 'some-mock-contact-date-of-birth',
        gender: 'some-mock-contact-gender',
        lastName: 'some-mock-contact-last-name',
        firstName: 'some-mock-contact-first-name',
        contactType: 'some-mock-contact-type',
        primaryPhoneType: 'some-mock-conctact-primary-phone-type'
      }
    ]);

    let tempAutoClaimCachedFixture = dtoDeepClone(autoClaimCachedFixture);
    tempAutoClaimCachedFixture.mainContact.primaryAddress.postalCode = '92626-';
    tempAutoClaimCachedFixture.contacts[0].primaryAddress.postalCode = '92626-';

    const result = await BackendRequestMapper.createBackendRequest(
      {
        claimNumber: 'incident-claim-number',
        lossDate: 'incident-loss-date',
        lossTime: 'incident-loss-time',
        contactInfo: {
          phone: 'reporter-phone',
          email: 'reporter-first-name',
          preferredContactMethod: 'main_email' as PreferredContactMethod
        },
        reporter: {
          driverId: 'reporter_not_listed' as NotListed,
          nonListedReporter: {
            firstName: 'reporter-first-name',
            lastName: 'reporter-last-name',
            relationshipToPolicyHolder: 'other' as Relationship
          }
        },
        lossCause: 'impactedwithanothervehicle' as LossCause,
        lossDescription: 'some-valid-incident-loss-description',
        lossLocation: {
          city: 'incident-loss-location-city',
          state: 'incident-loss-location-state',
          streetAddress: 'N/A'
        },
        lossVehicle: {
          vehicleDrivenOrParked: 'parked' as CarKineticStatus,
          vehicleId: 'some-vehicle-id',
          passengerCount: 'three' as PassengerCount,
          hadInjuries: 'yes' as YesNoUnknown,
          towed: 'yes' as YesNoUnknown,
          damageDescription: 'some-loss-vehicle-damage-description',
          incidentDriverId: 'some-incident-driver-id-related-to-this-vehicle',
          insuredVehicle: undefined
        },
        incidentOtherVehicleCount: 'one' as VehicleCount,
        incidentSingleOtherVehicle: {
          wasSomeoneDrivingOtherVehicle: 'yes' as YesNoUnknown,
          vehicleInfo: {
            year: 1,
            make: 'some-vehicle-make',
            model: 'some-vehicle-model'
          },
          insuranceCompany: {
            companyName: 'some-insurance-company-name',
            policyNumber: 'some-insurance-company-policy-number'
          },
          driver: {
            firstName: 'some-driver-first-name',
            lastName: 'some-driver-last-name',
            mobilePhone: 'some-driver-mobile-phone'
          },
          passengerCount: 'two' as PassengerCount,
          hadInjuries: 'yes' as YesNoUnknown
        },
        incidentOtherNonVehicleParties: 'cyclist' as OtherNonVehicleParties,
        witness: {
          firstName: 'some-witness-first-name',
          lastName: 'some-witness-last-name',
          mobilePhone: 'some-witness-mobile-phone'
        },
        hadOtherPropertyDamage: 'no' as YesNo,
        isTextCommunicationOptIn: false,
        sr1_VehicleNumber: 1,
        policyNumber: '',
        isMobileAppAccidentDetection: 'false'
      },
      tempAutoClaimCachedFixture
    );

    expect(result).toEqual({
      policy: {
        status: 'some-policy-status',
        coverages: [],
        expirationDate: 'some-expiration-date',
        effectiveDate: 'some-effective-date',
        publicID: 'some-public-id',
        policyNumber: 'some-policy-number',
        policyType: 'some-policy-type',
        priorPolicyNumber: 'some-prior-policy',
        lobs: {
          personalAuto: {
            vehicles: [
              {
                state: 'some-vehicle-state',
                country: 'some-vehicle-country',
                year: 1,
                make: 'some-vehicle-make',
                model: 'some-vehicle-model',
                policyVehicle: true,
                coverages: [
                  {
                    name: 'some-coverage-name',
                    incidentLimit: {
                      currency: 'some-currency',
                      amount: 1
                    }
                  }
                ],
                publicID: 'some-public-id',
                vin: 'some-vehicle-vin',
                vehicleId: 'some-lobs-personal-auto-vehicles-vehicleId'
              }
            ]
          }
        }
      },
      contacts: [
        {
          displayName: 'some-mock-contact-display-name',
          publicID: 'some-mock-contact-public-id',
          subtype: 'some-mock-contact-subtype',
          workNumber: 'some-mock-contact-worknumber',
          policyRole: 'some-mock-contact-policy-role',
          primaryAddress: {
            state: 'some-mock-contact-primary-address-state',
            country: 'some-mock-contact-primary-address-country',
            displayName: 'some-mock-contact-primary-address-display-name',
            publicID: 'some-mock-contact-primary-address-public-id',
            county: 'some-mock-contact-primary-address-country',
            addressLine1: 'some-mock-contact-primary-address-address-line-1',
            city: 'some-mock-contact-primary-address-city',
            postalCode: '92626',
            addressType: 'some-mock-contact-primary-address-address-type'
          },
          dateOfBirth: 'some-mock-contact-date-of-birth',
          gender: 'some-mock-contact-gender',
          lastName: 'some-mock-contact-last-name',
          firstName: 'some-mock-contact-first-name',
          contactType: 'some-mock-contact-type',
          primaryPhoneType: 'some-mock-conctact-primary-phone-type'
        }
      ],
      lossDate: {
        day: 1,
        month: 1,
        year: 1
      },
      lossTime: {
        hour: 1,
        minute: 1,
        second: 0
      },
      lossType: 'AUTO',
      claimNumber: 'incident-claim-number',
      mainContact: {
        firstName: 'some-mock-reported-by-first-name',
        lastName: 'some-mock-reported-by-last-name',
        tempID: 'some-mock-reported-by-temp-id',
        cellNumber: 'some-mock-reported-by-cell-number',
        primaryPhoneType: 'mobile' as PhoneType,
        emailAddress1: 'some-mock-reported-by-email-address-1',
        publicID: 'reported-by-public-id',
        ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod,
        primaryAddress: {
          state: 'some-mock-contact-primary-address-state',
          country: 'some-mock-contact-primary-address-country',
          displayName: 'some-mock-contact-primary-address-display-name',
          publicID: 'some-mock-contact-primary-address-public-id',
          county: 'some-mock-contact-primary-address-country',
          addressLine1: 'some-mock-contact-primary-address-address-line-1',
          city: 'some-mock-contact-primary-address-city',
          postalCode: '92626',
          addressType: 'some-mock-contact-primary-address-address-type'
        }
      },
      lobs: {
        personalAuto: {
          vehicles: [
            {
              state: 'some-mock-vehicle-state',
              country: 'some-mock-vehicle-country',
              year: 1,
              make: 'some-mock-vehicle-make',
              model: 'some-mock-vehicle-model',
              policyVehicle: true,
              coverages: [
                {
                  name: 'some-mock-coverage-name',
                  incidentLimit: {
                    currency: 'some-mock-currency',
                    amount: 1
                  }
                }
              ],
              publicID: 'some-mock-public-id',
              vin: 'some-mock-vehicle-vin'
            }
          ],
          vehicleIncidents: [
            {
              ACE_DriverOccupiedType: 'Known-Driver',
              vehicle: {
                state: 'some-mock-state',
                country: 'some-mock-country',
                year: 1,
                make: 'some-mock-make',
                model: 'some-mock-model',
                policyVehicle: true,
                publicID: 'some-mock-public-id',
                vin: 'some-mock-vin'
              },
              driver: {
                cellNumber: 'reporter-phone',
                ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod,
                emailAddress1: 'reporter-first-name',
                primaryPhoneType: 'mobile',
                firstName: 'some-mock-first-name',
                lastName: 'some-mock-last-name',
                displayName: 'some-mock-display-name',
                policyRole: 'insured',
                publicID: 'some-mock-public-id',
                automatedServiceUpdates_Ext: false,
                ace_EnrolledInHiMarley_Acc: false
              },
              damageDescription: 'some-loss-vehicle-damage-description',
              ace_LossParty: 'insured',
              ace_LossOccured: 'Parked',
              vehicleTowed: true
            },
            {
              vehicle: {
                year: 1,
                make: 'some-mock-vehicle-make',
                model: 'some-mock-vehicle-model',
                country: 'US'
              },
              ace_LossParty: 'third_party',
              ACE_DriverOccupiedType: 'No-Driver'
            }
          ]
        }
      },
      lossLocation: {
        city: 'incident-loss-location-city',
        state: 'incident-loss-location-state',
        country: 'US'
      },
      description: 'some-valid-incident-loss-description',
      submitClaim: true,
      lossCause: 'othercoll',
      claimReporter: {
        reportedBy: {
          firstName: 'some-mock-reported-by-first-name',
          lastName: 'some-mock-reported-by-last-name',
          tempID: 'some-mock-reported-by-temp-id',
          cellNumber: 'some-mock-reported-by-cell-number',
          primaryPhoneType: 'mobile' as PhoneType,
          emailAddress1: 'some-mock-reported-by-email-address-1',
          publicID: 'reported-by-public-id',
          ace_PreferredDeliveryMethod: 'main_email' as PreferredContactMethod,
          primaryAddress: {
            state: 'some-mock-contact-primary-address-state',
            country: 'some-mock-contact-primary-address-country',
            displayName: 'some-mock-contact-primary-address-display-name',
            publicID: 'some-mock-contact-primary-address-public-id',
            county: 'some-mock-contact-primary-address-country',
            addressLine1: 'some-mock-contact-primary-address-address-line-1',
            city: 'some-mock-contact-primary-address-city',
            postalCode: '92626',
            addressType: 'some-mock-contact-primary-address-address-type'
          }
        },
        relationToInsured: 'other'
      },
      adjusterNote: {
        subject: 'E/R Material Damage',
        body: `some-mock adjuster note body`
      },
      relatedContacts: [
        {
          role: 'witness',
          injured: false,
          contact: {
            firstName: 'some-mock-witness-first-name',
            lastName: 'some-mock-witness-last-name',
            cellNumber: 'some-mock-witness-mobile-phone',
            primaryPhoneType: 'mobile'
          }
        }
      ],
      sr1_VehicleNumber: 1
    });
  });

  it.skip(`should call the submit claim api with the HUON policy when GW Policy termEffectiveDate 
    is after 04/01/2024 and  if the Loss Date (user selection) is before the GW policy term effective date 
    for ACMO market`, async () => {
    getPolicyConversionDateAllowedSpy.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const mockAutoClaimCache: ICachedAutoClaim = {
      ...autoClaimCachedFixture,
      policy: {
        ...autoClaimCachedFixture.policy,
        policyNumber: 'AMO12345678',
        priorPolicyNumber: 'MOA12345689',
        effectiveDate: '2024-04-01T00:00:00.000Z'
      }
    };

    const mockSubmitAutoClaim: ISubmitAutoClaimFrontendRequest = {
      ...submitAutoClaimRequestTestFixture,
      lossDate: '2022-10-01T07:00:00.000Z'
    };

    const result = await BackendRequestMapper.createBackendRequest(
      mockSubmitAutoClaim,
      mockAutoClaimCache
    );

    const expectedResult = {
      ...backendRequestMapperReturn,
      policy: {
        ...backendRequestMapperReturn.policy,
        effectiveDate: '2024-04-01T00:00:00.000Z',
        policyNumber: 'MOA12345689',
        priorPolicyNumber: 'MOA12345689'
      },
      sr1_VehicleNumber: 0
    };

    expect(result).toEqual(expectedResult);
  });

  it(`should call the submit claim api with the GuideWire policy when GW Policy termEffectiveDate 
    is after 04/01/2024 and  if the Loss Date (user selection) is AFTER the GW policy term effective date 
    for ACMO market`, async () => {
    getPolicyConversionDateAllowedSpy.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const mockAutoClaimCache: ICachedAutoClaim = {
      ...autoClaimCachedFixture,
      policy: {
        ...autoClaimCachedFixture.policy,
        policyNumber: 'AMO12345678',
        priorPolicyNumber: 'MOA12345689',
        effectiveDate: '2024-04-01T00:00:00.000Z'
      }
    };

    const mockSubmitAutoClaim: ISubmitAutoClaimFrontendRequest = {
      ...submitAutoClaimRequestTestFixture,
      lossDate: '2024-10-01T07:00:00.000Z'
    };

    const result = await BackendRequestMapper.createBackendRequest(
      mockSubmitAutoClaim,
      mockAutoClaimCache
    );

    const expectedResult = {
      ...backendRequestMapperReturn,
      policy: {
        ...backendRequestMapperReturn.policy,
        effectiveDate: '2024-04-01T00:00:00.000Z',
        policyNumber: 'AMO12345678',
        priorPolicyNumber: 'MOA12345689'
      },
      sr1_VehicleNumber: 1
    };

    expect(result).toEqual(expectedResult);
  });

  it.skip(`should call the submit claim api with the HUON policy when GW Policy termEffectiveDate is after 11/01/2024 
      and if the Loss Date (user selection) is BEFORE the GW policy term effective date for Texas market`, async () => {
    getPolicyConversionDateAllowedSpy.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const mockAutoClaimCache: ICachedAutoClaim = {
      ...autoClaimCachedFixture,
      policy: {
        ...autoClaimCachedFixture.policy,
        policyNumber: 'ATX12345689',
        priorPolicyNumber: 'TPA12345689',
        effectiveDate: '2024-11-01T00:00:00.000Z'
      }
    };

    const mockSubmitAutoClaim: ISubmitAutoClaimFrontendRequest = {
      ...submitAutoClaimRequestTestFixture,
      lossDate: '2024-10-30T07:00:00.000Z'
    };

    const result = await BackendRequestMapper.createBackendRequest(
      mockSubmitAutoClaim,
      mockAutoClaimCache
    );

    const expectedResult = {
      ...backendRequestMapperReturn,
      policy: {
        ...backendRequestMapperReturn.policy,
        effectiveDate: '2024-11-01T00:00:00.000Z',
        policyNumber: 'TPA12345689',
        priorPolicyNumber: 'TPA12345689'
      }
    };

    expect(result).toEqual(expectedResult);
  });

  it(`should call the submit claim api with the GuideWire policy when GW Policy termEffectiveDate is after 11/01/2024 
      and if the Loss Date (user selection) is AFTER the GW policy term effective date for Texas market`, async () => {
    getPolicyConversionDateAllowedSpy.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const mockAutoClaimCache: ICachedAutoClaim = {
      ...autoClaimCachedFixture,
      policy: {
        ...autoClaimCachedFixture.policy,
        policyNumber: 'ATX12345689',
        priorPolicyNumber: 'TPA12345689',
        effectiveDate: '2024-11-01T00:00:00.000Z'
      }
    };

    const mockSubmitAutoClaim: ISubmitAutoClaimFrontendRequest = {
      ...submitAutoClaimRequestTestFixture,
      lossDate: '2024-11-05T07:00:00.000Z'
    };

    const result = await BackendRequestMapper.createBackendRequest(
      mockSubmitAutoClaim,
      mockAutoClaimCache
    );

    const expectedResult = {
      ...backendRequestMapperReturn,
      policy: {
        ...backendRequestMapperReturn.policy,
        effectiveDate: '2024-11-01T00:00:00.000Z',
        policyNumber: 'ATX12345689',
        priorPolicyNumber: 'TPA12345689'
      },
      sr1_VehicleNumber: 1
    };

    expect(result).toEqual(expectedResult);
  });

  it(`should call the submit claim api with no otherparty vehicle involved`, async () => {
    getPolicyConversionDateAllowedSpy.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const mockAutoClaimCache: ICachedAutoClaim = {
      ...autoClaimCachedFixture,
      policy: {
        ...autoClaimCachedFixture.policy,
        policyNumber: 'ATX12345689',
        priorPolicyNumber: 'TPA12345689',
        effectiveDate: '2024-11-01T00:00:00.000Z'
      }
    };

    const mockSubmitAutoClaim: ISubmitAutoClaimFrontendRequest = {
      ...submitAutoClaimRequestTestFixture,
      lossDate: '2024-11-05T07:00:00.000Z',
      sr1_VehicleNumber: 0
    };

    const result = await BackendRequestMapper.createBackendRequest(
      mockSubmitAutoClaim,
      mockAutoClaimCache
    );

    const expectedResult = {
      ...backendRequestMapperReturn,
      policy: {
        ...backendRequestMapperReturn.policy,
        effectiveDate: '2024-11-01T00:00:00.000Z',
        policyNumber: 'ATX12345689',
        priorPolicyNumber: 'TPA12345689'
      },
      sr1_VehicleNumber: 0
    };

    expect(result).toEqual(expectedResult);
  });

  it(`should call the submit claim api with two or more otherparty vehicle involved`, async () => {
    getPolicyConversionDateAllowedSpy.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const mockAutoClaimCache: ICachedAutoClaim = {
      ...autoClaimCachedFixture,
      policy: {
        ...autoClaimCachedFixture.policy,
        policyNumber: 'ATX12345689',
        priorPolicyNumber: 'TPA12345689',
        effectiveDate: '2024-11-01T00:00:00.000Z'
      }
    };

    const mockSubmitAutoClaim: ISubmitAutoClaimFrontendRequest = {
      ...submitAutoClaimRequestTestFixture,
      lossDate: '2024-11-05T07:00:00.000Z',
      sr1_VehicleNumber: 2
    };

    const result = await BackendRequestMapper.createBackendRequest(
      mockSubmitAutoClaim,
      mockAutoClaimCache
    );

    const expectedResult = {
      ...backendRequestMapperReturn,
      policy: {
        ...backendRequestMapperReturn.policy,
        effectiveDate: '2024-11-01T00:00:00.000Z',
        policyNumber: 'ATX12345689',
        priorPolicyNumber: 'TPA12345689'
      },
      sr1_VehicleNumber: 2
    };

    expect(result).toEqual(expectedResult);
  });
});
