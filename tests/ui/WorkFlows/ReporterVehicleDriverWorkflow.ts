import { Page } from '@playwright/test';
import { WhoIsReportingPage } from '../pages/pageRepository/WhoIsReportingPage';
import { ContactInformationPage } from '../pages/pageRepository/ContactInformationPage';
import { CarDetailsTransitionPage } from '../pages/pageRepository/CarDetailsTransitionPage';
import { VehicleInvolvedPage } from '../pages/pageRepository/VehicleInvolvedPage';
import { DrivenOrParkedPage } from '../pages/pageRepository/DrivenOrParkedPage';
import { DrivenIncidentDetailsPage } from '../pages/pageRepository/DrivenIncidentDetailsPage';
import { WhoWasDrivingPage } from '../pages/pageRepository/WhoWasDrivingPage';
import { TellUsAboutDriverPage } from '../pages/pageRepository/TellUsAboutDriverPage';
import { VehicleYearMakeModelPage } from '../pages/pageRepository/VehicleYearMakeModelPage';
import { ParkedWhatHappenedPage } from '../pages/pageRepository/ParkedWhatHappenedPage';
import { NumberOfVehiclesInvolvedPage } from '../pages/pageRepository/NumberOfVehiclesInvolvedPage';
import { ClaimType, ReporterType, VehicleStatus, DriverStatus, IncidentType, AccidentDetails } from "../utilities/types"

export class ReporterVehicleDriverWorkflow{
     private page: Page;
     private whoIsReportingPage: WhoIsReportingPage;
     private contactInformationPage: ContactInformationPage;
     private carDetailsTransitionPage: CarDetailsTransitionPage;
     private vehicleInvolvedPage: VehicleInvolvedPage;
     private drivenOrParkedPage: DrivenOrParkedPage
     private drivenIncidentDetailsPage:DrivenIncidentDetailsPage;
     private whoWasDrivingPage:WhoWasDrivingPage
     private tellUsAboutDriverPage:TellUsAboutDriverPage;
     private vehicleYearMakeModelPage:VehicleYearMakeModelPage;
     private parkedWhatHappenedPage:ParkedWhatHappenedPage;
     private numberOfVehiclesInvolvedPage:NumberOfVehiclesInvolvedPage;

     constructor(page: Page) {
            this.page = page;
            this.whoIsReportingPage = new WhoIsReportingPage(page);
            this.contactInformationPage = new ContactInformationPage(page);
            this.carDetailsTransitionPage = new CarDetailsTransitionPage(page);
            this.vehicleInvolvedPage = new VehicleInvolvedPage(page);
            this.drivenOrParkedPage = new DrivenOrParkedPage(page);
            this.drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
            this.whoWasDrivingPage = new WhoWasDrivingPage(page);
            this.tellUsAboutDriverPage = new TellUsAboutDriverPage(page);
            this.vehicleYearMakeModelPage = new VehicleYearMakeModelPage(page);
            this.parkedWhatHappenedPage = new ParkedWhatHappenedPage(page);
            this.numberOfVehiclesInvolvedPage = new NumberOfVehiclesInvolvedPage(page);

     }

