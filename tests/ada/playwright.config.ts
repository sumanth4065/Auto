import { devices, PlaywrightTestConfig } from '@playwright/test';
import { MyOptions } from './utilities/TestFixture';
import dotenv from 'dotenv';
import { TIMEOUT } from 'dns';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config();
export const TIMEOUTS = {
  LOW: 1000,
  MEDIUM: 5000,
  HIGH: process.env.TEST_ENV === 'uat' ? 20000 : 10000,
  MAX: process.env.TEST_ENV === 'uat' ? 90000 : 60000,
};


const config: PlaywrightTestConfig<MyOptions> = {
  testDir: './tests',
  timeout: 150 * 1000,
  reporter: process.env.PIPELINE
    ? [
        [
          '@ace-clublabs/playwright-splunk-reporter',
          {
            tags: {
              category: 'ada',
              team: 'insurance-self-service',
              'app-name': 'efnolwithoutlogin',
              environment: process.env.TEST_ENV,
              region: process.env.AWS_REGION ?? '',
              state: process.env.STATE_INPUT ?? ''
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
    timeout: 50000
  },
  projects: [
    {
      name: 'eFNOLAutoada',
      grep: /@club/,
      use: {
        firstname: `${process.env.TEST_FIRSTNAME}`,
        lastname: `${process.env.TEST_LASTNAME}`,
        env: `${process.env.TEST_ENV}`,
        zipcode: `${process.env.TEST_ZIPCODE}`,
        policynumber: `${process.env.TEST_POLICYNUMBER}`
      }
    }
  ],

  forbidOnly: !!process.env.PIPELINE,
  retries: process.env.PIPELINE ? 1 : 0,
  workers: process.env.PIPELINE ? 1 : 2,
  use: {
    actionTimeout: 0,
    trace: 'off',
    headless: true,
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
    // viewport: { width: 360, height: 850 },
    video: 'off',
    baseURL: `https://appuat1.ace.aaa.com/insurance/auto/file-a-claim`,
    navigationTimeout: 150 * 1000
  }
};

export default config;
