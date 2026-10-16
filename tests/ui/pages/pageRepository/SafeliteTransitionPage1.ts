import { expect, Locator, Page, BrowserContext } from '@playwright/test';
import { TowedInfoPageObjects } from '../objectRepository/TowedInfoPageObjects';
import { TestBase } from '../../lib/TestBase';
import insurancetestdata from '../../testdata/insuranceproperties';
import testdata from '../../testdata/alltestdata';
import { SafeliteTransitionPageObjects } from '../objectRepository/SafeliteTransitionPageObjects1';
import alltestdata from '../../testdata/alltestdata';


export class SafeliteTransitionPage extends TestBase {
    constructor(page: Page) {
        super(page);
    }
    safeliteTransitionPageObjects = new SafeliteTransitionPageObjects();


    async efEnterDataAndNavigatetoSafelitePage(context) {
        await this.waitforElement(this.safeliteTransitionPageObjects.SAFELITELINKHDR);
        await this.verifyElementContainsText(this.safeliteTransitionPageObjects.SAFELITELINKHDR, alltestdata.SAFELITETRANSITIONHDR);
        await this.verifyElementContainsText(this.safeliteTransitionPageObjects.SAFELITEMSGHDR,alltestdata.SAFELITEHRDMESSAGE)
        await this.verifyElementVisible(this.safeliteTransitionPageObjects.CONTINUEBTN);
        const oldUrl = this.page.url();
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'load' }),
            this.page.click(this.safeliteTransitionPageObjects.CONTINUEBTN),
          ]);
          const newUrl = this.page.url();

  
  if (newUrl === oldUrl) {
    throw new Error(`Navigation failed.`);
  }

  expect(newUrl).toContain('https://appuat1.ace.aaa.com/insurance/auto/file-a-claim/safeliteredirect-continue');
  console.log(`✅ Redirected to Safelite` );
}  

    }
