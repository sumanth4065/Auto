import { expect, Locator, Page, BrowserContext } from '@playwright/test';
import { HomePageObjects } from '../objectRepository/HomePageObjects';
import { TestBase } from '../../lib/TestBase';
import insuranceproperties from "../../testdata/insuranceproperties";
import testdata from '../../testdata/alltestdata';
let testregion;

export class HomePage extends TestBase {
  constructor(page: Page) {
    super(page);
  }
  homePageObjects= new HomePageObjects();

  async goToIntroPage(penv,pclubname,pregion,pbaseurl){
    console.log("Navigating to Authenticate Login Page");
    try{ 
    let state;
    let zipcode = testdata.zipcodes.get(pclubname ? pclubname : 'TX');
    if (penv === 'uat') {
      if (pregion === 'A1') { testregion = 'uat1'; }
      else if (pregion === 'B1') { testregion = 'uat2'; }
    } else if (penv === 'qa') {
      if (pregion === 'A1') { testregion = 'qa1'; }
      else if (pregion === 'B1') { testregion = 'qa2'; }
    }
    //let baseurl = `https://app${testregion}.${pbaseurl}`
    let baseurl = `https://appuat1.${pbaseurl}`
    await Promise.all([
      this.page.waitForLoadState(),
      await this.page.goto(baseurl)
    ]);
    const title = await this.page.title();

 //entering the Zip code
    await this.enterZipCode(pclubname);
    await this.page.waitForTimeout(5000)
  }
  
  catch(error){
    console.log('Error navigating to Intro page:', error);
    throw error;
  }
}

  async goToProdIntroPage(penv, pclubname, pregion, pbaseurl) {
    console.log("Navigating to Authenticate Login Page");
    let baseurl = pbaseurl
    await Promise.all([
      this.page.waitForLoadState(),
      await this.page.goto(baseurl)

    ]);
        await this.enterZipCode(pclubname);
    await this.page.waitForTimeout(5000)
  }

  async goToBehindLoginPage(ptoken, pbaseurl, pguid, pclubname, pregion, penv, pusername, ppassword) {
    console.log("Navigating to Homepage");
    try{
    let zipcode = testdata.zipcodes.get(pclubname ? pclubname : 'CA');
    //let baseurlnav = `${pbaseurl}?id=${pguid}&token=${ptoken}`;
    if (penv === 'uat') {
      if (pregion === 'A1') { testregion = 'uat1'; }
      else if (pregion === 'B1') { testregion = 'uat2'; }
    } else if (penv === 'qa') {
      if (pregion === 'A1') { testregion = 'qa1'; }
      else if (pregion === 'B1') { testregion = 'qa2'; }
    }
    let baseurl = `https://app${testregion}.${pbaseurl}/behindlogin/${pguid}?clubCode=${pclubname}`
    //let baseurl = `https://account.app.uat.ace.aaa.com/enterprise/ma3`
    console.log(baseurl);
    await Promise.all([
      this.page.waitForLoadState(),
      await this.page.goto(baseurl),
    ]);
    const title = await this.page.title();
    console.log("Page Title is: " + title);
    
  await this.enterZipCode(pclubname);
  }
  catch(error){
    console.log('Error navigating to Home page:', error);
    throw error;

  }
}
   async loginToApplication(username, password) {
    await this.waitforElement(this.homePageObjects.LOGIN_PG_WELCOME_MSG);
    await this.verifyElementContainsText(this.homePageObjects.LOGIN_PG_WELCOME_MSG, insuranceproperties.LOGIN_PAGE_WELCOME_MSG);
    await this.waitforElement(this.homePageObjects.LOGINHDR);
    await this.verifyElementContainsText(this.homePageObjects.LOGINHDR, insuranceproperties.LOGINHDR);
    await this.clickElement(this.homePageObjects.USERNAME)
    await this.enterText(this.homePageObjects.USERNAME, username);
    await this.clickElement(this.homePageObjects.NXTBTN);
    await this.waitforElement(this.homePageObjects.PASSWORD);
    await this.enterText(this.homePageObjects.PASSWORD, password);
    await this.clickElement(this.homePageObjects.LOGINBTN);
  }
   async enterZipCode(pclubname) {
    let zipcode = testdata.zipcodes.get(pclubname ? pclubname : 'CA');
    console.log('Entering zip code = ' + zipcode);
    const zipInput = this.page.locator(this.homePageObjects.zipCodeField);
    await zipInput.waitFor({ state: 'visible' });
    await zipInput.click();
    await this.page.keyboard.type(zipcode);
    console.log('Entered zip code');
    await this.page.locator('button:has-text("Go")').click();
    console.log('clicked on go button');
  }

  }