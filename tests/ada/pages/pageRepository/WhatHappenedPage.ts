import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { WhatHappenedPageObjects } from '../objectRepository/WhatHappenedPageObjects';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import alltestdata from '../../testdata/alltestdata';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';

export class WhatHappenedPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  whatHappenedPageObjects = new WhatHappenedPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateWhatHappenedPageDisplay() {
    await this.verifyElementContainsText(
      this.whatHappenedPageObjects.TITLETEXT,
      EXPECTED_TEXTS.WHAT_HAPPENED_TITLE
    );
    await this.verifyElementVisible(this.whatHappenedPageObjects.SUBTEXT);
    await this.verifyElementVisible(this.whatHappenedPageObjects.BACKBUTTON);
  }

  async efNavigatetoVehicleTowedPage() {
    await this.enterText(this.whatHappenedPageObjects.TEXTAREA, alltestdata.incidentDescription);
    await this.clickElement_WaitforNavigation(
      this.whatHappenedPageObjects.NEXTBUTTON,
      URL_ENDPOINTS.TOWED
    );
  }
}
