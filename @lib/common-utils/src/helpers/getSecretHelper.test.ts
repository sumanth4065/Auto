import { Secrets } from '@ace-clublabs/aws-lambda-v3';
import { getSecretHelper } from './getSecretHelper';

const secretsManagerResponse = {
  Name: 'some-name',
  SecretString: 'some-key'
};

describe('getSecrestHelper', () => {
  const getSecretsSpy = jest.spyOn(Secrets.prototype, 'getSecretValue');

  getSecretsSpy.mockImplementation(() => Promise.resolve(secretsManagerResponse));

  it('retrieves expected secret data with appropiate arguments', async () => {
    const result = await getSecretHelper('some-region');

    expect(getSecretsSpy).toHaveBeenCalledTimes(1);
    expect(getSecretsSpy).toHaveBeenCalledWith('some-region');
    expect(result).toStrictEqual(secretsManagerResponse.SecretString);
  });
});
