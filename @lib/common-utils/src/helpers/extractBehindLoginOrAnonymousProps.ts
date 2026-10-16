import { MaskedLogger as Logger } from '@ace-clublabs/aws-lambda-logger';
import { Cache } from '@ace-clublabs/iss-common-lambda-v3';
import { EfnolApplication } from '@ace-clublabs/iss-common-auto-efnol-models';
import { lookupPolicy } from '@ace-clublabs/iss-common-util';
import { LoginFlowType } from '@lib/shared-contracts';
import { extractPolicyNumberFromToken as extractPolicyNumberFromAnonymousToken } from './TokenHelper';

const logger = Logger.getInstance();
const autoAndHomeBehindLoginCache = new Cache('ISSCache');

export interface IExtractBehindLoginOrAnonymousPropsResult {
  policyNumber: string;
  loginFlowType: LoginFlowType;
  efnolApplication: EfnolApplication;
  clubCode?: string;
}

interface IBehindLoginCacheData {
  policy: string;
  clubCode?: string;
}

export const extractBehindLoginOrAnonymousProps = async (
  policyGuid: string | null,
  token: string
): Promise<IExtractBehindLoginOrAnonymousPropsResult> => {
  let policyNumber;
  if (!policyGuid) {
    policyNumber = extractPolicyNumberFromAnonymousToken(token) as string;
    if (lookupPolicy(policyNumber)) {
      return {
        policyNumber,
        loginFlowType: LoginFlowType.ANONYMOUS,
        efnolApplication: EfnolApplication.AutoEfnol1stPartyAnonymous
      };
    } else {
      throw new Error('Invalid AnonymousPolicy Number');
    }
  } else if (isGuid(policyGuid)) {
    logger.debug('Calling ISSCache to get Behind Login Policy Number');
    const issCacheResponse = await autoAndHomeBehindLoginCache.findItem(policyGuid);
    const count = issCacheResponse?.Count;

    if (typeof count === 'undefined' || count === 0) {
      logger.warn(`Policy number not found with guid: ${policyGuid}.`);
      throw new Error(`Behind Login Policy Number not found with guid: ${policyGuid}.`);
    }
    logger.debug('Response received from BL claims iss cache', { issCacheResponse });
    const cacheItem = issCacheResponse?.Items?.pop();
    if (!cacheItem?.data?.S) {
      const message = `Cache item or its data is missing for guid: ${policyGuid}.`;
      logger.warn(message);
      throw new Error(message);
    }
    let parsedCacheData: IBehindLoginCacheData;
    try {
      parsedCacheData = JSON.parse(cacheItem.data.S) as IBehindLoginCacheData;
    } catch (parseError) {
      const message = `Failed to parse cache data for guid: ${policyGuid}.`;
      logger.warn(message, { parseError });
      throw new Error(message);
    }
    policyNumber = parsedCacheData.policy;
    return {
      policyNumber,
      loginFlowType: LoginFlowType.BEHIND_LOGIN,
      efnolApplication: EfnolApplication.AutoEfnol1stPartyBehindLogin,
      clubCode: parsedCacheData.clubCode
    };
  } else {
    logger.warn('Invalid Guid or Behind Login Policy Number', { policyGuid });
    throw new Error('Invalid Guid or Policy Number');
  }
};

function isGuid(str: string): boolean {
  const legacyGuidRegex =
    /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{1}$/i;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return legacyGuidRegex.test(str) || uuidRegex.test(str);
}
