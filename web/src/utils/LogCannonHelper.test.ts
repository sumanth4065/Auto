import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { serializeError } from './LogCannonHelper';
import LogCannon from '@ace-clublabs/log-cannon';

// Polyfill PromiseRejectionEvent for jsdom environment
if (typeof PromiseRejectionEvent === 'undefined') {
  (global as any).PromiseRejectionEvent = class PromiseRejectionEvent extends Event {
    promise?: Promise<any>;
    reason?: any;

    constructor(type: string, eventInitDict?: { promise: Promise<any>; reason: any }) {
      super(type);
      this.promise = eventInitDict?.promise;
      this.reason = eventInitDict?.reason;
    }
  };
}

describe('serializeError', () => {
  it('should return unknown for null', () => {
    expect(serializeError(null, 'testLocation')).toEqual({
      errorType: 'unknown',
      errorLabel: 'UnknownError',
      errorMessage: 'null',
      errorLocation: 'testLocation'
    });
  });

  it('should return unknown for a plain string', () => {
    expect(serializeError('boom', 'testLocation')).toEqual({
      errorType: 'unknown',
      errorLabel: 'UnknownError',
      errorMessage: 'boom',
      errorLocation: 'testLocation'
    });
  });

  it('should serialize an Axios HTTP error (response present)', () => {
    const axiosError = {
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        data: { message: 'something went wrong' }
      },
      config: { url: '/api/claim', method: 'post' }
    };
    expect(serializeError(axiosError, 'testLocation')).toEqual({
      errorType: 'http',
      httpStatus: 500,
      httpStatusText: 'Internal Server Error',
      requestUrl: '/api/claim',
      requestMethod: 'POST',
      errorLabel: 'HTTPError',
      errorMessage: 'something went wrong',
      errorCode: undefined,
      errorLocation: 'testLocation'
    });
  });

  it('should serialize an Axios network error (request present, no response)', () => {
    const networkError = {
      request: {},
      config: { url: '/api/policy', method: 'get' },
      message: 'Network Error'
    };
    expect(serializeError(networkError, 'testLocation')).toEqual({
      errorType: 'network',
      requestUrl: '/api/policy',
      errorLabel: 'NetworkError',
      errorMessage: 'Network Error',
      errorLocation: 'testLocation'
    });
  });

  it('should serialize a backend ErrorMessage envelope as api error', () => {
    const apiError = {
      ErrorMessage: {
        error: { message: 'unable to create auto claim', code: 'CREATE_CLAIM_FAILED' }
      }
    };
    expect(serializeError(apiError, 'testLocation')).toEqual({
      errorType: 'api',
      errorLabel: 'APIError',
      errorMessage: 'unable to create auto claim',
      errorCode: 'CREATE_CLAIM_FAILED',
      errorLocation: 'testLocation'
    });
  });

  it('should serialize a string ErrorMessage (setup error) as http error', () => {
    const setupError = { ErrorMessage: 'Request setup failed', ComponentErrorCode: 500 };
    expect(serializeError(setupError, 'testLocation')).toEqual({
      errorType: 'http',
      httpStatus: 500,
      errorLabel: 'APIError',
      errorMessage: 'Request setup failed',
      errorLocation: 'testLocation'
    });
  });

  it('should serialize a standard JS Error including stack', () => {
    const jsError = new Error('something broke');
    const result = serializeError(jsError, 'testLocation') as any;
    expect(result.errorType).toBe('client');
    expect(result.errorMessage).toBe('something broke');
    expect(result.errorLabel).toBe('Error');
    expect(typeof result.stack).toBe('string');
    expect(result.errorLocation).toBe('testLocation');
  });

  it('should serialize an unknown plain object', () => {
    expect(serializeError({ message: 'oops', code: 'ERR' }, 'testLocation')).toEqual({
      errorType: 'unknown',
      errorLabel: 'UnknownError',
      errorMessage: 'oops',
      errorCode: 'ERR',
      errorLocation: 'testLocation'
    });
  });

  it('should handle errors with circular references gracefully', () => {
    const circularObj: any = {};
    circularObj.message = circularObj;

    expect(() => serializeError(circularObj, 'testLocation')).not.toThrow();
    const result = serializeError(circularObj, 'testLocation');
    expect(result.errorType).toBe('unknown');
    expect(result.errorLabel).toBe('UnknownError');
    expect(result.errorMessage).toContain('[Circular]');
    expect(result.errorLocation).toBe('testLocation');
  });

  it('should handle no error location gracefully', () => {
    const error = new Error('no location');
    const result = serializeError(error, '');
    expect(result.errorType).toBe('client');
    expect(result.errorLabel).toBe('Error');
    expect(result.errorMessage).toBe('no location');
    expect(result.errorLocation).toBe('');
  });

  it('should classify "No response" ErrorMessage as network error', () => {
    const apiError = { ErrorMessage: 'No response' };
    expect(serializeError(apiError, 'testLocation')).toEqual({
      errorType: 'network',
      errorLabel: 'NetworkError',
      errorMessage: 'No response',
      errorLocation: 'testLocation'
    });
  });

  it('should classify ErrorMessage with ComponentErrorCode 408 as network error', () => {
    const apiError = { ErrorMessage: 'Request timed out', ComponentErrorCode: 408 };
    expect(serializeError(apiError, 'testLocation')).toEqual({
      errorType: 'network',
      errorLabel: 'NetworkError',
      errorMessage: 'Request timed out',
      errorLocation: 'testLocation'
    });
  });

  it('should classify ErrorMessage with string ComponentErrorCode "408" as network error', () => {
    const apiError = { ErrorMessage: 'Request timed out', ComponentErrorCode: '408' };
    expect(serializeError(apiError, 'testLocation')).toEqual({
      errorType: 'network',
      errorLabel: 'NetworkError',
      errorMessage: 'Request timed out',
      errorLocation: 'testLocation'
    });
  });

  it('should use flat ErrorMessage.message when nested error.message is absent', () => {
    const apiError = { ErrorMessage: { message: 'unable to get initial data' } };
    expect(serializeError(apiError, 'testLocation')).toEqual({
      errorType: 'api',
      errorLabel: 'APIError',
      errorMessage: 'unable to get initial data',
      errorCode: undefined,
      errorLocation: 'testLocation'
    });
  });
});

