import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { ContactInformationPageObjects } from '../objectRepository/ContactInformationPageObjects';
import testdata from '../../testdata/alltestdata';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';
import insuranceproperties from '../../testdata/insuranceproperties';

export class ContactInformationPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    contactInformationPageObjects = new ContactInformationPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  
    async efValidateContactInformationPageDisplay() {
      console.log('started verifying the content in contact info page')
      await this.verifyElementContainsText(this.contactInformationPageObjects.TITLETEXT, insuranceproperties.CONTACTINFORMATIONPAGETITLE);
      await this.verifyElementContainsText(this.contactInformationPageObjects.SUBTITLETEXT, insuranceproperties.CONTACTINFORMATIONPAGESUBTITLE);
      await this.verifyElementContainsText(this.contactInformationPageObjects.EMAILTEXT, insuranceproperties.CONTACTINFORMATIONPAGEEMAIL);
      await this.verifyElementContainsText(this.contactInformationPageObjects.MOBILENUMBERTEXT, insuranceproperties.CONTACTINFORMATIONPAGEMOBILENUMBER);
      await this.verifyElementVisible(this.contactInformationPageObjects.ENABLETEXTCOMMUNICATIONCHECKBOX);
      await this.verifyElementVisible(this.contactInformationPageObjects.BACKBUTTON);
      console.log('completed... verifying the content in contact info page')
  }

  async efNavigatetoCarDetailsTransitionPage() {
    await this.page.locator(this.contactInformationPageObjects.EMAILFIELD).fill('');
    await this.enterText(this.contactInformationPageObjects.EMAILFIELD, 'KOKISHEVA.JEN@CLUBLABS.COM');
    await this.page.locator(this.contactInformationPageObjects.MOBILENUMBERTEXT).fill('');
    await this.enterText(this.contactInformationPageObjects.MOBILENUMBERTEXT,testdata.aaaPhoneNum)
    await this.clickElement(this.contactInformationPageObjects.NEXTBUTTON);
    await this.page.waitForURL(URL_ENDPOINT.CAR_DAMAGE_TRANSITION);
    }
}

