import { expect, Page } from '@playwright/test';
import { test, MyOptions } from '../../utilities/TestFixture';
import { TestBase } from '../../lib/TestBase';
import { IntroductionPageObjects } from '../objectRepository/IntroductionPageObjects';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import testdata from '../../testdata/alltestdata';

export class IntroductionPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  introductionPageObjects = new IntroductionPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.LOGIN_TITLE);
  }

  async efValidateIntroductionPageDisplay() {
    await this.enterText(this.introductionPageObjects.zipCodeField, testdata.zipcode);
    await this.clickElement_WaitforNavigation(this.introductionPageObjects.goButton, '');
    await this.verifyElementContainsText(
      this.introductionPageObjects.TITLETEXT,
      EXPECTED_TEXTS.INTRO_TITLE
    );
  }

  async efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode) {
    await expect(this.page.locator(this.introductionPageObjects.FIRSTNAME)).toBeEditable();
    await this.enterText(this.introductionPageObjects.FIRSTNAME, firstName);
    await expect(this.page.locator(this.introductionPageObjects.FIRSTNAME)).toHaveValue(firstName);
    await this.enterText(this.introductionPageObjects.LASTNAME, lastName);
    await expect(this.page.locator(this.introductionPageObjects.LASTNAME)).toHaveValue(lastName);
    await this.enterText(this.introductionPageObjects.POLICYNUMBER, policyNumber);
    await expect(this.page.locator(this.introductionPageObjects.POLICYNUMBER)).toHaveValue(
      policyNumber
    );
    await this.enterText(this.introductionPageObjects.ZIPCODE, zipCode);
    await expect(this.page.locator(this.introductionPageObjects.ZIPCODE)).toHaveValue(zipCode);
    await expect(this.page.locator(this.introductionPageObjects.NEXTBUTTON)).toBeEnabled();
    await this.clickElement_WaitforNavigation(this.introductionPageObjects.NEXTBUTTON, '');
  }
}
