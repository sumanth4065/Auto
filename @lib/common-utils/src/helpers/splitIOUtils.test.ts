import { SplitIOFeatureFlags } from './splitIOUtils';

describe('SplitIOFeatureFlags', () => {
  // ISS-18069: Renamed WInsurance feature flag to follow naming convention
  it('should have AUTO_EFNOL_ENABLE_WINSURANCE with value insuranceclaims_auto-efnol-1stp-winsurance', () => {
    expect(SplitIOFeatureFlags.AUTO_EFNOL_ENABLE_WINSURANCE).toBe('insuranceclaims_auto-efnol-1stp-winsurance');
  });
});
