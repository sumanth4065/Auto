import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { VehicleInvolvedPageObjects } from '../objectRepository/VehicleInvolvedPageObjects';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';
import insuranceproperties from '../../testdata/insuranceproperties';

export class VehicleInvolvedPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    vehicleInvolvedPageObjects = new VehicleInvolvedPageObjects();
    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateVehicleInvolvedPageDisplay() {

      await this.verifyElementContainsText(this.vehicleInvolvedPageObjects.TITLETEXT, insuranceproperties.VEHICLEINVOLVEDPAGETITLE);
      await this.verifyElementVisible(this.vehicleInvolvedPageObjects.BACKBUTTON);
      await this.verifyElementVisible(this.vehicleInvolvedPageObjects.SUBTEXT);
  }

async efNavigatetoDrivenOrParked(selectedOption:string) {

    await this.clickElement(this.vehicleInvolvedPageObjects.VEHICLEROPDOWN);
    switch (selectedOption) {
        case "Option1":
            console.log("Selecting Vehicle1 from List");
            await this.clickElement(this.vehicleInvolvedPageObjects.SELECTFIRSTOPTION);
            await this.clickElement_WaitforNavigation(this.vehicleInvolvedPageObjects.NEXTBUTTON, URL_ENDPOINT.CAR_KINETIC_STATUS);
            break;
        case "Vehicle not listed":
           console.log("Selecting Vehicle Not Listed Option");
            await this.clickElement(this.vehicleInvolvedPageObjects.SELECTVEHICLENOTLISTED);
            await this.page.waitForURL(URL_ENDPOINT.CUSTOM_VEHICLE);
          

    }
}

}