import type { PlaywrightTestConfig } from '@playwright/test';
import { MyOptions } from './utilities/TestFixture';
import dotenv from 'dotenv';

//import path from 'path';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig<MyOptions> = {
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 60 * 1000,
  reporter: process.env.PIPELINE
    ? [
        ['line'],
        [
          '@ace-clublabs/playwright-splunk-reporter',
          {
            tags: {
              category: 'api', //ui, ada
              team: 'insurance-self-service',
              'app-name': 'efnolautowithoutlogin',
              environment: process.env.TEST_ENV,
              region: process.env.AWS_REGION ?? ''
            }
          }
        ],
        ['line'],
        ['html', { outputFolder: 'htmlreports', open: 'never' }],
        ['junit', { outputFile: 'test-results/xray-results.xml', embedAnnotationsAsProperties: true, embedAnnotationsAsPropertiesKey: 'test_key' }]

      ]
    : [
        ['line'], 
        ['html', { outputFolder: 'htmlreports', open: 'never' }],
        ['junit', { outputFile: 'test-results/xray-results.xml', embedAnnotationsAsProperties: true, embedAnnotationsAsPropertiesKey: 'test_key' }]
      ],

  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 500000
  },
  projects: [
    {
      name: 'eFNOLAutoAPIA1',
      grep: /@club/,
      use: {
        username: `${process.env.TEST_USERNAME}`,
        password: process.env.MYACT_PASSWORD,
        env: `${process.env.TEST_ENV}`,
        clubname: `${process.env.STATE_INPUT}`,
        policynumber: `${process.env.TEST_POLICYNUMBER}`
      },

    },
    {
      name: "AutoEfnol_API_WithLogin",
      grep: /@Autoefnol_BL/,
      use: {
        username: `${process.env.TEST_USERNAME}`,
        password: process.env.MYACT_PASSWORD,
        env: `${process.env.TEST_ENV}`,
        clubname: `${process.env.TEST_CLUBNAME}`,
        policynumber: `${process.env.TEST_POLICYNUMBER}`,
        //clubcode: `${process.env.CLUB_CODE}`
      },
    },
    // {
    //   name: 'eFNOLAutoAPIB1',
    //   grep: /@club/,
    //   use: {
    //     username: `${process.env.TEST_USERNAME}`,
    //     password: process.env.MYACT_PASSWORD,
    //     env: `${process.env.TEST_ENV}`,
    //     clubname: `${process.env.STATE_INPUT}`,
    //     policynumber: `${process.env.TEST_POLICYNUMBER}`

    //   }
    // },
  ],
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'off',
    headless: true,
    screenshot: 'on',
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    video: 'off',
    baseURL: `https://apiuat2.ace.aaa.com/`
  }
};

export default config;
