import { AxiosRequestConfig } from 'axios';
import { RemotePut } from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { ISubmitAutoClaimFrontendRequest, ISubmitAutoClaimFrontendResponse } from '@lib/types';
import { SubmitAutoClaimSource } from '../contracts';
import { APP_NAME } from '../../utils/LogCannonHelper';
import { HttpRequestHelper } from '../../utils/HttpRequestHelper';

export const SubmitAutoClaimRemote = (
  endpoint: string,
  config?: AxiosRequestConfig,
  disableBrowserAPILog?: boolean
): SubmitAutoClaimSource => {
  const headers = HttpRequestHelper.getHeaders();
  LogCannon.blast(`${APP_NAME} axios remote put`, { endpoint, ...headers });

  return RemotePut<ISubmitAutoClaimFrontendRequest, ISubmitAutoClaimFrontendResponse>(
    endpoint,
    config,
    disableBrowserAPILog
  );
};
