import { Secrets } from '@ace-clublabs/aws-lambda-v3';
import { getGuidewireSecrets } from './getGuidewireSecrets';

const secretsManagerResponse = {
  Name: 'some-name',
  SecretString: JSON.stringify({
    clientId: 'some-guidewire-id',
    clientSecret: 'some-guidewire-secret'
  })
};

describe('getSecrestHelper', () => {
  const getSecretsSpy = jest.spyOn(Secrets.prototype, 'getSecretValue');

  getSecretsSpy.mockImplementation(() => Promise.resolve(secretsManagerResponse));

  it('retrieves expected secret data with appropiate arguments', async () => {
    const result = await getGuidewireSecrets('guideire-secret-id');

    expect(getSecretsSpy).toHaveBeenCalledTimes(1);
    expect(getSecretsSpy).toHaveBeenCalledWith('guideire-secret-id');
    expect(result).toStrictEqual({
      clientId: 'some-guidewire-id',
      clientSecret: 'some-guidewire-secret'
    });
  });
});
