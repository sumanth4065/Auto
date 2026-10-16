import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { TellUsAboutDriverPageObjects } from '../objectRepository/TellUsAboutDriverPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';

export class TellUsAboutDriverPage extends TestBase {
    constructor(page: Page) {
        super(page);
    }
    tellUsAboutDriverPageObjects = new TellUsAboutDriverPageObjects();

    async efValidateTitle() {
        await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);
    }

    async efValidateAddingDriverPage() {
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.ABOUTDRIVERETITLE);
        await this.verifyElementContainsText(this.tellUsAboutDriverPageObjects.ABOUTDRIVERETITLE, insuranceproperties.ADDDRIVERTITLE);
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.BACKBUTTON)
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.STEPINFO)
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.NAVIGATIONMENU)
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.LBLFIRSTNAME);
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.TXTFIRSTNAME);
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.LBLASTNAME)
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.TXTLASTNAME);
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.LBLMOBILENUM)
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.TXTMOBILENUM);
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.LBLEMAIL)
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.TXTEMAIL);
        await this.verifyElementDisabled(this.tellUsAboutDriverPageObjects.NEXTBUTTON);
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.CLAIMSHELPMESSAGE);
        await this.verifyElementVisible(this.tellUsAboutDriverPageObjects.CALL);
    }
    async enteringDriverDetails() {
        await this.enterText(this.tellUsAboutDriverPageObjects.TXTFIRSTNAME, insuranceproperties.DRIVER_FIRSTNAME);
        await this.enterText(this.tellUsAboutDriverPageObjects.TXTLASTNAME, insuranceproperties.DRIVER_LASTNAME);
        await this.enterText(this.tellUsAboutDriverPageObjects.TXTMOBILENUM, insuranceproperties.DRIVER_MOBILENUM);
        await this.enterText(this.tellUsAboutDriverPageObjects.TXTEMAIL, insuranceproperties.DRIVER_EMAIL);
        await this.clickElement(this.tellUsAboutDriverPageObjects.NEXTBUTTON);
    }

}