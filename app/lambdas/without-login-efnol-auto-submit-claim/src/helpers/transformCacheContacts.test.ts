import { transformCacheContacts } from './transformCacheContacts';

describe('transformCacheContacts', () => {
  it('transforms each ICachedAutoContact from the list to IGuideWireContact when the postal code contains a "-" at the end', () => {
    const result = transformCacheContacts([
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
          postalCode: '65001-',
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
    ]);

    expect(result).toEqual([
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
          postalCode: '65001',
          addressType: 'some-contact-primary-address-address-type'
        },
        dateOfBirth: 'some-contact-date-of-birth',
        gender: 'some-contact-gender',
        lastName: 'some-contact-last-name',
        firstName: 'some-contact-first-name',
        contactType: 'some-contact-type',
        primaryPhoneType: 'some-conctact-primary-phone-type'
      }
    ]);
  });

  it('transforms each ICachedAutoContact from the list to IGuideWireContact when the postal code DOES NOT contain a "-" at the end', () => {
    const result = transformCacheContacts([
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
    ]);

    expect(result).toEqual([
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
        primaryPhoneType: 'some-conctact-primary-phone-type'
      }
    ]);
  });
});
