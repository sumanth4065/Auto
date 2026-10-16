import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { VehicleInvolvedPageObjects } from '../objectRepository/VehicleInvolvedPageObjects';
import { URL_ENDPOINTS, FULL_URL_PATTERNS } from '../../testdata/urlEndpoints';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';

export class VehicleInvolvedPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  vehicleInvolvedPageObjects = new VehicleInvolvedPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateVehicleInvolvedPageDisplay() {
    await this.verifyElementContainsText(
      this.vehicleInvolvedPageObjects.TITLETEXT,
      EXPECTED_TEXTS.VEHICLE_INVOLVED_TITLE
    );
    await this.verifyElementVisible(this.vehicleInvolvedPageObjects.BACKBUTTON);
    await this.verifyElementVisible(this.vehicleInvolvedPageObjects.SUBTEXT);
    //await this.verifyElementVisible(this.vehicleInvolvedPageObjects.NEXTBUTTON);
  }

  async efNavigatetoDrivenOrParked(selectedOption: string) {
    await this.clickElement(this.vehicleInvolvedPageObjects.VEHICLEROPDOWN);

    switch (selectedOption) {
      case 'Option1':
        console.log('Selecting Vehicle1 from List');
        await this.clickElement(this.vehicleInvolvedPageObjects.SELECTFIRSTOPTION);
        await this.clickElement_WaitforNavigation(
          this.vehicleInvolvedPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.CAR_KINETIC_STATUS
        );
        break;

      case 'NotlistedOption':
        console.log('Selecting Vehicle Not Listed Option');
        await this.clickElement(this.vehicleInvolvedPageObjects.SELECTVEHICLENOTSELECTED);
        await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_KNOCKOUT);
        break;
    }
  }
}
