import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyInsurancePageObjects } from '../objectRepository/OtherPartyInsurancePageObjects';
import testdata from '../../testdata/alltestdata';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';

export class OtherPartyInsurancePage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  otherPartyInsurancePageObjects = new OtherPartyInsurancePageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateOtherPartyInsurancePageDisplay() {
    await this.verifyElementContainsText(
      this.otherPartyInsurancePageObjects.TITLETEXT,
      EXPECTED_TEXTS.OTHER_PARTY_INSURANCE_TITLE
    );
    await this.verifyElementContainsText(
      this.otherPartyInsurancePageObjects.INSCOMPANYTEXT,
      EXPECTED_TEXTS.OTHER_PARTY_INSURANCE_COMPANY
    );
    await this.verifyElementContainsText(
      this.otherPartyInsurancePageObjects.POLICYNUMBERTEXT,
      EXPECTED_TEXTS.OTHER_PARTY_INSURANCE_POLICY
    );
    await this.verifyElementVisible(this.otherPartyInsurancePageObjects.BACKBUTTON);
  }

  async efNavigatetoOtherPartyDriverPage() {
    await this.enterText(
      this.otherPartyInsurancePageObjects.INSCOMPANYFIELD,
      testdata.insurancecompanyinput
    );
    //await this.enterText(this.otherPartyInsurancePageObjects.POLICYNUMBERINPUT, testdata.policynumberinput);

    await this.clickElement_WaitforNavigation(
      this.otherPartyInsurancePageObjects.NEXTBUTTON,
      URL_ENDPOINTS.OTHER_PARTY_VEHICLE_DRIVER_INFO
    );
  }
}
