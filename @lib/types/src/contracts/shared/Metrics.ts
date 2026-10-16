/**
 * Splunk dashboard KPI metrics for home efnol
 * Be careful changing these as this affects our dashboards
 */
export enum Metrics {
  CreateClaim = 'Create_claim',
  FlowDirector = 'Flow_Director',
  GetInitialData = 'Get_Initial_Data',
  GetPolicyInfo = 'Get_Policy_Info',
  SendEmail = 'Send_Email',
  SubmitClaim = 'Submit_claim',
  SubmitClaimRequestProxy = 'Submit_claim_Request_Proxy',
  GetClaimInfo = 'ENOL_Anonymous_Get_Claim_Info',
  PolicyConversion = 'Policy_Conversion'
}
