import {
  createAutoClaimBackendResponseFixture,
  ICreateAutoClaimBackendResponse,
  IGuideWireAdjusterNote,
  ISubmitAutoClaimBackendRequest,
  ISubmitAutoClaimFrontendRequest,
  OtherNonVehicleParties,
  submitAutoClaimBackendRequestFixtureWithLossDateAndLossTimeObjects,
  submitAutoClaimCarDrivenWithOneOtherParty
} from '@lib/types';
import { dtoDeepClone } from '@ace-clublabs/iss-common-util';
import { createAdjusterNote } from './createAdjusterNote';
import { PassengerCount, VehicleCount, YesNo, YesNoUnknown } from '@ace-clublabs/iss-common-auto-efnol-models';

describe('createAdjusterNote', () => {
  let testRequestBody: ISubmitAutoClaimFrontendRequest;
  let testCreateClaimBackendResponse: ICreateAutoClaimBackendResponse;
  let testSubmitClaimBackendRequest: ISubmitAutoClaimBackendRequest;
  let subject: string;
  let lineDelimiter: string = ' | ';
  let result: IGuideWireAdjusterNote;
  beforeEach(() => {
    subject = 'eFNOL';
    testRequestBody = dtoDeepClone(submitAutoClaimCarDrivenWithOneOtherParty);
    testCreateClaimBackendResponse = dtoDeepClone(createAutoClaimBackendResponseFixture);
    testSubmitClaimBackendRequest = dtoDeepClone(
      submitAutoClaimBackendRequestFixtureWithLossDateAndLossTimeObjects
    );
  });

  it('should have subject as eFNOL', () => {
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.subject).toEqual('eFNOL');
  });

  it('should include the phrase "No third party vehicles involved" when incidentOtherVehicleCount value is none', () => {
    testRequestBody.incidentOtherVehicleCount = VehicleCount.None;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[0]).toEqual('No third party vehicles involved');
  });

  it('should include "One third party vehicle involved" when the value is one', () => {
    testRequestBody.incidentOtherVehicleCount = VehicleCount.One;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[0]).toEqual('One third party vehicle involved');
  });

  it('should include "Two or more third party vehicles involved" when the value is two or more', () => {
    testRequestBody.incidentOtherVehicleCount = VehicleCount.TwoOrMore;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[0]).toEqual(
      'Two or more third party vehicles involved'
    );
  });

  it(`should include insuredVehicle's PassengerCount as the phrase "unknown number of passengers" when the value of passengerCount is None`, () => {
    testRequestBody.lossVehicle.passengerCount = PassengerCount.None;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(' | ')[1]).toEqual(
      'IV: 2001 FORD, unknown number of passengers, injury indicated'
    );
  });

  it(`should include insuredVehicle's PassengerCount as the phrase "unknown number of passengers" when the value of passengerCount is one`, () => {
    testRequestBody.lossVehicle.passengerCount = PassengerCount.One;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(' | ')[1]).toEqual(
      'IV: 2001 FORD, unknown number of passengers, injury indicated'
    );
  });

  it(`should include correct insuredVehicles's PassengerCount when the value is not None nor One`, () => {
    let vehicleCount = [
      PassengerCount.Two,
      PassengerCount.Three,
      PassengerCount.Four,
      PassengerCount.FiveOrMore
    ];
    vehicleCount.forEach(cnt => {
      testRequestBody.lossVehicle.passengerCount = cnt;
      result = createAdjusterNote(
        lineDelimiter,
        subject,
        testRequestBody,
        testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
      );
      expect(result.body.split(lineDelimiter)[1]).toEqual(
        `IV: 2001 FORD, unknown number of passengers, injury indicated`
      );
    });
  });

  it(`should include insuredVehicle's "injury not indicated" when hadInjuries No was marked on the lossVehicle`, () => {
    testRequestBody.lossVehicle.hadInjuries = YesNoUnknown.No;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[1]).toEqual(
      'IV: 2001 FORD, unknown number of passengers, injury not indicated'
    );
  });

  it(`should include insuredVehicle's "injury not indicated" when hadInjuries Unknown was marked on the lossVehicle`, () => {
    testRequestBody.lossVehicle.hadInjuries = YesNoUnknown.Unknown;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[1]).toEqual(
      'IV: 2001 FORD, unknown number of passengers, injury not indicated'
    );
  });

  it(`should include insuredVehicle's ", injury indicated" when hadInjuries Yes was marked on the lossVehicle`, () => {
    testRequestBody.lossVehicle.passengerCount = PassengerCount.One;
    testRequestBody.lossVehicle.hadInjuries = YesNoUnknown.Yes;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[1]).toEqual(
      'IV: 2001 FORD, unknown number of passengers, injury indicated'
    );
  });

  it(`should include CV line "<number of passengers> passengers or passenger plus ", injury indicated" when third party Vehicle's year, make, model is not known 
    but hadInjuries was marked Yes on a singleOtherPartyVehicle`, () => {
    delete testRequestBody.incidentSingleOtherVehicle.vehicleInfo;
    testRequestBody.incidentSingleOtherVehicle.hadInjuries = YesNoUnknown.Yes;
    testRequestBody.incidentSingleOtherVehicle.passengerCount = PassengerCount.None;
    testRequestBody.incidentOtherVehicleCount = VehicleCount.One;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[2]).toEqual(
      'CV: unknown number of passengers, injury indicated'
    );
  });

  it(`should include CV line "unknown number of passengers" when third party Vehicle's year, make, model is not known but <number of passengers> was marked unknown and hadInjuries was marked No on a singleOtherPartyVehicle`, () => {
    delete testRequestBody.incidentSingleOtherVehicle.vehicleInfo;
    testRequestBody.incidentSingleOtherVehicle.hadInjuries = YesNoUnknown.No;
    testRequestBody.incidentSingleOtherVehicle.passengerCount = PassengerCount.Unknown;
    testRequestBody.incidentOtherVehicleCount = VehicleCount.One;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[2]).toEqual(
      'CV: unknown number of passengers, injury not indicated'
    );
  });

  it(`should include CV line "unknown number of passengers" when third party Vehicle's year, make, model is not known but <number of passengers> was marked unknown and hadInjuries was marked No on a singleOtherPartyVehicle`, () => {
    delete testRequestBody.incidentSingleOtherVehicle.vehicleInfo;
    testRequestBody.incidentSingleOtherVehicle.hadInjuries = YesNoUnknown.Yes;
    testRequestBody.incidentSingleOtherVehicle.passengerCount = PassengerCount.Unknown;
    testRequestBody.incidentOtherVehicleCount = VehicleCount.One;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[2]).toEqual(
      'CV: unknown number of passengers, injury indicated'
    );
  });

  it(`should include CV line "<number of passengers> passenger or passengers" when third party Vehicle's year, make, model is not known but <number of passengers> was marked and hadInjuries was marked No on a singleOtherPartyVehicle`, () => {
    delete testRequestBody.incidentSingleOtherVehicle.vehicleInfo;
    testRequestBody.incidentSingleOtherVehicle.hadInjuries = YesNoUnknown.No;
    testRequestBody.incidentSingleOtherVehicle.passengerCount = PassengerCount.FiveOrMore;
    testRequestBody.incidentOtherVehicleCount = VehicleCount.One;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[2]).toEqual(
      'CV: unknown number of passengers, injury not indicated'
    );
  });
  it(`should include CV line "<number of passengers> passenger or passengers" when third party Vehicle's year, make, model is not known but <number of passengers> was marked and hadInjuries was marked No on a singleOtherPartyVehicle`, () => {
    delete testRequestBody.incidentSingleOtherVehicle.vehicleInfo;
    testRequestBody.incidentSingleOtherVehicle.hadInjuries = YesNoUnknown.Yes;
    testRequestBody.incidentSingleOtherVehicle.passengerCount = PassengerCount.FiveOrMore;
    testRequestBody.incidentOtherVehicleCount = VehicleCount.One;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[2]).toEqual(
      'CV: unknown number of passengers, injury indicated'
    );
  });

  it(`should not include third party Vehicle's "injury indicated" when hadInjuries was marked No on a singleOtherPartyVehicle`, () => {
    testRequestBody.incidentSingleOtherVehicle.hadInjuries = YesNoUnknown.No;
    testRequestBody.incidentOtherVehicleCount = VehicleCount.One;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[2]).toEqual(
      'CV: 2018 Toyota, unknown number of passengers, injury not indicated'
    );
  });

  it(`should not include third party Vehicle's "injury indicated" when hadInjuries was marked Unknown on a singleOtherPartyVehicle`, () => {
    testRequestBody.incidentSingleOtherVehicle.hadInjuries = YesNoUnknown.Unknown;
    testRequestBody.incidentOtherVehicleCount = VehicleCount.One;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[2]).toEqual(
      'CV: 2018 Toyota, unknown number of passengers, injury not indicated'
    );
  });

  it(`should include third party Vehicle's ", injury indicated" when hadInjuries was marked Yes on a singleOtherPartyVehicle`, () => {
    testRequestBody.incidentSingleOtherVehicle.hadInjuries = YesNoUnknown.Yes;
    testRequestBody.incidentOtherVehicleCount = VehicleCount.One;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.split(lineDelimiter)[2]).toEqual(
      'CV: 2018 Toyota, unknown number of passengers, injury indicated'
    );
  });
  it('should not include "Cyclist indicated" when the value of OtherNonVehicleParties is None', () => {
    testRequestBody.incidentOtherVehicleCount = VehicleCount.None;
    testRequestBody.incidentOtherNonVehicleParties = OtherNonVehicleParties.None;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.indexOf('Cyclist indicated') > 0).toEqual(false);
  });

  it('should include "Cyclist indicated" when the value of OtherNonVehicleParties is both cyclist and pedestrian or just cyclist', () => {
    let partiesHavingCyclist = [
      OtherNonVehicleParties.Cyclist,
      OtherNonVehicleParties.CyclistAndPedestrian
    ];
    partiesHavingCyclist.forEach(answer => {
      testRequestBody.incidentOtherNonVehicleParties = answer;
      result = createAdjusterNote(
        lineDelimiter,
        subject,
        testRequestBody,
        testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
      );
      expect(result.body.indexOf('Cyclist indicated') > 0).toEqual(true);
    });
  });

  it('should not include "Pedestrian indicated" when the value of OtherNonVehicleParties is None', () => {
    testRequestBody.incidentOtherNonVehicleParties = OtherNonVehicleParties.None;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.indexOf('Pedestrian indicated') > 0).toEqual(false);
  });
  it('should include "Pedestrian indicated" when the value of OtherNonVehicleParties is  both cyclist and pedestrian or just pedestrian', () => {
    let partiesHavingPedestrian = [
      OtherNonVehicleParties.Pedestrian,
      OtherNonVehicleParties.CyclistAndPedestrian
    ];
    partiesHavingPedestrian.forEach(answer => {
      testRequestBody.incidentOtherNonVehicleParties = answer;
      result = createAdjusterNote(
        lineDelimiter,
        subject,
        testRequestBody,
        testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
      );
      expect(result.body.indexOf('Pedestrian indicated') > 0).toEqual(true);
    });
  });
  it(`should not include 'Third-party insurance company and policy' when the incidentSingleOtherVehicle.insuranceCompany is missing`, () => {
    testRequestBody.incidentSingleOtherVehicle.insuranceCompany = null;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.indexOf('Third-party insurance company is') > 0).toEqual(false);
  });

  it(`should include 'Third-party insurance company' when the incidentSingleOtherVehicle.insuranceCompany is present`, () => {
    testRequestBody.incidentSingleOtherVehicle.insuranceCompany.companyName = 'AAA';
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.indexOf('Third-party insurance company is AAA') > 0).toEqual(true);
  });

  it(`should include 'Third-party insurance company and policy' when the incidentSingleOtherVehicle.insuranceCompany and policy number is present`, () => {
    testRequestBody.incidentSingleOtherVehicle.insuranceCompany = {
      companyName: 'AAA',
      policyNumber: 'ABC'
    };
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(
      result.body.indexOf('Third-party insurance company is AAA, policyNumber is ABC') > 0
    ).toEqual(true);
  });

  it(`should not include 'Real Property indicated' when the answer is No`, () => {
    testRequestBody.hadOtherPropertyDamage = YesNo.No;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.indexOf('Real Property indicated') > 0).toEqual(false);
  });

  it(`should include 'Real Property indicated' when the answer is Yes`, () => {
    testRequestBody.hadOtherPropertyDamage = YesNo.Yes;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.indexOf('Real Property indicated') > 0).toEqual(true);
  });

  it(`should not include 'Additional Details:' when there is no loss description`, () => {
    testRequestBody.lossDescription = null;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.indexOf('Additional Details: ') > 0).toEqual(false);
  });

  it(`should include 'Additional Details:' when there is a loss description`, () => {
    testRequestBody.lossDescription = 'Fence was damaged';
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    const expected = 'Additional Details:';
    const actual = result.body.substring(
      result.body.indexOf(expected),
      result.body.indexOf(expected) + expected.length
    );

    expect(result.body.indexOf('Additional Details:') > 0).toEqual(true);
  });

  it(`should include lossDescription when there is a loss description`, () => {
    testRequestBody.lossDescription = 'Fence was damaged';
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body.indexOf('Fence was damaged') > 0).toEqual(true);
  });

  it(`should include all items in adjusterNote`, () => {
    testRequestBody.incidentOtherVehicleCount = VehicleCount.One;
    // @TODO: post MVP - will consider mapping/infer  OtherPropertyDamage from the selection option DrivenIncidentOption and LossCause
    // testRequestBody.hadOtherPropertyDamage = YesNo.Yes;
    testRequestBody.lossDescription = 'Fence was damaged';
    // no longer mapped as we are no longer capturing it in the UI
    // testRequestBody.lossVehicle.passengerCount = PassengerCount.One;
    testRequestBody.incidentSingleOtherVehicle.insuranceCompany = {
      companyName: 'AAA',
      policyNumber: 'ABC'
    };
    testRequestBody.incidentOtherNonVehicleParties = OtherNonVehicleParties.CyclistAndPedestrian;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body).toEqual(
      `One third party vehicle involved | IV: 2001 FORD, unknown number of passengers, injury indicated | CV: 2018 Toyota, unknown number of passengers, injury not indicated | Cyclist indicated | Pedestrian indicated | Additional Details: | Fence was damaged | Third-party insurance company is AAA, policyNumber is ABC | Accident crash detection: Yes | Date of Crash Prediction: 2023-10-06`
    );
  });

  it('should include accident crash detection when isMobileAppAccidentDetection is true', () => {
    testRequestBody.isMobileAppAccidentDetection = 'true';
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body).toContain('Accident crash detection: Yes');
  });

  it('should include accident crash detection when isMobileAppAccidentDetection is false', () => {
    testRequestBody.isMobileAppAccidentDetection = 'false';
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body).toContain('Accident crash detection: No');
  });

  it('should not include accident crash detection when isMobileAppAccidentDetection is undefined', () => {
    testRequestBody.isMobileAppAccidentDetection = undefined;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body).not.toContain('Accident crash detection');
  });

  it('should include Date of Crash Prediction when dateOfCrashPrediction is provided', () => {
    testRequestBody.dateOfCrashPrediction = '2023-12-01';
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body).toContain('Date of Crash Prediction: 2023-12-01');
  });

  it('should not include Date of Crash Prediction when dateOfCrashPrediction is not provided', () => {
    testRequestBody.dateOfCrashPrediction = undefined;
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body).not.toContain('Date of Crash Prediction:');
  });

  it('should include all new fields when provided', () => {
    testRequestBody.isMobileAppAccidentDetection = 'true';
    testRequestBody.dateOfCrashPrediction = '2023-12-01';
    result = createAdjusterNote(
      lineDelimiter,
      subject,
      testRequestBody,
      testCreateClaimBackendResponse.policy.lobs.personalAuto.vehicles[0]
    );
    expect(result.body).toContain('Accident crash detection: Yes');
    expect(result.body).toContain('Date of Crash Prediction: 2023-12-01');
  });
});
