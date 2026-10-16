import { vi } from 'vitest';

// setup.ts pulls in hooks → useAuthenticatedTokenAndPolicyNumber → @ace-clublabs/log-cannon before
// any test file's vi.mock() registers, so test-local mocks are too late. Mock here so all tests get
// vi.fn() stubs instead of real HTTP-logging calls.
vi.mock('@ace-clublabs/log-cannon', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual('@ace-clublabs/log-cannon') as any;
  const logCannonStub = {
    init: vi.fn(),
    getVersion: vi.fn(),
    getSessionId: vi.fn(),
    blast: vi.fn(),
    kpiBurst: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  };
  return {
    ...actual,
    // getEnvironmentFromHost keeps the real implementation so hostname-based logic works.
    // Tests that need to control it use vi.spyOn(LogCannon, 'getEnvironmentFromHost').mockReturnValue().
    getEnvironmentFromHost: actual.getEnvironmentFromHost,
    LogCannon: logCannonStub,
    default: logCannonStub
  };
});

/**
 * endpoints.ts sets `export const endpoints` from window.location at import time. setup.ts pulls in
 * hooks → sources → endpoints before any test file runs, so test-local vi.mock('./endpoints') is too
 * late. Derive endpoints from getEndpoints('localhost') here (before setup.ts) so the mock stays in
 * sync with the real paths — 'localhost' maps to dev2 per getEnvironmentFromHost.
 * Other exports stay real so endpoints.test.ts keeps testing hostname helpers.
 */
vi.mock('../api/endpoints', async () => {
  const actual = await vi.importActual<typeof import('../api/endpoints')>('../api/endpoints');
  return {
    ...actual,
    endpoints: actual.getEndpoints('localhost')
  };
});
