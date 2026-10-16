import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getHarnessConfiguration } from './getHarnessConfiguration';

describe('getHarnessConfiguration', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.stubEnv('VITE_HARNESS_CLIENT_SECRET_ID_DEV', 'test_dev');
    vi.stubEnv('VITE_HARNESS_CLIENT_SECRET_ID_QA', 'test_qa');
    vi.stubEnv('VITE_HARNESS_CLIENT_SECRET_ID_UAT', 'test_uat');
    vi.stubEnv('VITE_HARNESS_CLIENT_SECRET_ID_PROD', 'test_prod');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
  });

  const setWindowHost = (host: string) => {
    Object.defineProperty(window, 'location', {
      value: { host },
      writable: true,
      configurable: true
    });
  };

  it.each([
    ['DEV', 'localhost:8080', 'test_dev'],
    ['QA', 'appqa1.ace.aaa.com', 'test_qa'],
    ['UAT', 'appuat1.ace.aaa.com', 'test_uat'],
    ['PROD', 'app.ace.aaa.com', 'test_prod']
  ] as const)(
    'should return the correct harness configuration for %s',
    (_label, host, expectedClientSecretId) => {
      setWindowHost(host);
      expect(getHarnessConfiguration()).toEqual({
        userId: 'ISS-CLAIMS',
        clientSecretId: expectedClientSecretId
      });
    }
  );
});
