export enum AlertActionType {
  Started = 'ALERT_STARTED',
  Errored = 'ALERT_ERRORED'
}

export enum KnockOutActionType {
  Started = 'KNOCKOUT_STARTED',
  Completed = 'KNOCKOUT_COMPLETED',
  Errored = 'KNOCKOUT_ERRORED'
}

export enum ClearAddressType {
  Errored = 'CLEAR_ADDRESS_ERRORED'
}

export enum CreateAutoClaimActionType {
  Started = 'CREATE_AUTO_CLAIM_STARTED',
  Completed = 'CREATE_AUTO_CLAIM_COMPLETED',
  Errored = 'CREATE_AUTO_CLAIM_ERRORED'
}

export enum GetPolicyInfoDataActionType {
  Started = 'GET_POLICY_INFO_DATA_STARTED',
  Completed = 'GET_POLICY_INFO_DATA_COMPLETED',
  Errored = 'GET_POLICY_INFO_DATA_ERRORED'
}

export enum LoadReviewInfoActionType {
  Started = 'LOAD_REVIEW_INFO_STARTED',
  Completed = 'LOAD_REVIEW_INFO_COMPLETED',
  Errored = 'LOAD_REVIEW_INFO_ERRORED'
}

export enum SubmitAutoClaimActionType {
  Started = 'SUBMIT_AUTO_CLAIM_STARTED',
  Completed = 'SUBMIT_AUTO_CLAIM_COMPLETED',
  Errored = 'SUBMIT_AUTO_CLAIM_ERRORED'
}

export enum RedirectToSafeliteActionType {
  Started = 'REDIRECT_TO_SAFELITE_STARTED',
  Completed = 'REDIRECT_TO_SAFELITE_COMPLETED',
  Errored = 'REDIRECT_TO_SAFELITE_ERRORED'
}
