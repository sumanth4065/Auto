import { SPLIT_IO_SECRET_ID } from '../constants';
import { getSecretHelper } from './getSecretHelper';
import { RemoteAppConfigHelper } from './RemoteAppConfigHelper';
import { SplitIOFeatureFlags, SplitIOTreatment } from './splitIOUtils';

export interface SplitIOTreatmentResult {
  treatment: string;
  config?: string;
}

export class SplitIOHelper {

  public static getEnableIntegrationGateway = async logger => {
    let logInfo = {};
    const remoteAppConfig = new RemoteAppConfigHelper(logger);
    const splitIOAuthKey = await getSecretHelper(SPLIT_IO_SECRET_ID);
    logger.debug('Response received key for SplitIO from secrets manager', logInfo);
    remoteAppConfig.setKey(splitIOAuthKey);
    let treatmentResult: SplitIOTreatmentResult = { treatment: 'off' };

    try {
      logger.debug('Initializing remote app config', logInfo);
      await remoteAppConfig.initialize();

      treatmentResult.treatment = await remoteAppConfig.getTreatment(
        SplitIOFeatureFlags.ENABLE_AUTO_EFNOL_ANONYMOUS_INTEGRATION_GATEWAY,
        undefined,
        {}
      );

      logger.info('Retrieved Remote Feature flag', {
        ...logInfo,
        featureFlag: treatmentResult
      });
    } catch (e) {
      logger.warn('SplitIO connection failed', e);
      treatmentResult = { treatment: 'control', config: '' };
    }

    return treatmentResult.treatment === SplitIOTreatment.ON;
  };

  public static getEnableBehindLoginIntegrationGateway = async logger => {
    const remoteAppConfig = new RemoteAppConfigHelper(logger);
    const splitIOAuthKey = await getSecretHelper(SPLIT_IO_SECRET_ID);
    logger.debug('Response received key for SplitIO from secrets manager');
    remoteAppConfig.setKey(splitIOAuthKey);
    let treatmentResult: SplitIOTreatmentResult = { treatment: 'off' };

    try {
      logger.debug('Initializing remote app config');
      await remoteAppConfig.initialize();

      treatmentResult.treatment = await remoteAppConfig.getTreatment(
        SplitIOFeatureFlags.ENABLE_AUTO_EFNOL_BEHIND_LOGIN_INTEGRATION_GATEWAY,
        undefined,
        {}
      );

      logger.info('Retrieved Remote Feature flag', {
        featureFlag: treatmentResult
      });
    } catch (e) {
      logger.warn('SplitIO connection failed', e);
      treatmentResult = { treatment: 'control', config: '' };
    }

    return treatmentResult.treatment === SplitIOTreatment.ON;
  };

  public static getPolicyPrefixAllowed = async (logger, policyPrefix: string) => {
    const remoteAppConfig = new RemoteAppConfigHelper(logger);
    const splitIOAuthKey = await getSecretHelper(SPLIT_IO_SECRET_ID);
    logger.debug('Response received key for SplitIO from secrets manager');
    remoteAppConfig.setKey(splitIOAuthKey);
    let treatmentResult: SplitIOTreatmentResult = { treatment: 'off' };

    try {
      logger.debug('Initializing remote app config');
      await remoteAppConfig.initialize();

      treatmentResult.treatment = await remoteAppConfig.getTreatment(
        SplitIOFeatureFlags.AUTO_EFNOL_ALLOWED_POLICY_PREFIXES,
        undefined,
        { policyPrefix }
      );

      logger.info('Retrieved policy prefix feature flag', {
        policyPrefix,
        featureFlag: treatmentResult
      });
    } catch (e) {
      logger.warn('SplitIO connection failed', e);
      treatmentResult = { treatment: 'control', config: '' };
    }

    return treatmentResult.treatment === SplitIOTreatment.ON;
  };

}
