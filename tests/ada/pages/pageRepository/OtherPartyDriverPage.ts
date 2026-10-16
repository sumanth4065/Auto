import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyDriverPageObjects } from '../objectRepository/OtherPartyDriverPageObjects';
import testdata from '../../testdata/alltestdata';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';

export class OtherPartyDriverPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  otherPartyDriverPageObjects = new OtherPartyDriverPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateOtherPartyDriverPageDisplay() {
    await this.verifyElementContainsText(
      this.otherPartyDriverPageObjects.TITLETEXT,
      EXPECTED_TEXTS.OTHER_PARTY_DRIVER_TITLE
    );
    await this.verifyElementVisible(this.otherPartyDriverPageObjects.BACKBUTTON);
  }

  async efNavigatetoOtherPartyAnyoneInjuredPage() {
    await this.enterText(this.otherPartyDriverPageObjects.FIRSTNAME, testdata.DESCRIPTIONINPUT);
    await this.enterText(this.otherPartyDriverPageObjects.LASTNAME, testdata.DESCRIPTIONINPUT);
    //await this.enterText(this.otherPartyDriverPageObjects.MOBILENUMBER, insurancetestdata.MOBILENUMBERINPUT);
    await this.clickElement_WaitforNavigation(
      this.otherPartyDriverPageObjects.NEXTBUTTON,
      URL_ENDPOINTS.OTHER_PARTY_INJURED_CHECK
    );
  }
}
