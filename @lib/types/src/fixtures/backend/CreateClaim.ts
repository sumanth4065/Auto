import { LossCause, LossType } from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  IGuideWireAddress,
  ICreateAutoClaimBackendRequest,
  ICreateAutoClaimBackendResponse
} from '../../contracts';
import { PhoneType } from '../../enums';

export const createAutoClaimBackendRequestFixture: ICreateAutoClaimBackendRequest = {
  lossDate: {
    year: 2022,
    month: 9,
    day: 1
  },
  lossTime: {
    hour: 14,
    minute: 5,
    second: 0
  },
  policy: {
    expirationDate: '2022-10-06T00:00:00.000Z',
    policyNumber: 'CAA047514589',
    policyType: 'CAA',
    effectiveDate: '2021-10-06T00:00:00.000Z'
  },
  lossType: LossType.AUTO,
  lossCause: LossCause.OTHERCOMP,
  ace_NotificationOnly: false
};

export const createAutoClaimBackendRequestFixtureACMO: ICreateAutoClaimBackendRequest = {
  lossDate: {
    year: 2022,
    month: 9,
    day: 1
  },
  lossTime: {
    hour: 14,
    minute: 5,
    second: 0
  },
  policy: {
    expirationDate: '2025-10-06T00:00:00.000Z',
    policyNumber: 'MOA12345689',
    policyType: 'AMO',
    effectiveDate: '2024-04-01T00:00:00.000Z',
    priorPolicyNumber: 'MOA12345689'
  },
  lossType: LossType.AUTO,
  lossCause: LossCause.OTHERCOMP,
  ace_NotificationOnly: false
};

export const createAutoClaimBackendRequestFixtureTexas: ICreateAutoClaimBackendRequest = {
  lossDate: {
    year: 2024,
    month: 10,
    day: 5
  },
  lossTime: {
    hour: 14,
    minute: 5,
    second: 0
  },
  policy: {
    expirationDate: '2025-10-06T00:00:00.000Z',
    policyNumber: 'ATX12345689',
    policyType: 'ATX',
    effectiveDate: '2024-11-01T00:00:00.000Z',
    priorPolicyNumber: 'TPA12345689'
  },
  lossType: LossType.AUTO,
  lossCause: LossCause.OTHERCOMP,
  ace_NotificationOnly: false
};

