import { APIResponse, request, expect } from '@playwright/test';
import commfun from './CommonFunctions';
import ctestdata from '../testdata/alltestdata';
//import { request } from "@playwright/test";

const { v4: uuidv4 } = require('uuid');

let sessionId = uuidv4();
let testRegion = ctestdata.testRegion;
let correlationId;

correlationId = uuidv4();
console.log("CorrelationId ID - ", correlationId)

export class APIActions {

    async verifySuccessStatusCode(response: APIResponse) {
        await expect(response.status()).toBe(200);
    }

    async verifySpSuccessStatusCode(response: APIResponse, statuscode: number) {
        await expect(response.status()).toBe(statuscode);
    }

    async verifyFailureStatusCode(response: APIResponse) {
        await expect(response.status()).toBe(400);
    }

    async verifySpFailureStatusCode(response: APIResponse, statuscode: number) {
        await expect(response.status()).toBe(statuscode);
    }
    async verifyResponseProperty(response: APIResponse, pProperty: string) {
        const jsonResponse = await response.json();
        await expect(jsonResponse).toHaveProperty(pProperty);
    }
    async validateResponseText(response: APIResponse, pText: string) {
        const jsonResponse = await response.text();
        await expect(jsonResponse).toContain(pText);
    }
    async validateTextinProperty(response: APIResponse, pProperty: string, pText: string) {
        const jsonResponse = await response.json();
        await expect(jsonResponse[pProperty]).toContain(pText);
    }
    async validateTextNotinProperty(response: APIResponse, pProperty: string, pText: string) {
        const jsonResponse = await response.json();
        await expect(jsonResponse[pProperty]).not.toEqual(pText);
    }
    async getOktaToken(pUserName: string, pPassword: string, pState: String) {
        let oktaGenTokenRequestData = {
            client_id: process.env.OKTA_CLIENT_ID || "",
            client_secret: process.env.OKTA_CLIENT_SECRET || "",
            grant_type: "password",
            username: pUserName,
            password: pPassword,
            scope: "openid profile customerId clubCode selfRecovery offline_access scope"
        }
        const endpointUrl = "https://ace-identity.oktapreview.com/oauth2/ausmofquo62cHtYNk0h7/v1/token?client_id=" + oktaGenTokenRequestData.client_id
            + "&client_secret=" + oktaGenTokenRequestData.client_secret
            + "&grant_type=" + oktaGenTokenRequestData.grant_type
            + "&scope=" + oktaGenTokenRequestData.scope
            + "&username=" + oktaGenTokenRequestData.username
            + "&password=" + oktaGenTokenRequestData.password;
        try {
            const apiContext = await request.newContext();
            const generateTokenResponse = await apiContext.post(endpointUrl, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                ignoreHTTPSErrors: true,
            })
            const jsonData = await generateTokenResponse.json();
            //const parsedAccessToken = commfun.parseJwt(jsonData.access_token)
            //let policyNumber = commfun.getAutoPolicy(parsedAccessToken.scope,pState);
            //const policyPrefix = policyNumber.substring(0, 3);


            return [jsonData.access_token];


        } catch (error) {
        }
    }
    async callFlowDirector(pPolicyNumber: string, pPolicyClass: string, pclubname: string, ptoken, pregion, redirectMode) {
        console.log('value for redirect mode in Flow directory = ' + redirectMode)
        let flowDirectorRequestData = '';
        if (redirectMode == ctestdata.redirectMode_Manual) {
            flowDirectorRequestData = `redirectMode=manual&policy=${pPolicyNumber}&claim=efnol&clubCode=${pclubname}&mode=auto&sourceApp=MyAccount`;
            console.log('Flow Director Request Data = ' + flowDirectorRequestData)
        }
        else if (redirectMode == ctestdata.redirectMode_Auto) {
            flowDirectorRequestData = `redirectMode=auto&policy=${pPolicyNumber}&claim=efnol&clubCode=${pclubname}&mode=auto&sourceApp=MyAccount`;
            console.log('Flow Director Request Data = ' + flowDirectorRequestData)
        }
        let newregion = '';
        if (pregion === 'A1') {
            newregion = '1';
        }
        else if (pregion === 'B1') {
            newregion = '2';
        }
        const baseflowdirectorurl = `https://api${process.env.TEST_ENV}1.ace.aaa.com/insurance-auto-efnol-woli/flow-director`;
        const apiContextfrFlowDirector = await request.newContext({
            baseURL: baseflowdirectorurl,
        });
        let flowDirectorResponse;
        try {
            flowDirectorResponse = await apiContextfrFlowDirector.post(`flow-director`, {
                headers: {
                    Accept: "*/*",
                    Authorization: `Bearer ${ptoken}`,

                },
                ignoreHTTPSErrors: true,
                data: flowDirectorRequestData.toString(),
                //data: flowDirectorRequestData,
                maxRedirects: 0
            });
            const jsonResponse = await flowDirectorResponse.json();
            console.log('Json Response status Code = ' + flowDirectorResponse.status());
            const flowDirectorResponseHeaders = flowDirectorResponse.headers();
            const redirectLocation = flowDirectorResponseHeaders.location;
            const cacheId = redirectLocation.split('behindlogin/')[1]?.split('?')[0];
            return [cacheId];

        } catch (error) {
            console.log('Error in Flow Director Call');
            console.log(error);
        }
    }
    async getRequest(request, url, token, CorrelationId, sessionId, headers = {},) {
        const response = await request.get(url, {
            headers: {
                Accept: "application/json",
                'X-Ace-Test-Region': testRegion,
                'X-Request-Id': correlationId,
                'X-Ace-Session-Id': sessionId,
                Authorization: `Bearer ${token}`
            },
            ignoreHTTPSErrors: true,
            data: {
            },
            maxRedirects: 0
        });

        return response;
    }
    async getRequest_Unauhtorized(request, url, token, CorrelationId, sessionId, headers = {},) {
        const response = await request.get(url, {
            headers: {
                Accept: "application/json",
                'X-Ace-Test-Region': testRegion,
                'X-Request-Id': correlationId,
                'X-Ace-Session-Id': sessionId,
                Authorization: `bad token`
            },
            ignoreHTTPSErrors: true,
            data: {
            },
            maxRedirects: 0
        });
        return response;
    }
    async postRequest(request, url, token, scenarioName, requestType, unAuthorized, correlationId, sessionId, headers = {}) {
        console.log("validating post request for request name - ", scenarioName, " and request type - ", requestType);

        const payload = await this.getPayload(scenarioName, requestType);
        console.log("Payload for the request - ", payload);

        const authorizationHeader = await this.badTokenAuthorization(request, token, url, scenarioName, requestType, unAuthorized);

        const response = await request.post(url, {
            headers: {
                Accept: "application/json",
                'X-Ace-Test-Region': testRegion,
                'X-Request-Id': correlationId,
                'X-Ace-Session-Id': sessionId,
                Authorization: authorizationHeader
            },

            ignoreHTTPSErrors: true,
            data: payload,
            maxRedirects: 0
        });
        return response;
    }
    async putRequest(request, url, token, scenarioName, requestType, claimNumber, unAuthorized, correlationId, sessionId, headers = {}) {
        const SubmitClaimNum = claimNumber;
        const authorizationHeader = await this.badTokenAuthorization(request, token, url, scenarioName, requestType, unAuthorized);
        console.log('auth details = ' + authorizationHeader);
        const response = await request.post(url, {
            headers: {
                Accept: "application/json",
                'X-Ace-Test-Region': testRegion,
                'X-Request-Id': correlationId,
                'X-Ace-Session-Id': sessionId,
                Authorization: authorizationHeader
            },

            ignoreHTTPSErrors: true,
            data: {
                claimNumber: SubmitClaimNum,
                contactInfo: {
                    email: 'kokisheva.jen@clublabs.com',
                    phone: '9128632656',
                    preferredContactMethod: 'himarley'
                },
                hadOtherPropertyDamage: 'no',
                incidentOtherNonVehicleParties: 'none',
                incidentOtherVehicleCount: 'one',
                incidentSingleOtherVehicle: {
                    driver: {
                        firstName: 'JON',
                        lastName: 'SOO',
                        mobilePhone: '9492223333',
                    },
                    hadInjuries: 'yes',
                    insuranceCompany: {
                        companyName: 'GEICO',
                        policyNumber: 'SOME POLICY NUMBER',
                    },
                    passengerCount: 'two',
                    vehicleInfo: {
                        make: 'JEEP',
                        model: 'CHEROKEE',
                        year: '2020'
                    },
                    wasSomeoneDrivingOtherVehicle: 'yes'
                },
                isEmailCommunicationOptIn: 'true',
                isTextCommunicationOptIn: 'true',
                loginFlowType: 'BehindLogin',
                lossCause: 'rearendcoll',
                lossDate: '05/17/2026',
                lossDescription: 'TEST',
                lossLocation: {
                    city: 'LA',
                    state: 'CA',
                    streetAddress: '645 FIG ST'
                },
                lossTime: '12:00',
                lossVehicle: {
                    damageDescription: 'TEST',
                    hadInjuries: 'unknown',
                    incidentDriverId: 'S5VBHiiRseNx9kd7lxDIq',
                    insuredVehicle: {
                        make: 'HOND',
                        model: 'CIVIC EX',
                        RUNumber: '1',
                        vin: '*************6299',
                        year: '2010',
                    },
                    passengerCount: 'none',
                    towed: 'unknown',
                    vehicleDrivenOrParked: 'beingDriven',
                    vehicleId: '',
                },
                policyNumber: 'CAA023510003',
                reporter: {
                    customReporter: {
                        cellPhone: '(912) 863-2656',
                        email: 'kokisheva.jen@clublabs.com',
                        firstName: "",
                        lastName: ""
                    },
                    driverId: "S5VBHiiRseNx9kd7lxDIq",
                },
                sr1_VehicleNumber: '2',
                witness: {
                    firstName: 'Sol',
                    lastName: 'Sook',
                    mobilePhone: '9493334444'
                }
            },

            maxRedirects: 0
        });
        return response;
    }
    async badTokenAuthorization(request, token, url, scenarioName, requestType, unAuthorized) {
        console.log("Checking if bad token scenario is needed for request name - ", scenarioName, " and request type - ", requestType);
        let authHeader = `Bearer ${token}`;

        switch (scenarioName) {
            case 'POLICY_RETRIEVE':
                switch (unAuthorized) {
                    case 'Bad Token':
                        authHeader = 'Bad Token';
                        break;
                }
                break;
            case 'CREATE_CLAIM':
                switch (unAuthorized) {
                    case 'Bad Token':
                        authHeader = 'Bad Token';
                        break;
                }
                break;
            case 'INITIAL_DATA':
                switch (unAuthorized) {
                    case 'Bad Token':
                        authHeader = 'Bad Token';
                        break;
                }
            case 'SUBMIT_CLAIM':
                switch (unAuthorized) {
                    case 'Bad Token':
                        authHeader = 'Bad Token';
                        break;
                }
        }
        return authHeader;
    }
    async getRequestType(url: string) {
        if (url.includes('initial-data')) {
            return 'INITIAL_DATA';
        }
        else if (url.includes('policy-info')) {
            return 'POLICY_INFO';
        }
        else if (url.includes('claim')) {
            return 'CREATE_CLAIM';
        }
        else if (url.includes('submit-claim')) {
            return 'SUBMIT_CLAIM';
        }
        else if (url.includes('flow-director')) {
            return 'FLOW_DIRECTOR';
        }
        else if (url.includes('claim-info')) {
            return 'CLAIM_INFO';
        }
        else if (url.includes('safelite')) {
            return 'GLASS_CLAIM';
        }
        else {
            throw new Error(`Unknown URL: ${url}`);
        }
    }
    async getPayload(scenarioName: string, requestType: string) {
        switch (scenarioName) {
            case 'POLICY_INFO':
                console.log("Generating payload for POLICY_RETRIEVE");
                switch (requestType) {
                    case 'Valid':
                        return {
                            'policyNumber': 'CHO015694409',
                            'lossDate': '12/12/2025',
                        };
                    case 'MissingPolicy':
                        return {
                            'policyNumber': '',
                            'lossDate': '12/12/2025',
                        };
                    case 'InvalidPolicy':
                        return {
                            'policyNumber': 'CHO01',
                            'lossDate': '12/12/2025',
                        };
                };
            case 'CREATE_CLAIM':
                console.log("Generating payload for CREATE_CLAIM");
                switch (requestType) {
                    case 'Valid':
                        return {
                            lossDate: '2026-05-05T12:00:00-07:00',
                            lossTime: '12:00',
                            policy: {
                                'policyNumber': 'CAA023510003',
                                'policyType': 'HO',
                                'effectiveDate': '2025-05-12T14:06:09.421Z',
                                'expirationDate': '2027-05-12T14:06:09.421Z'
                            },
                            'lossType': 'AUTO',
                            'lossCause': 'othercomp',
                            'isNotificationOnly': false
                        }

                    case 'MissingLossDate':
                        return {
                            lossDate: ' ',
                            lossTime: '12:00',
                            policy: {
                                'policyNumber': 'CAA023510003',
                                'policyType': 'HO',
                                'effectiveDate': '2025-05-12T14:06:09.421Z',
                                'expirationDate': '2027-05-12T14:06:09.421Z'
                            },
                            'lossType': 'AUTO',
                            'lossCause': 'othercomp',
                            'isNotificationOnly': false
                        };
                    case 'MissingPolicyNumber':
                        return {
                            lossDate: '2026-05-05T12:00:00-07:00',
                            lossTime: '12:00',
                            policy: {
                                'policyNumber': ' ',
                                'policyType': 'HO',
                                'effectiveDate': '2025-05-12T14:06:09.421Z',
                                'expirationDate': '2027-05-12T14:06:09.421Z'
                            },
                            'lossType': 'AUTO',
                            'lossCause': 'othercomp',
                            'isNotificationOnly': false
                        };
                };
            case 'INITIAL_DATA':
                console.log("Generating payload for INITIAL_DATA");
                switch (requestType) {
                    case 'Valid':
                        return {
                            'policyNumber': 'CHO015694409',
                            'lossDate': '12/12/2025',
                        };
                };
            case 'FLOW_DIRECTOR':
                console.log("Generating payload for FLOW_DIRECTOR");
                switch (requestType) {
                    case 'Invalid':
                        return {
                            'claim': 'efnol',
                            'clubCode': '004',
                            'mode': 'auto'
                        }
                };

            default:
                throw new Error(`Invalid requestType: ${scenarioName}`);
        }
    }
    async getExpectedResponseSchema(scenarioName, requestType,) {
        switch (scenarioName) {

            case 'INITIAL_DATA':
                switch (requestType) {
                    case 'Valid':
                        return {
                            root: ['sourceApp'],
                            policyData: [
                                'redirectMode',
                                'policy',
                                'claim',
                                'clubCode',
                                'mode',
                                'sourceApp',
                                'email',
                                'phone',
                                'EnableSplash',
                                'SplashStart',
                                'SplashEnd',
                                'ERSURL'
                            ]
                        };
                    case 'Unauthorized':
                        return {
                            root: ['message'],
                            expectedValues: {
                                message: ctestdata.badToken_errorMessage
                            }
                        };
                    case 'Invalid':
                        return {
                            root: ['message'],
                            expectedValues: {
                                message: ctestdata.badToken_errorMessage
                            }
                        };
                    case 'CacheID_Invalid':
                        return {
                            expectedValues: 'Claim cache item with id 00112233 not found'
                        }
                }
            case 'POLICY_INFO':
                switch (requestType) {
                    case 'Valid':
                        return {
                            root: ['APIResult',
                                'statusCode',
                                'message',
                                'data'
                            ],
                            data: [
                                'policyGeneralInfo',
                                'driverSummaries'
                            ]
                        };
                    case 'Unauthorized':
                        return {
                            root: ['message'],
                            expectedValues: {
                                message: ctestdata.badToken_errorMessage
                            }
                        };
                    case 'Invalid':
                        return {
                            root: ['message'],
                            expectedValues: {
                                message: ctestdata.badToken_errorMessage
                            }
                        };
                    case 'MissingPolicyNumber':
                        return {
                            root: ['error'],
                            error: ['message'],
                            expectedValues: {
                                message: ctestdata.missingPolicyErrMsg
                            }

                        };
                    case 'InvalidPolicy':
                        return {
                            root: ['error'],
                            error: ['message']
                        };
                }
            case 'CREATE_CLAIM':
                switch (requestType) {
                    case 'Valid':
                        return {
                            root: ['claimNumber',
                                'vehicleSummaries',
                                'driverSummaries',
                                'insuredFullName',
                                'policyStatus',
                                'policyType',
                                'policyState',
                                'policyProduct'
                            ],
                            vehicleSummaries: [
                                'RUNumber',
                                'year',
                                'make',
                                'model',
                                'vin',
                                'VINLastFour'
                            ],
                            driverSummaries: [
                                'firstName',
                                'lastName',
                                'driverId',
                                'emailAddress',
                                'phoneNumber'
                            ],

                        };

                    case 'MissingLossDate':
                        return {
                            root: ['error'],
                            error: ['message'],
                            expectedValues: {
                                message: ctestdata.missing_LossDate_errorMessage
                            }
                        };
                    case 'MissingPolicyNumber':
                        return {
                            root: ['error'],
                            error: ['message'],
                            expectedValues: {
                                message: 'Not found'
                            }
                        };
                    case 'Unauthorized':
                        return {
                            root: ['Message'],
                            expectedValues: {
                                Message: ctestdata.badToken_errorMessage
                            }
                        };
                    case 'Invalid':
                        return {
                            root: ['message'],
                            expectedValues: {
                                message: ctestdata.badToken_errorMessage
                            }
                        };
                }
            case 'FLOW_DIRECTOR':
                switch (requestType) {
                    case 'Valid':
                        return {
                            root: ['cacheId']
                        };
                    case 'Unauthorized':
                        return {
                            root: ['error'],
                            error: ['message'],
                            expectedValues: {
                                Message: ctestdata.Flow_dir_ErrorMessage
                            }
                        };
                    case 'Invalid':
                        return {
                            root: ['error'],
                            error: ['message'],
                            expectedValues: {
                                message: ctestdata.Flow_dir_ErrorMessage
                            }
                        };
                }
            case 'CLAIM_INFO':
                switch (requestType) {
                    case 'ExistingPolicy':
                        return {
                            root: ['message',
                                'APIResult',
                                'duplicateClaimExists',
                                'claimFound'
                            ],
                            claimFound: [
                                'claimId',
                                'claimNumber',
                                'lossDate',
                                'status',
                                'isCatastropheEvent',
                                'adjuster'
                            ],
                            adjuster: [
                                'displayName',
                                'firstName',
                                'lastName',
                                'email',
                                'phoneNumber'
                            ]
                        };
                    case 'NoExistingPolicy':
                        return {
                            root: ['message',
                                'APIResult',
                                'duplicateClaimExists'
                            ],
                            expectedValues: {
                                message: 'No existing claim found',
                                APIResult: 'SUCCESS',
                                duplicateClaimExists: false
                            }
                        }
                }
            case 'GLASS_CLAIM':
                switch (requestType) {
                    case 'Valid':
                        return {
                            root: ['safeliteRedirectUrl',
                                'safeliteRedirectMessage',
                            ],
                            expectedValues: {
                                safeliteRedirectMessage: 'Success'
                            }
                        }
                    case 'Invalid':
                        return {
                            root: ['message'],
                            expectedValues: {
                                message: ctestdata.badToken_errorMessage
                            }
                        };
                }
            case 'SUBMIT_CLAIM':
                switch (requestType) {
                    case 'Valid':
                        return {
                            root: ['APIResult',
                                'adjuster',
                            ],
                            adjuster: ['displayname',
                                'phoneNumeber',
                                'firstName',
                                'lastName',
                                'email'
                            ]

                        }
                    case 'Invalid':
                        return {
                            root: ['message'],
                            expectedValues: {
                                message: ctestdata.badToken_errorMessage
                            }
                        };
                    case 'MissingClaimNumber':
                        return {
                            root: ['error'],
                            error: ['message'],
                            expectedValues: {
                                message: ctestdata.missing_LossDate_errorMessage
                            }
                        };
                }
            default:
                throw new Error(`No schema defined for ${requestType}`);
        }
    }
    async validateResponseBody(response, scenarioName, inValidRequesttype) {

        console.log("Validating response body for request type:", scenarioName, "and test type:", inValidRequesttype);
        const jsonResponse = await response.json();

        const schema = await this.getExpectedResponseSchema(scenarioName, inValidRequesttype);
        console.log("Expected response schema:", schema);
        console.log("Response JSON:", jsonResponse);

        // Validate root level keys
        if (schema.root && typeof jsonResponse === 'object' && jsonResponse !== null) {
            schema.root.forEach(key => {
                expect(jsonResponse).toHaveProperty(key);
            });
        }
        // Validate nested objects
        if (typeof jsonResponse === 'object' && jsonResponse !== null) {

            for (const key in schema) {
                if (key !== 'root' && key !== 'expectedValues') {

                    if (key === 'adjuster') {
                        const nestedObject = jsonResponse.claimFound.adjuster;
                        expect(nestedObject).toBeDefined();
                        schema[key].forEach(field => {
                            expect(nestedObject).toHaveProperty(field);
                        });
                    }
                    else {
                        const nestedObject = jsonResponse[key];
                        expect(nestedObject).toBeDefined();
                        if (Array.isArray(nestedObject)) {
                            nestedObject.forEach((item, index) => {
                                console.log(`Validating array item ${index} for ${key}`);
                                schema[key].forEach(field => {
                                    expect(item).toHaveProperty(field);
                                });
                            });
                        }

                        else {
                            schema[key].forEach(field => {
                                expect(nestedObject).toHaveProperty(field);
                            });
                        }

                    }
                }
            }

            // Validate expected values
            if (schema.expectedValues) {
                // Handle plain string API response
                if (typeof schema.expectedValues === 'string') {

                    console.log("Actual Response:", jsonResponse);
                    console.log("Expected Response:", schema.expectedValues);

                    expect(jsonResponse).toBe(schema.expectedValues);

                    console.log("Response message Details - ", jsonResponse + ' ' + response.status());

                } else {
                    // Handle object API response
                    for (const key in schema.expectedValues) {

                        let actualValue;

                        // Root level validation
                        if (typeof jsonResponse === 'object' && jsonResponse !== null && jsonResponse[key] !== undefined) {
                            actualValue = jsonResponse[key];
                        }

                        // Nested error object validation
                        else if (
                            typeof jsonResponse === 'object' && jsonResponse !== null && jsonResponse.error && jsonResponse.error[key] !== undefined) {
                            actualValue = jsonResponse.error[key];
                        }

                        console.log(`Validating key: ${key}`);
                        console.log(`Actual:`, actualValue);
                        console.log(`Expected:`, schema.expectedValues[key]);

                        expect(actualValue).toBe(schema.expectedValues[key]);

                        console.log("Response message Details - ", actualValue + ' ' + response.status());
                    }
                }
            }
        }
        // RETURN RESPONSE
        return jsonResponse;
    }
}
