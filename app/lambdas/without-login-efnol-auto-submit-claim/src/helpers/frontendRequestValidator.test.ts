import {
  ISubmitAutoClaimRequestValidatorResult,
  submitAutoClaimCarDrivenWithOneOtherParty,
  SubmitAutoClaimValidationResult
} from '@lib/types';
import { frontendRequestValidation } from './frontendRequestValidator';
import { ILossVehicle } from '@ace-clublabs/iss-common-auto-efnol-models';

describe('frontendRequestValidator', () => {
  let testResult: ISubmitAutoClaimRequestValidatorResult;
  it('should test for RequestPayloadMissing on the request', () => {
    testResult = frontendRequestValidation(null);
    expect(testResult).toEqual({
      isValid: false,
      resultType: SubmitAutoClaimValidationResult.RequestPayloadMissing
    });
  });
  it('should test for ClaimNumberMissing on the request', () => {
    const testRequestFixture = {
      ...submitAutoClaimCarDrivenWithOneOtherParty,
      claimNumber: undefined
    };
    testResult = frontendRequestValidation(testRequestFixture);
    expect(testResult).toEqual({
      isValid: false,
      resultType: SubmitAutoClaimValidationResult.ClaimNumberMissing
    });
  });
  it('should test for ReporterMissing on the request', () => {
    const testRequestFixture = {
      ...submitAutoClaimCarDrivenWithOneOtherParty,
      reporter: undefined
    };
    testResult = frontendRequestValidation(testRequestFixture);
    expect(testResult).toEqual({
      isValid: false,
      resultType: SubmitAutoClaimValidationResult.ReporterMissing
    });
  });
  it('should test for missing lossVehicle and lossVehicleId on the request', () => {
    const testRequestFixture = {
      ...submitAutoClaimCarDrivenWithOneOtherParty,
      lossVehicle: {} as ILossVehicle
    };
    testResult = frontendRequestValidation(testRequestFixture);
    expect(testResult).toEqual({
      isValid: false,
      resultType: SubmitAutoClaimValidationResult.LossVehicleListedMissingId
    });
  });
  //TODO - Fill in the rest of the test cases one at a time and implement code to pass these - ISS-3981
  it('should have a success case for all required data for all conditions is present on the request', () => {
    testResult = frontendRequestValidation(
      submitAutoClaimCarDrivenWithOneOtherParty
    );
    expect(testResult).toEqual({
      isValid: true,
      resultType: SubmitAutoClaimValidationResult.PassedAllValidations
    });
  });
});
