import { expect, Locator, Page } from '@playwright/test';
const AxeDevtoolsBuilder = require('@axe-devtools/playwright').default;
const AxeDevToolsLogger = require('@axe-devtools/logger').default;
const Reporter = require('@axe-devtools/reporter').default;
import { TestBase } from './TestBase';
import testutil from './TestUtils';
import * as fs from 'fs';

export class AxeUtil extends TestBase {
  constructor(page: Page) {
    super(page);
    // this.page = page;
  }

  async axeCallToAnalyze() {
    const title = await this.page.title();
    console.log('Title of Page is ' + title);
    try {
      const axeb = await new AxeDevtoolsBuilder({ page: this.page }).enableTracking(true);
      const results = await axeb.analyze();
      return results;
    } catch (e) {
      console.log(e.Message);
    }
  }

  async axeGetScanResults(presults,ppagename) {
    //const logger = new AxeDevToolsLogger('playwright', `./axe_devtools_results/a11y_results_${new Date().toISOString()}`);
    let dt=testutil.get_DateAndTime();
    const logger = new AxeDevToolsLogger('efnol', `./axe_devtools_results/a11y_results_${dt}`);
    logger.logTestResult(`${ppagename}`, presults);
    // fs.copyFile(`./axe_devtools_results/a11y_results_${dt}/policyview-${ppagename}.json`, `./axe_devtools_all_results/policyview-${ppagename}-${dt}.json`, (err) => {
    //   if (err) throw err;
    //   console.log('File was copied to destination');
    // });
    return logger.getTestResults();
  }

  async axePrintViolationDetials(presults) {
    console.log("Violations in url :" + presults.url);
    for (var val in presults.violations) {
      for (var vnode in presults.violations[val].nodes) {
        console.log("DETAILS:");
        console.log(presults.violations[val].nodes[vnode]);
      }
    }
  }
  async axeGenerateHTMLReport(pPageDesc, presults) {
    const timestamp = new Date().getTime();
    const uniquePageDesc = `${pPageDesc}_${timestamp}`;
    const reporter = new Reporter('efnol', './a11y_results');
    reporter.logTestResult(uniquePageDesc, presults);
    reporter.buildHTML('./a11y_results');
  }

  async axeGenerateXMLReport(pPageDesc, presults) {
    const reporter = new Reporter('efnol', './a11y_results');
    reporter.logTestResult(pPageDesc, presults);
    reporter.buildJUnitXML('./a11y_results');
    reporter.buildCSV('./a11y_results');
  }
  async axeGenerateCSVReport(pPageDesc, presults) {
    const reporter = new Reporter('playwright', './a11y_results');
    reporter.logTestResult(pPageDesc, presults);
    reporter.buildCSV('./a11y_results');
  }

  async axeCallToAnalyzeWithTags(pTags: Array<string>) {
    const title = await this.page.title();
    console.log('Title of Page is ' + title);
    const axeb = await new AxeDevtoolsBuilder({ page: this.page }).withTags(pTags);
    const results = await axeb.analyze();
    return results;
  }

  async axeCallToAnalyzeWithRules(pRules: Array<string>) {
    const title = await this.page.title();
    console.log('Title of Page is ' + title);
    const axeb = await new AxeDevtoolsBuilder({ page: this.page }).withRules(pRules);
    const results = await axeb.analyze();
    return results;
  }
}
