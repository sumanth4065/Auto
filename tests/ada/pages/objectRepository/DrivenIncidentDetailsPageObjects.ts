export class DrivenIncidentDetailsPageObjects {
  NEXTBUTTON = "//button[@id='next-button']";
  BACKBUTTON = "//button[@id='backButton']";
  TITLETEXT = "//*[@id='content']/div[1]/h5";
  SUBTITLETEXT = "//label[text()='Select what happened']";
  INCIDENTDROPDOWN = "//div[@aria-haspopup='listbox']";
  SELECTFIRSTOPTION = "//p[contains(text(),'Impact with other vehicle(s)')]"; 
  SELECTSECONDOPTION = "//p[contains(text(),'Impact with an animal')]";
  SELECTTHIRDDOPTION = "//p[contains(text(),'Impact with a fixed object or structure')]";
  SELECTFOURTHOPTION = "//p[contains(text(),'Impact with a pedestrian or cyclist')]";
  SELECTFIFTHOPTION = "//p[contains(text(),'Struck by a falling or flying object')]";
  SELECTSIXTHOPTION = "//p[contains(text(),'Damaged by weather')]";
  SELECTSEVENTHOPTION = "//p[contains(text(),'Rollover')]";
  ACCIDENTDETAILSDROPDOWN = "(//div[@aria-haspopup='listbox'])[2]";
  ACCIDENTDETAILSSELECTFIRSTOPTION = "//p[contains(text(),'Intersection')]"; 
  ACCIDENTDETAILSSELECTSECONDOPTION = "//p[contains(text(),'Turning')]";
  ACCIDENTDETAILSSELECTTHIRDDOPTION = "//p[contains(text(),'Lane change')]";
  ACCIDENTDETAILSSELECTFOURTHOPTION = "//p[contains(text(),'Hit and run')]";
  ACCIDENTDETAILSSELECTFIFTHOPTION = "//p[contains(text(),'Backing')]";
  WEATHEREVENTFIRSTOPTION = "//p[text()='Wind']";
  WEATHEREVENTSECONOPTION = "//p[text()='Hail']";
  WEATHEREVENTTHIRDOPTION = "//p[text()='Flood/water']"
}
    