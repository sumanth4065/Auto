import { getDriverFromCache } from './getDriverFromCache';

import { GuideWirePolicyRole, ICachedAutoContact } from '@lib/types';

const testCachedAutoContactInsuredRole: ICachedAutoContact = {
  contactId: 'some-driver-id',
  firstName: 'some-first-name',
  lastName: 'some-last-name',
  displayName: 'some-display-name',
  policyRole: 'insured'
};

const testCachedAutoContactExcludedRole: ICachedAutoContact = {
  contactId: 'some-driver-id',
  firstName: 'some-first-name',
  lastName: 'some-last-name',
  displayName: 'some-display-name',
  policyRole: 'excludedparty'
};
describe('getDriverFromCache - policyRole is insured', () => {
  it(`should return a driver object with insured for policyRole for a valid Loss Driver Id representing an 
    insured driver policy role`, () => {
    let mockICacheAutoContactArray: ICachedAutoContact[] = [
      testCachedAutoContactInsuredRole
    ];

    let result = getDriverFromCache(
      mockICacheAutoContactArray,
      'some-driver-id'
    );

    expect(result).toEqual({
      firstName: 'some-first-name',
      lastName: 'some-last-name',
      displayName: 'some-display-name',
      policyRole: 'insured' as GuideWirePolicyRole
    });
  });

  it('should throw Error: `Unable to find a matching driver` for invalid given Loss Driver Id', () => {
    let mockICacheAutoContactArray: ICachedAutoContact[] = [
      testCachedAutoContactInsuredRole
    ];

    try {
      let result = getDriverFromCache(
        mockICacheAutoContactArray,
        'invalid-driver-id'
      );
    } catch (err) {
      expect(err.message).toEqual('Unable to find a matching driver');
    }
  });
});

describe('getDriverFromCache - policyRole is excludedparty', () => {
  it(`should return a driver object with excludedparty for policyRole for a valid Loss Driver Id representing an 
    excluded driver policy role`, () => {
    let mockICacheAutoContactArray: ICachedAutoContact[] = [
      testCachedAutoContactExcludedRole
    ];

    let result = getDriverFromCache(
      mockICacheAutoContactArray,
      'some-driver-id'
    );

    expect(result).toEqual({
      firstName: 'some-first-name',
      lastName: 'some-last-name',
      displayName: 'some-display-name',
      policyRole: 'excludedparty'
    });
  });
});
