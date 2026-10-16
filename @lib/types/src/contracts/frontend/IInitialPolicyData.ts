import type { IPolicyConversionResult } from '@ace-clublabs/iss-common-shared-claims-models';
import { AppSource } from './appSource';
export interface IInitialPolicyData {
  policy: string;
  claim: string;
  clubCode: string;
  mode: string;
  isMobileApp?: boolean;
  area?: string;
  EnableSplash: boolean;
  SplashStart?: string;
  SplashEnd?: string;
  ERSURL: string;
  email?: string;
  mobileNumber?: string;
  conversionResult?: IPolicyConversionResult;
}
export interface IGetInitialDataResponse {
  sourceApp: AppSource;
  policyData: IInitialPolicyData;
}
