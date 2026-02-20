const env = (window as any).__env ?? {};

export const environment = {
  production: true,
  apiBaseUrl: env["API_BASE_URL"] || "",
  graphApiUrl: env["GRAPH_API_URL"] || "",
  accessScope: env["BACKEND_SCOPE"] || "",
  msal: {
    clientId: env["MSAL_CLIENT_ID"] || "",
    authority: "https://login.microsoftonline.com",
    tenantId: env["AZURE_TENANT_ID"] || ""
  }
};
