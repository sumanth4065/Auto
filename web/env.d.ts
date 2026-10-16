/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_MODE: 'endorsements' | 'qnb' | 'knockout' | 'inspection';
  readonly VITE_HARNESS_CLIENT_SECRET_ID_DEV: string;
  readonly VITE_HARNESS_CLIENT_SECRET_ID_QA: string;
  readonly VITE_HARNESS_CLIENT_SECRET_ID_UAT: string;
  readonly VITE_HARNESS_CLIENT_SECRET_ID_PROD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
