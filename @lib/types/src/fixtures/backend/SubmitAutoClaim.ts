import { LossCause, PreferredContactMethod, Relationship } from '@ace-clublabs/iss-common-auto-efnol-models';
import {
  IGuideWireAddress,
  ISubmitAutoClaimBackendRequest,
  ISubmitAutoClaimBackendResponse
} from '../../contracts';
import {
  LossType,
  PhoneType,
  GuideWireLossParty,
  GuideWireAceLossOccured,
  ACEDriverOccupiedType
} from '../../enums';

export const submitAutoClaimBackendRequestFixtureWithLossDateAndLossTimeObjects: ISubmitAutoClaimBackendRequest =
  {
    claimNumber: '005048510',
    lossDate: {
      year: 2021,
      month: 8,
      day: 2
    },
    lossTime: {
      hour: 14,
      minute: 5,
      second: 0
    },
    policy: {
      policyNumber: 'CAA045290824',
      expirationDate: '2022-03-03T08:00:00Z',
      status: 'Active',
      publicID: 'cc:257019',
      policyType: 'CAA',
      effectiveDate: '2021-03-03T08:00:00Z',
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
          ]
        }
      }
    },
    publicID: 'cc:252119',
    lossCause: LossCause.PEDBIKECOLLISION,
    lossType: LossType.AUTO,
    lossLocation: {
      city: 'some city',
      state: 'CA',
      country: 'US'
    } as IGuideWireAddress,
    description: 'some description',
    submitClaim: true,
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
        dateOfBirth: '1982-02-20T08:00:00Z',
        gender: 'F',
        lastName: 'SAMAYOA',
        firstName: 'LILIANA',
        contactType: 'Person',
        primaryPhoneType: 'work'
      }
    ],
    mainContact: {
      displayName: 'MARIALITA SAMAYOA',
      primaryPhoneType: PhoneType.Mobile,
      emailAddress1: 'someEmail@something.com',
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
      cellNumber: 'somePhoneNumber',
      policyRole: 'insured',
      dateOfBirth: '1939-02-20T08:00:00Z',
      gender: 'F',
      lastName: 'SAMAYOA',
      firstName: 'MARIALITA',
      contactType: 'Person',
      homeNumber: '7148000585'
    },
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
        vehicleIncidents: [
          {
            vehicle: {
              state: 'CA',
              country: 'US',
              year: 2001,
              make: 'FORD',
              model: 'F350 CREW C CREW',
              policyVehicle: true,
              publicID: 'cc:257522',
              vin: '1FTSW30S11EC86441'
            },
            damageDescription: 'some description',
            ace_LossParty: GuideWireLossParty.INSURED,
            ace_LossOccured: GuideWireAceLossOccured.IN_TRANSIT,
            ACE_DriverOccupiedType: ACEDriverOccupiedType.KnownDriver
          }
        ]
      }
    },
    canUploadDocument: false,
    ace_NotificationOnly: false,
    claimReporter: {
      reportedBy: {
        firstName: 'Giovani',
        lastName: 'Aldi',
        tempID: '1',
        ace_PreferredDeliveryMethod: PreferredContactMethod.email
      },
      relationToInsured: Relationship.Other
    },
    adjusterNote: {
      subject: 'some subject',
      body: 'some body'
    },
    sr1_VehicleNumber: 1
  };

export const submitAutoClaimBackendResponseFixture: ISubmitAutoClaimBackendResponse = {
  status_message: 'success',
  claimNumber: '005048510',
  adjuster: {
    displayName: 'Anna So',
    firstName: 'Anna',
    lastName: 'So',
    phoneNumber: '8006705080',
    email: 'test-adjuster@aaa-calif.com'
  }
};

export const submitAutoClaimBackendResponseFixtureWithNoAdjuster: ISubmitAutoClaimBackendResponse =
  {
    status_message: 'success',
    claimNumber: '005048510'
  };
