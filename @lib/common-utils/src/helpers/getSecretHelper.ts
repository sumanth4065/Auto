import { Secrets } from '@ace-clublabs/aws-lambda-v3';

export const getSecretHelper = async (secretId: string): Promise<string> => {
  const secretsManager = new Secrets(process.env.AWS_REGION!);

  const response = await secretsManager.getSecretValue(secretId);

  return Promise.resolve(response.SecretString);
};
