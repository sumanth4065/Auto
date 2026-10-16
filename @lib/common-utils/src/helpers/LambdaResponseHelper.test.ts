import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import { IContext } from '@ace-clublabs/aws-lambda-v3';
import StatusCode from 'status-code-enum';
import { commonConstants } from '../constants';
import { BackendCallError } from './BackendCallError';
import {
  extractErrorDetails,
  lambdaError,
  lambdaSuccess,
  notAuthorized,
  policyBlockedError,
  policyNotFound,
  policyUnauthorized
} from './LambdaResponseHelper';

const mockContext: Partial<IContext> = {
  awsRequestId: 'test-request-id'
};

const mockLogInfo = { claimNumber: '123', policyNumber: 'POL001' };

let loggerErrorSpy: jest.SpyInstance;
let loggerInfoSpy: jest.SpyInstance;
let _loggerDebugSpy: jest.SpyInstance;

beforeEach(() => {
  loggerErrorSpy = jest.spyOn(MaskedLogger.prototype, 'error').mockImplementation(() => {});
  loggerInfoSpy = jest.spyOn(MaskedLogger.prototype, 'info').mockImplementation(() => {});
  _loggerDebugSpy = jest.spyOn(MaskedLogger.prototype, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('extractErrorDetails', () => {
  it('extracts message, name, stack and errorSource=public from an Error instance', () => {
    const err = new Error('something broke');
    const result = extractErrorDetails(err);
    expect(result.errorSource).toBe('public');
    expect(result.message).toBe('something broke');
    expect(result.name).toBe('Error');
    expect(result.stack).toContain('something broke');
    expect((result as any).details).toBeUndefined();
  });

  it('extracts message from a plain object that has a message field with errorSource=public', () => {
    const err = { message: 'backend failure', code: 500 };
    const result = extractErrorDetails(err);
    expect(result.errorSource).toBe('public');
    expect(result.message).toBe('backend failure');
    expect((result as any).details).toEqual(err);
  });

  it('preserves a plain object without a message field as details (no fabricated message)', () => {
    const err = { ComponentName: 'some-lambda', ComponentErrorCode: 500 };
    const result = extractErrorDetails(err);
    expect(result.errorSource).toBe('public');
    expect(result.message).toBeUndefined();
    expect((result as any).details).toEqual(err);
  });

  it('extracts ErrorMessage from a plain object that has only ErrorMessage (no message field)', () => {
    const err = { ErrorMessage: 'ring-balancer failure', ComponentErrorCode: 500 };
    const result = extractErrorDetails(err);
    expect(result.errorSource).toBe('public');
    expect(result.message).toBe('ring-balancer failure');
  });

  it('converts a primitive string error with errorSource=public', () => {
    const result = extractErrorDetails('unexpected string error');
    expect(result.errorSource).toBe('public');
    expect(result.message).toBe('unexpected string error');
  });

  it('converts a primitive number error with errorSource=public', () => {
    const result = extractErrorDetails(42);
    expect(result.errorSource).toBe('public');
    expect(result.message).toBe('42');
  });

  describe('BackendCallError', () => {
    it('sets errorSource to "backend"', () => {
      const cause = new Error('upstream timeout');
      const err = new BackendCallError('GW Integration Gateway', cause);
      const result = extractErrorDetails(err);
      expect(result.errorSource).toBe('backend');
    });

    it('includes backendName in the result', () => {
      const err = new BackendCallError('mulesoft', new Error('500'));
      const result = extractErrorDetails(err);
      expect((result as any).backendName).toBe('mulesoft');
    });

    it('nests cause as { errorSource, message } when cause has a message', () => {
      const cause = new Error('upstream 503');
      const err = new BackendCallError('guidewire-v1', cause);
      const result = extractErrorDetails(err) as any;
      expect(result.cause).toEqual({ errorSource: 'backend', message: 'upstream 503' });
    });

    it('includes name on the BackendCallError itself, with stack containing no prefix line', () => {
      const err = new BackendCallError('create-claim-lambda', new Error('fail'));
      const result = extractErrorDetails(err);
      expect(result.name).toBe('BackendCallError');
      expect(result.stack).toBeDefined();
      expect(result.stack).not.toMatch(/^BackendCallError:/);
    });

    it('omits cause when cause is a plain object with no message fields', () => {
      const cause = { ComponentName: 'some-lambda', ComponentErrorCode: 500 };
      const err = new BackendCallError('create-claim-lambda', cause);
      const result = extractErrorDetails(err) as any;
      expect(result).not.toHaveProperty('cause');
    });

    it('sets cause to { errorSource, message } from ErrorMessage when cause is a plain object with ErrorMessage', () => {
      const cause = { ErrorMessage: 'ring-balancer failure', ComponentErrorCode: 500 };
      const err = new BackendCallError('cmn-claims-info-v2', cause);
      const result = extractErrorDetails(err) as any;
      expect(result.cause).toEqual({ errorSource: 'backend', message: 'ring-balancer failure' });
    });

    it('sets cause to { errorSource, message } from nested error.message', () => {
      const cause = { error: { message: 'Cmn Auto Create Claim Failed' } };
      const err = new BackendCallError('create-auto-claim-v2', cause);
      const result = extractErrorDetails(err) as any;
      expect(result.cause).toEqual({
        errorSource: 'backend',
        message: 'Cmn Auto Create Claim Failed'
      });
    });

    it('omits the cause field entirely when cause is undefined', () => {
      const err = new BackendCallError('some-backend', undefined as any);
      const result = extractErrorDetails(err) as any;
      expect(result).not.toHaveProperty('cause');
    });

    it('omits the cause field entirely when cause is null', () => {
      const err = new BackendCallError('some-backend', null as any);
      const result = extractErrorDetails(err) as any;
      expect(result).not.toHaveProperty('cause');
    });
  });

  describe('recursion safety', () => {
    it('handles a circular cause reference safely — extracts message without infinite recursion', () => {
      const cyclic = new BackendCallError('cyclic-backend', undefined as any);
      (cyclic as any).cause = cyclic;
      const result = extractErrorDetails(cyclic) as any;
      // extractCauseMessage reads .message from the cause (a BackendCallError), no recursion
      expect(result.cause).toEqual({
        errorSource: 'backend',
        message: 'Backend call failed [cyclic-backend]'
      });
    });
  });
});

describe('notAuthorized', () => {
  it('logs "Invoke Error" as log:message with descriptive message in data payload', () => {
    notAuthorized(mockContext as IContext, mockLogInfo);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Invoke Error',
      expect.objectContaining({ message: 'Authorization token is missing', ...mockLogInfo })
    );
  });

  it('returns a 404 response with "Not authorized" body', () => {
    const response = notAuthorized(mockContext as IContext, mockLogInfo);
    expect(response.statusCode).toBe(StatusCode.ClientErrorNotFound);
    expect(JSON.parse(response.body)).toEqual({ error: { message: 'Not authorized' } });
  });
});

describe('policyUnauthorized', () => {
  it('logs "Invoke Error" as log:message with POLICY_UNAUTHORIZED in data payload', () => {
    policyUnauthorized(mockContext as IContext, mockLogInfo);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Invoke Error',
      expect.objectContaining({ message: commonConstants.POLICY_UNAUTHORIZED, ...mockLogInfo })
    );
  });

  it('returns a 401 response with POLICY_UNAUTHORIZED body', () => {
    const response = policyUnauthorized(mockContext as IContext, mockLogInfo);
    expect(response.statusCode).toBe(StatusCode.ClientErrorUnauthorized);
    expect(JSON.parse(response.body)).toEqual({
      error: { message: commonConstants.POLICY_UNAUTHORIZED }
    });
  });
});

describe('policyNotFound', () => {
  it('logs "Invoke Error" as log:message with provided errorMessage in data payload', () => {
    policyNotFound(mockContext as IContext, mockLogInfo, 'Claim data not found');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Invoke Error',
      expect.objectContaining({ message: 'Claim data not found', ...mockLogInfo })
    );
  });

  it('logs "Invoke Error" with default message in data payload when no errorMessage is provided', () => {
    policyNotFound(mockContext as IContext, mockLogInfo);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Invoke Error',
      expect.objectContaining({ message: 'Cannot extract policyNumber from token', ...mockLogInfo })
    );
  });

  it('returns a 404 response with generic "Not found" body', () => {
    const response = policyNotFound(mockContext as IContext, mockLogInfo, 'some internal reason');
    expect(response.statusCode).toBe(StatusCode.ClientErrorNotFound);
    expect(JSON.parse(response.body)).toEqual({ error: { message: 'Not found' } });
  });
});

