import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyTransitionPageObjects } from '../objectRepository/OtherPartyTransitionPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class OtherPartyTransitionPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    otherPartyTransitionPageObjects = new OtherPartyTransitionPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateOtherPartyTransitionPageDisplay() {

      await this.verifyElementContainsText(this.otherPartyTransitionPageObjects.TITLETEXT, insuranceproperties.OTHERPARTYTRANSITIONPAGETITLE);
      await this.verifyElementContainsText(this.otherPartyTransitionPageObjects.SUBTITLETEXT, insuranceproperties.OTHERPARTYTRANSITIONPAGESUBTITLE);
      await this.verifyElementVisible(this.otherPartyTransitionPageObjects.BACKBUTTON);
  
  }

  async efNavigatetoOtherPartyYMMPage(selectedOption: string) {
    switch (selectedOption) {
      case "No Other Vehicle":
        await this.clickElement_WaitforNavigation(this.otherPartyTransitionPageObjects.NEXTBUTTON, URL_ENDPOINT.PEDESTRIAN_CYCLIST_INVOLVED)
          break;
      case "1 Vehicle":
        await this.clickElement_WaitforNavigation(this.otherPartyTransitionPageObjects.NEXTBUTTON, URL_ENDPOINT.YEAR_MAKE_MODEL)
          break;
      case "2 Vehicles":
         console.log("Seleting 2 vehicles option");
         await this.clickElement_WaitforNavigation(this.otherPartyTransitionPageObjects.NEXTBUTTON, URL_ENDPOINT.PEDESTRIAN_CYCLIST_INVOLVED)
          break;
      default:
        console.error(`Unknown vehicle count option: ${selectedOption}`);
        throw new Error(`Unknown vehicle count option: ${selectedOption}`);
    }
}
}
