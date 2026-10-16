export class DrivenIncidentDetailsPageObjects {
    NEXTBUTTON = "//button[@id='next-button']";
    BACKBUTTON = "//button[@id='backButton']"; 
    TITLETEXT = "//*[@id='content']/div[1]/h5";
    SUBTITLETEXT = "//label[text()='Incident type']";

    // Incident Type drop down and its options
    INCIDENTDROPDOWN = "//div[@aria-haspopup='listbox']";
    SELECT_IMPACT_OTHER_VEHCICLE = "//p[contains(text(),'Impact with other vehicle(s)')]"; 
    SELECT_IMPACT_ANIMAL = "//p[contains(text(),'Impact with an animal')]";
    SELECT_IMPACT_FIXED_OBJ = "//p[contains(text(),'Impact with a fixed object or structure')]";
    SELECT_IMPACT_CYCLIST = "//p[contains(text(),'Impact with a pedestrian or cyclist')]";
    SELECT_STRUCK_OBJECT = "//p[contains(text(),'Struck by a falling or flying object')]";
    SELECT_DAMAGE_WEATHER = "//p[contains(text(),'Damaged by weather')]";
    SELECT_ROLLOVER = "//p[contains(text(),'Rollover')]";

    //Accident details
    ACCIDENT_DETAILS = "//label[text()='Accident details']";
    ACCIDENTDETAILS_DROPDOWN = "//div[text()='Select one']";
    REAR_END = "//P[text()='Rear-end']";
    INTERSECTION= "//P[text()='Intersection']";
    TURNING ="//P[text()='Turning']";
    LANE_CHANGE = "//P[text()='Lane change']";
    HIT_RUN = "//P[text()='Hit and run']";
    BACKING = "//P[text()='Backing']";

    //Weather event drop down options
    WHATWASWEATHER = "//h6[text()='What was the weather event?']";
    PARKED_WHATWASWEATHER = "//p[text()='What was the weather event?']";
    WIND = "//p[text()='Wind']";
    HAIL = "//p[text()='Hail']";
    FLOOD_WATER = "//p[text()='Flood/water']";

  }
    