export enum AuthorizationAction {
  ViewPolicy = 'view-policy',
  ChangePolicy = 'change-policy',
  CompleteIQ = 'complete-questionnaire',
  MakePayment = 'make-payment',
  GetPoI = 'download-proof-of-insurance'
}

export interface IMappedPolicy {
  policyNumber: string;
  policyType: string;
  subType: string | null;
  sourceSystem: string;
  effectiveDate: string;
  expirationDate: string;
  active: boolean;
  abilities?: MappedInsuranceAbilities;
  productRole?: ProductRole;
  inRenewal?: boolean;
  status?: string;
}

export interface MappedInsuranceAbilities {
  canViewPolicy: boolean;
  canDoIQ: boolean;
  canDoPOI: boolean;
  canDoPayment: boolean;
  canChangePolicy: boolean;
}

export interface ProductRole {
  roleType: string;
  roleTypeDescription: string;
}
