import { AxiosRequestConfig } from 'axios';
import { RemotePost } from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { PolicyConversionSource, IPolicyConversionRequest } from '../contracts';
import type { IPolicyConversionResult } from '@ace-clublabs/iss-common-shared-claims-models';
import { APP_NAME } from '../../utils/LogCannonHelper';
import { HttpRequestHelper } from '../../utils/HttpRequestHelper';

export const PolicyConversionRemote = (
  endpoint: string,
  config?: AxiosRequestConfig,
  disableBrowserAPILog?: boolean
): PolicyConversionSource => {
  const headers = HttpRequestHelper.getHeaders();
  LogCannon.blast(`${APP_NAME} axios remote post`, { endpoint, ...headers });

  return RemotePost<IPolicyConversionRequest, IPolicyConversionResult>(
    endpoint,
    config,
    disableBrowserAPILog
  );
};
