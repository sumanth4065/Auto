import { expect, Locator, Page, BrowserContext } from '@playwright/test';
import { ParkedWhatHappenedPageObjects } from '../objectRepository/ParkedWhatHappenedPageObjects';
import { TestBase } from '../../lib/TestBase';
import insurancetestdata from '../../testdata/insuranceproperties';
import testdata from '../../testdata/alltestdata';
import { FULL_URL_PATTERNS } from '../../testdata/urlEndpoints';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';

export class ParkedWhatHappenedPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  parkedWhatHappenedPageObjects = new ParkedWhatHappenedPageObjects();

  async efvalidatePageTitle() {
    const title = await this.page.title();
    console.log(title);
    //await expect(this.page).toHaveTitle('AAA - Policy Change');
  }
  async efConfirmAndNavigatetoIncidentDatePage(poption: string) {
    // navigate to propertypersonal page
    await this.waitforElement(this.parkedWhatHappenedPageObjects.PARKEDWHATHAPPENEDHDR);
    await this.verifyElementContainsText(
      this.parkedWhatHappenedPageObjects.PARKEDWHATHAPPENEDHDR,
      EXPECTED_TEXTS.PARKED_WHAT_HAPPENED_TITLE
    );
    await this.clickElement(this.parkedWhatHappenedPageObjects.WHATHAPPENDDROPDOWN);

    switch (poption) {
      case 'Hit by another vehicle':
        console.log('Selected option Hit by another vehicle');
        await this.clickElement(this.parkedWhatHappenedPageObjects.HITBYANOTHERCAR);
        await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_VEHICLES_INVOLVED_NUMBER);
        break;

      case 'Rolled away':
        await this.clickElement(this.parkedWhatHappenedPageObjects.ROLLEDAWAY);
        await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        break;

      case 'Struck by a falling or flying object':
        await this.clickElement(this.parkedWhatHappenedPageObjects.SRUCKBYFALLFLYOBJECT);
        await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        break;

      case 'Vandalized':
        console.log('Selected option Vandalized');
        await this.clickElement(this.parkedWhatHappenedPageObjects.VANDALIZED);
        await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_VEHICLES_INVOLVED_NUMBER);
        break;

      case 'Stolen':
        await this.clickElement(this.parkedWhatHappenedPageObjects.STOLEN);
        await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        break;

      case 'Involved in a fire':
        console.log('Selected option Involved in a fire');
        await this.clickElement(this.parkedWhatHappenedPageObjects.INVOLVEINFIRE);
        await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_VEHICLES_INVOLVED_NUMBER);
        break;

      case 'Damaged by weather':
        console.log('Selected option Damaged by weather');
        await this.clickElement(this.parkedWhatHappenedPageObjects.WEATHERDAMAGE);
        await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_VEHICLE_DAMAGE_BY_WEATHER);
        break;

      case 'Other':
        console.log('Selected option Other');
        await this.clickElement(this.parkedWhatHappenedPageObjects.OTHER);
        await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_VEHICLES_INVOLVED_NUMBER);
        break;
    }
  }
}