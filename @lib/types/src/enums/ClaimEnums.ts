//TODO Get complete required enum from front-end story
export enum Relationship {
  Spouse = 'spouse',
  Child = 'child',
  Relative = 'relative',
  Friend = 'friend',
  DomesticPartner = 'domesticPartner',
  Employee = 'employee',
  Other = 'other'
}

export enum TrueFalse {
  True = 1,
  False = 0
}

export enum TrueFalseString {
  True = 'true',
  False = 'false'
}

export enum PassengerCount {
  None = 'none',
  One = 'one',
  Two = 'two',
  Three = 'three',
  Four = 'four',
  FiveOrMore = 'five or more',
  Unknown = 'unknown'
}

export enum OtherNonVehicleParties {
  Cyclist = 'cyclist',
  Pedestrian = 'pedestrian',
  CyclistAndPedestrian = 'cyclist and pedestrian',
  None = 'none',
  Unknown = 'unknown'
}

export enum SubmitAutoClaimValidationResult {
  Unknown = 0,
  RequestPayloadMissing = 1 << 0,
  ClaimNumberMissing = 1 << 1,
  ReporterMissing = 1 << 2,
  LossCauseMissing = 1 << 3,
  LossDescriptionMissing = 1 << 4,
  LossVehicleStatusMissing = 1 << 5,
  LossVehicleListedMissingId = 1 << 6,
  LossVehiclePassengerCountMissing = 1 << 7,
  HadInjuriesAnswerMissing = 1 << 8,
  TowedAnswerMissing = 1 << 9,
  DamageDescriptionInsufficient = 1 << 10,
  DriverIdMissing = 1 << 11,
  OtherVehicleCountMissing = 1 << 12,
  SOVYMMKnownAnswerMissing = 1 << 13, //SOV = Single Other Vehicle //YMM = year-make-model
  SOVYMMKnownAndYearMissing = 1 << 14,
  SOVYMMKnownAndMakeMissing = 1 << 15,
  SOVYMMKnownAndModelMissing = 1 << 16,
  SOVIsInsuredAnswerMissing = 1 << 17,
  SOVIsInsuredAndInsCoMissing = 1 << 18,
  SOVHadDriverAnswerMissing = 1 << 19,
  SOVHadDriverFirstNameMissing = 1 << 20,
  SOVHadDriverLastNameMissing = 1 << 21,
  SOVPassengerCountMissing = 1 << 22,
  SOVHadInjuriesAnswerMissing = 1 << 23,
  PassedAllValidations = 1 << 24
}

export enum CarKineticStatus {
  BeingDriven = 'beingDriven',
  Parked = 'parked'
}

export enum PreferredContactMethod {
  email = 'main_email',
  mobile = 'text_msg',
  himarley = 'himarley'
}

export enum NotListed {
  Reporter = 'reporter_not_listed',
  Driver = 'driver_not_listed'
}

export enum KnockoutReason {
  DriverNotListed = 'driver not listed',
  MarketNotSupported = 'market not supported',
  ReporterNotListed = 'reporter not listed',
  VehicleNotListed = 'vehicle not listed'
}

export enum AlertReason {
  MultipleClaimant = 'multiple claimant',
  UnlistedVehicle = 'unlisted vehicle'
}
