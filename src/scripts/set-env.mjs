import fs from 'node:fs';
import path from 'node:path';

// Use process.cwd() to target the root consistently on Vercel
const targetPath = path.join(process.cwd(), 'src/assets/env.js');

const envConfigFile = `
(function (window) {
  window.__env = window.__env || {};
  window.__env.APIBASEURL = "${process.env.APIBASEURL || ''}";
  window.__env.GRAPHAPIURL = "${process.env.GRAPHAPIURL || 'https://graph.microsoft.com/v1.0'}";
  window.__env.BACKENDSCOPE = "${process.env.BACKENDSCOPE || ''}";
  window.__env.MSALCLIENTID = "${process.env.MSALCLIENTID || ''}";
  window.__env.AZURETENANTID = "${process.env.AZURETENANTID || ''}";
  window.__env.PRODUCTION = ${process.env.VERCEL_ENV === 'production'};
})(this);
`;

try {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  fs.writeFileSync(targetPath, envConfigFile);
  console.log('✅ env.js generated successfully');
} catch (err) {
  console.error('❌ Error:', err);
  process.exit(1);
}