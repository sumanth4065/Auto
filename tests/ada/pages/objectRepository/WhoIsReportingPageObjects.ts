export class WhoIsReportingPageObjects {
  NEXTBUTTON = "//*[@id='next-button']";
  BACKBUTTON = "//*[@id='backButton']";
  TITLETEXT = "//h5[contains(text(),'Who is reporting')]";
  SUBTITLETEXT = "//label[text()='Select the reporter']";
  REPORTERDROPDOWN = "//div[@aria-haspopup='listbox']";
  DROPDOWN = "//*[@id='content']/div[1]/form/div[1]/div/div/div";
  SELECTFIRSTOPTION = "//ul[@role='listbox']/li[1]";
  SELECTSECONDOPTION = "//ul[@role='listbox']/li[2]";
  SELECTREPORTERNOTSELECTED = "//ul[@role='listbox']/li[@data-value='unlistedreporter']";
  //SELECTREPORTERNOTSELECTED = "//*[@id='menu-']/div[3]/ul/li[2]";
}
