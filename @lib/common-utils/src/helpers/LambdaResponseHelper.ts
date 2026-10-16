import StatusCode from 'status-code-enum';
import { IContext, LambdaInvokeState, parseError } from '@ace-clublabs/aws-lambda-v3';
import { MaskedLogger } from '@ace-clublabs/aws-lambda-logger';
import { LambdaHelper } from '@ace-clublabs/iss-common-lambda-v3';
import { commonConstants } from '../constants';
import { BackendCallError } from './BackendCallError';

const logger = MaskedLogger.getInstance();

const MAX_CAUSE_DEPTH = 10;

type ErrorDetails = {
  errorSource: 'backend' | 'public';
  message?: string;
  name?: string;
  stack?: string;
  details?: unknown;
  backendName?: string;
  cause?: unknown;
};

const extractCauseMessage = (cause: unknown): string | null => {
  if (cause == null) return null;
  if (cause instanceof Error) return cause.message || null;
  if (typeof cause === 'object') {
    const obj = cause as Record<string, unknown>;
    if (typeof obj['ErrorMessage'] === 'string' && obj['ErrorMessage']) return obj['ErrorMessage'];
    if (typeof obj['message'] === 'string' && obj['message']) return obj['message'];
    if (typeof obj['error'] === 'object' && obj['error'] !== null) {
      const inner = obj['error'] as Record<string, unknown>;
      if (typeof inner['message'] === 'string' && inner['message']) return inner['message'];
    }
  }
  return null;
};

/**
 * Serializes an error into a plain object suitable for structured logging.
 *
 * - BackendCallError → { errorSource: 'backend', backendName, message, name, stack, cause }
 * - Error instance   → { errorSource: 'public', message, name, stack }
 * - Plain object     → { errorSource: 'public', message, details }
 * - Primitive        → { errorSource: 'public', message }
 *
 * Guards against infinite recursion via cycle detection (WeakSet) and a max-depth cap.
 */
const extractErrorDetailsInternal = (
  err: unknown,
  seen: WeakSet<object>,
  depth: number
): ErrorDetails => {
  if (depth > MAX_CAUSE_DEPTH) {
    return { errorSource: 'public', message: '[max cause depth exceeded]' };
  }

  if (typeof err === 'object' && err !== null) {
    if (seen.has(err)) {
      return { errorSource: 'public', message: '[circular cause reference]' };
    }
    seen.add(err);
  }

  if (err instanceof BackendCallError) {
    const causeMessage = extractCauseMessage(err.cause);
    return {
      errorSource: 'backend',
      message: err.message,
      name: err.name,
      stack: err.stack,
      backendName: err.backendName,
      ...(causeMessage != null && {
        cause: { errorSource: 'backend' as const, message: causeMessage }
      })
    };
  }
  if (err instanceof Error) {
    return {
      errorSource: 'public',
      message: err.message,
      name: err.name,
      stack: err.stack
    };
  }
  if (typeof err === 'object' && err !== null) {
    const obj = err as Record<string, unknown>;

    if (typeof obj['ErrorMessage'] === 'string') {
      return { errorSource: 'public', message: obj['ErrorMessage'], details: err };
    }
    if (typeof obj['message'] === 'string') {
      return { errorSource: 'public', message: obj['message'], details: err };
    }

    return { errorSource: 'public', details: err };
  }
  return { errorSource: 'public', message: String(err) };
};

export const extractErrorDetails = (err: unknown): ErrorDetails =>
  extractErrorDetailsInternal(err, new WeakSet<object>(), 0);

const mockHeaders = {
  'X-Ace-RequestId': 'some-request-id',
  'Access-Control-Allow-Origin': '*',
  'X-Ace-Session-Id': 'some-session-id'
};
export const mockLambdaSuccess: ReturnType<typeof LambdaHelper.response> = {
  statusCode: StatusCode.SuccessOK,
  headers: mockHeaders,
  body: JSON.stringify({ some: 'body' })
};

