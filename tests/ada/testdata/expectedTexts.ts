/**
 * Expected UI Text Constants for ADA Tests
 * 
 * This file contains all expected text values used in verification methods
 * across page objects. Centralizing these values makes tests easier to maintain
 * when content changes.
 * 
 * Organized by page for easy navigation.
 */

export const EXPECTED_TEXTS = {
  // Introduction Page
  LOGIN_TITLE: "AAA | Login",  
  AUTO_EFNOL_TITLE: "AAA | Auto EFNOL", 
  AUTO_POLICY_CHANGE:"AAA - Policy Change" ,
  INTRO_TITLE: "Let’s get the AAA policyholder information",
  INTRO_POLICY_CANCELLED_MESSAGE: "Your policy has expired or been canceled. Please call 1-866-284-7222 for assistance.",
  INTRO_INVALID_DATA_MESSAGE: "The information entered does not match our records.",
  // File A Claim Page
  FILE_CLAIM_TITLE: "How the online claims process works",
  FILE_CLAIM_SUBTITLE: "Filing a claim will take about 10 minutes. After you submit a claim, a representative will reach out to follow up.",
  FILE_CLAIM_CONTENT1: "Having the following handy can make the process easier :",

  // Filing Claim Page
  FILING_CLAIM_TITLE: "Why are you filing a claim?",
  FILING_CLAIM_GLASS_DAMAGE: "Glass only damage",
  FILING_CLAIM_ALL_OTHER_DAMAGE: "All other damage",
  FILING_CLAIM_GLASS_DAMAGE_DESC: "Damage to the front windshield, quarter/vent glass, door glass, and/or rear windshield",
  FILING_CLAIM_ALL_OTHER_DAMAGE_DESC: "Collision, theft, fire, damage to the sunroof or side view mirrors, and other damages",

  // Who Is Reporting Page
  WHO_REPORTING_TITLE: "Who is reporting the claim?",
  WHO_REPORTING_SUBTITLE: "Select the reporter",

  // Contact Information Page
  CONTACT_INFO_TITLE: "What's your contact information?",
  CONTACT_INFO_SUBTITLE: "We'll use this information to contact you regarding your claim.",
  CONTACT_INFO_EMAIL: "Email",
  CONTACT_INFO_MOBILE: "Mobile number",
  CONTACT_INFO_DISCLAIMER: "By selecting \"Next,\" you acknowledge that it's OK for us, or parties that perform services on AAA's behalf, to contact you regarding your claim with the information above. Message and data rates may apply. You can opt out of email and/or text messaging at any time.",

  // Car Details Transition Page
  CAR_DETAILS_TITLE: "Now, we'll need details about your vehicle",
  CAR_DETAILS_SUBTITLE: "We'll get some information about your vehicle, the driver, and the details of the incident.",

  // Anyone Injured Page
  ANYONE_INJURED_TITLE: "Was anyone in your car injured?",

  // Vehicle Damage Page
  VEHICLE_DAMAGE_TITLE: "Please tell us about the damage to your vehicle",
  VEHICLE_DAMAGE_DESCRIPTION: "All Other Damage",

  // Vehicle Towed Page
  VEHICLE_TOWED_TITLE: "Was the vehicle towed?",

  // Number of Vehicles Involved Page
  NUM_VEHICLES_TITLE: "Not counting your vehicle, how many other cars were involved?",
  NUM_VEHICLES_TWO_VEHICLE_POPUP: "A claims representative will contact you to gather details about the other vehicles once the claim is filed. Select OK to continue filling a claim.",

  // Vehicle Involved Page
  VEHICLE_INVOLVED_TITLE: "Which vehicle was involved in the incident?",

  // Driven or Parked Page
  DRIVEN_OR_PARKED_TITLE: "Was someone driving or was the car parked during the incident?",

  // Driven What Happened Page
  DRIVEN_WHAT_HAPPENED_TITLE: "What happened to the car while it was being driven?",

  // Parked What Happened Page
  PARKED_WHAT_HAPPENED_TITLE: "What happened to the car while it was parked?",

  // Incident Info Intro / Transition Page
  INCIDENT_INFO_TITLE: "Let's start with some information about the incident",
  INCIDENT_INFO_SUBTITLE: "We'll get more details about the incident, your vehicle, and other cars/people involved.",

  // Where When Accident Page
  WHERE_WHEN_TITLE: "When and where did the incident happened?",
  WHERE_WHEN_DATE: "Date of the incident",
  WHERE_WHEN_TIME: "Approximate time of the incident",
  WHERE_WHEN_STATE: "Select the state",
  WHERE_WHEN_CITY: "City",
  WHERE_WHEN_STREET: "Street",
  WHERE_WHEN_STATE_LABEL: "State",
  WHERE_WHEN_ZIPCODE: "ZIP code (optional)",

  // What Happened Page
  WHAT_HAPPENED_TITLE: "Please tell us what happened",

  // Vehicle Damage by Weather Page
  VEHICLE_DAMAGE_WEATHER_TITLE: "What caused the weather damage?",

  // Who Was Driving Page
  WHO_WAS_DRIVING_TITLE: "Who was driving the vehicle?",

  // Property Damage Page
  PROPERTY_DAMAGE_TITLE: "In addition to your vehicle damage, was there any other property damage (poles, signs, fences, buildings, etc.)",

  // Other Party Transition Page
  OTHER_PARTY_TITLE: "Lastly, let's get some information about the other party.",
  OTHER_PARTY_SUBTITLE: "We'll get more information about the other vehicle(s), insurance, individuals involved, and any witness information.",

  // Other Party Anyone Injured Page
  OTHER_PARTY_ANYONE_INJURED_TITLE: "Was anyone in this car injured?",

  // Other Party Pedestrian Page
  OTHER_PARTY_PEDESTRIAN_TITLE: "Were any pedestrians or cyclists involved in the incident?",

  // Other Party Witness Page
  OTHER_PARTY_WITNESS_TITLE: "Were there any witnesses?",

  // Other Party Insurance Page
  OTHER_PARTY_INSURANCE_TITLE: "Tell us about the other party's insurance company",
  OTHER_PARTY_INSURANCE_COMPANY: "Insurance company",
  OTHER_PARTY_INSURANCE_POLICY: "Policy number(optional)",

  // Other Party Driver Page
  OTHER_PARTY_DRIVER_TITLE: "Tell us about the other driver",

  // Other Party YMM Page
  OTHER_PARTY_YMM_TITLE: "What's the year, make, and model of the other party's car?",
  OTHER_PARTY_YMM_YEAR: "Year",
  OTHER_PARTY_YMM_MAKE: "Make",
  OTHER_PARTY_YMM_MODEL: "Model",

  // Review Claim Page
  REVIEW_CLAIM_TITLE: "Auto claim",

  // Accident Confirmation Page
  ACCIDENT_CONFIRMATION_HEADER: "Your claim has been filed",
};

// Export individual sections if needed for better organization
export const INTRO_PAGE_TEXTS = {
  TITLE: EXPECTED_TEXTS.INTRO_TITLE,
};

export const CONTACT_INFO_TEXTS = {
  TITLE: EXPECTED_TEXTS.CONTACT_INFO_TITLE,
  SUBTITLE: EXPECTED_TEXTS.CONTACT_INFO_SUBTITLE,
  EMAIL: EXPECTED_TEXTS.CONTACT_INFO_EMAIL,
  MOBILE: EXPECTED_TEXTS.CONTACT_INFO_MOBILE,
  DISCLAIMER: EXPECTED_TEXTS.CONTACT_INFO_DISCLAIMER,
};

export const CAR_DETAILS_TEXTS = {
  TITLE: EXPECTED_TEXTS.CAR_DETAILS_TITLE,
  SUBTITLE: EXPECTED_TEXTS.CAR_DETAILS_SUBTITLE,
};

// Default export for easy import
export default EXPECTED_TEXTS;
