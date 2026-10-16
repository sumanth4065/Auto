import { AxiosRequestConfig } from 'axios';
import { RemotePost } from '@ace-clublabs/iss-common-util';
import LogCannon from '@ace-clublabs/log-cannon';
import { IClaimsSummaryFrontendResponse } from '@lib/types';
import { GetAutoClaimInfoSource, IGetAutoClaimInfoRequest } from '../contracts';
import { APP_NAME } from '../../utils/LogCannonHelper';
import { HttpRequestHelper } from '../../utils/HttpRequestHelper';

export const GetAutoClaimInfoRemote = (
  endpoint: string,
  config?: AxiosRequestConfig,
  disableBrowserAPILog?: boolean
): GetAutoClaimInfoSource => {
  const headers = HttpRequestHelper.getHeaders();
  LogCannon.blast(`${APP_NAME} axios remote post`, { endpoint, ...headers });

  return RemotePost<IGetAutoClaimInfoRequest, IClaimsSummaryFrontendResponse>(
    endpoint,
    config,
    disableBrowserAPILog
  );
};
