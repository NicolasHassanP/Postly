// Harness de validación — Módulo Centinela de Compliance (texto, HU7)
// Corre los 6 patrones EXACTOS desplegados en producción (nodo "Code in JavaScript1"
// del workflow "Postly - Entrega Final Sprint 1 v2") sobre los casos de texto del
// Anexo E, y produce la matriz de confusión + Recall/Precisión/F1.
//
// Uso:  node run_compliance_text.mjs [archivo.csv]
// Lee:  el CSV indicado (default Casos_Compliance.csv)   Escribe: <nombre>_resultados.csv

import { readFileSync, writeFileSync } from "node:fs";

// ─── Patrones VERBATIM del detector en producción (HU7) ──────────────────────
// v1 = set original, el que produjo las Tablas 3, 4 y 5 de la tesis.
// Se conserva para poder reproducir esas tablas: `node run_compliance_text.mjs <csv> --v1`
const PATRONES_V1 = [
  /(\$|u\$s|us\$|ar\$|€|£)\s?\d/i,
  /\d\s?[.,]?\d*\s?(pesos?|ars|usd|u\$d|d[oó]lares?|euros?|mangos?|lucas?)\b/i,
  /\d+[.,]\d{3}/,
  /\d+\s?%\s?(off|desc|descuento)/i,
  /\b(oferta|promo|promoci[oó]n|descuento|rebaja|barat[oa]|econ[oó]mic[oa]|gratis|2x1|3x2|cuotas?|financiaci[oó]n|sin\s+inter[eé]s)\b/i,
  /\b(precio|cuesta|vale|abon[aá]s?)\s*\$?\s*\d/i,
];

// v2 = set corregido tras el análisis de valores límite (Anexo E). Unificado en los
// 4 nodos de compliance por `scripts/fix-compliance-patterns.mjs`. Corrige: plurales,
// sintaxis "precio es N", espaciado inconsistente, y la divergencia del flujo HU10.
const PATRONES_V2 = [
  /(\$|u\$s|us\$|ar\$|€|£)\s*\d/i,
  /\d\s*[.,]?\d*\s*(pesos?|ars|usd|u\$d|d[oó]lares?|euros?|mangos?|lucas?)\b/i,
  /\d+[.,]\d{3}/,
  /\d+\s*%\s*(off|desc|descuento)/i,
  /\b(ofertas?|promos?|promoci[oó]n(?:es)?|descuentos?|rebajas?|barat[oa]s?|econ[oó]mic[oa]s?|gratis|2x1|3x2|cuotas?|financiaci[oó]n(?:es)?|sin\s+inter[eé]s)\b/i,
  /\b(precios?|cuesta|vale|abon[aá]s?)\s*(?:es|son|de|desde|:)?\s*\$?\s*\d/i,
];

const usarV1 = process.argv.includes("--v1");
const patronesPrecios = usarV1 ? PATRONES_V1 : PATRONES_V2;
console.log(`\n[detector: ${usarV1 ? "v1 (original, el de las Tablas 3-5)" : "v2 (corregido)"}]`);

// Réplica exacta de la decisión del nodo: bloquea con el primer patrón que matchea.
function evaluar(caption) {
  for (const patron of patronesPrecios) {
    const m = caption.match(patron);
    if (m) return { bloquea: true, patron: m[0] };
  }
  return { bloquea: false, patron: "" };
}

// ─── Parser CSV mínimo (soporta comillas y comas dentro de campos) ────────────
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\r") { /* skip */ }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function toCSV(rows) {
  return rows.map(r => r.map(v => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(",")).join("\n");
}

// ─── Cargar casos ─────────────────────────────────────────────────────────────
const inputName = process.argv[2] || "Casos_Compliance.csv";
const outputName = inputName.replace(/\.csv$/i, "") + "_resultados.csv";
const raw = readFileSync(new URL("./" + inputName, import.meta.url), "utf-8");
const rows = parseCSV(raw);
const header = rows[0];
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

let VP = 0, FP = 0, VN = 0, FN = 0, pendientes = 0;
const fallos = [];

