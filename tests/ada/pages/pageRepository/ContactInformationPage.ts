import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { ContactInformationPageObjects } from '../objectRepository/ContactInformationPageObjects';
import testdata from '../../testdata/alltestdata';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { FULL_URL_PATTERNS } from '../../testdata/urlEndpoints';

export class ContactInformationPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  contactInformationPageObjects = new ContactInformationPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateContactInformationPageDisplay() {
    await this.verifyElementContainsText(
      this.contactInformationPageObjects.TITLETEXT,
      EXPECTED_TEXTS.CONTACT_INFO_TITLE
    );
    await this.verifyElementContainsText(
      this.contactInformationPageObjects.SUBTITLETEXT,
      EXPECTED_TEXTS.CONTACT_INFO_SUBTITLE
    );
    await this.verifyElementContainsText(
      this.contactInformationPageObjects.EMAILTEXT,
      EXPECTED_TEXTS.CONTACT_INFO_EMAIL
    );
    await this.verifyElementContainsText(
      this.contactInformationPageObjects.MOBILENUMBERTEXT,
      EXPECTED_TEXTS.CONTACT_INFO_MOBILE
    );
    await this.verifyElementVisible(
      this.contactInformationPageObjects.ENABLETEXTCOMMUNICATIONCHECKBOX
    );
    await this.verifyElementVisible(this.contactInformationPageObjects.BACKBUTTON);
  }

  async efNavigatetoCarDetailsTransitionPage() {
    await this.page.locator(this.contactInformationPageObjects.EMAILFIELD).fill('');
    await this.enterText(
      this.contactInformationPageObjects.EMAILFIELD,
      testdata.qa_automation_email
    );
    await this.page.locator(this.contactInformationPageObjects.MOBILENUMBERTEXT).fill('');
    await this.enterText(this.contactInformationPageObjects.MOBILENUMBERTEXT, testdata.aaaPhoneNum);
    await this.clickElement(this.contactInformationPageObjects.NEXTBUTTON);
    await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_CARD_DAMAGE_TRANSITION);
  }
}
