import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { DrivenOrParkedPageObjects } from '../objectRepository/DrivenOrParkedPageObjects';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';

export class DrivenOrParkedPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  drivenOrParkedPageObjects = new DrivenOrParkedPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateDrivenOrParkedPageDisplay() {
    await this.verifyElementContainsText(
      this.drivenOrParkedPageObjects.TITLETEXT,
      EXPECTED_TEXTS.DRIVEN_OR_PARKED_TITLE
    );
    await this.verifyElementVisible(this.drivenOrParkedPageObjects.BACKBUTTON);
    await this.verifyElementVisible(this.drivenOrParkedPageObjects.SUBTEXT);
  }

  async efNavigatetoDrivenOrParked(selectedOption: string) {
    switch (selectedOption) {
      case 'Driven':
        console.log('Select Driven Option');
        await this.clickElement(this.drivenOrParkedPageObjects.DRIVENRADIOBUTTON);
        await this.clickElement_WaitforNavigation(
          this.drivenOrParkedPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.DRIVEN_WHAT_HAPPENED
        );
        break;

      case 'Parked':
        console.log('Select Parked Option');
        await this.clickElement(this.drivenOrParkedPageObjects.PARKEDRADIOBUTTON);
        await this.clickElement_WaitforNavigation(
          this.drivenOrParkedPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.PARKED_WHAT_HAPPENED
        );
        break;
    }
  }
}
