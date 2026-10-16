import { expect, Locator, Page, BrowserContext } from '@playwright/test';
import { KnockoutPageObjects } from '../objectRepository/KnockoutPageObjects';
import { TestBase } from '../../lib/TestBase';
import insurancetestdata from '../../testdata/insuranceproperties';
import testdata from '../../testdata/alltestdata';
import commonfun from '../../utilities/CommonFunctions';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';

export class KnockOutPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }
  knockoutPageObjects = new KnockoutPageObjects();

  async efValidateKnockOutPageTitle() {
    const title = await this.page.title();
    console.log(title);
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_POLICY_CHANGE);
  }
  async validateKnockOutPage() {
    let isKnockOutPageValidated;
    // console.log(this.knockOutPageObjects.TXTBOX1);
    if (
      this.knockoutPageObjects.TXTBOX1.includes('{{FirstName}}, your claim has not been submitted.')
    ) {
      console.info('Knock out page validated');
      isKnockOutPageValidated = true;
    } else {
      console.info('Knock out page validated');
      isKnockOutPageValidated = false;
    }
    return isKnockOutPageValidated;
  }
  async validateknockoutReferenceNumber() {
    await this.waitforElement(this.knockoutPageObjects.RFRENCENBR);
    await this.verifyElementVisible(this.knockoutPageObjects.RFRENCENBR);
    let referencenumber = await this.getElementText(this.knockoutPageObjects.RFRENCENBR);
    console.log(referencenumber);
    await this.verifyElementVisible(this.knockoutPageObjects.BACKTOACCNTBTN);
    await this.verifyElementEnabled(this.knockoutPageObjects.BACKTOACCNTBTN);
  }
}