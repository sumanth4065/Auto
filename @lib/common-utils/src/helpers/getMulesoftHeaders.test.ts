import { IApiAuthentication } from '@lib/types';
import { getMulesoftHeaders } from './getMulesoftHeaders';

const mockHeaders: IApiAuthentication = {
  bearerToken: 'some-bearer-token',
  clientId: 'some-client-id',
  clientSecret: 'some-client-secrets'
};

describe('getMulesoftHeaders', () => {
  it('should return base64 encoded GWUserContext', () => {
    const result = getMulesoftHeaders({ ...mockHeaders }, 'some-policy-number');

    expect(result).toEqual({
      GWUserContext:
        'eyJjYy5zZXJ2aWNlLmVkZ2UudXNlci5hdXRob3JpdGllcyI6Imd1aWRld2lyZS5lZGdlLnBvbGljeS5zb21lLXBvbGljeS1udW1iZXIuQUxMIn0=',
      bearerToken: 'some-bearer-token',
      clientId: 'some-client-id',
      clientSecret: 'some-client-secrets'
    });
  });

  describe('negative scenarios', () => {
    it('should throw an exception when policy number is empty', () => {
      try {
        getMulesoftHeaders({ ...mockHeaders }, '');
      } catch (e) {
        expect(e.toString()).toEqual('Error: property policyNumber is missing');
      }
    });
    it('should throw an exception when policy number is null', () => {
      try {
        getMulesoftHeaders({ ...mockHeaders }, null);
      } catch (e) {
        expect(e.toString()).toEqual('Error: property policyNumber is missing');
      }
    });
    it('should throw an exception when policy number is undefined', () => {
      try {
        getMulesoftHeaders({ ...mockHeaders }, undefined);
      } catch (e) {
        expect(e.toString()).toEqual('Error: property policyNumber is missing');
      }
    });
  });
});
