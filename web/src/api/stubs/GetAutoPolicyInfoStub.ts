import { IPolicyInfoAutoResponse, policyInfoResponseFixture } from '@lib/types';
import { GetAutoPolicyInfoSource } from '../contracts';
import { sleep } from '../../utils/test-utils';

export const GetAutoPolicyInfoStub: GetAutoPolicyInfoSource =
  async (): Promise<IPolicyInfoAutoResponse> => {
    await sleep(1000); // This is here just to simulate a real waiting from the backend in stubs mode
    return Promise.resolve(policyInfoResponseFixture);
  };
