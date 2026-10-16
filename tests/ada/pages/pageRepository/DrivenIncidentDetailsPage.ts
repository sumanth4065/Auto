import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { DrivenIncidentDetailsPageObjects } from '../objectRepository/DrivenIncidentDetailsPageObjects';
import { EXPECTED_TEXTS } from '../../testdata/expectedTexts';
import { URL_ENDPOINTS } from '../../testdata/urlEndpoints';

export class DrivenIncidentDetailsPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  drivenIncidentDetailsPageObjects = new DrivenIncidentDetailsPageObjects();

  async efValidateTitle() {
    await expect(this.page).toHaveTitle(EXPECTED_TEXTS.AUTO_EFNOL_TITLE);
  }

  async efValidateDrivenIncidentDetailsPageDisplay() {
    await this.verifyElementContainsText(
      this.drivenIncidentDetailsPageObjects.TITLETEXT,
      EXPECTED_TEXTS.DRIVEN_WHAT_HAPPENED_TITLE
    );

    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.BACKBUTTON);
    await this.verifyElementVisible(this.drivenIncidentDetailsPageObjects.SUBTITLETEXT);
  }

  async efNavigatetoWhoWasDriving(selectedOption: string, optionalValue: string | null = null) {
    await this.clickElement(this.drivenIncidentDetailsPageObjects.INCIDENTDROPDOWN);

    switch (selectedOption) {
      case 'Impacted with another vehicle':
        await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECTFIRSTOPTION);
        await this.clickElement(this.drivenIncidentDetailsPageObjects.ACCIDENTDETAILSDROPDOWN);

        switch (optionalValue) {
          case 'Intersection':
            await this.clickElement(
              this.drivenIncidentDetailsPageObjects.ACCIDENTDETAILSSELECTFIRSTOPTION
            );
            break;

          case 'Turning':
            await this.clickElement(
              this.drivenIncidentDetailsPageObjects.ACCIDENTDETAILSSELECTSECONDOPTION
            );
            break;

          case 'Lane change':
            await this.clickElement(
              this.drivenIncidentDetailsPageObjects.ACCIDENTDETAILSSELECTTHIRDDOPTION
            );
            break;

          case 'Hit and run':
            await this.clickElement(
              this.drivenIncidentDetailsPageObjects.ACCIDENTDETAILSSELECTFOURTHOPTION
            );
            break;

          case 'Backing':
            await this.clickElement(
              this.drivenIncidentDetailsPageObjects.ACCIDENTDETAILSSELECTFIFTHOPTION
            );
            break;
        }

        await this.clickElement_WaitforNavigation(
          this.drivenIncidentDetailsPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.DRIVER
        );
        break;

      case 'Impacted with an animal':
        await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECTSECONDOPTION);
        await this.clickElement_WaitforNavigation(
          this.drivenIncidentDetailsPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.DRIVER
        );
        break;

      case 'Impacted with a fixed object or structure':
        await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECTTHIRDDOPTION);
        await this.clickElement_WaitforNavigation(
          this.drivenIncidentDetailsPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.DRIVER
        );
        break;

      case 'Impacted with a pedestrian or cyclist':
        await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECTFOURTHOPTION);
        await this.clickElement_WaitforNavigation(
          this.drivenIncidentDetailsPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.DRIVER
        );
        break;

      case 'Struck by a falling or flying object':
        await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECTFIFTHOPTION);
        await this.clickElement_WaitforNavigation(
          this.drivenIncidentDetailsPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.DRIVER
        );
        break;

      case 'Damaged by weather':
        await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECTSIXTHOPTION);

        switch (optionalValue) {
          case 'Wind':
            await this.clickElement(this.drivenIncidentDetailsPageObjects.WEATHEREVENTFIRSTOPTION);
            break;

          case 'Hail':
            await this.clickElement(this.drivenIncidentDetailsPageObjects.WEATHEREVENTSECONOPTION);
            break;

          case 'Flood/water':
            await this.clickElement(this.drivenIncidentDetailsPageObjects.WEATHEREVENTTHIRDOPTION);
            break;
        }

        await this.clickElement_WaitforNavigation(
          this.drivenIncidentDetailsPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.DRIVER
        );
        break;

      case 'Rollover':
        await this.clickElement(this.drivenIncidentDetailsPageObjects.SELECTSEVENTHOPTION);
        await this.clickElement_WaitforNavigation(
          this.drivenIncidentDetailsPageObjects.NEXTBUTTON,
          URL_ENDPOINTS.DRIVER
        );
        break;
    }
  }
}