describe('lambdaError', () => {
  it('logs with "Invoke Error" as log:message and puts the descriptive message in the data payload', () => {
    const err = new Error('network timeout');
    lambdaError(mockContext as IContext, mockLogInfo, err, 'Unable to submit claim');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Invoke Error',
      expect.objectContaining({
        message: 'Unable to submit claim',
        error: expect.objectContaining({ message: 'network timeout', errorSource: 'public' }),
        ...mockLogInfo
      })
    );
  });

  it('serializes Error instance with message, name, stack and errorSource=public', () => {
    const err = new TypeError('invalid type');
    lambdaError(mockContext as IContext, mockLogInfo, err, 'Unable to get policy info');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Invoke Error',
      expect.objectContaining({
        message: 'Unable to get policy info',
        error: expect.objectContaining({
          errorSource: 'public',
          message: 'invalid type',
          name: 'TypeError',
          stack: expect.stringContaining('invalid type')
        })
      })
    );
  });

  it('serializes a plain-object error with errorSource=public', () => {
    const err = { ComponentName: 'some-lambda', ComponentErrorCode: 500 };
    lambdaError(mockContext as IContext, mockLogInfo, err, 'Unable to create claim');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Invoke Error',
      expect.objectContaining({
        message: 'Unable to create claim',
        error: expect.objectContaining({ errorSource: 'public', details: err })
      })
    );
  });

  it('serializes a BackendCallError with errorSource=backend and nested cause', () => {
    const cause = new Error('upstream 500');
    const err = new BackendCallError('GW Integration Gateway', cause);
    lambdaError(mockContext as IContext, mockLogInfo, err, 'Unable to submit non-glass claim');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Invoke Error',
      expect.objectContaining({
        message: 'Unable to submit non-glass claim',
        error: expect.objectContaining({
          errorSource: 'backend',
          backendName: 'GW Integration Gateway',
          cause: expect.objectContaining({ errorSource: 'backend', message: 'upstream 500' })
        })
      })
    );
  });

  it('returns a 500 response whose body message matches the descriptive message', () => {
    const err = new Error('backend failure');
    const response = lambdaError(
      mockContext as IContext,
      mockLogInfo,
      err,
      'Unable to submit claim'
    );
    expect(response.statusCode).toBe(StatusCode.ServerErrorInternal);
    expect(JSON.parse(response.body)).toEqual({ error: { message: 'Unable to submit claim' } });
    // body message is the descriptive string; log:message is always 'Invoke Error'
    expect(loggerErrorSpy).toHaveBeenCalledWith('Invoke Error', expect.any(Object));
  });

  it('always logs "Invoke Error" as log:message so Splunk queries remain unchanged', () => {
    const err = new Error('some error');
    lambdaError(mockContext as IContext, mockLogInfo, err, 'Unable to get claim info');
    const [logMessage, logData] = loggerErrorSpy.mock.calls[0];
    expect(logMessage).toBe('Invoke Error');
    expect(logData).toEqual(expect.objectContaining({ message: 'Unable to get claim info' }));
  });
});

