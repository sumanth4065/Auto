export enum SerializedErrorType {
  http = 'http',
  network = 'network',
  api = 'api',
  client = 'client',
  unknown = 'unknown'
}

export interface ISerializedError {
  errorType: SerializedErrorType;
  errorLabel: string;
  errorMessage: string;
  errorCode?: string;
  errorLocation: string;
  httpStatus?: number;
  httpStatusText?: string;
  requestUrl?: string;
  requestMethod?: string;
  stack?: string;
}
