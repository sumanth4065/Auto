import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { DrivenOrParkedPageObjects } from '../objectRepository/DrivenOrParkedPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class DrivenOrParkedPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    drivenOrParkedPageObjects = new DrivenOrParkedPageObjects();
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);
  }
  
    async efValidateDrivenOrParkedPageDisplay() {

      await this.verifyElementContainsText(this.drivenOrParkedPageObjects.TITLETEXT, insuranceproperties.DRIVENORPARKEDPAGETITLE);
      await this.verifyElementVisible(this.drivenOrParkedPageObjects.BACKBUTTON);
      await this.verifyElementVisible(this.drivenOrParkedPageObjects.SUBTEXT);
  }

async efNavigatetoDrivenOrParked(selectedOption: string) {

    
    switch (selectedOption) {
        case "Driven":
            console.log("Selected Driven Option");
            await this.clickElement(this.drivenOrParkedPageObjects.DRIVENRADIOBUTTON);
            await this.clickElement_WaitforNavigation(this.drivenOrParkedPageObjects.NEXTBUTTON, URL_ENDPOINT.DRIVEN_WHAT_HAPPENED);
            break;
        case "Parked":
           console.log("Selected Parked Option");
            await this.clickElement(this.drivenOrParkedPageObjects.PARKEDRADIOBUTTON);
            await this.clickElement_WaitforNavigation(this.drivenOrParkedPageObjects.NEXTBUTTON, URL_ENDPOINT.PARKED_WHAT_HAPPENED);

    }
}

}