describe('policyBlockedError', () => {
  it('logs "Invoke Error" with POLICY_BLOCKED message in data payload', () => {
    policyBlockedError(mockContext as IContext, mockLogInfo);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Invoke Error',
      expect.objectContaining({ message: commonConstants.POLICY_BLOCKED, ...mockLogInfo })
    );
  });

  it('returns a 403 response with POLICY_BLOCKED body', () => {
    const response = policyBlockedError(mockContext as IContext, mockLogInfo);
    expect(response.statusCode).toBe(StatusCode.ClientErrorForbidden);
    expect(JSON.parse(response.body)).toEqual({
      error: { message: commonConstants.POLICY_BLOCKED }
    });
  });
});

describe('lambdaSuccess', () => {
  it('returns a 200 response with the provided body', () => {
    const body = { claimId: 'abc123' };
    const response = lambdaSuccess(mockContext as IContext, mockLogInfo, body);
    expect(response.statusCode).toBe(StatusCode.SuccessOK);
    expect(JSON.parse(response.body)).toEqual(body);
  });

  it('logs metrics when provided', () => {
    lambdaSuccess(mockContext as IContext, mockLogInfo, {}, 'SomeMetric');
    expect(loggerInfoSpy).toHaveBeenCalledWith('SomeMetric', mockLogInfo);
  });
});
