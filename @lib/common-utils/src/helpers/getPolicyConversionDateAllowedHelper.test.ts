import * as getSecretHelper from './getSecretHelper';
import {
  getPolicyConversionDateAllowed,
} from './getPolicyConversionDateAllowedHelper';

import { Logger } from '@ace-clublabs/aws-lambda-v3';
import { ClubCodes } from '@ace-clublabs/iss-common-util';
import { RemoteAppConfigHelper } from './RemoteAppConfigHelper';

const getSecretHelperSpy = jest.spyOn(getSecretHelper, 'getSecretHelper');

const loggerMock = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
} as any as Logger;

describe('getPolicyConversionDateAllowed function', () => {
  const remoteAppConfigSpy = jest.spyOn(RemoteAppConfigHelper.prototype, 'getTreatment');
  const remoteAppInitialzeConfigSpy = jest
    .spyOn(RemoteAppConfigHelper.prototype, 'initialize')
    .mockImplementation(() => Promise.resolve());

  beforeEach(() => {
    getSecretHelperSpy.mockImplementationOnce(async () => 'some-key');
    remoteAppConfigSpy.mockImplementation(() => Promise.resolve('on'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Should return a valid feature flag "on" with the allowed clubcode and policyEffectiveDate on or after 04/01/2024 from split.io', async () => {
    const policyEffectiveDate = '04/01/2024';
    const actualResult = await getPolicyConversionDateAllowed(
      ClubCodes.ACMO,
      policyEffectiveDate,
      loggerMock
    );

    expect(remoteAppInitialzeConfigSpy).toHaveBeenCalledTimes(1);
    expect(remoteAppConfigSpy).toHaveBeenCalledTimes(1);
    expect(remoteAppConfigSpy).toHaveBeenCalledWith(
      'AutoEFNOLWithoutLoginAllowMarketByClubCode',
      undefined,
      { clubcode: '065', policyConversionDateOnOrAfter: Date.parse(policyEffectiveDate) }
    );
    expect(actualResult).toEqual(true);
  });

  it('Should return a valid feature flag "off" with the allowed clubcode and policyEffectiveDate before 04/01/2024 from split.io', async () => {
    remoteAppConfigSpy.mockImplementation(() => Promise.resolve('off'));

    const policyEffectiveDate = '03/01/2024';
    const actualResult = await getPolicyConversionDateAllowed(
      ClubCodes.ACMO,
      policyEffectiveDate,
      loggerMock
    );

    expect(remoteAppInitialzeConfigSpy).toHaveBeenCalledTimes(1);
    expect(remoteAppConfigSpy).toHaveBeenCalledTimes(1);
    expect(remoteAppConfigSpy).toHaveBeenCalledWith(
      'AutoEFNOLWithoutLoginAllowMarketByClubCode',
      undefined,
      { clubcode: '065', policyConversionDateOnOrAfter: Date.parse(policyEffectiveDate) }
    );
    expect(actualResult).toEqual(false);
  });

  it('Should return a valid feature flag "off" when the clubCode is not allowed from split.io', async () => {
    remoteAppConfigSpy.mockImplementation(() => Promise.resolve('off'));
    const policyEffectiveDate = '04/01/2024';

    const result = await getPolicyConversionDateAllowed(
      ClubCodes.ANE,
      policyEffectiveDate,
      loggerMock
    );

    expect(remoteAppInitialzeConfigSpy).toHaveBeenCalledTimes(1);
    expect(remoteAppConfigSpy).toHaveBeenCalledTimes(1);
    expect(remoteAppConfigSpy).toHaveBeenCalledWith(
      'AutoEFNOLWithoutLoginAllowMarketByClubCode',
      undefined,
      { clubcode: '240', policyConversionDateOnOrAfter: Date.parse(policyEffectiveDate) }
    );
    expect(result).toEqual(false);
  });

  it('Should return false when splitIO connection fails', async () => {
    remoteAppConfigSpy.mockImplementation(() => Promise.reject('some-error'));

    const result = await getPolicyConversionDateAllowed(ClubCodes.ACMO, '11/01/2024', loggerMock);

    expect(result).toEqual(false);
  });
});

