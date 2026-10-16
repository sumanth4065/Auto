import { TestBase } from '../../lib/TestBase';
import { FileAClaimPageObjects } from '../objectRepository/FileAClaimPageObjects';
import { expect,  Page } from '@playwright/test';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';
import insuranceproperties from '../../testdata/insuranceproperties';

export class FileAClaimPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    fileAClaimPageObjects = new FileAClaimPageObjects();

    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);
  }
  
    async efValidateFileAClaimPageDisplay() {

      await this.verifyElementContainsText(this.fileAClaimPageObjects.TITLETEXT, insuranceproperties.FILEACLAIMPAGETITLE);
      await this.verifyElementContainsText(this.fileAClaimPageObjects.SUBTITLETEXT, insuranceproperties.FILEACLAIMSUBTITLE);
      await this.verifyElementContainsText(this.fileAClaimPageObjects.CONTENT1, insuranceproperties.FILEACLAIMCONTENT1);    
      await this.verifyElementVisible(this.fileAClaimPageObjects.CONTENT2);
      await this.verifyElementVisible(this.fileAClaimPageObjects.CONTINUEBUTTON);
      await this.verifyElementVisible(this.fileAClaimPageObjects.BACKBUTTON);
  
  }

  async efNavigatetoFilingClaimPage() {
    await this.clickElement(this.fileAClaimPageObjects.CONTINUEBUTTON);
    await this.page.waitForURL(URL_ENDPOINT.CLAIM_TYPE);

}

}