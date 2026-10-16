import {
  CarKineticStatus,
  ICachedAutoClaim,
  ICachedAutoVehicle,
  ISubmitAutoClaimFrontendRequest,
  NotListed,
  PhoneType
} from '@lib/types';
import {
  LossCause,
  LossType,
  OtherNonVehicleParties,
  PassengerCount,
  PreferredContactMethod,
  Relationship,
  VehicleCount,
  YesNo,
  YesNoUnknown
} from '@ace-clublabs/iss-common-auto-efnol-models';

export const submitAutoClaimRequestTestFixture: ISubmitAutoClaimFrontendRequest = {
  claimNumber: 'incident-claim-number',
  lossDate: '2021-11-11T08:00:00.000Z',
  lossTime: '14:05',
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
  lossCause: 'othercoll' as LossCause,
  lossDescription: 'some-valid-incident-loss-description',
  lossLocation: {
    city: 'incident-loss-location-city',
    state: 'incident-loss-location-state',
    streetAddress: 'N/A'
  },
  lossVehicle: {
    vehicleDrivenOrParked: 'beingDriven' as CarKineticStatus,
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
};

export const autoClaimCachedFixture: ICachedAutoClaim = {
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
        ] as ICachedAutoVehicle[]
      }
    }
  },
  publicID: 'some-public-id',
  contacts: [
    {
      displayName: 'some-contact-display-name',
      publicID: 'some-contact-public-id',
      subtype: 'some-contact-subtype',
      workNumber: 'some-contact-worknumber',
      policyRole: 'some-contact-policy-role',
      primaryAddress: {
        state: 'some-contact-primary-address-state',
        country: 'some-contact-primary-address-country',
        displayName: 'some-contact-primary-address-display-name',
        publicID: 'some-contact-primary-address-public-id',
        county: 'some-contact-primary-address-country',
        addressLine1: 'some-contact-primary-address-adress-line-1',
        city: 'some-contact-primary-address-city',
        postalCode: 'some-contact-primary-address-postal-code',
        addressType: 'some-contact-primary-address-address-type'
      },
      dateOfBirth: 'some-contact-date-of-birth',
      gender: 'some-contact-gender',
      lastName: 'some-contact-last-name',
      firstName: 'some-contact-first-name',
      contactType: 'some-contact-type',
      primaryPhoneType: 'some-conctact-primary-phone-type',
      contactId: 'some-contact-id'
    }
  ],
  lossDate: {
    year: 2024,
    month: 1,
    day: 1
  },
  lossTime: {
    hour: 59,
    minute: 1,
    second: 1
  },
  lossType: 'AUTO' as LossType,
  claimNumber: 'some-claim-number',
  predefinedLossLocations: [
    {
      state: 'some-predefined-loss-location-state',
      country: 'some-predefined-loss-location-country',
      displayName: 'some-predefined-loss-location-display-name',
      publicID: 'some-predefined-loss-location-public-id',
      county: 'some-predefined-loss-location-country',
      addressLine1: 'some-predefined-loss-location-address-line-1',
      city: 'some-predefined-loss-location-city',
      postalCode: 'some-predefined-loss-location-postal-code',
      addressType: 'some-predefined-loss-location-address-type'
    }
  ],
  lossCause: 'othercomp' as LossCause,
  mainContact: {
    displayName: 'some-main-contact-display-name',
    primaryPhoneType: 'home' as PhoneType,
    emailAddress1: 'some-main-contact-email-address-1',
    publicID: 'some-main-contact-public-id',
    primaryAddress: {
      state: 'some-main-contact-primary-address-state',
      country: 'some-main-contact-primary-address-country',
      displayName: 'some-main-contact-primary-address-display-name',
      publicID: 'some-main-contact-primary-address-public-id',
      county: 'some-main-contact-primary-address-country',
      addressLine1: 'some-main-contact-primary-address-address-line-1',
      city: 'some-main-contact-primary-address-city',
      postalCode: 'some-main-contact-primary-address-postal-code',
      addressType: 'some-main-contact-primary-address-address-tyype'
    },
    subtype: 'some-main-contact-subtype',
    workNumber: 'some-main-contact-work-number',
    policyRole: 'some-main-contact-policy-role',
    dateOfBirth: 'some-main-contact-date-of-birth',
    gender: 'some-main-contact-gender',
    lastName: 'some-main-contact-last-name',
    firstName: 'some-main-contact-first-name',
    contactType: 'some-main-contact-contact-type',
    homeNumber: 'some-main-contact-home-number'
  },
  lobs: {
    personalAuto: {
      vehicles: [
        {
          state: 'some-lob-personal-auto-vehicle-state',
          country: 'some-lob-personal-auto-vehicle-contry',
          year: 1,
          make: 'some-lob-personal-auto-vehicle-make',
          model: 'some-lob-personal-auto-vehicle-model',
          policyVehicle: true,
          publicID: 'some-lob-personal-auto-vehicle-state',
          vin: 'some-lob-personal-auto-vehicle-vin',
          vehicleId: 'some-lob-personal-auto-vehicle-vehicle-id',
          coverages: [
            {
              name: 'some-lob-personal-auto-vehicle-state-coverage-name',
              incidentLimit: {
                currency: 'some-lob-personal-auto-vehicle-coverage-incident-limit-currency',
                amount: 50000
              }
            }
          ]
        }
      ],
      vehicleIncidents: []
    }
  },
  canUploadDocument: false,
  lossLocation: {
    city: 'some-loss-location-city',
    state: 'some-loss-location-state',
    country: 'some-loss-location-country',
    addressLine1: 'some-loss-location-address-line-1'
  },
  description: 'some-description',
  ace_NotificationOnly: false
};

export const backendRequestMapperReturn = {
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
  ]
};
