import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyYMMPageObjects } from '../objectRepository/OtherPartyYMMPageObjects';
import testdata from '../../testdata/alltestdata';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class OtherPartyYMMPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    otherPartyYMMPageObjectsObjects = new OtherPartyYMMPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateOtherPartyYMMPageDisplay() {

      await this.verifyElementContainsText(this.otherPartyYMMPageObjectsObjects.TITLETEXT, insuranceproperties.OTHERPARTYYMMPAGETITLE);
      await this.verifyElementContainsText(this.otherPartyYMMPageObjectsObjects.YEARTEXT, insuranceproperties.OTHERPARTYYMMYEARTEXT);
      await this.verifyElementContainsText(this.otherPartyYMMPageObjectsObjects.MAKETEXT, insuranceproperties.OTHERPARTYYMMMAKETEXT);
      await this.verifyElementContainsText(this.otherPartyYMMPageObjectsObjects.MODELTEXT, insuranceproperties.OTHERPARTYYMMMODELTEXT);
      await this.verifyElementVisible(this.otherPartyYMMPageObjectsObjects.BACKBUTTON);
  
  }

  async efNavigatetoOtehrPartyInsurancePage() {

    await this.enterText(this.otherPartyYMMPageObjectsObjects.YEARFIELD, testdata.yearinput);
    await this.enterText(this.otherPartyYMMPageObjectsObjects.MAKEFIELD, testdata.makeinput);
    await this.enterText(this.otherPartyYMMPageObjectsObjects.MODELFIELD,  testdata.modelinput);
    await this.clickElement_WaitforNavigation(this.otherPartyYMMPageObjectsObjects.NEXTBUTTON, URL_ENDPOINT.OTHER_PARTY_INSURANCE_INFO);

    }
}

