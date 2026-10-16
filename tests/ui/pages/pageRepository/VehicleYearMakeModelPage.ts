import { expect,  Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { VehicleYearMakeModelPageObjects } from '../objectRepository/VehicleYearMakeModelPageObjects';
import insuranceproperties from '../../testdata/insuranceproperties';

export class VehicleYearMakeModelPage extends TestBase {
    constructor(page: Page) {
      super(page);
    }
vehicleYearMakeModelPageObjects = new VehicleYearMakeModelPageObjects();

    async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);
  }

    async efValidateAddingVehiclePage() {
      await this.verifyElementVisible(this.vehicleYearMakeModelPageObjects.VEHICLEMAKETITLE);
      await this.verifyElementContainsText(this.vehicleYearMakeModelPageObjects.VEHICLEMAKETITLE, insuranceproperties.VEHICLEMAKETITLE);
      await this.verifyElementVisible(this.vehicleYearMakeModelPageObjects.BACKBUTTON)
      await this.verifyElementVisible(this.vehicleYearMakeModelPageObjects.STEPINFO)
      await this.verifyElementVisible(this.vehicleYearMakeModelPageObjects.NAVIGATIONMENU)
      await this.verifyElementVisible(this.vehicleYearMakeModelPageObjects.LBLYEAR);
      await this.verifyElementVisible(this.vehicleYearMakeModelPageObjects.TXTYEAR);
      await this.verifyElementVisible(this.vehicleYearMakeModelPageObjects.LBLMAKE)
      await this.verifyElementVisible(this.vehicleYearMakeModelPageObjects.TXTMAKE);
      await this.verifyElementVisible(this.vehicleYearMakeModelPageObjects.LBLMODEL)
      await this.verifyElementVisible(this.vehicleYearMakeModelPageObjects.TXTMODEL);
      await this.verifyElementDisabled(this.vehicleYearMakeModelPageObjects.NEXTBUTTON);
      await this.verifyElementVisible(this.vehicleYearMakeModelPageObjects.CLAIMSHELPMESSAGE);
      await this.verifyElementVisible(this.vehicleYearMakeModelPageObjects.CALL);
    }

    async enteringVehicleDetails(){
        await this.enterText(this.vehicleYearMakeModelPageObjects.TXTYEAR, insuranceproperties.YEAR);
        await this.enterText(this.vehicleYearMakeModelPageObjects.TXTMAKE, insuranceproperties.MAKE);
        await this.enterText(this.vehicleYearMakeModelPageObjects.TXTMODEL, insuranceproperties.MODEL);
        await this.clickElement(this.vehicleYearMakeModelPageObjects.NEXTBUTTON);
    }

}