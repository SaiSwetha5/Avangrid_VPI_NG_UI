export const environment = {
  production: false,
  apiBaseUrl: '${API_BASE_URL}',
  mUrl: '${GRAPH_API_URL}',
  accessScope: '${BACKEND_SCOPE}',
  msal: {
    clientId: '${MSAL_CLIENT_ID}',
    authority: 'https://login.microsoftonline.com',
    tenantId: '${AZURE_TENANT_ID}'
  }
};