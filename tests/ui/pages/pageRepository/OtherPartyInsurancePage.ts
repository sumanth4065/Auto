import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyInsurancePageObjects } from '../objectRepository/OtherPartyInsurancePageObjects';
import testdata from '../../testdata/alltestdata';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class OtherPartyInsurancePage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    otherPartyInsurancePageObjects = new OtherPartyInsurancePageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateOtherPartyInsurancePageDisplay() {

      await this.verifyElementContainsText(this.otherPartyInsurancePageObjects.TITLETEXT, insuranceproperties.OTHERPARTYINSURANCEPAGETITLE);
      await this.verifyElementContainsText(this.otherPartyInsurancePageObjects.INSCOMPANYTEXT, insuranceproperties.OTHERPARTYINSURANCECOMPANYTEXT);
      await this.verifyElementContainsText(this.otherPartyInsurancePageObjects.POLICYNUMBERTEXT, insuranceproperties.OTHERPARTYINSURANCEPOLICYNUMBERTEXT);
      await this.verifyElementVisible(this.otherPartyInsurancePageObjects.BACKBUTTON);
  
  }

  async efNavigatetoOtherPartyDriverPage() {
    await this.enterText(this.otherPartyInsurancePageObjects.INSCOMPANYFIELD, testdata.insurancecompanyinput);

    
    await this.clickElement_WaitforNavigation(this.otherPartyInsurancePageObjects.NEXTBUTTON, URL_ENDPOINT.OTHER_PARTY_VEHICLE_DRIVER_INFO)

    }
}

