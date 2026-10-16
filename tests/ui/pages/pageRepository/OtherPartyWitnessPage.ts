import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyWitnessPageObjects } from '../objectRepository/OtherPartyWitnessPageObjects';
import testdata from '../../testdata/alltestdata';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class OtherPartyWitnessPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    otherPartyWitnessPageObjects = new OtherPartyWitnessPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateOtherPartyWitnessPageDisplay() {

      await this.verifyElementContainsText(this.otherPartyWitnessPageObjects.TITLETEXT, insuranceproperties.OTHERPARTYWITNESSPAGETITLE);
      await this.verifyElementVisible(this.otherPartyWitnessPageObjects.BACKBUTTON);   
  }



async efNavigatetoReviewClaimPage(selectedOption: string) {

    
    switch (selectedOption) {
        case "Yes":
            await this.clickElement(this.otherPartyWitnessPageObjects.YESRADIOBUTTON);
            await this.enterText(this.otherPartyWitnessPageObjects.FIRSTNAME, testdata.DESCRIPTIONINPUT);
            await this.enterText(this.otherPartyWitnessPageObjects.LASTNAME, testdata.DESCRIPTIONINPUT);
            await this.clickElement_WaitforNavigation(this.otherPartyWitnessPageObjects.NEXTBUTTON, URL_ENDPOINT.ADDITIONAL_PROPERTY_DAMAGE);
            break;
        case "No":
            await this.clickElement(this.otherPartyWitnessPageObjects.NORADIOBUTTON);
            await this.clickElement_WaitforNavigation(this.otherPartyWitnessPageObjects.NEXTBUTTON, URL_ENDPOINT.ADDITIONAL_PROPERTY_DAMAGE);

    }
}

}