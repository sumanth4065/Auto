import { Page } from '@playwright/test';
import { AdditionalDetailsPage } from '../pages/pageRepository/AdditionalDetailsPage';
import { PassengerPage } from '../pages/pageRepository/PassengerPage';
import { AnyoneInjuredPage } from '../pages/pageRepository/AnyoneInjuredPage';
import { WhatHappenedPage } from '../pages/pageRepository/WhatHappenedPage';
import { VehicleTowedPage } from '../pages/pageRepository/VehicleTowedPage';
import { VehicleDamagePage } from '../pages/pageRepository/VehicleDamagePage';
import { NumberOfVehiclesInvolvedPage } from '../pages/pageRepository/NumberOfVehiclesInvolvedPage';
import { OtherPartyPedestrianPage } from '../pages/pageRepository/OtherPartyPedestrianPage';
import { PropertyDamagePage } from '../pages/pageRepository/PropertyDamagePage';
import { OtherPartyWitnessPage } from '../pages/pageRepository/OtherPartyWitnessPage';
import { OtherPartyTransitionPage } from '../pages/pageRepository/OtherPartyTransitionPage';
import { OtherPartyYMMPage } from '../pages/pageRepository/OtherPartyYMMPage';
import { OtherPartyInsurancePage } from '../pages/pageRepository/OtherPartyInsurancePage';
import { OtherPartyDriverPage } from '../pages/pageRepository/OtherPartyDriverPage';
import { OtherPartyAnyoneInjuredPage } from '../pages/pageRepository/OtherPartyAnyoneInjuredPage';
export class AdditionalDetailsWorkflow {
    private page: Page;
    private passengerPage:PassengerPage;
    private anyoneInjuredPage:AnyoneInjuredPage;
    private whatHappenedPage:WhatHappenedPage;
    private vehicleTowedPage:VehicleTowedPage;
    private vehicleDamagePage:VehicleDamagePage;
    private numberOfVehiclesInvolvedPage:NumberOfVehiclesInvolvedPage
    private additionalDetailsPage:AdditionalDetailsPage;
    private otherPartyPedestrianPage:OtherPartyPedestrianPage;
    private otherPartyWitnessPage:OtherPartyWitnessPage;
    private propertyDamagePage:PropertyDamagePage;
    private otherPartyTransitionPage:OtherPartyTransitionPage;
    private otherPartyYMMPage:OtherPartyYMMPage;
    private otherPartyInsurancePage:OtherPartyInsurancePage;
    private otherPartyDriverPage:OtherPartyDriverPage;
    private otherPartyAnyoneInjuredPage:OtherPartyAnyoneInjuredPage;

    constructor(page: Page) {
         this.page = page;
        this.passengerPage = new PassengerPage(page);
        this.anyoneInjuredPage = new AnyoneInjuredPage(page);
        this.whatHappenedPage = new WhatHappenedPage(page);
        this.vehicleTowedPage = new VehicleTowedPage(page);
        this.vehicleDamagePage = new VehicleDamagePage(page);
        this.numberOfVehiclesInvolvedPage = new NumberOfVehiclesInvolvedPage(page);
        this.additionalDetailsPage = new AdditionalDetailsPage(page);
        this.otherPartyPedestrianPage = new OtherPartyPedestrianPage(page);
        this.otherPartyWitnessPage = new OtherPartyWitnessPage(page);
        this.propertyDamagePage = new PropertyDamagePage(page);
        this.otherPartyTransitionPage = new OtherPartyTransitionPage(page);
        this.otherPartyYMMPage = new OtherPartyYMMPage(page);
        this.otherPartyInsurancePage = new OtherPartyInsurancePage(page);
        this.otherPartyDriverPage = new OtherPartyDriverPage(page);
        this.otherPartyAnyoneInjuredPage = new OtherPartyAnyoneInjuredPage(page);
       }

