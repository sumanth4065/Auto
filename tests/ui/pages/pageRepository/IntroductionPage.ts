import { expect, Page } from '@playwright/test';
import { test, MyOptions } from '../../utilities/TestFixture';
import { TestBase } from '../../lib/TestBase';
import { IntroductionPageObjects } from '../objectRepository/IntroductionPageObjects';
import { EXPECTED_TEXTS } from '../../../ada/testdata/expectedTexts';

export class IntroductionPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  introductionPageObjects = new IntroductionPageObjects();



  async efValidateTitle(expectedTitle: string = 'AAA | Login') {
    await expect(this.page).toHaveTitle(expectedTitle);

  }

  async efValidateIntroductionPageDisplay() {
    await this.verifyElementContainsText(this.introductionPageObjects.TITLETEXT, EXPECTED_TEXTS.INTRO_TITLE);
  }

  async efNavigatetoFileACliamPage(firstName: string, lastName: string, policyNumber: string, zipCode: string) {

    await this.enterText(this.introductionPageObjects.FIRSTNAME, firstName);
    await this.enterText(this.introductionPageObjects.LASTNAME, lastName);
    await this.enterText(this.introductionPageObjects.POLICYNUMBER, policyNumber);
    await this.enterText(this.introductionPageObjects.ZIPCODE, zipCode);
    await this.clickElement(this.introductionPageObjects.NEXTBUTTON);

  }
  async efNavigatetoFileACliamPageforCancelledpol(firstName: string, lastName: string, policyNumber: string, zipCode: string) {
    await this.enterText(this.introductionPageObjects.FIRSTNAME, firstName);
    await this.enterText(this.introductionPageObjects.LASTNAME, lastName);
    await this.enterText(this.introductionPageObjects.POLICYNUMBER, policyNumber);
    await this.enterText(this.introductionPageObjects.ZIPCODE, zipCode);
    await this.clickElement(this.introductionPageObjects.NEXTBUTTON);
    await this.page.waitForTimeout(5000)
    await this.verifyElementContainsText(this.introductionPageObjects.CANCELLEDMESSAGE, EXPECTED_TEXTS.INTRO_POLICY_CANCELLED_MESSAGE)

  }
  async efNavigatetoFileACliamPageforInvalidData(firstName: string, lastName: string, policyNumber: string, zipCode: string) {
    await this.enterText(this.introductionPageObjects.FIRSTNAME, firstName);
    await this.enterText(this.introductionPageObjects.LASTNAME, lastName);
    await this.enterText(this.introductionPageObjects.POLICYNUMBER, policyNumber);
    await this.enterText(this.introductionPageObjects.ZIPCODE, zipCode);
    await this.clickElement(this.introductionPageObjects.NEXTBUTTON);
    await this.page.waitForTimeout(3000)
    await this.verifyElementContainsText(this.introductionPageObjects.INVALIDDATAMESSAGE, EXPECTED_TEXTS.INTRO_INVALID_DATA_MESSAGE)

  }

}