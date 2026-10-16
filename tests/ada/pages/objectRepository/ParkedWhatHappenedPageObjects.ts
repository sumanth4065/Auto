export class ParkedWhatHappenedPageObjects {
    PARKEDWHATHAPPENEDHDR = "//h5[contains(text(),'What happened to the car while it was parked')]";
    WHATHAPPENEDSELECT = "//div[@id='select-vehicle']/label";
    WHATHAPPENDDROPDOWN="//div[@aria-haspopup='listbox']";
    HITBYANOTHERCAR = "//li[text()='Hit by another vehicle']";
    ROLLEDAWAY = "//li[@value='rollawaycoll']";
    SRUCKBYFALLFLYOBJECT = "//li[@value='flyingcomp']";
    VANDALIZED = "//li[text()='Vandalized']";
    STOLEN = "//li[@value='totaltheftcomp']";
    INVOLVEINFIRE = "//li[text()='Involved in a fire']";
    WEATHERDAMAGE = "//li[text()='Damaged by weather']";
    OTHER = "//li[@value='othercomp']";
    NEXTBTN = "//button[@id='next-button']";

}