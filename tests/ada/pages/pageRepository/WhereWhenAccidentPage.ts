import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { WhereWhenAccidentPageObjects } from '../objectRepository/WhereWhenAccidentPageObjects';
import commonfun from '../../utilities/CommonFunctions';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import alltestdata from '../../testdata/alltestdata';

export class WhereWhenAccidentPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  whereWhenAccidentPageObjects = new WhereWhenAccidentPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateWhereWhenAccidentPagePageDisplay() {
    await this.verifyElementContainsText(
      this.whereWhenAccidentPageObjects.TITLETEXT,
      EXPECTED_TEXTS.WHERE_WHEN_TITLE
    );
    await this.verifyElementContainsText(
      this.whereWhenAccidentPageObjects.DATETEXT,
      EXPECTED_TEXTS.WHERE_WHEN_DATE
    );
    await this.verifyElementContainsText(
      this.whereWhenAccidentPageObjects.TIMETEXT,
      EXPECTED_TEXTS.WHERE_WHEN_TIME
    );
    await this.verifyElementContainsText(
      this.whereWhenAccidentPageObjects.STATETEXT,
      EXPECTED_TEXTS.WHERE_WHEN_STATE
    );
    await this.verifyElementContainsText(
      this.whereWhenAccidentPageObjects.CITYTEXT,
      EXPECTED_TEXTS.WHERE_WHEN_CITY
    );
    //await this.verifyElementNotVisible(this.whereWhenAccidentPageObjects.NEXTBUTTON);
  }

  async efNavigatetoCreateClaimTransitionPage() {
  const maxRetries = 10;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Attempt ${attempt} to enter accident date/time`);
    let [incdate, inctime] = commonfun.get_DateAndTime();
    console.log(`Generated date: ${incdate}, time: ${inctime}`);

    await this.page.locator(this.whereWhenAccidentPageObjects.DATEINPUT).click();
    await this.page.keyboard.type(incdate);
    await this.page.keyboard.press('Tab');

    await this.page.locator(this.whereWhenAccidentPageObjects.TIMEINPUT).click();
    await this.page.keyboard.type(inctime);

    const okButton = this.page.locator(this.whereWhenAccidentPageObjects.OK_BUTTON);
    try {
      await okButton.click({ timeout: alltestdata.TIMEOUTS.MEDIUM });
    } catch (error) {
      console.log('OK button not found.', error);
    }
    
    await this.page.locator(this.whereWhenAccidentPageObjects.NEXTBUTTON).click();
    await this.page.waitForTimeout(alltestdata.TIMEOUTS.HIGH);
    
    // Check for duplicate claim popup
    const duplicatePopup = this.page.locator(this.whereWhenAccidentPageObjects.DUPLICATE_POPUP);
    
    try {
      await duplicatePopup.waitFor({ state: 'visible', timeout: alltestdata.TIMEOUTS.MEDIUM});
      console.log(`Duplicate claim popup detected for date ${incdate}. Closing and retrying...`);
      
      // Close the popup
      const closeButton = this.page.locator(this.whereWhenAccidentPageObjects.CLOSE_BUTTON).first();
      await closeButton.click();
      await this.page.waitForTimeout(alltestdata.TIMEOUTS.MEDIUM);
      console.log('Popup closed. Generating new date...');
      
      // Clear the fields for retry
      await this.page.locator(this.whereWhenAccidentPageObjects.DATEINPUT).clear();
      await this.page.locator(this.whereWhenAccidentPageObjects.TIMEINPUT).clear();
    } catch (error) {
      console.log(`No duplicate popup detected. Successfully entered accident date/time on attempt ${attempt}.`);
      await this.page
        .locator(this.whereWhenAccidentPageObjects.STREETINPUT)
        .waitFor({ state: 'visible', timeout: alltestdata.TIMEOUTS.MEDIUM });
      return;
    }
  }
  
  throw new Error(`Failed to find unique accident date after ${maxRetries} attempts. All dates resulted in duplicate claims.`);
}

  async efNavigatetoWhereDidIncidentHappenPage() {
    await this.verifyElementContainsText(
      this.whereWhenAccidentPageObjects.STREETTEXT,
      EXPECTED_TEXTS.WHERE_WHEN_STREET
    );
    await this.verifyElementContainsText(
      this.whereWhenAccidentPageObjects.CITYTEXT,
      EXPECTED_TEXTS.WHERE_WHEN_CITY
    );
    await this.verifyElementContainsText(
      this.whereWhenAccidentPageObjects.STATETEXT,
      EXPECTED_TEXTS.WHERE_WHEN_STATE_LABEL
    );
    await this.verifyElementContainsText(
      this.whereWhenAccidentPageObjects.ZIPCODETEXT,
      EXPECTED_TEXTS.WHERE_WHEN_ZIPCODE
    );

    await this.page.locator(this.whereWhenAccidentPageObjects.STREETINPUT).click();
    await this.page.keyboard.type(alltestdata.street);
    await this.page.keyboard.press('Tab');
    await this.page.locator(this.whereWhenAccidentPageObjects.CITYINPUT).click();
    await this.page.keyboard.type(alltestdata.city);
    await this.page.keyboard.press('Tab');

    await this.page.locator(this.whereWhenAccidentPageObjects.STATETINPUT).click();
    await this.page.keyboard.type(alltestdata.state);
    await this.page.keyboard.press('Tab');

    await this.page.locator(this.whereWhenAccidentPageObjects.ZIPCODEINPUT).click();
    await this.page.keyboard.type(alltestdata.zipcode);
    await this.page.keyboard.press('Tab');

    await this.page.locator(this.whereWhenAccidentPageObjects.NEXTBUTTON).click();
    await this.page.locator(this.whereWhenAccidentPageObjects.WHO_IS_REPORTING_HEADER).waitFor({ state: 'visible', timeout: 30000 });
  }
}