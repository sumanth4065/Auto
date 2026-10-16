import type { Features } from '@ace-clublabs/feature-flags';

/**
 * Subset of feature flags relevant to AutoEFNOL.
 * Add your feature flags here as more are needed.
 */
export type AutoEFNOLFeatureFlags = Pick<
  Record<Features, boolean>,
  | Features.AutoEFNOLCustomVehicle
  | Features.AutoEFNOLCustomReporter
  | Features.AutoEFNOLCustomDriver
  | Features.AutoEFNOLEnableWInsurance
>;
