import { expect, Locator, Page, BrowserContext } from '@playwright/test';
import { HomePageObjects } from '../objectRepository/HomePageObjects';
import { TestBase } from '../../lib/TestBase';
import insurancetestdata from '../../testdata/pageprops';
import testdata from '../../testdata/alltestdata';
let testregion;
export class HomePage extends TestBase {
  constructor(page: Page) {
    super(page);
  }
  homePageObjects = new HomePageObjects();

  async goToIntroPage(penv, pclubname, pregion, pbaseurl) {
    console.log('Navigating to Authenticate Login Page');
    let state;
    let zipcode = testdata.zipcodes.get(pclubname ? pclubname : 'TX');
    if (penv === 'uat') {
      if (pregion === 'A1') {
        testregion = 'uat1';
      } else if (pregion === 'B1') {
        testregion = 'uat2';
      }
    } else if (penv === 'qa') {
      if (pregion === 'A1') {
        testregion = 'qa1';
      } else if (pregion === 'B1') {
        testregion = 'qa2';
      }
    }
    //let baseurl = `https://app${testregion}.${pbaseurl}`
    let baseurl = `${pbaseurl}`;
    await Promise.all([this.page.waitForLoadState(), await this.page.goto(baseurl)]);
    const title = await this.page.title();
  }
  async goToProdIntroPage(penv, pclubname, pregion, pbaseurl) {
    console.log('Navigating to Authenticate Login Page');
    let baseurl = pbaseurl;
    await Promise.all([this.page.waitForLoadState(), await this.page.goto(baseurl)]);
    await this.enterText(this.homePageObjects.zipCodeField, testdata.zipcode);
    await this.clickElement(this.homePageObjects.goButton);
  }
}
