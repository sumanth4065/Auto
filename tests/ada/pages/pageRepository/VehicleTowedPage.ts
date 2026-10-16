import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { VehicleTowedPageObjects } from '../objectRepository/VehicleTowedPageObjects';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';

export class VehicleTowedPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  vehicleTowedPageObjects = new VehicleTowedPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateVehicelTowedPageDisplay() {
    await this.verifyElementContainsText(
      this.vehicleTowedPageObjects.TITLETEXT,
      EXPECTED_TEXTS.VEHICLE_TOWED_TITLE
    );
    await this.verifyElementVisible(this.vehicleTowedPageObjects.BACKBUTTON);
    await this.verifyElementVisible(this.vehicleTowedPageObjects.IDONTKNOWBUTTON);
  }

  async efNavigatetoVehicleDamage(selectedOption: string) {
    const option = selectedOption.toLowerCase();

    if (option === 'yes') {
      console.log('Select Yes for Vehicle Towed');
      await this.clickElement(this.vehicleTowedPageObjects.YESRADIOBUTTON);
    } else if (option === 'no') {
      console.log('Select No for Vehicle Towed');
      await this.clickElement(this.vehicleTowedPageObjects.NORADIOBUTTON);
    } else {
      throw new Error(`Invalid option: ${selectedOption}. Expected 'yes' or 'no'`);
    }

    await this.clickElement_WaitforNavigation(
      this.vehicleTowedPageObjects.NEXTBUTTON,
      URL_ENDPOINTS.VEHICLE_DAMAGE
    );
  }
}
