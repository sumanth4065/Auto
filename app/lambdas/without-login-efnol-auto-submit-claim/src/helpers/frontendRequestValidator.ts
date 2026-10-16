import {
  ISubmitAutoClaimFrontendRequest,
  ISubmitAutoClaimRequestValidatorResult,
  SubmitAutoClaimValidationResult
} from '@lib/types';

//TODO: define the objects for this mapping
export const frontendRequestValidation = (
  request: ISubmitAutoClaimFrontendRequest
): ISubmitAutoClaimRequestValidatorResult => {
  if (!request)
    return {
      isValid: false,
      resultType: SubmitAutoClaimValidationResult.RequestPayloadMissing
    };
  if (!request.claimNumber)
    return {
      isValid: false,
      resultType: SubmitAutoClaimValidationResult.ClaimNumberMissing
    };
  if (!request.reporter)
    return {
      isValid: false,
      resultType: SubmitAutoClaimValidationResult.ReporterMissing
    };
  if (!request.lossVehicle?.vehicleId)
    return {
      isValid: false,
      resultType: SubmitAutoClaimValidationResult.LossVehicleListedMissingId
    };
  //TODO Add other validation tests - refer to the SubmitAutoClaimValidationResult for what to test for - WIP
  return {
    isValid: true,
    resultType: SubmitAutoClaimValidationResult.PassedAllValidations
  };
};
