import { RemoteAppConfigHelper } from './RemoteAppConfigHelper';

const STAGING_DEFAULT_KEY = 'some-key'; // Updated real value only to be tested with splitio, do not commit code with the actual value

describe('RemoteAppConfigHelper', () => {
  let getTreatmentWithConfigSpy: jest.SpyInstance;
  let getTreatmentSpy: jest.SpyInstance;
  let initializeSpy: jest.SpyInstance;
  let disconnectSpy: jest.SpyInstance;

  //Note: this is the split IO raw api response data
  let treatmentWithConfigResultRawMock = {
    treatment: 'on',
    config: '{\n  "AllowedClubCodes": "some-club-code"\n}'
  };

  //Next, we need to JSON.parse the config object to have a final valid JSON result below.
  let treatmentWithConfigMock = {
    treatment: 'on',
    config: {
      AllowedClubCodes: 'some-club-code'
    }
  };
  let treatmentMock = { treatment: 'on' };
  let noTreatmentMock = { treatment: 'control' };

  let actualResult;
  let treatmentsWithConfigMock = [
    { treatment: 'on', config: '065' },
    { treatment: 'off', config: '065' }
  ];

  beforeEach(() => {
    // Mock the actual methods to avoid real network calls and timeouts
    getTreatmentWithConfigSpy = jest.spyOn(
      RemoteAppConfigHelper.prototype,
      'getTreatmentWithConfig'
    );
    getTreatmentWithConfigSpy.mockResolvedValue(treatmentWithConfigResultRawMock);

    getTreatmentSpy = jest.spyOn(RemoteAppConfigHelper.prototype, 'getTreatment');
    getTreatmentSpy.mockResolvedValue(treatmentMock);

    // Mock initialize and disconnect to avoid actual connections
    initializeSpy = jest.spyOn(RemoteAppConfigHelper.prototype, 'initialize');
    initializeSpy.mockResolvedValue(undefined);

    disconnectSpy = jest.spyOn(RemoteAppConfigHelper.prototype, 'disconnect');
    disconnectSpy.mockResolvedValue(undefined);

    // Mock getkey to return expected values
    jest.spyOn(RemoteAppConfigHelper.prototype, 'getkey').mockReturnValue('localhost');
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should log information if Logger instance is send in constructor', async () => {
    const mockedDebug = jest.fn();
    const logger = {
      debug: mockedDebug
    } as any;

    const siohelper = new RemoteAppConfigHelper(logger);
    siohelper.setKey('some-key', true);
    expect(mockedDebug).toHaveBeenCalledWith('Setting Remote App config Factory key');

    await siohelper.initialize();
    // Since we're mocking the initialize method, the actual debug calls inside it won't happen
    // We should verify that initialize was called instead
    expect(initializeSpy).toHaveBeenCalled();

    const res = await siohelper.getTreatment('HomeEFNOLAllowedClubCodesForCCI');
    expect(siohelper.getkey()).toEqual('localhost');
    expect(res).toEqual({ treatment: 'on' });

    await siohelper.disconnect();
    // Since we're mocking the disconnect method, verify it was called instead
    expect(disconnectSpy).toHaveBeenCalled();
  }, 15000);

  it('should retrieves split IO local single treatment', async () => {
    const siohelper = new RemoteAppConfigHelper();
    siohelper.setKey('some-key', true);

    await siohelper.initialize();
    const res = await siohelper.getTreatment('HomeEFNOLAllowedClubCodesForCCI');
    expect(siohelper.getkey()).toEqual('localhost');
    expect(res).toEqual({ treatment: 'on' });
    await siohelper.disconnect();
  }, 15000);

  it(`should retrieve split IO local single treatment with value is 'on'`, async () => {
    const siohelper = new RemoteAppConfigHelper();
    siohelper.setKey('some-random-string-goes-here', true);

    await siohelper.initialize();
    const attributes = {
      clubcode: '252'
    };
    const res = await siohelper.getTreatment(
      'HomeEFNOLAllowedClubCodesForCCI',
      'some-test-user-id',
      attributes
    );
    actualResult = {
      treatment: 'on'
    };
    expect(siohelper.getkey()).toEqual('localhost');
    expect(actualResult).toEqual({
      treatment: 'on'
    });
    await siohelper.disconnect();
  }, 15000);

  it(`should retrieve split IO local single treatment with value is 'off' and with configuration 
      data for the treatment: HomeEFNOLAllowedClubCodesForCCI`, async () => {
    // Update the mock for this specific test
    const offTreatmentMock = {
      treatment: 'off',
      config: '{\n  "AllowedClubCodes": "some-club-code"\n}'
    };
    getTreatmentWithConfigSpy.mockResolvedValueOnce(offTreatmentMock);

    const siohelper = new RemoteAppConfigHelper();
    siohelper.setKey('some-random-string-goes-here', true);

    await siohelper.initialize();
    const res = await siohelper.getTreatmentWithConfig('HomeEFNOLAllowedClubCodesForCCI');
    actualResult = {
      treatment: res.treatment,
      config: JSON.parse(res.config as string)
    };

    expect(siohelper.getkey()).toEqual('localhost');
    expect(actualResult).toEqual({
      treatment: 'off',
      config: {
        AllowedClubCodes: 'some-club-code'
      }
    });
    await siohelper.disconnect();
  }, 15000);

  it(`should retrieve split IO local single treatment with value is 'on' and with multiple club codes configuration 
      data for the treatment: HomeEFNOLAllowedClubCodesForCCI`, async () => {
    // Update the mock for this specific test
    const multiClubTreatmentMock = {
      treatment: 'on',
      config: '{\n  "AllowedClubCodes": "club-code-a,club-code-b"\n}'
    };
    getTreatmentWithConfigSpy.mockResolvedValueOnce(multiClubTreatmentMock);

    const siohelper = new RemoteAppConfigHelper();
    siohelper.setKey('some-random-string-goes-here', true);

    await siohelper.initialize();
    const res = await siohelper.getTreatmentWithConfig('HomeEFNOLAllowedClubCodesForCCI');
    actualResult = {
      treatment: res.treatment,
      config: JSON.parse(res.config as string)
    };
    expect(siohelper.getkey()).toEqual('localhost');
    expect(actualResult).toEqual({
      treatment: 'on',
      config: {
        AllowedClubCodes: 'club-code-a,club-code-b'
      }
    });
    await siohelper.disconnect();
  }, 15000);

  it('tries to retrieve a non existing single remote treatment', async () => {
    // Mock the specific behavior for non-existing treatment
    getTreatmentSpy.mockResolvedValueOnce(noTreatmentMock);

    const siohelper = new RemoteAppConfigHelper();
    siohelper.setKey(STAGING_DEFAULT_KEY, true);

    await siohelper.initialize();
    const res = await siohelper.getTreatment(
      'some-treatment-that-doesnt-exist-in-this-envs-feature-flag'
    );

    expect(siohelper.getkey()).toEqual('localhost');
    expect(res).toEqual({ treatment: 'control' });
    await siohelper.disconnect();
  }, 15000);

  //this test should remain exclude. This can be used only for local testing pointing to splitio
  xit('retrieves split IO remote single treatment', async () => {
    const siohelper = new RemoteAppConfigHelper();
    siohelper.setKey(STAGING_DEFAULT_KEY);

    await siohelper.initialize();
    const res = await siohelper.getTreatmentWithConfig('auto_efnol_config');

    expect(siohelper.getkey()).toEqual(STAGING_DEFAULT_KEY);
    expect(res).toEqual('on'); // it is "on" 10% of the time
    await siohelper.disconnect();
  });

  //this test should remain exclude. This can be used only for local testing pointing to splitio
  xit('retrieves split IO remote multiple treatments', async () => {
    const siohelper = new RemoteAppConfigHelper();
    siohelper.setKey(STAGING_DEFAULT_KEY, false);

    await siohelper.initialize();
    const res = await siohelper.getTreatmentsWithConfig([
      'claims_view_config',
      'home_efnol_config',
      'auto_efnol_config'
    ]);

    expect(siohelper.getkey()).toEqual(STAGING_DEFAULT_KEY);
    expect(res).toEqual({
      auto_efnol_config: 'on',
      home_efnol_config: 'off',
      claims_view_config: 'off'
    });
    await siohelper.disconnect();
  });

  it('should handle getTreatmentsWithConfig (plural) method', async () => {
    // Test the plural with config version
    const mockTreatmentsWithConfig = {
      auto_efnol_config: {
        treatment: 'on',
        config: '{\n  "AllowedClubCodes": "252,065"\n}'
      },
      home_efnol_config: {
        treatment: 'off',
        config: null
      },
      claims_view_config: {
        treatment: 'off',
        config: '{\n  "timeout": "5000"\n}'
      }
    };

    // Mock the getTreatmentsWithConfig method
    const getTreatmentsWithConfigSpy = jest
      .spyOn(RemoteAppConfigHelper.prototype, 'getTreatmentsWithConfig')
      .mockResolvedValue(mockTreatmentsWithConfig);

    const siohelper = new RemoteAppConfigHelper();
    siohelper.setKey('test-key', true);

    await siohelper.initialize();
    const result = await siohelper.getTreatmentsWithConfig([
      'auto_efnol_config',
      'home_efnol_config',
      'claims_view_config'
    ]);

    expect(siohelper.getkey()).toEqual('localhost');
    expect(result).toEqual(mockTreatmentsWithConfig);
    expect(getTreatmentsWithConfigSpy).toHaveBeenCalledWith([
      'auto_efnol_config',
      'home_efnol_config',
      'claims_view_config'
    ]);

    await siohelper.disconnect();

    // Clean up the spy
    getTreatmentsWithConfigSpy.mockRestore();
  }, 15000);
});
