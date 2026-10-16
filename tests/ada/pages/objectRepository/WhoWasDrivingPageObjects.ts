export class WhoWasDrivingPageObjects {
    NEXTBUTTON = "//button[@id='next-button']";
    BACKBUTTON = "//button[@id='backButton']";
    TITLETEXT = "//*[@id='content']/div[1]/h5";
    SUBTITLETEXT = "//label[text()='Select the driver']";
    //REPORTERDROPDOWN = "//*[@id='root']/div/div/div[1]/form/div[1]/div/div";
    DRIVERDROPDOWN = "//div[@aria-haspopup='listbox']";
    SELECTFIRSTOPTION = "//ul[@role='listbox']/li[1]";
    SELECTSECONDOPTION = "//*[@id='menu-']/div[3]/ul/li[2]";
    SELECTDRIVERNOTLISTED = "//p[text()='Driver not listed']";
    //SELECTREPORTERNOTSELECTED = "//*[@id='menu-']/div[3]/ul/li[2]";
    NOOFPASSENGERSDROPDOWN = "//div[@aria-haspopup='listbox']";
    NOPASSENGERS = "//ul[@role='menu']//li//p[normalize-space()='No passengers']";
    ONEPASSENGER = "//ul[@role='menu']//li//p[normalize-space()='1 passenger']";
    TWOPASSENGERS = "//ul[@role='menu']//li//p[normalize-space()='2 passengers']";
    THREEPASSENGERS = "//ul[@role='menu']//li//p[normalize-space()='3 passengers']";
    FOURPASSENGERS = "//ul[@role='menu']//li//p[normalize-space()='4 passengers']";
    FIVEORMOREPASSENGERS = "//ul[@role='menu']//li//p[normalize-space()='5 or more passengers']";
  }
    
