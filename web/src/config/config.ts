export interface AppConfig {
  pageTimeoutInMinutes: number;
}

export const MAX_IDLE_TIMEOUT = 60;

const config: AppConfig = {
  pageTimeoutInMinutes: MAX_IDLE_TIMEOUT
};

export default config;
