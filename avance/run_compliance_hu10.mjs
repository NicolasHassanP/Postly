// Divergencia entre flujos del Módulo Centinela (hallazgo del análisis de valores límite).
//
// Antes de la unificación, el nodo que procesa las publicaciones programadas a futuro
// ("Sched: Procesar", HU10) mantenía un conjunto propio de 4 patrones —sin la regla de
// palabra-moneda, sin la de palabra-precio y con el vocabulario comercial sin acentos ni
// femeninos—, de modo que un contenido bloqueado al publicarse en el momento podía
// publicarse si se programaba. Este script cuantifica esa divergencia sobre los cuatro
// conjuntos de casos y produce la cifra que reporta el §5.1 (Recall 0,500 del flujo
// programado frente a 0,833 del flujo inmediato, sobre el canal de texto del conjunto
// representativo) y los casos de campo afectados.
//
// Uso:  node run_compliance_hu10.mjs
// Escribe: Divergencia_HU10_resultados.csv

import { readFileSync, writeFileSync } from "node:fs";

// Set del flujo inmediato (HU7/HU9), el que produjo las Tablas 3, 4 y 5.
const INMEDIATO = [
  /(\$|u\$s|us\$|ar\$|€|£)\s?\d/i,
  /\d\s?[.,]?\d*\s?(pesos?|ars|usd|u\$d|d[oó]lares?|euros?|mangos?|lucas?)\b/i,
  /\d+[.,]\d{3}/,
  /\d+\s?%\s?(off|desc|descuento)/i,
  /\b(oferta|promo|promoci[oó]n|descuento|rebaja|barat[oa]|econ[oó]mic[oa]|gratis|2x1|3x2|cuotas?|financiaci[oó]n|sin\s+inter[eé]s)\b/i,
  /\b(precio|cuesta|vale|abon[aá]s?)\s*\$?\s*\d/i,
];

// Set divergente del flujo programado, recuperado del workflow versionado en el commit
// anterior a scripts/fix-compliance-patterns.mjs.
const PROGRAMADO = [
  /\$\s?\d+/,
  /\d+[.,]\d{3}/,
  /\d+%\s?(off|desc)/i,
  /\b(oferta|promocion|promo|descuento|rebaja|barato|economico|gratis)\b/i,
];

const bloquea = (patrones, s) => patrones.some(p => p.test(s));

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

const leer = f => {
  const rows = parseCSV(readFileSync(new URL("./" + f, import.meta.url), "utf-8"));
  const H = Object.fromEntries(rows[0].map((h, i) => [h.trim(), i]));
  return rows.slice(1).filter(r => r[H.ID] && r[H.ID].trim()).map(r => ({
    id: r[H.ID],
    canal: (r[H.Canal] || "Texto").trim(),
    clase: (r[H.Clase_real] ?? r[H.Ground_truth] ?? "").trim().toUpperCase(),
    texto: (r[H.Contenido_entrada] ?? r[H.Contenido_real] ?? ""),
  }));
};

const CONJUNTOS = [
  ["representativo", "Casos_Compliance_Representativo.csv"],
  ["estrés", "Casos_Compliance.csv"],
  ["valores límite", "Casos_Compliance_Limite.csv"],
  ["campo real", "Compliance_Campo.csv"],
];

const salida = [["Conjunto", "ID", "Clase_real", "Contenido", "Flujo_inmediato",
                 "Flujo_programado", "Diverge"]];

console.log("\n════ Divergencia entre el flujo inmediato (HU7/HU9) y el programado (HU10) ════");
console.log("    (sólo canal de texto; el canal de imagen es común a ambos flujos)\n");

for (const [nombre, archivo] of CONJUNTOS) {
  const casos = leer(archivo).filter(c => c.canal === "Texto");
  let vpI = 0, fnI = 0, vpP = 0, fnP = 0;
  const divergentes = [];
  for (const c of casos) {
    const bI = bloquea(INMEDIATO, c.texto), bP = bloquea(PROGRAMADO, c.texto);
    if (c.clase === "INFRACTOR") { bI ? vpI++ : fnI++; bP ? vpP++ : fnP++; }
    if (bI !== bP) divergentes.push({ ...c, bI, bP });
    salida.push([nombre, c.id, c.clase, c.texto, bI ? "Bloquea" : "Publica",
                 bP ? "Bloquea" : "Publica", bI !== bP ? "SÍ" : "no"]);
  }
  const rI = vpI / (vpI + fnI), rP = vpP / (vpP + fnP);
  console.log(`── conjunto ${nombre} (${casos.length} casos de texto)`);
  console.log(`   Recall flujo inmediato  = ${vpI}/${vpI + fnI} = ${rI.toFixed(3)}`);
  console.log(`   Recall flujo programado = ${vpP}/${vpP + fnP} = ${rP.toFixed(3)}`);
  console.log(`   casos infractores que el flujo programado habría publicado: ` +
              `${divergentes.filter(d => d.clase === "INFRACTOR" && d.bI && !d.bP).length}`);
  for (const d of divergentes.filter(x => x.clase === "INFRACTOR" && x.bI && !x.bP))
    console.log(`     ${d.id}  "${d.texto}"`);
  console.log("");
}

writeFileSync(new URL("./Divergencia_HU10_resultados.csv", import.meta.url),
  salida.map(r => r.map(v => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(",")).join("\n"), "utf-8");
console.log("✔ Detalle caso por caso en Divergencia_HU10_resultados.csv\n");
