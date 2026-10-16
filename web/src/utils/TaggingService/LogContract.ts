export interface LogRequestParams {
  message: string;
  level: string;
  data: {
    [key: string]: any
  };
}

export type LogSource = (message: LogRequestParams) => Promise<void>;
