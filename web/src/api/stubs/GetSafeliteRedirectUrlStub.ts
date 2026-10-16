import { ISafeliteRedirectUrlResponse, safeliteRedirectUrlResponseFixture } from '@lib/types';
import { GetSafeliteRedirectUrlSource } from '../contracts';
import { sleep } from '../../utils/test-utils';

export const GetSafeliteRedirectUrlStub: GetSafeliteRedirectUrlSource =
  async (): Promise<ISafeliteRedirectUrlResponse> => {
    await sleep(1000); // This is here just to simulate a real waiting from the backend in stubs mode
    return Promise.resolve(safeliteRedirectUrlResponseFixture);
  };
