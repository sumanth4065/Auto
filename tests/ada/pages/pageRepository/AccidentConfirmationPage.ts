import { expect, Locator, Page } from '@playwright/test';
import { AccidentConfirmationPageObjects } from '../objectRepository/AccidentConfirmationPageObjects';
import { TestBase } from '../../lib/TestBase';
import insurancetestdata from '../../testdata/insuranceproperties';
import testdata from '../../testdata/alltestdata';

export class AccidentConfirmationPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }
  accidentConfirmationPageObjects = new AccidentConfirmationPageObjects();

  async efValidateAutoClaim() {
    await this.waitforElement(this.accidentConfirmationPageObjects.CONFIRMATIONPGHDR);
    await this.verifyElementContainsText(this.accidentConfirmationPageObjects.CONFIRMATIONPGHDR, testdata.ACCIDENTCONFIRMATIONHDR);
    await this.verifyElementVisible(this.accidentConfirmationPageObjects.CLAIMNUMBER);
    let claimnumberdip = await this.getElementText(this.accidentConfirmationPageObjects.CLAIMNUMBER);
    console.log(claimnumberdip);
    await this.verifyElementVisible(this.accidentConfirmationPageObjects.RETURNTOHOME);
    await this.verifyElementEnabled(this.accidentConfirmationPageObjects.RETURNTOHOME);
  }
}
