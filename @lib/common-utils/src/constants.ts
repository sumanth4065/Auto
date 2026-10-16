import { LoggerOptions } from '@ace-clublabs/aws-lambda-logger';
import { TeamValue, WorkloadValue } from '@ace-clublabs/aws-tags';
import { version } from 'process';

export const SECRET_ID = 'adProxy/secrets/team/insuranceclaims';
export const SPLIT_IO_SECRET_ID = 'insuranceclaims/autoefnolwithoutlogin/splitioauthorizationkey';
export const GUIDEWIRE_SECRET_ID = 'insuranceclaims/guidewirehub/policycenter';

export enum EFNOLCacheTableName {
  ErrorCache = 'ErrorCache',
  ClaimNoAuthCache = 'ClaimNoAuthCache',
  BehindLoginPolicyCache = 'ISSCache'
}

const baseLoggerOptions: LoggerOptions = {
  team: TeamValue.InsuranceSelfService,
  workload: WorkloadValue.Claims,
  component: '',
  runtimeVersion: version,
  enableStackTraces: true
};

export const AutoEfnolLoggerOptions: LoggerOptions = {
  ...baseLoggerOptions,
  component: 'insurance-auto-efnol-no-auth-api'
};

export const splitIOSecretName = 'insuranceclaims/autoefnolwithoutlogin/splitioauthorizationkey';

export const BehindLoginAutoEfnolLoggerOptions: LoggerOptions = {
  ...baseLoggerOptions,
  component: 'insurance-auto-efnol-api'
};

export const commonConstants = {
  POLICY_UNAUTHORIZED: 'Customer not authorized to access the Policy',
  POLICY_AUTHORIZATION_MESSAGE: 'Verifying policy authorization with abilities',
  POLICY_BLOCKED: 'Policy is not allowed to perform this operation'
};
