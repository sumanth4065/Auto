import { TeamValue, WorkloadValue } from '@ace-clublabs/aws-tags';
import { getEnvironmentFromHost as getEnv, LogCannon } from '@ace-clublabs/log-cannon';
import { ISerializedError, SerializedErrorType } from '../types';

export const API_KEY = {
  prod: 'OjB5fbAeaU17OnCJfXHEyFWicMWLKU'
};

type UnhandledErrorContext = Record<string, unknown>;
type UnhandledErrorContextProvider = () => unknown;

/**
  Notes:
  - to create the API key, use the repo log-cannon
        https://github.com/clublabs/log-cannon
  - cd @lib/cdk-utility
        yarn apikey -e <env> -a <app-name>
      where:
        env = prod | uat
        app-name = any string
  - to verify, go to AWS console for  Gateway => API-KEY section

  For AutoEFNOL-anon, keys were created using the name 'logging-iss-auto-efnol-anonymous'
 */

// splunk key for LogCannon:
//  "log-cannon:app-name"="AutoEFNOLAnon"

export const APP_NAME = 'AutoEFNOLAnon';

let hasInitializedLogCannon = false;

export const initLogCannon = () => {
  if (hasInitializedLogCannon) return;
  const env = getEnv();
  const apiKey = API_KEY['prod'];

  LogCannon.init(apiKey, {
    environment: env as any,
    component: APP_NAME,
    runtime: 'nodejs',
    runtimeVersion: '22',
    appUrl: window.location.toString().split('?')[0],
    team: TeamValue.InsuranceSelfService,
    workload: WorkloadValue.Claims
  });
  hasInitializedLogCannon = true;
};

let hasRegisteredGlobalErrorHandlers = false;
let unhandledErrorContextProvider: UnhandledErrorContextProvider | undefined;

const sanitizeUrl = (value?: string) => value?.split('?')[0].split('#')[0];

const getUnhandledErrorContext = (): UnhandledErrorContext => {
  try {
    const context = unhandledErrorContextProvider?.();
    if (context && typeof context === 'object') {
      return context as UnhandledErrorContext;
    }
    return {};
  } catch {
    return {};
  }
};

export const setUnhandledErrorContextProvider = (
  provider?: UnhandledErrorContextProvider
): void => {
  unhandledErrorContextProvider = provider;
};

export const registerUnhandledErrorLogging = () => {
  if (hasRegisteredGlobalErrorHandlers) {
    return;
  }

  window.addEventListener('error', event => {
    const err = event.error;
    const serializedError = serializeError(err ?? new Error(event.message), 'window');
    const logContext = { ...getUnhandledErrorContext() };
    LogCannon.error('Unhandled window error', {
      ...serializedError,
      eventType: 'window.error',
      pathname: window.location.pathname,
      currentUrl: sanitizeUrl(window.location.href),
      filename: sanitizeUrl(event.filename),
      lineNumber: event.lineno,
      columnNumber: event.colno,
      ...logContext
    });
  });

  window.addEventListener('unhandledrejection', event => {
    const serializedError = serializeError(event.reason, 'window');
    const logContext = { ...getUnhandledErrorContext() };
    const reason = event.reason;
    LogCannon.error('Unhandled promise rejection', {
      ...serializedError,
      eventType: 'window.unhandledrejection',
      pathname: window.location.pathname,
      currentUrl: sanitizeUrl(window.location.href),
      reasonType: typeof event.reason,
      ...logContext
    });
  });

  hasRegisteredGlobalErrorHandlers = true;
};

/**
 * Converts a value to a string, dropping only circular references.
 * Plain strings, numbers, and objects with non-circular content pass through unchanged.
 */
const safeStr = (value: unknown): string | undefined => {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);
  try {
    const seen = new WeakSet();
    return JSON.stringify(value, (_key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      return val;
    });
  } catch {
    return undefined;
  }
};

