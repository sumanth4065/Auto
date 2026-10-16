import {
  DEFAULT_MASK_OPTIONS_FOR_PII,
  DEFAULT_MASK_OPTIONS_FOR_CREDENTIALS,
  MaskData,
  maskJSONOptions
} from './MaskData';

describe('MaskData', () => {
  const options: maskJSONOptions = DEFAULT_MASK_OPTIONS_FOR_CREDENTIALS;

  it('it should mask the data as per the option fields for DEFAULT_MASK_OPTIONS_FOR_SECRETS', () => {
    const result = MaskData.maskJSONFields(
      logDataWithCredentials,
      DEFAULT_MASK_OPTIONS_FOR_CREDENTIALS
    );
    expect(result).toEqual({
      data: { customerId: '441331020101521', refreshCache: true },
      options: {
        headers: {
          Accept: 'application/json',
          Authorization: '*******',
          client_id: '*******',
          client_secret: '*******',
          'X-Ace-Mulesoft-Id': '*******',
          'X-Ace-Mulesoft-Secret': '*******',
          'X-Ace-Guidewire-Id': '*******',
          'X-Ace-Guidewire-Secret': '*******'
        }
      }
    });
  });

  it('it should mask the data as per the option fields for DEFAULT_MASK_OPTIONS_FOR_PII', () => {
    const result = MaskData.maskJSONFields(logDataWithPii, DEFAULT_MASK_OPTIONS_FOR_PII);
    expect(result).toEqual({
      data: {
        customerId: '441331020101521',
        refreshCache: true,
        policyNumber: 'some-policy-number',
        email: '*******',
        membership: {
          membershipNumber: '*******',
          membershipNumberEmail: '*******',
          firstName: 'some-name'
        }
      }
    });
  });
});

const logDataWithCredentials: any = {
  data: {
    customerId: '441331020101521',
    refreshCache: true
  },
  options: {
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs',
      client_id: '0783a456d01744be98cb27649e7bad62',
      client_secret: 'A2E385270fBC477Db221131f088af097',
      'X-Ace-Mulesoft-Id': 'some-mulesoft-id',
      'X-Ace-Mulesoft-Secret': 'some-mulesoft-secret',
      'X-Ace-Guidewire-Id': 'some-guidewire-id',
      'X-Ace-Guidewire-Secret': 'some-guidewire-secret'
    }
  }
};

const logDataWithPii: any = {
  data: {
    customerId: '441331020101521',
    refreshCache: true,
    email: 'some-email',
    membership: {
      membershipNumber: 'some-membership-number',
      membershipNumberEmail: 'some-membership-email',
      firstName: 'some-name'
    },
    policyNumber: 'some-policy-number'
  }
};
