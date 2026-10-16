import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyYMMPageObjects } from '../objectRepository/OtherPartyYMMPageObjects';
import testdata from '../../testdata/alltestdata';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';

export class OtherPartyYMMPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  otherPartyYMMPageObjectsObjects = new OtherPartyYMMPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateOtherPartyYMMPageDisplay() {
    await this.verifyElementContainsText(
      this.otherPartyYMMPageObjectsObjects.TITLETEXT,
      EXPECTED_TEXTS.OTHER_PARTY_YMM_TITLE
    );
    await this.verifyElementContainsText(
      this.otherPartyYMMPageObjectsObjects.YEARTEXT,
      EXPECTED_TEXTS.OTHER_PARTY_YMM_YEAR
    );
    await this.verifyElementContainsText(
      this.otherPartyYMMPageObjectsObjects.MAKETEXT,
      EXPECTED_TEXTS.OTHER_PARTY_YMM_MAKE
    );
    await this.verifyElementContainsText(
      this.otherPartyYMMPageObjectsObjects.MODELTEXT,
      EXPECTED_TEXTS.OTHER_PARTY_YMM_MODEL
    );
    //await this.verifyElementContainsText(this.contactInformationPageObjects.DISCLAIMERTEXT, "By selecting “Next,” you acknowledge that it's OK for us, or parties that perform services on AAA's behalf, to contact you regarding your claim with the information above. Message and data rates may apply. You can opt out of email and/or text messaging at any time.");
    // await this.verifyElementVisible(this.contactInformationPageObjects.ENABLETEXTCOMMUNICATIONCHECKBOX);
    await this.verifyElementVisible(this.otherPartyYMMPageObjectsObjects.BACKBUTTON);
  }

  async efNavigatetoOtehrPartyInsurancePage() {
    await this.enterText(this.otherPartyYMMPageObjectsObjects.YEARFIELD, testdata.yearinput);
    await this.enterText(this.otherPartyYMMPageObjectsObjects.MAKEFIELD, testdata.makeinput);
    await this.enterText(this.otherPartyYMMPageObjectsObjects.MODELFIELD, testdata.modelinput);
    await this.clickElement_WaitforNavigation(
      this.otherPartyYMMPageObjectsObjects.NEXTBUTTON,
      URL_ENDPOINTS.OTHER_PARTY_INSURANCE_INFO
    );
  }
}
