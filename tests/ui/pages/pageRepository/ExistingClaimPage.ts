import { Page, expect } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import insuranceproperties from "../../testdata/insuranceproperties";
import { ExistingClaimPageObjects } from '../objectRepository/ExistingClaimPageObjects';
import { TIMEOUTS } from '../../playwright.config';
import { WhereAccidentPageObjects } from '../objectRepository/WhereAccidentPageObjects';
import { WhereWhenAccidentPageObjects } from '../objectRepository/WhereWhenAccidentPageObjects';

export class ExistingClaimPage extends TestBase {

    constructor(page: Page) {
        super(page);
    }
  existingClaimPageObjects = new ExistingClaimPageObjects(); 
  whereWhenAccidentPageObjects = new WhereWhenAccidentPageObjects();
  whereAccidentPageObjects = new WhereAccidentPageObjects();

 async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);
  }

  async validateExistingClaimsPopUp(){
    await this.efValidateTitle();
    await this.validateExistingClaimsContent();
    await this.continueFilingNewClaim();
    await this.clickElement(this.whereWhenAccidentPageObjects.NEXTBUTTON);
    await this.clickElement(this.whereAccidentPageObjects.NEXTBUTTON);
    await this.closeModal();
    await this.clickElement(this.whereWhenAccidentPageObjects.NEXTBUTTON);
    await this.clickElement(this.whereAccidentPageObjects.NEXTBUTTON);
    await this.goBackToHome();
    await this.verifyAceHomePage();

  }

  async validateExistingClaimsContent(){
    console.log("Verifying Existing Claims pop up window");
    await this.verifyElementVisible(this.existingClaimPageObjects.ExistingClaimsHeader);
    await this.verifyElementContainsText(this.existingClaimPageObjects.ExistingClaimsHeader, insuranceproperties.ExistingClaimsHeader );
    await this.verifyElementVisible(this.existingClaimPageObjects.ExistingClaimsNeedInfo);
    await this.verifyElementContainsText(this.existingClaimPageObjects.ExistingClaimsNeedInfo, insuranceproperties.ExistingClaimsNeedInfo);
    await this.verifyElementVisible(this.existingClaimPageObjects.ClaimsRepresentative);
    await this.verifyElementContainsText(this.existingClaimPageObjects.ClaimsRepresentative, insuranceproperties.ClaimsRepresentative);
    await this.verifyElementVisible(this.existingClaimPageObjects.BtnContinueClaim);
    await this.verifyElementVisible(this.existingClaimPageObjects.BtnBacktoHome);
    await this.verifyElementVisible(this.existingClaimPageObjects.BtnClose);
  }

 async continueFilingNewClaim() {
    console.log(' Continuing to file new claim');
    await this.clickElement(this.existingClaimPageObjects.BtnContinueClaim);
    await this.page.waitForTimeout(TIMEOUTS.LOW);
  }

   async closeModal() {
    console.log(' Closing Dialog box');
    await this.clickElement(this.existingClaimPageObjects.BtnClose);
    await this.page.waitForTimeout(TIMEOUTS.LOW);
  }
    async goBackToHome() {
    console.log('[AnonymousEFNOL] Returning to home page');
    await this.clickElement(this.existingClaimPageObjects.BtnBacktoHome);
    await this.page.waitForTimeout(TIMEOUTS.LOW);

    try {
      console.log('Successfully returned to home');
    } catch {
      console.log('Go back to home button not found, test flow completed');
    }
  }

  async verifyAceHomePage() {
    const finalUrl = this.page.url();
    await expect(finalUrl).toContain(insuranceproperties.aceAaaHomeUrl);
    console.log(`Final URL: ${finalUrl}`);
    console.log('Test completed successfully - Navigation validated');
  }

}