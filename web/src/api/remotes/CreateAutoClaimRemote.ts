import { AxiosRequestConfig } from 'axios';
import { RemotePost } from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { ICreateAutoClaimRequest, ICreateAutoClaimResponse } from '@lib/types';
import { CreateAutoClaimSource } from '../contracts';
import { APP_NAME } from '../../utils/LogCannonHelper';
import { HttpRequestHelper } from '../../utils/HttpRequestHelper';

export const CreateAutoClaimRemote = (
  endpoint: string,
  config?: AxiosRequestConfig,
  disableBrowserAPILog?: boolean
): CreateAutoClaimSource => {
  const headers = HttpRequestHelper.getHeaders();
  LogCannon.blast(`${APP_NAME} axios remote post`, { endpoint, ...headers });

  return RemotePost<ICreateAutoClaimRequest, ICreateAutoClaimResponse>(
    endpoint,
    config,
    disableBrowserAPILog
  );
};
