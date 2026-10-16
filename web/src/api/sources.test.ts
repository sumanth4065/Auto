import { vi, describe, it, expect } from 'vitest';
import { LoginFlowType } from '@lib/shared-contracts';
import {
  createAutoClaimRequestFixture,
  createAutoClaimResponseFixture,
  safeliteRedirectUrlResponseFixture,
  policyInfoResponseFixture,
  submitAutoClaimCarDrivenWithOneOtherParty,
  submitAutoClaimFrontendResponseFixture,
  mockPolicyNumber,
  foundClaimInfoResponseFixture,
  initialDataResponseFixture,
  mockPolicyGuid
} from '@lib/types';
import * as remotes from './remotes';
import { sources } from './sources';
import {
  CreateAutoClaimStub,
  GetSafeliteRedirectUrlStub,
  SubmitAutoClaimStub,
  GetAutoPolicyInfoStub,
  GetAutoClaimInfoStub,
  GetInitialDataStub
} from './stubs';
import { HttpRequestHelper } from '../utils/HttpRequestHelper';

vi.mock('../../utils/HttpRequestHelper');

describe('sources', () => {
  const newUUIDSpy = vi.spyOn(HttpRequestHelper, 'newUUID');
  newUUIDSpy.mockImplementation(() => 'some-uuid');

  describe('remote tests', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });

    describe('createAutoClaim tests', () => {
      afterEach(() => {
        vi.resetAllMocks();
      });

      it('should return the stubs when the App source env variable is stubs', () => {
        process.env.REACT_APP_SOURCES = 'stubs';
        const result = sources('some-token', mockPolicyGuid);
        expect(result.createAutoClaim).toStrictEqual(CreateAutoClaimStub);
      });

      it('should execute the createAutoClaim remote', async () => {
        const remoteSpy = vi.spyOn(remotes, 'CreateAutoClaimRemote');
        const mockImplementationCandidate = () => Promise.resolve(createAutoClaimResponseFixture);
        remoteSpy.mockImplementation(() => mockImplementationCandidate);
        sources('some-token', mockPolicyGuid, LoginFlowType.BEHIND_LOGIN, 'remote').createAutoClaim(
          createAutoClaimRequestFixture
        );
        expect(remoteSpy).toBeCalledWith(
          `https://common.api.dev.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol/claim?policyGuid=${encodeURIComponent(
            mockPolicyGuid
          )}`,
          expect.anything(),
          false
        );
      });
    });

    describe('getSafeliteRedirectUrl tests', () => {
      afterEach(() => {
        vi.resetAllMocks();
      });

      it('should return the stubs when the App source env variable is stubs', () => {
        process.env.REACT_APP_SOURCES = 'stubs';
        const result = sources('some-token', mockPolicyGuid);
        expect(result.getSafeliteRedirectUrl).toStrictEqual(GetSafeliteRedirectUrlStub);
      });

      it('should execute the redirectToSafelite remote', async () => {
        const remoteSpy = vi.spyOn(remotes, 'GetSafeliteRedirectUrlRemote');
        const mockImplementationCandidate = () =>
          Promise.resolve(safeliteRedirectUrlResponseFixture);
        remoteSpy.mockImplementation(() => mockImplementationCandidate);
        sources(
          'some-token',
          mockPolicyGuid,
          LoginFlowType.BEHIND_LOGIN,
          'remote'
        ).getSafeliteRedirectUrl();
        expect(remoteSpy).toBeCalledWith(
          `https://common.api.dev.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol/safelite-redirect?policyGuid=${encodeURIComponent(
            mockPolicyGuid
          )}`,
          expect.anything(),
          false
        );
      });

      it('should include brand=WInsurance in the URL for a behind-login WInsurance session', async () => {
        const remoteSpy = vi.spyOn(remotes, 'GetSafeliteRedirectUrlRemote');
        remoteSpy.mockImplementation(() => () => Promise.resolve(safeliteRedirectUrlResponseFixture));
        sources('some-token', mockPolicyGuid, LoginFlowType.BEHIND_LOGIN, 'remote', 'WInsurance').getSafeliteRedirectUrl();
        expect(remoteSpy).toBeCalledWith(
          `https://common.api.dev.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol/safelite-redirect?policyGuid=${encodeURIComponent(mockPolicyGuid)}&brand=WInsurance`,
          expect.anything(),
          false
        );
      });

      it('should include only brand=WInsurance in the URL for an anonymous WInsurance session', async () => {
        const remoteSpy = vi.spyOn(remotes, 'GetSafeliteRedirectUrlRemote');
        remoteSpy.mockImplementation(() => () => Promise.resolve(safeliteRedirectUrlResponseFixture));
        sources('some-token', mockPolicyGuid, LoginFlowType.ANONYMOUS, 'remote', 'WInsurance').getSafeliteRedirectUrl();
        expect(remoteSpy).toBeCalledWith(
          `https://common.api.dev.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol/safelite-redirect?brand=WInsurance`,
          expect.anything(),
          false
        );
      });
    });

    describe('submitClaim tests', () => {
      afterEach(() => {
        vi.resetAllMocks();
      });

      it('should return the stubs when the App source env variable is stubs', () => {
        process.env.REACT_APP_SOURCES = 'stubs';
        const result = sources('some-token', mockPolicyGuid);
        expect(result.submitAutoClaim).toStrictEqual(SubmitAutoClaimStub);
      });

      it('should execute the submitAutoClaim remote', async () => {
        const remoteSpy = vi.spyOn(remotes, 'SubmitAutoClaimRemote');
        const mockImplementationCandidate = () =>
          Promise.resolve(submitAutoClaimFrontendResponseFixture);
        remoteSpy.mockImplementation(() => mockImplementationCandidate);
        sources('some-token', mockPolicyGuid, LoginFlowType.BEHIND_LOGIN, 'remote').submitAutoClaim(
          submitAutoClaimCarDrivenWithOneOtherParty
        );
        expect(remoteSpy).toBeCalledWith(
          `https://common.api.dev.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol/claim?policyGuid=${encodeURIComponent(
            mockPolicyGuid
          )}`,
          expect.anything(),
          false
        );
      });
    });

    describe('getAutoPolicyInfo tests', () => {
      afterEach(() => {
        vi.resetAllMocks();
      });

      it('should return the stubs when the App source env variable is stubs', () => {
        process.env.REACT_APP_SOURCES = 'stubs';
        const result = sources('some-token', mockPolicyGuid);
        expect(result.getAutoPolicyInfo).toStrictEqual(GetAutoPolicyInfoStub);
      });

      it('should execute the getAutoPolicyInfo remote', async () => {
        const remoteSpy = vi.spyOn(remotes, 'GetAutoPolicyInfoRemote');
        const mockImplementationCandidate = () => Promise.resolve(policyInfoResponseFixture);
        remoteSpy.mockImplementation(() => mockImplementationCandidate);
        sources(
          'some-token',
          mockPolicyGuid,
          LoginFlowType.BEHIND_LOGIN,
          'remote'
        ).getAutoPolicyInfo();
        expect(remoteSpy).toBeCalledWith(
          `https://common.api.dev.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol/policy-info?policyGuid=${encodeURIComponent(
            mockPolicyGuid
          )}`,
          expect.anything(),
          false
        );
      });
    });

    describe('getAutoClaimInfo tests', () => {
      afterEach(() => {
        vi.resetAllMocks();
      });

      it('should return the stubs when the App source env variable is stubs', () => {
        process.env.REACT_APP_SOURCES = 'stubs';
        const result = sources('some-token', mockPolicyGuid);
        expect(result.getAutoClaimInfo).toStrictEqual(GetAutoClaimInfoStub);
      });

      it('should execute the getAutoClaimInfo remote', async () => {
        const remoteSpy = vi.spyOn(remotes, 'GetAutoClaimInfoRemote');
        const mockImplementationCandidate = () => Promise.resolve(foundClaimInfoResponseFixture);
        remoteSpy.mockImplementation(() => mockImplementationCandidate);
        sources('some-token', mockPolicyGuid, LoginFlowType.BEHIND_LOGIN, 'remote').getAutoClaimInfo({
          lossDate: '2024-05-09T02:00:00-07:00',
          policyNumber: 'TEST-001',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        expect(remoteSpy).toBeCalledWith(
          `https://common.api.dev.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol/claim-info?policyGuid=${encodeURIComponent(
            mockPolicyGuid
          )}`,
          expect.anything(),
          false
        );
      });
    });

    describe('getInitialData tests', () => {
      afterEach(() => {
        vi.resetAllMocks();
      });

      it('should return the stubs when the App source env variable is stubs', () => {
        process.env.REACT_APP_SOURCES = 'stubs';
        const result = sources('some-token', mockPolicyGuid);
        expect(result.getInitialData('123')).toStrictEqual(GetInitialDataStub);
      });

      it('should execute the getInitialData remote', async () => {
        const remoteSpy = vi.spyOn(remotes, 'GetInitialDataRemote');
        const mockImplementationCandidate = () => Promise.resolve(initialDataResponseFixture);
        remoteSpy.mockImplementation(() => mockImplementationCandidate);
        sources('some-token', mockPolicyGuid, LoginFlowType.BEHIND_LOGIN, 'remote').getInitialData(
          '123'
        );
        expect(remoteSpy).toBeCalledWith(
          `https://common.api.dev.ace.aaa.com/insurance-self-service-auto-efnol/auto-efnol/initial-data/123`,
          expect.anything(),
          false
        );
      });
    });
  });
});
