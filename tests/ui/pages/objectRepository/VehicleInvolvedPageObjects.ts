export class VehicleInvolvedPageObjects {
    NEXTBUTTON = "//button[@id='next-button']";
    BACKBUTTON = "//button[@id='backButton']";
    TITLETEXT = "//h5[contains(text(),'vehicle was involved')]";
    SUBTEXT = "//label[text()='Select Vehicle']";
    VEHICLEROPDOWN = "//div[@aria-haspopup='listbox']";
    SELECTFIRSTOPTION = "//ul[@role='listbox' or @role='menu']//li[1]";
    SELECTVEHICLENOTLISTED = "//*[contains(text(),'Vehicle not listed')]";
  }