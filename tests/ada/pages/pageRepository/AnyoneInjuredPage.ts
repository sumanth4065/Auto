import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { AnyoneInjuredPageObjects } from '../objectRepository/AnyoneInjuredPageObjects';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';

export class AnyoneInjuredPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  anyoneInjuredPageObjects = new AnyoneInjuredPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateAnyoneInjuredPageDisplay() {
    await this.verifyElementContainsText(this.anyoneInjuredPageObjects.TITLETEXT, EXPECTED_TEXTS.ANYONE_INJURED_TITLE);
    await this.verifyElementVisible(this.anyoneInjuredPageObjects.BACKBUTTON);
    await this.verifyElementVisible(this.anyoneInjuredPageObjects.IDONTKNOWBUTTON);
  }

  async efNavigatetoWhatHappened(selectedOption: string) {
    const option = selectedOption.toLowerCase();

    if (option === 'yes') {
      console.log('Select Yes for Anyone Injured');
      await this.clickElement(this.anyoneInjuredPageObjects.YESRADIOBUTTON);
    } else if (option === 'no') {
      console.log('Select No for Anyone Injured');
      await this.clickElement(this.anyoneInjuredPageObjects.NORADIOBUTTON);
    } else {
      throw new Error(`Invalid option: ${selectedOption}. Expected 'yes' or 'no'`);
    }
    await this.clickElement_WaitforNavigation(this.anyoneInjuredPageObjects.NEXTBUTTON, URL_ENDPOINTS.ADDITIONAL_DETAILS);
  }
}