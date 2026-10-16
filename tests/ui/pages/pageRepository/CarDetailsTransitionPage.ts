import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { CarDetailsTransitionPageObjects } from '../objectRepository/CarDetailsTransitionPageObjects';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';
import insuranceproperties from '../../testdata/insuranceproperties';
export class CarDetailsTransitionPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    carDetailsTransitionPageObjects = new CarDetailsTransitionPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateCarDetailsTransitionPageDisplay() {

      await this.verifyElementContainsText(this.carDetailsTransitionPageObjects.TITLETEXT, insuranceproperties.CARDETAILSTRANSITIONPAGETITLE);
      await this.verifyElementContainsText(this.carDetailsTransitionPageObjects.SUBTITLETEXT, insuranceproperties.CARDETAILSTRANSITIONPAGESUBTITLE);
      await this.verifyElementVisible(this.carDetailsTransitionPageObjects.BACKBUTTON);
  
  }

  async efNavigatetoVehicleInvolvedPage() {
    await this.clickElement(this.carDetailsTransitionPageObjects.NEXTBUTTON);
    await this.page.waitForURL(URL_ENDPOINT.CAR_INVOLVED);

    }
}

