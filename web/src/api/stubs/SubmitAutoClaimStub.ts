import { sleep } from '../../utils/test-utils';
import { SubmitAutoClaimSource } from '../contracts';
import {
  submitAutoClaimFrontendResponseFixture,
  ISubmitAutoClaimFrontendRequest,
  ISubmitAutoClaimFrontendResponse
} from '@lib/types';

export const SubmitAutoClaimStub: SubmitAutoClaimSource = async (
  request: ISubmitAutoClaimFrontendRequest
): Promise<ISubmitAutoClaimFrontendResponse> => {
  await sleep(3000); // This is here just to simulate a real waiting from the backend in stubs mode
  return Promise.resolve(submitAutoClaimFrontendResponseFixture);
};
