import { expect, Locator, Page, BrowserContext } from '@playwright/test';
import { VehicleDamagebyWeatherPageObjects } from '../objectRepository/VehicleDamagebyWeatherPageObjects';
import { TestBase } from '../../lib/TestBase';
import insurancetestdata from '../../testdata/insuranceproperties';
import testdata from '../../testdata/alltestdata';
import { FULL_URL_PATTERNS } from '../../testdata/urlEndpoints';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';

export class VehicleDamagebyWeatherPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  vehicleDamagebyWeatherPageObjects = new VehicleDamagebyWeatherPageObjects();

  async efvalidatePageTitle() {
    const title = await this.page.title();
    console.log(title);
  }
  async efConfirmAndNavigatetoVehicleInvolvedPage(poption: string) {
    // navigate to propertypersonal page
    await this.waitforElement(this.vehicleDamagebyWeatherPageObjects.TITLETEXT);
    await this.verifyElementContainsText(
      this.vehicleDamagebyWeatherPageObjects.TITLETEXT,
      EXPECTED_TEXTS.VEHICLE_DAMAGE_WEATHER_TITLE
    );
    await this.clickElement(this.vehicleDamagebyWeatherPageObjects.WHATHAPPENDDROPDOWN);

    switch (poption) {
      case 'Wind':
        console.log('Selected option Wind');
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.WIND);
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.NEXTBUTTON);
        break;

      case 'Tornado':
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.TORNADO);
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.NEXTBUTTON);
        break;

      case 'Hail':
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.HAIL);
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.NEXTBUTTON);
        break;

      case 'Flood':
        console.log('Selected option Flood');
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.FLOOD);
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.NEXTBUTTON);
        break;

      case 'Earthquake':
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.EARTHQUAKE);
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.NEXTBUTTON);
        break;

      case 'Other':
        console.log('Selected option Other');
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.OTHER);
        await this.clickElement(this.vehicleDamagebyWeatherPageObjects.NEXTBUTTON);
        break;
    }

    await this.page.waitForURL(FULL_URL_PATTERNS.AUTO_VEHICLES_INVOLVED_NUMBER);
  }
}