for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  if (!row[idx.ID]) continue;
  const canal = row[idx.Canal];
  const claseReal = row[idx.Clase_real];            // INFRACTOR | LIMPIO
  const contenido = row[idx.Contenido_entrada];

  // Filas de imagen (HU8 visión): el resultado se carga a mano tras correr el bot.
  if (canal !== "Texto") {
    const pre = (row[idx.Resultado_obtenido] || "").toLowerCase();
    let bloqueaImg = null;
    if (pre.includes("bloque")) bloqueaImg = true;
    else if (pre.includes("public") || pre.includes("copys") || pre.includes("gener")) bloqueaImg = false;
    if (bloqueaImg === null) { row[idx.Veredicto] = "—"; pendientes++; continue; }
    let vImg;
    if (claseReal === "INFRACTOR") vImg = bloqueaImg ? "VP" : "FN";
    else                          vImg = bloqueaImg ? "FP" : "VN";
    row[idx.Veredicto] = vImg;
    if (vImg === "VP") VP++; else if (vImg === "FP") FP++;
    else if (vImg === "VN") VN++; else FN++;
    if (vImg === "FN" || vImg === "FP")
      fallos.push({ id: row[idx.ID], veredicto: vImg, contenido, patron: "(visión HU8)" });
    continue;
  }

  const { bloquea, patron } = evaluar(contenido);
  const accion = bloquea ? "Bloqueo" : "Publico";
  row[idx.Resultado_obtenido] = bloquea ? `Bloqueo (patron: ${patron})` : "Publico";

  let veredicto;
  if (claseReal === "INFRACTOR") veredicto = bloquea ? "VP" : "FN";
  else                          veredicto = bloquea ? "FP" : "VN";
  row[idx.Veredicto] = veredicto;

  if (veredicto === "VP") VP++;
  else if (veredicto === "FP") FP++;
  else if (veredicto === "VN") VN++;
  else FN++;

  if (veredicto === "FN" || veredicto === "FP") {
    fallos.push({ id: row[idx.ID], veredicto, contenido, patron });
  }
}

// ─── Métricas ─────────────────────────────────────────────────────────────────
const recall    = VP / (VP + FN);
const precision = VP / (VP + FP);
const f1        = (2 * precision * recall) / (precision + recall);
const especif   = VN / (VN + FP);
const exactitud = (VP + VN) / (VP + VN + FP + FN);

writeFileSync(new URL("./" + outputName, import.meta.url), toCSV(rows), "utf-8");

const pct = x => (x * 100).toFixed(1) + "%";
const total = VP + FP + VN + FN;
console.log(`\n════════ MATRIZ DE CONFUSIÓN — Módulo Centinela (${total} casos: HU7 texto + HU8 imagen) ════════\n`);
console.log("                      │ Sistema BLOQUEÓ │ Sistema PUBLICÓ");
console.log("  ────────────────────┼─────────────────┼────────────────");
console.log(`  Real INFRACTOR       │   VP = ${String(VP).padStart(2)}      │   FN = ${String(FN).padStart(2)}`);
console.log(`  Real LIMPIO          │   FP = ${String(FP).padStart(2)}      │   VN = ${String(VN).padStart(2)}`);
console.log("\n──────────────────────────────────────────────────────────────");
console.log(`  Recall (sensibilidad)   = VP/(VP+FN) = ${VP}/${VP + FN} = ${recall.toFixed(3)}  (${pct(recall)})`);
console.log(`  Precisión               = VP/(VP+FP) = ${VP}/${VP + FP} = ${precision.toFixed(3)}  (${pct(precision)})`);
console.log(`  Especificidad           = VN/(VN+FP) = ${VN}/${VN + FP} = ${especif.toFixed(3)}  (${pct(especif)})`);
console.log(`  F1-score                = ${f1.toFixed(3)}`);
console.log(`  Exactitud (accuracy)    = ${exactitud.toFixed(3)}  (${pct(exactitud)})`);
console.log("\n──────────────── Casos que el detector FALLÓ ────────────────");
for (const f of fallos) {
  const tag = f.veredicto === "FN" ? "FN (se escapó un precio)" : `FP (bloqueó copy limpio → "${f.patron}")`;
  console.log(`  ${f.id}  ${tag}\n       "${f.contenido}"`);
}
console.log(`\n✔ Resultados escritos en ${outputName}`);
if (pendientes > 0) console.log(`  (${pendientes} casos de imagen quedan PENDIENTES para el bot real)\n`);
else console.log("  (matriz completa: texto + imagen)\n");
