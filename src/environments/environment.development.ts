const env = window.__env ?? {};

export const environment = {
  production: false,
  apiBaseUrl: env["APIBASEURL"] || "",
  graphApiUrl: env["GRAPHAPIURL"] || "",
  accessScope: env["BACKENDSCOPE"] || "",
  msal: {
    clientId: env["MSALCLIENTID"] || "",
    authority: "https://login.microsoftonline.com", 
    tenantId: env["AZURETENANTID"] || ""
  }
};
