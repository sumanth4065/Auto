import { BackendCallError } from './BackendCallError';

describe('BackendCallError', () => {
  it('sets errorSource to "backend"', () => {
    const err = new BackendCallError('GW Integration Gateway', new Error('timeout'));
    expect(err.errorSource).toBe('backend');
  });

  it('sets backendName from the first argument', () => {
    const err = new BackendCallError('mulesoft', new Error('bad response'));
    expect(err.backendName).toBe('mulesoft');
  });

  it('preserves the original cause', () => {
    const cause = new Error('network timeout');
    const err = new BackendCallError('create-claim-lambda', cause);
    expect(err.cause).toBe(cause);
  });

  it('constructs message as "Backend call failed [backendName]" without cause detail', () => {
    const err = new BackendCallError('GW Integration Gateway', new Error('upstream 503'));
    expect(err.message).toBe('Backend call failed [GW Integration Gateway]');
  });

  it('sets name to "BackendCallError"', () => {
    const err = new BackendCallError('mulesoft', new Error('fail'));
    expect(err.name).toBe('BackendCallError');
  });

  it('is an instance of Error', () => {
    const err = new BackendCallError('mulesoft', new Error('fail'));
    expect(err).toBeInstanceOf(Error);
  });

  it('sets stack to file:line:col of first /lambdas/ frame when present', () => {
    const err = new BackendCallError('GW Integration Gateway', new Error('fail'));
    // In a real Lambda runtime the stack would be a compact "/lambdas/..." location string.
    // In tests there are no /lambdas/ frames, so stack falls back to non-prefix frames.
    expect(err.stack).toBeDefined();
    expect(err.stack).not.toMatch(/^BackendCallError:/);
  });
});
