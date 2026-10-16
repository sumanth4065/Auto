import { PreferredContactMethod } from '@ace-clublabs/iss-common-auto-efnol-models';
import { getExistingLossDriver } from './getExistingLossDriver';

describe('getExistingLossDriver', () => {
  it(`should return driver from cache with requestBody updated information when reportedBy.publicID is the same as the reporter public ID `, () => {
    const result = getExistingLossDriver(
      {
        phone: 'reporter-phone',
        email: 'reporter-first-name',
        preferredContactMethod: 'main_email' as PreferredContactMethod
      },
      {
        firstName: 'some-first-name',
        lastName: 'some-last-name',
        displayName: 'some-display-name',
        policyRole: 'insured',
        publicID: 'some-public-id',
        automatedServiceUpdates_Ext: true,
        ace_EnrolledInHiMarley_Acc: false
      },
      'some-public-id',
      false // test true value in different test
    );

    expect(result).toEqual({
      cellNumber: 'reporter-phone',
      ace_PreferredDeliveryMethod: 'main_email',
      emailAddress1: 'reporter-first-name',
      primaryPhoneType: 'mobile',
      firstName: 'some-first-name',
      lastName: 'some-last-name',
      displayName: 'some-display-name',
      policyRole: 'insured',
      publicID: 'some-public-id',
      automatedServiceUpdates_Ext: true,
      ace_EnrolledInHiMarley_Acc: false
    });
  });
  it(`should return appropiate loss driver data when isTextCommunicationOptIn is set true and enableTextCommunicationFeatureFlag is set "true" from product`, () => {
    const result = getExistingLossDriver(
      {
        phone: 'reporter-phone',
        email: 'reporter-first-name',
        preferredContactMethod: 'main_email' as PreferredContactMethod
      },
      {
        firstName: 'some-first-name',
        lastName: 'some-last-name',
        displayName: 'some-display-name',
        policyRole: 'insured',
        publicID: 'some-public-id',
        automatedServiceUpdates_Ext: false,
        ace_EnrolledInHiMarley_Acc: false
      },
      'some-public-id',
      true // test true value in different test
    );

    expect(result).toEqual({
      cellNumber: 'reporter-phone',
      ace_PreferredDeliveryMethod: 'main_email',
      emailAddress1: 'reporter-first-name',
      primaryPhoneType: 'mobile',
      firstName: 'some-first-name',
      lastName: 'some-last-name',
      displayName: 'some-display-name',
      policyRole: 'insured',
      publicID: 'some-public-id',
      automatedServiceUpdates_Ext: true,
      ace_EnrolledInHiMarley_Acc: true
    });
  });
  it('should return original driver from cache when reportedBy.publicID is not the same as the reporter public ID', () => {
    const result = getExistingLossDriver(
      {
        phone: 'reporter-phone',
        email: 'reporter-first-name',
        preferredContactMethod: 'main_email' as PreferredContactMethod
      },
      {
        firstName: 'some-first-name',
        lastName: 'some-last-name',
        displayName: 'some-display-name',
        policyRole: 'insured',
        publicID: 'some-public-id',
        automatedServiceUpdates_Ext: false,
        ace_EnrolledInHiMarley_Acc: false
      },
      'some-different-public-id',
      true // test true value in different test
    );

    expect(result).toEqual({
      firstName: 'some-first-name',
      lastName: 'some-last-name',
      displayName: 'some-display-name',
      policyRole: 'insured',
      publicID: 'some-public-id',
      automatedServiceUpdates_Ext: false,
      ace_EnrolledInHiMarley_Acc: false
    });
  });
});