     async selectingReporterVehicleDriver(select_reporter, select_vehicle, select_ParkedDriven,select_Incident, selct_AccidentDetails: AccidentDetails | undefined,select_driver ){
        // Selecting the Reporter workflow
		console.log("Navigated to ClaimReporter Page");
        if(select_reporter == ReporterType.REPORTER_NOTLISTED){
		await this.whoIsReportingPage.efValidateTitle();
		await this.whoIsReportingPage.efValidateWhoIsReportingPageDisplay();
		await this.whoIsReportingPage.efNavigatetoContactInfoPage1(ReporterType.REPORTER_NOTLISTED);
		await this.whoIsReportingPage.efValidateAddingNewReporterPage();
		await this.whoIsReportingPage.enteringReporterDetails();
        }
        else{
            await this.whoIsReportingPage.efValidateTitle();
		await this.whoIsReportingPage.efValidateWhoIsReportingPageDisplay();
		await this.whoIsReportingPage.efNavigatetoContactInfoPage1(select_reporter);
        }
		console.log("Navigated to Contact Info Page");
		await this.contactInformationPage.efValidateTitle();
		await this.contactInformationPage.efValidateContactInformationPageDisplay();
		await this.contactInformationPage.efNavigatetoCarDetailsTransitionPage();
		console.log("Navigated to Car Damage Transition Page");
		await this.carDetailsTransitionPage.efValidateTitle();
		await this.carDetailsTransitionPage.efValidateCarDetailsTransitionPageDisplay();
		await this.carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
		console.log("Navigated to carinvolved Page");

        //Selecting the Vehicle InvolvedWorkflow
        if(select_vehicle == VehicleStatus.VEHICLE_NOT_LISTED){
		await this.vehicleInvolvedPage.efValidateTitle();
		await this.vehicleInvolvedPage.efValidateVehicleInvolvedPageDisplay();
		await this.vehicleInvolvedPage.efNavigatetoDrivenOrParked(VehicleStatus.VEHICLE_NOT_LISTED);
        await this.vehicleYearMakeModelPage.efValidateAddingVehiclePage();
        await this.vehicleYearMakeModelPage.enteringVehicleDetails();
        }
        else{
            await this.vehicleInvolvedPage.efValidateTitle();
		await this.vehicleInvolvedPage.efValidateVehicleInvolvedPageDisplay();
		await this.vehicleInvolvedPage.efNavigatetoDrivenOrParked(VehicleStatus.VEHICLE1);
        }
		console.log("Navigated to carkineticstatus Page");
		await this.drivenOrParkedPage.efValidateTitle();
		await this.drivenOrParkedPage.efValidateDrivenOrParkedPageDisplay();
		await this.drivenOrParkedPage.efNavigatetoDrivenOrParked(select_ParkedDriven);
		console.log("Navigated to drivenwhathappened Page");
		await this.drivenIncidentDetailsPage.efValidateTitle();
		await this.drivenIncidentDetailsPage.efValidateDrivenIncidentDetailsPageDisplay();
		await this.drivenIncidentDetailsPage.efNavigatetoWhoWasDriving(select_Incident);
        if(selct_AccidentDetails !== undefined) {
            await this.drivenIncidentDetailsPage.selectAccidentDetails(selct_AccidentDetails);
        }

		console.log("Navigated to Driver Page.. Selected required Driver");
        // Selecting the Driver Workflow
        if(select_driver == DriverStatus.DRIVER_NOTLISTED){
		await this.whoWasDrivingPage.efValidateTitle();
		await this.whoWasDrivingPage.efValidateWhoWasDrivingPageDisplay();
		await this.whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved(DriverStatus.DRIVER_NOTLISTED);
        console.log("Adding new driver as driver is not listd");
            await this.tellUsAboutDriverPage.efValidateTitle();
            await this.tellUsAboutDriverPage.efValidateAddingDriverPage();
            await this.tellUsAboutDriverPage.enteringDriverDetails();
        }
        else{
            console.log("Selected Driver already listed");
            await this.whoWasDrivingPage.efValidateTitle();
		await this.whoWasDrivingPage.efValidateWhoWasDrivingPageDisplay();
		await this.whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved(DriverStatus.DRIVER1);
        }
     }

