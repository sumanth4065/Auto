import { ClubCodes } from '@ace-clublabs/iss-common-util';
import { SPLIT_IO_SECRET_ID } from '../constants';
import { getSecretHelper } from './getSecretHelper';
import { SplitIOFeatureFlags, SplitIOTreatment } from './splitIOUtils';
import { RemoteAppConfigHelper } from './RemoteAppConfigHelper';
export interface TreatmentResult {
  treatment: string;
  config?: string;
}

export const getPolicyConversionDateAllowed = async (
  clubCode: ClubCodes,
  policyEffectiveDate: string,
  logger
) => {
  let logInfo = { clubCode };
  const remoteAppConfig = new RemoteAppConfigHelper(logger);
  const splitIOAuthKey = await getSecretHelper(SPLIT_IO_SECRET_ID);
  logger.debug('Response received key for SplitIO from secrets manager', logInfo);
  remoteAppConfig.setKey(splitIOAuthKey);
  let treatmentResult: TreatmentResult = { treatment: 'off' };

  try {
    logger.debug('Initializing remote app config', logInfo);
    await remoteAppConfig.initialize();

    treatmentResult.treatment = await remoteAppConfig.getTreatment(
      SplitIOFeatureFlags.AUTO_EFNOL_WITHOUT_LOGIN_ALLOW_MARKET_BY_CLUB_CODE,
      undefined,
      {
        clubcode: clubCode,
        policyConversionDateOnOrAfter: Date.parse(policyEffectiveDate)
      }
    );

    logger.info('Retrieved Remote Feature flag', {
      ...logInfo,
      featureFlag: treatmentResult
    });
  } catch (e) {
    logger.warn('SplitIO connection failed', e);
    treatmentResult = { treatment: 'control', config: '' };
  }

  //Need to know what comes in the treatmentResult.treatment
  return treatmentResult.treatment === SplitIOTreatment.ON;
};
