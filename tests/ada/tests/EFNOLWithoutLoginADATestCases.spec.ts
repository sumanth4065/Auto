import { test, expect, Browser, MyOptions, chromium } from '../utilities/TestFixture';
import { IntroductionPage } from '../pages/pageRepository/IntroductionPage';
import { AxeUtil } from '../lib/AxeUtil';
import { AxeHelper, AxeLogType } from '@ace-clublabs/playwright-utility';
import testdata from '../testdata/testdata';
import { FileAClaimPage } from '../pages/pageRepository/FileAClaimPage';
import { FilingClaimPage } from '../pages/pageRepository/FilingClaimPage';
import { TransitionPage } from '../pages/pageRepository/TransitionPage';
import { WhereWhenAccidentPage } from '../pages/pageRepository/WhereWhenAccidentPage';
import { WhoIsReportingPage } from '../pages/pageRepository/WhoIsReportingPage';
import { ContactInformationPage } from '../pages/pageRepository/ContactInformationPage';
import { VehicleInvolvedPage } from '../pages/pageRepository/VehicleInvolvedPage';
import { DrivenOrParkedPage } from '../pages/pageRepository/DrivenOrParkedPage';
import { DrivenIncidentDetailsPage } from '../pages/pageRepository/DrivenIncidentDetailsPage';
import { WhoWasDrivingPage } from '../pages/pageRepository/WhoWasDrivingPage';
import { NumberOfVehiclesInvolvedPage } from '../pages/pageRepository/NumberOfVehiclesInvolvedPage';
import { AnyoneInjuredPage } from '../pages/pageRepository/AnyoneInjuredPage';
import { VehicleTowedPage } from '../pages/pageRepository/VehicleTowedPage';
import { VehicleDamagePage } from '../pages/pageRepository/VehicleDamagePage';
import { WhatHappenedPage } from '../pages/pageRepository/WhatHappenedPage';
import { OtherPartyTransitionPage } from '../pages/pageRepository/OtherPartyTransitionPage';
import { OtherPartyYMMPage } from '../pages/pageRepository/OtherPartyYMMPage';
import { OtherPartyInsurancePage } from '../pages/pageRepository/OtherPartyInsurancePage';
import { OtherPartyDriverPage } from '../pages/pageRepository/OtherPartyDriverPage';
import { OtherPartyAnyoneInjuredPage } from '../pages/pageRepository/OtherPartyAnyoneInjuredPage';
import { OtherPartyPedestrianPage } from '../pages/pageRepository/OtherPartyPedestrianPage';
import { OtherPartyWitnessPage } from '../pages/pageRepository/OtherPartyWitnessPage';
import { ReviewClaimPage } from '../pages/pageRepository/ReviewClaimPage';
import { AccidentConfirmationPage } from '../pages/pageRepository/AccidentConfirmationPage';
import { PropertyDamagePage } from '../pages/pageRepository/PropertyDamagePage';
import { ParkedWhatHappenedPage } from '../pages/pageRepository/ParkedWhatHappenedPage';
import { VehicleDamagebyWeatherPage } from '../pages/pageRepository/VehicleDamagebyWeatherPage';
import { KnockOutPage } from '../pages/pageRepository/KnockOutPage';
import { CarDetailsTransitionPage } from '../pages/pageRepository/CarDetailsTransitionPage';
import { HomePage } from '../pages/pageRepository/HomePage';
import { AccessibilityHelper } from '../utilities/AccessibilityHelper';

