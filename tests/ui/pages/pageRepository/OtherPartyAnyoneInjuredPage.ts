import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyAnyoneInjuredPageObjects } from '../objectRepository/OtherPartyAnyoneInjuredPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class OtherPartyAnyoneInjuredPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    otherPartyAnyoneInjuredPageObjects = new OtherPartyAnyoneInjuredPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateOtherPartyAnyoneInjuredPageDisplay() {

      await this.verifyElementContainsText(this.otherPartyAnyoneInjuredPageObjects.TITLETEXT, insuranceproperties.OTHERPARTYANYONEINJUREDPAGETITLE);
      await this.verifyElementVisible(this.otherPartyAnyoneInjuredPageObjects.BACKBUTTON);
      await this.verifyElementVisible(this.otherPartyAnyoneInjuredPageObjects.IDONTKNOWBUTTON);      
  
  }

async efNavigatetoOtherPartyPedestrian(selectedOption: string) {

    
    switch (selectedOption) {
        case "Yes":
            console.log("Select Yes to Other party anyone injured");
            await this.clickElement(this.otherPartyAnyoneInjuredPageObjects.YESRADIOBUTTON);
            await this.clickElement_WaitforNavigation(this.otherPartyAnyoneInjuredPageObjects.NEXTBUTTON, URL_ENDPOINT.ADDITIONAL_DETAILS_TRANSITION);
            break;
        case "No":
           console.log("Select No to Other party anyone injured");
            await this.clickElement(this.otherPartyAnyoneInjuredPageObjects.NORADIOBUTTON);
            await this.clickElement_WaitforNavigation(this.otherPartyAnyoneInjuredPageObjects.NEXTBUTTON, URL_ENDPOINT.ADDITIONAL_DETAILS_TRANSITION);
            break;
        case "IDontKnow":
          console.log("Select I dontKnow to Other party anyone injured");
          await this.clickElement(this.otherPartyAnyoneInjuredPageObjects.IDONTKNOWBUTTON);
          await this.clickElement_WaitforNavigation(this.otherPartyAnyoneInjuredPageObjects.NEXTBUTTON, URL_ENDPOINT.ADDITIONAL_DETAILS_TRANSITION);
          break;
    }
}

}