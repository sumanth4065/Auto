import { APIResponse, request, expect } from '@playwright/test';
import { randomUUID } from 'crypto';
import commfun from './CommonFunctions';
import testdata from '../testdata/alltestdata';
import { SelectedTestData } from './CommonTestData';
import axios, { AxiosRequestConfig } from 'axios';
const qs = require('qs');

export class APIActions {

    async verifySuccessStatusCode(response: APIResponse) {
        await expect(response.status()).toBe(200);
        //const jsonResponse = await response.json();
        // console.log(jsonResponse);

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
    async getOktaTokenNew(pusername, ppassword, pstate, penv,ppolicynumber: string) {
        const data = qs.stringify({
            client_id: testdata.oktaClientId,
            client_secret: testdata.oktaClientSecret,
            grant_type: 'password',
            username: pusername,
            password: ppassword,
            policyNumber: ppolicynumber,
            //  scope: 'openid profile customerId clubCode customerId selfRecovery offline_access',
            scope: 'profile clubCode scope openid customerId'
        });

        let generateTokenResponse;
        const option: AxiosRequestConfig = {
            method: 'post',
            url: testdata.oktaTokenUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // "Authorization": "Basic MG9hMW1tZzNmMG03N1dTQzUwaDg6UVlURmV2SHdCUVlWZWI2VDFwN0NwTW1fUXdFeDVmckwzYXBDaGtobA=="
            },
            data: data,

        };

        await axios
            .request(option)
            .then(async function (response) {
                generateTokenResponse = await Promise.resolve(response.data.access_token);
                console.log(`Successfully retrieved the OKTA token.`);
            })
            .catch(function (error) {
                throw new Error('Response status: ' + error.response.status + '. Unable to get token due to ' + JSON.stringify(error.response.data));
            });

        const jsonData = generateTokenResponse;
        const parsedAccessToken = commfun.parseJwt(jsonData)
        let policyNumber;
        if (pstate === 'TX' || pstate === 'MO') {
            policyNumber = ppolicynumber;
        } else {
            policyNumber = commfun.getAutoPolicy(parsedAccessToken.scope, pstate);
            console.log("policy number from com fun = "+policyNumber);
        }
        const clubCode = parsedAccessToken.clubCode;
        return [policyNumber, clubCode, jsonData];

    }
    async callFlowDirector(pPolicyNumber: string, pPolicyClass: string, pClubCode: string, ptoken, pregion) {
        let flowDirectorRequestData = `policy=${pPolicyNumber}&claim=efnol&clubCode=${pClubCode}&mode=auto`;
        //policy={{policyNumber}}&claim=efnol&clubCode=004&mode=auto
        let newregion = '';
        if (pregion === 'A1') {
            newregion = '1';
        }
        else if (pregion === 'B1') {
            newregion = '2';
        }
        const flowDirectorRequestData1 = new URLSearchParams();
        flowDirectorRequestData1.append('redirectMode', 'auto');
        flowDirectorRequestData1.append('policy', pPolicyNumber);
        flowDirectorRequestData1.append('claim', 'efnol');
        flowDirectorRequestData1.append('clubCode', pClubCode);
        flowDirectorRequestData1.append('mode', 'AUTO');
        flowDirectorRequestData1.append('sourceApp', 'MyAccount');
        flowDirectorRequestData1.append('testRegion', pregion);

        // Client migrated Flow Director to the v2 route under insurance-auto-efnol.
        const baseflowdirectorurl = `https://api${process.env.TEST_ENV}1.ace.aaa.com/insurance-auto-efnol/v2/flow-director`;
        const apiContextfrFlowDirector = await request.newContext({
            baseURL: baseflowdirectorurl,
        });
        let flowDirectorResponse;
        try {
            flowDirectorResponse = await apiContextfrFlowDirector.post(baseflowdirectorurl, {
                headers: {
                    Accept: "*/*",
                    Authorization: `Bearer ${ptoken}`,
                    "X-Ace-Test-Region": pregion,
                    "X-Request-Id": randomUUID(),
                },
                ignoreHTTPSErrors: true,
                data: flowDirectorRequestData1.toString(),
                //data: flowDirectorRequestData,
                maxRedirects: 0
            });
            // A working policy returns a 302 redirect whose Location header holds the
            // behindlogin cacheId. Non-working policies return no such redirect.
            const flowDirectorResponseHeaders = flowDirectorResponse.headers();
            const redirectLocation = flowDirectorResponseHeaders.location;
            const cacheId = redirectLocation?.split('behindlogin/')[1]?.split('?')[0];
            if (!cacheId) {
                return undefined;
            }
            return [cacheId];
        } catch (error) {
            console.log('Error in Flow Director Call');
            console.log(error);
        }
    }

    // Tries each candidate user until Flow Director returns a valid claim (working
    // policy), so non-working test data is skipped automatically. Returns the full
    // working record (name/policy/zip) used by both with-login and anon suites.
    async resolveWorkingRecord(
        candidates: SelectedTestData[],
        ppassword: string,
        pstate: string,
        penv: string,
        pregion: string,
        pPolicyClass = 'AUTO',
        maxAttempts = 15,
    ): Promise<SelectedTestData | undefined> {
        for (const candidate of candidates.slice(0, maxAttempts)) {
            try {
                const [policyNumber, clubCode, token] = await this.getOktaTokenNew(
                    candidate.username, ppassword, pstate, penv, candidate.policynumber,
                );
                if (!policyNumber || !token) continue;
                const guid = await this.callFlowDirector(policyNumber, pPolicyClass, clubCode, token, pregion);
                if (guid && guid[0]) {
                    return { ...candidate, policynumber: policyNumber };
                }
                console.log(`[CommonTestData] Skipping non-working policy for ${candidate.username}`);
            } catch (error) {
                console.log(`[CommonTestData] Skipping ${candidate.username}: ${(error as Error).message}`);
            }
        }
        return undefined;
    }

    async resolveWorkingUser(
        candidates: { username: string; policynumber: string }[],
        ppassword: string,
        pstate: string,
        penv: string,
        pregion: string,
        pPolicyClass = 'AUTO',
        maxAttempts = 15,
    ): Promise<{ username: string; policyNumber: string } | undefined> {
        const record = await this.resolveWorkingRecord(
            candidates as SelectedTestData[], ppassword, pstate, penv, pregion, pPolicyClass, maxAttempts,
        );
        return record ? { username: record.username, policyNumber: record.policynumber } : undefined;
    }

}