     async selectingReporterVehicleDriverNonVehicle(select_reporter, select_vehicle, select_Incident, weatherEvent?, select_driver?) {
        console.log("Navigated to ClaimReporter Page");
        if(select_reporter == ReporterType.REPORTER_NOTLISTED){
            await this.whoIsReportingPage.efValidateTitle();
            await this.whoIsReportingPage.efValidateWhoIsReportingPageDisplay();
            await this.whoIsReportingPage.efNavigatetoContactInfoPage1(ReporterType.REPORTER_NOTLISTED);
            await this.whoIsReportingPage.efValidateAddingNewReporterPage();
            await this.whoIsReportingPage.enteringReporterDetails();
        } else {
            await this.whoIsReportingPage.efValidateTitle();
            await this.whoIsReportingPage.efValidateWhoIsReportingPageDisplay();
            await this.whoIsReportingPage.efNavigatetoContactInfoPage1(select_reporter);
        }
        console.log("Navigated to Contact Info Page");
        await this.contactInformationPage.efValidateTitle();
        await this.contactInformationPage.efValidateContactInformationPageDisplay();
        await this.contactInformationPage.efNavigatetoCarDetailsTransitionPage();
        console.log("Navigated to Car Damage Transition Page");
        await this.carDetailsTransitionPage.efValidateTitle();
        await this.carDetailsTransitionPage.efValidateCarDetailsTransitionPageDisplay();
        await this.carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
        console.log("Navigated to carinvolved Page");

        if(select_vehicle == VehicleStatus.VEHICLE_NOT_LISTED){
            await this.vehicleInvolvedPage.efValidateTitle();
            await this.vehicleInvolvedPage.efValidateVehicleInvolvedPageDisplay();
            await this.vehicleInvolvedPage.efNavigatetoDrivenOrParked(VehicleStatus.VEHICLE_NOT_LISTED);
            await this.vehicleYearMakeModelPage.efValidateAddingVehiclePage();
            await this.vehicleYearMakeModelPage.enteringVehicleDetails();
        } else {
            await this.vehicleInvolvedPage.efValidateTitle();
            await this.vehicleInvolvedPage.efValidateVehicleInvolvedPageDisplay();
            await this.vehicleInvolvedPage.efNavigatetoDrivenOrParked(select_vehicle);
        }
        console.log("Navigated to carkineticstatus Page");
        await this.drivenOrParkedPage.efValidateTitle();
        await this.drivenOrParkedPage.efValidateDrivenOrParkedPageDisplay();
        await this.drivenOrParkedPage.efNavigatetoDrivenOrParked("Driven");
        console.log("Navigated to drivenwhathappened Page");
        await this.drivenIncidentDetailsPage.efValidateTitle();
        await this.drivenIncidentDetailsPage.efValidateDrivenIncidentDetailsPageDisplay();
        await this.drivenIncidentDetailsPage.efNavigatetoWhoWasDriving(select_Incident);
        if(weatherEvent) {
            await this.drivenIncidentDetailsPage.selectWeatherEvent(weatherEvent);
        }

        console.log("Navigated to Driver Page.. Selected required Driver");
        if(select_driver == DriverStatus.DRIVER_NOTLISTED){
            await this.whoWasDrivingPage.efValidateTitle();
            await this.whoWasDrivingPage.efValidateWhoWasDrivingPageDisplay();
            await this.whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved(DriverStatus.DRIVER_NOTLISTED);
            console.log("Adding new driver as driver is not listed");
            await this.tellUsAboutDriverPage.efValidateTitle();
            await this.tellUsAboutDriverPage.efValidateAddingDriverPage();
            await this.tellUsAboutDriverPage.enteringDriverDetails();
        } else {
            console.log("Selected Driver already listed");
            await this.whoWasDrivingPage.efValidateTitle();
            await this.whoWasDrivingPage.efValidateWhoWasDrivingPageDisplay();
            await this.whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved(DriverStatus.DRIVER1);
        }
     }

