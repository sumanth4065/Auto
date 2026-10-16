import { Buffer } from "buffer";
import { Page } from "@playwright/test";
import { AccidentConfirmationPage } from "../pages/pageRepository/AccidentConfirmationPage";
import { AdditionalDetailsPage } from "../pages/pageRepository/AdditionalDetailsPage";
import { AnyoneInjuredPage } from "../pages/pageRepository/AnyoneInjuredPage";
import { CarDetailsTransitionPage } from "../pages/pageRepository/CarDetailsTransitionPage";
import type { ClaimantPassengerPage } from "../pages/pageRepository/ClaimantPassengerPage";
import { ContactInformationPage } from "../pages/pageRepository/ContactInformationPage";
import { DrivenIncidentDetailsPage } from "../pages/pageRepository/DrivenIncidentDetailsPage";
import { DrivenOrParkedPage } from "../pages/pageRepository/DrivenOrParkedPage";
import { FileAClaimPage } from "../pages/pageRepository/FileAClaimPage";
import { FilingClaimPage } from "../pages/pageRepository/FilingClaimPage";
import { HomePage } from "../pages/pageRepository/HomePage";
import type { IncidentInfoIntroPage } from "../pages/pageRepository/IncidentInfoIntroPage";
import { IntroductionPage } from "../pages/pageRepository/IntroductionPage.js";
import { KnockOutPage } from "../pages/pageRepository/KnockOutPage";
import { NumberOfVehiclesInvolvedPage } from "../pages/pageRepository/NumberOfVehiclesInvolvedPage";
import { OtherPartyAnyoneInjuredPage } from "../pages/pageRepository/OtherPartyAnyoneInjuredPage.js";
import { OtherPartyDriverPage } from "../pages/pageRepository/OtherPartyDriverPage.js";
import { OtherPartyInsurancePage } from "../pages/pageRepository/OtherPartyInsurancePage.js";
import { OtherPartyPedestrianPage } from "../pages/pageRepository/OtherPartyPedestrianPage.js";
import { OtherPartyTransitionPage } from "../pages/pageRepository/OtherPartyTransitionPage.js";
import { OtherPartyWitnessPage } from "../pages/pageRepository/OtherPartyWitnessPage.js";
import { OtherPartyYMMPage } from "../pages/pageRepository/OtherPartyYMMPage.js";
import { ParkedWhatHappenedPage } from "../pages/pageRepository/ParkedWhatHappenedPage";
import { PassengerPage } from "../pages/pageRepository/PassengerPage";
import { PropertyDamagePage } from "../pages/pageRepository/PropertyDamagePage";
import { ReviewClaimPage } from "../pages/pageRepository/ReviewClaimPage.js";
import { SafeliteTransitionPage } from "../pages/pageRepository/SafeliteTransitionPage1";
import { TransitionPage } from "../pages/pageRepository/TransitionPage";
import { VehicleDamagePage } from "../pages/pageRepository/VehicleDamagePage.js";
import type { VehicleDamagebyWeatherPage } from "../pages/pageRepository/VehicleDamagebyWeatherPage";
import { VehicleInvolvedPage } from "../pages/pageRepository/VehicleInvolvedPage";
import { VehicleTowedPage } from "../pages/pageRepository/VehicleTowedPage.js";
import { WhatHappenedPage } from "../pages/pageRepository/WhatHappenedPage";
import { WhereAccidentPage } from "../pages/pageRepository/WhereAccidentPage";
import { WhereWhenAccidentPage } from "../pages/pageRepository/WhereWhenAccidentPage";
import { WhoIsReportingPage } from "../pages/pageRepository/WhoIsReportingPage";
import { WhoWasDrivingPage } from "../pages/pageRepository/WhoWasDrivingPage";
import { APIActions } from "../utilities/APIActions";
import { chromium, test } from "../utilities/TestFixture";
import { MyOptions, expect } from "../utilities/TestFixture";
import { getCommonTestDataCandidates } from "../utilities/CommonTestData";
import type { SelectedTestData } from "../utilities/CommonTestData";
import { ExistingClaimPage } from "../pages/pageRepository/ExistingClaimPage";
import {VehicleYearMakeModelPage} from "../pages/pageRepository/VehicleYearMakeModelPage";
import{TellUsAboutDriverPage} from "../pages/pageRepository/TellUsAboutDriverPage";
import { AnonymousAuthWorkflow } from "../WorkFlows/AnonymousAuthWorkflow";
import { ClaimInitiationWorkflow } from "../WorkFlows/ClaimInitiationWorkflow";
import { ReporterVehicleDriverWorkflow } from "../WorkFlows/ReporterVehicleDriverWorkflow";
import { AdditionalDetailsWorkflow } from "../WorkFlows/AdditionalDetailsWorkflow";
import { ReviewSubmitWorkflow } from "../WorkFlows/ReviewSubmitWorkflow";
import { ClaimType, ReporterType, VehicleStatus, DriverStatus, IncidentType, PassengerStatus,
	InjuredStatus, VehicleTowed, PartyWitness, propertyDamage, OtherVehicleCount, AccidentDetails, ParkedIncidentType, WeatherEvent, PedestrianCyclistType } from "../utilities/types";

