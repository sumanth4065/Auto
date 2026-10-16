import { Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { EmailAddressPageObjects } from '../objectRepository/EmailAddressPageObjects';

export class EmailAddressPage extends TestBase {
  emailAddrPageObjects: EmailAddressPageObjects;

  constructor(page: Page) {
    super(page);
    this.emailAddrPageObjects = new EmailAddressPageObjects();
  }
  async verifyEmailAndClickAskMeLaterBtn() {
    await this.clickElement(this.emailAddrPageObjects.ASK_ME_LATER_BTN);
    console.log('clicked on ask me later button');
    // Wait for the modal to fully close before the underlying page is validated
    await this.page.locator(this.emailAddrPageObjects.ASK_ME_LATER_BTN).waitFor({ state: 'hidden' });
  }

}