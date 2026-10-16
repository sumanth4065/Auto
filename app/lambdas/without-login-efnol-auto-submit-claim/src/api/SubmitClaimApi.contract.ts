import { IContext } from '@ace-clublabs/aws-lambda-v3';
import {
  EfnolApplication,
  IAutoSubmitClaimCanonicalResponseV2,
  IAutoSubmitClaimCanonicalRequestV2,
  LoginFlowType
} from '@ace-clublabs/iss-common-auto-efnol-models';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';

export type SubmitClaimV2 = (
  request: IAutoSubmitClaimCanonicalRequestV2,
  authBearer: string,
  loggerInstance: MaskedLogger,
  context: IContext,
  requestHeaders: {
    [key: string]: string;
  },
  loginFlowType: LoginFlowType,
  efnolApplication?: EfnolApplication
) => Promise<IAutoSubmitClaimCanonicalResponseV2>;
