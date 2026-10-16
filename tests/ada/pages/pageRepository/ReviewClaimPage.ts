import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { ReviewClaimPageObjects } from '../objectRepository/ReviewClaimPageObjects';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';

export class ReviewClaimPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  reviewClaimPageObjects = new ReviewClaimPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateReviewClaimPageDisplay() {
    await this.verifyElementContainsText(
      this.reviewClaimPageObjects.TITLETEXT,
      EXPECTED_TEXTS.REVIEW_CLAIM_TITLE
    );
    await this.verifyElementVisible(this.reviewClaimPageObjects.BACKBUTTON);
    await this.verifyElementVisible(this.reviewClaimPageObjects.SUBMITBUTTON);
    await this.verifyElementVisible(this.reviewClaimPageObjects.EXPANDLINK);
    //  await this.verifyElementVisible(this.reviewClaimPageObjects.EDITLINK);
    //await this.verifyElementVisible(this.reviewClaimPageObjects.SUBSECTIONTEXT);
    await this.verifyElementVisible(this.reviewClaimPageObjects.SECTION1);
    await this.verifyElementVisible(this.reviewClaimPageObjects.SECTION2);
    await this.verifyElementVisible(this.reviewClaimPageObjects.SECTION3);
    await this.verifyElementVisible(this.reviewClaimPageObjects.SECTION4);
  }

  async efNavigatetoConfirmationPage() {
    await this.clickElement_WaitforNavigation(
      this.reviewClaimPageObjects.SUBMITBUTTON,
      URL_ENDPOINTS.CONFIRMATION
    );
    // console.log("Navigated to Confirmation Page");
    // const text = await this.page.textContent(this.reviewClaimPageObjects.CONFIRMATIONNUMBER);
    // console.log(`Claim Number: ${text}`);
  }
}
