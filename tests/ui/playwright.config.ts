import { TIMEOUT } from "dns";
import { type PlaywrightTestConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import type { MyOptions } from "./utilities/TestFixture";
import { getCommonTestData } from "./utilities/CommonTestData";

// GW policynumber default from the common test data. The username for WithLogin
// projects is resolved (and validated) in the TestFixture, not here.
const gwCommonData = getCommonTestData(process.env.STATE_INPUT, "GW");
const junitPath =
	process.env.JUNIT_REPORT_PATH ||
	"tests/ui/junitreports/default-junit-report.xml";
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config();

export const TIMEOUTS = {
	LOW: 1000,
	MEDIUM: 5000,
	HIGH: process.env.TEST_ENV === "uat" ? 20000 : 10000,
	MAX: process.env.TEST_ENV === "uat" ? 90000 : 60000,
};

const config: PlaywrightTestConfig<MyOptions> = {
	testDir: "./tests",
	//timeout: 150 * 1000,
	timeout: TIMEOUTS.MAX * 2,
	// timeout-minutes. Override with GLOBAL_TIMEOUT_MIN (minutes); default 55.
	globalTimeout: Number(process.env.GLOBAL_TIMEOUT_MIN ?? 55) * 60 * 1000,
	reporter: process.env.PIPELINE
		? [
				[
					"@ace-clublabs/playwright-splunk-reporter",
					{
						tags: {
							category: "ui",
							team: "insurance-self-service",
							"app-name": "efnolwoli",
							environment: process.env.TEST_ENV,
							region: process.env.AWS_REGION ?? "",
							state: process.env.STATE_INPUT ?? "",
						},
					},
				],
				["line"],
				["html", { outputFolder: "htmlreports", open: "never" }],
				["junit", { outputFile: junitPath }],
				[
					"junit",
					{
						outputFile: "test-results/xray-results.xml",
						embedAnnotationsAsProperties: true,
						embedAnnotationsAsPropertiesKey: "test_key",
					},
				],
			]
		: [
				["line"], 
				["html", { outputFolder: "htmlreports", open: "never" }],
				[
					"junit",
					{
						outputFile: "test-results/xray-results.xml",
						embedAnnotationsAsProperties: true,
						embedAnnotationsAsPropertiesKey: "test_key",
					},
				],
			],
	expect: {
		//timeout: 50000
		timeout: TIMEOUTS.MAX,
	},
	projects: [
		{
			name: "RegressionEFNOLWOLI",
			grep: /@club/,
			use: {
				firstname: `${process.env.TEST_FIRSTNAME}`,
				lastname: `${process.env.TEST_LASTNAME}`,
				env: `${process.env.TEST_ENV}`,
				zipcode: `${process.env.TEST_ZIPCODE}`,
				policynumber: `${process.env.TEST_POLICYNUMBER}`,
			},
		},
		{
			name: "SanityEFNOLWOLI",
			grep: /@sanity/,
			use: {
				firstname: `${process.env.TEST_FIRSTNAME}`,
				lastname: `${process.env.TEST_LASTNAME}`,
				env: `${process.env.TEST_ENV}`,
				zipcode: `${process.env.TEST_ZIPCODE}`,
				policynumber: `${process.env.TEST_POLICYNUMBER}`,
			},
		},
		{
			name: "ProdSanityAutoEFNOLAnon",
			grep: /@prod/,
			use: {
				firstname: `Michelle`,
				lastname: `Nguyen`,
				zipcode: `92618`,
				policynumber: `CAA094776319`,
				clubname: "CA",
				baseURL: `https://ace.aaa.com/insurance/auto/file-a-claim`,
			},
		},
		{
			name: "ProdSanityAutoEFNOLAnon",
			grep: /@invalid/,
			use: {
				firstname: `Jane`,
				lastname: `Doe`,
				zipcode: `91205`,
				policynumber: `CAA123456789`,
				clubname: "CA",
				baseURL: `https://ace.aaa.com/insurance/auto/file-a-claim`,
			},
		},
		{
			name: "RegressionEFNOLWithLoginHUON",
			grep: /@huon/,
			use: {
				password: process.env.MYACT_PASSWORD,
				env: `${process.env.TEST_ENV}`,
				state: process.env.STATE_INPUT,
				clubname: process.env.STATE_INPUT,
				zipcode: `${process.env.TEST_ZIPCODE}`,
				region: "A1",
				policynumber: `${process.env.TEST_POLICYNUMBER ?? ""}`,
				existingClaimNum: `${process.env.TEST_EXISTINGCLAIM}`,
				...devices["Desktop Chrome"],
			},
		},
		 {
			name: "RegressionEFNOLWithLoginGW",
			grep: /@gw/,
			use: {
				password: process.env.MYACT_PASSWORD,
				env: `${process.env.TEST_ENV}`,
				state: process.env.STATE_INPUT,
				zipcode: `${process.env.TEST_ZIPCODE}`,
				policynumber:
					process.env.TEST_POLICYNUMBER || gwCommonData?.policynumber || "",
				clubname: process.env.STATE_INPUT,
				existingClaimNum: `${process.env.TEST_EXISTINGCLAIM}`,
				region: "A1",
			},
		}, 
	],
	fullyParallel: true,
	forbidOnly: !!process.env.PIPELINE,
	retries: process.env.PIPELINE ? 1 : 0,
	workers: process.env.PIPELINE ? 2 : 2,
	use: {
		actionTimeout: TIMEOUTS.HIGH,
		trace: "off",
		headless: true,
		screenshot: "only-on-failure",
		ignoreHTTPSErrors: true,
		// viewport: { width: 360, height: 850 },
		video: "off",
		//baseURL: `https://appuat2.ace.aaa.com/insurance/auto/file-a-claim`,
		baseURL: `ace.aaa.com/insurance/auto/file-a-claim`,
		//baseURL: `https://account.app.qa.ace.aaa.com/?backend=A1`,
		//navigationTimeout: 150 * 1000
		navigationTimeout: TIMEOUTS.MAX * 2,
	},
};

export default config;