/**
 * Extracts a safe, structured error payload for LogCannon from any thrown value.
 * Captures HTTP status, error type, request URL, and a trimmed stack trace
 * without leaking PII, full user paths, or circular references.
 */
export const serializeError = (error: unknown, errorLocation: string): ISerializedError => {
  try {
    if (error == null || typeof error !== 'object') {
      return {
        errorType: SerializedErrorType.unknown,
        errorLabel: 'UnknownError',
        errorMessage: String(error),
        errorLocation
      };
    }

    const err = error as Record<string, any>;
    const strippedRequestUrl = (err.config?.url as string | undefined)?.split('?')[0].split('#')[0];

    // Axios-style error
    if (err.response != null) {
      return {
        errorType: SerializedErrorType.http,
        httpStatus: err.response.status,
        httpStatusText: safeStr(err.response.statusText),
        requestUrl: strippedRequestUrl,
        requestMethod: safeStr(err.config?.method)?.toUpperCase(),
        errorLabel: safeStr(err.name) || 'HTTPError',
        errorMessage:
          safeStr(err.response.data?.message ?? err.response.data?.error?.message) ||
          'HTTP error with no message',
        errorCode: safeStr(err.response.data?.code ?? err.response.data?.error?.code),
        errorLocation
      };
    }

    // Network failure (no response received)
    if (err.request != null) {
      return {
        errorType: SerializedErrorType.network,
        requestUrl: strippedRequestUrl,
        errorMessage: safeStr(err.message) || 'Network error with no message',
        errorLabel: safeStr(err.name) || 'NetworkError',
        errorLocation
      };
    }

    // ServiceError from iss-common-util handleServiceResponseError
    if (err.ErrorMessage != null) {
      const statusCode = err.ComponentErrorCode != null ? Number(err.ComponentErrorCode) : undefined;
      const isNetworkError =
        statusCode === 408 ||
        err.ErrorMessage === 'No response' ||
        (typeof err.ErrorMessage === 'string' &&
          err.ErrorMessage.toLowerCase().includes('timeout'));

      const errorMessage =
        safeStr(err.ErrorMessage?.error?.message) ||
        safeStr(err.ErrorMessage?.message) ||
        (typeof err.ErrorMessage === 'string' ? err.ErrorMessage : undefined) ||
        'API error with no message';

      if (isNetworkError) {
        return {
          errorType: SerializedErrorType.network,
          errorLabel: 'NetworkError',
          errorMessage,
          errorLocation
        };
      }

      // ErrorMessage is an object → the API responded with a structured error body
      if (typeof err.ErrorMessage === 'object') {
        return {
          errorType: SerializedErrorType.api,
          errorLabel: safeStr(err.name) || 'APIError',
          errorMessage,
          errorCode: safeStr(err.ErrorMessage?.error?.code ?? err.ErrorMessage?.code),
          errorLocation
        };
      }

      // ErrorMessage is a string (e.g. axios setup error) → classify as http
      return {
        errorType: SerializedErrorType.http,
        httpStatus: statusCode,
        errorLabel: safeStr(err.name) || 'APIError',
        errorMessage,
        errorLocation
      };
    }

    // Standard JS error
    if (err instanceof Error) {
      const stackLines = err.stack?.split('\n').slice(0, 4).join(' | ');
      return {
        errorType: SerializedErrorType.client,
        errorLabel: safeStr(err.name) || 'ClientError',
        errorMessage: safeStr(err.message) || 'Client error with no message',
        errorLocation,
        stack: stackLines
      };
    }

    // Fallback for plain objects
    return {
      errorType: SerializedErrorType.unknown,
      errorLabel: safeStr(err.name) || 'UnknownError',
      errorMessage: safeStr(err.message) || 'Unknown error',
      errorCode: safeStr(err.code),
      errorLocation
    };
  } catch {
    return {
      errorType: SerializedErrorType.unknown,
      errorLabel: 'UnknownError',
      errorMessage: 'Error serialization failed',
      errorLocation
    };
  }
};
