import { LossType, PhoneType } from '../enums';
import { ICachedAutoClaim, IGuideWireClaimReporter } from '../contracts/IShared';
import {
  LossCause,
  PreferredContactMethod,
  Relationship
} from '@ace-clublabs/iss-common-auto-efnol-models';

export const cachedCreateAutoClaimBackendResponseFixtureWithLossDateAndLossTimeObjects: ICachedAutoClaim =
  {
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
        //homeNumber: '123456789',
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
      primaryPhoneType: 'home',
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

export const claimReporterFixtureWithKnownContact: IGuideWireClaimReporter = {
  reportedBy: {
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
    primaryPhoneType: PhoneType.Mobile,
    cellNumber: '9497778888',
    emailAddress1: 'test2@aaa.com',
    ace_PreferredDeliveryMethod: PreferredContactMethod.email
  },
  relationToInsured: Relationship.Other
};

export const sendEmailRequestPayloadFixture: any = {
  templateId: 'TE_Ins_eFNOLConf',
  email: 'my-test-email',
  clubCode: 'some-clubCode',
  attributes: {
    SubscriberKey: 'my-test-email',
    EmailAddress: 'my-test-email',
    CampaignName: 'TE_Ins_eFNOLConf',
    CampaignCode: 'eFNOLConf',
    TrackingCode: 'email_TE_Ins_eFNOLConf',
    FirstName: 'GLEORA',
    ClubCode: 'some-clubCode',
    PolicyPrefix: 'CAA',
    PolicyNumber: '123456789',
    ClaimType: 'some-claim-type',
    ClaimNumber: 'some-claim-number', //'003144722',
    LossDate: 'January 01, 2021', //'November 18, 2021',
    AdjusterName: 'MARTIN CHASE',
    AdjusterPhone: '714-222-2222',
    AdjusterEmail: 'chase.martin@aaa-calif.com',
    CustID: 'some-custID', //'22222222',
    LossCause: 'glasscomp'
  }
};

export const baseEvent = {
  resource: 'someResource',
  path: 'somePath',
  httpMethod: 'somehttpMethod',
  requestContext: {
    authorizer: {
      sub: 'someSub',
      aud: 'someAud',
      iss: 'someIss',
      scope: JSON.stringify(['someStuff: somePolicyNumberA', 'someStuff: somePolicyNumberB']),
      customerId: 'somecustomerid'
    },
    resourcePath: 'someResourcePath',
    httpMethod: 'someHttpMethod',
    path: 'somePath'
  },
  headers: {
    Accept: '*/*',
    Authorization: 'Bearer super-secret-jwt-token',
    Host: 'api.uat.clublabs.net',
    'X-Request-Id': 'someRequestId',
    'X-Ace-Correlation-Id': 'someCorrelationId',
    'X-Ace-Session-Id': 'someSessionId',
    'X-Ace-Mock': false
  },
  queryStringParameters: {
    policyGuid: 'Q0F-BOT-g3N-jQ1-MjM-x'
  },
  body: {}
};

export const baseHeaders = {
  'X-Ace-Mulesoft-Id': 'some-mulesoft-client-id',
  'X-Ace-Mulesoft-Secret': 'some-mulesoft-client-secret',
  'X-Ace-Correlation-Id': 'someCorrelationId',
  'X-Ace-Session-Id': 'someSessionId',
  'X-Ace-Team-Id': 'insuranceselfservice',
  'X-Ace-Test-Region': 'A1',
  'X-ConsumerRequestSentTimeStamp': '2022-02-07T18:00:00.000Z'
};

export const mockPolicyNumber = 'RIA12345678';

export const mockPolicyGuid = 'Q0F-BOT-g3N-jQ1-MjM-x';
