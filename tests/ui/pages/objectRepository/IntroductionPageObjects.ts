export class IntroductionPageObjects {
    NEXTBUTTON = "//button[@id='next-button']";
    BACKBUTTON = "//button[@id='backButton']";
    TITLETEXT = "//h5[contains(text(),'AAA ')]";
    FIRSTNAME = "//input[@id='first-name']";
    LASTNAME = "//input[@id='last-name']";
    POLICYNUMBER = "//input[@id='policy-number']";
    ZIPCODE = "(//input[@id='zip-code'])[1]";
    zipCodeField = "#zipCode";
    goButton = "#submitZip";
    CANCELLEDMESSAGE="//span[1]/span[2]";
    INVALIDDATAMESSAGE="//p[contains(text(),'The information entered does not match our records.')]";
    CLOSEPOPUP="//button[@data-testid='cancel-button']"
  }
    //(//input[@id='zip-code'])[1]