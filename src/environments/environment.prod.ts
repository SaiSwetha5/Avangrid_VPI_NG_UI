const env = window.__env ?? {};

export const environment = {
  production: true,
  apiBaseUrl: env["APIBASEURL"] || "",
  graphApiUrl: env["GRAPHAPIURL"] || "",
  accessScope: env["BACKENDSCOPE"] || "",
  msal: {
    clientId: env["MSALCLIENTID"] || "",
    authority: "https://login.microsoftonline.com", 
    tenantId: env["AZURETENANTID"] || ""
  }
};