test.describe("Auto eFNOL Without Login TestCases:", () => {
	let fileAClaimPage: FileAClaimPage;
	let filingClaimPage: FilingClaimPage;
	let incidentInfoIntroPage: IncidentInfoIntroPage;
	let whereWhenAccidentPage: WhereWhenAccidentPage;
	let whoIsReportingPage: WhoIsReportingPage;
	let contactInformationPage: ContactInformationPage;
	let carDetailsTransitionPage: CarDetailsTransitionPage;
	let vehicleInvolvedPage: VehicleInvolvedPage;
	let drivenOrParkedPage: DrivenOrParkedPage;
	let drivenIncidentDetailsPage: DrivenIncidentDetailsPage;
	let whoWasDrivingPage: WhoWasDrivingPage;
	let numberOfVehiclesInvolvedPage: NumberOfVehiclesInvolvedPage;
	let anyoneInjuredPage: AnyoneInjuredPage;
	let whatHappenedPage: WhatHappenedPage;
	let vehicleTowedPage: VehicleTowedPage;
	let vehicleDamagePage: VehicleDamagePage;
	let introductionPage: IntroductionPage;
	let otherPartyTransitionPage: OtherPartyTransitionPage;
	let otherPartyYMMPage: OtherPartyYMMPage;
	let otherPartyInsurancePage: OtherPartyInsurancePage;
	let otherPartyDriverPage: OtherPartyDriverPage;
	let otherPartyAnyoneInjuredPage: OtherPartyAnyoneInjuredPage;
	let otherPartyPedestrianPage: OtherPartyPedestrianPage;
	let otherPartyWitnessPage: OtherPartyWitnessPage;
	let transitionPage: TransitionPage;
	let reviewClaimPage: ReviewClaimPage;
	let accidentConfirmationPage: AccidentConfirmationPage;
	let propertyDamagePage: PropertyDamagePage;
	let parkedWhatHappened: ParkedWhatHappenedPage;
	let vehicleDamagebyWeatherPage: VehicleDamagebyWeatherPage;
	let knockOutPage: KnockOutPage;
	let homePage: HomePage;
	let safeliteTransitionPage: SafeliteTransitionPage;
	let passengerPage: PassengerPage;
	let claimantPassengerPage: ClaimantPassengerPage;
	let additionalDetailsPage: AdditionalDetailsPage;
	let whereAccidentPage: WhereAccidentPage;
	let firstName: any;
	let lastName: any;
	let zipCode: any;
	let policyNumber: any;
	let enV;
	let existingClaimPage: ExistingClaimPage
	let vehicleYearMakeModelPage:VehicleYearMakeModelPage
	let tellUsAboutDriverPage:TellUsAboutDriverPage

	const path = require("path");
	// Anon @club/@sanity projects source name/policy/zip from products/autoHuon.json.
	const ANON_ARTIFACT_PROJECTS = ["RegressionEFNOLWOLI", "SanityEFNOLWOLI"];
	const path1 = path.join(
		"C:",
		"Automation",
		"insurance-self-service_insuranceclaims_auto-efnol-without-login",
		"tests",
		"ui",
		"Screenshots",
		"example.png",
	);

	test.beforeAll(
		async (
			{ baseURL, firstname, lastname, zipcode, policynumber, env },
			testInfo,
		) => {
			console.log(baseURL);

			let record: SelectedTestData | undefined;
			if (ANON_ARTIFACT_PROJECTS.includes(testInfo.project.name)) {
				const stateInput = process.env.STATE_INPUT || "CA";
				const candidates = getCommonTestDataCandidates(stateInput, "HUON", "A1");
				record =
					(await new APIActions().resolveWorkingRecord(
						candidates,
						process.env.MYACT_PASSWORD || "autoclub1",
						stateInput,
						process.env.TEST_ENV || "uat",
						"A1",
					)) ?? candidates[0];
			}
			firstName = record?.firstName ?? firstname;
			lastName = record?.lastName ?? lastname;
			zipCode = record?.zipcode ?? zipcode;
			policyNumber = record?.policynumber ?? policynumber;
			console.log(firstName, lastName, policyNumber, zipCode);
			console.log(`Running Project  ${testInfo.project.name}`);
			const baseurlnav = baseURL;
			console.log(baseURL);
		},
	);

	test.beforeEach(async ({}, testInfo) => {
		console.log(`Running ${testInfo.title}`);
	});

	test.afterEach(async ({}, testInfo) => {
		if (testInfo.status !== testInfo.expectedStatus) {
			console.log(`${testInfo.title} did not run as expected!`);
			console.error(testInfo.errors);
		}
	});

	test("ISS-16215 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Impact with another vehicle(s) - Rear-end - No Other Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: 'test_key', description: 'ISS-16215' });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with other vehicle(s) - Rear-end', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_VEHICLE, AccidentDetails.REAR_END, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, No Other Vehicle, No Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.NO_OTHER_VEHICLE, PartyWitness.NO, propertyDamage.YES);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test ("ISS-16216 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Impact with a fixed object or structure - 1 vehicle involved - No Injured - Pedestrian - WithWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16216" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with a fixed object or structure', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_FIXED_OBJECT, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, 1 Vehicle, Pedestrian, Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.ONE_VEHICLE, PedestrianCyclistType.PEDESTRIAN, PartyWitness.YES, propertyDamage.YES, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16217 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Rollover - option  - 1 vehicle involved - No Injured - Pedestrian - NoWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16217" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Rollover', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.ROLLOVER, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, 1 Vehicle, Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.ONE_VEHICLE, PedestrianCyclistType.PEDESTRIAN, PartyWitness.NO, propertyDamage.NO, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16218 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Impact with a pedestrian or cyclist option  - 2 or more vehicle involved - No Injured - Pedestrian - NoWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16218" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with a pedestrian or cyclist', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_PEDESTRIAN, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, 2 Vehicles, Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.TWO_VEHICLES, PedestrianCyclistType.PEDESTRIAN, PartyWitness.NO, propertyDamage.NO, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16219 - AutoEFNOL Without Login - All other Damage Selection - Parked Case - Hit by another vehicle - 1 vehicle involved - Cyclist - NoWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16219" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Parked - Hit by another vehicle', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, ParkedIncidentType.HIT_BY_VEHICLE, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, 1 Vehicle, Cyclist, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.ONE_VEHICLE, PedestrianCyclistType.CYCLIST, PartyWitness.NO, propertyDamage.NO, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16220 - AutoEFNOL Without Login - All other Damage Selection - Parked Case - Damaged by weather - Wind - Cyclist - WithWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16220" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Parked - Damaged by weather - Wind', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, ParkedIncidentType.DAMAGED_BY_WEATHER, WeatherEvent.WIND, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, Injured, Towed, 1 Vehicle, Cyclist, Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.YES, VehicleTowed.YES, OtherVehicleCount.ONE_VEHICLE, PedestrianCyclistType.CYCLIST, PartyWitness.YES, propertyDamage.YES, InjuredStatus.YES);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16221 - AutoEFNOL Without Login - All other Damage Selection - Parked Case - Vandalized - Pedestrian - WithWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16221" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Parked - Vandalized', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, ParkedIncidentType.VANDALIZED, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, Injured, Towed, 1 Vehicle, Pedestrian, Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.YES, VehicleTowed.YES, OtherVehicleCount.ONE_VEHICLE, PedestrianCyclistType.PEDESTRIAN, PartyWitness.YES, propertyDamage.YES, InjuredStatus.YES);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16222 - AutoEFNOL Without Login - All other Damage Selection - Parked Case - Invloved in fire -  NoPedestrianNoCyclist - NOWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16222" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Parked - Involved in a fire', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, ParkedIncidentType.INVOLVED_IN_FIRE, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, Injured, Towed, 2 Vehicles, No Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.YES, VehicleTowed.YES, OtherVehicleCount.TWO_VEHICLES, PedestrianCyclistType.NONE, PartyWitness.NO, propertyDamage.NO, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16223 - AutoEFNOL Without Login - All other Damage Selection - Reporter Not Listed- @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: 'test_key', description: 'ISS-16223' });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Reporter not listed - Parked - Involved in a fire', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(ReporterType.REPORTER_NOTLISTED,
				VehicleStatus.VEHICLE1, ParkedIncidentType.INVOLVED_IN_FIRE, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, Injured, Towed, 2 Vehicles, No Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.YES, VehicleTowed.YES, OtherVehicleCount.TWO_VEHICLES, PedestrianCyclistType.NONE, PartyWitness.NO, propertyDamage.NO, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16224 - AutoEeFNOL Without Login - All other Damage Selection - Vehicle Not listed - @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: 'test_key', description: 'ISS-16224' });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Vehicle not listed - Parked - Involved in a fire', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE_NOT_LISTED, ParkedIncidentType.INVOLVED_IN_FIRE, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, Injured, Towed, 2 Vehicles, No Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.YES, VehicleTowed.YES, OtherVehicleCount.TWO_VEHICLES, PedestrianCyclistType.NONE, PartyWitness.NO, propertyDamage.NO, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16225 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Impact with a pedestrian or cyclist option  - Driver Not Found -  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: 'test_key', description: 'ISS-16225' });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with a pedestrian or cyclist - Driver not listed', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_PEDESTRIAN, undefined, DriverStatus.DRIVER_NOTLISTED);
		});
		await test.step('Complete additional details - No Passengers, Injured, Towed, 2 Vehicles, No Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.YES, VehicleTowed.YES, OtherVehicleCount.TWO_VEHICLES, PedestrianCyclistType.NONE, PartyWitness.NO, propertyDamage.NO, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test.skip("ISS-16237 - MANUAL E2E - AutoEFNOL Without Login - All other Damage Selection - Parked Case - Invloved in fire - Edit from Review page and Submit claim -  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: 'test_key', description: 'ISS-16237' });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Parked - Involved in a fire', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, ParkedIncidentType.INVOLVED_IN_FIRE, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, Injured, Towed, 2 Vehicles, No Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.YES, VehicleTowed.YES, OtherVehicleCount.TWO_VEHICLES, PedestrianCyclistType.NONE, PartyWitness.NO, propertyDamage.NO, InjuredStatus.NO);
		});
		await test.step('Edit incident info from review page and validate claim', async () => {
			reviewClaimPage = new ReviewClaimPage(page);
			await reviewClaimPage.efValidateTitle();
			await reviewClaimPage.validateReviewPageandclickEditIncidentInfoPage();
			accidentConfirmationPage = new AccidentConfirmationPage(page);
			await accidentConfirmationPage.efValidateAutoClaim();
			await page.screenshot({ path: "ConfirmationPage.png" });
		});
	});
	test("ISS-16226 - AutoEFNOL Without Login - All other Damage Selection - Parked Case - Damaged by weather - Hail - Cyclist - WithWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16226" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Parked - Damaged by weather - Hail', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, ParkedIncidentType.DAMAGED_BY_WEATHER, WeatherEvent.HAIL, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, Injured, Towed, 1 Vehicle, Cyclist, Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.YES, VehicleTowed.YES, OtherVehicleCount.ONE_VEHICLE, PedestrianCyclistType.CYCLIST, PartyWitness.YES, propertyDamage.YES, InjuredStatus.YES);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test.skip("ISS-16214 - MANUAL AutoEFNOL Without Login - Validate the claim created in claims center", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
	  testInfo.annotations.push({ type: 'test_key', description: 'ISS-16214' });});
	test("ISS-16227 - AutoEFNOL Without Login - Glass only Damage Selection Redirect to Safelite page -  @club @sanity", async ({
		baseURL,
		page,
		env,
		state,
		region,
		context,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16227" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Select Glass only damage and redirect to Safelite', async () => {
			fileAClaimPage = new FileAClaimPage(page);
			await fileAClaimPage.efValidateTitle();
			await fileAClaimPage.efValidateFileAClaimPageDisplay();
			await fileAClaimPage.efNavigatetoFilingClaimPage();
			filingClaimPage = new FilingClaimPage(page);
			await filingClaimPage.efValidateTitle();
			await filingClaimPage.efValidateFilingClaimPageDisplay();
			await filingClaimPage.efNavigatetoTransitionPage("Glass only damage");
			safeliteTransitionPage = new SafeliteTransitionPage(page);
			await safeliteTransitionPage.efEnterDataAndNavigatetoSafelitePage(context);
		});
	});
	test.skip("ISS-16229 - Auto EFNOL Anon - Prod Negative testing with cancelled policy - @prod ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: 'test_key', description: 'ISS-16229' });
		await test.step('Navigate to prod introduction page', async () => {
			homePage = new HomePage(page);
			await homePage.goToProdIntroPage(env, state, region, baseURL);
			introductionPage = new IntroductionPage(page);
			await introductionPage.efValidateTitle();
		});
		await test.step('Attempt file a claim with cancelled policy', async () => {
			await introductionPage.efNavigatetoFileACliamPageforCancelledpol(firstName, lastName, policyNumber, zipCode);
		});
	});
	test("ISS-16228 - Auto EFNOL Anon - Prod Negative testing with invalid data  - @invalid ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16228" });
		await test.step('Navigate to prod introduction page', async () => {
			homePage = new HomePage(page);
			await homePage.goToProdIntroPage(env, state, region, baseURL);
			introductionPage = new IntroductionPage(page);
			await introductionPage.efValidateTitle();
		});
		await test.step('Attempt file a claim with invalid data', async () => {
			await introductionPage.efNavigatetoFileACliamPageforInvalidData(firstName, lastName, policyNumber, zipCode);
		});
	});
	test("ISS-16226 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Impact with animal - Cyclist - WithWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16226" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with an animal', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_ANIMAL, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, Injured, Towed, 1 Vehicle, Cyclist, Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.YES, VehicleTowed.YES, OtherVehicleCount.ONE_VEHICLE, PedestrianCyclistType.CYCLIST, PartyWitness.YES, propertyDamage.YES, InjuredStatus.YES);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16230 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Damaged by weather - Flood/water - Cyclist - WithWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16230" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Damaged by weather - Flood/water', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverNonVehicle(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, IncidentType.DAMAGED_BY_WEATHER, WeatherEvent.FLOOD_WATER, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, Injured, Towed, 1 Vehicle, Cyclist, Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.YES, VehicleTowed.YES, OtherVehicleCount.ONE_VEHICLE, PedestrianCyclistType.CYCLIST, PartyWitness.YES, propertyDamage.YES, InjuredStatus.YES);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16231 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Struck by a falling or flying object - 1 vehicle involved - No Injured - Pedestrian - WithWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16231" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Struck by a falling or flying object', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverNonVehicle(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, IncidentType.STRUCK_BY_OBJECT, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, 1 Vehicle, Pedestrian, Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.ONE_VEHICLE, PedestrianCyclistType.PEDESTRIAN, PartyWitness.YES, propertyDamage.YES, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16232 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Impact with another vehicle(s) - Intersection - No Other Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16232" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with other vehicle(s) - Intersection', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_VEHICLE, AccidentDetails.INTERSECTION, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, No Other Vehicle, No Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.NO_OTHER_VEHICLE, PartyWitness.NO, propertyDamage.YES);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16233 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Impact with another vehicle(s) - Turning - No Other Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16233" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with other vehicle(s) - Turning', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_VEHICLE, AccidentDetails.TURNING, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, No Other Vehicle, No Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.NO_OTHER_VEHICLE, PartyWitness.NO, propertyDamage.YES);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16234 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Impact with another vehicle(s) - Lane Change - No Other Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16234" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with other vehicle(s) - Lane change', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_VEHICLE, AccidentDetails.LANE_CHANGE, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, No Other Vehicle, No Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.NO_OTHER_VEHICLE, PartyWitness.NO, propertyDamage.YES);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16235 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Impact with another vehicle(s) - Hit and run - No Other Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16235" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with other vehicle(s) - Hit and run', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_VEHICLE, AccidentDetails.HIT_AND_RUN, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, No Other Vehicle, No Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.NO_OTHER_VEHICLE, PartyWitness.NO, propertyDamage.YES);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16236 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Impact with another vehicle(s) - Backing - No Other Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @club ", async ({
		baseURL,
		page,
		env,
		state,
		region,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16236" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with other vehicle(s) - Backing', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_VEHICLE, AccidentDetails.BACKING, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, No Other Vehicle, No Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.NO_OTHER_VEHICLE, PartyWitness.NO, propertyDamage.YES);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test.skip ("ISS-17472 - AutoEFNOL Without Login - Damage Selection - Verify Existing Claim - Driven Case - Impact with other vehicle(s) - Backing - 1Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-   @club ", async ({
				baseURL,
		page,
		env,
		state,
		region,
		existingClaimNum
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-17472" });
		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('File claim and validate existing/duplicate claim pop up', async () => {
			fileAClaimPage = new FileAClaimPage(page);
			await fileAClaimPage.efValidateTitle();
			await fileAClaimPage.efValidateFileAClaimPageDisplay();
			await fileAClaimPage.efNavigatetoFilingClaimPage();
			filingClaimPage = new FilingClaimPage(page);
			await filingClaimPage.efValidateTitle();
			await filingClaimPage.efValidateFilingClaimPageDisplay();
			await filingClaimPage.efNavigatetoTransitionPage("All other damage");
			transitionPage = new TransitionPage(page);
			await transitionPage.efValidateTitle();
			await transitionPage.efValidateIncidentInfoIntroPageDisplay();
			await transitionPage.efNavigatetoWhereWhenAccidentPage();
			whereWhenAccidentPage = new WhereWhenAccidentPage(page);
			await whereWhenAccidentPage.efValidateTitle();
			await whereWhenAccidentPage.efValidateWhereWhenAccidentPagePageDisplay();
			await whereWhenAccidentPage.enterDateTimeforDuplicateClaimsValidation(existingClaimNum);
			whereAccidentPage = new WhereAccidentPage(page);
			await whereAccidentPage.efValidateTitle();
			await whereAccidentPage.efValidateWhereAccidentPagePageDisplay();
			await whereAccidentPage.efNavigatetoCreateClaimTransitionPage();
			existingClaimPage = new ExistingClaimPage(page);
			await existingClaimPage.validateExistingClaimsPopUp();
		});
	});

	test.skip ("ISS-17407- AutoEFNOL Without Login - All other Damage Selection - Parked Case - Rolled away - 1 Vehicle Involved - Cyclist - WithWitness - @club ", async ({
		baseURL, page, env, state, region, }, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-17407" });

		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Parked - Rolled away', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, ParkedIncidentType.ROLLED_AWAY, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details with other party - No Passengers, No Injured, Towed, 1 Vehicle, Cyclist, Witness, Property Damage', async() => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, "1 Vehicle", "Cyclist", PartyWitness.YES, propertyDamage.YES, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});

	test.skip ("ISS-17408 - AutoEFNOL Without Login - All other Damage Selection - Parked Case - Stolen - No Other Vehicle Involved - NoPedestrianNoCyclist - NoWitness - @club ", async ({
		baseURL, page, env, state, region, }, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-17408" });

		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Parked - Stolen', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, ParkedIncidentType.STOLEN, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, No Other Vehicle, No Witness, No Damage', async() => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.NO_OTHER_VEHICLE, PartyWitness.NO, propertyDamage.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});

	test.skip ("ISS-17409 - AutoEFNOL Without Login - All other Damage Selection - Parked Case - Struck by a falling or flying object - 1 Vehicle Involved - Pedestrian - NoWitness - @club ", async ({
		baseURL, page, env, state, region, }, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-17409" });

		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Parked - Struck by a falling or flying object', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, ParkedIncidentType.STRUCK_BY_OBJECT, undefined, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details with other party - No Passengers, No Injured, Towed, 1 Vehicle, Pedestrian, No Witness, No Damage', async() => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, "1 Vehicle", "Pedestrian", PartyWitness.NO, propertyDamage.NO, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});

	test.skip ("ISS-17410 - AutoEFNOL Without Login - All other Damage Selection - Driven Case - Impact with other vehicle(s) - Rear-end - Vehicle Towed No - 3 or more Vehicles - NoPedestrianNoCyclist - NoWitness - @club ", async ({
		baseURL, page, env, state, region, }, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-17410" });

		const anonymousAuthWorkflow = new AnonymousAuthWorkflow(page);
		const claimInitiationWorkflow = new ClaimInitiationWorkflow(page);
		const reporterVehicleDriverWorkflow = new ReporterVehicleDriverWorkflow(page);
		const additionalDetailsWorkflow = new AdditionalDetailsWorkflow(page);
		const reviewSubmitWorkflow = new ReviewSubmitWorkflow(page);

		await test.step('Authenticate anonymous user', async () => {
			await anonymousAuthWorkflow.authenticateAnonymous(env, state, region, baseURL, firstName, lastName, policyNumber, zipCode);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with vehicle - Rear-end', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_VEHICLE, AccidentDetails.REAR_END, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Not Towed, 3+ Vehicles, No Witness, No Damage', async() => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.NO, OtherVehicleCount.THREE_OR_MORE, PartyWitness.NO, propertyDamage.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
});
