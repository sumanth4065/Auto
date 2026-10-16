import { APIResponse, request, expect } from '@playwright/test';
import commfun from './CommonFunctions';
import testdata from '../testdata/alltestdata';
import axios, { AxiosRequestConfig } from 'axios';
//const qs = require('qs');

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

    async getPolicyDetails(ppolicynumber: String, ptoken, pclub,penv)
    {
        const apiContextfrPolicy = await request.newContext();
        const basepolicydetailsurl=`https://api${penv}1.ace.aaa.com/insurance-policy-info/v1/policies/${ppolicynumber}/details`
        const policydtls_response = await apiContextfrPolicy.get(basepolicydetailsurl, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${ptoken}`,
            },
            ignoreHTTPSErrors: true
          });
          const policyDtlsJsonResponse = await policydtls_response.json();
          //console.log(policyDtlsJsonResponse);
          return policyDtlsJsonResponse;
    }
}