       async submitAdditionalDetails(select_passenger, select_injured, select_towed, select_numberOfVehicles, select_witness,select_PropertyDamage) {
       
        console.log("Navigated to Passenger Page");
		await this.passengerPage.efvalidatePageTitle();
		await this.passengerPage.efverifyPageandNavtoInjuredPage(select_passenger);
		console.log("Navigated to Injured Page");
		await this.anyoneInjuredPage.efValidateTitle();
		await this.anyoneInjuredPage.efValidateAnyoneInjuredPageDisplay();
		await this.anyoneInjuredPage.efNavigatetoWhatHappened(select_injured);
		console.log("Navigated to Additonaldetails Page");
		await this.whatHappenedPage.efValidateTitle();
		await this.whatHappenedPage.efValidateWhatHappenedPageDisplay();
		await this.whatHappenedPage.efNavigatetoVehicleTowedPage();
		console.log("Navigated to Towed Page");
		await this.vehicleTowedPage.efValidateTitle();
		await this.vehicleTowedPage.efValidateVehicelTowedPageDisplay();
		await this.vehicleTowedPage.efNavigatetoVehicleDamage(select_towed);
		console.log("Navigated to VehicleDamage Page");
		await this.vehicleDamagePage.efValidateTitle();
		await this.vehicleDamagePage.efValidateVehicleDamagePageDisplay();
		await this.vehicleDamagePage.efNavigatetoOtherPartyTransitionPage();
		console.log("Navigated to Number Of Vehicles Involved Number Page");
		await this.numberOfVehiclesInvolvedPage.efValidateTitle();
		await this.numberOfVehiclesInvolvedPage.efValidateNumberOfVehiclesInvolvedPageDisplay();
		await this.numberOfVehiclesInvolvedPage.efNavigatetoAnyoneInjured(select_numberOfVehicles);
		console.log("Navigated to additionaldetails Page");
		await this.additionalDetailsPage.efValidateTitle();
		await this.additionalDetailsPage.efValidateAdditionalDetailsPageDisplay();
		console.log("Navigated to pedestrianorcyclistinvolved Page");
		await this.otherPartyPedestrianPage.efValidateTitle();
		await this.otherPartyPedestrianPage.efValidateOtherPartyPedestrianPageDisplay();
		await this.otherPartyPedestrianPage.efNavigatetoOtherPartyWitnessPage();
		console.log("Navigated to witnessinfo Page");
		await this.otherPartyWitnessPage.efValidateTitle();
		await this.otherPartyWitnessPage.efValidateOtherPartyWitnessPageDisplay();
		await this.otherPartyWitnessPage.efNavigatetoReviewClaimPage(select_witness);
		console.log("Navigated to additionalpropertydamage Page");
		await this.propertyDamagePage.efConfirmAndNavigatetoReviewPage(select_PropertyDamage);
    }

