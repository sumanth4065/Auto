import { expect, Locator, Page, BrowserContext } from '@playwright/test';
import { VehicleDamagebyWeatherPageObjects } from '../objectRepository/VehicleDamagebyWeatherPageObjects';
import { TestBase } from '../../lib/TestBase';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';


export class VehicleDamagebyWeatherPage extends TestBase {
    constructor(page: Page) {
        super(page);
    }

    vehicleDamagebyWeatherPageObjects = new VehicleDamagebyWeatherPageObjects();

    async efvalidatePageTitle() {

        const title = await this.page.title();
        console.log(title);

    }
    async efConfirmAndNavigatetoVehicleInvolvedPage(poption) {
        // navigate to propertypersonal page
        await this.waitforElement(this.vehicleDamagebyWeatherPageObjects.TITLETEXT);
        await this.verifyElementContainsText(this.vehicleDamagebyWeatherPageObjects.TITLETEXT, "What caused the weather damage?");
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.WHATHAPPENDDROPDOWN)
        if (poption === 'Wind') {
            console.log("Selected option Wind");
            await this.clickElement(this.vehicleDamagebyWeatherPageObjects.WIND);
            await this.page.waitForTimeout(2000);
            await this.clickElement(this.vehicleDamagebyWeatherPageObjects.NEXTBUTTON);
        }
        else if (poption === 'Tornado') {
            await this.clickElement(this.vehicleDamagebyWeatherPageObjects.TORNADO);
            await this.clickElement(this.vehicleDamagebyWeatherPageObjects.NEXTBUTTON);
        }
        else if (poption === 'Hail') {
            await this.clickElement(this.vehicleDamagebyWeatherPageObjects.HAIL)
            await this.clickElement(this.vehicleDamagebyWeatherPageObjects.NEXTBUTTON);
        }
        else if (poption === 'Flood') {
            console.log("Selected option Flood");
            await this.clickElement(this.vehicleDamagebyWeatherPageObjects.FLOOD);
            await this.clickElement(this.vehicleDamagebyWeatherPageObjects.NEXTBUTTON);
       
        }
        else if (poption === 'Earthquake') {
            await this.clickElement(this.vehicleDamagebyWeatherPageObjects.EARTHQUAKE);
            await this.clickElement(this.vehicleDamagebyWeatherPageObjects.NEXTBUTTON);
        }
        else if (poption === 'Other') {
            console.log("Selected option Other");
            await this.clickElement(this.vehicleDamagebyWeatherPageObjects.OTHER);
            await this.clickElement(this.vehicleDamagebyWeatherPageObjects.NEXTBUTTON);
    
        }
        await this.page.waitForURL(URL_ENDPOINT.DRIVER);
    }
}