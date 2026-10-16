import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { WhoWasDrivingPageObjects } from '../objectRepository/WhoWasDrivingPageObjects';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { URL_ENDPOINTS, FULL_URL_PATTERNS } from '../../testdata/urlEndpoints';

export class WhoWasDrivingPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  whoWasDrivingPageObjects = new WhoWasDrivingPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateWhoWasDrivingPageDisplay() {
    await this.verifyElementContainsText(
      this.whoWasDrivingPageObjects.TITLETEXT,
      EXPECTED_TEXTS.WHO_WAS_DRIVING_TITLE
    );
    await this.verifyElementVisible(this.whoWasDrivingPageObjects.BACKBUTTON);
    await this.verifyElementVisible(this.whoWasDrivingPageObjects.SUBTITLETEXT);
    //await this.verifyElementVisible(this.vehicleInvolvedPageObjects.NEXTBUTTON);
  }

  async efNavigatetoNumberOfVehiclesInvolved(selectedOption) {
    await this.clickElement(this.whoWasDrivingPageObjects.DRIVERDROPDOWN);
    switch (selectedOption) {
      case 'Option1':
        await this.clickElement(this.whoWasDrivingPageObjects.SELECTFIRSTOPTION);
        await this.clickElement_WaitforNavigation(
          this.whoWasDrivingPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.PASSENGERS
        );
        break;
      case 'NotlistedOption':
        await this.clickElement(this.whoWasDrivingPageObjects.SELECTDRIVERNOTLISTED);
        await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_DRIVER);
    }
  }

  async efNavigatetoDrivenOrParked(selectedOption, passengers) {
    await this.clickElement(this.whoWasDrivingPageObjects.NOOFPASSENGERSDROPDOWN);

    switch (selectedOption) {
      case 'Option1':
        console.log('Selecting Number of passengers from List');

        switch (passengers) {
          case 'No passengers':
            await this.clickElement(this.whoWasDrivingPageObjects.NOPASSENGERS);
            break;

          case '1 passenger':
            await this.clickElement(this.whoWasDrivingPageObjects.ONEPASSENGER);
            break;

          case '2 passengers':
            await this.clickElement(this.whoWasDrivingPageObjects.TWOPASSENGERS);
            break;

          case '3 passengers':
            await this.clickElement(this.whoWasDrivingPageObjects.THREEPASSENGERS);
            break;

          case '4 passengers':
            await this.clickElement(this.whoWasDrivingPageObjects.FOURPASSENGERS);
            break;

          case '5 or more passengers':
            await this.clickElement(this.whoWasDrivingPageObjects.FIVEORMOREPASSENGERS);
            break;

          default:
            throw new Error(`Invalid passenger value: ${passengers}`);
        }

        // Click Next and navigate to injured page
        await this.clickElement_WaitforNavigation(
          this.whoWasDrivingPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.INJURED
        );
        break;
    }
  }
}
