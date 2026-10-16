import { PolicyData } from '@ace-clublabs/iss-common-util';

export interface IExtendedPolicyData extends PolicyData {
  ERSURL: string;
  sourceApp?: string;
}
