import { APIActions } from '../utilities/APIActions';
import { test, expect, FullConfig, MyOptions } from '../utilities/TestFixture';
import ctestdata from '../testdata/alltestdata';
import { randomUUID } from 'crypto';
import { json } from 'stream/consumers';
const { v4: uuidv4 } = require('uuid');

const apiActions = new APIActions();

let token;
let effectiveDate;
let expirationDate;
let policyClass;
let policyNumber;
let claimNumber: string
let vehicleId;
let driverId;
let clubName;
let sessionId = uuidv4();
let correlationId;
let customerPhone = ctestdata.customerPhone;
let customerEmail = ctestdata.customerEmail;
let baseUrl = ctestdata.baseUrl;
let testRegion = ctestdata.testRegion;
let redirectMode;

test.describe('Auto eFNOL Behind Login API Scenarios', () => {
  test.beforeAll(async ({ username, password, clubname, policynumber }, testInfo) => {
    policyNumber = policynumber;
    clubName = clubname;
    [token] = await apiActions.getOktaToken(username, password, clubName);
    console.log("User Name is = " + username);
    console.log("Password is = " + password);
    console.log("Club Name is = " + clubName);
    console.log("Policy Number is = " + policyNumber);
  });

  test('ISS-16120 - Auto eFNOL BehindLogin Validate Flow Directory Success 200 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16120' });
    correlationId = uuidv4();
    console.log("CorrelationId ID - ", correlationId)
    console.log(baseUrl, policyNumber)
    redirectMode = ctestdata.redirectMode_Manual
    console.log('value for redirect mode = ' + redirectMode)
    const [response] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    console.log("Flow Directory Sucessfully returned the cache ID");

  });

  test('ISS-16150 - Auto eFNOL BehindLogin Validate Flow Directory Success 302 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16150' });
    correlationId = uuidv4();
    console.log("CorrelationId ID - ", correlationId)
    console.log(baseUrl, policyNumber)
    redirectMode = ctestdata.redirectMode_Auto
    const [response] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    console.log('response from flow directory call - ' + response);
    console.log("Flow Directory Sucessfully returned the cache ID");


  });

  test('ISS-16125- Auto eFNOL BehindLogin Validate Flow Directory - Data missing 500 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16125' });
    correlationId = uuidv4();
    console.log("CorrelationId ID  - ", correlationId)
    console.log(baseUrl, policyNumber)
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    console.log("Flow Directory Sucessfully returned the cache ID");
    const flowDirectoryUrl = 'https://apiuat1.ace.aaa.com/insurance-auto-efnol-woli/flow-director/';
    console.log("get url = " + flowDirectoryUrl);
    const scenarioName = await apiActions.getRequestType(flowDirectoryUrl);
    const requestType = ctestdata.InValid_scenario;
    const unAuthorized = ctestdata.Unauthorized;

    const response = await apiActions.postRequest(request, flowDirectoryUrl, token, scenarioName, requestType, unAuthorized, correlationId, sessionId);
    // Verifying the response
    console.log("Policy Initial Data API response is - ", response.status());
    await apiActions.verifySpFailureStatusCode(response, 500);
    const inValidRequesttype = ctestdata.InValid_scenario;
    await apiActions.validateResponseBody(response, scenarioName, inValidRequesttype);
  });

  test('ISS-16127 - Auto eFNOL With Login Validate Initial Data Success 200 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16127' });
    correlationId = uuidv4();
    console.log("CorrelationId ID - Auto eFNOL With Login Validate Initial Data - ", correlationId)
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const initialDataUrl = `https://apiuat1.ace.aaa.com/insurance-auto-efnol-woli/initial-data/${cacheID}`;
    console.log("get url = " + initialDataUrl);
    const scenarioName = await apiActions.getRequestType(initialDataUrl);
    const requestType = ctestdata.Valid_Scenario;
    const response = await apiActions.getRequest(request, initialDataUrl, token, testRegion, correlationId, sessionId);

    // Verifying the response
    console.log("Policy Initial Data API response is - ", response.status());
    const sucesscode = await apiActions.verifySuccessStatusCode(response);
    await apiActions.validateResponseBody(response, scenarioName, requestType);

  });

  test('ISS-16129 - Auto eFNOL With Login Validate Initial Data Bad Token 403- @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16129' });
    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const initialDataUrl = `https://apiuat1.ace.aaa.com/insurance-auto-efnol-woli/initial-data/${cacheID}`;
    console.log("get url = " + initialDataUrl);
    const scenarioName = await apiActions.getRequestType(initialDataUrl);
    const requestType = ctestdata.Valid_Scenario;
    const unAuthorized = ctestdata.Unauthorized;

    const response = await apiActions.getRequest_Unauhtorized(request, initialDataUrl, token, testRegion, correlationId, sessionId);
    // Verifying the response
    console.log("Policy Initial Data API response is - ", response.status());
    await apiActions.verifySpFailureStatusCode(response, 403);
    const inValidRequesttype = ctestdata.InValid_scenario;
    await apiActions.validateResponseBody(response, scenarioName, inValidRequesttype);

  });

  test('ISS-16128 - Auto eFNOL With Login Validate Initial Data Invalid Cache ID 404 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16128' });
    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const initialDataUrl = `https://apiuat1.ace.aaa.com/insurance-auto-efnol-woli/initial-data/00112233`;
    console.log("get url = " + initialDataUrl);
    const scenarioName = await apiActions.getRequestType(initialDataUrl);
    const requestType = ctestdata.Valid_Scenario;
    const response = await apiActions.getRequest(request, initialDataUrl, token, testRegion, correlationId, sessionId);

    // Verifying the response
    console.log("Policy Initial Data API response is - ", response.status());
    await apiActions.verifySpFailureStatusCode(response, 404);
    const inValidRequesttype = ctestdata.InValid_cacheID;
    await apiActions.validateResponseBody(response, scenarioName, inValidRequesttype);

  });

  test('ISS-16116 - Auto eFNOL With Login Validate Policy info Response Success 200 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16116' });

    correlationId = uuidv4();
    console.log("CorrelationId ID - Auto eFNOL With Login Validate Initial Data - ", correlationId)
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const policyInfoUrl = `${baseUrl}/auto/policy-info?policyGuid=${cacheID}`;
    console.log("get url = " + policyInfoUrl);
    const scenarioName = await apiActions.getRequestType(policyInfoUrl);
    const requestType = ctestdata.Valid_Scenario;
    const response = await apiActions.getRequest(request, policyInfoUrl, token, testRegion, correlationId, sessionId);

    // Verifying the response  
    console.log("Policy Info API response status code is - ", response.status());
    const sucesscode = await apiActions.verifySuccessStatusCode(response);
    await apiActions.validateResponseBody(response, scenarioName, requestType);

  });

  test('ISS-16130 - Auto eFNOL With Login Validate Policy info Response Bad Token 403 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16130' });

    correlationId = uuidv4();
    console.log("CorrelationId ID - Auto eFNOL With Login Validate Initial Data - ", correlationId)
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const policyInfoUrl = `${baseUrl}/auto/policy-info?policyGuid=${cacheID}`;
    console.log("get url = " + policyInfoUrl);

    const scenarioName = await apiActions.getRequestType(policyInfoUrl);
    const requestType = ctestdata.Valid_Scenario;
    const response = await apiActions.getRequest_Unauhtorized(request, policyInfoUrl, token, testRegion, correlationId, sessionId);

    // Verifying the response
    console.log("Policy Policy Info API response is - ", response.status());
    await apiActions.verifySpFailureStatusCode(response, 403);
    const inValidRequesttype = ctestdata.InValid_scenario;
    await apiActions.validateResponseBody(response, scenarioName, inValidRequesttype);


  });

  test('ISS-16118 - Auto eFNOL With Login Validate Policy info Response Invalid Policy number 500 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16118' });

    correlationId = uuidv4();
    console.log("CorrelationId ID - Auto eFNOL With Login Validate Initial Data - ", correlationId)
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const policyInfoUrl = `${baseUrl}/auto/policy-info?11223344`;
    console.log("get url = " + policyInfoUrl);

    const scenarioName = await apiActions.getRequestType(policyInfoUrl);
    const requestType = ctestdata.Valid_Scenario;

    const unAuthorized = ctestdata.Unauthorized;
    const response = await apiActions.getRequest(request, policyInfoUrl, token, testRegion, correlationId, sessionId);

    // Verifying the response
    console.log("Policy Policy Info API response is - ", response.status());
    await apiActions.verifySpFailureStatusCode(response, 500);
    const inValidRequesttype = ctestdata.MissingPolicyNum;
    await apiActions.validateResponseBody(response, scenarioName, inValidRequesttype);


  });

  test('ISS-16151 - Auto eFNOL With Login Validate Existing claim found Success 200 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16151' });

    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const existingClaimLossDate = ctestdata.ExistingClaimLossDate;
    const ExistingClaimUrl = `${baseUrl}/auto/claim-info?lossDate=${existingClaimLossDate}&policyGuid=${cacheID}`;
    console.log("get url = " + ExistingClaimUrl);
    const scenarioName = await apiActions.getRequestType(ExistingClaimUrl);
    const requestType = ctestdata.Valid_Scenario;
    const response = await apiActions.getRequest(request, ExistingClaimUrl, token, testRegion, correlationId, sessionId);

    // Verifying the response  
    console.log("Policy Info API response status code is - ", response.status());
    const sucesscode = await apiActions.verifySuccessStatusCode(response);
    const existingClaimInfo = ctestdata.existingPolicy;
    await apiActions.validateResponseBody(response, scenarioName, existingClaimInfo);

  });

  test('ISS-16152 - Auto eFNOL With Login Validate NO Existing claim found Success 200 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16152' });

    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const NoexistingClaimLossDate = ctestdata.NOExistingClaim;
    const NoExistingClaimUrl = `${baseUrl}/auto/claim-info?lossDate=${NoexistingClaimLossDate}&policyGuid=${cacheID}`;
    console.log("get url = " + NoExistingClaimUrl);
    const scenarioName = await apiActions.getRequestType(NoExistingClaimUrl);
    const requestType = ctestdata.Valid_Scenario;
    const response = await apiActions.getRequest(request, NoExistingClaimUrl, token, testRegion, correlationId, sessionId);

    // Verifying the response  
    console.log("Policy Info API response status code is - ", response.status());
    const sucesscode = await apiActions.verifySuccessStatusCode(response);
    const existingClaimInfo = ctestdata.noExistingPolicy;
    await apiActions.validateResponseBody(response, scenarioName, existingClaimInfo);

  });

  test('ISS-16141 - Auto eFNOL With Login Validate Glass Claim Safellite Redirect Success 200 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16141' });

    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const glassClaimUrl = `${baseUrl}/auto/safelite-redirect?policyGuid=${cacheID}`;
    console.log("get url = " + glassClaimUrl);
    const scenarioName = await apiActions.getRequestType(glassClaimUrl);
    const requestType = ctestdata.Valid_Scenario;
    const response = await apiActions.getRequest(request, glassClaimUrl, token, testRegion, correlationId, sessionId);

    // Verifying the response  
    console.log("Policy Info API response status code is - ", response.status());
    const sucesscode = await apiActions.verifySuccessStatusCode(response);
    await apiActions.validateResponseBody(response, scenarioName, requestType);

  });

  test('ISS-16142 - Auto eFNOL With Login Validate Glass Claim Safellite Response Bad Token 403 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16142' });

    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const glassClaimUrl = `${baseUrl}/auto/safelite-redirect?policyGuid=${cacheID}`;
    console.log("get url = " + glassClaimUrl);
    const scenarioName = await apiActions.getRequestType(glassClaimUrl);
    const requestType = ctestdata.Valid_Scenario;
    const response = await apiActions.getRequest_Unauhtorized(request, glassClaimUrl, token, testRegion, correlationId, sessionId);

    // Verifying the response  
    console.log("Policy Info API response status code is - ", response.status());

    await apiActions.verifySpFailureStatusCode(response, 403);
    const inValidRequesttype = ctestdata.InValid_scenario;
    await apiActions.validateResponseBody(response, scenarioName, inValidRequesttype);

  });

  test('ISS-16132 - Auto eFNOL With Login Validate Create claim response Success 200 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16132' });

    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const createClaimUrl = `${baseUrl}/auto/claim?policyGuid=${cacheID}`;
    console.log("get url = " + createClaimUrl);
    const scenarioName = await apiActions.getRequestType(createClaimUrl);
    const requestType = ctestdata.Valid_Scenario;
    const response = await apiActions.postRequest(request, createClaimUrl, token, scenarioName, requestType, ctestdata.Valid_Scenario, correlationId, sessionId);

    // Verifying the response  
    console.log("Policy Info API response status code is - ", response.status());
    const sucesscode = await apiActions.verifySuccessStatusCode(response);
    await apiActions.validateResponseBody(response, scenarioName, requestType);


    const jsonResponse = await response.json();
    expect(jsonResponse).toHaveProperty('claimNumber');
    expect(typeof jsonResponse.claimNumber).toBe('string');

    claimNumber = jsonResponse.claimNumber;

    console.log("Generated Claim Number:", claimNumber);
  });

  test('ISS-16133 - Auto eFNOL With Login Validate Create claim - Bad token 403 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16133' });

    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const createClaimUrl = `${baseUrl}/auto/claim?policyGuid=${cacheID}`;
    console.log("get url = " + createClaimUrl);
    const scenarioName = await apiActions.getRequestType(createClaimUrl);
    const requestType = ctestdata.Valid_Scenario;
    const unAuthorized = ctestdata.Unauthorized;
    const response = await apiActions.postRequest(request, createClaimUrl, token, scenarioName, requestType, unAuthorized, correlationId, sessionId);

    // Verifying the response
    console.log("Policy Policy Info API response is - ", response.status());
    await apiActions.verifySpFailureStatusCode(response, 403);
    const inValidRequesttype = ctestdata.InValid_scenario;
    await apiActions.validateResponseBody(response, scenarioName, inValidRequesttype);
  });

  test('ISS-16135 - Auto eFNOL With Login Validate Create claim - Missing Loss Date - 500 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16135' });

    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const createClaimUrl = `${baseUrl}/auto/claim?policyGuid=${cacheID}`;
    console.log("get url = " + createClaimUrl);
    const scenarioName = await apiActions.getRequestType(createClaimUrl);
    const requestType = ctestdata.MissingLossDate;
    const unAuthorized = ctestdata.Valid_Scenario;
    const response = await apiActions.postRequest(request, createClaimUrl, token, scenarioName, requestType, unAuthorized, correlationId, sessionId);

    // Verifying the response
    console.log("Policy Policy Info API response is - ", response.status());
    await apiActions.verifySpFailureStatusCode(response, 500);
    const inValidRequesttype = ctestdata.MissingLossDate;
    await apiActions.validateResponseBody(response, scenarioName, inValidRequesttype);


  });

  test('ISS-16134 - Auto eFNOL With Login Validate Create claim - Missing Policy Number - 404 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16134' });

    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const createClaimUrl = `${baseUrl}/auto/claim?policyGuid=${cacheID}`;
    console.log("get url = " + createClaimUrl);
    const scenarioName = await apiActions.getRequestType(createClaimUrl);
    const requestType = ctestdata.MissingPolicyNum;
    const unAuthorized = ctestdata.Valid_Scenario;
    const response = await apiActions.postRequest(request, createClaimUrl, token, scenarioName, requestType, unAuthorized, correlationId, sessionId);

    // Verifying the response
    console.log("Policy Policy Info API response is - ", response.status());
    await apiActions.verifySpFailureStatusCode(response, 404);
    const inValidRequesttype = ctestdata.MissingPolicyNum;
    await apiActions.validateResponseBody(response, scenarioName, inValidRequesttype);


  });

  test.skip('ISS-16136 - Auto eFNOL With Login Validate Submit claim response Success 200 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16136' });

    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const submitClaimUrl = `${baseUrl}/auto/claim?policyGuid=${cacheID}`;
    console.log("get url = " + submitClaimUrl);
    console.log("Cliam Number = " + claimNumber)
    const scenarioName = ctestdata.submitClaim;
    const requestType = ctestdata.Valid_Scenario;
    const response = await apiActions.putRequest(request, submitClaimUrl, token, scenarioName, requestType, claimNumber, ctestdata.Valid_Scenario, correlationId, sessionId);

    // Verifying the response  
    console.log("Policy Info API response status code is - ", response.status());
    const sucesscode = await apiActions.verifySuccessStatusCode(response);
    await apiActions.validateResponseBody(response, scenarioName, requestType);

  }),{dependsOn:['ISS-16132 - Auto eFNOL With Login Validate Create claim response Success 200 - @Autoefnol_BL']};;

  test('ISS-16140 - Auto eFNOL With Login Validate Submit claim Bad Token 403 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16140' });

    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const submitClaimUrl = `${baseUrl}/auto/claim?policyGuid=${cacheID}`;
    console.log("get url = " + submitClaimUrl);

    console.log("Cliam Number = " + claimNumber)
    const scenarioName = ctestdata.submitClaim;
    const requestType = ctestdata.Valid_Scenario;
    const unAuthorized = ctestdata.Unauthorized;
    const response = await apiActions.putRequest(request, submitClaimUrl, token, scenarioName, requestType, claimNumber, unAuthorized, correlationId, sessionId);

    // Verifying the response  
    console.log("Policy Info API response status code is - ", response.status());
    const sucesscode = await apiActions.verifySpFailureStatusCode(response, 403);
    const inValidRequesttype = ctestdata.InValid_scenario;
    await apiActions.validateResponseBody(response, scenarioName, inValidRequesttype);

  });

  test.skip('ISS-16137 - Auto eFNOL With Login Validate Submit claim Invalid claim number 404 - @Autoefnol_BL', async ({ request }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16137' });

    correlationId = uuidv4();
    redirectMode = ctestdata.redirectMode_Manual
    const [cacheID] = await apiActions.callFlowDirector(policyNumber, policyClass, clubName, token, testRegion, redirectMode);
    const submitClaimUrl = `${baseUrl}/auto/claim?policyGuid=${cacheID}`;
    console.log("get url = " + submitClaimUrl);
    const scenarioName = ctestdata.submitClaim;
    const requestType = ctestdata.MissingClaimNum;
    const unAuthorized = ctestdata.Unauthorized;
    const response = await apiActions.putRequest(request, submitClaimUrl, token, scenarioName, requestType, claimNumber, unAuthorized, correlationId, sessionId);

    // Verifying the response  
    console.log("Policy Info API response status code is - ", response.status());
    const sucesscode = await apiActions.verifySpFailureStatusCode(response, 404);
    const inValidRequesttype = ctestdata.MissingClaimNum;
    await apiActions.validateResponseBody(response, scenarioName, inValidRequesttype);

  });

});


