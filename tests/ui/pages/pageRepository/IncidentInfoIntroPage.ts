import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { IncidentInfoIntroPageObjects } from '../objectRepository/IncidentInfoIntroPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class IncidentInfoIntroPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    incidentInfoIntroPageObjects = new IncidentInfoIntroPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateIncidentInfoIntroPageDisplay() {

      await this.verifyElementContainsText(this.incidentInfoIntroPageObjects.TITLETEXT, insuranceproperties.INCIDENTINFOINTROPAGETITLE);
      await this.verifyElementVisible(this.incidentInfoIntroPageObjects.BACKBUTTON);
      await this.verifyElementContainsText(this.incidentInfoIntroPageObjects.SUBTEXT, insuranceproperties.INCIDENTINFOINTROPAGESUBTEXT);
      await this.verifyElementVisible(this.incidentInfoIntroPageObjects.NEXTBUTTON);
      
  
  }

  async efNavigatetoWhereWhenAccidentPage() {

    await this.clickElement_WaitforNavigation(this.incidentInfoIntroPageObjects.NEXTBUTTON, URL_ENDPOINT.WHERE_WHEN_ACCIDENT);

}

}