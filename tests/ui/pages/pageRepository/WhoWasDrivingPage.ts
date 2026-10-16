import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { WhoWasDrivingPageObjects } from '../objectRepository/WhoWasDrivingPageObjects';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';
import insuranceproperties from '../../testdata/insuranceproperties';

export class WhoWasDrivingPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  whoWasDrivingPageObjects = new WhoWasDrivingPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);
  }

  async efValidateWhoWasDrivingPageDisplay() {
    await this.verifyElementVisible(this.whoWasDrivingPageObjects.TITLETEXT);
    await this.verifyElementContainsText(this.whoWasDrivingPageObjects.TITLETEXT, insuranceproperties.WHOWASDRIVINGPAGETITLE);
    await this.verifyElementVisible(this.whoWasDrivingPageObjects.BACKBUTTON);
    await this.verifyElementVisible(this.whoWasDrivingPageObjects.SUBTITLETEXT);
  }

  async efNavigatetoNumberOfVehiclesInvolved(selectedOption: string) {

    await this.clickElement(this.whoWasDrivingPageObjects.DRIVERDROPDOWN);
    switch (selectedOption) {
      case "Option1":
        await this.clickElement(this.whoWasDrivingPageObjects.SELECTFIRSTOPTION);
        await this.clickElement(this.whoWasDrivingPageObjects.NEXTBUTTON);
        await this.page.waitForLoadState('networkidle');
        break;
      case "Driver not listed":
        await this.clickElement(this.whoWasDrivingPageObjects.SELECTDRIVERNOTLISTED);
        await this.page.waitForURL(URL_ENDPOINT.CUSTOM_DRIVER);

    }
  }

}