import { expect, Page } from '@playwright/test';
import { TestBase } from '../../lib/TestBase';
import { WhereAccidentPageObjects } from '../objectRepository/WhereAccidentPageObjects';
const commonfun = require('../../utilities/CommonFunctions');
import insuranceproperties from '../../testdata/insuranceproperties';

export class WhereAccidentPage extends TestBase {
  constructor(page: Page) {
    super(page);
  }

  whereAccidentPageObjects = new WhereAccidentPageObjects();



  async efValidateTitle() {
      await expect(this.page).toHaveTitle(insuranceproperties.PAGETITLE);

  }
  async efValidateWhereAccidentPagePageDisplay() {

    await this.verifyElementContainsText(this.whereAccidentPageObjects.TITLETEXT, insuranceproperties.WHEREACCIDENTPAGETITLETEXT);
    await this.verifyElementContainsText(this.whereAccidentPageObjects.STATETEXT, insuranceproperties.STATE);
    await this.verifyElementContainsText(this.whereAccidentPageObjects.STREET, insuranceproperties.STREET);
    await this.verifyElementContainsText(this.whereAccidentPageObjects.ZIPCODE, insuranceproperties.ZIPCODE);
    await this.verifyElementContainsText(this.whereAccidentPageObjects.ADDITIONALDESCRIPTION, insuranceproperties.ADDITIONALDESCRIPTION);
    await this.verifyElementDisabled(this.whereAccidentPageObjects.NEXTBUTTON);
    await this.verifyElementVisible(this.whereAccidentPageObjects.COMMONQUESTIONTEXT);
    await this.clickElement(this.whereAccidentPageObjects.COMMONQUESTIONTEXT);
    await this.verifyElementVisible(this.whereAccidentPageObjects.COMMONCLOSEBUTTON);
    await this.verifyElementContainsText(this.whereAccidentPageObjects.COMMONQUESTIONTITLE,insuranceproperties.COMMONQUESTIONTITLETEXT);
    await this.clickElement(this.whereAccidentPageObjects.COMMONCLOSEBUTTON);
    await this.verifyElementVisible(this.whereAccidentPageObjects.BACKBUTTON);
  }

  async efNavigatetoCreateClaimTransitionPage() {

    await this.enterText(this.whereAccidentPageObjects.STREET, insuranceproperties.WHEREACCIDENTPAGESTREETINPUT);
    await this.enterText(this.whereAccidentPageObjects.CITYINPUT, insuranceproperties.WHEREACCIDENTPAGECITYTEXT);
    await this.enterText(this.whereAccidentPageObjects.STATEDROPDOWN, insuranceproperties.WHEREACCIDENTPAGESTATETEXT);
    await this.enterText(this.whereAccidentPageObjects.ZIPCODE, insuranceproperties.WHEREACCIDENTZIPCODETEXT);
    await this.clickElement(this.whereAccidentPageObjects.NEXTBUTTON);

  }
}