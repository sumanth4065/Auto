import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { WhoIsReportingPageObjects } from '../objectRepository/WhoIsReportingPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class WhoIsReportingPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }
  whoIsReportingPageObjects = new WhoIsReportingPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);
  }

  async efValidateWhoIsReportingPageDisplay() {
    await this.verifyElementContainsText(this.whoIsReportingPageObjects.TITLETEXT, insuranceproperties.WHOISREPORTINGPAGETITLE);
    await this.verifyElementContainsText(this.whoIsReportingPageObjects.SUBTITLETEXT, insuranceproperties.WHOISREPORTINGPAGESUBTITLE);
    await this.verifyElementVisible(this.whoIsReportingPageObjects.BACKBUTTON);

  }

  async efNavigatetoContactInfoPage1(selectedOption: string) {

    await this.clickElement(this.whoIsReportingPageObjects.REPORTERDROPDOWN);
    switch (selectedOption) {
      case "Option1":
        console.log("Selecting Reporter1 from List ");
        await this.clickElement(this.whoIsReportingPageObjects.SELECTFIRSTOPTION);
        await this.clickElement(this.whoIsReportingPageObjects.NEXTBUTTON);
        await this.page.waitForURL(URL_ENDPOINT.CONTACT_INFO);
        break;
      case "Option2":
        console.log("Selecting Reporter2 from List ");
        await this.clickElement(this.whoIsReportingPageObjects.SELECTSECONDOPTION);
        await this.clickElement(this.whoIsReportingPageObjects.NEXTBUTTON);
        await this.page.waitForURL(URL_ENDPOINT.CONTACT_INFO);
        break;
      case "Reporter not listed":
        console.log("Selecting Reporter not listed");
        await this.clickElement(this.whoIsReportingPageObjects.SELECTREPORTERNOTLISTED);
        await this.page.waitForURL(URL_ENDPOINT.CUSTOM_REPORTER);

    }
  }

  async efValidateAddingNewReporterPage() {
    await this.verifyElementVisible(this.whoIsReportingPageObjects.NEWREPORTERTITLE);
    await this.verifyElementContainsText(this.whoIsReportingPageObjects.NEWREPORTERTITLE, insuranceproperties.NEWREPORTERTITLE);
    await this.verifyElementVisible(this.whoIsReportingPageObjects.BACKBUTTON)
    await this.verifyElementVisible(this.whoIsReportingPageObjects.STEPINFO)
    await this.verifyElementVisible(this.whoIsReportingPageObjects.NAVIGATIONMENU)
    await this.verifyElementVisible(this.whoIsReportingPageObjects.CLAIMSHELPMESSAGE);
    await this.verifyElementVisible(this.whoIsReportingPageObjects.CALL);
    await this.verifyElementVisible(this.whoIsReportingPageObjects.LBLFIRSTNAME);
    await this.verifyElementVisible(this.whoIsReportingPageObjects.FIRSTNAME);
    await this.verifyElementVisible(this.whoIsReportingPageObjects.LBLLASTNAME)
    await this.verifyElementVisible(this.whoIsReportingPageObjects.LASTNAME);
    await this.verifyElementDisabled(this.whoIsReportingPageObjects.NEXTBUTTON);
  }

  async enteringReporterDetails() {
    await this.enterText(this.whoIsReportingPageObjects.FIRSTNAME, insuranceproperties.FITSTNAME);
    await this.enterText(this.whoIsReportingPageObjects.LASTNAME, insuranceproperties.LASTNAME);
    await this.clickElement(this.whoIsReportingPageObjects.NEXTBUTTON);
  }
}