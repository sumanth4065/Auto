type Environment = 'dev' | 'qa' | 'uat' | 'prod';

export type FlowDirectorConfig = {
  [key in Environment]: { referrerURLv2: string };
};
export const getReferrerUrl = (
  urls: { flowDirector: FlowDirectorConfig },
  testEnvironment?: string
): string => {
  let referrerUrl: string = urls.flowDirector[process.env.ENVIRONMENT].referrerURLv2;

  if (testEnvironment?.toLowerCase() === 'b1')
    referrerUrl = referrerUrl.replace('1', '2');

  return referrerUrl;
};
