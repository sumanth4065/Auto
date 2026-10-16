import { BrowserContext, Locator, expect, Page,Browser } from "@playwright/test";

export class TestBase {
  page: Page;
  
  

  constructor(page: Page) {
    this.page = page;

  }

  async navigateToURL(url: string) {
    try {
      await this.page.goto(url);
      console.log(`Successfully navigated to URL: ${url}`);
    } catch (error) {
      await this.handleMethodError(error, 'navigateToURL', url);
    }
  }

  async getCurrentURL() {
    try {
      const url = await this.page.url();
      console.log(`Successfully retrieved current URL: ${url}`);
      return url;
    } catch (error) {
      await this.handleMethodError(error, 'getCurrentURL');
    }
  }

  async clickElement_SwitchToNewWindow(context: BrowserContext,plocator: string,urlText: string) {
    try {
      const [newWindow] = await Promise.all([
        context.waitForEvent("page"),
        this.page.click(plocator),
      ]);
      await newWindow.waitForLoadState("load");
      const url1 = await newWindow.url();
      await expect(url1).toContain(urlText);
      console.log(`Successfully switched to new window. Verified URL contains: ${urlText}`);
      this.page = newWindow;
      return newWindow;
    } catch (error) {
      await this.handleMethodError(error, 'clickElement_SwitchToNewWindow', undefined, plocator);
    }
  }

  async validatePageTitle(ptitle: string) {
    try {
      const title = await this.page.title();
      expect(title).toBe(ptitle);
      console.log(`Successfully validated page title: ${ptitle}`);
    } catch (error) {
      await this.handleMethodError(error, 'validatePageTitle', `Expected: "${ptitle}"`);
    }
  }

  async waitForElementAttached(plocator: string) {
    try {
      await this.page.waitForSelector(plocator);
      console.log(`Successfully waited for element: ${plocator}`);
    } catch (error) {
      await this.handleMethodError(error, 'waitForElementAttached', undefined, plocator);
    }
  }

