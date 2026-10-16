import { vi, describe, it, expect, afterEach } from 'vitest';
import * as AceIdentityProvider from '../AceIdentityProvider';
import * as AccessTokenHelper from './AccessTokenHelper';

const mockAceInstance = (accessToken: string | undefined) => ({
  ready: vi.fn().mockResolvedValue(true),
  tokens: vi.fn().mockResolvedValue({ accessToken })
});

// Do NOT vi.mock('@ace-clublabs/ace-identity'): setup.ts loads AceIdentityProvider (via
// ../hooks → useAuthenticatedTokenAndPolicyNumber → utils barrel) before any test file's
// vi.mock() registers, so AceIdentityProvider.provideAceIdentity already holds the real
// AceIdentity class. Spying on the shared real AceIdentityProvider namespace is the only
// way to intercept the call inside generateToken().

describe('Access Token Helper', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('when token is generated', async () => {
    vi.spyOn(AceIdentityProvider, 'provideAceIdentity').mockReturnValue(
      mockAceInstance('some-new-token') as any
    );

    const result = await AccessTokenHelper.getToken();
    expect(result).toEqual('some-new-token');
  });

  it('when token is undefined', async () => {
    vi.spyOn(AceIdentityProvider, 'provideAceIdentity').mockReturnValue(
      mockAceInstance(undefined) as any
    );

    const result = await AccessTokenHelper.getToken();
    expect(result).toEqual(undefined);
  });

  it('when token generation throws error', async () => {
    const error = new Error('Network error');
    const mockInstance = {
      ready: vi.fn().mockResolvedValue(true),
      tokens: vi.fn().mockRejectedValue(error)
    };
    vi.spyOn(AceIdentityProvider, 'provideAceIdentity').mockReturnValue(mockInstance as any);
    const logErrorSpy = vi.spyOn(await import('../LogCannonHelper'), 'serializeError');

    const result = await AccessTokenHelper.getToken();
    expect(result).toEqual(undefined);
    expect(logErrorSpy).toHaveBeenCalledWith(error, 'getToken');
  });

  it('uses provideWInsuranceAceIdentity when brand is WInsurance', async () => {
    const aaaSpy = vi
      .spyOn(AceIdentityProvider, 'provideAceIdentity')
      .mockReturnValue(mockAceInstance('aaa-token') as any);
    const wInsuranceSpy = vi
      .spyOn(AceIdentityProvider, 'provideWInsuranceAceIdentity')
      .mockReturnValue(mockAceInstance('winsurance-token') as any);

    const result = await AccessTokenHelper.getToken(true, 'WInsurance');

    expect(result).toEqual('winsurance-token');
    expect(wInsuranceSpy).toHaveBeenCalledOnce();
    expect(aaaSpy).not.toHaveBeenCalled();
  });

  it('uses provideAceIdentity when brand is AAA', async () => {
    const aaaSpy = vi
      .spyOn(AceIdentityProvider, 'provideAceIdentity')
      .mockReturnValue(mockAceInstance('aaa-token') as any);
    const wInsuranceSpy = vi
      .spyOn(AceIdentityProvider, 'provideWInsuranceAceIdentity')
      .mockReturnValue(mockAceInstance('winsurance-token') as any);

    const result = await AccessTokenHelper.getToken(true, 'AAA');

    expect(result).toEqual('aaa-token');
    expect(aaaSpy).toHaveBeenCalledOnce();
    expect(wInsuranceSpy).not.toHaveBeenCalled();
  });
});
