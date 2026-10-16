import {
  PHONE_NUMBER_FIELDS,
  sanitizeDataUnsafe,
  sanitizeDataSafe,
  sanitizePhoneNumber,
  sanitizePhoneNumbers,
  sanitizeState,
  STATE_FIELDS,
  stripChars,
  stripSpaces,
  sanitizeData,
  sanitizeAllData
} from './DataHelper';

// jest.mock('/.DataHelper');

describe('DataHelper', () => {
  describe('phone numbers', () => {
    it('should return a valid phone number', () => {
      const str = '123-456-7890';
      const result = sanitizePhoneNumber(str);
      expect(result).toEqual('1234567890');
    });

    it('should return an empty string if phone number is not valid', () => {
      const str = '123-456-7xxx';
      const result = sanitizePhoneNumber(str);
      expect(result).toEqual('');
    });

    it('should sanitize phone numbers (unsafe version)', () => {
      const contact = {
        phone: '999-888-7777',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      };
      const result = sanitizeDataUnsafe(contact, PHONE_NUMBER_FIELDS, sanitizePhoneNumber);
      expect(result).toEqual({
        phone: '9998887777',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      });
    });

    it('should sanitize phone numbers (immutable/safe version)', () => {
      const contact = {
        phone: '999-888-7777',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      };
      const result = sanitizeDataSafe(contact, PHONE_NUMBER_FIELDS, sanitizePhoneNumber);
      expect(result).toEqual({
        phone: '9998887777',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      });
      expect(contact).toEqual({
        phone: '999-888-7777',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      });
    });

    it('should sanitize phone numbers', () => {
      const contact = {
        phone: '999-888-7777',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      };
      const result = sanitizePhoneNumbers(contact);
      expect(result).toEqual({
        phone: '9998887777',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      });
    });

    it('should sanitize phone as a complex object', () => {
      const contact = {
        phone: {
            phoneType: 'work',
            workNumber: '999-888-7777',
        }
      };
      const result = sanitizePhoneNumbers(contact);
      expect(result).toEqual({
        phone: {
          phoneType: 'work',
          workNumber: '9998887777',
        }
      });
    });    

    it('should remove phone numbers', () => {
      const contact = {
        phone: 'some-phone-number',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      };
      const result = sanitizeDataUnsafe(contact, PHONE_NUMBER_FIELDS, sanitizePhoneNumber);
      expect(result).toEqual({
        phone: '',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      });
    });

    it('should remove phone numbers', () => {
      const contact = {
        phone: 'some-phone-number',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      };
      const result = sanitizePhoneNumbers(contact);
      expect(result).toEqual({
        phone: '',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      });
    });
  });

  describe('states', () => {
    it('should return a valid CA state', () => {
      const str = '  ca  ';
      const result = sanitizeState(str);
      expect(result).toEqual('CA');
    });

    it('should return a valid TX state', () => {
      const str = '  tx  ';
      const result = sanitizeState(str);
      expect(result).toEqual('TX');
    });

    it('should return an empty string if state is not valid', () => {
      const str = ' some-state  ';
      const result = sanitizeState(str);
      expect(result).toEqual('');
    });

    it('should sanitize state (mutable/unsafe version)', () => {
      const contact = {
        phone: '999-888-7777',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      };
      const result = sanitizeDataUnsafe(contact, STATE_FIELDS, sanitizeState);
      expect(result).toEqual({
        phone: '999-888-7777',
        email: 'some-email-id@aaa.com',
        state: 'CA'
      });
    });

    it('should sanitize state (immutable/safe version)', () => {
      const contact = {
        phone: '999-888-7777',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      };
      const result = sanitizeDataSafe(contact, STATE_FIELDS, sanitizeState);
      expect(result).toEqual({
        phone: '999-888-7777',
        email: 'some-email-id@aaa.com',
        state: 'CA'
      });
      expect(contact).toEqual({
        phone: '999-888-7777',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      });
    });

    it('should remove state', () => {
      const contact = {
        phone: '999-888-7777',
        email: 'some-email-id@aaa.com',
        state: 'some-state'
      };
      const result = sanitizeDataUnsafe(contact, STATE_FIELDS, sanitizeState);
      expect(result).toEqual({
        phone: '999-888-7777',
        email: 'some-email-id@aaa.com',
        state: ''
      });
    });
  });

  describe('all data', () => {
    it('should sanitize all data', () => {
      const contact = {
        phone: '999-888-7777',
        email: 'some-email-id@aaa.com',
        state: '  ca'
      };
      const result = sanitizeAllData(contact);
      expect(result).toEqual({
        phone: '9998887777',
        email: 'some-email-id@aaa.com',
        state: 'CA'
      });
    });

    it('should sanitize all data with empty strings', () => {
      const contact = {
        phone: 'some-erroneous-phone',
        email: 'some-email-id@aaa.com',
        state: 'some-erroneous-state'
      };
      const result = sanitizeAllData(contact);
      expect(result).toEqual({
        phone: '',
        email: 'some-email-id@aaa.com',
        state: ''
      });
    });

    it('should sanitize all data of a complex object', () => {
      const result = sanitizeAllData(mockDataBefore);
      expect(result).toEqual(mockDataAfter);
    });
  });

  describe('helpers', () => {
    it('should strip spaces', () => {
      const str = '   abc  def  ';
      const result = stripSpaces(str);
      expect(result).toEqual('abcdef');
    });

    it('should strip [ +-]', () => {
      const str = '111-111+1111';
      const result = stripChars(str, /[ .+-]/g);
      expect(result).toEqual('1111111111');
    });
  });

  const mockDataAfter = {
    mainContact: {
      policyRole: 'insured',
      ace_EnrolledInHiMarley_Acc: false,
      automatedServiceUpdates_Ext: true,
      subtype: 'Person',
      dateOfBirth: '1983-01-01T08:00:00Z',
      firstName: 'George',
      gender: 'M',
      lastName: 'Brown',
      middleName: 'W',
      primaryAddress: {
        country: 'US',
        addressLine1: '1051 MANCHESTER RD',
        city: 'GLASTONBURY',
        postalCode: '06033-2631',
        county: 'HARTFORD',
        addressType: 'home',
        displayName: '1051 MANCHESTER RD, GLASTONBURY, CT 06033-2631',
        state: '',
        publicID: 'cc:Skxf3aLaCUZMNaTKvOmCE'
      },
      contactType: 'Person',
      displayName: 'George Brown',
      publicID: 'cc:ScWMj6YFkBrhDvZ7HDWpd',
      cellNumber: '',
      primaryPhoneType: 'mobile',
      emailAddress1: 'pham.linh@clublabs.com',
      ace_PreferredDeliveryMethod: 'main_email'
    },

    relatedContacts: [{ role: 'witness', injured: false, contact: {} }],
    lossType: 'AUTO',
    documents: [],
    enrolledInHiMarley_Acc: false,
    claimNumber: '003073021',
    policy: {
      effectiveDate: '2024-04-22T07:00:00Z',
      policyType: 'CTA',
      coverages: [],
      expirationDate: '2025-04-22T07:00:00Z',
      policyNumber: 'CTA000041139',
      lobs: {
        personalAuto: {
          vehicles: [
            {
              vin: 'JTND4MBE7M3120528',
              country: 'US',
              coverages: [
                {
                  exposureLimit: { currency: 'usd', amount: 100000 },
                  incidentLimit: { currency: 'usd', amount: 300000 },
                  name: 'BI - Bodily Injury'
                },
                {
                  exposureLimit: { currency: 'usd', amount: 100000 },
                  incidentLimit: { currency: 'usd', amount: 300000 },
                  name: 'UMBI - Uninsured Motorist - Bodily Injury'
                },
                {
                  exposureLimit: { currency: 'usd', amount: 2500 },
                  name: 'MPAY - Medical Payments'
                },
                {
                  deductible: { currency: 'usd', amount: 250 },
                  name: 'OTC - Comprehensive - Other than Collision'
                },
                { incidentLimit: { currency: 'usd', amount: 1350 }, name: 'RENT - Rental' },
                { deductible: { currency: 'usd', amount: 1000 }, name: 'COLL - Collision' },
                {
                  incidentLimit: { currency: 'usd', amount: 100000 },
                  name: 'PD - Property Damage'
                }
              ],
              policyVehicle: true,
              make: 'TOYO',
              model: 'COROLLA HATCHBACK 5D : SE',
              year: 2021,
              state: '',
              publicID: 'cc:ScSg3rMsjm-RQAuzN55dw'
            }
          ]
        }
      },
      status: 'Active',
      publicID: 'cc:SXt8zqphpiXGl22IH-1d9'
    },
    contacts: [
      {
        policyRole: 'insured',
        ace_EnrolledInHiMarley_Acc: false,
        automatedServiceUpdates_Ext: false,
        subtype: 'Person',
        dateOfBirth: '1983-01-01T08:00:00Z',
        firstName: 'George',
        gender: 'M',
        lastName: 'Brown',
        middleName: 'W',
        primaryAddress: {
          country: 'US',
          addressLine1: '1051 MANCHESTER RD',
          city: 'GLASTONBURY',
          postalCode: '06033-2631',
          county: 'HARTFORD',
          addressType: 'home',
          displayName: '1051 MANCHESTER RD, GLASTONBURY, CT 06033-2631',
          state: '',
          publicID: 'cc:Skxf3aLaCUZMNaTKvOmCE'
        },
        contactType: 'Person',
        displayName: 'George Brown',
        publicID: 'cc:ScWMj6YFkBrhDvZ7HDWpd'
      }
    ],
    lossDate: { year: 2024, month: 6, day: 6 },
    lossCause: 'impactedwithanothervehicle',
    lossTime: { hour: 3, minute: 0, second: 0 },
    lobs: {
      personalAuto: {
        vehicles: [
          {
            vin: 'JTND4MBE7M3120528',
            country: 'US',
            coverages: [
              {
                exposureLimit: { currency: 'usd', amount: 100000 },
                incidentLimit: { currency: 'usd', amount: 300000 },
                name: 'BI - Bodily Injury'
              },
              {
                exposureLimit: { currency: 'usd', amount: 100000 },
                incidentLimit: { currency: 'usd', amount: 300000 },
                name: 'UMBI - Uninsured Motorist - Bodily Injury'
              },
              {
                exposureLimit: { currency: 'usd', amount: 2500 },
                name: 'MPAY - Medical Payments'
              },
              {
                deductible: { currency: 'usd', amount: 250 },
                name: 'OTC - Comprehensive - Other than Collision'
              },
              { incidentLimit: { currency: 'usd', amount: 1350 }, name: 'RENT - Rental' },
              { deductible: { currency: 'usd', amount: 1000 }, name: 'COLL - Collision' },
              {
                incidentLimit: { currency: 'usd', amount: 100000 },
                name: 'PD - Property Damage'
              }
            ],
            policyVehicle: true,
            make: 'TOYO',
            model: 'COROLLA HATCHBACK 5D : SE',
            year: 2021,
            state: '',
            publicID: 'cc:ScSg3rMsjm-RQAuzN55dw'
          }
        ],
        vehicleIncidents: [
          {
            ACE_DriverOccupiedType: 'Known-Driver',
            vehicle: {
              vin: 'JTND4MBE7M3120528',
              country: 'US',
              coverages: [
                {
                  exposureLimit: { currency: 'usd', amount: 100000 },
                  incidentLimit: { currency: 'usd', amount: 300000 },
                  name: 'BI - Bodily Injury'
                },
                {
                  exposureLimit: { currency: 'usd', amount: 100000 },
                  incidentLimit: { currency: 'usd', amount: 300000 },
                  name: 'UMBI - Uninsured Motorist - Bodily Injury'
                },
                {
                  exposureLimit: { currency: 'usd', amount: 2500 },
                  name: 'MPAY - Medical Payments'
                },
                {
                  deductible: { currency: 'usd', amount: 250 },
                  name: 'OTC - Comprehensive - Other than Collision'
                },
                { incidentLimit: { currency: 'usd', amount: 1350 }, name: 'RENT - Rental' },
                { deductible: { currency: 'usd', amount: 1000 }, name: 'COLL - Collision' },
                {
                  incidentLimit: { currency: 'usd', amount: 100000 },
                  name: 'PD - Property Damage'
                }
              ],
              policyVehicle: true,
              make: 'TOYO',
              model: 'COROLLA HATCHBACK 5D : SE',
              year: 2021,
              state: '',
              publicID: 'cc:ScSg3rMsjm-RQAuzN55dw'
            },
            driver: {
              policyRole: 'insured',
              ace_EnrolledInHiMarley_Acc: false,
              automatedServiceUpdates_Ext: true,
              subtype: 'Person',
              dateOfBirth: '1983-01-01T08:00:00Z',
              firstName: 'George',
              gender: 'M',
              lastName: 'Brown',
              middleName: 'W',
              primaryAddress: {
                country: 'US',
                addressLine1: '1051 MANCHESTER RD',
                city: 'GLASTONBURY',
                postalCode: '06033-2631',
                county: 'HARTFORD',
                addressType: 'home',
                displayName: '1051 MANCHESTER RD, GLASTONBURY, CT 06033-2631',
                state: '',
                publicID: 'cc:Skxf3aLaCUZMNaTKvOmCE'
              },
              contactType: 'Person',
              displayName: 'George Brown',
              publicID: 'cc:ScWMj6YFkBrhDvZ7HDWpd',
              ace_PreferredDeliveryMethod: 'main_email',
              cellNumber: '',
              primaryPhoneType: 'mobile',
              emailAddress1: 'pham.linh@clublabs.com'
            },
            damageDescription: 'Test',
            ace_LossParty: 'insured',
            ace_LossOccured: 'InTransit',
            vehicleTowed: false
          },
          {
            vehicle: { year: 2000, make: 'Toy', model: 'Aaa', country: 'US' },
            ace_LossParty: 'third_party',
            driver: {},
            ACE_DriverOccupiedType: 'Known-Driver'
          }
        ]
      }
    },
    lossLocation: { city: 'A', state: 'CO', country: 'US' },
    description: 'Test',
    submitClaim: true,
    claimReporter: {
      reportedBy: {
        policyRole: 'insured',
        ace_EnrolledInHiMarley_Acc: false,
        automatedServiceUpdates_Ext: true,
        subtype: 'Person',
        dateOfBirth: '1983-01-01T08:00:00Z',
        firstName: 'George',
        gender: 'M',
        lastName: 'Brown',
        middleName: 'W',
        primaryAddress: {
          country: 'US',
          addressLine1: '1051 MANCHESTER RD',
          city: 'GLASTONBURY',
          postalCode: '06033-2631',
          county: 'HARTFORD',
          addressType: 'home',
          displayName: '1051 MANCHESTER RD, GLASTONBURY, CT 06033-2631',
          state: '',
          publicID: 'cc:Skxf3aLaCUZMNaTKvOmCE'
        },
        contactType: 'Person',
        displayName: 'George Brown',
        publicID: 'cc:ScWMj6YFkBrhDvZ7HDWpd',
        cellNumber: '2345678923',
        primaryPhoneType: 'mobile',
        emailAddress1: 'pham.linh@clublabs.com',
        ace_PreferredDeliveryMethod: 'main_email'
      },
      relationToInsured: 'other'
    },
    adjusterNote: {
      subject: 'eFNOL',
      body: 'One third party vehicle involved|IV: 2021 TOYO, unknown number of passengers, injury not indicated|CV: 2000 Toy, unknown number of passengers, injury not indicated|Additional Details:|Test|Third-party insurance company is Aaa'
    }
  };

  const mockDataBefore = {
    mainContact: {
      policyRole: 'insured',
      ace_EnrolledInHiMarley_Acc: false,
      automatedServiceUpdates_Ext: true,
      subtype: 'Person',
      dateOfBirth: '1983-01-01T08:00:00Z',
      firstName: 'George',
      gender: 'M',
      lastName: 'Brown',
      middleName: 'W',
      primaryAddress: {
        country: 'US',
        addressLine1: '1051 MANCHESTER RD',
        city: 'GLASTONBURY',
        postalCode: '06033-2631',
        county: 'HARTFORD',
        addressType: 'home',
        displayName: '1051 MANCHESTER RD, GLASTONBURY, CT 06033-2631',
        state: 'CTxxx',
        publicID: 'cc:Skxf3aLaCUZMNaTKvOmCE'
      },
      contactType: 'Person',
      displayName: 'George Brown',
      publicID: 'cc:ScWMj6YFkBrhDvZ7HDWpd',
      cellNumber: '2345678923xxx',
      primaryPhoneType: 'mobile',
      emailAddress1: 'pham.linh@clublabs.com',
      ace_PreferredDeliveryMethod: 'main_email'
    },
    relatedContacts: [{ role: 'witness', injured: false, contact: {} }],
    lossType: 'AUTO',
    documents: [],
    enrolledInHiMarley_Acc: false,
    claimNumber: '003073021',
    policy: {
      effectiveDate: '2024-04-22T07:00:00Z',
      policyType: 'CTA',
      coverages: [],
      expirationDate: '2025-04-22T07:00:00Z',
      policyNumber: 'CTA000041139',
      lobs: {
        personalAuto: {
          vehicles: [
            {
              vin: 'JTND4MBE7M3120528',
              country: 'US',
              coverages: [
                {
                  exposureLimit: { currency: 'usd', amount: 100000 },
                  incidentLimit: { currency: 'usd', amount: 300000 },
                  name: 'BI - Bodily Injury'
                },
                {
                  exposureLimit: { currency: 'usd', amount: 100000 },
                  incidentLimit: { currency: 'usd', amount: 300000 },
                  name: 'UMBI - Uninsured Motorist - Bodily Injury'
                },
                {
                  exposureLimit: { currency: 'usd', amount: 2500 },
                  name: 'MPAY - Medical Payments'
                },
                {
                  deductible: { currency: 'usd', amount: 250 },
                  name: 'OTC - Comprehensive - Other than Collision'
                },
                { incidentLimit: { currency: 'usd', amount: 1350 }, name: 'RENT - Rental' },
                { deductible: { currency: 'usd', amount: 1000 }, name: 'COLL - Collision' },
                {
                  incidentLimit: { currency: 'usd', amount: 100000 },
                  name: 'PD - Property Damage'
                }
              ],
              policyVehicle: true,
              make: 'TOYO',
              model: 'COROLLA HATCHBACK 5D : SE',
              year: 2021,
              state: 'CTxxx',
              publicID: 'cc:ScSg3rMsjm-RQAuzN55dw'
            }
          ]
        }
      },
      status: 'Active',
      publicID: 'cc:SXt8zqphpiXGl22IH-1d9'
    },
    contacts: [
      {
        policyRole: 'insured',
        ace_EnrolledInHiMarley_Acc: false,
        automatedServiceUpdates_Ext: false,
        subtype: 'Person',
        dateOfBirth: '1983-01-01T08:00:00Z',
        firstName: 'George',
        gender: 'M',
        lastName: 'Brown',
        middleName: 'W',
        primaryAddress: {
          country: 'US',
          addressLine1: '1051 MANCHESTER RD',
          city: 'GLASTONBURY',
          postalCode: '06033-2631',
          county: 'HARTFORD',
          addressType: 'home',
          displayName: '1051 MANCHESTER RD, GLASTONBURY, CT 06033-2631',
          state: 'CTxxx',
          publicID: 'cc:Skxf3aLaCUZMNaTKvOmCE'
        },
        contactType: 'Person',
        displayName: 'George Brown',
        publicID: 'cc:ScWMj6YFkBrhDvZ7HDWpd'
      }
    ],
    lossDate: { year: 2024, month: 6, day: 6 },
    lossCause: 'impactedwithanothervehicle',
    lossTime: { hour: 3, minute: 0, second: 0 },
    lobs: {
      personalAuto: {
        vehicles: [
          {
            vin: 'JTND4MBE7M3120528',
            country: 'US',
            coverages: [
              {
                exposureLimit: { currency: 'usd', amount: 100000 },
                incidentLimit: { currency: 'usd', amount: 300000 },
                name: 'BI - Bodily Injury'
              },
              {
                exposureLimit: { currency: 'usd', amount: 100000 },
                incidentLimit: { currency: 'usd', amount: 300000 },
                name: 'UMBI - Uninsured Motorist - Bodily Injury'
              },
              {
                exposureLimit: { currency: 'usd', amount: 2500 },
                name: 'MPAY - Medical Payments'
              },
              {
                deductible: { currency: 'usd', amount: 250 },
                name: 'OTC - Comprehensive - Other than Collision'
              },
              { incidentLimit: { currency: 'usd', amount: 1350 }, name: 'RENT - Rental' },
              { deductible: { currency: 'usd', amount: 1000 }, name: 'COLL - Collision' },
              {
                incidentLimit: { currency: 'usd', amount: 100000 },
                name: 'PD - Property Damage'
              }
            ],
            policyVehicle: true,
            make: 'TOYO',
            model: 'COROLLA HATCHBACK 5D : SE',
            year: 2021,
            state: 'CTxxx',
            publicID: 'cc:ScSg3rMsjm-RQAuzN55dw'
          }
        ],
        vehicleIncidents: [
          {
            ACE_DriverOccupiedType: 'Known-Driver',
            vehicle: {
              vin: 'JTND4MBE7M3120528',
              country: 'US',
              coverages: [
                {
                  exposureLimit: { currency: 'usd', amount: 100000 },
                  incidentLimit: { currency: 'usd', amount: 300000 },
                  name: 'BI - Bodily Injury'
                },
                {
                  exposureLimit: { currency: 'usd', amount: 100000 },
                  incidentLimit: { currency: 'usd', amount: 300000 },
                  name: 'UMBI - Uninsured Motorist - Bodily Injury'
                },
                {
                  exposureLimit: { currency: 'usd', amount: 2500 },
                  name: 'MPAY - Medical Payments'
                },
                {
                  deductible: { currency: 'usd', amount: 250 },
                  name: 'OTC - Comprehensive - Other than Collision'
                },
                { incidentLimit: { currency: 'usd', amount: 1350 }, name: 'RENT - Rental' },
                { deductible: { currency: 'usd', amount: 1000 }, name: 'COLL - Collision' },
                {
                  incidentLimit: { currency: 'usd', amount: 100000 },
                  name: 'PD - Property Damage'
                }
              ],
              policyVehicle: true,
              make: 'TOYO',
              model: 'COROLLA HATCHBACK 5D : SE',
              year: 2021,
              state: 'CTxxx',
              publicID: 'cc:ScSg3rMsjm-RQAuzN55dw'
            },
            driver: {
              policyRole: 'insured',
              ace_EnrolledInHiMarley_Acc: false,
              automatedServiceUpdates_Ext: true,
              subtype: 'Person',
              dateOfBirth: '1983-01-01T08:00:00Z',
              firstName: 'George',
              gender: 'M',
              lastName: 'Brown',
              middleName: 'W',
              primaryAddress: {
                country: 'US',
                addressLine1: '1051 MANCHESTER RD',
                city: 'GLASTONBURY',
                postalCode: '06033-2631',
                county: 'HARTFORD',
                addressType: 'home',
                displayName: '1051 MANCHESTER RD, GLASTONBURY, CT 06033-2631',
                state: 'CTxxx',
                publicID: 'cc:Skxf3aLaCUZMNaTKvOmCE'
              },
              contactType: 'Person',
              displayName: 'George Brown',
              publicID: 'cc:ScWMj6YFkBrhDvZ7HDWpd',
              ace_PreferredDeliveryMethod: 'main_email',
              cellNumber: '1112345678923',
              primaryPhoneType: 'mobile',
              emailAddress1: 'pham.linh@clublabs.com'
            },
            damageDescription: 'Test',
            ace_LossParty: 'insured',
            ace_LossOccured: 'InTransit',
            vehicleTowed: false
          },
          {
            vehicle: { year: 2000, make: 'Toy', model: 'Aaa', country: 'US' },
            ace_LossParty: 'third_party',
            driver: {},
            ACE_DriverOccupiedType: 'Known-Driver'
          }
        ]
      }
    },
    lossLocation: { city: 'A', state: 'CO', country: 'US' },
    description: 'Test',
    submitClaim: true,
    claimReporter: {
      reportedBy: {
        policyRole: 'insured',
        ace_EnrolledInHiMarley_Acc: false,
        automatedServiceUpdates_Ext: true,
        subtype: 'Person',
        dateOfBirth: '1983-01-01T08:00:00Z',
        firstName: 'George',
        gender: 'M',
        lastName: 'Brown',
        middleName: 'W',
        primaryAddress: {
          country: 'US',
          addressLine1: '1051 MANCHESTER RD',
          city: 'GLASTONBURY',
          postalCode: '06033-2631',
          county: 'HARTFORD',
          addressType: 'home',
          displayName: '1051 MANCHESTER RD, GLASTONBURY, CT 06033-2631',
          state: 'CTxxx',
          publicID: 'cc:Skxf3aLaCUZMNaTKvOmCE'
        },
        contactType: 'Person',
        displayName: 'George Brown',
        publicID: 'cc:ScWMj6YFkBrhDvZ7HDWpd',
        cellNumber: '2345678923',
        primaryPhoneType: 'mobile',
        emailAddress1: 'pham.linh@clublabs.com',
        ace_PreferredDeliveryMethod: 'main_email'
      },
      relationToInsured: 'other'
    },
    adjusterNote: {
      subject: 'eFNOL',
      body: 'One third party vehicle involved|IV: 2021 TOYO, unknown number of passengers, injury not indicated|CV: 2000 Toy, unknown number of passengers, injury not indicated|Additional Details:|Test|Third-party insurance company is Aaa'
    }
  };
});