  async clickElement_WaitforNavigation(plocator: string, purl: string) {
    try {
      if (purl && purl.trim() !== '') {
        // Wait for specific URL pattern - use **/*/ to match any path depth
        await Promise.all([
          this.page.waitForNavigation({ url: `**/*/${purl}` }),
          this.page.locator(plocator).click(),
        ]);
        console.log(`Successfully clicked element and navigated to: ${purl}`);
      } else {
        // If no URL pattern, just click and wait for load
        await this.page.locator(plocator).click();
        await this.page.waitForLoadState('networkidle');
        console.log(`Successfully clicked element and waited for network idle. Locator: ${plocator}`);
      }
    } catch (error) {
      await this.handleMethodError(error, 'clickElement_WaitforNavigation', undefined, plocator);
    }
  }
async clickAndWaitForDOMLoad(plocator: string, purl: string)
{
  try {
    const [response] = await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }), // The promise resolves after navigation has finished
      this.page.locator(plocator).click(), // Clicking the link will indirectly cause a navigation
    ]);
    await this.page.waitForLoadState('domcontentloaded');
    console.log(`Successfully clicked element and waited for DOM content loaded. Locator: ${plocator}`);
  } catch (error) {
    await this.handleMethodError(error, 'clickAndWaitForDOMLoad', undefined, plocator);
  }
}

  async clickElement_ValidateNewWindAndClose(plocator: string, purl: string, context: BrowserContext) {
    try {
      // Get page after a specific action (e.g. clicking a link)
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        this.page.locator(plocator).click(),
      ])
      await newPage.waitForLoadState("load");
      const url1 = await newPage.url();
      console.log(`Successfully validated new window URL: ${url1}`);
      await newPage.close();
      console.log(`Successfully closed new window`);
    } catch (error) {
      await this.handleMethodError(error, 'clickElement_ValidateNewWindAndClose', undefined, plocator);
    }
  }
  async navigateToParentWindow()
  {
    try {
      await this.page.bringToFront();
      console.log(`Successfully brought parent window to front`);
    } catch (error) {
      await this.handleMethodError(error, 'navigateToParentWindow');
    }
  }
  
  
  async clickElement(plocator: string) {
    try {
      await this.waitForElementAttached(plocator);
      await this.page.click(plocator);
      console.log(`Successfully clicked element: ${plocator}`);
    } catch (error) {
      await this.handleMethodError(error, 'clickElement', undefined, plocator);
    }
  }

  async enterText(plocator: string, ptext: string) {
    try {
      await this.page.locator(plocator).type(ptext, { delay: 20 });
      console.log(`Successfully entered text in element: ${plocator}`);
    } catch (error) {
      await this.handleMethodError(error, 'enterText', undefined, plocator);
    }
  }

  async getElementText(plocator: string) {
    try {
      const eletext = await this.page.locator(plocator).innerText();
      console.log(`Successfully retrieved text from element: ${plocator}`);
      return eletext;
    } catch (error) {
      await this.handleMethodError(error, 'getElementText', undefined, plocator);
    }
  }

  async verifyElementText(plocator: string, ptext: string) {
    try {
      await this.waitForElementAttached(plocator);
      const textValue = await this.page.textContent(plocator);      if (!textValue) {
        throw new Error(`Element text is null or empty. Locator: ${plocator}`);
      }      expect(textValue.trim()).toBe(ptext);
      console.log(`Successfully verified element text: ${ptext}`);
    } catch (error) {
      await this.handleMethodError(error, 'verifyElementText', `Expected: "${ptext}"`, plocator);
    }
  }

  async verifyElementContainsText(plocator: string, ptext: string) {
    try {
      await this.waitForElementAttached(plocator);
      const elementlocator = await this.page.locator(plocator);
      await expect(elementlocator).toBeVisible();
      await expect(elementlocator).toContainText(ptext);
      console.log(`Successfully verified element contains text: ${ptext}`);
    } catch (error) {
      await this.handleMethodError(error, 'verifyElementContainsText', `Expected: "${ptext}"`, plocator);
    }
  }

  async verifyElementVisible(plocator: string) {
    try {
      const elementlocator = await this.page.locator(plocator);
      await expect(elementlocator).toBeVisible();
      console.log(`Successfully verified element is visible: ${plocator}`);
    } catch (error) {
      await this.handleMethodError(error, 'verifyElementVisible', undefined, plocator);
    }
  }

  async verifyElementEnabled(plocator: string) {
    try {
      const elementlocator = await this.page.locator(plocator);
      await expect(elementlocator).toBeEnabled();
      console.log(`Successfully verified element is enabled: ${plocator}`);
    } catch (error) {
      await this.handleMethodError(error, 'verifyElementEnabled', undefined, plocator);
    }
  }
  async verifyElementNotVisible(plocator: string) {
    try {
      const elementlocator = await this.page.locator(plocator);
      await expect(elementlocator).not.toBeVisible();
      console.log(`Successfully verified element is not visible: ${plocator}`);
    } catch (error) {
      await this.handleMethodError(error, 'verifyElementNotVisible', undefined, plocator);
    }
  }

  async waitforElement(plocator: string) {
    try {
      await this.page.locator(plocator).waitFor();
      console.log(`Successfully waited for element: ${plocator}`);
    } catch (error) {
      await this.handleMethodError(error, 'waitforElement', undefined, plocator);
    }
  }

  // Helper method to capture screenshots on error
  private async captureScreenshot(filename: string) {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const screenshotPath = `./test-results/${filename}-${timestamp}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);
    } catch (screenshotError) {
      const errorMsg = screenshotError instanceof Error ? screenshotError.message : String(screenshotError);
      console.error(`Failed to capture screenshot: ${errorMsg}`);
    }
  }

  //Error handler
  private async handleMethodError(error: any, methodName: string, details?: string, locator?: string): Promise<never> {
    const detailMsg = details ? `: ${details}` : '';
    const locatorMsg = locator ? `. Locator: ${locator}` : '';
    console.error(`Failed to ${methodName}${detailMsg}${locatorMsg}`);
    await this.captureScreenshot(`${methodName}-error`);
    return this.handleError(error, methodName, locator);
  }

  // Helper method to identify and log specific error types
  private handleError(error: any, action: string, locator?: string): never {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Identify specific Playwright error types
    if (errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
      console.error(`TIMEOUT ERROR during ${action}`);
      if (locator) console.error(`Element: ${locator}`);
      console.error(`This usually means the element didn't appear within the expected time`);
    } else if (errorMessage.includes('Target page, context or browser has been closed')) {
      console.error(`PAGE CLOSED ERROR during ${action}`);
      console.error(`The browser page/context was unexpectedly closed`);
    } else if (errorMessage.includes('strict mode violation') || errorMessage.includes('multiple elements')) {
      console.error(`STRICT MODE VIOLATION during ${action}`);
      if (locator) console.error(`Locator "${locator}" matched multiple elements`);
      console.error(`Refine your selector to match only one element`);
    } else if (errorMessage.includes('Navigation failed') || errorMessage.includes('net::ERR')) {
      console.error(`NAVIGATION/NETWORK ERROR during ${action}`);
      console.error(`Check network connectivity, URL validity, or server status`);
    } else if (errorMessage.includes('waiting for locator') || errorMessage.includes('element not found')) {
      console.error(`ELEMENT NOT FOUND during ${action}`);
      if (locator) console.error(`Could not find element: ${locator}`);
      console.error(`Verify the selector is correct and element exists in DOM`);
    } else if (errorMessage.includes('expect') || errorMessage.includes('assertion')) {
      console.error(`ASSERTION FAILED during ${action}`);
      console.error(`Expected condition was not met`);
    } else {
      console.error(`UNEXPECTED ERROR during ${action}`);
    }
    
    // Always log the original error message and stack
    console.error(`   Original Error: ${errorMessage}`);
    if (error.stack) {
      console.error(`   Stack Trace: ${error.stack}`);
    }
    throw error; // Re-throw to fail the test
  }
}
