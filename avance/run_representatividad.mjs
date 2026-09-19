// Contraste de representatividad — ¿escribe la realidad como el conjunto «representativo»?
//
// POR QUÉ EXISTE
// El §5.1 toma la configuración representativa como medida principal y afirma que «refleja
// la forma habitual en que las consultoras redactan sus publicaciones». Esa afirmación es
// anterior a cualquier observación de redacción real: los dos conjuntos los diseñó el
// equipo. Los 29 textos verbatim del estudio de campo llegaron después y permiten
// contrastarla. Este script hace ese contraste.
//
// CÓMO
// Clasifica cada caso INFRACTOR de texto por la FORMA en que expresa el precio o la
// promoción, con una taxonomía léxica explícita y ordenada por especificidad. La
// clasificación es independiente del detector: describe cómo está escrito el caso, no si el
// sistema lo bloquea. Un caso que ninguna de las cinco formas explícitas captura queda como
// «forma indirecta», que es la categoría que el conjunto de valores límite explora.
//
// Uso:  node run_representatividad.mjs
// Lee:  Casos_Compliance_Representativo.csv, Casos_Compliance.csv,
//       Casos_Compliance_Limite.csv, Compliance_Campo.csv
// Escribe: Representatividad_resultados.csv (una fila por caso, con su forma)

import { readFileSync, writeFileSync } from "node:fs";

