import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { AdditionalDetailsPageObjects } from '../objectRepository/AdditionalDetailsPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class AdditionalDetailsPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    additionalDetailsPageObjects = new AdditionalDetailsPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateAdditionalDetailsPageDisplay() {

      await this.verifyElementContainsText(this.additionalDetailsPageObjects.TITLETEXT, insuranceproperties.ADDITIONALDETAILSPAGETITLE);
      await this.verifyElementContainsText(this.additionalDetailsPageObjects.SUBTITLETEXT, insuranceproperties.ADDITIONALDETAILSPAGESUBTITLE);
      await this.verifyElementVisible(this.additionalDetailsPageObjects.BACKBUTTON);
      await this.verifyElementVisible(this.additionalDetailsPageObjects.NEXTBUTTON);
      await this.clickElement_WaitforNavigation(this.additionalDetailsPageObjects.NEXTBUTTON, URL_ENDPOINT.PEDESTRIAN_CYCLIST_INVOLVED);
  
  }
}