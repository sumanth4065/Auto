import { ITenant, PolicyType, PolicyTypeAndTenantHelper } from '@ace-clublabs/iss-common-util';
import { dayjs } from '@ace-clublabs/shared-component-library';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LossCause } from '@lib/types';
import { getLogData } from './getLogData'; // Adjust path as needed
import * as TaggingService from './TaggingService';
import { State } from '../store/reducer';

// Spy on the real CJS module's method — shared singleton, so getLogData.ts uses the same spy.
const PolicyTypeAndTenantHelperSpy = vi.spyOn(
  PolicyTypeAndTenantHelper,
  'getTenantAndProductFromPolicyNumber'
);

describe('getLogData', () => {
  const mockAppState = {
    clubCode: '252',
    policyNumber: 'HTX123456',
    loginFlowType: 'Anonymous',
    policyGuid: 'policy-guid-123',
    sourceApp: 'claims-view',
    claimNumber: '1122334455',
    policyStatus: 'ACTIVE',
    policyType: 'CAA',
    enableTextCommunication: true,
    enableEmailCommunication: true,
    lossCause: 'othercomp',
    lossDate: dayjs('2021-01-01T08:00:00.000Z'),
    lossTime: '14:05',
    numberOfVehiclesInvolved: 'one',
    email: undefined,
    incidentDescription: undefined,
    isReview: false,
    mobileNumber: undefined
  };
  const mockLocation = 'some-page';
  const mockTenant = ITenant.GUIDEWIRE;
  const mockProduct = PolicyType.AUTO;

  beforeEach(() => {
    vi.clearAllMocks();
    PolicyTypeAndTenantHelperSpy.mockReturnValue({
      tenant: mockTenant,
      productType: mockProduct
    });
  });

  it('should return correct log data for valid inputs', () => {
    // Arrange
    const expected = {
      clubCode: '252',
      clubLabel: 'Texas',
      page: 'some-page',
      platform: 'desktop',
      policyTenant: 'GUIDEWIRE',
      policyPrefix: 'HTX',
      policyNumber: 'HTX123456',
      loginFlowType: 'Anonymous',
      policyGuid: 'policy-guid-123',
      sourceApp: 'claims-view',
      claimNumber: '1122334455',
      policyStatus: 'ACTIVE',
      policyType: 'CAA',
      lossCause: 'othercomp',
      lossDate: '2021-01-01T08:00:00.000Z',
      lossTime: '14:05',
      numberOfVehiclesInvolved: 'one',
      textCommunication: true,
      electronicMailCommunication: true
    };

    // Act
    const result = getLogData(mockAppState as State, mockLocation);

    // Assert
    expect(result).toEqual(expected);
    expect(PolicyTypeAndTenantHelperSpy).toHaveBeenCalledWith('HTX123456');
  });

  it('should return correct log data for no policy number', () => {
    const result = getLogData({ ...mockAppState, policyNumber: undefined } as State, mockLocation);
    expect(result).toEqual(expect.objectContaining({ policyNumber: undefined }));
  });

  it('should return correct log data for no club code', () => {
    const result = getLogData(
      { ...mockAppState, clubCode: undefined, policyNumber: undefined } as State,
      mockLocation
    );
    expect(result).toEqual(expect.objectContaining({ clubCode: undefined, clubLabel: 'N/A' }));
    expect(PolicyTypeAndTenantHelperSpy).not.toHaveBeenCalled();
  });

  it('should return correct log data for no location', () => {
    const result = getLogData(
      { ...mockAppState, policyNumber: undefined } as State,
      undefined as unknown as string
    );
    expect(result).toEqual(expect.objectContaining({ page: undefined }));
    expect(PolicyTypeAndTenantHelperSpy).not.toHaveBeenCalled();
  });

  it('should return correct log data for invalid policy number', () => {
    PolicyTypeAndTenantHelperSpy.mockReturnValue({
      tenant: undefined as unknown as ITenant,
      productType: undefined as unknown as PolicyType
    });
    const result = getLogData({ ...mockAppState, policyNumber: 'INVALID' } as State, mockLocation);
    expect(result).toEqual(expect.objectContaining({ policyTenant: undefined }));
    expect(PolicyTypeAndTenantHelperSpy).toHaveBeenCalledWith('INVALID');
  });

  it('should return correct log data for numberOfVehiclesInvolved', () => {
    const result = getLogData(
      { ...mockAppState, numberOfVehiclesInvolved: 'one' } as State,
      mockLocation
    );
    expect(result).toEqual(
      expect.objectContaining({
        numberOfVehiclesInvolved: 'one'
      })
    );
    expect(PolicyTypeAndTenantHelperSpy).toHaveBeenCalledWith('HTX123456');
  });

  it('should return correct log data for claimNumber', () => {
    const result = getLogData(
      { ...mockAppState, claimNumber: '1234567890' } as State,
      mockLocation
    );
    expect(result).toEqual(expect.objectContaining({ claimNumber: '1234567890' }));
  });

  it('should return correct log data for textCommunication', () => {
    const result = getLogData(
      { ...mockAppState, enableTextCommunication: true } as State,
      mockLocation
    );
    expect(result).toEqual(expect.objectContaining({ textCommunication: true }));
  });

  it('should return correct log data for electronicMailCommunication', () => {
    const result = getLogData(
      { ...mockAppState, enableEmailCommunication: true } as State,
      mockLocation
    );
    expect(result).toEqual(expect.objectContaining({ electronicMailCommunication: true }));
  });

  it('should return correct log data for lossCause', () => {
    const result = getLogData(
      { ...mockAppState, lossCause: LossCause.OTHERCOMP } as State,
      mockLocation
    );
    expect(result).toEqual(expect.objectContaining({ lossCause: 'othercomp' }));
  });

  it('should return correct log data for lossDate', () => {
    const result = getLogData(
      { ...mockAppState, lossDate: dayjs('2021-01-01T08:00:00.000Z') } as State,
      mockLocation
    );
    expect(result).toEqual(expect.objectContaining({ lossDate: '2021-01-01T08:00:00.000Z' }));
  });

  it('should return correct log data for lossTime', () => {
    const result = getLogData({ ...mockAppState, lossTime: '14:05' } as State, mockLocation);
    expect(result).toEqual(expect.objectContaining({ lossTime: '14:05' }));
  });

  it('should return correct log data for policyStatus', () => {
    const result = getLogData({ ...mockAppState, policyStatus: 'ACTIVE' } as State, mockLocation);
    expect(result).toEqual(expect.objectContaining({ policyStatus: 'ACTIVE' }));
  });

  it('should return correct log data for policyType', () => {
    const result = getLogData({ ...mockAppState, policyType: 'CAA' } as State, mockLocation);
    expect(result).toEqual(expect.objectContaining({ policyType: 'CAA' }));
  });

  it('should fall back to Anonymous when loginFlowType is not set and URL has no behindlogin', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/insurance/auto/file-a-claim/error' },
      writable: true
    });
    const result = getLogData(
      { ...mockAppState, loginFlowType: undefined } as State,
      mockLocation
    );
    expect(result.loginFlowType).toBe('Anonymous');
  });

  it('should fall back to BehindLogin when loginFlowType is not set and URL contains behindlogin', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/insurance/auto/file-a-claim/behindlogin/some-guid' },
      writable: true
    });
    const result = getLogData(
      { ...mockAppState, loginFlowType: undefined } as State,
      mockLocation
    );
    expect(result.loginFlowType).toBe('BehindLogin');
  });
});