export const createAutoClaimBackendResponseFixture: ICreateAutoClaimBackendResponse = {
  policy: {
    status: 'Active',
    coverages: [],
    expirationDate: '2022-03-03T08:00:00Z',
    effectiveDate: '2021-03-03T08:00:00Z',
    publicID: 'cc:257019',
    policyNumber: 'CAA045290824',
    policyType: 'CAA',
    lobs: {
      personalAuto: {
        vehicles: [
          {
            state: 'CA',
            country: 'US',
            year: 2001,
            make: 'FORD',
            model: 'F350 CREW C CREW',
            policyVehicle: true,
            coverages: [
              {
                name: 'PD - Property Damage',
                incidentLimit: {
                  currency: 'usd',
                  amount: 50000
                }
              },
              {
                name: 'UMBI - Uninsured Motorist - Bodily Injury',
                exposureLimit: {
                  currency: 'usd',
                  amount: 100000
                },
                incidentLimit: {
                  currency: 'usd',
                  amount: 300000
                }
              },
              {
                name: 'UC - Uninsured Collision',
                incidentLimit: {
                  currency: 'usd',
                  amount: 3500
                }
              },
              {
                name: 'EXMP - Excess Medical Payments',
                exposureLimit: {
                  currency: 'usd',
                  amount: 5000
                }
              },
              {
                name: 'BI - Bodily Injury',
                exposureLimit: {
                  currency: 'usd',
                  amount: 100000
                },
                incidentLimit: {
                  currency: 'usd',
                  amount: 300000
                }
              }
            ],
            publicID: 'cc:257522',
            vin: '1FTSW30S11EC86441'
          },
          {
            state: 'CA',
            country: 'US',
            year: 2007,
            make: 'LINC',
            model: 'MKX',
            policyVehicle: true,
            coverages: [
              {
                name: 'BI - Bodily Injury',
                exposureLimit: {
                  currency: 'usd',
                  amount: 100000
                },
                incidentLimit: {
                  currency: 'usd',
                  amount: 300000
                }
              },
              {
                name: 'UMBI - Uninsured Motorist - Bodily Injury',
                exposureLimit: {
                  currency: 'usd',
                  amount: 100000
                },
                incidentLimit: {
                  currency: 'usd',
                  amount: 300000
                }
              },
              {
                name: 'PD - Property Damage',
                incidentLimit: {
                  currency: 'usd',
                  amount: 50000
                }
              },
              {
                name: 'EXMP - Excess Medical Payments',
                exposureLimit: {
                  currency: 'usd',
                  amount: 5000
                }
              },
              {
                name: 'COLL - Uninsured Deductible Waiver',
                deductible: {
                  currency: 'usd',
                  amount: 1000
                }
              },
              {
                name: 'OTC - Comprehensive - Other than Collision',
                deductible: {
                  currency: 'usd',
                  amount: 500
                }
              }
            ],
            publicID: 'cc:257524',
            vin: '2LMDU68C67BJ12379'
          }
        ]
      }
    }
  },
  publicID: 'cc:252119',
  contacts: [
    {
      displayName: 'MARIALITA SAMAYOA',
      publicID: 'cc:10474311',
      subtype: 'Person',
      workNumber: '9999999999',
      policyRole: 'insured',
      primaryAddress: {
        state: 'CA',
        country: 'US',
        displayName: '39813 CAMINO TEMPLADO, INDIO, CA 92203-3715, US',
        publicID: 'cc:57561002',
        county: 'Riverside',
        addressLine1: '39813 CAMINO TEMPLADO',
        city: 'INDIO',
        postalCode: '92203-3715',
        addressType: 'home'
      },
      cellNumber: '3211111111',
      contactType: 'Person',
      dateOfBirth: '1939-02-20T08:00:00Z',
      emailAddress1: 'm@aa.com',
      firstName: 'MARIALITA',
      gender: 'F',
      lastName: 'SAMAYOA',
      primaryPhoneType: 'work'
    },
    {
      displayName: 'LILIANA SAMAYOA',
      publicID: 'cc:10474312',
      subtype: 'Person',
      workNumber: '9999999999',
      policyRole: 'insured',
      primaryAddress: {
        state: 'CA',
        country: 'US',
        displayName: '39813 CAMINO TEMPLADO, INDIO, CA 92203-3715, US',
        publicID: 'cc:57561002',
        county: 'Riverside',
        addressLine1: '39813 CAMINO TEMPLADO',
        city: 'INDIO',
        postalCode: '92203-3715',
        addressType: 'home'
      },
      cellNumber: '3212222222',
      contactType: 'Person',
      dateOfBirth: '1982-02-20T08:00:00Z',
      emailAddress1: 'l@aa.com',
      firstName: 'LILIANA',
      gender: 'F',
      lastName: 'SAMAYOA',
      primaryPhoneType: 'work'
    }
  ],
  lossDate: {
    year: 2022,
    month: 9,
    day: 1
  },
  lossTime: {
    hour: 14,
    minute: 5,
    second: 0
  },
  lossType: LossType.AUTO,
  claimNumber: '005048510',
  predefinedLossLocations: [
    {
      state: 'CA',
      country: 'US',
      displayName: '39813 CAMINO TEMPLADO, INDIO, CA 92203-3715, US',
      publicID: 'cc:57561002',
      county: 'Riverside',
      addressLine1: '39813 CAMINO TEMPLADO',
      city: 'INDIO',
      postalCode: '92203-3715',
      addressType: 'home'
    },
    {
      state: 'CA',
      country: 'US',
      displayName: '39813 CAMINO TEMPLADO, INDIO, CA 92203-3715, US',
      publicID: 'cc:57561003',
      county: 'Riverside',
      addressLine1: '39813 CAMINO TEMPLADO',
      city: 'INDIO',
      postalCode: '92203-3715',
      addressType: 'ACE_Mailing'
    }
  ],
  lossCause: LossCause.OTHERCOMP,
  mainContact: {
    displayName: 'MARIALITA SAMAYOA',
    primaryPhoneType: PhoneType.Home,
    emailAddress1: 'nxkfjkeafwmtj@cugqdkd.com',
    publicID: 'cc:10474311',
    primaryAddress: {
      state: 'CA',
      country: 'US',
      displayName: '39813 CAMINO TEMPLADO, INDIO, CA 92203-3715, US',
      publicID: 'cc:57561002',
      county: 'Riverside',
      addressLine1: '39813 CAMINO TEMPLADO',
      city: 'INDIO',
      postalCode: '92203-3715',
      addressType: 'home'
    },
    subtype: 'Person',
    workNumber: '9999999999',
    policyRole: 'insured',
    dateOfBirth: '1939-02-20T08:00:00Z',
    gender: 'F',
    lastName: 'SAMAYOA',
    firstName: 'MARIALITA',
    contactType: 'Person',
    homeNumber: '7148000585'
  },
  lobs: {
    personalAuto: {
      vehicles: [
        {
          state: 'CA',
          country: 'US',
          year: 2001,
          make: 'FORD',
          model: 'F350 CREW C CREW',
          policyVehicle: true,
          publicID: 'cc:257522',
          vin: '1FTSW30S11EC86441'
        },
        {
          state: 'CA',
          country: 'US',
          year: 2007,
          make: 'LINC',
          model: 'MKX',
          policyVehicle: true,
          publicID: 'cc:257524',
          vin: '2LMDU68C67BJ12379'
        }
      ],
      vehicleIncidents: []
    }
  },
  canUploadDocument: false,
  lossLocation: {
    city: 'some city',
    state: 'California',
    country: 'US',
    addressLine1: 'some street address'
  } as IGuideWireAddress,
  description: 'some description',
  ace_NotificationOnly: false
};
