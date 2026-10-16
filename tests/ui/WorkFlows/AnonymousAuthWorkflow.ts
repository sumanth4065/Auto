import { Page } from '@playwright/test';
import { HomePage } from '../pages/pageRepository/HomePage';
import { IntroductionPage } from '../pages/pageRepository/IntroductionPage';

export class AnonymousAuthWorkflow {
    private page: Page;
    private homePage: HomePage;
    private introductionPage: IntroductionPage;

    constructor(page: Page) {
        this.page = page;
        this.homePage = new HomePage(page);
        this.introductionPage = new IntroductionPage(page);
    }

    async authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode) {
        await this.homePage.goToIntroPage(env, state, region, baseURL);
        console.log("Navigated to Introduction Page");
        await this.introductionPage.efValidateTitle();
        await this.introductionPage.efValidateIntroductionPageDisplay();
        await this.introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    }
}
