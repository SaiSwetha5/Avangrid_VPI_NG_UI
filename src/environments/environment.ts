// export const environment = {
//   production: false,
//   apiBaseUrl: '${API_BASE_URL}',
//   mUrl: '${GRAPH_API_URL}',
//   accessScope: '${BACKEND_SCOPE}',
//   msal: {
//     clientId: '${MSAL_CLIENT_ID}',
//     authority: 'https://login.microsoftonline.com',
//     tenantId: '${AZURE_TENANT_ID}'
//   }
// };
 

const env = window.__env ?? {};

export const environment = {
  production: false,
  apiBaseUrl: env["APIBASEURL"] || "",
  graphApiUrl: env["GRAPHAPIURL"] || "",
  accessScope: env["BACKENDSCOPE"] || "",
  msal: {
    clientId: env["MSALCLIENTID"] || "",
    authorityBase: "https://login.microsoftonline.com", 
    tenantId: env["AZURETENANTID"] || ""
  }
};
