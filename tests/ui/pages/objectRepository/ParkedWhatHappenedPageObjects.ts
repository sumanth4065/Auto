export class ParkedWhatHappenedPageObjects {
    PARKEDWHATHAPPENEDHDR = "//h5[contains(text(),'What happened to the vehicle while it was parked')]";
    WHATHAPPENEDSELECT = "//div[@id='select-vehicle']/label";
    WHATHAPPENDDROPDOWN="//div[@aria-haspopup='listbox']";
    HITBYANOTHERCAR = "//p[contains(text(),'Hit by another vehicle')]";
    ROLLEDAWAY = "//p[contains(text(),'Rolled away')]";
    SRUCKBYFALLFLYOBJECT = "//p[contains(text(),'flying')]";
    VANDALIZED = "//p[contains(text(),'Vandalized')]";
    STOLEN = "//p[contains(text(),'Stolen')]";
    INVOLVEINFIRE = "//p[contains(text(),'Involved in a fire')]";
    WEATHERDAMAGE = "//p[contains(text(),'Damaged by weather')]";
    OTHER = "//p[contains(text(),'Other')]";
    NEXTBTN = "//button[@id='next-button']";

}