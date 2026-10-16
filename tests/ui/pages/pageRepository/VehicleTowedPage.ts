import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { VehicleTowedPageObjects } from '../objectRepository/VehicleTowedPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class VehicleTowedPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    vehicleTowedPageObjects = new VehicleTowedPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateVehicelTowedPageDisplay() {

      await this.verifyElementContainsText(this.vehicleTowedPageObjects.TITLETEXT, insuranceproperties.VEHICLETOWEDPAGETITLE);
      await this.verifyElementVisible(this.vehicleTowedPageObjects.BACKBUTTON);
      await this.verifyElementVisible(this.vehicleTowedPageObjects.IDONTKNOWBUTTON);      
  
  }

async efNavigatetoVehicleDamage(selectedOption: string) {

    
    switch (selectedOption) {
        case "Yes":
          console.log("Select Yes for Vehicle Towed");
            await this.clickElement(this.vehicleTowedPageObjects.YESRADIOBUTTON);
            await this.clickElement_WaitforNavigation(this.vehicleTowedPageObjects.NEXTBUTTON, URL_ENDPOINT.VEHICLE_DAMAGE);
            break;
        case "No":
          console.log("Select No for Vehicle Towed");
            await this.clickElement(this.vehicleTowedPageObjects.NORADIOBUTTON);
            await this.clickElement_WaitforNavigation(this.vehicleTowedPageObjects.NEXTBUTTON, URL_ENDPOINT.VEHICLE_DAMAGE);

    }
}

}