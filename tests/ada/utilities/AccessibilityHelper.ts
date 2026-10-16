import { expect, Page, TestInfo } from '@playwright/test';
// import { AxeHelper } from '../axe/AxeHelper';
// import { AxeLogType } from '../axe/AxeLogType';
import { AxeUtil } from '../lib/AxeUtil';

import { AxeHelper, AxeLogType } from '@ace-clublabs/playwright-utility';

export class AccessibilityHelper {

  static async runScan(
    page: Page,
    pageName: string,
    axeTags: string[],
    deviceType: string,
    testInfo?: TestInfo
  ) {

    const axeRequest = new AxeUtil(page);
    const pageTitle = await page.title();
    AxeHelper.log(AxeLogType.Page, pageTitle);
    const scanResults = await axeRequest.axeCallToAnalyzeWithTags(axeTags);
    const scanFormattedResults = await axeRequest.axeGetScanResults( scanResults,`${pageName}_${deviceType}`);
    await axeRequest.axeGenerateHTMLReport(`${pageName}_${deviceType}`,scanResults );
    const scanSummary = AxeHelper.getScanSummary( scanFormattedResults, deviceType );
    AxeHelper.log( AxeLogType.Summary, scanSummary );

    if (testInfo) {
      await testInfo.attach(
        `${pageName}-Accessibility-Results`,
        {
          body: JSON.stringify(
            scanResults,
            null,
            2
          ),
          contentType: 'application/json'
        }
      );
    }

    if (scanResults.violations.length > 0) {
      const { findings } = scanFormattedResults[0];

      await axeRequest.axePrintViolationDetials(
        findings
      );
    }
    expect.soft(scanResults.violations.length,`${pageName} contains accessibility violations` ).toBe(0);

    return scanResults;
  }
}
