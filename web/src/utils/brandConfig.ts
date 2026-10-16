import { getEnvironmentFromHost } from '@ace-clublabs/log-cannon';
import { getBrandConfig as getSharedBrandConfig } from '@lib/common-utils';

export type { BrandConfig } from '@lib/common-utils';

export const getBrandConfig = (brand: 'AAA' | 'WInsurance') =>
  getSharedBrandConfig(brand, getEnvironmentFromHost());
