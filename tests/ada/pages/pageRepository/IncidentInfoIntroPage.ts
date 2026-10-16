import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { IncidentInfoIntroPageObjects } from '../objectRepository/IncidentInfoIntroPageObjects';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';

export class IncidentInfoIntroPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  incidentInfoIntroPageObjects = new IncidentInfoIntroPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateIncidentInfoIntroPageDisplay() {
    await this.verifyElementContainsText(
      this.incidentInfoIntroPageObjects.TITLETEXT,
      EXPECTED_TEXTS.INCIDENT_INFO_TITLE
    );
    await this.verifyElementVisible(this.incidentInfoIntroPageObjects.BACKBUTTON);
    await this.verifyElementContainsText(
      this.incidentInfoIntroPageObjects.SUBTEXT,
      EXPECTED_TEXTS.INCIDENT_INFO_SUBTITLE
    );
    await this.verifyElementVisible(this.incidentInfoIntroPageObjects.NEXTBUTTON);
  }

  async efNavigatetoWhereWhenAccidentPage() {
    await this.clickElement_WaitforNavigation(
      this.incidentInfoIntroPageObjects.NEXTBUTTON,
      URL_ENDPOINTS.WHERE_WHEN_ACCIDENT
    );
  }
}
