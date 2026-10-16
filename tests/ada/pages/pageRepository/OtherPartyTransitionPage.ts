import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyTransitionPageObjects } from '../objectRepository/OtherPartyTransitionPageObjects';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import URL_ENDPOINTS from '../../testdata/urlEndpoints';

export class OtherPartyTransitionPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  otherPartyTransitionPageObjects = new OtherPartyTransitionPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateOtherPartyTransitionPageDisplay() {
    await this.verifyElementContainsText(
      this.otherPartyTransitionPageObjects.TITLETEXT,
      EXPECTED_TEXTS.OTHER_PARTY_TITLE
    );
    await this.verifyElementContainsText(
      this.otherPartyTransitionPageObjects.SUBTITLETEXT,
      EXPECTED_TEXTS.OTHER_PARTY_SUBTITLE
    );
    await this.verifyElementVisible(this.otherPartyTransitionPageObjects.BACKBUTTON);
  }

  async efNavigatetoOtherPartyYMMPage(selectedOption: string) {
    if (selectedOption === 'No Other Vehicle') {
      await this.clickElement_WaitforNavigation(
        this.otherPartyTransitionPageObjects.NEXTBUTTON,
        URL_ENDPOINTS.PEDESTRIAN_OR_CYCLIST_INVOLVED
      );
    } else {
      await this.clickElement_WaitforNavigation(
        this.otherPartyTransitionPageObjects.NEXTBUTTON,
        URL_ENDPOINTS.YEAR_MAKE_MODEL
      );
    }
  }
}
