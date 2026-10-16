import { expect, Locator, Page, BrowserContext } from '@playwright/test';
import { ParkedWhatHappenedPageObjects } from '../objectRepository/ParkedWhatHappenedPageObjects';
import { DrivenIncidentDetailsPageObjects} from '../objectRepository/DrivenIncidentDetailsPageObjects';
import { TestBase } from '../../lib/TestBase';
import insuranceproperties from '../../testdata/insuranceproperties';


export class ParkedWhatHappenedPage extends TestBase {
    constructor(page: Page) {
        super(page);
    }

    parkedWhatHappenedPageObjects = new ParkedWhatHappenedPageObjects();
    drivenIncidentDetailsPageObjects = new DrivenIncidentDetailsPageObjects();

    async efvalidatePageTitle() {

        const title = await this.page.title();
        console.log(title);
        //await expect(this.page).toHaveTitle('AAA - Policy Change');

    }
    async efConfirmAndNavigatetoIncidentDatePage(poption) {
        await this.waitforElement(this.parkedWhatHappenedPageObjects.PARKEDWHATHAPPENEDHDR);
        await this.verifyElementContainsText(this.parkedWhatHappenedPageObjects.PARKEDWHATHAPPENEDHDR, insuranceproperties.PARKEDWHATHAPPENEDHDR);
        await this.clickElement(this.parkedWhatHappenedPageObjects.WHATHAPPENDDROPDOWN)
        if (poption === 'Hit by another vehicle') {
            console.log("Selected option Hit by another vehicle");
            await this.clickElement(this.parkedWhatHappenedPageObjects.HITBYANOTHERCAR);
            await this.verifyElementVisible(this.parkedWhatHappenedPageObjects.NEXTBTN);
            await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        }
        else if (poption === 'Rolled away') {
            await this.clickElement(this.parkedWhatHappenedPageObjects.ROLLEDAWAY);
            await this.verifyElementVisible(this.parkedWhatHappenedPageObjects.NEXTBTN);
            await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        }
        else if (poption === 'Struck by a falling or flying object') {
            await this.clickElement(this.parkedWhatHappenedPageObjects.SRUCKBYFALLFLYOBJECT)
            await this.verifyElementVisible(this.parkedWhatHappenedPageObjects.NEXTBTN);
            await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        }
        else if (poption === 'Vandalized') {
            console.log("Selected option Vandalized");
            await this.clickElement(this.parkedWhatHappenedPageObjects.VANDALIZED);
            await this.verifyElementVisible(this.parkedWhatHappenedPageObjects.NEXTBTN);
            await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
            // Vandalized can go to driver OR vehiclesinvolvednumber depending on flow
            await this.page.waitForLoadState('networkidle');
       
        }
        else if (poption === 'Stolen') {
            await this.clickElement(this.parkedWhatHappenedPageObjects.STOLEN);
            await this.verifyElementVisible(this.parkedWhatHappenedPageObjects.NEXTBTN);
            await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        }
        else if (poption === 'Involved in a fire') {
            console.log("Selected option Involved in a fire");
            await this.clickElement(this.parkedWhatHappenedPageObjects.INVOLVEINFIRE);
            await this.verifyElementVisible(this.parkedWhatHappenedPageObjects.NEXTBTN);
            await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
            await this.page.waitForLoadState('networkidle');
    
        }
        else if (poption === 'Damaged by weather') {
            console.log("Selected option Damaged by weather");
            await this.clickElement(this.parkedWhatHappenedPageObjects.WEATHERDAMAGE);
        }
        else if (poption === 'Other') {
            console.log("Selected option Other");
            await this.clickElement(this.parkedWhatHappenedPageObjects.OTHER);
            await this.verifyElementVisible(this.parkedWhatHappenedPageObjects.NEXTBTN);
            await this.clickElement(this.parkedWhatHappenedPageObjects.NEXTBTN);
        }
    }

    async selectWeatherEvent(poption) {
        try{
        await this.waitforElement(this.drivenIncidentDetailsPageObjects.PARKED_WHATWASWEATHER);
        await this.verifyElementContainsText(this.drivenIncidentDetailsPageObjects.PARKED_WHATWASWEATHER, insuranceproperties.PARKED_WHATWASWEATHER);
       
        switch (poption) {
            case 'Wind':
        
            console.log("Selected option - Wind");
            await this.clickElement(this.drivenIncidentDetailsPageObjects.WIND);
            await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
            await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
        break;
        case 'Hail':
         
            console.log("Selected option - Hail");
            await this.clickElement(this.drivenIncidentDetailsPageObjects.HAIL)
            await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
            await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
        break;
        case 'Flood/water':
            console.log("Selected option - Flood/water");
            await this.clickElement(this.drivenIncidentDetailsPageObjects.FLOOD_WATER);
            await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
            await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
            break;
             default:
                throw new Error(`Invalid weather option provided: ${poption}`)
       
        }
    }
    catch (error) {
        console.error("Error Message: ", error.message);

    }
    }
}