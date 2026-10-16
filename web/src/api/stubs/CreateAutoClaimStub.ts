import { sleep } from '../../utils/test-utils';
import { CreateAutoClaimSource } from '../contracts';
import {
  createAutoClaimResponseWithDriversAndVehicles,
  ICreateAutoClaimRequest,
  ICreateAutoClaimResponse
} from '@lib/types';

export const CreateAutoClaimStub: CreateAutoClaimSource = async (
  request: ICreateAutoClaimRequest
): Promise<ICreateAutoClaimResponse> => {
  await sleep(3000); // This is here just to simulate a real waiting from the backend in stubs mode
  return Promise.resolve(createAutoClaimResponseWithDriversAndVehicles);
};
