import {
  foundClaimInfoResponseFixture,
  IClaimsSummaryFrontendResponse,
  notFoundClaimInfoResponseFixture
} from '@lib/types';
import { GetAutoClaimInfoSource, IGetAutoClaimInfoRequest } from '../contracts';
import { sleep } from '../../utils/test-utils';

export const GetAutoClaimInfoStub: GetAutoClaimInfoSource =
  async (_body: IGetAutoClaimInfoRequest): Promise<IClaimsSummaryFrontendResponse> => {
    await sleep(1000); // This is here just to simulate a real waiting from the backend in stubs mode
    return Promise.resolve(notFoundClaimInfoResponseFixture);
    //return Promise.resolve(foundClaimInfoResponseFixture); // If test duplicated claim scenario please use foundClaimInfoResponseFixture
  };
