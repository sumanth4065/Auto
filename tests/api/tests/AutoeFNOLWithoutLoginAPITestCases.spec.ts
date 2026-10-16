import { APIActions } from '../utilities/APIActions';
import { test, expect, FullConfig, MyOptions } from '../utilities/TestFixture';
import  ctestdata  from '../testdata/alltestdata';
import { randomUUID } from 'crypto';
const { v4: uuidv4 } = require('uuid');

const apiActions = new APIActions();

let token;
let effectiveDate;
let expirationDate;
let policyClass;
let policyNumber;
let claimNumber;
let vehicleId;
let driverId;
let sessionId = uuidv4();
let correlationId;
let customerPhone=ctestdata.customerPhone;
let customerEmail=ctestdata.customerEmail;
let baseUrl=ctestdata.baseUrl;
let testRegion=ctestdata.testRegion;

test.describe('Auto eFNOL Without Login API Scenarios', () => {
    test.beforeAll(async ({ username, password,clubname,policynumber}, testInfo) => {
      [ token] = await apiActions.getOktaToken(username, password, clubname);
        policyNumber=policynumber;
        console.log("Session ID",sessionId)
       });

       test('ISS-16238 - Auto eFNOL Without Login Validate Policy info Response Success - @club', async ({ request}, testInfo) => {
         testInfo.annotations.push({ type: 'test_key', description: 'ISS-16238' });
        correlationId=uuidv4();
        console.log("CorrelationId ID - Auto eFNOL Without Login Validate Policy info Response - ",correlationId)
        console.log(baseUrl,policyNumber)
        const response = await request.get(`${baseUrl}/auto/policy-info/${policyNumber}`, {
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

        apiActions.verifySuccessStatusCode(response);
        const jsonResponse = await response.json();
        expect(jsonResponse).toHaveProperty('APIResult'); 
        expect(jsonResponse.APIResult).toBe('Policy Found'); 
        expect(jsonResponse).toHaveProperty('data');
        expect(jsonResponse.data).toHaveProperty('policyGeneralInfo');
        expect(jsonResponse.data.policyGeneralInfo).toHaveProperty('policyType');
        expect(jsonResponse.data.policyGeneralInfo).toHaveProperty('policyClass');
        policyClass=jsonResponse?.data?.policyGeneralInfo?.policyClass;
        expect(jsonResponse.data.policyGeneralInfo).toHaveProperty('termEffectiveDate');
        effectiveDate=new Date(jsonResponse?.data?.policyGeneralInfo?.termEffectiveDate).toISOString();
        expect(jsonResponse.data.policyGeneralInfo).toHaveProperty('termExpirationDate');        
        expirationDate=new Date(jsonResponse?.data?.policyGeneralInfo?.termExpirationDate).toISOString();

      });

      test('ISS-16239 - Auto eFNOL Without Login Validate Glass Claim Safellite Redirect - @club', async ({ request}, testInfo) => {
        testInfo.annotations.push({ type: 'test_key', description: 'ISS-16239' });
        correlationId=uuidv4();
        console.log("CorrelationId ID - Auto eFNOL Without Login Validate Glass Claim Safellite Redirect - ",correlationId)
        const response = await request.get(`${baseUrl}/auto/safelite-redirect?policyNumber=${policyNumber}`, {
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
        apiActions.verifySuccessStatusCode(response);
        const jsonResponse = await response.json();
        expect(jsonResponse).toHaveProperty('safeliteRedirectMessage'); 
        expect(jsonResponse.safeliteRedirectMessage).toBe('Success'); 
        expect(jsonResponse).toHaveProperty('safeliteRedirectUrl');
        expect(jsonResponse.safeliteRedirectUrl).toContain('https://submittest.glassclaim.com/SelfService/Default.aspx'); 
        expect(jsonResponse.safeliteRedirectUrl).toContain('ClientTag');
        expect(jsonResponse.safeliteRedirectUrl).toContain('PolicyNumber');
        expect(jsonResponse.safeliteRedirectUrl).toContain('Token');

      });

      test('ISS-16240 - Auto eFNOL Without Login Validate Create Claim - @club', async ({ request}, testInfo) => {
        testInfo.annotations.push({ type: 'test_key', description: 'ISS-16240' });
        correlationId=uuidv4();
        console.log("CorrelationId ID - Auto eFNOL Without Login Validate Create Claim - ",correlationId)
        const response = await request.post(`${baseUrl}/auto/claim/`, {
          headers: {
            Accept: "application/json",
            'X-Ace-Test-Region': testRegion,
            'X-Request-Id': correlationId,
            'X-Ace-Session-Id': sessionId,
            Authorization: `Bearer ${token}`
          },
          ignoreHTTPSErrors: true,
          
          data: {
            policy: {
              policyNumber: policyNumber,
              policyType: 'Auto',
              effectiveDate: effectiveDate,
              expirationDate: expirationDate
            },
            lossDate: '2024-01-26T07:00:00.000Z',
            lossTime: '09:09',
            lossType: 'AUTO',
            lossCause: 'othercomp',
            isNotificationOnly: false

          },
          maxRedirects: 0
        })
        apiActions.verifySuccessStatusCode(response);
        const jsonResponse = await response.json();
        expect(jsonResponse).toHaveProperty('claimNumber'); // Assert on presence of key
        expect(typeof(jsonResponse.claimNumber)).toBe('string')
        claimNumber = jsonResponse.claimNumber;
        expect(jsonResponse).toHaveProperty('APIResult');
        expect(jsonResponse.APIResult).toBe('SUCCESS'); // Assert on value of key

        expect(jsonResponse).toHaveProperty('vehicleSummaries');
        expect(Array.isArray(jsonResponse.vehicleSummaries)).toBe(true);
        jsonResponse.vehicleSummaries.forEach((d) => {
          expect(typeof (d)).toBe("object");
          expect(Object.keys(d)).toContain('year')
          expect(Object.keys(d)).toContain('make');
          expect(Object.keys(d)).toContain('model');
          expect(Object.keys(d)).toContain('vehicleId');
          expect(Object.keys(d)).toContain('VINLastFour');
    
        })
        vehicleId = jsonResponse.vehicleSummaries[0].vehicleId;
        expect(jsonResponse).toHaveProperty('driverSummaries');
        expect(Array.isArray(jsonResponse.driverSummaries)).toBe(true);
        jsonResponse.driverSummaries.forEach((d) => {
          expect(typeof (d)).toBe("object");
          expect(Object.keys(d)).toContain('firstName')
          expect(Object.keys(d)).toContain('lastName');
          expect(Object.keys(d)).toContain('driverId');
    
        })     
        driverId = jsonResponse.driverSummaries[0].driverId;

      }),{dependsOn:['Auto eFNOL Without Login Validate Policy info Response Success - @club']};

      test('ISS-16241 - Auto eFNOL Without Login Validate Submit Claim - @club', async ({ request}, testInfo) => {
        testInfo.annotations.push({ type: 'test_key', description: 'ISS-16241' });
        correlationId=uuidv4();
        console.log("CorrelationId ID - Auto eFNOL Without Login Validate Submit Claim - ",correlationId)
        const response = await request.put(`${baseUrl}/auto/claim/`, {
          headers: {
            Accept: "application/json",
            'X-Ace-Test-Region': testRegion,
            'X-Request-Id': correlationId,
            'X-Ace-Session-Id': sessionId,
            Authorization: `Bearer ${token}`
          },
          ignoreHTTPSErrors: true,
          
          data: {
            claimNumber: claimNumber,
            lossDate: '2022-01-26T07:00:00.000Z',
            lossTime: '09:09',
            reporter: {
                driverId: driverId
            },
            contactInfo: {
                phone: customerPhone,
                email: customerEmail,
                preferredContactMethod: 'main_email'
            },
            lossLocation: {
               city: 'Los Angeles',
               state: 'CA'
            },
            lossCause: 'othercomp',
            lossDescription: 'test optiv',
            lossVehicle: {
              vehicleId: vehicleId,
              vehicleDrivenOrParked: 'beingDriven',
              damageDescription: 'test optiv - damage description',
              passengerCount: 'one',
              hadInjuries: 'yes',
              towed: 'yes',
              incidentDriverId: driverId
            },
            incidentOtherVehicleCount: 'one',
            hadOtherPropertyDamage: 'yes',
            incidentOtherNonVehicleParties: 'cyclist and pedestrian',
            isTextCommunicationOptIn: true,
            incidentSingleOtherVehicle: {
              wasSomeoneDrivingOtherVehicle: 'yes',
              hadInjuries: 'yes',
              passengerCount: 'one',
              vehicleInfo: {
                make: 'Toyota',
                model: 'camry',
                year: 2021
              },
              insuranceCompany: {
                companyName: 'Progressive - optiv testing',
                policyNumber: 'some-good-policy-number'
              },
              driver: {
                firstName: 'OtherDriverFname',
                lastName: 'OtherDriverLname',
                mobilePhone: '213-123-1231'
              }
            },
            witness: {
              firstName: 'WitnessFname',
              lastName: 'WitnessLname',
              mobilePhone: '123-232-1221'
            }
          },
          maxRedirects: 0
        });
        apiActions.verifySuccessStatusCode(response);
        const jsonResponse = await response.json();
        expect(jsonResponse).toHaveProperty('APIResult');
        expect(jsonResponse.APIResult).toBe('SUCCESS_WITH_EMAIL_SUCCESS'); 

      }),{dependsOn:['Auto eFNOL Without Login Validate Create Claim - @club']};

      test('ISS-16242 - Negative Testing - Auto eFNOL Without Login Validate Policy info Response Unauthorized- @club', async ({ request}, testInfo) => {
        testInfo.annotations.push({ type: 'test_key', description: 'ISS-16242' });
        correlationId=uuidv4();
        console.log("CorrelationId ID - Auto eFNOL Without Login Validate Policy info Response Unautorized - ",correlationId)
        const response = await request.get(`${baseUrl}/${policyNumber}`, {
          headers: {
            Accept: "application/json",
            'X-Ace-Test-Region': testRegion,
            'X-Request-Id': correlationId,
            'X-Ace-Session-Id': sessionId,
            //Authorization: `Bearer ${token}`
          },
          ignoreHTTPSErrors: true,
          data: {
          },
          maxRedirects: 0
        });
        apiActions.verifySpFailureStatusCode(response,403);
        
      });

      test('ISS-16243 - Negative Testing - Auto eFNOL Without Login Validate Glass Claim Safellite Redirect Unauthorized- @club', async ({ request}, testInfo) => {
        testInfo.annotations.push({ type: 'test_key', description: 'ISS-16243' });
        correlationId=uuidv4();
        console.log("CorrelationId ID - Auto eFNOL Without Login Validate Glass Claim Safellite Redirect Unauthorized - ",correlationId)
        const response = await request.get(`${baseUrl}/auto/safelite-redirect?policyNumber=${policyNumber}`, {
          headers: {
            Accept: "application/json",
            'X-Ace-Test-Region': testRegion,
            'X-Request-Id': correlationId,
            'X-Ace-Session-Id': sessionId,
            //Authorization: `Bearer ${token}`
          },
          ignoreHTTPSErrors: true,
          data: {
          },
          maxRedirects: 0
        });
        apiActions.verifySpFailureStatusCode(response,401);
      });

      test('ISS-16244 - Negative Testing - Auto eFNOL Without Login Validate Create Claim Unauthorized- @club', async ({ request}, testInfo) => {
        testInfo.annotations.push({ type: 'test_key', description: 'ISS-16244' });
        correlationId=uuidv4();
        console.log("CorrelationId ID - Auto eFNOL Without Login Validate Create Claim Unauthorized - ",correlationId)
        const response = await request.post(`${baseUrl}/auto/claim/`, {
          headers: {
            Accept: "application/json",
            'X-Ace-Test-Region': testRegion,
            'X-Request-Id': correlationId,
            'X-Ace-Session-Id': sessionId,
            //Authorization: `Bearer ${token}`
          },
          ignoreHTTPSErrors: true,
          
          data: {
            policy: {
              policyNumber: policyNumber,
              policyType: 'Auto',
              effectiveDate: effectiveDate,
              expirationDate: expirationDate
            },
            lossDate: '2024-01-26T07:00:00.000Z',
            lossTime: '09:09',
            lossType: 'AUTO',
            lossCause: 'othercomp',
            isNotificationOnly: false

          },
          maxRedirects: 0
        });
        apiActions.verifySpFailureStatusCode(response,401);
      });

      test('ISS-16245 - Negative Testing - Auto eFNOL Without Login Validate Submit Claim Unauthorized - @club', async ({ request}, testInfo) => {
        testInfo.annotations.push({ type: 'test_key', description: 'ISS-16245' });
        correlationId=uuidv4();
        console.log("CorrelationId ID - Auto eFNOL Without Login Validate Submit Claim Unauthorized - ",correlationId)
        const response = await request.put(`${baseUrl}/auto/claim/`, {
          headers: {
            Accept: "application/json",
            'X-Ace-Test-Region': testRegion,
            'X-Request-Id': correlationId,
            'X-Ace-Session-Id': sessionId,
            //Authorization: `Bearer ${token}`
          },
          ignoreHTTPSErrors: true,
          
          data: {
            claimNumber: claimNumber,
            lossDate: '2022-01-26T07:00:00.000Z',
            lossTime: '09:09',
            reporter: {
                driverId: driverId
            },
            contactInfo: {
                phone: customerPhone,
                email: customerEmail,
                preferredContactMethod: 'main_email'
            },
            lossLocation: {
               city: 'Los Angeles',
               state: 'CA'
            },
            lossCause: 'othercomp',
            lossDescription: 'test optiv',
            lossVehicle: {
              vehicleId: vehicleId,
              vehicleDrivenOrParked: 'beingDriven',
              damageDescription: 'test optiv - damage description',
              passengerCount: 'one',
              hadInjuries: 'yes',
              towed: 'yes',
              incidentDriverId: driverId
            },
            incidentOtherVehicleCount: 'one',
            hadOtherPropertyDamage: 'yes',
            incidentOtherNonVehicleParties: 'cyclist and pedestrian',
            isTextCommunicationOptIn: true,
            incidentSingleOtherVehicle: {
              wasSomeoneDrivingOtherVehicle: 'yes',
              hadInjuries: 'yes',
              passengerCount: 'one',
              vehicleInfo: {
                make: 'Toyota',
                model: 'camry',
                year: 2021
              },
              insuranceCompany: {
                companyName: 'Progressive - optiv testing',
                policyNumber: 'some-good-policy-number'
              },
              driver: {
                firstName: 'OtherDriverFname',
                lastName: 'OtherDriverLname',
                mobilePhone: '213-123-1231'
              }
            },
            witness: {
              firstName: 'WitnessFname',
              lastName: 'WitnessLname',
              mobilePhone: '123-232-1221'
            }
          },
          maxRedirects: 0
        });
        apiActions.verifySpFailureStatusCode(response,401); 

      });

    });

function dependsOn(arg0: string) {
  throw new Error('Function not implemented.');
}
