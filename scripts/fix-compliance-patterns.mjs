// Unifica y corrige el set de patrones del Módulo Centinela (HU7) en los 4 nodos
// del workflow principal que hacen compliance de precios en texto.
//
// Motivación (análisis de valores límite, Anexo E):
//   1. Los plurales se escapaban: la lista de vocabulario era \b(oferta|promo|...)\b
//      sin `s?` opcional, y el \b fallaba contra la "s" ("las ofertas", "los precios").
//   2. La sintaxis natural del español se escapaba: el patrón de palabra-precio exigía
//      el número pegado, así que "precio 3200" bloqueaba pero "el precio es 3200" no.
//   3. Inconsistencia entre reglas: el patrón de símbolo admitía un solo espacio (\s?)
//      mientras el de moneda admitía dos, así que "$  2500" se escapaba y "4500  pesos" no.
//   4. DIVERGENCIA ENTRE FLUJOS: el nodo de programación a futuro (HU10, "Sched: Procesar")
//      tenía un set propio de 4 patrones, sin palabra-moneda, sin palabra-precio y con el
//      vocabulario sin acentos ni femeninos. Un contenido que el bot bloqueaba al publicar
//      al instante se podía publicar programándolo.
//
// Verificado antes de desplegar: mejora el set límite (F1 0,519 -> 0,750) sin mover
// ni un caso de los sets representativo (0,833), de estrés (0,632) ni de campo real (1,000).
//
// Uso:  node scripts/fix-compliance-patterns.mjs            (sólo escribe el .json del repo)
//       N8N_API_KEY=<key> node scripts/fix-compliance-patterns.mjs --deploy   (además hace PUT)

import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
const WF_ID = "0aclc0NlBheOGHvI";
// El host sale del entorno (N8N_BASE_URL en process.env o .env); no se hardcodea.
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

// Set canónico corregido. Único para los 4 flujos.
const CANONICO = String.raw`[
  /(\$|u\$s|us\$|ar\$|€|£)\s*\d/i,
  /\d\s*[.,]?\d*\s*(pesos?|ars|usd|u\$d|d[oó]lares?|euros?|mangos?|lucas?)\b/i,
  /\d+[.,]\d{3}/,
  /\d+\s*%\s*(off|desc|descuento)/i,
  /\b(ofertas?|promos?|promoci[oó]n(?:es)?|descuentos?|rebajas?|barat[oa]s?|econ[oó]mic[oa]s?|gratis|2x1|3x2|cuotas?|financiaci[oó]n(?:es)?|sin\s+inter[eé]s)\b/i,
  /\b(precios?|cuesta|vale|abon[aá]s?)\s*(?:es|son|de|desde|:)?\s*\$?\s*\d/i
]`;

const CANONICO_1L = CANONICO.split("\n").map(l => l.trim()).join(" ")
  .replace("[ ", "[").replace(" ]", "]");

// nodo -> nombre de la variable que contiene el array
const OBJETIVO = {
  "Code in JavaScript1": "patronesPrecios",  // HU7/HU9 — imagen única
  "HU5: Pub preparar":   "patrones",         // HU5   — carrusel
  "Sched: Procesar":     "patrones",         // HU10  — programación (tenía el set débil)
  "Video: pub publicar": "pats",             // HU13  — video / Reel
};

// Aplica el set canónico a los 4 nodos del workflow que se le pase. Idempotente:
// correrlo dos veces deja el mismo resultado.
function parchear(wf, etiqueta) {
  let cambios = 0;
  for (const nodo of wf.nodes) {
    const variable = OBJETIVO[nodo.name];
    if (!variable) continue;
    const src = nodo.parameters.jsCode;
    const re = new RegExp(`const\\s+${variable}\\s*=\\s*\\[[\\s\\S]*?\\];`);
    const m = src.match(re);
    if (!m) { console.log(`!! ${nodo.name}: no se encontró el array ${variable}`); continue; }
    const unaLinea = !m[0].includes("\n");
    const reemplazo = `const ${variable} = ${unaLinea ? CANONICO_1L : CANONICO};`;
    if (m[0] === reemplazo) {
      console.log(`==  ${nodo.name.padEnd(22)} ya estaba corregido`);
      continue;
    }
    nodo.parameters.jsCode = src.replace(re, reemplazo);
    cambios++;
    console.log(`OK  ${nodo.name.padEnd(22)} (${variable}, ${unaLinea ? "una línea" : "multilínea"}) [${etiqueta}]`);
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

// GET del workflow VIVO y parcheo sobre esa copia: así no se sobrescribe con una
// versión vieja del repo si alguien editó en n8n desde el último pull.
const g = await fetch(`${BASE}/api/v1/workflows/${WF_ID}`, { headers: cab });
if (!g.ok) { console.error(`GET -> ${g.status}: ${(await g.text()).slice(0, 300)}`); process.exit(1); }
const vivo = await g.json();
console.log(`GET /workflows/${WF_ID} -> 200 (${vivo.nodes.length} nodos)`);

const n = parchear(vivo, "vivo");
if (n === 0) { console.log("\nnada que desplegar: la instancia ya tiene el set corregido"); process.exit(0); }

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
