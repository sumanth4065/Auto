import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { AnyoneInjuredPageObjects } from '../objectRepository/AnyoneInjuredPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class AnyoneInjuredPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    anyoneInjuredPageObjects = new AnyoneInjuredPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateAnyoneInjuredPageDisplay() {

      await this.verifyElementContainsText(this.anyoneInjuredPageObjects.TITLETEXT, insuranceproperties.ANYONEINJUREDPAGETITLE);
      await this.verifyElementVisible(this.anyoneInjuredPageObjects.BACKBUTTON);
      await this.verifyElementVisible(this.anyoneInjuredPageObjects.IDONTKNOWBUTTON);      
  
  }

async efNavigatetoWhatHappened(selectedOption: string) {

    
    switch (selectedOption) {
        case "Yes":
            console.log("Select Yes for Anyone Injured");
            await this.clickElement(this.anyoneInjuredPageObjects.YESRADIOBUTTON);
            await this.clickElement_WaitforNavigation(this.anyoneInjuredPageObjects.NEXTBUTTON, URL_ENDPOINT.ADDITIONAL_DETAILS);
            break;
        case "No":
           console.log("Select No for Anyone Injured");
            await this.clickElement(this.anyoneInjuredPageObjects.NORADIOBUTTON);
            await this.clickElement_WaitforNavigation(this.anyoneInjuredPageObjects.NEXTBUTTON, URL_ENDPOINT.ADDITIONAL_DETAILS);

    }
}

}