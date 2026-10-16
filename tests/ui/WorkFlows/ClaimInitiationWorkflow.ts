import { Page } from '@playwright/test';
import { FileAClaimPage } from '../pages/pageRepository/FileAClaimPage';
import { FilingClaimPage } from '../pages/pageRepository/FilingClaimPage';
import { TransitionPage } from '../pages/pageRepository/TransitionPage';
import { WhereWhenAccidentPage } from '../pages/pageRepository/WhereWhenAccidentPage';
import { WhereAccidentPage } from '../pages/pageRepository/WhereAccidentPage';

export class ClaimInitiationWorkflow {
    private page: Page;
    private fileAClaimPage: FileAClaimPage;
    private filingClaimPage: FilingClaimPage;
    private transitionPage: TransitionPage;
    private whereWhenAccidentPage: WhereWhenAccidentPage;
    private whereAccidentPage: WhereAccidentPage;

    constructor(page: Page) {
     this.page = page;
    this.fileAClaimPage = new FileAClaimPage(page);
    this.filingClaimPage = new FilingClaimPage(page);
    this.transitionPage = new TransitionPage(page);
    this.whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    this.whereAccidentPage = new WhereAccidentPage(page);
   }

   async initiateClaimFlow(claimType){

        console.log("Navigated to Claim type");
        await this.fileAClaimPage.efValidateTitle();
        await this.fileAClaimPage.efValidateFileAClaimPageDisplay();
        await this.fileAClaimPage.efNavigatetoFilingClaimPage();

        console.log("selecting Claim type")
        await this.filingClaimPage.efValidateTitle();
        await this.filingClaimPage.efValidateFilingClaimPageDisplay();
        await this.filingClaimPage.efNavigatetoTransitionPage(claimType);

        console.log("Navigated to Transition Page");
        await this.transitionPage.efValidateTitle();
        await this.transitionPage.efValidateIncidentInfoIntroPageDisplay();
        await this.transitionPage.efNavigatetoWhereWhenAccidentPage();

        console.log("Navigated to  When Accident Page");
        await this.whereWhenAccidentPage.efValidateTitle();
        await this.whereWhenAccidentPage.efValidateWhereWhenAccidentPagePageDisplay();
        await this.whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();

        console.log("Navigated to Where Accident Page");
        await this.whereAccidentPage.efValidateTitle();
        await this.whereAccidentPage.efValidateWhereAccidentPagePageDisplay();
        await this.whereAccidentPage.efNavigatetoCreateClaimTransitionPage();
   }
}