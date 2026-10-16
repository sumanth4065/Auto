import { AxiosRequestConfig } from 'axios';
import { RemoteGet } from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { ISafeliteRedirectUrlResponse } from '@lib/types';
import { GetSafeliteRedirectUrlSource } from '../contracts';
import { APP_NAME } from '../../utils/LogCannonHelper';
import { HttpRequestHelper } from '../../utils/HttpRequestHelper';

export const GetSafeliteRedirectUrlRemote = (
  endpoint: string,
  config?: AxiosRequestConfig,
  disableBrowserAPILog?: boolean
): GetSafeliteRedirectUrlSource => {
  const headers = HttpRequestHelper.getHeaders();
  LogCannon.blast(`${APP_NAME} axios remote get`, { endpoint, ...headers });

  return RemoteGet<undefined, ISafeliteRedirectUrlResponse>(endpoint, config, disableBrowserAPILog);
};
