// Crea en la instancia LOCAL los workflows que le faltan (los sub-workflows de HU10 y
// el Programador), remapeando credenciales y las referencias entre workflows.
//
// El Programador referencia a los sub-workflows por ID, y los IDs son por instancia:
// los del repo son los del VPS. Este script crea primero los sub-workflows, toma los
// IDs locales que devuelve la API y reescribe las referencias del Programador.
//
// El Programador se crea DESACTIVADO a propósito: es un Cron cada 5 minutos que publica
// en Instagram y Facebook de verdad. Si la hoja tiene filas pendientes con fecha pasada,
// activarlo publica de inmediato. Activar a mano cuando corresponda.
//
// Uso:  node scripts/import-local-workflows.mjs            (dry-run)
//       node scripts/import-local-workflows.mjs --deploy
import { readFileSync } from "node:fs";

const PRINCIPAL = process.env.WF_ID || "VOgbHGLELJfRgVO5";
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
if (!cab) { console.error("ninguna API key autoriza"); process.exit(1); }

// mapa nombre -> id de credencial, leído del workflow principal ya sincronizado
const g = await fetch(`${BASE}/api/v1/workflows/${PRINCIPAL}`, { headers: cab });
const principal = await g.json();
const credLocal = new Map();
for (const n of principal.nodes)
  for (const [tipo, c] of Object.entries(n.credentials || {}))
    if (c?.name && c?.id) credLocal.set(`${tipo}::${c.name}`, c.id);
console.log(`credenciales locales conocidas: ${credLocal.size}`);

const l = await fetch(`${BASE}/api/v1/workflows?limit=100`, { headers: cab });
const existentes = new Map((await l.json()).data.map(w => [w.name, w.id]));
console.log(`workflows ya presentes: ${[...existentes.keys()].join(" | ")}`);

// orden: primero los sub-workflows, después el Programador que los referencia
const PLAN = [
  ["workflows/Postly - Publicar Post.json", "Postly - Publicar Post"],
  ["workflows/Postly - Publicar Carrusel.json", "Postly - Publicar Carrusel"],
  ["workflows/Postly - Programador.json", "Postly - Programador"],
];
const idsNuevos = new Map();   // nombre -> id local

function preparar(wf) {
  const nodos = JSON.parse(JSON.stringify(wf.nodes));
  let remap = 0, refs = 0, sinMapeo = [];
  for (const n of nodos) {
    for (const [tipo, c] of Object.entries(n.credentials || {})) {
      const id = credLocal.get(`${tipo}::${c.name}`);
      if (id) { if (id !== c.id) remap++; c.id = id; }
      else sinMapeo.push(`${n.name} -> ${tipo}::${c.name}`);
    }
    // referencias a sub-workflows: reapuntar al id local recién creado
    const p = n.parameters || {};
    if (p.workflowId && typeof p.workflowId === "object") {
      const nombre = p.workflowId.cachedResultName;
      const idLocal = idsNuevos.get(nombre) || existentes.get(nombre);
      if (idLocal) { p.workflowId.value = idLocal; refs++; }
      else sinMapeo.push(`${n.name} -> sub-workflow "${nombre}" no encontrado`);
    }
  }
  return { nodos, remap, refs, sinMapeo };
}

const aplicar = process.argv.includes("--deploy");
for (const [ruta, nombre] of PLAN) {
  const wf = JSON.parse(readFileSync(ruta, "utf-8"));
  if (existentes.has(nombre)) {
    console.log(`\n== ${nombre}: ya existe (${existentes.get(nombre)}), se omite`);
    idsNuevos.set(nombre, existentes.get(nombre));
    continue;
  }
  const { nodos, remap, refs, sinMapeo } = preparar(wf);
  console.log(`\n== ${nombre}: ${nodos.length} nodos | credenciales remapeadas: ${remap} | refs a sub-wf: ${refs}`);
  if (sinMapeo.length) sinMapeo.forEach(x => console.log(`   ! ${x}`));
  if (!aplicar) continue;
  const r = await fetch(`${BASE}/api/v1/workflows`, {
    method: "POST",
    headers: cab,
    body: JSON.stringify({
      name: nombre,
      nodes: nodos,
      connections: wf.connections,
      settings: { executionOrder: "v1" },
    }),
  });
  if (!r.ok) { console.error(`   POST -> ${r.status}: ${(await r.text()).slice(0, 300)}`); continue; }
  const creado = await r.json();
  idsNuevos.set(nombre, creado.id);
  console.log(`   creado con id local ${creado.id} (inactivo)`);
}

if (!aplicar) { console.log("\n(dry-run: no se creó nada. Agregá --deploy)"); process.exit(0); }

const fin = await fetch(`${BASE}/api/v1/workflows?limit=100`, { headers: cab });
console.log("\nestado final de la instancia local:");
for (const w of (await fin.json()).data)
  console.log(`  ${w.id}  ${w.active ? "ACTIVO  " : "inactivo"}  ${String(w.nodes?.length ?? "?").padStart(3)} nodos  ${w.name}`);
console.log("\nEl Programador quedó INACTIVO. Antes de activarlo, revisar que la hoja no tenga");
console.log("filas pendientes con fecha pasada: al activarse publicaría de inmediato.");
