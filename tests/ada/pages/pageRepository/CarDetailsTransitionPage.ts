import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { CarDetailsTransitionPageObjects } from '../objectRepository/CarDetailsTransitionPageObjects';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { URL_ENDPOINTS, FULL_URL_PATTERNS } from '../../testdata/urlEndpoints';

export class CarDetailsTransitionPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  carDetailsTransitionPageObjects = new CarDetailsTransitionPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateCarDetailsTransitionPageDisplay() {
    await this.verifyElementContainsText(
      this.carDetailsTransitionPageObjects.TITLETEXT,
      EXPECTED_TEXTS.CAR_DETAILS_TITLE
    );
    await this.verifyElementContainsText(
      this.carDetailsTransitionPageObjects.SUBTITLETEXT,
      EXPECTED_TEXTS.CAR_DETAILS_SUBTITLE
    );
    await this.verifyElementVisible(this.carDetailsTransitionPageObjects.BACKBUTTON);
  }

  async efNavigatetoVehicleInvolvedPage() {
    await this.clickElement(this.carDetailsTransitionPageObjects.NEXTBUTTON);
    await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_CAR_INVOLVED);
  }
}