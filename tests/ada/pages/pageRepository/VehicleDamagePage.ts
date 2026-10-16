import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { VehicleDamagePageObjects } from '../objectRepository/VehicleDamagePageObjects';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';

export class VehicleDamagePage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  vehicleDamagePageObjects = new VehicleDamagePageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateVehicleDamagePageDisplay() {
    await this.verifyElementContainsText(
      this.vehicleDamagePageObjects.TITLETEXT,
      EXPECTED_TEXTS.VEHICLE_DAMAGE_TITLE
    );
    await this.verifyElementVisible(this.vehicleDamagePageObjects.SUBTEXT);
    await this.verifyElementVisible(this.vehicleDamagePageObjects.BACKBUTTON);
  }

  async efNavigatetoOtherPartyTransitionPage() {
    await this.enterText(
      this.vehicleDamagePageObjects.TEXTAREA,
      EXPECTED_TEXTS.VEHICLE_DAMAGE_DESCRIPTION
    );
    await this.clickElement_WaitforNavigation(
      this.vehicleDamagePageObjects.NEXTBUTTON,
      URL_ENDPOINTS.VEHICLES_INVOLVED_NUMBER
    );
  }
}