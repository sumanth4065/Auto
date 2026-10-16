import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { OtherPartyPedestrianPageObjects } from '../objectRepository/OtherPartyPedestrianPageObjects';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';

export class OtherPartyPedestrianPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  otherPartyPedestrianPageObjects = new OtherPartyPedestrianPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateOtherPartyPedestrianPageDisplay() {
    await this.verifyElementContainsText(
      this.otherPartyPedestrianPageObjects.TITLETEXT,
      EXPECTED_TEXTS.OTHER_PARTY_PEDESTRIAN_TITLE
    );
    await this.verifyElementVisible(this.otherPartyPedestrianPageObjects.BACKBUTTON);
  }

  async efNavigatetoOtherPartyWitnessPage() {
    // selecting noneof above option
    await this.clickElement_WaitforNavigation(
      this.otherPartyPedestrianPageObjects.NONEOFTHEABOVEBUTTON,
      URL_ENDPOINTS.WITNESS_INFO
    );
  }

  async efSelectAndNavigatetoOtherPartyWitnessPage(option: string) {
    switch (option) {
      case 'Pedestrian':
        console.log('Select Pedestrian');
        await this.clickElement(this.otherPartyPedestrianPageObjects.PEDESTRIANRADIOBUTTON);
        await this.clickElement_WaitforNavigation(
          this.otherPartyPedestrianPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.WITNESS_INFO
        );
        break;

      case 'Cyclist':
        console.log('Select Cyclist');
        await this.clickElement(this.otherPartyPedestrianPageObjects.CYCLISTRADIOBUTTON);
        await this.clickElement_WaitforNavigation(
          this.otherPartyPedestrianPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.WITNESS_INFO
        );
        break;
    }
  }
}
