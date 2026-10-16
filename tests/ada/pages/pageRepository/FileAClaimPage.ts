import { TestBase } from '../../lib/TestBase';
import { FileAClaimPageObjects } from '../objectRepository/FileAClaimPageObjects';
import { expect, Page } from '@playwright/test';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { FULL_URL_PATTERNS } from '../../testdata/urlEndpoints';

export class FileAClaimPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  fileAClaimPageObjects = new FileAClaimPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateFileAClaimPageDisplay() {
    await this.verifyElementContainsText(
      this.fileAClaimPageObjects.TITLETEXT,
      EXPECTED_TEXTS.FILE_CLAIM_TITLE
    );
    await this.verifyElementContainsText(
      this.fileAClaimPageObjects.SUBTITLETEXT,
      EXPECTED_TEXTS.FILE_CLAIM_SUBTITLE
    );
    await this.verifyElementContainsText(
      this.fileAClaimPageObjects.CONTENT1,
      EXPECTED_TEXTS.FILE_CLAIM_CONTENT1
    );
    await this.verifyElementVisible(this.fileAClaimPageObjects.CONTENT2);
    await this.verifyElementVisible(this.fileAClaimPageObjects.CONTINUEBUTTON);
    await this.verifyElementVisible(this.fileAClaimPageObjects.BACKBUTTON);
  }

  async efNavigatetoFilingClaimPage() {
    await this.clickElement(this.fileAClaimPageObjects.CONTINUEBUTTON);
    await this.page.waitForURL(FULL_URL_PATTERNS.CLAIM_TYPE);
  }
}
