import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { NumberOfVehiclesInvolvedPageObjects } from '../objectRepository/NumberOfVehiclesInvolvedPageObjects';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';

export class NumberOfVehiclesInvolvedPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  numberOfVehiclesInvolvedPageObjects = new NumberOfVehiclesInvolvedPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateNumberOfVehiclesInvolvedPageDisplay() {
    await this.verifyElementContainsText(
      this.numberOfVehiclesInvolvedPageObjects.TITLETEXT,
      EXPECTED_TEXTS.NUM_VEHICLES_TITLE
    );
    await this.verifyElementVisible(this.numberOfVehiclesInvolvedPageObjects.BACKBUTTON);
  }

  async efNavigatetoAnyoneInjured(selectedOption: string) {
    switch (selectedOption) {
      case 'No Other Vehicle Involved':
        console.log('Selecting No Other Vehicle Involved option');
        await this.clickElement(this.numberOfVehiclesInvolvedPageObjects.NOVEHICLERADIOBUTTON);
        await this.clickElement_WaitforNavigation(
          this.numberOfVehiclesInvolvedPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.ADDITIONAL_DETAILS_TRANSITION
        );
        break;

      case '1 Vehicle':
        console.log('Selecting 1 vehicle option');
        await this.clickElement(this.numberOfVehiclesInvolvedPageObjects.ONEVEHICLERADIOBUTTON);
        await this.clickElement_WaitforNavigation(
          this.numberOfVehiclesInvolvedPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.OTHER_PARTY_INFO_TRANSITION
        );
        break;

      case '2 Vehicle':
        console.log('Selecting 2 vehicle option');
        await this.clickElement(this.numberOfVehiclesInvolvedPageObjects.TWOVEHICLERADIOBUTTON);
        await this.verifyElementVisible(this.numberOfVehiclesInvolvedPageObjects.TWOPOPUP);
        await this.verifyElementContainsText(
          this.numberOfVehiclesInvolvedPageObjects.TWOPOPUP,
          EXPECTED_TEXTS.NUM_VEHICLES_TWO_VEHICLE_POPUP
        );
        await this.clickElement_WaitforNavigation(
          this.numberOfVehiclesInvolvedPageObjects.OKBUTTON,
          URL_ENDPOINTS.OTHER_PARTY_INFO_TRANSITION
        );
        break;
    }
  }
}
