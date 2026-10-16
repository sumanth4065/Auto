import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyPedestrianPageObjects } from '../objectRepository/OtherPartyPedestrianPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class OtherPartyPedestrianPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    otherPartyPedestrianPageObjects = new OtherPartyPedestrianPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateOtherPartyPedestrianPageDisplay() {

      await this.verifyElementContainsText(this.otherPartyPedestrianPageObjects.TITLETEXT, insuranceproperties.OTHERPARTYPEDESTRIANPAGETITLE);
      await this.verifyElementVisible(this.otherPartyPedestrianPageObjects.BACKBUTTON);
  
  }

  async efNavigatetoOtherPartyWitnessPage() {
    // selecting noneof above option
    await this.clickElement_WaitforNavigation(this.otherPartyPedestrianPageObjects.NONEOFTHEABOVEBUTTON, URL_ENDPOINT.WITNESS_INFO)

    }

    async efSelectAndNavigatetoOtherPartyWitnessPage(poption: string) {
    switch (poption) {
      case "Pedestrian":
        console.log("Select Pedestrian");
        await this.clickElement(this.otherPartyPedestrianPageObjects.PEDESTRIANRADIOBUTTON);
        await this.clickElement_WaitforNavigation(this.otherPartyPedestrianPageObjects.NEXTBUTTON, URL_ENDPOINT.WITNESS_INFO)
        break;

      case "Cyclist":
        console.log("Select Cyclist");
        await this.clickElement(this.otherPartyPedestrianPageObjects.CYCLISTRADIOBUTTON);
        await this.clickElement_WaitforNavigation(this.otherPartyPedestrianPageObjects.NEXTBUTTON, URL_ENDPOINT.WITNESS_INFO)
        break;
      }
}
}

