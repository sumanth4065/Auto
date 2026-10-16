import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { FilingClaimPageObjects } from '../objectRepository/FilingClaimPageObjects';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';
import insuranceproperties from '../../testdata/insuranceproperties';

export class FilingClaimPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    filingClaimPageObjects = new FilingClaimPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateFilingClaimPageDisplay() {

      await this.verifyElementContainsText(this.filingClaimPageObjects.TITLETEXT, insuranceproperties.FILINGCLAIMPAGETITLE);
      await this.verifyElementVisible(this.filingClaimPageObjects.BACKBUTTON);
      await this.verifyElementContainsText(this.filingClaimPageObjects.GLASSDAMAGETEXT, insuranceproperties.GLASSDAMAGETEXT);
      await this.verifyElementContainsText(this.filingClaimPageObjects.ALLOTHERDAMAGETEXT, insuranceproperties.ALLOTHERDAMAGETEXT);
      await this.verifyElementContainsText(this.filingClaimPageObjects.GLASSDAMAGEDESC, insuranceproperties.GLASSDAMAGEDESC);  
      await this.verifyElementContainsText(this.filingClaimPageObjects.ALLOTHERDAMAGEDESC, insuranceproperties.ALLOTHERDAMAGEDESC); 

  
  }

  async efNavigatetoTransitionPage(damageoption: string) {

    switch (damageoption) {
        case "Glass only damage":
            console.log("Selecting Glass Damage Option");
            await this.clickElement(this.filingClaimPageObjects.GLASSONLYDMGBTN);
            await this.verifyElementVisible(this.filingClaimPageObjects.NEXTBUTTON);
            await this.clickElement(this.filingClaimPageObjects.NEXTBUTTON);
            await this.page.waitForURL(URL_ENDPOINT.SAFELITE_REDIRECT);
            break;
        case "All other damage":
           console.log("Selecting All other damage Option");
            await this.clickElement(this.filingClaimPageObjects.ALLOTHERRDMGSBTN);
            await this.verifyElementVisible(this.filingClaimPageObjects.NEXTBUTTON);
            await this.clickElement(this.filingClaimPageObjects.NEXTBUTTON);
            await this.page.waitForURL(URL_ENDPOINT.TRANSITION_PAGE);
            break;
    }
}

}