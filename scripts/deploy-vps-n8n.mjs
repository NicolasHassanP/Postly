// Despliega los 6 workflows del repo a una instancia de n8n VACÍA (el VPS de DonWeb).
//
// A diferencia de deploy-local-n8n.mjs (que actualiza workflows ya existentes y saca los
// ids de credencial de sus nodos), acá no hay nada desplegado todavía:
//   - las credenciales se mapean por tipo leyendo GET /credentials de la instancia;
//   - los workflows se CREAN en orden (sub-workflows primero) y el Programador se
//     reapunta a los ids nuevos de "Publicar Post" / "Publicar Carrusel";
//   - el host del VPS de junio, hardcodeado en el redirect de OAuth (principal y HU2),
//     se reemplaza por el host destino al vuelo: el JSON del repo no se toca.
// Es idempotente: si un workflow ya existe con ese nombre, se omite.
//
// Solo se activan el principal y el OAuth Callback. El Programador queda INACTIVO a
// propósito (publica de verdad; con filas pendientes de fecha pasada publica en el acto)
// y el Feedback Loop también, hasta decidirlo.
//
// Uso:  N8N_VPS_URL=https://<host> node scripts/deploy-vps-n8n.mjs            (dry-run)
//       N8N_VPS_URL=https://<host> node scripts/deploy-vps-n8n.mjs --deploy
// La key sale de N8N_API_KEY_VPS (process.env o .env) y no se imprime.
import { readFileSync } from "node:fs";

const HOST_VIEJO = "https://vps-6120781-x.dattaweb.com";
const PLAN = [   // [nombre, activar]
  ["Postly - Publicar Post", false],
  ["Postly - Publicar Carrusel", false],
  ["Postly - Programador", false],
  ["Postly - Feedback Loop", false],
  ["Postly - HU2 OAuth Callback", true],
  ["Postly - Entrega Final Sprint 1 v2", true],
];

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
const BASE = (E.N8N_VPS_URL || "").replace(/\/$/, "");
if (!BASE) { console.error("falta N8N_VPS_URL (https://<host del VPS>)"); process.exit(1); }
if (!E.N8N_API_KEY_VPS) { console.error("falta N8N_API_KEY_VPS en el .env"); process.exit(1); }
const cab = { "X-N8N-API-KEY": E.N8N_API_KEY_VPS, "content-type": "application/json" };

async function api(metodo, ruta, cuerpo) {
  const r = await fetch(`${BASE}/api/v1${ruta}`, {
    method: metodo, headers: cab, body: cuerpo && JSON.stringify(cuerpo),
  });
  if (!r.ok) throw new Error(`${metodo} ${ruta} -> ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.status === 204 ? null : r.json();
}

// ── credenciales de la instancia: tipo -> [{id, name}]
const creds = new Map();
for (const c of (await api("GET", "/credentials")).data) {
  if (!creds.has(c.type)) creds.set(c.type, []);
  creds.get(c.type).push(c);
}
console.log("credenciales en la instancia:");
for (const [t, l] of creds) console.log(`   ${t}: ${l.map(c => `${c.name} (${c.id})`).join(", ")}`);

function credPara(tipo, nombre) {
  const l = creds.get(tipo) || [];
  return l.find(c => c.name === nombre) || (l.length === 1 ? l[0] : null);
}

const existentes = new Map((await api("GET", "/workflows?limit=100")).data.map(w => [w.name, w.id]));
const ids = new Map(existentes);
const aplicar = process.argv.includes("--deploy");

for (const [nombre, activar] of PLAN) {
  const wf = JSON.parse(readFileSync(`workflows/${nombre}.json`, "utf-8"));
  if (existentes.has(nombre)) {
    console.log(`\n== ${nombre}: ya existe (${existentes.get(nombre)}), se omite`);
    continue;
  }
  const nodos = JSON.parse(JSON.stringify(wf.nodes).split(HOST_VIEJO).join(BASE));
  const hosts = (JSON.stringify(wf.nodes).split(HOST_VIEJO).length - 1);
  let refs = 0; const faltan = [];
  for (const n of nodos) {
    for (const [tipo, c] of Object.entries(n.credentials || {})) {
      const d = credPara(tipo, c.name);
      if (d) { c.id = d.id; c.name = d.name; } else faltan.push(`${n.name} -> ${tipo}::${c.name}`);
    }
    const w = n.parameters?.workflowId;
    if (w && typeof w === "object") {
      const id = ids.get(w.cachedResultName);
      if (id) { w.value = id; refs++; }
      else faltan.push(`${n.name} -> sub-workflow "${w.cachedResultName}"`);
    }
  }
  console.log(`\n== ${nombre}: ${nodos.length} nodos | host reemplazado: ${hosts} | refs a sub-wf: ${refs}` +
              ` | ${activar ? "se ACTIVA" : "queda inactivo"}`);
  faltan.forEach(x => console.log(`   ! sin mapeo: ${x}`));
  if (!aplicar) continue;
  if (faltan.length) { console.error("   se omite: hay referencias sin mapear"); continue; }

  const creado = await api("POST", "/workflows", {
    name: nombre, nodes: nodos, connections: wf.connections, settings: { executionOrder: "v1" },
  });
  ids.set(nombre, creado.id);
  console.log(`   creado: ${creado.id}`);
  if (activar) {
    await api("POST", `/workflows/${creado.id}/activate`);
    console.log("   activado");
  }
}

if (!aplicar) { console.log("\n(dry-run: no se creó nada. Agregá --deploy)"); process.exit(0); }

console.log("\nestado final:");
for (const w of (await api("GET", "/workflows?limit=100")).data)
  console.log(`  ${w.id}  ${w.active ? "ACTIVO  " : "inactivo"}  ${String(w.nodes?.length ?? "?").padStart(3)} nodos  ${w.name}`);
