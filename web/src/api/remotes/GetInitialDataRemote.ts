import { AxiosRequestConfig } from 'axios';
import { RemoteGet } from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { IGetInitialDataResponse } from '@lib/types';
import { GetInitialDataSource } from '../contracts';
import { APP_NAME } from '../../utils/LogCannonHelper';
import { HttpRequestHelper } from '../../utils/HttpRequestHelper';

export const GetInitialDataRemote = (
  endpoint: string,
  config?: AxiosRequestConfig,
  disableBrowserAPILog?: boolean
): GetInitialDataSource => {
  const headers = HttpRequestHelper.getHeaders();
  LogCannon.blast(`${APP_NAME} axios remote get`, { endpoint, ...headers });

  return RemoteGet<string, IGetInitialDataResponse>(endpoint, config, disableBrowserAPILog);
};
