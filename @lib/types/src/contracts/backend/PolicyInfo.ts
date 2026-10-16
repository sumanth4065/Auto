export interface IPolicyInfoResponse {
  data: IAutoPolicyInfoResponseSummary;
}

export interface IAutoPolicyInfoResponseSummary {
  RM4HDABCout: {
    PolicyTransDetail: IAutoPolicyTransDetails;
    PolicyInfo: IPolicyInfo;
  };
}

export interface IAutoPolicyTransDetails {
  ProductType: string;
  Class: string;
  AutoPolicy: IAutoPolicy;
}

export interface IAutoPolicy {
  Vehicles: {
    Vehicle: IVehicle | IVehicle[];
  };
  Drivers: {
    Driver: IDriver | IDriver[];
  };
}

export interface IBillingSummarys {
  BillingSummary: IBillingSummary[] | IBillingSummary;
}

export interface IPolicyInfo {
  BillingSummarys: IBillingSummarys;
  Status: {
    _Code: string;
    __text: string;
  };
}

export interface IBillingSummary {
  TermFrom: string;
  TermTo: string;
  InceptionDate: string;
}

export interface IVehicle {
  Sequence: string; //"0001",
  Status: string; //"C",
  Type: string; //"REGL",
  TypeDesc: string; //"REGULAR VEHICLE",
  Year: string; //"2007",
  MakeModel: string; //"CHRY 300 HEMI C",
  Make: string; //"CHRY",
  MakeDesc: string; //"CHRYSLER",
  Model: string; //"300 HEMI C",
  BodyStyle: string; //"4 DOOR",
  VIN: string; //"2C3LA63H37H617403"
}

export interface IDriver {
  Sequence: string; //"0001",
  ClientNumber: string; //"319456736",
  FirstName: string; //"REMATO",
  LastName: string; //"KANJYOUSEFBASHAZADA",
  HomePhone: string; //"3107554429",
  Type: string; //"PH",
  Gender: string; //"M",
  DOB: string; //"04/14/1987",
}

export interface IAutoPolicyInfoBackendRequest {
  fullPolicyNumber: string;
  clubCode: string;
}

/** schema definition of response from get-auto-policy-info-details-proxy lambda
 *   in insurancepolicyinfo AWS account
 * @overview IAutoPolicyInfoOverview: policy overview
 */
export interface IAutoPolicyInfoBackendResponse {
  overview: IAutoPolicyInfoOverview;
}

/**
 * this interface is used in IHomPolicyInfoResponse as overview property
 * @policyNumber string
 * @productType string
 * @effective IAutoPolicyEffectiveDate
 * @class string
 */
export interface IAutoPolicyInfoOverview {
  policyNumber: string;
  productType: string;
  effective: IAutoPolicyEffectiveDate;
  class: string;
  priorPolicyNumber: string;
  tenant: string;
}
/**
 * this interface is used in IAutoPolicyInfoOverview as effective property
 */
export interface IAutoPolicyEffectiveDate {
  start: string;
  end: string;
}