function parseCSV(text) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) { const c = text[i];
    if (q) { if (c === '"' && text[i+1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\r") {}
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else f += c; }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows;
}
function leer(archivo) {
  const rows = parseCSV(readFileSync(new URL("./" + archivo, import.meta.url), "utf-8"));
  const H = rows[0].map(h => h.trim());
  return rows.slice(1).filter(r => r.some(c => c !== ""))
             .map(r => Object.fromEntries(H.map((h, i) => [h, r[i] ?? ""])));
}

// ─── Taxonomía de formas de precio ───────────────────────────────────────────
// Ordenada de la más explícita a la menos: a cada caso se le asigna la PRIMERA que
// coincide, de modo que «vale $2900» cuenta como símbolo y no como palabra de precio.
// No son los patrones del detector: son una descripción de la superficie del texto.
const FORMAS = [
  ["símbolo de moneda + cifra",      /(\$|u\$s|us\$|ar\$|€|£)\s*\d/i],
  ["cifra + palabra de moneda",      /\d[\d.,]*\s*(pesos?|ars|usd|d[oó]lares?|euros?)\b/i],
  ["palabra de precio + cifra",      /\b(precios?|cuesta|vale|sale|abon[aá]s?|pagos?|cuotas?)\b[^.\n]{0,20}\d/i],
  ["descuento porcentual",           /\d+\s*%/],
  ["vocabulario comercial sin cifra", /\b(ofertas?|promos?|promoci[oó]n(?:es)?|descuentos?|rebajas?|gratis|2x1|3x2|sin\s+inter[eé]s|mitad\s+de\s+precio|lista\s+de\s+precios)\b/i],
];
const INDIRECTA = "forma indirecta (ninguna marca léxica explícita)";

function clasificar(texto) {
  for (const [nombre, patron] of FORMAS) if (patron.test(texto)) return nombre;
  return INDIRECTA;
}

// ─── Corpus ──────────────────────────────────────────────────────────────────
// Sólo casos INFRACTORES de texto: en los LIMPIOS no hay forma de precio que clasificar,
// y los de imagen no llevan el precio en el texto sino en la pieza.
const CORPUS = [
  ["representativo (§5.1, medida principal)", "Casos_Compliance_Representativo.csv"],
  ["estrés",                                  "Casos_Compliance.csv"],
  ["valores límite",                          "Casos_Compliance_Limite.csv"],
  ["campo real (verbatim de consultoras)",    "Compliance_Campo.csv"],
];

const salida = [["Conjunto", "ID", "Forma", "Contenido"]];
const dist = new Map();

for (const [etiqueta, archivo] of CORPUS) {
  const filas = leer(archivo);
  const esCampo = archivo === "Compliance_Campo.csv";
  const casos = filas
    .filter(r => (esCampo ? r.Ground_truth : r.Clase_real) === "INFRACTOR")
    .filter(r => r.Canal === "Texto")
    .map(r => ({ id: r.ID, texto: esCampo ? r.Contenido_real : r.Contenido_entrada }));
  const cuenta = new Map();
  for (const c of casos) {
    const forma = clasificar(c.texto);
    cuenta.set(forma, (cuenta.get(forma) ?? 0) + 1);
    salida.push([etiqueta, c.id, forma, c.texto.replace(/\s+/g, " ").slice(0, 120)]);
  }
  dist.set(etiqueta, { n: casos.length, cuenta });
}

// ─── Informe ─────────────────────────────────────────────────────────────────
const ORDEN = [...FORMAS.map(f => f[0]), INDIRECTA];
const etiquetas = [...dist.keys()];
const anchoF = Math.max(...ORDEN.map(f => f.length));

console.log("\n════ REPRESENTATIVIDAD — forma de expresión del precio en los casos infractores de texto ════\n");
console.log("  " + "forma".padEnd(anchoF) + etiquetas.map(e => ("  " + e.split(" ")[0]).padStart(14)).join(""));
for (const forma of ORDEN) {
  const celdas = etiquetas.map(e => {
    const { n, cuenta } = dist.get(e);
    const k = cuenta.get(forma) ?? 0;
    return `${k}/${n} (${(100 * k / n).toFixed(0)}%)`.padStart(14);
  });
  console.log("  " + forma.padEnd(anchoF) + celdas.join(""));
}

// Lo que el §5.1 afirma de la configuración representativa es una proporción: «mayoría de
// casos directos y una minoría de casos límite». La forma indirecta es la operacionalización
// de «caso límite» sobre la superficie del texto, de modo que la afirmación es contrastable.
console.log("\n  ── Directas (las cinco formas explícitas) contra indirectas");
for (const e of etiquetas) {
  const { n, cuenta } = dist.get(e);
  const ind = cuenta.get(INDIRECTA) ?? 0;
  console.log(`   ${e.padEnd(42)} n = ${String(n).padStart(2)} · directas ${n - ind} (${(100 * (n - ind) / n).toFixed(0)} %) · indirectas ${ind} (${(100 * ind / n).toFixed(0)} %)`);
}

const rep = dist.get(etiquetas[0]), campo = dist.get(etiquetas[3]);
const indRep = rep.cuenta.get(INDIRECTA) ?? 0, indCampo = campo.cuenta.get(INDIRECTA) ?? 0;
console.log("");
console.log(`  El conjunto representativo lleva ${indRep} de ${rep.n} casos infractores en forma indirecta`);
console.log(`  (${(100 * indRep / rep.n).toFixed(0)} %) y el corpus real, ${indCampo} de ${campo.n} (${(100 * indCampo / campo.n).toFixed(0)} %).`);
console.log(indRep / rep.n > indCampo / campo.n
  // No se imprime «cota inferior»: un caso indirecto sobre dieciocho indica la dirección de
  // la diferencia y no autoriza a tratar estas métricas como un piso de las reales. La
  // brecha de F1 contra el campo sale sobre todo de los falsos positivos (M15 del octavo
  // dictamen), que esta taxonomía no clasifica porque sólo ordena los positivos.
  ? "  El conjunto diseñado es MÁS adverso que la redacción real en esta forma: la\n" +
    "  representatividad es conservadora y no equivalente. Indica la dirección de la\n" +
    "  diferencia; no convierte estas métricas en una cota inferior de las reales."
  : "  El conjunto diseñado NO es más adverso que la redacción real.");

writeFileSync(new URL("./Representatividad_resultados.csv", import.meta.url),
  salida.map(r => r.map(v => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v).join(",")).join("\n") + "\n",
  "utf-8");
console.log("\n✔ Clasificación caso por caso en Representatividad_resultados.csv\n");
