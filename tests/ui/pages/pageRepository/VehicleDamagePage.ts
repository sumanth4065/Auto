import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { VehicleDamagePageObjects } from '../objectRepository/VehicleDamagePageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class VehicleDamagePage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    vehicleDamagePageObjects = new VehicleDamagePageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateVehicleDamagePageDisplay() {
      await this.verifyElementContainsText(this.vehicleDamagePageObjects.TITLETEXT, insuranceproperties.VEHICLEDAMAGEPAGETITLE);
      await this.verifyElementVisible(this.vehicleDamagePageObjects.SUBTEXT);
      await this.verifyElementVisible(this.vehicleDamagePageObjects.BACKBUTTON);
   
  
  }

  async efNavigatetoOtherPartyTransitionPage() {

    await this.enterText(this.vehicleDamagePageObjects.TEXTAREA, "All Other Damage");
    await this.clickElement_WaitforNavigation(this.vehicleDamagePageObjects.NEXTBUTTON, URL_ENDPOINT.VEHICLES_INVOLVED_NUMBER);

}

}