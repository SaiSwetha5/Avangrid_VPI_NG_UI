export interface MsalEnvConfig {
  clientId: string;
  tenantId: string;
  backendScope: string;
}

export interface AppEnvConfig {
  apiBaseUrl: string;
  production: boolean;
  msal: MsalEnvConfig;
}

declare global {
  interface Window {
    __env?: unknown;
  }
}

type RawEnv = Partial<{
  API_BASE_URL: string;
  production: boolean;
  msal: Partial<{
    MSAL_CLIENT_ID: string;
    AZURE_TENANT_ID: string;
    BACKEND_SCOPE: string;
  }>;
}>;

function isRawEnv(obj: unknown): obj is RawEnv {
  return typeof obj === 'object' && obj !== null;
}

const runtimeEnv: RawEnv = isRawEnv(window.__env) ? window.__env : {};

const tenantId = runtimeEnv.msal?.AZURE_TENANT_ID ?? '';
const clientId = runtimeEnv.msal?.MSAL_CLIENT_ID ?? '';
const backendScope = runtimeEnv.msal?.BACKEND_SCOPE ?? '';
const apiBaseUrl = runtimeEnv.API_BASE_URL ?? '';
const production = runtimeEnv.production ?? true;

export const environment: AppEnvConfig = {
  apiBaseUrl,
  production,
  msal: {
    clientId,
    tenantId,
    backendScope,
  },
};