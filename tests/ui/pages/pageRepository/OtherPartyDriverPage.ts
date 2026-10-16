import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyDriverPageObjects } from '../objectRepository/OtherPartyDriverPageObjects';
import testdata from '../../testdata/alltestdata';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class OtherPartyDriverPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    otherPartyDriverPageObjects = new OtherPartyDriverPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateOtherPartyDriverPageDisplay() {

      await this.verifyElementContainsText(this.otherPartyDriverPageObjects.TITLETEXT, insuranceproperties.OTHERPARTYDRIVERPAGETITLE);
      await this.verifyElementVisible(this.otherPartyDriverPageObjects.BACKBUTTON);     
     
  
  }

  async efNavigatetoOtherPartyAnyoneInjuredPage() {

    await this.enterText(this.otherPartyDriverPageObjects.FIRSTNAME, testdata.DESCRIPTIONINPUT);
    await this.enterText(this.otherPartyDriverPageObjects.LASTNAME, testdata.DESCRIPTIONINPUT);
    await this.clickElement_WaitforNavigation(this.otherPartyDriverPageObjects.NEXTBUTTON, URL_ENDPOINT.OTHER_PARTY_PASSENGERS);

}

}