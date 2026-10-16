import { AccidentConfirmationPage } from "../pages/pageRepository/AccidentConfirmationPage";
import { EmailAddressPage } from "../pages/pageRepository/EmailAddressPage";
import { FileAClaimPage } from "../pages/pageRepository/FileAClaimPage";
import { FilingClaimPage } from "../pages/pageRepository/FilingClaimPage";
import { HomePage } from "../pages/pageRepository/HomePage";
import { ReviewClaimPage } from "../pages/pageRepository/ReviewClaimPage.js";
import { SafeliteTransitionPage } from "../pages/pageRepository/SafeliteTransitionPage1";
import { TransitionPage } from "../pages/pageRepository/TransitionPage";
import { WhereAccidentPage } from "../pages/pageRepository/WhereAccidentPage";
import { WhereWhenAccidentPage } from "../pages/pageRepository/WhereWhenAccidentPage";
import { APIActions } from "../utilities/APIActions";
import { chromium, test } from "../utilities/TestFixture";
import { ExistingClaimPage } from "../pages/pageRepository/ExistingClaimPage";
import { AuthenticationWorkflow} from "../WorkFlows/AuthenticationWorkflow"
import {ClaimInitiationWorkflow} from "../WorkFlows/ClaimInitiationWorkflow"
import{ReporterVehicleDriverWorkflow} from "../WorkFlows/ReporterVehicleDriverWorkflow"
import {AdditionalDetailsWorkflow} from "../WorkFlows/AdditionalDetailsWorkflow"
import {ReviewSubmitWorkflow} from "../WorkFlows/ReviewSubmitWorkflow"
import { ClaimType, ReporterType, VehicleStatus, DriverStatus,IncidentType,PassengerStatus,
	InjuredStatus,VehicleTowed,PartyWitness,propertyDamage,OtherVehicleCount,AccidentDetails,ParkedIncidentType,WeatherEvent,PedestrianCyclistType } from "../utilities/types"

const apiActions = new APIActions();
let token: string;
let policyNumber: string;
let guid: string;
let clubCode: string;


