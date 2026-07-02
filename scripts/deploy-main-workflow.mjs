// Deploy the main Postly workflow to the VPS n8n instance via API.
// Usage: N8N_API_KEY=<key> node scripts/deploy-main-workflow.mjs
//
// The API key lives in n8n UI → Settings → API Keys (VPS instance).

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const WF_FILE = join(__dir, '..', 'workflows', 'Postly - Entrega Final Sprint 1 v2.json');
const VPS_BASE = 'https://vps-6120781-x.dattaweb.com/api/v1';
const WF_ID = '0aclc0NlBheOGHvI';

const apiKey = process.env.N8N_API_KEY;
if (!apiKey) {
  console.error('ERROR: Set N8N_API_KEY env var before running this script.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'X-N8N-API-KEY': apiKey,
};

const wf = JSON.parse(readFileSync(WF_FILE, 'utf8'));
const body = {
  name: wf.name,
  nodes: wf.nodes,
  connections: wf.connections,
  settings: { executionOrder: 'v1' },
};

console.log(`Deploying workflow "${wf.name}" (${wf.nodes.length} nodos) to VPS...`);

const putRes = await fetch(`${VPS_BASE}/workflows/${WF_ID}`, {
  method: 'PUT',
  headers,
  body: JSON.stringify(body),
});

if (!putRes.ok) {
  const text = await putRes.text();
  console.error(`PUT failed: ${putRes.status} ${putRes.statusText}\n${text}`);
  process.exit(1);
}
const putJson = await putRes.json();
console.log(`PUT OK — versionId: ${putJson.versionId}`);

const actRes = await fetch(`${VPS_BASE}/workflows/${WF_ID}/activate`, {
  method: 'POST',
  headers,
});

if (!actRes.ok) {
  const text = await actRes.text();
  console.error(`Activate failed: ${actRes.status} ${actRes.statusText}\n${text}`);
  process.exit(1);
}
console.log('Workflow activated. ✅');
console.log('Acordate de hacer F5 en la pestaña de n8n antes de editar manualmente.');
