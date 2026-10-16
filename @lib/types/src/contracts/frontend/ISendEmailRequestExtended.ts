import { ISendEmailRequest } from '@ace-clublabs/iss-common-util';
import { LoginFlowType } from '@ace-clublabs/iss-common-auto-efnol-models';

export interface ISendEmailRequestExtended extends ISendEmailRequest {
  loginFlowType: LoginFlowType;
  policyPrefix: string;
  policyTenant: string;
}
