import type {
  ConversionType,
  IPolicyConversionResult
} from '@ace-clublabs/iss-common-shared-claims-models';

export interface IPolicyConversionRequest {
  policyNumber: string;
  conversionType: ConversionType;
}

export type PolicyConversionSource = (
  body: IPolicyConversionRequest
) => Promise<IPolicyConversionResult>;
