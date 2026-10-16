import { ConfigOptions, createRequestConfig } from '@ace-clublabs/iss-common-util';
import { LoginFlowType } from '@lib/shared-contracts';

import {
  CreateAutoClaimSource,
  GetSafeliteRedirectUrlSource,
  SubmitAutoClaimSource,
  GetAutoPolicyInfoSource,
  GetAutoClaimInfoSource,
  GetInitialDataSource,
  PolicyConversionSource
} from './contracts';
import { endpoints } from './endpoints';
import {
  CreateAutoClaimRemote,
  GetSafeliteRedirectUrlRemote,
  SubmitAutoClaimRemote,
  GetAutoPolicyInfoRemote,
  GetAutoClaimInfoRemote,
  GetInitialDataRemote,
  PolicyConversionRemote
} from './remotes';
import {
  CreateAutoClaimStub,
  GetSafeliteRedirectUrlStub,
  SubmitAutoClaimStub,
  GetAutoPolicyInfoStub,
  GetAutoClaimInfoStub,
  GetInitialDataStub,
  PolicyConversionStub
} from './stubs';
import { HttpRequestHelper } from '../utils/HttpRequestHelper';

export interface Sources {
  createAutoClaim: CreateAutoClaimSource;
  getSafeliteRedirectUrl: GetSafeliteRedirectUrlSource;
  submitAutoClaim: SubmitAutoClaimSource;
  getAutoPolicyInfo: GetAutoPolicyInfoSource;
  getAutoClaimInfo: GetAutoClaimInfoSource;
  getInitialData: (id: string) => GetInitialDataSource;
  getPolicyConversion: PolicyConversionSource;
}

export function sources(
  authToken: string,
  policyGuid: string,
  loginFlowType?: LoginFlowType,
  src?: string,
  brand?: 'AAA' | 'WInsurance'
): Sources {
  // Validate policyGuid for BEHIND_LOGIN flow
  if (loginFlowType === LoginFlowType.BEHIND_LOGIN && !policyGuid && isRemoteEnv(src)) {
    window.location.href = '/error';
    // Return stubs to prevent errors while redirecting
  }

  const stubs: Sources = {
    createAutoClaim: CreateAutoClaimStub,
    getSafeliteRedirectUrl: GetSafeliteRedirectUrlStub,
    submitAutoClaim: SubmitAutoClaimStub,
    getAutoPolicyInfo: GetAutoPolicyInfoStub,
    getAutoClaimInfo: GetAutoClaimInfoStub,
    getInitialData: () => GetInitialDataStub,
    getPolicyConversion: PolicyConversionStub
  };

  if (!isRemoteEnv(src)) {
    return stubs;
  }

  const disableBrowserAPILog = import.meta.env.DISABLE_BROWSER_LOGS === 'true';

  const options: ConfigOptions = { requestId: HttpRequestHelper.getUUID(), headerInfo: {} };

  const requestConfig = createRequestConfig(authToken, options);

  // Only add policyGuid for BEHIND_LOGIN flow
  const shouldAddPolicyGuid = loginFlowType === LoginFlowType.BEHIND_LOGIN && policyGuid;

  const remotes: Sources = {
    createAutoClaim: CreateAutoClaimRemote(
      `${endpoints.createAutoClaimUrl}${shouldAddPolicyGuid ? `?policyGuid=${encodeURIComponent(policyGuid)}` : ''}`,
      requestConfig,
      disableBrowserAPILog
    ),
    getSafeliteRedirectUrl: GetSafeliteRedirectUrlRemote(
      (() => {
        const safeliteParams = new URLSearchParams();
        if (shouldAddPolicyGuid) safeliteParams.set('policyGuid', policyGuid);
        if (brand) safeliteParams.set('brand', brand);
        const qs = safeliteParams.toString();
        return `${endpoints.getSafeliteRedirectUrl}${qs ? `?${qs}` : ''}`;
      })(),
      requestConfig,
      disableBrowserAPILog
    ),
    submitAutoClaim: SubmitAutoClaimRemote(
      `${endpoints.submitAutoClaimUrl}${shouldAddPolicyGuid ? `?policyGuid=${encodeURIComponent(policyGuid)}` : ''}`,
      requestConfig,
      disableBrowserAPILog
    ),
    getAutoPolicyInfo: GetAutoPolicyInfoRemote(
      `${endpoints.getAutoPolicyInfo}${shouldAddPolicyGuid ? `?policyGuid=${encodeURIComponent(policyGuid)}` : ''}`,
      requestConfig,
      disableBrowserAPILog
    ),

    getAutoClaimInfo: GetAutoClaimInfoRemote(
      `${endpoints.getAutoClaimInfo}${shouldAddPolicyGuid ? `?policyGuid=${encodeURIComponent(policyGuid)}` : ''}`,
      requestConfig,
      disableBrowserAPILog
    ),
    getInitialData: id =>
      GetInitialDataRemote(
        `${endpoints.getInitialDataUrl}/${id}`,
        requestConfig,
        disableBrowserAPILog
      ),
    getPolicyConversion: PolicyConversionRemote(
      `${endpoints.policyConversionUrl}${shouldAddPolicyGuid ? `?policyGuid=${encodeURIComponent(policyGuid)}` : ''}`,
      requestConfig,
      disableBrowserAPILog
    )
  };
  return remotes;
}

function isRemoteEnv(src?: string) {
  if (src === 'remote') {
    return true;
  } // unit test only
  if (!src && import.meta.env.MODE === 'production') {
    return true;
  }
  return false;
}
