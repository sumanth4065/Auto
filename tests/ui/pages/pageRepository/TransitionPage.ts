import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { TransitionPageObjects } from '../objectRepository/TransitionPageObjects';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';
import insuranceproperties from '../../testdata/insuranceproperties';

export class TransitionPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    transitionPageObjects = new TransitionPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateIncidentInfoIntroPageDisplay() {

      await this.verifyElementContainsText(this.transitionPageObjects.TITLETEXT, insuranceproperties.TRANSITIONPAGETITLE);
      await this.verifyElementVisible(this.transitionPageObjects.BACKBUTTON);
      await this.verifyElementContainsText(this.transitionPageObjects.SUBTEXT, insuranceproperties.TRANSITIONPAGESUBTEXT);
      await this.verifyElementVisible(this.transitionPageObjects.NEXTBUTTON);
      
  
  }

  async efNavigatetoWhereWhenAccidentPage() {
    await this.clickElement(this.transitionPageObjects.NEXTBUTTON);
    await this.page.waitForURL(URL_ENDPOINT.WHERE_WHEN_ACCIDENT);

}

}