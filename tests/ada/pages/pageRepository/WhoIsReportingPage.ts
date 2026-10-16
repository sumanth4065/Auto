import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { WhoIsReportingPageObjects } from '../objectRepository/WhoIsReportingPageObjects';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { FULL_URL_PATTERNS } from '../../testdata/urlEndpoints';

export class WhoIsReportingPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  whoIsReportingPageObjects = new WhoIsReportingPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateWhoIsReportingPageDisplay() {
    await this.verifyElementContainsText(
      this.whoIsReportingPageObjects.TITLETEXT,
      EXPECTED_TEXTS.WHO_REPORTING_TITLE
    );
    await this.verifyElementContainsText(
      this.whoIsReportingPageObjects.SUBTITLETEXT,
      EXPECTED_TEXTS.WHO_REPORTING_SUBTITLE
    );
    await this.verifyElementVisible(this.whoIsReportingPageObjects.BACKBUTTON);
  }

  async efNavigatetoContactInfoPage1(selectedOption: string) {
    await this.clickElement(this.whoIsReportingPageObjects.REPORTERDROPDOWN);

    switch (selectedOption) {
      case 'Option1':
        console.log('Selecting Reporter1 from List');
        await this.clickElement(this.whoIsReportingPageObjects.SELECTFIRSTOPTION);
        await this.clickElement(this.whoIsReportingPageObjects.NEXTBUTTON);
        await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_CONTACTINFO);
        break;

      case 'NotlistedOption':
        console.log('Selecting Not listed Option');
        await this.clickElement(this.whoIsReportingPageObjects.SELECTSECONDOPTION);
        await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_KNOCKOUT);
        break;
    }
  }
}
