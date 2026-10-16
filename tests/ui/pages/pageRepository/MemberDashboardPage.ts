import { TestBase } from '../../lib/TestBase';
import { TIMEOUTS } from '../../playwright.config';
import insuranceproperties from "../../testdata/insuranceproperties";
import { MemberDashboardObjects } from '../objectRepository/MemberDashboardObjects';
import test = require('node:test');

let policynumber;
let policynumbertext;
let token;
let baseURL;
let clubname;
let guid
let memberDashboardObjs: MemberDashboardObjects;

export class MemberDashboardPage extends TestBase {

  memberDashboardObjs = new MemberDashboardObjects();

  async enrollInPapperless() {

    //console.log('Checking for Enroll in paperless dialog');
    try{
    const dialog = this.page.locator(this.memberDashboardObjs.ENROLL_PAPERLESS);
    // Wait briefly for dialog to appear

 if (await dialog.isVisible({ timeout: TIMEOUTS.MAX })) {
      console.log('Dialog displayed');
      await this.verifyElementContainsText(this.memberDashboardObjs.ENROLL_PAPERLESS, insuranceproperties.ENROLL_PAPAERLESS);
      await this.clickElement(this.memberDashboardObjs.BTN_NOTNOW);
      console.log('Dialog closed');
    }
    else {
      console.log('Dialog not displayed, continuing');
    }
  } catch (error) {
    console.log('Error checking for dialog:', error);
    throw error;
  }
}

  async navigatingToWelcomePage() {
    try{ 
    console.log('Navigating to Welcome page and validating the elements');
    await this.page.locator(this.memberDashboardObjs.JOIN_MEMBERS).waitFor({ state: 'visible', timeout: TIMEOUTS.MAX });
    await this.page.locator(this.memberDashboardObjs.WELCOME_HEADER).waitFor({ state: 'visible', timeout: TIMEOUTS.MAX });
    await this.page.locator(this.memberDashboardObjs.MY_BILLS).waitFor({ state: 'visible', timeout: TIMEOUTS.MAX });

    await this.verifyElementContainsText(this.memberDashboardObjs.JOIN_MEMBERS, insuranceproperties.JOINMEMBERS);
    await this.waitforElement(this.memberDashboardObjs.WELCOME_HEADER);
    
    console.log("Verified the join members msg");
    await this.waitforElement(this.memberDashboardObjs.WELCOME_HEADER);
    console.log("Verified the welcome header");
    await this.verifyElementContainsText(this.memberDashboardObjs.JOIN_MEMBERS, insuranceproperties.JOINMEMBERS);
    await this.waitforElement(this.memberDashboardObjs.MY_BILLS);
    console.log("Verified the My bills");
    await this.verifyElementContainsText(this.memberDashboardObjs.MY_BILLS, insuranceproperties.MYBILLS);
    await this.waitforElement(this.memberDashboardObjs.MY_ITEMS);
    console.log("Verified the My Items");
    await this.verifyElementContainsText(this.memberDashboardObjs.MY_ITEMS, insuranceproperties.MYITEMS);
    await this.page.locator(this.memberDashboardObjs.HOME_POLICY).scrollIntoViewIfNeeded();
    await this.waitforElement(this.memberDashboardObjs.HOME_POLICY)
    console.log("Verified the Home Items");
    await this.verifyElementContainsText(this.memberDashboardObjs.HOME_POLICY, insuranceproperties.HOMEPOLICY);
    }
    catch(error){
      console.log('Error navigating to Welcome page:', error);
      throw error;
    }

  }
  async clickOnFileClaim() {
    console.log('Clicking on File a claim button and validating the navigation');
    try{ 
    await this.waitforElement(this.memberDashboardObjs.AUTO_FILE_CLAIM);
    await this.verifyElementContainsText(this.memberDashboardObjs.AUTO_FILE_CLAIM, insuranceproperties.FILE_CLAIM);
    await this.clickElement(this.memberDashboardObjs.AUTO_FILE_CLAIM);
    }
    catch(error){
      console.log('Error clicking on File a claim button:', error);
      throw error;
    }
  }

}