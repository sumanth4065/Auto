import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { WhereWhenAccidentPageObjects } from '../objectRepository/WhereWhenAccidentPageObjects';
const commonfun = require('../../utilities/CommonFunctions');
import insuranceproperties from '../../testdata/insuranceproperties';
import alltestdata from '../../testdata/alltestdata';

export class WhereWhenAccidentPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  whereWhenAccidentPageObjects = new WhereWhenAccidentPageObjects();



  async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);
  }

  async efValidateWhereWhenAccidentPagePageDisplay() {

    await this.verifyElementContainsText(this.whereWhenAccidentPageObjects.TITLETEXT, insuranceproperties.WHENACCIDENTPAGETITLETEXT);
    await this.verifyElementContainsText(this.whereWhenAccidentPageObjects.DATETEXT, insuranceproperties.DATEOFINCIDENTTEXT);

  }

  async efNavigatetoCreateClaimTransitionPage() {
    const maxRetries = 10;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Attempt ${attempt} to enter accident date/time`);
      let [incdate, inctime] = commonfun.get_DateAndTime();
      console.log(`Generated date: ${incdate}, time: ${inctime}`);

      await this.page.waitForLoadState();
      await this.clickElement(this.whereWhenAccidentPageObjects.DATEINPUT);
      await this.enterText(this.whereWhenAccidentPageObjects.DATEINPUT, incdate);
      await this.page.keyboard.down('Escape');
      await this.page.waitForTimeout(alltestdata.TIMEOUTS.LOW);

      await this.clickElement(this.whereWhenAccidentPageObjects.TIMETEXT);
      const timeOption = this.page.getByRole('option', { name: inctime });
      if (await timeOption.count() > 0) {
        await timeOption.first().click();
      } else {
        console.log(`No option matched generated time "${inctime}". Falling back to first available option.`);
        await this.page.getByRole('option').first().click();
      }
      await this.page.waitForTimeout(alltestdata.TIMEOUTS.LOW);

      const nextButton = this.page.locator(this.whereWhenAccidentPageObjects.NEXTBUTTON);
      try {
        await expect(nextButton).toBeEnabled({ timeout: alltestdata.TIMEOUTS.MEDIUM });
      } catch (error) {
        console.log(`Next button stayed disabled on attempt ${attempt}. Retrying date/time entry...`);
        await this.page.locator(this.whereWhenAccidentPageObjects.DATEINPUT).clear();
        continue;
      }
      await nextButton.click();

      // Check for duplicate claim popup
      const duplicatePopup = this.page.locator(this.whereWhenAccidentPageObjects.DUPLICATE_POPUP);
      
      try {
        await duplicatePopup.waitFor({ state: 'visible', timeout: alltestdata.TIMEOUTS.MEDIUM});
        console.log(`Duplicate claim popup detected for date ${incdate}. Closing and retrying...`);
        
        // Close the popup
        const closeButton = this.page.locator(this.whereWhenAccidentPageObjects.CLOSE_BUTTON).first();
        await closeButton.click();
        console.log('Popup closed. Generating new date...');
        
        // Clear the fields for retry
        await this.page.locator(this.whereWhenAccidentPageObjects.DATEINPUT).clear();
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

   async enterDateTimeforDuplicateClaimsValidation(existingClaimNum: string) {

    await this.clickElement(this.whereWhenAccidentPageObjects.DATEINPUT);
    await this.enterText(this.whereWhenAccidentPageObjects.DATEINPUT, existingClaimNum);
    await this.page.keyboard.down('Escape');

    await this.clickElement(this.whereWhenAccidentPageObjects.TIMETEXT);
    await this.page.getByRole('option', { name: '12 hours' }).click();
    await this.verifyElementVisible(this.whereWhenAccidentPageObjects.NEXTBUTTON);
    await this.clickElement(this.whereWhenAccidentPageObjects.NEXTBUTTON);
  }

}