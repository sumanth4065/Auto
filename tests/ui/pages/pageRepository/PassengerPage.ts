import { expect, Locator, Page, BrowserContext } from '@playwright/test';
import { PassengerPageObjects } from '../objectRepository/PassengerPageObjects';
import { TestBase } from '../../lib/TestBase';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';
import insuranceproperties from '../../testdata/insuranceproperties';


export class PassengerPage extends TestBase {
    constructor(page: Page) {
        super(page);
    }

    passengerPageObjects = new PassengerPageObjects();

    async efvalidatePageTitle() {

        const title = await this.page.title();
    }
    async efverifyPageandNavtoInjuredPage(selectedOption) {
        await this.verifyElementContainsText(this.passengerPageObjects.TITLETEXT, insuranceproperties.PASSENGERPAGETITLE)
        switch (selectedOption) {
            case "No Passengers":
                console.log("No Passengers");
                await this.clickElement(this.passengerPageObjects.OPENDROPDOWN);
                await this.clickElement(this.passengerPageObjects.SELECTEDOPTION1);
                await this.clickElement(this.passengerPageObjects.NEXTBTN);
                await this.page.waitForURL(URL_ENDPOINT.INJURED);
                break;
            case "1 passenger":
                await this.clickElement(this.passengerPageObjects.OPENDROPDOWN);
                await this.clickElement(this.passengerPageObjects.SELECTEDOPTION2);
                await this.clickElement(this.passengerPageObjects.NEXTBTN);
                await this.page.waitForURL(URL_ENDPOINT.INJURED);
                break;
            case "2 passengers":
                await this.clickElement(this.passengerPageObjects.OPENDROPDOWN);
                await this.clickElement(this.passengerPageObjects.SELECTEDOPTION3);
                await this.clickElement(this.passengerPageObjects.NEXTBTN);
                await this.page.waitForURL(URL_ENDPOINT.INJURED);
                break;
        }

    }
    async efverifyOtherPartyPassengerPageandNavtoInjuredPage(selectedOption) {
        await this.verifyElementContainsText(this.passengerPageObjects.TITLETEXT, insuranceproperties.OTHERPARTYPASSENGERPAGETITLE)
        switch (selectedOption) {
            case "No Passengers":
                console.log("No Passengers");
                await this.clickElement(this.passengerPageObjects.OPENDROPDOWN);
                await this.clickElement(this.passengerPageObjects.SELECTEDOPTION1);
                await this.clickElement(this.passengerPageObjects.NEXTBTN);
                await this.page.waitForURL(URL_ENDPOINT.OTHER_PARTY_INJURED_CHECK);
                break;
            case "1 passenger":
                await this.clickElement(this.passengerPageObjects.OPENDROPDOWN);
                await this.clickElement(this.passengerPageObjects.SELECTEDOPTION2);
                await this.clickElement(this.passengerPageObjects.NEXTBTN);
                await this.page.waitForURL(URL_ENDPOINT.OTHER_PARTY_INJURED_CHECK);
                break;
            case "2 passengers":
                await this.clickElement(this.passengerPageObjects.OPENDROPDOWN);
                await this.clickElement(this.passengerPageObjects.SELECTEDOPTION3);
                await this.clickElement(this.passengerPageObjects.NEXTBTN);
                await this.page.waitForURL(URL_ENDPOINT.OTHER_PARTY_INJURED_CHECK);
                break;
        }

    }
}
