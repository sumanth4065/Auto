import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { FilingClaimPageObjects } from '../objectRepository/FilingClaimPageObjects';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { URL_ENDPOINTS, FULL_URL_PATTERNS } from '../../testdata/urlEndpoints';

export class FilingClaimPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  filingClaimPageObjects = new FilingClaimPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateFilingClaimPageDisplay() {
    await this.verifyElementContainsText(
      this.filingClaimPageObjects.TITLETEXT,
      EXPECTED_TEXTS.FILING_CLAIM_TITLE
    );
    await this.verifyElementVisible(this.filingClaimPageObjects.BACKBUTTON);
    await this.verifyElementContainsText(
      this.filingClaimPageObjects.GLASSDAMAGETEXT,
      EXPECTED_TEXTS.FILING_CLAIM_GLASS_DAMAGE
    );
    await this.verifyElementContainsText(
      this.filingClaimPageObjects.ALLOTHERDAMAGETEXT,
      EXPECTED_TEXTS.FILING_CLAIM_ALL_OTHER_DAMAGE
    );
    await this.verifyElementContainsText(
      this.filingClaimPageObjects.GLASSDAMAGEDESC,
      EXPECTED_TEXTS.FILING_CLAIM_GLASS_DAMAGE_DESC
    );
    await this.verifyElementContainsText(
      this.filingClaimPageObjects.ALLOTHERDAMAGEDESC,
      EXPECTED_TEXTS.FILING_CLAIM_ALL_OTHER_DAMAGE_DESC
    );
  }

  async efNavigatetoTransitionPage(damageoption: string) {
    switch (damageoption) {
      case 'Glass only damage':
        console.log('Selecting Glass Damage Option');
        await this.clickElement(this.filingClaimPageObjects.GLASSONLYDMGBTN);
        await this.verifyElementVisible(this.filingClaimPageObjects.NEXTBUTTON);
        await this.clickElement(this.filingClaimPageObjects.NEXTBUTTON);
        await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_SAFELITE_REDIRECT);
        break;

      case 'All other damage':
        console.log('Selecting All other damage Option');
        await this.clickElement(this.filingClaimPageObjects.ALLOTHERRDMGSBTN);
        await this.verifyElementVisible(this.filingClaimPageObjects.NEXTBUTTON);
        await this.clickElement(this.filingClaimPageObjects.NEXTBUTTON);
        await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_TRANSITION_PAGE);
        break;
    }
  }
}