describe('registerUnhandledErrorLogging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(LogCannon, 'error').mockImplementation(() => {});
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log unhandled rejected promise error', async () => {
    // Re-import after module reset to get fresh instance
    const { registerUnhandledErrorLogging: register } = await import('./LogCannonHelper');
    const errorSpy = vi.spyOn(LogCannon, 'error');

    register();

    const error = new Error('unhandled promise error');
    const promise = Promise.reject(error);

    // Suppress unhandled rejection warning for this test
    promise.catch(() => {});

    const event = new (global as any).PromiseRejectionEvent('unhandledrejection', {
      promise,
      reason: error
    });

    window.dispatchEvent(event);

    // Wait a tick for event handler to execute
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(errorSpy).toHaveBeenCalledWith(
      'Unhandled promise rejection',
      expect.objectContaining({
        errorType: 'client',
        errorLabel: 'Error',
        errorMessage: 'unhandled promise error',
        eventType: 'window.unhandledrejection'
      })
    );
  });

  it('should log unhandled window error', async () => {
    // Re-import after module reset to get fresh instance
    const { registerUnhandledErrorLogging: register } = await import('./LogCannonHelper');
    const errorSpy = vi.spyOn(LogCannon, 'error');

    register();

    const errorEvent = new ErrorEvent('error', {
      message: 'unhandled window error',
      filename: 'http://localhost/app.js',
      lineno: 10,
      colno: 20,
      error: new Error('unhandled window error')
    });
    window.dispatchEvent(errorEvent);

    // Wait a tick for event handler to execute
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(errorSpy).toHaveBeenCalledWith(
      'Unhandled window error',
      expect.objectContaining({
        errorType: 'client',
        errorLabel: 'Error',
        errorMessage: 'unhandled window error',
        eventType: 'window.error',
        lineNumber: 10,
        columnNumber: 20
      })
    );
  });
});