// return lambda response when authorization token is missing
export const noAuthorizedMockResponse = {
  ...mockLambdaSuccess,
  statusCode: StatusCode.ClientErrorNotFound,
  body: JSON.stringify({
    error: {
      message: 'Not authorized'
    }
  })
};
export const notAuthorized = (context: IContext, logInfo: any) => {
  logger.error(LambdaInvokeState.Error, { message: 'Authorization token is missing', ...logInfo });
  return LambdaHelper.response({
    statusCode: StatusCode.ClientErrorNotFound,
    requestId: context.awsRequestId,
    body: {
      error: {
        message: 'Not authorized'
      }
    }
  });
};

export const policyUnauthorized = (context: IContext, logInfo: any) => {
  logger.error(LambdaInvokeState.Error, {
    message: commonConstants.POLICY_UNAUTHORIZED,
    ...logInfo
  });
  return LambdaHelper.response({
    statusCode: StatusCode.ClientErrorUnauthorized,
    requestId: context.awsRequestId,
    body: {
      error: {
        message: commonConstants.POLICY_UNAUTHORIZED
      }
    }
  });
};

export const policyNotFoundMockResponse = {
  ...noAuthorizedMockResponse,
  body: JSON.stringify({ error: { message: 'Not found' } })
};

export const policyUnauthorizedMockResponse = {
  ...noAuthorizedMockResponse,
  statusCode: StatusCode.ClientErrorUnauthorized,
  body: JSON.stringify({ error: { message: commonConstants.POLICY_UNAUTHORIZED } })
};

// return lambda response when policyNumber is not found in the token
export const policyNotFound = (context: IContext, logInfo: any, errorMessage?: string) => {
  const message: string = errorMessage ?? 'Cannot extract policyNumber from token';

  logger.error(LambdaInvokeState.Error, { message, ...logInfo });

  return LambdaHelper.response({
    statusCode: StatusCode.ClientErrorNotFound,
    requestId: context.awsRequestId,
    body: {
      error: {
        message: 'Not found'
      }
    }
  });
};
export const mockDataFixture: ReturnType<typeof LambdaHelper.response> = {
  statusCode: StatusCode.SuccessOK,
  headers: mockHeaders,
  body: JSON.stringify({ someBodyMockResponse: 'true' })
};
// return lambda response when using mock data
export const mockData = (context: IContext, logInfo: any, body: any) => {
  logger.info(LambdaInvokeState.Complete, logInfo);
  return LambdaHelper.response({
    statusCode: StatusCode.SuccessOK,
    requestId: context.awsRequestId,
    body
  });
};

export const mockLambdaError = {
  ...noAuthorizedMockResponse,
  statusCode: StatusCode.ServerErrorInternal,
  body: JSON.stringify({
    error: { message: parseError(new Error('some-error')) }
  })
};
// return lambda response when it fails
export const lambdaError = (context: IContext, logInfo: any, err: any, message: string) => {
  const error = extractErrorDetails(err);
  logger.debug('lambdaError: ', err);
  logger.error(LambdaInvokeState.Error, { message, error, ...logInfo });
  return LambdaHelper.response({
    statusCode: StatusCode.ServerErrorInternal,
    requestId: context.awsRequestId,
    body: {
      error: {
        message
      }
    }
  });
};

export const policyBlockedError = (context: IContext, logInfo: any) => {
  logger.error(LambdaInvokeState.Error, { message: commonConstants.POLICY_BLOCKED, ...logInfo });
  return LambdaHelper.response({
    statusCode: StatusCode.ClientErrorForbidden,
    requestId: context.awsRequestId,
    body: {
      error: {
        message: commonConstants.POLICY_BLOCKED
      }
    }
  });
};

// return lambda response when it succeeds
export const lambdaSuccess = (context: IContext, logInfo: any, body: any, metrics?: any) => {
  if (metrics) logger.info(metrics, logInfo);
  logger.info(LambdaInvokeState.Complete, logInfo);
  return LambdaHelper.response({
    statusCode: StatusCode.SuccessOK,
    requestId: context.awsRequestId,
    body
  });
};
