import { Logger } from "@ace-clublabs/aws-lambda-v3";
import { RemoteAppConfigHelper } from "./RemoteAppConfigHelper";
import * as getSecretHelper from "./getSecretHelper";
import { SplitIOHelper } from "./SplitIOHelper";

const getSecretHelperSpy = jest.spyOn(getSecretHelper, 'getSecretHelper');

const loggerMock = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
} as any as Logger;

describe('SplitIOHelper.getEnableIntegrationGateway function', () => {
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

  it('Should return true when feature flag is "on" from split.io', async () => {
    const actualResult = await SplitIOHelper.getEnableIntegrationGateway(loggerMock);

    expect(remoteAppInitialzeConfigSpy).toHaveBeenCalledTimes(1);
    expect(remoteAppConfigSpy).toHaveBeenCalledTimes(1);
    expect(remoteAppConfigSpy).toHaveBeenCalledWith(
      'AutoEfnol1stPartyAnonymousEnableIntegrationGateway',
      undefined,
      {}
    );
    expect(actualResult).toEqual(true);
  });

  it('Should return false when feature flag is "off" from split.io', async () => {
    remoteAppConfigSpy.mockImplementation(() => Promise.resolve('off'));

    const actualResult = await SplitIOHelper.getEnableIntegrationGateway(loggerMock);

    expect(remoteAppInitialzeConfigSpy).toHaveBeenCalledTimes(1);
    expect(remoteAppConfigSpy).toHaveBeenCalledTimes(1);
    expect(remoteAppConfigSpy).toHaveBeenCalledWith(
      'AutoEfnol1stPartyAnonymousEnableIntegrationGateway',
      undefined,
      {}
    );
    expect(actualResult).toEqual(false);
  });

  it('Should return false when splitIO connection fails', async () => {
    remoteAppConfigSpy.mockImplementation(() => Promise.reject('some-error'));

    const result = await SplitIOHelper.getEnableIntegrationGateway(loggerMock);

    expect(result).toEqual(false);
  });

  it('Should log appropriate messages during execution', async () => {
    await SplitIOHelper.getEnableIntegrationGateway(loggerMock);

    expect(loggerMock.debug).toHaveBeenCalledWith(
      'Response received key for SplitIO from secrets manager',
      {}
    );
    expect(loggerMock.debug).toHaveBeenCalledWith('Initializing remote app config', {});
    expect(loggerMock.info).toHaveBeenCalledWith('Retrieved Remote Feature flag', {
      featureFlag: { treatment: 'on' }
    });
  });

  it('Should log warning when splitIO connection fails', async () => {
    const error = new Error('Connection failed');
    remoteAppConfigSpy.mockImplementation(() => Promise.reject(error));

    const result = await SplitIOHelper.getEnableIntegrationGateway(loggerMock);

    expect(loggerMock.warn).toHaveBeenCalledWith('SplitIO connection failed', error);
    expect(result).toEqual(false);
  });
});