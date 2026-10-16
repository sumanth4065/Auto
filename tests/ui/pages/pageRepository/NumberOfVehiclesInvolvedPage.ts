import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { NumberOfVehiclesInvolvedPageObjects } from '../objectRepository/NumberOfVehiclesInvolvedPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class NumberOfVehiclesInvolvedPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    numberOfVehiclesInvolvedPageObjects = new NumberOfVehiclesInvolvedPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateNumberOfVehiclesInvolvedPageDisplay() {

      await this.verifyElementContainsText(this.numberOfVehiclesInvolvedPageObjects.TITLETEXT, insuranceproperties.NUMBEROFVEHICLESINVOLVEDPAGETITLE);
      await this.verifyElementVisible(this.numberOfVehiclesInvolvedPageObjects.BACKBUTTON);   
  
  }

async efNavigatetoAnyoneInjured(selectedOption: string) {

    
    switch (selectedOption) {
        case "No Other Vehicle Involved":
          console.log("Seleting No Other Vehicle Involved option");
            await this.clickElement(this.numberOfVehiclesInvolvedPageObjects.NOVEHICLERADIOBUTTON);
            await this.clickElement_WaitforNavigation(this.numberOfVehiclesInvolvedPageObjects.NEXTBUTTON, URL_ENDPOINT.ADDITIONAL_DETAILS_TRANSITION);
            break;
        case "1 Vehicle":
            console.log("Seleting 1 vehicle option");
            await this.clickElement(this.numberOfVehiclesInvolvedPageObjects.ONEVEHICLERADIOBUTTON);
            await this.clickElement_WaitforNavigation(this.numberOfVehiclesInvolvedPageObjects.NEXTBUTTON, URL_ENDPOINT.OTHER_PARTY_INFORMATION_TRANSITION);
            break;
        case "2 Vehicle":
        case "2 Vehicles":
           console.log("Seleting 2 vehicles option");
            await this.clickElement(this.numberOfVehiclesInvolvedPageObjects.TWOVEHICLERADIOBUTTON);
            await this.verifyElementVisible(this.numberOfVehiclesInvolvedPageObjects.TWOPOPUP);
            await this.verifyElementContainsText(this.numberOfVehiclesInvolvedPageObjects.TWOPOPUP, insuranceproperties.NUMBEROFVEHICLESINVOLVEDTWOPOPUP);
            await this.clickElement_WaitforNavigation(this.numberOfVehiclesInvolvedPageObjects.OKBUTTON, URL_ENDPOINT.ADDITIONAL_DETAILS_TRANSITION);
            break;
        default:
            console.error(`Unknown vehicle count option: ${selectedOption}`);
            throw new Error(`Unknown vehicle count option: ${selectedOption}`);
    }
}

}