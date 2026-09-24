// Corrige el "schema" cacheado (metadata para la UI) de los nodos de Google Sheets que
// quedaron desactualizados contra la hoja real "Hoja 1" de Postly_DB, después de que en
// algún momento se agregó la columna Carousel_URLs (entre ImageURL y Status).
//
// Sólo 2 de los 9 nodos que tocan esa hoja tenían el schema al día (Consistencia,
// Sync: Upsert). Los otros 7 seguían con el orden viejo, y n8n valida el schema cacheado
// contra la hoja real en cada ejecución (checkForSchemaChanges): por eso "Repost: Guardar
// fila" tiró "Column names were updated after the node's setup" al correr.
//
// Verificado antes de escribir: los 7 nodos SOLO escriben (columns.value) a nombres de
// columna que siguen existiendo en la hoja real -ninguno referencia una columna eliminada-,
// así que esto es un fix de metadata pura. NO TOCA columns.value ni columns.matchingColumns
// -las expresiones que arman cada fila quedan exactamente iguales-, sólo reescribe
// columns.schema para que coincida con el orden real, tomando como plantilla el schema ya
// correcto del nodo "Consistencia". Es lo mismo que hace el botón "Refresh" del editor,
// aplicado a los 7 nodos de una sola vez.
//
// Uso:  node scripts/fix-sheets-schema-drift.mjs            (sólo escribe el .json del repo)
//       N8N_API_KEY=<key> node scripts/fix-sheets-schema-drift.mjs --deploy   (además PUT)

import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
const WF_ID = "VOgbHGLELJfRgVO5"; // instancia LOCAL (la VPS ya no existe)

const AFECTADOS = [
  "Repost: Guardar fila",
  "HU5: Crear pendiente",
  "Video: pub guardar",
  "Descripcion en columna H",
  "Actualizar Sheets",
  "HU5: Pub guardar",
  "Sched: Guardar",
];

function entorno() {
  const e = { ...process.env };
  try {
    for (const l of readFileSync(".env", "utf-8").split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !e[m[1]]) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* sin .env */ }
  return e;
}
const ENTORNO = entorno();
const BASE = ENTORNO.N8N_BASE_URL;

function schemaEntry(plantillaPorColumna, id) {
  const t = plantillaPorColumna[id];
  return {
    id,
    displayName: id,
    required: false,
    defaultMatch: false,
    display: true,
    type: t?.type || "string",
    canBeUsedToMatch: true,
  };
}
const ROW_NUMBER_ENTRY = {
  id: "row_number", displayName: "row_number", required: false, defaultMatch: false,
  display: true, type: "number", canBeUsedToMatch: true, readOnly: true, removed: false,
};

function parchear(wf, etiqueta) {
  const consistencia = wf.nodes.find(n => n.name === "Consistencia");
  if (!consistencia) { console.log("!! no se encontró el nodo 'Consistencia' como referencia"); return 0; }
  const COLUMNAS_REALES = consistencia.parameters.columns.schema.map(c => c.id);
  const plantilla = Object.fromEntries(consistencia.parameters.columns.schema.map(c => [c.id, c]));

  let cambios = 0;
  for (const nodo of wf.nodes) {
    if (!AFECTADOS.includes(nodo.name)) continue;
    const cols = nodo.parameters?.columns;
    if (!cols || cols.mappingMode !== "defineBelow") { console.log(`!! ${nodo.name}: no tiene columns.defineBelow, se omite`); continue; }

    const teniaRowNumber = (cols.schema || []).some(c => c.id === "row_number");
    const nuevoSchema = COLUMNAS_REALES.map(id => schemaEntry(plantilla, id));
    if (teniaRowNumber) nuevoSchema.push(ROW_NUMBER_ENTRY);

    const anterior = JSON.stringify(cols.schema);
    const nuevo = JSON.stringify(nuevoSchema);
    if (anterior === nuevo) {
      console.log(`==  ${nodo.name.padEnd(24)} ya estaba corregido`);
      continue;
    }
    cols.schema = nuevoSchema;
    cambios++;
    console.log(`OK  ${nodo.name.padEnd(24)} schema actualizado (${nuevoSchema.length} columnas${teniaRowNumber ? " + row_number" : ""}) [${etiqueta}] — value sin tocar`);
  }
  return cambios;
}

const desplegar = process.argv.includes("--deploy");

if (!desplegar) {
  const wf = JSON.parse(readFileSync(RUTA, "utf-8"));
  const n = parchear(wf, "repo");
  writeFileSync(RUTA, JSON.stringify(wf, null, 2), "utf-8");
  console.log(`\n${n} nodos modificados en ${RUTA}`);
  console.log("(sin --deploy: no se tocó la instancia de n8n)");
  process.exit(0);
}

const key = ENTORNO.N8N_API_KEY_LOCAL || ENTORNO.N8N_API_KEY;
if (!BASE) { console.error("falta N8N_BASE_URL en el .env"); process.exit(1); }
if (!key) { console.error("falta N8N_API_KEY_LOCAL (o N8N_API_KEY) en el .env"); process.exit(1); }
const cab = { "X-N8N-API-KEY": key, "content-type": "application/json" };

const g = await fetch(`${BASE}/api/v1/workflows/${WF_ID}`, { headers: cab });
if (!g.ok) { console.error(`GET -> ${g.status}: ${(await g.text()).slice(0, 300)}`); process.exit(1); }
const vivo = await g.json();
console.log(`GET /workflows/${WF_ID} -> 200 (${vivo.nodes.length} nodos)`);

const n = parchear(vivo, "vivo");
if (n === 0) { console.log("\nnada que desplegar: los 7 nodos ya tienen el schema corregido"); process.exit(0); }

const r = await fetch(`${BASE}/api/v1/workflows/${WF_ID}`, {
  method: "PUT",
  headers: cab,
  body: JSON.stringify({
    name: vivo.name,
    nodes: vivo.nodes,
    connections: vivo.connections,
    settings: { executionOrder: "v1" },   // binaryMode da 400
  }),
});
console.log(`PUT /workflows/${WF_ID} -> ${r.status}`);
if (!r.ok) { console.error((await r.text()).slice(0, 400)); process.exit(1); }

writeFileSync(RUTA, JSON.stringify(vivo, null, 2), "utf-8");
console.log("desplegado y sincronizado al repo. Refrescá (F5) la pestaña de n8n antes de tocarla.");
