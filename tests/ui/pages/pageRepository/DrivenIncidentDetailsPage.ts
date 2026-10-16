import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { DrivenIncidentDetailsPageObjects } from '../objectRepository/DrivenIncidentDetailsPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';
import alltestdata from '../../testdata/alltestdata';

export class DrivenIncidentDetailsPage extends TestBase {
    constructor(page: Page) {
        super(page);
    }

    drivenIncidentDetailsPageObjects = new DrivenIncidentDetailsPageObjects();

    async efValidateTitle() {
        await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

    }

    async efValidateDrivenIncidentDetailsPageDisplay() {
        await this.verifyElementContainsText(this.drivenIncidentDetailsPageObjects.TITLETEXT, insuranceproperties.DRIVEN_WHATHAPPENEDHDR);
        await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.BACKBUTTON);
        await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.SUBTITLETEXT);
    }

    async efNavigatetoWhoWasDriving(selectedOption) {

        try {
            await this.clickElement(this.drivenIncidentDetailsPageObjects.INCIDENTDROPDOWN);
            switch (selectedOption) {
                case "Impact with other vehicle(s)":
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECT_IMPACT_OTHER_VEHCICLE);
                    console.log ("Selected option - Impact with other vehicle(s)");
                    await this.page.waitForTimeout(alltestdata.TIMEOUTS.MEDIUM);
                    break;
                case "Impact with an animal":
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECT_IMPACT_ANIMAL);
                    console.log ("Selected option - Impact with an animal");
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    break;
                case "Impact with a fixed object or structure":
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECT_IMPACT_FIXED_OBJ);
                    console.log ("Selected option - Impact with a fixed object or structure");
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                     await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    break;
                case "Impact with a pedestrian or cyclist":
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECT_IMPACT_CYCLIST);
                    console.log ("Selected option - Impact with a pedestrian or cyclist");
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                     await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    break;
                case "Struck by a falling or flying object": 
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECT_STRUCK_OBJECT);
                    console.log ("Selected option - Struck by a falling or flying object");
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                     await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    break;
                case "Damaged by weather":
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECT_DAMAGE_WEATHER);
                    console.log ("Selected option - Damaged by weather");
                    await this.page.waitForTimeout(alltestdata.TIMEOUTS.MEDIUM);
                    break;
                case "Rollover":
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECT_ROLLOVER);
                    console.log ("Selected option - Rollover");
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);

            }
        }
        catch (error) {
            console.error("Execution failed:", error.message);
        }
    }

    async selectWeatherEvent(selectedOption:string) {
        try {

                await this.waitforElement(this.drivenIncidentDetailsPageObjects.WHATWASWEATHER);
                await this.verifyElementContainsText(this.drivenIncidentDetailsPageObjects.WHATWASWEATHER, insuranceproperties.DRIVEN_WHATWASWEATHER);
               
            switch (selectedOption) {
                 case "Wind":
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.WIND);
                    console.log("Selected option - Wind");
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.BACKBUTTON);
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.BACKBUTTON);
                    break;
                
                case "Hail": 
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.HAIL)
                    console.log("Selected option - Hail");
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.BACKBUTTON);
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.BACKBUTTON);
                    break;
                case "Flood/water":
                    console.log("Selected option - Flood/water");
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.FLOOD_WATER);
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    break;
            }
        }
        catch (error) {
            console.error("Execution failed:", error.message);
        }
    }

    async selectAccidentDetails(selectedOption:string) {

        try {
            await this.waitforElement(this.drivenIncidentDetailsPageObjects.ACCIDENT_DETAILS);
            await this.verifyElementContainsText(this.drivenIncidentDetailsPageObjects.ACCIDENT_DETAILS, insuranceproperties.ACCIDENT_DETAILS);

            await this.waitforElement(this.drivenIncidentDetailsPageObjects.ACCIDENTDETAILS_DROPDOWN);
            await this.clickElement(this.drivenIncidentDetailsPageObjects.ACCIDENTDETAILS_DROPDOWN);
           
            switch (selectedOption) {

                case "Rear-end":
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.REAR_END);
                    console.log("Selected option - Rear-end");
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    await this.clickElement_WaitforNavigation(this.drivenIncidentDetailsPageObjects.NEXTBUTTON, URL_ENDPOINT.DRIVER);
                    break;
                case "Intersection": 
                    console.log("Selected option - Intersection");
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.INTERSECTION);
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    break;
                case "Turning":
                    console.log("Selected option - Turning");
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.TURNING);
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    break;
                
                case "Lane change":
                    console.log("Selected option - Lane change");
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.LANE_CHANGE);
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    break;
                
                case "Hit and run":
                    console.log("Selected option - Hit and run");
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.HIT_RUN);
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    break;
                
               case "Backing": 
                    console.log("Selected option - Backing");
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.BACKING);
                    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    await this.clickElement(this.drivenIncidentDetailsPageObjects.NEXTBUTTON);
                    break;
            }
        }

        catch (error) {
            console.error("Execution failed:", error.message);
        }
    }
}