test.describe("Auto eFNOL With Login TestCases:", () => {
	let fileAClaimPage: FileAClaimPage;
	let filingClaimPage: FilingClaimPage;
	let whereWhenAccidentPage: WhereWhenAccidentPage;
	let transitionPage: TransitionPage;
	let reviewClaimPage: ReviewClaimPage;
	let accidentConfirmationPage: AccidentConfirmationPage;
	let homePage: HomePage;
	let safeliteTransitionPage: SafeliteTransitionPage;
	let whereAccidentPage: WhereAccidentPage;
	let emailAddressPage: EmailAddressPage;
	let existingClaimPage: ExistingClaimPage;

	test.beforeAll(async ({ username, password, policynumber, clubname, baseURL, env, region }, testInfo,) => {
		console.log(`Running Auto EFNOL Scripts for ${username} in ${region} region`,);
		console.log(`Running Project  ${testInfo.project.name}`);
		[policyNumber, clubCode, token] = await apiActions.getOktaTokenNew(username, password, clubname, env, policynumber,);
		const policyClass = "AUTO";
		const guidResult = await apiActions.callFlowDirector(policyNumber, policyClass, clubCode, token, region,);
		guid = guidResult![0];
		console.log(guid);
		console.log(`Auto Policy Number is: ${policyNumber}`);
	},
	);
	test.beforeEach(async ({ username, password }, testInfo) => {
		console.log(`Running ${testInfo.title}`);
	});

	test.afterEach(async ({ }, testInfo) => {
		if (testInfo.status !== testInfo.expectedStatus) {
			console.log(`${testInfo.title} did not run as expected!`);
			console.error(testInfo.errors);
		}
	});

	test ("ISS-16188 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Impact with other vehicle(s) - Rear-end- No Other Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @huon ", async ({
		env, baseURL, clubname, region, username, password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16188" });

		await test.step('Authenticate user', async () => {
		await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with other vehicle(s) - Rear-end', async () => {
		await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
			VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_VEHICLE,AccidentDetails.REAR_END, DriverStatus.DRIVER1);});
		
		await test.step('Complete other party information - No Passenegers, No Injured,No Vehicle,No Towed, No witnessed, No Damage', async() => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS,InjuredStatus.NO,VehicleTowed.YES,OtherVehicleCount.NO_OTHER_VEHICLE,PartyWitness.NO,propertyDamage.NO);
		});	
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
		
	});
	test("ISS-16189 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Impact with other vehicle(s)- Intersection - 1Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @huon @gw ", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16189" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with other vehicle(s) - Intersection', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				VehicleStatus.DRIVEN,
				IncidentType.IMPACT_WITH_VEHICLE,
				AccidentDetails.INTERSECTION,
				DriverStatus.DRIVER1
			);
		});
		await test.step('Complete other party information with 1 Vehicle', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.NO,
				VehicleTowed.YES,
				OtherVehicleCount.ONE_VEHICLE,
				PedestrianCyclistType.NONE,
				PartyWitness.NO,
				propertyDamage.YES,
				InjuredStatus.NO
			);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16190 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Impact with an animal - No Other Vehicle Involved - Injured - NoPedestrianNoCyclist - NoWitness-  @huon @gw ", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16190" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with an animal', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				VehicleStatus.DRIVEN,
				IncidentType.IMPACT_WITH_ANIMAL,
				undefined,
				DriverStatus.DRIVER1
			);
		});
		await test.step('Complete other party information - Injured, No Vehicle', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetails(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.NO_OTHER_VEHICLE,
				PartyWitness.NO,
				propertyDamage.YES
			);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16191 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Impact with a fixed object or structure - 1 vehicle involved - No Injured - Pedestrian - WithWitness-  @huon @gw ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16191" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with fixed object', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				VehicleStatus.DRIVEN,
				IncidentType.IMPACT_WITH_FIXED_OBJECT,
				undefined,
				DriverStatus.DRIVER1
			);
		});
		await test.step('Complete other party information with 1 Vehicle, Pedestrian, Witness=Yes', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.NO,
				VehicleTowed.YES,
				OtherVehicleCount.ONE_VEHICLE,
				PedestrianCyclistType.PEDESTRIAN,
				PartyWitness.YES,
				propertyDamage.YES,
				InjuredStatus.NO
			);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16192 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Damaged by weather - Flood/Water - No Other Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @huon @gw ", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16192" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Damaged by weather (Flood/Water)', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverNonVehicle(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				IncidentType.DAMAGED_BY_WEATHER,
				WeatherEvent.FLOOD_WATER,
				DriverStatus.DRIVER1
			);
		});
		await test.step('Complete other party information - No vehicle', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetails(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.NO,
				VehicleTowed.YES,
				OtherVehicleCount.NO_OTHER_VEHICLE,
				PartyWitness.NO,
				propertyDamage.YES
			);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16193 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Rollover - option  - 1 vehicle involved - No Injured - Pedestrian - NoWitness-  @huon @gw ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16193" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Rollover', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				VehicleStatus.DRIVEN,
				IncidentType.ROLLOVER,
				undefined,
				DriverStatus.DRIVER1
			);
		});
		await test.step('Complete other party information - 1 Vehicle, Pedestrian, No Witness', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.NO,
				VehicleTowed.YES,
				OtherVehicleCount.ONE_VEHICLE,
				PedestrianCyclistType.PEDESTRIAN,
				PartyWitness.NO,
				propertyDamage.NO,
				InjuredStatus.NO
			);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16194 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Impact with a pedestrian or cyclist option  - 2 or more vehicle involved - No Injured - Pedestrian - NoWitness-  @huon @gw ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16194" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with pedestrian/cyclist', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				VehicleStatus.DRIVEN,
				IncidentType.IMPACT_WITH_PEDESTRIAN,
				undefined,
				DriverStatus.DRIVER1
			);
		});
		await test.step('Complete additional details - 2 Vehicles, Pedestrian, No Witness', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.NO,
				VehicleTowed.YES,
				OtherVehicleCount.TWO_VEHICLES,
				PedestrianCyclistType.PEDESTRIAN,
				PartyWitness.NO,
				propertyDamage.NO,
				InjuredStatus.NO
			);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16195 - AutoEFNOL With Login - All other Damage Selection - Parked Case - Hit by another vehicle - 1 vehicle involved - Cyclist - NoWitness-  @huon ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16195" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for Parked - Hit by another vehicle', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				ParkedIncidentType.HIT_BY_VEHICLE,
				undefined,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - 1 Vehicle, Cyclist, No Witness', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.NO,
				VehicleTowed.YES,
				OtherVehicleCount.ONE_VEHICLE,
				PedestrianCyclistType.CYCLIST,
				PartyWitness.NO,
				propertyDamage.NO,
				InjuredStatus.NO
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});

	test("ISS-16196 - AutoEFNOL With Login - All other Damage Selection - Parked Case - Damaged by weather - Wind - Cyclist - WithWitness-  @huon @gw ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16196" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for Parked - Damaged by weather (Wind)', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				ParkedIncidentType.DAMAGED_BY_WEATHER,
				WeatherEvent.WIND,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - Injuries, 1 Vehicle, Cyclist, Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.ONE_VEHICLE,
				PedestrianCyclistType.CYCLIST,
				PartyWitness.YES,
				propertyDamage.YES,
				InjuredStatus.YES
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16197 - AutoEFNOL With Login - All other Damage Selection - Parked Case - Rolled away - Cyclist - WithWitness-  @huon @gw ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16197" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for Parked - Rolled away', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				ParkedIncidentType.ROLLED_AWAY,
				undefined,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - Injuries, 1 Vehicle, Cyclist, Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.ONE_VEHICLE,
				PedestrianCyclistType.CYCLIST,
				PartyWitness.YES,
				propertyDamage.YES,
				InjuredStatus.YES
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});16213
	test("ISS-16198 - AutoEFNOL With Login - All other Damage Selection - Parked Case - Struck by a flying or falling object - WithWitness-  @huon @gw ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16198" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for Parked - Struck by falling/flying object', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				ParkedIncidentType.STRUCK_BY_OBJECT,
				undefined,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - Injuries, 1 Vehicle, Pedestrian, No Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.ONE_VEHICLE,
				PedestrianCyclistType.PEDESTRIAN,
				PartyWitness.NO,
				propertyDamage.YES,
				InjuredStatus.YES
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16199 - AutoEFNOL With Login - All other Damage Selection - Parked Case - Vandalized - Pedestrian - WithWitness-  @huon @gw ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16199" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for Parked - Vandalized', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				ParkedIncidentType.VANDALIZED,
				undefined,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - Injuries, 1 Vehicle, Pedestrian, With Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.ONE_VEHICLE,
				PedestrianCyclistType.PEDESTRIAN,
				PartyWitness.YES,
				propertyDamage.YES,
				InjuredStatus.YES
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16200 - AutoEFNOL With Login - All other Damage Selection - Parked Case - Stolen - 2 more vehicles involved - NoPedestrianNoCyclist - NOWitness-  @huon", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16200" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for Parked - Stolen', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				ParkedIncidentType.STOLEN,
				undefined,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - Injuries, 2 Vehicle (no other party), No Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.TWO_VEHICLES,
				PedestrianCyclistType.NONE,
				PartyWitness.NO,
				propertyDamage.NO,
				InjuredStatus.NO
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16201 - AutoEFNOL With Login - All other Damage Selection - Parked Case - Invloved in fire -  NoPedestrianNoCyclist - NOWitness-  @huon @gw ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16201" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for Parked - Involved in fire', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				ParkedIncidentType.INVOLVED_IN_FIRE,
				undefined,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - Injuries, 2 Vehicle (no other party), No Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.TWO_VEHICLES,
				PedestrianCyclistType.NONE,
				PartyWitness.NO,
				propertyDamage.NO,
				InjuredStatus.NO
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16202 - AutoEFNOL With Login - Damage Selection - Reporter Not Listed -  @huon @gw ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: 'test_key', description: 'ISS-16202' });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for Parked - Involved in fire - Reporter Not Listed', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(
				ReporterType.REPORTER_NOTLISTED,
				VehicleStatus.VEHICLE1,
				ParkedIncidentType.INVOLVED_IN_FIRE,
				undefined,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - Injuries, 2 Vehicle (no other party), No Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.TWO_VEHICLES,
				PedestrianCyclistType.NONE,
				PartyWitness.NO,
				propertyDamage.NO,
				InjuredStatus.NO
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test ("ISS-16203 - AutoEeFNOL With Login - Damage Selection - Vehicle Not listed -  @huon @gw ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: 'test_key', description: 'ISS-16203' });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for Parked - Involved in fire - Vehicle Not Listed', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE_NOT_LISTED,
				ParkedIncidentType.INVOLVED_IN_FIRE,
				undefined,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - Injuries, 2 Vehicle (no other party), No Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.TWO_VEHICLES,
				PedestrianCyclistType.NONE,
				PartyWitness.NO,
				propertyDamage.NO,
				InjuredStatus.NO
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});

	});
	test ("ISS-16204 - AutoEFNOL With Login - Damage Selection - Driven Case - Impact with pedestrian or cyclist option - Driver Not Found - @huon @gw ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: 'test_key', description: 'ISS-16204' });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for Driven - Impact with pedestrian/cyclist - Driver Not Listed', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverNonVehicle(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				IncidentType.IMPACT_WITH_PEDESTRIAN,
				undefined,
				DriverStatus.DRIVER_NOTLISTED
			);
		});

		await test.step('Complete additional details - Injuries, 2 Vehicle (no other party), No Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.TWO_VEHICLES,
				PedestrianCyclistType.NONE,
				PartyWitness.NO,
				propertyDamage.NO,
				InjuredStatus.NO
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});

	});
	test.skip("ISS-16205 - AutoEFNOL With Login - All other Damage Selection - Parked Case - Invloved in fire - Edit from Review page and Submit claim -  @huon @gw ", async ({
		baseURL,
		page,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: 'test_key', description: 'ISS-16205' });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for Parked - Involved in fire', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				ParkedIncidentType.INVOLVED_IN_FIRE,
				undefined,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - Injuries, 2 Vehicle (no other party), No Pedestrian, No Witness, No Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.TWO_VEHICLES,
				PedestrianCyclistType.NONE,
				PartyWitness.NO,
				propertyDamage.NO,
				InjuredStatus.NO
			);
		});

		await test.step('Edit from Review page and validate', async () => {
			console.log("Navigated to accidentreview Page");
			reviewClaimPage = new ReviewClaimPage(page);
			await reviewClaimPage.efValidateTitle();
			await reviewClaimPage.validateReviewPageandclickEditIncidentInfoPage();
			//await reviewClaimPage.efNavigatetoConfirmationPage();
			console.log("Navigated to confirmation Page");
			accidentConfirmationPage = new AccidentConfirmationPage(page);
			await accidentConfirmationPage.efValidateAutoClaim();
			await page.screenshot({ path: "ConfirmationPage.png" });
		});
	});
	test("ISS-16206 - AutoEFNOL With Login - All other Damage Selection - Parked Case - Damaged by weather - Hail - Cyclist - WithWitness-  @huon @gw ", async ({
		baseURL,
		env,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16206" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for Parked - Damaged by weather (Hail)', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverForParked(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				ParkedIncidentType.DAMAGED_BY_WEATHER,
				WeatherEvent.HAIL,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - Injuries, 1 Vehicle, Cyclist, With Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.ONE_VEHICLE,
				PedestrianCyclistType.CYCLIST,
				PartyWitness.YES,
				propertyDamage.YES,
				InjuredStatus.YES
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16207 - AutoEFNOL With Login - Glass only Damage Selection Redirect to Safelite page - @huon @gw ", async ({
		baseURL,
		page,
		env,
		clubname,
		region,
		context,
		username,
		password,
		authenticationWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16207" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Navigate to Glass only damage and redirect to Safelite', async () => {
			console.log("Navigated to File A Claim Page");
			fileAClaimPage = new FileAClaimPage(page);
			await fileAClaimPage.efValidateTitle();
			await fileAClaimPage.efValidateFileAClaimPageDisplay();
			await fileAClaimPage.efNavigatetoFilingClaimPage();

			console.log("Navigated to Claim Type Page");
			filingClaimPage = new FilingClaimPage(page);
			await filingClaimPage.efValidateTitle();
			await filingClaimPage.efValidateFilingClaimPageDisplay();
			await filingClaimPage.efNavigatetoTransitionPage("Glass only damage");

			safeliteTransitionPage = new SafeliteTransitionPage(page);
			await safeliteTransitionPage.efEnterDataAndNavigatetoSafelitePage(context);
		});
	});
	test.skip("ISS-16208 - MANUAL AutoEFNOL With Login - Validate the claim created in claims center", async ({
		baseURL,
		page,
		env,
		state,
		clubname,
		region,
		username,
		password,
		zipcode,
	}, testInfo) => {
	  testInfo.annotations.push({ type: 'test_key', description: 'ISS-16208' }); });
	test("ISS-16209 - AutoEFNOL With Login - All other Damage Selection - Driven Case - struck by a falling or flying object - 1 vehicle - Cyclist - WithWitness-  @huon ", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16209" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for DRIVEN - Struck by object', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverNonVehicle(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				IncidentType.STRUCK_BY_OBJECT,
				undefined,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - Injuries, 1 Vehicle, Cyclist, With Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.YES,
				VehicleTowed.YES,
				OtherVehicleCount.ONE_VEHICLE,
				PedestrianCyclistType.CYCLIST,
				PartyWitness.YES,
				propertyDamage.YES,
				InjuredStatus.YES
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16210 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Impact with other vehicle(s) - Turning - No Other Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @huon @gw", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16210" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for DRIVEN - Impact with vehicle - Turning', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				VehicleStatus.DRIVEN,
				IncidentType.IMPACT_WITH_VEHICLE,
				AccidentDetails.TURNING,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - No Injuries, No Other Vehicle, No Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetails(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.NO,
				VehicleTowed.YES,
				OtherVehicleCount.NO_OTHER_VEHICLE,
				PartyWitness.NO,
				propertyDamage.YES
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16211 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Impact with other vehicle(s) - Lane Change - 1Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @huon @gw ", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16211" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for DRIVEN - Impact with vehicle - Lane change', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				VehicleStatus.DRIVEN,
				IncidentType.IMPACT_WITH_VEHICLE,
				AccidentDetails.LANE_CHANGE,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - No Injuries, 1 Vehicle, No Pedestrian/Cyclist, No Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.NO,
				VehicleTowed.YES,
				OtherVehicleCount.ONE_VEHICLE,
				PedestrianCyclistType.NONE,
				PartyWitness.NO,
				propertyDamage.YES,
				InjuredStatus.NO
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16212 -AutoEFNOL With Login - All other Damage Selection - Driven Case - Impact with other vehicle(s) - Hit and run - No Other Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @huon @gw", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16212" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for DRIVEN - Impact with vehicle - Hit and run', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				VehicleStatus.DRIVEN,
				IncidentType.IMPACT_WITH_VEHICLE,
				AccidentDetails.HIT_AND_RUN,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - No Injuries, No Other Vehicle, No Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetails(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.NO,
				VehicleTowed.YES,
				OtherVehicleCount.NO_OTHER_VEHICLE,
				PartyWitness.NO,
				propertyDamage.YES
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test("ISS-16213 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Impact with other vehicle(s) - Backing - 1Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @huon @gw ", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-16213" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(
				token, baseURL, guid, clubname, region, env, username, password
			);
		});

		await test.step('Initiate claim', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});

		await test.step('File claim for DRIVEN - Impact with vehicle - Backing', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(
				ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1,
				VehicleStatus.DRIVEN,
				IncidentType.IMPACT_WITH_VEHICLE,
				AccidentDetails.BACKING,
				DriverStatus.DRIVER1
			);
		});

		await test.step('Complete additional details - No Injuries, 1 Vehicle, No Pedestrian/Cyclist, No Witness, Property Damage', async () => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(
				PassengerStatus.NO_PASSENGERS,
				InjuredStatus.NO,
				VehicleTowed.YES,
				OtherVehicleCount.ONE_VEHICLE,
				PedestrianCyclistType.NONE,
				PartyWitness.NO,
				propertyDamage.YES,
				InjuredStatus.NO
			);
		});

		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
	test.skip ("ISS-17471 - AutoEFNOL With Login - Damage Selection - Verify Existing Claim - Driven Case - Impact with other vehicle(s) - Backing - 1Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness-  @huon @gw ", async ({
		page,env,baseURL,clubname,region,username,password,existingClaimNum
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-17471" });
		homePage = new HomePage(page);
		await homePage.goToBehindLoginPage(token,baseURL,guid,clubname,region,env,username,password,);
		await homePage.loginToApplication(username, password);
		emailAddressPage = new EmailAddressPage(page);
		await emailAddressPage.verifyEmailAndClickAskMeLaterBtn();
		console.log("Navigated to File A Claim Page");
		fileAClaimPage = new FileAClaimPage(page);
		await fileAClaimPage.efValidateTitle();
		await fileAClaimPage.efValidateFileAClaimPageDisplay();
		await fileAClaimPage.efNavigatetoFilingClaimPage();
		console.log("Navigated to Claim Type Page");
		filingClaimPage = new FilingClaimPage(page);
		await filingClaimPage.efValidateTitle();
		await filingClaimPage.efValidateFilingClaimPageDisplay();
		await filingClaimPage.efNavigatetoTransitionPage("All other damage");
		console.log("Navigated to Transition Page");
		transitionPage = new TransitionPage(page);
		await transitionPage.efValidateTitle();
		await transitionPage.efValidateIncidentInfoIntroPageDisplay();
		await transitionPage.efNavigatetoWhereWhenAccidentPage();
		console.log("Navigated to When Accident Page");
		whereWhenAccidentPage = new WhereWhenAccidentPage(page);
		await whereWhenAccidentPage.efValidateTitle();
		await whereWhenAccidentPage.efValidateWhereWhenAccidentPagePageDisplay();
		await whereWhenAccidentPage.enterDateTimeforDuplicateClaimsValidation(existingClaimNum);
		console.log("Navigated to Where Accident Page");
		whereAccidentPage = new WhereAccidentPage(page);
		await whereAccidentPage.efValidateTitle();
		await whereAccidentPage.efValidateWhereAccidentPagePageDisplay();
		await whereAccidentPage.efNavigatetoCreateClaimTransitionPage();
		console.log("Navigated to Existing claims pop up window");
		existingClaimPage = new ExistingClaimPage(page);
		await existingClaimPage.validateExistingClaimsPopUp();
	});

	test.skip ("ISS-17401 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Damaged by weather - Wind - No Other Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness - @huon @gw ", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-17401" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Damaged by weather - Wind', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverNonVehicle(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, IncidentType.DAMAGED_BY_WEATHER, WeatherEvent.WIND, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, No Other Vehicle, No Witness, No Damage', async() => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.NO_OTHER_VEHICLE, PartyWitness.NO, propertyDamage.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});

	test.skip ("ISS-17402 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Damaged by weather - Hail - No Other Vehicle Involved - No Injured - NoPedestrianNoCyclist - NoWitness - @huon @gw ", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-17402" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Damaged by weather - Hail', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriverNonVehicle(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, IncidentType.DAMAGED_BY_WEATHER, WeatherEvent.HAIL, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, No Other Vehicle, No Witness, No Damage', async() => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.NO_OTHER_VEHICLE, PartyWitness.NO, propertyDamage.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});

	test.skip ("ISS-17403 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Impact with other vehicle(s) - Rear-end - 1 Vehicle Involved - Pedestrian - WithWitness - @huon @gw ", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-17403" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim for Driven - Impact with vehicle - Rear-end', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_VEHICLE, AccidentDetails.REAR_END, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details with other party - No Passengers, No Injured, Towed, 1 Vehicle, Pedestrian, Witness, Property Damage', async() => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.ONE_VEHICLE, PedestrianCyclistType.PEDESTRIAN, PartyWitness.YES, propertyDamage.YES, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});

	test.skip ("ISS-17404 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Vehicle Not Listed - Impact with other vehicle(s) - Rear-end - No Other Vehicle - NoWitness - @huon @gw ", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-17404" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim with Vehicle Not Listed - Driven - Impact with vehicle - Rear-end', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE_NOT_LISTED, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_VEHICLE, AccidentDetails.REAR_END, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, No Other Vehicle, No Witness, No Damage', async() => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.NO_OTHER_VEHICLE, PartyWitness.NO, propertyDamage.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});

	test.skip ("ISS-17405 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Driver Not Listed - Impact with other vehicle(s) - Rear-end - No Other Vehicle - NoWitness - @huon @gw ", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-17405" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim with Driver Not Listed - Driven - Impact with vehicle - Rear-end', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.POLICY_HOLDER,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_VEHICLE, AccidentDetails.REAR_END, DriverStatus.DRIVER_NOTLISTED);
		});
		await test.step('Complete additional details - No Passengers, No Injured, Towed, No Other Vehicle, No Witness, No Damage', async() => {
			await additionalDetailsWorkflow.submitAdditionalDetails(PassengerStatus.NO_PASSENGERS, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.NO_OTHER_VEHICLE, PartyWitness.NO, propertyDamage.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});

	test.skip ("ISS-17406 - AutoEFNOL With Login - All other Damage Selection - Driven Case - Someone Else Reporter - Impact with other vehicle(s) - Intersection - 1 Vehicle - 1 Passenger - Cyclist - WithWitness - @huon @gw ", async ({
		env,
		baseURL,
		clubname,
		region,
		username,
		password,
		authenticationWorkflow,
		claimInitiationWorkflow,
		reporterVehicleDriverWorkflow,
		additionalDetailsWorkflow,
		reviewSubmitWorkflow,
	}, testInfo) => {
		testInfo.annotations.push({ type: "test_key", description: "ISS-17406" });

		await test.step('Authenticate user', async () => {
			await authenticationWorkflow.authenticateAndVerifyEmail(token, baseURL, guid, clubname, region, env, username, password);
		});
		await test.step('Initiate claim for all other damage', async () => {
			await claimInitiationWorkflow.initiateClaimFlow(ClaimType.ALL_OTHER_DAMAGE);
		});
		await test.step('File claim with Someone Else reporter - Driven - Impact with vehicle - Intersection', async () => {
			await reporterVehicleDriverWorkflow.selectingReporterVehicleDriver(ReporterType.SOMEONE_ELSE,
				VehicleStatus.VEHICLE1, VehicleStatus.DRIVEN, IncidentType.IMPACT_WITH_VEHICLE, AccidentDetails.INTERSECTION, DriverStatus.DRIVER1);
		});
		await test.step('Complete additional details with other party - 1 Passenger, No Injured, Towed, 1 Vehicle, Cyclist, Witness, Property Damage', async() => {
			await additionalDetailsWorkflow.submitAdditionalDetailsWithOtherParty(PassengerStatus.ONE_PASSENGER, InjuredStatus.NO, VehicleTowed.YES, OtherVehicleCount.ONE_VEHICLE, PedestrianCyclistType.CYCLIST, PartyWitness.YES, propertyDamage.YES, InjuredStatus.NO);
		});
		await test.step('Review and submit claim', async () => {
			await reviewSubmitWorkflow.submitReviewClaim();
		});
	});
});
