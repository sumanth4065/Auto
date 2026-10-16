import { AxiosRequestConfig } from 'axios';
import { RemoteGet } from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { IPolicyInfoAutoResponse } from '@lib/types';
import { GetAutoPolicyInfoSource } from '../contracts';
import { APP_NAME } from '../../utils/LogCannonHelper';
import { HttpRequestHelper } from '../../utils/HttpRequestHelper';

export const GetAutoPolicyInfoRemote = (
  endpoint: string,
  config?: AxiosRequestConfig,
  disableBrowserAPILog?: boolean
): GetAutoPolicyInfoSource => {
  const headers = HttpRequestHelper.getHeaders();
  LogCannon.blast(`${APP_NAME} axios remote get`, { endpoint, ...headers });

  return RemoteGet<null, IPolicyInfoAutoResponse>(endpoint, config, disableBrowserAPILog);
};