     async selectingReporterVehicleDriverForParked(select_reporter, select_vehicle, parkedIncidentType, weatherEvent?, select_driver?) {
        console.log("Navigated to ClaimReporter Page");
        if(select_reporter == ReporterType.REPORTER_NOTLISTED){
            await this.whoIsReportingPage.efValidateTitle();
            await this.whoIsReportingPage.efValidateWhoIsReportingPageDisplay();
            await this.whoIsReportingPage.efNavigatetoContactInfoPage1(ReporterType.REPORTER_NOTLISTED);
            await this.whoIsReportingPage.efValidateAddingNewReporterPage();
            await this.whoIsReportingPage.enteringReporterDetails();
        } else {
            await this.whoIsReportingPage.efValidateTitle();
            await this.whoIsReportingPage.efValidateWhoIsReportingPageDisplay();
            await this.whoIsReportingPage.efNavigatetoContactInfoPage1(select_reporter);
        }
        console.log("Navigated to Contact Info Page");
        await this.contactInformationPage.efValidateTitle();
        await this.contactInformationPage.efValidateContactInformationPageDisplay();
        await this.contactInformationPage.efNavigatetoCarDetailsTransitionPage();
        console.log("Navigated to Car Damage Transition Page");
        await this.carDetailsTransitionPage.efValidateTitle();
        await this.carDetailsTransitionPage.efValidateCarDetailsTransitionPageDisplay();
        await this.carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
        console.log("Navigated to carinvolved Page");

        if(select_vehicle == VehicleStatus.VEHICLE_NOT_LISTED){
            await this.vehicleInvolvedPage.efValidateTitle();
            await this.vehicleInvolvedPage.efValidateVehicleInvolvedPageDisplay();
            await this.vehicleInvolvedPage.efNavigatetoDrivenOrParked(VehicleStatus.VEHICLE_NOT_LISTED);
            await this.vehicleYearMakeModelPage.efValidateAddingVehiclePage();
            await this.vehicleYearMakeModelPage.enteringVehicleDetails();
        } else {
            await this.vehicleInvolvedPage.efValidateTitle();
            await this.vehicleInvolvedPage.efValidateVehicleInvolvedPageDisplay();
            await this.vehicleInvolvedPage.efNavigatetoDrivenOrParked(select_vehicle);
        }
        console.log("Navigated to carkineticstatus Page");
        await this.drivenOrParkedPage.efValidateTitle();
        await this.drivenOrParkedPage.efValidateDrivenOrParkedPageDisplay();
        console.log("Select Parked Option");
        await this.drivenOrParkedPage.efNavigatetoDrivenOrParked("Parked");
        console.log("Navigated to parkedwhathappened Page");
        await this.parkedWhatHappenedPage.efConfirmAndNavigatetoIncidentDatePage(parkedIncidentType);
        if(weatherEvent) {
            await this.parkedWhatHappenedPage.selectWeatherEvent(weatherEvent);
        }

        // Check if we're already on vehiclesinvolvednumber page (for Vandalized incidents)
        const currentUrl = await this.page.url();
        const onVehicleCountPage = currentUrl.includes('vehiclesinvolvednumber');
        
        if(onVehicleCountPage) {
            console.log("Vandalized incident detected - already on vehicle count page, skipping driver selection");
            return;
        }

        console.log("Navigated to Driver Page.. Selected required Driver");
        if(select_driver == DriverStatus.DRIVER_NOTLISTED){
            await this.whoWasDrivingPage.efValidateTitle();
            await this.whoWasDrivingPage.efValidateWhoWasDrivingPageDisplay();
            await this.whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved(DriverStatus.DRIVER_NOTLISTED);
            console.log("Adding new driver as driver is not listed");
            await this.tellUsAboutDriverPage.efValidateTitle();
            await this.tellUsAboutDriverPage.efValidateAddingDriverPage();
            await this.tellUsAboutDriverPage.enteringDriverDetails();
        } else {
            console.log("Selected Driver already listed");
            await this.whoWasDrivingPage.efValidateTitle();
            await this.whoWasDrivingPage.efValidateWhoWasDrivingPageDisplay();
            await this.whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved(DriverStatus.DRIVER1);
        }
     }
}