    async submitAdditionalDetailsWithOtherParty(select_passenger, select_injured, select_towed, select_numberOfVehicles, select_pedestrianType, select_witness, select_PropertyDamage, select_otherPartyInjured) {
        // Check if we're already on NumberOfVehiclesInvolvedPage (for pedestrian/cyclist incidents)
        const currentUrl = await this.page.url();
        const onVehicleCountPage = currentUrl.includes('vehiclesinvolvednumber');

        if(!onVehicleCountPage) {
            // Normal flow - start from passenger page
            console.log("Navigated to Passenger Page");
            await this.passengerPage.efvalidatePageTitle();
            await this.passengerPage.efverifyPageandNavtoInjuredPage(select_passenger);
            console.log("Navigated to Injured Page");
            await this.anyoneInjuredPage.efValidateTitle();
            await this.anyoneInjuredPage.efValidateAnyoneInjuredPageDisplay();
            await this.anyoneInjuredPage.efNavigatetoWhatHappened(select_injured);
            console.log("Navigated to Additionaldetails Page");
            await this.whatHappenedPage.efValidateTitle();
            await this.whatHappenedPage.efValidateWhatHappenedPageDisplay();
            await this.whatHappenedPage.efNavigatetoVehicleTowedPage();
            console.log("Navigated to Towed Page");
            await this.vehicleTowedPage.efValidateTitle();
            await this.vehicleTowedPage.efValidateVehicelTowedPageDisplay();
            await this.vehicleTowedPage.efNavigatetoVehicleDamage(select_towed);
            console.log("Navigated to VehicleDamage Page");
            await this.vehicleDamagePage.efValidateTitle();
            await this.vehicleDamagePage.efValidateVehicleDamagePageDisplay();
            await this.vehicleDamagePage.efNavigatetoOtherPartyTransitionPage();
        } else {
            console.log("Already on NumberOfVehiclesInvolvedPage (pedestrian/cyclist flow)");
        }

        console.log("Navigated to Number Of Vehicles Involved Number Page");
        await this.numberOfVehiclesInvolvedPage.efValidateTitle();
        await this.numberOfVehiclesInvolvedPage.efValidateNumberOfVehiclesInvolvedPageDisplay();
        await this.numberOfVehiclesInvolvedPage.efNavigatetoAnyoneInjured(select_numberOfVehicles);

        if(select_numberOfVehicles === "1 Vehicle") {
            console.log("Navigated to otherpartyinformationtransition Page");
            await this.otherPartyTransitionPage.efValidateTitle();
            await this.otherPartyTransitionPage.efValidateOtherPartyTransitionPageDisplay();
            await this.otherPartyTransitionPage.efNavigatetoOtherPartyYMMPage(select_numberOfVehicles);
            console.log("Navigated to yearmakemodel Page");
            await this.otherPartyYMMPage.efValidateTitle();
            await this.otherPartyYMMPage.efValidateOtherPartyYMMPageDisplay();
            await this.otherPartyYMMPage.efNavigatetoOtehrPartyInsurancePage();
            console.log("Navigated to otherpartyinsuranceinfo Page");
            await this.otherPartyInsurancePage.efValidateTitle();
            await this.otherPartyInsurancePage.efValidateOtherPartyInsurancePageDisplay();
            await this.otherPartyInsurancePage.efNavigatetoOtherPartyDriverPage();
            console.log("Navigated to otherpartyvehicledriverinfo Page");
            await this.otherPartyDriverPage.efValidateTitle();
            await this.otherPartyDriverPage.efValidateOtherPartyDriverPageDisplay();
            await this.otherPartyDriverPage.efNavigatetoOtherPartyAnyoneInjuredPage();
            console.log("Navigated to otherpartypassengers Page");
            await this.passengerPage.efvalidatePageTitle();
            await this.passengerPage.efverifyOtherPartyPassengerPageandNavtoInjuredPage("No Passengers");
            console.log("Navigated to otherpartyinjuredcheck Page");
            await this.otherPartyAnyoneInjuredPage.efValidateTitle();
            await this.otherPartyAnyoneInjuredPage.efValidateOtherPartyAnyoneInjuredPageDisplay();
            await this.otherPartyAnyoneInjuredPage.efNavigatetoOtherPartyPedestrian(select_otherPartyInjured);
        }

        console.log("Navigated to additionaldetails Page");
        await this.additionalDetailsPage.efValidateTitle();
        await this.additionalDetailsPage.efValidateAdditionalDetailsPageDisplay();
        console.log("Navigated to pedestrianorcyclistinvolved Page");
        await this.otherPartyPedestrianPage.efValidateTitle();
        await this.otherPartyPedestrianPage.efValidateOtherPartyPedestrianPageDisplay();

        if(select_pedestrianType && select_pedestrianType !== "") {
            await this.otherPartyPedestrianPage.efSelectAndNavigatetoOtherPartyWitnessPage(select_pedestrianType);
        } else {
            await this.otherPartyPedestrianPage.efNavigatetoOtherPartyWitnessPage();
        }

        console.log("Navigated to witnessinfo Page");
        await this.otherPartyWitnessPage.efValidateTitle();
        await this.otherPartyWitnessPage.efValidateOtherPartyWitnessPageDisplay();
        await this.otherPartyWitnessPage.efNavigatetoReviewClaimPage(select_witness);
        console.log("Navigated to additionalpropertydamage Page");
        await this.propertyDamagePage.efConfirmAndNavigatetoReviewPage(select_PropertyDamage);
    }
}