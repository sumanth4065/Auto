import { expect, Locator, Page, BrowserContext } from '@playwright/test';
import { KnockoutPageObjects } from '../objectRepository/KnockoutPageObjects';
import { TestBase } from '../../lib/TestBase';
import insurancetestdata from '../../testdata/insuranceproperties';
const commonfun = require('../../utilities/CommonFunctions');

export class KnockOutPage extends TestBase {
    constructor(page: Page) {
        super(page);
    }
    knockoutPageObjects = new KnockoutPageObjects();

    async efValidateKnockOutPageTitle() {
        const title = await this.page.title();
        console.log(title);
        await expect(this.page).toHaveTitle('AAA - Policy Change');

    }
    async validateKnockOutPage() {
        let isKnockOutPageValidated
        if ((this.knockoutPageObjects.PAGEHDR).includes("{{FirstName}}, your claim has not been submitted.")) {
            console.info("Knock out page validated");
            isKnockOutPageValidated = true;
        } else {
            console.info("Knock out page validated");
            isKnockOutPageValidated = false;
        }
        return isKnockOutPageValidated;

    }
    async validateknockoutReferenceNumber() {
        await this.verifyElementText(this.knockoutPageObjects.PAGEHDR, insurancetestdata.KnockOutPageText1);
        await this.verifyElementText(this.knockoutPageObjects.TXTBOX2, insurancetestdata.KnockOutPageText2);
        await this.verifyElementText(this.knockoutPageObjects.TXTBOX3, insurancetestdata.KnockOutPageText3);
        await this.verifyElementText(this.knockoutPageObjects.TXTBOX4, insurancetestdata.KnockOutPageText4);
        await this.waitforElement(this.knockoutPageObjects.RFRENCENBR);
        await this.verifyElementVisible(this.knockoutPageObjects.RFRENCENBR);
        let referencenumber = await this.getElementText(this.knockoutPageObjects.RFRENCENBR);
        console.log(referencenumber);
        await this.verifyElementVisible(this.knockoutPageObjects.BACKTOACCNTBTN);
        await this.verifyElementEnabled(this.knockoutPageObjects.BACKTOACCNTBTN);

    }

}