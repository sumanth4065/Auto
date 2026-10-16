export class WhereWhenAccidentPageObjects {
    NEXTBUTTON = "//button[@id='next-button']";
    STATETEXT = "//label[text()='State']";
    TIMETEXT = "//label[text()='Approximate time of the incident']";
    DATETEXT = "//label[text()='Date of the incident']";
    CITYTEXT = "//label[text()='City']";
    TITLETEXT = "//h5[contains(text(),'When did the incident happen?')]";
    STATEDROPDOWN="//*[@aria-haspopup='listbox']";
    CASTATEVALUE="//li/div/p[text()='CA']";
    DATEINPUT = "//input[@name='lossDate']";
    TIMEINPUT = "//input[@name='lossTime']";
    CITYINPUT = "//input[@name='city']";
    STREETINPUT = "//input[@name='street']";
    STREETTEXT = "//label[text()='Street']";
    STATETINPUT = "//input[@name='state']";
    ZIPCODEINPUT = "//input[@name='zipCode']";
    ZIPCODETEXT = "//label[text()='ZIP code (optional)']";
    WHO_IS_REPORTING_HEADER = "//h5[contains(text(),'Who is reporting')]";
    OK_BUTTON = "button:has-text('OK')";
    DUPLICATE_POPUP = "text=/We found an existing claim/i";
    CLOSE_BUTTON = "button:has-text('Close'), button[aria-label='Close']";
}
