import { AppSource, IGetInitialDataResponse } from '@lib/types';
import { sleep } from '../../utils/test-utils';
import { GetInitialDataSource } from '../contracts';

export const GetInitialDataStub: GetInitialDataSource =
  async (): Promise<IGetInitialDataResponse> => {
    await sleep(1000);

    return {
      sourceApp: AppSource.ClaimsView,
      policyData: {
        policy: 'ANJ000407834',
        claim: '123456',
        clubCode: '240',
        mode: 'AUTO',
        EnableSplash: false,
        SplashStart: 'March 10th Friday at 5 PM',
        SplashEnd: 'March 14, 2023 at 6:00 a.m.',
        ERSURL: 'https://ers.aaa.com',
        email: 'test@example.com',
        mobileNumber: '(999) 999-1000',
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
  };
