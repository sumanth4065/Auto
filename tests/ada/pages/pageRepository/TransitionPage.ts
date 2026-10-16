import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { TransitionPageObjects } from '../objectRepository/TransitionPageObjects';
import { FULL_URL_PATTERNS } from '../../testdata/urlEndpoints';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';

export class TransitionPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  transitionPageObjects = new TransitionPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateIncidentInfoIntroPageDisplay() {
    await this.verifyElementContainsText(
      this.transitionPageObjects.TITLETEXT,
      EXPECTED_TEXTS.INCIDENT_INFO_TITLE
    );
    await this.verifyElementVisible(this.transitionPageObjects.BACKBUTTON);
    await this.verifyElementContainsText(
      this.transitionPageObjects.SUBTEXT,
      EXPECTED_TEXTS.INCIDENT_INFO_SUBTITLE
    );
    await this.verifyElementVisible(this.transitionPageObjects.NEXTBUTTON);
  }

  async efNavigatetoWhereWhenAccidentPage() {
    await this.clickElement(this.transitionPageObjects.NEXTBUTTON);
    await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_WHEN_ACCIDENT);
    //await this.clickElement_WaitforNavigation(this.transitionPageObjects.NEXTBUTTON,"");
  }
}
