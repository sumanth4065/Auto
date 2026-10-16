import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyAnyoneInjuredPageObjects } from '../objectRepository/OtherPartyAnyoneInjuredPageObjects';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';

export class OtherPartyAnyoneInjuredPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  otherPartyAnyoneInjuredPageObjects = new OtherPartyAnyoneInjuredPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateOtherPartyAnyoneInjuredPageDisplay() {
    await this.verifyElementContainsText(
      this.otherPartyAnyoneInjuredPageObjects.TITLETEXT,
      EXPECTED_TEXTS.OTHER_PARTY_ANYONE_INJURED_TITLE
    );
    await this.verifyElementVisible(this.otherPartyAnyoneInjuredPageObjects.BACKBUTTON);
    await this.verifyElementVisible(this.otherPartyAnyoneInjuredPageObjects.IDONTKNOWBUTTON);
  }

  async efNavigatetoOtherPartyPedestrian(selectedOption: string) {
    const option = selectedOption.toLowerCase();

    if (option === 'yes') {
      console.log('Select Yes to Other party anyone injured');
      await this.clickElement(this.otherPartyAnyoneInjuredPageObjects.YESRADIOBUTTON);
    } else if (option === 'no') {
      console.log('Select No to Other party anyone injured');
      await this.clickElement(this.otherPartyAnyoneInjuredPageObjects.NORADIOBUTTON);
    } else if (option === 'idontknow') {
      console.log("Select I don't know to Other party anyone injured");
      await this.clickElement(this.otherPartyAnyoneInjuredPageObjects.IDONTKNOWBUTTON);
    } else {
      throw new Error(`Invalid option: ${selectedOption}. Expected 'yes', 'no', or 'idontknow'`);
    }

    await this.clickElement_WaitforNavigation(
      this.otherPartyAnyoneInjuredPageObjects.NEXTBUTTON,
      URL_ENDPOINTS.PEDESTRIAN_OR_CYCLIST_INVOLVED
    );
  }
}
