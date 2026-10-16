import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyWitnessPageObjects } from '../objectRepository/OtherPartyWitnessPageObjects';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import testdata from '../../testdata/alltestdata';

export class OtherPartyWitnessPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  otherPartyWitnessPageObjects = new OtherPartyWitnessPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateOtherPartyWitnessPageDisplay() {
    await this.verifyElementContainsText(
      this.otherPartyWitnessPageObjects.TITLETEXT,
      EXPECTED_TEXTS.OTHER_PARTY_WITNESS_TITLE
    );
    await this.verifyElementVisible(this.otherPartyWitnessPageObjects.BACKBUTTON);
    await this.verifyElementVisible(this.otherPartyWitnessPageObjects.IDONTKNOWBUTTON);
  }

  async efNavigatetoReviewClaimPage(selectedOption: string) {
    const option = selectedOption.toLowerCase();

    if (option === 'yes') {
      console.log('Select Yes for witnesses');
      await this.clickElement(this.otherPartyWitnessPageObjects.YESRADIOBUTTON);
      await this.enterText(this.otherPartyWitnessPageObjects.FIRSTNAME, testdata.DESCRIPTIONINPUT);
      await this.enterText(this.otherPartyWitnessPageObjects.LASTNAME, testdata.DESCRIPTIONINPUT);
    } else if (option === 'no') {
      console.log('Select No for witnesses');
      await this.clickElement(this.otherPartyWitnessPageObjects.NORADIOBUTTON);
    } else {
      throw new Error(`Invalid option: ${selectedOption}. Expected 'yes' or 'no'`);
    }

    await this.clickElement_WaitforNavigation(
      this.otherPartyWitnessPageObjects.NEXTBUTTON,
      URL_ENDPOINTS.ADDITIONAL_PROPERTY_DAMAGE
    );
  }
}
