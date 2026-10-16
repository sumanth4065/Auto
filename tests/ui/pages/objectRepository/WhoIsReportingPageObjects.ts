export class WhoIsReportingPageObjects {
  NEXTBUTTON = "//*[@id='next-button']";
  BACKBUTTON = "//*[@id='backButton']";
  TITLETEXT = "//h5[contains(text(),'Who is reporting')]";
  SUBTITLETEXT = "//label[text()='Select the reporter']";
  REPORTERDROPDOWN = "//div[@aria-haspopup='listbox']";
  DROPDOWN = "//*[@id='content']/div[1]/form/div[1]/div/div/div";
  SELECTFIRSTOPTION = "//ul[@role='listbox' or @role='menu']/li[1]";
  SELECTSECONDOPTION = "//ul[@role='listbox' or @role='menu']/li[2]";
  SELECTREPORTERNOTLISTED = "//*[contains(text(),'Reporter not listed')]";
  NEWREPORTERTITLE ="//h5[contains(text(),'Tell us who is reporting the claim')]";
  LBLFIRSTNAME ="//label[contains(text(),'First name')]";
  LBLLASTNAME = "//label[contains(text(),'Last name')]"
  STEPINFO ="//p[contains(text(),'Step')]";
  NAVIGATIONMENU="//button[@aria-label='Open navigation menu']"
  FIRSTNAME = "//input[@id='firstName']";
  LASTNAME="//input[@id='lastName']";
  CLAIMSHELPMESSAGE="//p[contains(text(),'how to answer something')]"
  BTNCOMMONQUESTION="//button[contains(text(),'Common questions')]";
  CALL = "//a[contains(text(),'Call')]"

}
