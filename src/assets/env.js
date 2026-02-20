import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// In ES modules, __dirname is not defined. We derive it from import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target path where Angular expects the env.js file
const targetPath = path.join(__dirname, '../src/assets/env.js');

// Read from process.env (populated by Vercel) or fallback to defaults
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

// Ensure the directory exists before writing
const dir = path.dirname(targetPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

try {
  fs.writeFileSync(targetPath, envConfigFile);
  console.log(`✅ Dynamically generated env.js at ${targetPath}`);
} catch (err) {
  console.error('❌ Failed to generate env.js:', err);
  process.exit(1);
}