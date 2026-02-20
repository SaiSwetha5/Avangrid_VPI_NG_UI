/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const required = [
  'APIBASEURL',
  'GRAPHAPIURL',
  'BACKENDSCOPE',
  'MSALCLIENTID',
  'AZURETENANTID'
];

const env = Object.fromEntries(required.map(k => [k, process.env[k] || '']));

const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'production';
const missing = required.filter(k => !env[k]);

if (isCI && missing.length) {
  console.warn(`[generate-env] Missing env vars: ${missing.join(', ')}`);
  // Uncomment to fail build if you want strictness:
  // process.exit(1);
}

const js = `// AUTO-GENERATED: Do not edit
window.__env = ${JSON.stringify(env, null, 2)};
`;

const outputPath = path.join(__dirname, '..', 'src', 'assets', 'env.js');
fs.writeFileSync(outputPath, js, { encoding: 'utf-8' });

console.log('✅ Generated:', outputPath);
console.log('↳ Keys:', Object.keys(env).join(', '));