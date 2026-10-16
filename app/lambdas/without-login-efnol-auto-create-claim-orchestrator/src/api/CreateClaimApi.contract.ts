import { IContext, IEvent } from '@ace-clublabs/aws-lambda-v3';
import {
  EfnolApplication,
  IAutoCreateClaimCanonicalRequestV2,
  IAutoCreateClaimCanonicalResponseV2,
  LoginFlowType
} from '@ace-clublabs/iss-common-auto-efnol-models';

export type CreateClaimV2 = (
  request: IAutoCreateClaimCanonicalRequestV2,
  event: IEvent,
  loginFlowType: LoginFlowType,
  context?: IContext,
  efnolApplication?: EfnolApplication
) => Promise<IAutoCreateClaimCanonicalResponseV2>;
