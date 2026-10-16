import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { WhatHappenedPageObjects } from '../objectRepository/WhatHappenedPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class WhatHappenedPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    whatHappenedPageObjects = new WhatHappenedPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateWhatHappenedPageDisplay() {

      await this.verifyElementContainsText(this.whatHappenedPageObjects.TITLETEXT, insuranceproperties.WHATHAPPENEDPAGETITLE);
      await this.verifyElementVisible(this.whatHappenedPageObjects.SUBTEXT);
      await this.verifyElementVisible(this.whatHappenedPageObjects.BACKBUTTON);
   
  
  }

  async efNavigatetoVehicleTowedPage() {

    await this.enterText(this.whatHappenedPageObjects.TEXTAREA, "TEST AUTOMATION");
    await this.clickElement_WaitforNavigation(this.whatHappenedPageObjects.NEXTBUTTON, URL_ENDPOINT.TOWED);

}

}