import { Page } from '@playwright/test';

/**
 * Authentication credentials and configuration
 */
export interface AuthenticationConfig {
  username: string;
  password: string;
  token: string;
  guid: string;
  baseURL: string;
  clubname: string;
  region: string;
  env: string;
}

/**
 * Claim type options
 */
export enum ClaimType {
  ALL_OTHER_DAMAGE = "All other damage",
  GLASS_DAMAGE = "Glass damage",
  // Add other claim types as needed
}

/**
 * Incident type options
 */
export enum IncidentType {
  IMPACT_WITH_VEHICLE = "Impact with other vehicle(s)",
  IMPACT_WITH_ANIMAL = "Impact with an animal",
  IMPACT_WITH_FIXED_OBJECT = "Impact with a fixed object or structure",
  IMPACT_WITH_PEDESTRIAN = "Impact with a pedestrian or cyclist",
  STRUCK_BY_OBJECT = "Struck by a falling or flying object",
  DAMAGED_BY_WEATHER = "Damaged by weather",
  ROLLOVER = "Rollover",
}

/**
 * Accident detail options
 */
export enum AccidentDetails {
  REAR_END = "Rear-end",
  INTERSECTION = "Intersection",
  TURNING = "Turning",
  LANE_CHANGE = "Lane change",
  HIT_AND_RUN = "Hit and run",
  BACKING = "Backing",
}

/**
 * Reporter type options
 */
export enum ReporterType {
  POLICY_HOLDER = "Option1",
  SOMEONE_ELSE = "Option2",
  REPORTER_NOTLISTED="Reporter not listed"
}

/**
 * Vehicle status options
 */
export enum VehicleStatus {
  DRIVEN = "Driven",
  PARKED = "Parked",
  VEHICLE_NOT_LISTED = "Vehicle not listed",
  VEHICLE1 = "Option1",
  VEHICLE2 = "Option2",
}
export enum DriverStatus{
    DRIVER_NOTLISTED="Driver not listed",
    DRIVER1 = "Option1",
    DRIVER2 = "Option2",
}

/**
 * Passenger status options
 */
export enum PassengerStatus {
  NO_PASSENGERS = "No Passengers",
  ONE_PASSENGER = "1 passenger",
  TWO_PASSENGERS = "2 passengers",
}

/**
 * Yes/No options
 */
export enum Option {
  YES = "Yes",
  NO = "No",
}
export enum InjuredStatus{
  YES = "Yes",
  NO = "No",
}
export enum VehicleTowed{
  YES = "Yes",
  NO = "No",
}
export enum PartyWitness{
  YES = "Yes",
  NO = "No",
}

export enum propertyDamage{
    YES = "Yes",
  NO = "No",
}

/**
 * Weather event types
 */
export enum WeatherEvent {
  WIND = "Wind",
  HAIL = "Hail",
  FLOOD_WATER = "Flood/water",
}

/**
 * Pedestrian or cyclist type
 */
export enum PedestrianCyclistType {
  PEDESTRIAN = "Pedestrian",
  CYCLIST = "Cyclist",
  NONE = "",
}

/**
 * Other vehicle count options
 */
export enum OtherVehicleCount {
  NO_OTHER_VEHICLE = "No Other Vehicle Involved",
  ONE_VEHICLE = "1 Vehicle",
  TWO_VEHICLES = "2 Vehicles",
  THREE_OR_MORE = "3 or more vehicles",
}

/**
 * Parked incident type options
 */
export enum ParkedIncidentType {
  HIT_BY_VEHICLE = "Hit by another vehicle",
  DAMAGED_BY_WEATHER = "Damaged by weather",
  ROLLED_AWAY = "Rolled away",
  STRUCK_BY_OBJECT = "Struck by a falling or flying object",
  VANDALIZED = "Vandalized",
  STOLEN = "Stolen",
  INVOLVED_IN_FIRE = "Involved in a fire",
}
