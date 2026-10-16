import { Page } from '@playwright/test';
import { ReviewClaimPage } from '../pages/pageRepository/ReviewClaimPage';
import { AccidentConfirmationPage } from '../pages/pageRepository/AccidentConfirmationPage';

export class ReviewSubmitWorkflow {
    private page: Page;
    private reviewClaimPage:ReviewClaimPage
    private accidentConfirmationPage:AccidentConfirmationPage

    constructor(page: Page) {
        this.page = page;
        this.reviewClaimPage = new ReviewClaimPage(page);
        this.accidentConfirmationPage = new AccidentConfirmationPage(page);
    }
    async submitReviewClaim() {
        console.log("Navigated to accidentreview Page");
		await this.reviewClaimPage.efValidateTitle();
		await this.reviewClaimPage.efValidateReviewClaimPageDisplay();
		await this.reviewClaimPage.efNavigatetoConfirmationPage();
		console.log("Navigated to confirmation Page");
		await this.accidentConfirmationPage.efValidateAutoClaim();
		await this.page.screenshot({ path: "ConfirmationPage.png" });
    }
}