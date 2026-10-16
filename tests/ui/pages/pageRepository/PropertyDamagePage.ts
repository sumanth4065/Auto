import { expect, Locator, Page, BrowserContext } from '@playwright/test';
import { PropertyDamagePageObjects } from '../objectRepository/PropertyDamagePageObjects';
import { TestBase } from '../../lib/TestBase';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';


export class PropertyDamagePage extends TestBase {
    constructor(page: Page) {
        super(page);
    }

    propertyDamagePageObjects = new PropertyDamagePageObjects();

    async efvalidatePageTitle() {

        const title = await this.page.title();
        console.log(title);

    }
    async efConfirmAndNavigatetoReviewPage(poption: string) {
        // navigate to propertypersonal page
        await this.waitforElement(this.propertyDamagePageObjects.PROPERTYDMGHDR);
        await this.verifyElementContainsText(this.propertyDamagePageObjects.PROPERTYDMGHDR, "In addition to your vehicle damage, was there any other property damage (poles, signs, fences, buildings, etc.)");
       console.log("verified heaer addition details page "+ "passed opition = "+poption)
        if (poption === 'Yes' || poption === 'YES') {
            console.log("Select Yes to Additional property damage");
            // Force click the YES radio button
            await this.page.locator(this.propertyDamagePageObjects.YESBTN).click({ force: true });
        }
        else if (poption === 'No' || poption === 'NO') {
            console.log("Select No to Additional property damage");
            // Force click the NO radio button
            await this.page.locator(this.propertyDamagePageObjects.NOBTN).click({ force: true });
        }
       
        // Wait a bit for the selection to register, then click next button
        await this.page.waitForTimeout(1000);
        console.log("About to click next button for property damage page");
        
        // Verify button is visible and enabled
        await this.verifyElementVisible(this.propertyDamagePageObjects.NEXTBTN);
        console.log("Next button is visible");
        
        // Use longer timeout for navigation
        await Promise.all([
            this.page.waitForNavigation({ url: URL_ENDPOINT.ACCIDENT_REVIEW, timeout: 15000 }),
            this.page.locator(this.propertyDamagePageObjects.NEXTBTN).click({ force: true }),
        ]).catch(err => {
            console.error("Navigation error:", err.message);
            throw err;
        });
        console.log("Successfully navigated to accident review");

    }

}