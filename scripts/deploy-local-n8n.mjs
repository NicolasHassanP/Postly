// Despliega el workflow principal del repo a la instancia LOCAL (expuesta por ngrok),
// remapeando credenciales y conservando los webhookId que ya funcionan en local.
//
// Las credenciales y los webhookId son POR INSTANCIA: el JSON del repo viene del VPS,
// asi que sus IDs de credencial no existen en local. Este script construye un mapa
// nombre -> id leyendo las credenciales que YA usan los nodos del workflow local, y
// reescribe las referencias del repo con los ids locales. Asi no hay que reconectar
// nada a mano en la UI.
//
// Uso:  node scripts/deploy-local-n8n.mjs            (dry-run: solo informa)
//       node scripts/deploy-local-n8n.mjs --deploy   (hace el PUT y reactiva)
import { readFileSync, writeFileSync } from "node:fs";

const ID = process.env.WF_ID || "VOgbHGLELJfRgVO5";
const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
const CANDIDATAS = ["N8N_API_KEY_LOCAL", "N8N_API_KEY_NGROK", "N8N_LOCAL_API_KEY", "N8N_API_KEY"];

function env() {
  const e = { ...process.env };
  try {
    for (const l of readFileSync(".env", "utf-8").split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !e[m[1]]) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* sin .env */ }
  return e;
}

const E = env();
// El host NO va hardcodeado: es un tunel a una maquina personal y el repo es publico.
const BASE = E.N8N_BASE_URL;
if (!BASE) {
  console.error("falta N8N_BASE_URL. Agregalo al .env:\n" +
                "  N8N_BASE_URL=https://<tu-dominio>.ngrok-free.dev");
  process.exit(1);
}
let cab = null;
for (const n of CANDIDATAS) {
  if (!E[n]) continue;
  const t = { "X-N8N-API-KEY": E[n], "ngrok-skip-browser-warning": "true", "content-type": "application/json" };
  const r = await fetch(`${BASE}/api/v1/workflows?limit=1`, { headers: t });
  if (r.ok) { cab = t; console.log(`autenticado con ${n}`); break; }
}
if (!cab) { console.error("ninguna API key autoriza en la instancia local"); process.exit(1); }

const g = await fetch(`${BASE}/api/v1/workflows/${ID}`, { headers: cab });
if (!g.ok) { console.error(`GET -> ${g.status}`); process.exit(1); }
const local = await g.json();
const repo = JSON.parse(readFileSync(RUTA, "utf-8"));
console.log(`local: ${local.nodes.length} nodos (activo: ${local.active}) | repo: ${repo.nodes.length} nodos`);

// respaldo del estado local antes de tocar nada
const respaldo = `workflows/_local-${ID}-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
writeFileSync(respaldo, JSON.stringify(local, null, 2), "utf-8");
console.log(`respaldo del local: ${respaldo}`);

// ── mapa nombre -> id de credencial, tomado de los nodos que ya andan en local
const credLocal = new Map();       // "tipo::nombre" -> id
for (const n of local.nodes) {
  for (const [tipo, c] of Object.entries(n.credentials || {})) {
    if (c?.name && c?.id) credLocal.set(`${tipo}::${c.name}`, c.id);
  }
}
console.log(`\ncredenciales detectadas en el local (${credLocal.size}):`);
for (const [k, v] of credLocal) console.log(`   ${k}  ->  ${v}`);

// ── webhookId que ya funcionan en local, por nombre de nodo
const webhookLocal = new Map();
for (const n of local.nodes) if (n.webhookId) webhookLocal.set(n.name, n.webhookId);
console.log(`\nwebhookId existentes en local (${webhookLocal.size}):`);
for (const [k, v] of webhookLocal) console.log(`   ${k}  ->  ${v}`);

// ── reescritura del JSON del repo para la instancia local
const nodos = JSON.parse(JSON.stringify(repo.nodes));
let remapeadas = 0, sinMapeo = [], webhooksConservados = 0;
for (const n of nodos) {
  for (const [tipo, c] of Object.entries(n.credentials || {})) {
    const clave = `${tipo}::${c.name}`;
    const idLocal = credLocal.get(clave);
    if (idLocal && idLocal !== c.id) { c.id = idLocal; remapeadas++; }
    else if (!idLocal) sinMapeo.push(`${n.name} -> ${clave}`);
  }
  if (n.webhookId && webhookLocal.has(n.name)) {
    n.webhookId = webhookLocal.get(n.name);
    webhooksConservados++;
  }
}
console.log(`\nreferencias de credencial remapeadas al id local: ${remapeadas}`);
console.log(`webhookId conservados del local: ${webhooksConservados}`);
if (sinMapeo.length) {
  console.log(`\nSIN MAPEO (hay que conectarlas a mano en la UI): ${sinMapeo.length}`);
  [...new Set(sinMapeo)].slice(0, 20).forEach(x => console.log(`   ! ${x}`));
}

if (!process.argv.includes("--deploy")) {
  console.log("\n(dry-run: no se tocó la instancia. Agregá --deploy para aplicar)");
  process.exit(0);
}

const put = await fetch(`${BASE}/api/v1/workflows/${ID}`, {
  method: "PUT",
  headers: cab,
  body: JSON.stringify({
    name: local.name,
    nodes: nodos,
    connections: repo.connections,
    settings: { executionOrder: "v1" },   // binaryMode da 400
  }),
});
console.log(`\nPUT /workflows/${ID} -> ${put.status}`);
if (!put.ok) { console.error((await put.text()).slice(0, 500)); process.exit(1); }

const act = await fetch(`${BASE}/api/v1/workflows/${ID}/activate`, { method: "POST", headers: cab });
console.log(`POST /workflows/${ID}/activate -> ${act.status}`);

const v = await fetch(`${BASE}/api/v1/workflows/${ID}`, { headers: cab });
const final = await v.json();
console.log(`\nverificación: ${final.nodes.length} nodos, activo: ${final.active}`);
console.log("Refrescá (F5) la pestaña de n8n antes de tocarla.");
