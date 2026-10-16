import { IPersonInfo, YesNoUnknown } from '@ace-clublabs/iss-common-auto-efnol-models';

export interface IAnyWitness {
  selection: YesNoUnknown;
  witnessInformation?: IPersonInfo;
}
