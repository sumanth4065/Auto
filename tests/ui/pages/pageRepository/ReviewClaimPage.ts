import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { ReviewClaimPageObjects } from '../objectRepository/ReviewClaimPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';

export class ReviewClaimPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    reviewClaimPageObjects = new ReviewClaimPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateReviewClaimPageDisplay() {

      await this.verifyElementContainsText(this.reviewClaimPageObjects.TITLETEXT, insuranceproperties.REVIEWCLAIMPAGETITLE);
      await this.verifyElementVisible(this.reviewClaimPageObjects.BACKBUTTON);
      await this.verifyElementVisible(this.reviewClaimPageObjects.SUBMITBUTTON);
      await this.verifyElementVisible(this.reviewClaimPageObjects.EXPANDLINK);
      await this.verifyElementVisible(this.reviewClaimPageObjects.SECTION1);
      await this.verifyElementVisible(this.reviewClaimPageObjects.SECTION2);
      await this.verifyElementVisible(this.reviewClaimPageObjects.SECTION3);
      await this.verifyElementVisible(this.reviewClaimPageObjects.SECTION4);
  
  }
  async validateReviewPageandclickEditIncidentInfoPage() {

    await this.verifyElementContainsText(this.reviewClaimPageObjects.TITLETEXT, "Auto claim");
    await this.verifyElementVisible(this.reviewClaimPageObjects.BACKBUTTON);
    await this.verifyElementVisible(this.reviewClaimPageObjects.SUBMITBUTTON);
    await this.verifyElementVisible(this.reviewClaimPageObjects.EXPANDLINK);
    await this.verifyElementVisible(this.reviewClaimPageObjects.EDITLINK);
    await this.clickElement(this.reviewClaimPageObjects.INCIDENTINFOEXPAND)
    await this.clickElement_WaitforNavigation(this.reviewClaimPageObjects.EDITLINK,'')
    await this.verifyElementVisible(this.reviewClaimPageObjects.SECTION1);
    await this.verifyElementVisible(this.reviewClaimPageObjects.SECTION2);
    await this.verifyElementVisible(this.reviewClaimPageObjects.SECTION3);
    await this.verifyElementVisible(this.reviewClaimPageObjects.SECTION4);

}
  async efNavigatetoConfirmationPage() {
    await this.clickElement(this.reviewClaimPageObjects.SUBMITBUTTON);
}

}