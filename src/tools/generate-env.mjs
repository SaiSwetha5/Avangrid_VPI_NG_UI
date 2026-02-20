/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) Required keys
const required = [
  'APIBASEURL',
  'GRAPHAPIURL',
  'BACKENDSCOPE',
  'MSALCLIENTID',
  'AZURETENANTID'
];

// 2) Build env map from process.env
const env = Object.fromEntries(required.map(k => [k, process.env[k] || '']));

// 3) Fail or warn in CI
const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'production';
const missing = required.filter(k => !env[k]);

if (isCI && missing.length) {
  console.warn(`[generate-env] Missing env vars: ${missing.join(', ')}`);
  // Uncomment to fail build:
  // process.exit(1);
}

// 4) Generate JS payload
const js = `// AUTO-GENERATED: Do not edit
window.__env = ${JSON.stringify(env, null, 2)};
`;

// 5) Write to assets/env.js
const outputPath = path.join(__dirname, '..', 'src', 'assets', 'env.js');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, js, { encoding: 'utf-8' });

console.log('✅ Generated:', outputPath);
console.log('↳ Keys:', Object.keys(env).join(', '));