// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
const rimraf = require('rimraf');

async function globalSetup(config: FullConfig) {
  try {
    rimraf.sync('./a11y_results/*');
  } catch (error) {
    console.log(error.Message);
  }
}

export default globalSetup;
