import { Secrets } from '@ace-clublabs/aws-lambda-v3';

export interface GuideWireSecret {
  clientId: string;
  clientSecret: string;
}

export const getGuidewireSecrets = async (secretId: string): Promise<GuideWireSecret> => {
  const secretsManager = new Secrets(process.env.AWS_REGION);

  const response = await secretsManager.getSecretValue(secretId);
  const secretsJson = JSON.parse(response.SecretString);

  return Promise.resolve(secretsJson);
};
