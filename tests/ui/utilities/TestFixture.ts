import { test as base} from "@playwright/test";
import { APIActions } from "./APIActions";
import { getCommonTestDataCandidates } from "./CommonTestData";
import { AuthenticationWorkflow } from "../WorkFlows/AuthenticationWorkflow";
import { ClaimInitiationWorkflow } from "../WorkFlows/ClaimInitiationWorkflow";
import { ReporterVehicleDriverWorkflow } from "../WorkFlows/ReporterVehicleDriverWorkflow";
import { AdditionalDetailsWorkflow } from "../WorkFlows/AdditionalDetailsWorkflow";
import { ReviewSubmitWorkflow } from "../WorkFlows/ReviewSubmitWorkflow";


// Declare the types of your fixtures.
export type MyOptions = {
  username: string;
  password:string;
  env:string;
  state:string;
  region:string;
  clubname:string;
  policynumber:string;
  firstname:string;
  lastname:string;
  zipcode:string;
  existingClaimNum:string;
  
};

export type WorkflowFixtures = {
  authenticationWorkflow: AuthenticationWorkflow;
  claimInitiationWorkflow: ClaimInitiationWorkflow;
  reporterVehicleDriverWorkflow: ReporterVehicleDriverWorkflow;
  additionalDetailsWorkflow: AdditionalDetailsWorkflow;
  reviewSubmitWorkflow: ReviewSubmitWorkflow;
};

const WITH_LOGIN_PROJECTS = new Set([
  "RegressionEFNOLWithLoginHUON",
  "RegressionEFNOLWithLoginGW",
]);

export const test = base.extend<MyOptions & WorkflowFixtures>({
  username: [
    async ({}, use, workerInfo) => {
      const project = workerInfo.project.name;
      if (!WITH_LOGIN_PROJECTS.has(project)) {
        await use(process.env.TEST_USERNAME || "004_28367878@aaa.com");
        return;
      }
      const password = process.env.MYACT_PASSWORD || "autoclub1";
      const policyType = project.includes("GW") ? "GW" : "HUON";
      const state = process.env.STATE_INPUT || "CA";
      const candidates = getCommonTestDataCandidates(state, policyType, "A1");
      if (candidates.length === 0) {
        throw new Error(`No ${policyType} test data candidates found for state ${state}`);
      }
      const resolved = await new APIActions().resolveWorkingUser(
        candidates, password, state, process.env.TEST_ENV || "uat", "A1",
      );
      const working = resolved ?? {
        username: candidates[0].username,
        policyNumber: candidates[0].policynumber,
      };
      console.log(
        resolved
          ? `[CommonTestData] Working ${policyType} user: ${working.username} (policy ${working.policyNumber})`
          : `[CommonTestData] No validated ${policyType} user; falling back to ${working.username}`,
      );
      await use(working.username);
    },
    { scope: "worker" },
  ],
  password : [process.env.MYACT_PASSWORD || "autoclub1", { option: true }],
  firstname: [process.env.TEST_FIRSTNAME || "Jaz", { option: true }],
  lastname : [process.env.TEST_LASTNAME || "Connecticut", { option: true }],
  env : [process.env.TEST_ENV || "ace.aaa.com", { option: true }],
  //hasdocuments : [0, { option: true }],
  //hasmortgage : [0, { option: true }],
  state :  [process.env.STATE_INPUT || "CA", { option: true }],
  region: [process.env.TEST_REGION || "B1", { option: true }],
  clubname :  [process.env.TEST_CLUBNAME || "RI", { option: true }],
  policynumber :  [process.env.TEST_POLICYNUMBER || "CAA027471203", { option: true }],
  zipcode :  [process.env.TEST_ZIPCODE || "06612", { option: true }],
  existingClaimNum:[process.env.TEST_EXISTINGCLAIM || "03/24/2026", {option: true}],
  
  // Workflow fixtures - each depends on page and creates the workflow instance
  authenticationWorkflow: async ({ page }, use) => {
    await use(new AuthenticationWorkflow(page));
  },
  
  claimInitiationWorkflow: async ({ page }, use) => {
    await use(new ClaimInitiationWorkflow(page));
  },
  
  reporterVehicleDriverWorkflow: async ({ page }, use) => {
    await use(new ReporterVehicleDriverWorkflow(page));
  },
  
  additionalDetailsWorkflow: async ({ page }, use) => {
    await use(new AdditionalDetailsWorkflow(page));
  },
  
  reviewSubmitWorkflow: async ({ page }, use) => {
    await use(new ReviewSubmitWorkflow(page));
  },
});
export { expect,chromium} from "@playwright/test";
