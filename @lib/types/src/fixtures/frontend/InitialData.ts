import { AppSource, IGetInitialDataResponse } from '../../contracts';

export const initialDataResponseFixture: IGetInitialDataResponse = {
  sourceApp: AppSource.ClaimsView,
  policyData: {
    policy: 'ANJ000407834',
    claim: '',
    clubCode: '240',
    mode: 'AUTO',
    EnableSplash: false,
    ERSURL: 'https://test.com',
    conversionResult: {
      isConversionApplicable: false,
      legacyPolicyNumber: 'ANJ000407834',
      targetPolicyNumber: 'ANJ000407834',
      targetEffectiveDate: undefined,
      policyState: undefined,
      conversionType: undefined
    }
  }
};
