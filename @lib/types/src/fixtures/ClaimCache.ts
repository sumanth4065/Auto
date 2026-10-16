import { LossCause, LossType } from '@ace-clublabs/iss-common-auto-efnol-models';
import { ICachedAutoClaim } from '../contracts/IShared';
import { PhoneType } from '../enums';

export const autoClaimCachedFixtureWithLossDateAndLossTimeObjects: ICachedAutoClaim = {
  policy: {
    status: 'Active',
    coverages: [],
    expirationDate: '2022-03-03T08:00:00Z',
    effectiveDate: '2021-03-03T08:00:00Z',
    publicID: 'cc:257019',
    policyNumber: 'CAA045290824',
    loggedInPolicyNumber: 'CAA045290824',
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
      dateOfBirth: '1939-02-20T08:00:00Z',
      gender: 'F',
      lastName: 'SAMAYOA',
      firstName: 'MARIALITA',
      contactType: 'Person',
      primaryPhoneType: 'work',
      contactId: 'someUniqueId3'
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
      dateOfBirth: '1982-02-20T08:00:00Z',
      gender: 'F',
      lastName: 'SAMAYOA',
      firstName: 'LILIANA',
      contactType: 'Person',
      primaryPhoneType: 'work',
      contactId: 'someUniqueId4'
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
          vin: '1FTSW30S11EC86441',
          vehicleId: 'someUniqueId1'
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
          vin: '2LMDU68C67BJ12379',
          vehicleId: 'someUniqueId2'
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
  },
  description: 'some description',
  ace_NotificationOnly: false
};
