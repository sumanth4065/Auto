import * as router from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import {
  ConversionType,
  type IPolicyConversionResult
} from '@ace-clublabs/iss-common-shared-claims-models';
import { useGetPolicyConversion } from './useGetPolicyConversion';
import * as SourcesDictionary from '../../api/sources';
import { Sources } from '../../api/sources';
import * as ComponentHelper from '../../utils/ComponentHelper';

const mockRemote = vi.fn();
const mockedDispatch = vi.fn();
const mockedNavigate = vi.fn();
const navigateToErrorPageSpy = vi.spyOn(ComponentHelper, 'navigateToErrorPage');

const mockConversionResult: IPolicyConversionResult = {
  isConversionApplicable: true,
  legacyPolicyNumber: 'LEGACY-001',
  targetPolicyNumber: 'GW-001',
  targetEffectiveDate: '2026-07-01T00:00:00.000Z'
};

describe('useGetPolicyConversion', () => {
  beforeEach(() => {
    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        policyNumber: 'LEGACY-001',
        token: 'some-token',
        policyGuid: undefined
      },
      mockedDispatch
    ]);

    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockedNavigate);

    vi.spyOn(SourcesDictionary, 'sources').mockImplementation(
      () =>
        ({
          getPolicyConversion: mockRemote
        }) as unknown as Sources
    );

    navigateToErrorPageSpy.mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should start with loading=true', () => {
    mockRemote.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useGetPolicyConversion(true, ConversionType.PSTAR_TO_GW));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should dispatch setConversionResult on success and set loading=false', async () => {
    mockRemote.mockResolvedValue(mockConversionResult);

    const { result, waitForNextUpdate } = renderHook(() =>
      useGetPolicyConversion(true, ConversionType.PSTAR_TO_GW)
    );

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CONVERSION_RESULT',
      payload: mockConversionResult
    });
  });

  it('should dispatch setSerializedError and call navigateToErrorPage on API error', async () => {
    mockRemote.mockRejectedValue({
      ErrorMessage: {
        error: {
          message: 'policy conversion unavailable'
        }
      }
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useGetPolicyConversion(true, ConversionType.PSTAR_TO_GW)
    );

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).not.toBeNull();

    // Should dispatch serialized error for logging context
    expect(mockedDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SET_SERIALIZED_ERROR' })
    );

    // Must call navigateToErrorPage with the serialized error to KO the user
    expect(navigateToErrorPageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ errorLabel: expect.any(String) }),
      mockedNavigate
    );

    // Must NOT dispatch setConversionResult
    expect(mockedDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SET_CONVERSION_RESULT' })
    );
  });

  it('should NOT dispatch setConversionResult on error', async () => {
    mockRemote.mockRejectedValue(new Error('network error'));

    const { waitForNextUpdate } = renderHook(() =>
      useGetPolicyConversion(true, ConversionType.PSTAR_TO_GW)
    );
    await waitForNextUpdate();

    expect(mockedDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SET_CONVERSION_RESULT' })
    );
  });

  it('should not fire request when enabled=false', () => {
    const { result } = renderHook(() => useGetPolicyConversion(false, ConversionType.PSTAR_TO_GW));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockRemote).not.toHaveBeenCalled();
  });
});
