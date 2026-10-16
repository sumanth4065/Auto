import { expect, Locator, Page, BrowserContext } from '@playwright/test';
import { PropertyDamagePageObjects } from '../objectRepository/PropertyDamagePageObjects';
import { TestBase } from '../../lib/TestBase';
import insurancetestdata from '../../testdata/insuranceproperties';
import testdata from '../../testdata/alltestdata';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';

export class PropertyDamagePage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  propertyDamagePageObjects = new PropertyDamagePageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efConfirmAndNavigatetoReviewPage(poption: string) {
    // navigate to propertypersonal page
    await this.waitforElement(this.propertyDamagePageObjects.PROPERTYDMGHDR);
    await this.verifyElementContainsText(
      this.propertyDamagePageObjects.PROPERTYDMGHDR,
      EXPECTED_TEXTS.PROPERTY_DAMAGE_TITLE
    );
    if (poption === 'YES') {
      console.log('Select Yes to Additional property damage');
      await this.clickElement(this.propertyDamagePageObjects.YESBTN);
    } else if (poption === 'NO') {
      console.log('Select No to Additional property damage');
      await this.clickElement(this.propertyDamagePageObjects.NOBTN);
    }

    await this.clickElement_WaitforNavigation(
      this.propertyDamagePageObjects.NEXTBTN,
      URL_ENDPOINTS.ACCIDENT_REVIEW
    );
  }
}