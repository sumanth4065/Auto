import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { ClaimantPassengersPageObjects } from '../objectRepository/ClaimantPassengersPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';
import { URL_ENDPOINT } from '../../testdata/urlEndpoints';

export class ClaimantPassengerPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }

    claimantPassengerPageObjects = new ClaimantPassengersPageObjects();

    
    
    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
    async efvalidatePageAndnavtoClaimantinjured(selectedOption: string){
        await this.verifyElementContainsText(this.claimantPassengerPageObjects.TITLEHDR,insuranceproperties.CLAIMANTPASSENGERPAGETITLE);
        await this.verifyElementVisible(this.claimantPassengerPageObjects.NEXTBTN);
        await this.clickElement(this.claimantPassengerPageObjects.OPENSELECTDROPDOWN)
        switch(selectedOption){
            case "No passengers":
            await this.clickElement(this.claimantPassengerPageObjects.OPTION1);
            await this.clickElement_WaitforNavigation(this.claimantPassengerPageObjects.NEXTBTN, URL_ENDPOINT.CLAIMANT_INJURED);
            break;
        case "1 passenger":
            await this.clickElement(this.claimantPassengerPageObjects.OPTION2);
            await this.clickElement_WaitforNavigation(this.claimantPassengerPageObjects.NEXTBTN, URL_ENDPOINT.CLAIMANT_INJURED);
            break;
        case "2 passengers":
            await this.clickElement(this.claimantPassengerPageObjects.OPTION3);
            await this.clickElement_WaitforNavigation(this.claimantPassengerPageObjects.NEXTBTN, URL_ENDPOINT.CLAIMANT_INJURED);
            break;

        }
    }
}