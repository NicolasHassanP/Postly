// Sonda de solo lectura contra la instancia local expuesta por ngrok.
// Lee N8N_API_KEY del .env y NO la imprime. Reporta qué workflows hay y qué
// versión del principal está cargada (para saber si el local está al día).
import { readFileSync } from "node:fs";

// Candidatas de API key, en orden de preferencia. Se reporta cuál sirvió por NOMBRE, nunca el valor.
const CANDIDATAS = ["N8N_API_KEY_LOCAL", "N8N_API_KEY_NGROK", "N8N_LOCAL_API_KEY", "N8N_API_KEY"];

// El host NO va hardcodeado: es la URL de un túnel a una máquina personal y este repo es
// público. Sale de N8N_BASE_URL (process.env o .env, que está en .gitignore).
function entorno() {
  const env = { ...process.env };
  try {
    for (const linea of readFileSync(".env", "utf-8").split(/\r?\n/)) {
      const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* sin .env */ }
  return env;
}

const E = entorno();
const BASE = E.N8N_BASE_URL;
if (!BASE) {
  console.error("falta N8N_BASE_URL. Agregalo al .env:\n" +
                "  N8N_BASE_URL=https://<tu-dominio>.ngrok-free.dev");
  process.exit(1);
}
const disponibles = CANDIDATAS.filter(n => E[n]).map(n => [n, E[n]]);
console.log(`base: ${BASE}`);
console.log(`candidatas encontradas: ${disponibles.map(([n, v]) => `${n} (${v.length} chars)`).join(", ") || "ninguna"}`);
if (!disponibles.length) {
  console.log("-> generar la key en el n8n local: Settings -> n8n API -> Create an API key");
  process.exit(1);
}

let key = null, cab = null, r = null;
for (const [nombre, valor] of disponibles) {
  cab = { "X-N8N-API-KEY": valor, "ngrok-skip-browser-warning": "true" };
  r = await fetch(`${BASE}/api/v1/workflows?limit=50`, { headers: cab });
  console.log(`  ${nombre} -> HTTP ${r.status}`);
  if (r.ok) { key = valor; console.log(`usando ${nombre}`); break; }
}
if (!key) {
  console.log("\n-> ninguna key autoriza en ESTA instancia (las API keys de n8n son por instancia).");
  console.log("   Generar una nueva en el n8n local: Settings -> n8n API -> Create an API key");
  process.exit(1);
}
const { data } = await r.json();
console.log(`\nworkflows en la instancia local (${data.length}):`);
for (const w of data) {
  console.log(`  ${w.id}  ${w.active ? "ACTIVO  " : "inactivo"}  ${String(w.nodes?.length ?? "?").padStart(3)} nodos  ${w.name}`);
}

// ¿El workflow principal local está al día respecto del repo?
const ID = process.env.WF_ID || "VOgbHGLELJfRgVO5";
const g = await fetch(`${BASE}/api/v1/workflows/${ID}`, { headers: cab });
console.log(`\nGET /api/v1/workflows/${ID} -> ${g.status}`);
if (!g.ok) process.exit(1);
const vivo = await g.json();
const repo = JSON.parse(readFileSync("workflows/Postly - Entrega Final Sprint 1 v2.json", "utf-8"));

const nombres = w => new Set(w.nodes.map(n => n.name));
const nLocal = nombres(vivo), nRepo = nombres(repo);
const faltan = [...nRepo].filter(x => !nLocal.has(x));
const sobran = [...nLocal].filter(x => !nRepo.has(x));

console.log(`\nlocal: ${vivo.nodes.length} nodos | repo: ${repo.nodes.length} nodos`);
console.log(`nodos del repo que NO están en el local: ${faltan.length}`);
faltan.slice(0, 25).forEach(n => console.log(`   - ${n}`));
if (faltan.length > 25) console.log(`   … y ${faltan.length - 25} más`);
console.log(`nodos del local que no están en el repo: ${sobran.length}`);
sobran.slice(0, 10).forEach(n => console.log(`   + ${n}`));

// estado del compliance en el local
const CLAVES = ["Code in JavaScript1", "HU5: Pub preparar", "Sched: Procesar", "Video: pub publicar"];
console.log("\nnodos de compliance en el local:");
for (const nombre of CLAVES) {
  const nodo = vivo.nodes.find(n => n.name === nombre);
  if (!nodo) { console.log(`   ${nombre.padEnd(22)} AUSENTE`); continue; }
  const src = nodo.parameters?.jsCode || "";
  const m = src.match(/const\s+(?:patronesPrecios|patrones|pats)\s*=\s*\[[\s\S]*?\];/);
  const arr = m ? m[0] : "";
  const corregido = arr.includes("ofertas?") && arr.includes("precios?");
  const patrones = (arr.match(/\/[^\n]*?\/i?,?/g) || []).length;
  console.log(`   ${nombre.padEnd(22)} ${m ? `${patrones} patrones, ${corregido ? "CORREGIDO" : "sin corregir"}` : "sin array de patrones"}`);
}
