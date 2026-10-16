import { IYearMakeModel } from '@lib/types';
import { YesNoUnknown } from '@ace-clublabs/iss-common-auto-efnol-models';
import { AllowedVehicleYears } from '@lib/utility';

export const UnknownYearMakeModel = {
  year: AllowedVehicleYears?.min,
  make: YesNoUnknown.Unknown,
  model: YesNoUnknown.Unknown
} as IYearMakeModel;