test.describe('Accessibility ADA test for EFNOL Without Login App', () => {
  let introductionPage: IntroductionPage;
  let axeRequest: AxeUtil;
  let fileAClaimPage: FileAClaimPage;
  let filingClaimPage: FilingClaimPage;
  let transitionPage: TransitionPage;
  let whereWhenAccidentPage: WhereWhenAccidentPage;
  let whoIsReportingPage: WhoIsReportingPage;
  let contactInformationPage: ContactInformationPage;
  let vehicleInvolvedPage: VehicleInvolvedPage;
  let drivenOrParkedPage: DrivenOrParkedPage;
  let drivenIncidentDetailsPage: DrivenIncidentDetailsPage;
  let whoWasDrivingPage: WhoWasDrivingPage;
  let numberOfVehiclesInvolvedPage: NumberOfVehiclesInvolvedPage;
  let anyoneInjuredPage: AnyoneInjuredPage;
  let whatHappenedPage: WhatHappenedPage;
  let vehicleTowedPage: VehicleTowedPage;
  let vehicleDamagePage: VehicleDamagePage;
  let otherPartyTransitionPage: OtherPartyTransitionPage;
  let otherPartyYMMPage: OtherPartyYMMPage;
  let otherPartyInsurancePage: OtherPartyInsurancePage;
  let otherPartyDriverPage: OtherPartyDriverPage;
  let otherPartyAnyoneInjuredPage: OtherPartyAnyoneInjuredPage;
  let otherPartyPedestrianPage: OtherPartyPedestrianPage;
  let otherPartyWitnessPage: OtherPartyWitnessPage;
  let reviewClaimPage: ReviewClaimPage;
  let accidentConfirmationPage: AccidentConfirmationPage;
  let propertyDamagePage: PropertyDamagePage;
  let parkedWhatHappened: ParkedWhatHappenedPage;
  let vehicleDamagebyWeatherPage: VehicleDamagebyWeatherPage;
  let knockOutPage: KnockOutPage;
  let carDetailsTransitionPage: CarDetailsTransitionPage;
  let homePage: HomePage;
  let firstName;
  let lastName;
  let zipCode;
  let policyNumber;

  test.beforeAll(async ({ baseURL, firstname, lastname, zipcode, policynumber, env }, testInfo) => {
    let baseurlnav = baseURL;
    firstName = firstname;
    lastName = lastname;
    zipCode = zipcode;
    policyNumber = policynumber;
    env = env;
    console.log(firstName, lastName, policyNumber, zipCode);
    console.log(`Running Project  ${testInfo.project.name}`);
  });
  test.beforeEach(async ({}, testInfo) => {
    console.log(`Running ${testInfo.title}`);
  });

  test('ISS-16244 - AutoEFNOL Without Login Introduction Page- ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16244' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateTitle();
    await introductionPage.efValidateIntroductionPageDisplay();
    const pageTitle = await introductionPage.page.title();
    await AccessibilityHelper.runScan(introductionPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16245 - AutoEFNOL Without Login File a Claim Page- ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL,env, state, region
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16245' });
    // await page.goto(baseURL);
    homePage = new HomePage(page)
    await homePage.goToIntroPage(env, state, region, baseURL)
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efValidateTitle();

    const pageTitle = await fileAClaimPage.page.title();
    await AccessibilityHelper.runScan(fileAClaimPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16246 - AutoEFNOL Without Login Claim type Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16246' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efValidateTitle();
    const pageTitle = await filingClaimPage.page.title();
    await AccessibilityHelper.runScan(filingClaimPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16247 - AutoEFNOL Without Login Transition Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16247' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efValidateTitle();
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efValidateTitle();
    const pageTitle = await transitionPage.page.title();
    await AccessibilityHelper.runScan(transitionPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16248 - AutoEFNOL Without Login WhenWhere Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16248' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efValidateTitle();
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efValidateTitle();
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efValidateTitle();
    const pageTitle = await whereWhenAccidentPage.page.title();
    await AccessibilityHelper.runScan(whereWhenAccidentPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16249 - AutoEFNOL Without Login Reporter Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16249' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efValidateTitle();
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efValidateTitle();
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    //write code where did incident happend
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    const pageTitle = await whereWhenAccidentPage.page.title();
    await AccessibilityHelper.runScan(whereWhenAccidentPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to Who is reporting the claim?');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efValidateTitle();
    const pageTitle1 = await whoIsReportingPage.page.title();
    await AccessibilityHelper.runScan(whoIsReportingPage.page,pageTitle1, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16250 - AutoEFNOL Without Login Contact Info Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16250' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efValidateTitle();
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efValidateTitle();
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efValidateTitle();
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efValidateTitle();
    const pageTitle = await contactInformationPage.page.title();
    await AccessibilityHelper.runScan(contactInformationPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16251 - AutoEFNOL Without Login Car details transition Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16251' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efValidateTitle();
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efValidateTitle();
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efValidateTitle();
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efValidateTitle();
    const pageTitle = await carDetailsTransitionPage.page.title();
    await AccessibilityHelper.runScan(carDetailsTransitionPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16252 - AutoEFNOL Without Login Vehicle involved Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16252' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efValidateTitle();
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efValidateTitle();
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efValidateTitle();
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efValidateTitle();
    await carDetailsTransitionPage.efValidateCarDetailsTransitionPageDisplay();
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efValidateTitle();
    const pageTitle = await vehicleInvolvedPage.page.title();
    await AccessibilityHelper.runScan(vehicleInvolvedPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16253 - AutoEFNOL Without Login DrivenOrParked Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16253' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efValidateTitle();
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efValidateTitle();
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efValidateTitle();
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efValidateTitle();
    await carDetailsTransitionPage.efValidateCarDetailsTransitionPageDisplay();
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efValidateTitle();
    const pageTitle = await drivenOrParkedPage.page.title();
    await AccessibilityHelper.runScan(drivenOrParkedPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16254 - AutoEFNOL Without Login Driven IncidentDetailsPage Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16254' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efValidateTitle();
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efValidateTitle();
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efValidateTitle();
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efValidateTitle();
    await carDetailsTransitionPage.efValidateCarDetailsTransitionPageDisplay();
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efValidateTitle();
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    await drivenIncidentDetailsPage.efValidateTitle();
    const pageTitle = await drivenIncidentDetailsPage.page.title();
    await AccessibilityHelper.runScan(drivenIncidentDetailsPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });
  
  test('ISS-16255 - AutoEFNOL Without Login Driver Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16255' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efValidateTitle();
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efValidateTitle();
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efValidateTitle();
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efValidateTitle();
    await carDetailsTransitionPage.efValidateCarDetailsTransitionPageDisplay();
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efValidateTitle();
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle', 'Intersection');
    console.log('Navigated to Driver Page');
    whoWasDrivingPage = new WhoWasDrivingPage(page);
    await whoWasDrivingPage.efValidateTitle();
    const pageTitle = await whoWasDrivingPage.page.title();
    await AccessibilityHelper.runScan(whoWasDrivingPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16256 - AutoEFNOL Without Login Injured Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16256' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    //await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle');
    await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle', 'Intersection');
    console.log('Navigated to Driver Page');
    whoWasDrivingPage = new WhoWasDrivingPage(page);
    await whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved('Option1');
    console.log('Navigated to Passengers Page');
    await whoWasDrivingPage.efNavigatetoDrivenOrParked('Option1','No passengers');
    console.log('Navigated to Injured Page');
    anyoneInjuredPage = new AnyoneInjuredPage(page);
    await anyoneInjuredPage.efValidateTitle();
    const pageTitle = await anyoneInjuredPage.page.title();
    await AccessibilityHelper.runScan(anyoneInjuredPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16257 - AutoEFNOL Without Login WhatHappened Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16257' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Who was driving the vehicle');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle', 'Intersection');
    console.log('Who was driving the vehicle Page');//renamed page
    whoWasDrivingPage = new WhoWasDrivingPage(page);
    await whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved('Option1');                      
    console.log('Not counting the driver, how many passengers were in the vehicle');
    await whoWasDrivingPage.efNavigatetoDrivenOrParked('Option1','1 passenger');
    console.log('Navigated to Injured Page');
    anyoneInjuredPage = new AnyoneInjuredPage(page);
    await anyoneInjuredPage.efNavigatetoWhatHappened('No');
    console.log('Navigated to Additonaldetails Page');
    whatHappenedPage = new WhatHappenedPage(page);
    await whatHappenedPage.efValidateTitle();
    const pageTitle = await whatHappenedPage.page.title();
    await AccessibilityHelper.runScan(whatHappenedPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });
  test('ISS-16258 - AutoEFNOL Without Login VehicleTowed Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16258' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle', 'Intersection');
    console.log('Navigated to Driver Page');
    whoWasDrivingPage = new WhoWasDrivingPage(page);
    await whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved('Option1');
    console.log('Navigated to Passengers Page');
    await whoWasDrivingPage.efNavigatetoDrivenOrParked('Option1','No passengers');
    console.log('Navigated to Injured Page');
    anyoneInjuredPage = new AnyoneInjuredPage(page);
    await anyoneInjuredPage.efNavigatetoWhatHappened('No');
    console.log('Navigated to Additonaldetails Page');
    whatHappenedPage = new WhatHappenedPage(page);
    await whatHappenedPage.efNavigatetoVehicleTowedPage();
    console.log('Navigated to Towed Page');
    vehicleTowedPage = new VehicleTowedPage(page);
    await vehicleTowedPage.efValidateTitle();
    const pageTitle = await vehicleTowedPage.page.title();
    await AccessibilityHelper.runScan(vehicleTowedPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16259 - AutoEFNOL Without Login VehicleDamage Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16259' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle', 'Intersection');
    console.log('Navigated to Driver Page');
    whoWasDrivingPage = new WhoWasDrivingPage(page);
    await whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved('Option1');
    console.log('Navigated to Passengers Page');
    await whoWasDrivingPage.efNavigatetoDrivenOrParked('Option1','No passengers');
    console.log('Navigated to Injured Page');
    anyoneInjuredPage = new AnyoneInjuredPage(page);
    await anyoneInjuredPage.efNavigatetoWhatHappened('No');
    console.log('Navigated to Additonaldetails Page');
    whatHappenedPage = new WhatHappenedPage(page);
    await whatHappenedPage.efNavigatetoVehicleTowedPage();
    console.log('Navigated to Towed Page');
    vehicleTowedPage = new VehicleTowedPage(page);
    await vehicleTowedPage.efNavigatetoVehicleDamage('Yes');
    console.log('Navigated to VehicleDamage Page');
    vehicleDamagePage = new VehicleDamagePage(page);
    await vehicleDamagePage.efValidateTitle();
    const pageTitle = await vehicleDamagePage.page.title();
    await AccessibilityHelper.runScan(vehicleDamagePage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16260 - AutoEFNOL Without Login Number Of Vehicles Involved Number Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16260' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    //await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle');
    await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle', 'Intersection');
    console.log('Navigated to Driver Page');
    whoWasDrivingPage = new WhoWasDrivingPage(page);
    await whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved('Option1');
    console.log('Navigated to Passengers Page');
    await whoWasDrivingPage.efNavigatetoDrivenOrParked('Option1','No passengers');
    console.log('Navigated to Injured Page');
    anyoneInjuredPage = new AnyoneInjuredPage(page);
    await anyoneInjuredPage.efNavigatetoWhatHappened('No');
    console.log('Navigated to Additonaldetails Page');
    whatHappenedPage = new WhatHappenedPage(page);
    await whatHappenedPage.efNavigatetoVehicleTowedPage();
    console.log('Navigated to Towed Page');
    vehicleTowedPage = new VehicleTowedPage(page);
    await vehicleTowedPage.efNavigatetoVehicleDamage('Yes');
    console.log('Navigated to VehicleDamage Page');
    vehicleDamagePage = new VehicleDamagePage(page);
    await vehicleDamagePage.efNavigatetoOtherPartyTransitionPage();
    console.log('Navigated to Number Of Vehicles Involved Number Page');
    numberOfVehiclesInvolvedPage = new NumberOfVehiclesInvolvedPage(page);
    await numberOfVehiclesInvolvedPage.efValidateTitle();
    const pageTitle = await numberOfVehiclesInvolvedPage.page.title();
    await AccessibilityHelper.runScan(numberOfVehiclesInvolvedPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16261 - AutoEFNOL Without Login OtherPartyTransition Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16261' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle', 'Intersection');
    console.log('Navigated to Driver Page');
    whoWasDrivingPage = new WhoWasDrivingPage(page);
    await whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved('Option1');
    console.log('Navigated to Passengers Page');
    await whoWasDrivingPage.efNavigatetoDrivenOrParked('Option1','No passengers');
    console.log('Navigated to Injured Page');
    anyoneInjuredPage = new AnyoneInjuredPage(page);
    await anyoneInjuredPage.efNavigatetoWhatHappened('No');
    console.log('Navigated to Additonaldetails Page');
    whatHappenedPage = new WhatHappenedPage(page);
    await whatHappenedPage.efNavigatetoVehicleTowedPage();
    console.log('Navigated to Towed Page');
    vehicleTowedPage = new VehicleTowedPage(page);
    await vehicleTowedPage.efNavigatetoVehicleDamage('Yes');
    console.log('Navigated to VehicleDamage Page');
    vehicleDamagePage = new VehicleDamagePage(page);
    await vehicleDamagePage.efNavigatetoOtherPartyTransitionPage();
    console.log('Navigated to Number Of Vehicles Involved Number Page');
    numberOfVehiclesInvolvedPage = new NumberOfVehiclesInvolvedPage(page);
    await numberOfVehiclesInvolvedPage.efNavigatetoAnyoneInjured('No Other Vehicle Involved');
    console.log('Navigated to otherpartyinformationtransition Page');
    otherPartyTransitionPage = new OtherPartyTransitionPage(page);
    await otherPartyTransitionPage.efValidateTitle();
    const pageTitle = await otherPartyTransitionPage.page.title();
    await AccessibilityHelper.runScan(otherPartyTransitionPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16262 - AutoEFNOL Without Login OtherPartyPedestrian Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16262' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle', 'Intersection');
    console.log('Navigated to Driver Page');
    whoWasDrivingPage = new WhoWasDrivingPage(page);
    await whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved('Option1');
    console.log('Navigated to Passengers Page');
    await whoWasDrivingPage.efNavigatetoDrivenOrParked('Option1','No passengers');
    console.log('Navigated to Injured Page');
    anyoneInjuredPage = new AnyoneInjuredPage(page);
    await anyoneInjuredPage.efNavigatetoWhatHappened('No');
    console.log('Navigated to Additonaldetails Page');
    whatHappenedPage = new WhatHappenedPage(page);
    await whatHappenedPage.efNavigatetoVehicleTowedPage();
    console.log('Navigated to Towed Page');
    vehicleTowedPage = new VehicleTowedPage(page);
    await vehicleTowedPage.efNavigatetoVehicleDamage('Yes');
    console.log('Navigated to VehicleDamage Page');
    vehicleDamagePage = new VehicleDamagePage(page);
    await vehicleDamagePage.efNavigatetoOtherPartyTransitionPage();
    console.log('Navigated to Number Of Vehicles Involved Number Page');
    numberOfVehiclesInvolvedPage = new NumberOfVehiclesInvolvedPage(page);
    await numberOfVehiclesInvolvedPage.efNavigatetoAnyoneInjured('No Other Vehicle Involved');
    console.log('Navigated to otherpartyinformationtransition Page');
    otherPartyTransitionPage = new OtherPartyTransitionPage(page);
    await otherPartyTransitionPage.efNavigatetoOtherPartyYMMPage('No Other Vehicle');
    console.log('Navigated to pedestrianorcyclistinvolved Page');
    otherPartyPedestrianPage = new OtherPartyPedestrianPage(page);
    await otherPartyPedestrianPage.efValidateTitle();
    const pageTitle = await otherPartyPedestrianPage.page.title();
    await AccessibilityHelper.runScan(otherPartyPedestrianPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16263 - AutoEFNOL Without Login OtherPartyWitness Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16263' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle', 'Intersection');
    console.log('Navigated to Driver Page');
    whoWasDrivingPage = new WhoWasDrivingPage(page);
    await whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved('Option1');
    console.log('Navigated to Passengers Page');
    await whoWasDrivingPage.efNavigatetoDrivenOrParked('Option1','No passengers');
    console.log('Navigated to Injured Page');
    anyoneInjuredPage = new AnyoneInjuredPage(page);
    await anyoneInjuredPage.efNavigatetoWhatHappened('No');
    console.log('Navigated to Additonaldetails Page');
    whatHappenedPage = new WhatHappenedPage(page);
    await whatHappenedPage.efNavigatetoVehicleTowedPage();
    console.log('Navigated to Towed Page');
    vehicleTowedPage = new VehicleTowedPage(page);
    await vehicleTowedPage.efNavigatetoVehicleDamage('Yes');
    console.log('Navigated to VehicleDamage Page');
    vehicleDamagePage = new VehicleDamagePage(page);
    await vehicleDamagePage.efNavigatetoOtherPartyTransitionPage();
    console.log('Navigated to Number Of Vehicles Involved Number Page');
    numberOfVehiclesInvolvedPage = new NumberOfVehiclesInvolvedPage(page);
    await numberOfVehiclesInvolvedPage.efNavigatetoAnyoneInjured('No Other Vehicle Involved');
    console.log('Navigated to otherpartyinformationtransition Page');
    otherPartyTransitionPage = new OtherPartyTransitionPage(page);
    await otherPartyTransitionPage.efNavigatetoOtherPartyYMMPage('No Other Vehicle');
    console.log('Navigated to pedestrianorcyclistinvolved Page');
    otherPartyPedestrianPage = new OtherPartyPedestrianPage(page);
    await otherPartyPedestrianPage.efNavigatetoOtherPartyWitnessPage();
    console.log('Navigated to witnessinfo Page');
    otherPartyWitnessPage = new OtherPartyWitnessPage(page);
    await otherPartyWitnessPage.efValidateTitle();
    const pageTitle = await otherPartyWitnessPage.page.title();
    await AccessibilityHelper.runScan(otherPartyWitnessPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16264 - AutoEFNOL Without Login PropertyDamage Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16264' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle', 'Intersection');
    console.log('Navigated to Driver Page');
    whoWasDrivingPage = new WhoWasDrivingPage(page);
    await whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved('Option1');
    console.log('Navigated to Passengers Page');
    await whoWasDrivingPage.efNavigatetoDrivenOrParked('Option1','No passengers');
    console.log('Navigated to Injured Page');
    anyoneInjuredPage = new AnyoneInjuredPage(page);
    await anyoneInjuredPage.efNavigatetoWhatHappened('No');
    console.log('Navigated to Additonaldetails Page');
    whatHappenedPage = new WhatHappenedPage(page);
    await whatHappenedPage.efNavigatetoVehicleTowedPage();
    console.log('Navigated to Towed Page');
    vehicleTowedPage = new VehicleTowedPage(page);
    await vehicleTowedPage.efNavigatetoVehicleDamage('Yes');
    console.log('Navigated to VehicleDamage Page');
    vehicleDamagePage = new VehicleDamagePage(page);
    await vehicleDamagePage.efNavigatetoOtherPartyTransitionPage();
    console.log('Navigated to Number Of Vehicles Involved Number Page');
    numberOfVehiclesInvolvedPage = new NumberOfVehiclesInvolvedPage(page);
    await numberOfVehiclesInvolvedPage.efNavigatetoAnyoneInjured('No Other Vehicle Involved');
    console.log('Navigated to otherpartyinformationtransition Page');
    otherPartyTransitionPage = new OtherPartyTransitionPage(page);
    await otherPartyTransitionPage.efNavigatetoOtherPartyYMMPage('No Other Vehicle');
    console.log('Navigated to pedestrianorcyclistinvolved Page');
    otherPartyPedestrianPage = new OtherPartyPedestrianPage(page);
    await otherPartyPedestrianPage.efValidateTitle();
    await otherPartyPedestrianPage.efNavigatetoOtherPartyWitnessPage();
    console.log('Navigated to witnessinfo Page');
    otherPartyWitnessPage = new OtherPartyWitnessPage(page);
    await otherPartyWitnessPage.efNavigatetoReviewClaimPage('No');
    console.log('Navigated to additionalpropertydamage Page');
    propertyDamagePage = new PropertyDamagePage(page);
    await propertyDamagePage.efValidateTitle();
    const pageTitle = await propertyDamagePage.page.title();
    await AccessibilityHelper.runScan(propertyDamagePage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16265 - AutoEFNOL Without Login ReviewClaim Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16265' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle', 'Intersection');
    console.log('Navigated to Driver Page');
    whoWasDrivingPage = new WhoWasDrivingPage(page);
    await whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved('Option1');
    console.log('Navigated to Passengers Page');
    await whoWasDrivingPage.efNavigatetoDrivenOrParked('Option1','No passengers');
    console.log('Navigated to Injured Page');
    anyoneInjuredPage = new AnyoneInjuredPage(page);
    await anyoneInjuredPage.efNavigatetoWhatHappened('No');
    console.log('Navigated to Additonaldetails Page');
    whatHappenedPage = new WhatHappenedPage(page);
    await whatHappenedPage.efNavigatetoVehicleTowedPage();
    console.log('Navigated to Towed Page');
    vehicleTowedPage = new VehicleTowedPage(page);
    await vehicleTowedPage.efNavigatetoVehicleDamage('Yes');
    console.log('Navigated to VehicleDamage Page');
    vehicleDamagePage = new VehicleDamagePage(page);
    await vehicleDamagePage.efNavigatetoOtherPartyTransitionPage();
    console.log('Navigated to Number Of Vehicles Involved Number Page');
    numberOfVehiclesInvolvedPage = new NumberOfVehiclesInvolvedPage(page);
    await numberOfVehiclesInvolvedPage.efNavigatetoAnyoneInjured('No Other Vehicle Involved');
    console.log('Navigated to otherpartyinformationtransition Page');
    otherPartyTransitionPage = new OtherPartyTransitionPage(page);
    await otherPartyTransitionPage.efNavigatetoOtherPartyYMMPage('No Other Vehicle');
    console.log('Navigated to pedestrianorcyclistinvolved Page');
    otherPartyPedestrianPage = new OtherPartyPedestrianPage(page);
    await otherPartyPedestrianPage.efValidateTitle();
    await otherPartyPedestrianPage.efNavigatetoOtherPartyWitnessPage();
    console.log('Navigated to witnessinfo Page');
    otherPartyWitnessPage = new OtherPartyWitnessPage(page);
    await otherPartyWitnessPage.efNavigatetoReviewClaimPage('No');
    console.log('Navigated to additionalpropertydamage Page');
    propertyDamagePage = new PropertyDamagePage(page);
    await propertyDamagePage.efConfirmAndNavigatetoReviewPage('YES');
    console.log('Navigated to accidentreview Page');
    reviewClaimPage = new ReviewClaimPage(page);
    await reviewClaimPage.efValidateTitle();
    const pageTitle = await reviewClaimPage.page.title();
    await AccessibilityHelper.runScan(reviewClaimPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });

  test('ISS-16266 - AutoEFNOL Without Login Confirmation Page - ADA Scan @club ', async ({
    isMobile,
    page,
    baseURL
  }, testInfo) => {
    testInfo.annotations.push({ type: 'test_key', description: 'ISS-16266' });
    await page.goto(baseURL);
    const pismobile = isMobile ? 'Mobile' : 'Desktop';
    console.log('Navigated to Introduction Page');
    introductionPage = new IntroductionPage(page);
    await introductionPage.efValidateIntroductionPageDisplay();
    await introductionPage.efNavigatetoFileACliamPage(firstName, lastName, policyNumber, zipCode);
    console.log('Navigated to File A Claim Page');
    fileAClaimPage = new FileAClaimPage(page);
    await fileAClaimPage.efNavigatetoFilingClaimPage();
    console.log('Navigated to Claim Type Page');
    filingClaimPage = new FilingClaimPage(page);
    await filingClaimPage.efNavigatetoTransitionPage('All other damage');
    console.log('Navigated to Transition Page');
    transitionPage = new TransitionPage(page);
    await transitionPage.efNavigatetoWhereWhenAccidentPage();
    console.log('Navigated to Where When Accident Page');
    whereWhenAccidentPage = new WhereWhenAccidentPage(page);
    await whereWhenAccidentPage.efNavigatetoCreateClaimTransitionPage();
    console.log('Navigated to Where did the incident happen page');
    await whereWhenAccidentPage.efValidateTitle();
    await whereWhenAccidentPage.efNavigatetoWhereDidIncidentHappenPage();
    console.log('Navigated to ClaimReporter Page');
    whoIsReportingPage = new WhoIsReportingPage(page);
    await whoIsReportingPage.efNavigatetoContactInfoPage1('Option1');
    console.log('Navigated to Contact Info Page');
    contactInformationPage = new ContactInformationPage(page);
    await contactInformationPage.efNavigatetoCarDetailsTransitionPage();
    console.log('Navigated to Car Damage Transition Page');
    carDetailsTransitionPage = new CarDetailsTransitionPage(page);
    await carDetailsTransitionPage.efNavigatetoVehicleInvolvedPage();
    console.log('Navigated to Car Involved Page');
    vehicleInvolvedPage = new VehicleInvolvedPage(page);
    await vehicleInvolvedPage.efNavigatetoDrivenOrParked('Option1');
    console.log('Navigated to carkineticstatus Page');
    drivenOrParkedPage = new DrivenOrParkedPage(page);
    await drivenOrParkedPage.efNavigatetoDrivenOrParked('Driven');
    console.log('Navigated to drivenwhathappened Page');
    drivenIncidentDetailsPage = new DrivenIncidentDetailsPage(page);
    await drivenIncidentDetailsPage.efNavigatetoWhoWasDriving('Impacted with another vehicle', 'Intersection');
    console.log('Navigated to Driver Page');
    whoWasDrivingPage = new WhoWasDrivingPage(page);
    await whoWasDrivingPage.efNavigatetoNumberOfVehiclesInvolved('Option1');
    console.log('Navigated to Passengers Page');
    await whoWasDrivingPage.efNavigatetoDrivenOrParked('Option1','No passengers');
    console.log('Navigated to Injured Page');
    anyoneInjuredPage = new AnyoneInjuredPage(page);
    await anyoneInjuredPage.efNavigatetoWhatHappened('No');
    console.log('Navigated to Additonaldetails Page');
    whatHappenedPage = new WhatHappenedPage(page);
    await whatHappenedPage.efNavigatetoVehicleTowedPage();
    console.log('Navigated to Towed Page');
    vehicleTowedPage = new VehicleTowedPage(page);
    await vehicleTowedPage.efNavigatetoVehicleDamage('Yes');
    console.log('Navigated to VehicleDamage Page');
    vehicleDamagePage = new VehicleDamagePage(page);
    await vehicleDamagePage.efNavigatetoOtherPartyTransitionPage();
    console.log('Navigated to Number Of Vehicles Involved Number Page');
    numberOfVehiclesInvolvedPage = new NumberOfVehiclesInvolvedPage(page);
    await numberOfVehiclesInvolvedPage.efNavigatetoAnyoneInjured('No Other Vehicle Involved');
    console.log('Navigated to otherpartyinformationtransition Page');
    otherPartyTransitionPage = new OtherPartyTransitionPage(page);
    await otherPartyTransitionPage.efNavigatetoOtherPartyYMMPage('No Other Vehicle');
    console.log('Navigated to pedestrianorcyclistinvolved Page');
    otherPartyPedestrianPage = new OtherPartyPedestrianPage(page);
    await otherPartyPedestrianPage.efValidateTitle();
    await otherPartyPedestrianPage.efNavigatetoOtherPartyWitnessPage();
    console.log('Navigated to witnessinfo Page');
    otherPartyWitnessPage = new OtherPartyWitnessPage(page);
    await otherPartyWitnessPage.efNavigatetoReviewClaimPage('No');
    console.log('Navigated to additionalpropertydamage Page');
    propertyDamagePage = new PropertyDamagePage(page);
    await propertyDamagePage.efConfirmAndNavigatetoReviewPage('YES');
    console.log('Navigated to accidentreview Page');
    reviewClaimPage = new ReviewClaimPage(page);
    await reviewClaimPage.efNavigatetoConfirmationPage();
    console.log('Navigated to confirmation Page');
    accidentConfirmationPage = new AccidentConfirmationPage(page);
    const pageTitle = await accidentConfirmationPage.page.title();
    await AccessibilityHelper.runScan(accidentConfirmationPage.page,pageTitle, testdata.axetags,pismobile,testInfo);
  });
});
