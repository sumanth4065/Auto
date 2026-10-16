import { BrowserContext, Locator, expect, Page,Browser } from "@playwright/test";


export class TestBase {
  page: Page;
//  context : any;
  
  

  constructor(page: Page) {
    this.page = page;
   // this.context=context;

  }

  async navigateToURL(url: string) {
    this.page.goto(url);
  }
  async getCurrentURL() {
    const url = await this.page.url();
    return url;
  }

  async clickElement_SwitchToNewWindow(context: BrowserContext,plocator: string,urlText: string) {
    const [newWindow] = await Promise.all([
      context.waitForEvent("page"),
      await this.page.click(plocator),
    ]);
    await newWindow.waitForLoadState("load");
    const url1 = await newWindow.url();
    await expect(url1).toContain(urlText);
    console.log(`Verify New URL to be ${urlText}`);
    this.page = newWindow;
    return newWindow;
  }

  async validatePageTitle(ptitle: string) {
    const title = await this.page.title();
    expect(title).toBe(ptitle);
  }

  async waitForElementAttached(plocator: string) {
    await this.page.waitForSelector(plocator);
    //await this.page.waitForSelector('text=Sign in',{state:'visible'});
  }

  async clickElement_WaitforNavigation(plocator: string, purl: string) {
    await Promise.all([
      // It is important to call waitForNavigation before click to set up waiting.
      this.page.waitForNavigation({ url: `**/${purl}` }),
      // Triggers a navigation with a script redirect.
      this.page.locator(plocator).click(),
      this.page.waitForTimeout(500)
    ]);
  }
  async clickElement_ValidateNewWindAndClose(plocator: string, purl: string,context:BrowserContext) {
    // Get page after a specific action (e.g. clicking a link)
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        this.page.locator(plocator).click(),
      ])
      await newPage.waitForLoadState("load");
      const url1 = await newPage.url();
      await newPage.close();
      
  }

  async clickElement_HandlePopUP(plocator: string){
    const [popup] = await Promise.all([
      // It is important to call waitForEvent before click to set up waiting.
      this.page.waitForEvent('popup'),
      // Opens popup.
      this.page.locator(plocator).click(),
    ]);
    await popup.waitForLoadState();
    console.log(await popup.title());
  }

  async navigateToParentWindow()
  {
    await this.page.bringToFront();
  }
  
  async clickElement1(plocator: string) {
    const elem=await this.page.waitForSelector(plocator);
    await elem.scrollIntoViewIfNeeded({timeout:6000});
   // await this.waitForElementAttached(plocator);
    //await this.page.locator(plocator).click();
    //console.log(this.page.locator(plocator));
   // await this.page.click(plocator);
 
      const textValue = await elem.textContent();
      console.log(textValue);
        await elem.click();
        console.log("after click");
  }
  async clickElement(plocator: string) {
    await this.waitForElementAttached(plocator);
    await this.page.click(plocator);
  }

  async enterText(plocator: string, ptext: string) {
    await this.page.locator(plocator).type(ptext);
  }

  async getElementText(plocator: string) {
    const eletext = await this.page.locator(plocator).innerText();
    return eletext;
  }
  async verifyElementText(plocator: string, ptext: string) {
    //const textValue = await this.page.textContent(plocator);
    const textValue = await this.page.locator(plocator).innerText();
    expect(textValue.trim()).toBe(ptext);
  }

  async verifyElementContainsText(plocator: string, ptext: string) {
    await this.waitForElementAttached(plocator);
    const elementlocator = await this.page.locator(plocator);
    await expect(elementlocator).toBeVisible();
    await expect(elementlocator).toContainText(ptext);
  }

  async verifyElementVisible(plocator: string) {
    const elementlocator = await this.page.locator(plocator);
    await expect(elementlocator).toBeVisible();
  }

  async verifyElementEnabled(plocator: string) {
    const elementlocator = await this.page.locator(plocator);
    await expect(elementlocator).toBeEnabled();
  }

  async verifyElementDisabled(plocator: string) {
    const elementlocator = await this.page.locator(plocator);
    await expect(elementlocator).toBeDisabled();
  }
  async verifyElementNotVisible(plocator: string) {
    const elementlocator = await this.page.locator(plocator);
    await expect(elementlocator).not.toBeVisible();
  }
  
  async waitforElement(plocator: string) {
    await this.page.locator(plocator).waitFor();
  }

  async focusAndClickElement(plocator: string) {
    //await this.waitForElementAttached(plocator);
    //console.log(plocator);
    const elem=await this.page.locator(plocator);
    await elem.scrollIntoViewIfNeeded();
    await elem.focus();
    await this.page.locator(plocator).click({ force: true });
  }

  async clickLink_ScrollDownPDF(plocator: string,context:BrowserContext) {
    await this.page.click(plocator);
    const [newPage] = await Promise.all([
        context.waitForEvent("page"),
    ]);
    this.page = newPage;
    await newPage.waitForLoadState("load");
    const newPageUrl = await newPage.url();
   // console.log(`Verified New URL: ${newPageUrl}`);
    await newPage.waitForTimeout(10000);
    await newPage.evaluate(() => {
      const documentHeight = document.body.scrollHeight;
      window.scrollTo(0, documentHeight);
  });
  await newPage.waitForLoadState('networkidle');

  // Get the PDF URL
  const pdfUrl = await newPage.evaluate(() => {
    // Assuming the PDF is embedded in an iframe
    const iframe = document.querySelector('iframe');
    return iframe?.getAttribute('src');
  });
  if (pdfUrl) {

    await newPage.goto(pdfUrl);

    // Set the download path
    const downloadPath = '/path/to/save/pdf/';

    // Wait for download to finish
    await newPage.waitForDownload();

    // Save the downloaded PDF
    await newPage.pdf({ path: downloadPath });

    console.log('PDF downloaded successfully.');
  } else {
    console.error('PDF URL not found.');
  }

}
}
