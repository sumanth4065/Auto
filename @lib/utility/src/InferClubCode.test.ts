import { inferClubCode } from './InferClubCode';
import type { ClubCode } from '@ace-clublabs/iss-common-util';
import * as IssCommonUtil from '@ace-clublabs/iss-common-util';

jest.mock('@ace-clublabs/iss-common-util', () => ({
  ...jest.requireActual('@ace-clublabs/iss-common-util'),
  lookupPolicy: jest.fn(jest.requireActual('@ace-clublabs/iss-common-util').lookupPolicy)
}));

const mockPolicyNumber = 'RIA12345678';
const mockInvalidPolicyNumber = 'RIH12345678';

describe('InferClubcode', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return the expected clubcode from a given supported policy', () => {
    let result = inferClubCode(mockPolicyNumber);
    expect(result).toEqual('240');

    result = inferClubCode('TPA123456789'); //HUON policy
    expect(result).toEqual('252');
    result = inferClubCode('ATX123456789'); //Converted GW Policy
    expect(result).toEqual('252');

    result = inferClubCode('CAA123456789'); //HUON policy
    expect(result).toEqual('004');
    result = inferClubCode('ACA123456789'); //Converted GW Policy
    expect(result).toEqual('004');

    result = inferClubCode('AAL123456789'); //Converted GW Policy
    expect(result).toEqual('001');

    result = inferClubCode('NMA123456789'); //HUON Policy
    expect(result).toEqual('601');

    result = inferClubCode('VAA123456789'); //HUON Policy
    expect(result).toEqual('258');

    // PolicyStar auto policies with 'A' prefix - returns undefined (club code cannot be inferred)
    result = inferClubCode('A123456789'); //PolicyStar Auto policy
    expect(result).toBeUndefined();
  });

  it('should return undefined for a WInsurance policy number without throwing', () => {
    const result = inferClubCode('12345678');
    expect(result).toBeUndefined();
  });

  it('should throw an exception when given a policy in an unsupported market', () => {
    jest.spyOn(IssCommonUtil, 'lookupPolicy').mockReturnValueOnce({
      prefix: 'ZZZ',
      tenant: 'HUON',
      productType: 'AUTO',
      clubCode: '999' as ClubCode // unsupported club code
    });

    expect(() => inferClubCode('ZZZ123456')).toThrow(new Error('Market not supported'));
  });

  it('should throw an exception when given a invalid policy', () => {
    let result;
    try {
      inferClubCode(mockInvalidPolicyNumber);
    } catch (e) {
      result = e;
    } finally {
      expect(result).toEqual(new Error('Policy not valid'));
    }
  });
});
