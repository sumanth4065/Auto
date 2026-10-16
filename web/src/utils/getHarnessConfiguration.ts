import { Environments, getEnvironmentFromHost } from '../api/endpoints';

export const getHarnessConfiguration = () => {
  const envWithTestRegion: Exclude<Environments, 'stage'> = getEnvironmentFromHost(
    window.location.host
  );
  const env =
    envWithTestRegion === Environments.prod
      ? envWithTestRegion.toLocaleUpperCase()
      : envWithTestRegion.slice(0, -1).toLocaleUpperCase();
  return {
    userId: 'ISS-CLAIMS',
    clientSecretId: import.meta.env[`VITE_HARNESS_CLIENT_SECRET_ID_${env}`] ?? ''
  };
};
