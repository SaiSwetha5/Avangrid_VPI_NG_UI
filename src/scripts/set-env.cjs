// scripts/set-env.js  (CommonJS)
const fs = require('fs');
const path = require('path');

const targetPath = path.join(process.cwd(), 'src', 'assets', 'env.js');

const envConfigFile = `
(function (window) {
  window.__env = window.__env || {};
  window.__env.API_BASE_URL = "${process.env.API_BASE_URL || 'https://spring-boot-v1-final.onrender.com/api/v1'}";
  window.__env.GRAPH_API_URL = "${process.env.GRAPH_API_URL || 'https://graph.microsoft.com/v1.0'}";
  window.__env.BACKEND_SCOPE = "${process.env.BACKEND_SCOPE || 'api://ab5a57ac-0579-427c-a3ef-7a4e1b2b8677/access'}";
  window.__env.MSAL_CLIENT_ID = "${process.env.MSAL_CLIENT_ID || 'ab5a57ac-0579-427c-a3ef-7a4e1b2b8677'}";
  window.__env.AZURE_TENANT_ID = "${process.env.AZURE_TENANT_ID || 'aeea9a9c-cd86-4e5c-a3e4-db2be94c0c08'}";
  window.__env.PRODUCTION = ${process.env.VERCEL_ENV === 'production'};
})(this);
`;

try {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(targetPath, envConfigFile);
  console.log('✅ env.js generated successfully at:', targetPath);
} catch (err) {
  console.error('❌ Failed to generate env.js:', err);
  process.exit(1);
}
