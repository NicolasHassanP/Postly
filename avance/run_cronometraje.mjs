// Análisis del cronometraje (hipótesis del 70%, §4.2 / variable a §3.5.4).
// Lee Cronometraje_datos.csv (o el archivo pasado como arg), calcula la reducción
// de tiempo por publicación, agrega por participante y global, y contrasta el 70%.
//
// Uso:  node run_cronometraje.mjs [archivo.csv]
// Formato de tiempos: "mm:ss" (ej. 18:30) o minutos decimales (ej. 18.5).

import { readFileSync } from "node:fs";

const inputName = process.argv[2] || "Cronometraje_datos.csv";
const raw = readFileSync(new URL("./" + inputName, import.meta.url), "utf-8");

// --- CSV parse mínimo ---
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
// mm:ss o minutos decimales -> minutos
function toMin(s) {
  s = (s || "").trim(); if (!s) return null;
  if (s.includes(":")) { const [m, sec] = s.split(":").map(Number); return m + (sec || 0) / 60; }
  return Number(s.replace(",", "."));
}
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const sd = a => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const f1 = x => x.toFixed(1);

const rows = parseCSV(raw);
const H = Object.fromEntries(rows[0].map((h, i) => [h.trim(), i]));

const pairs = [];
for (let r = 1; r < rows.length; r++) {
  const row = rows[r]; if (!row[H.Participante]) continue;
  const M = toMin(row[H.Manual_mmss]); const P = toMin(row[H.Postly_mmss]);
  if (M == null || P == null) continue;
  pairs.push({ part: row[H.Participante], M, P, red: (M - P) / M * 100 });
}

if (pairs.length === 0) {
  console.log("\n(Planilla vacía — cargá los tiempos Manual_mmss y Postly_mmss y volvé a correr.)\n");
  process.exit(0);
}

const M = pairs.map(p => p.M), P = pairs.map(p => p.P), R = pairs.map(p => p.red);
const diff = pairs.map(p => p.M - p.P);

console.log(`\n════════ CRONOMETRAJE — Reducción de tiempo operativo (n = ${pairs.length} publicaciones) ════════\n`);
console.log(`  Tiempo MANUAL   : media ${f1(mean(M))} min  (DE ${f1(sd(M))})  [rango ${f1(Math.min(...M))}–${f1(Math.max(...M))}]`);
console.log(`  Tiempo POSTLY   : media ${f1(mean(P))} min  (DE ${f1(sd(P))})  [rango ${f1(Math.min(...P))}–${f1(Math.max(...P))}]`);
console.log(`  REDUCCIÓN       : media ${f1(mean(R))} %    (DE ${f1(sd(R))})  [rango ${f1(Math.min(...R))}–${f1(Math.max(...R))} %]`);
console.log(`  Ahorro medio    : ${f1(mean(diff))} min por publicación`);

console.log("\n  Por participante:");
for (const part of [...new Set(pairs.map(p => p.part))]) {
  const g = pairs.filter(p => p.part === part);
  console.log(`   ${part}: manual ${f1(mean(g.map(x=>x.M)))} min → Postly ${f1(mean(g.map(x=>x.P)))} min  (reducción ${f1(mean(g.map(x=>x.red)))} %, n=${g.length})`);
}

// --- Contraste de la hipótesis del 70% ---
const redMean = mean(R);
console.log("\n──────────────────────────────────────────────────────────────");
console.log(`  HIPÓTESIS (§4.2): reducción del tiempo operativo > 70 %`);
console.log(`  Reducción media observada: ${f1(redMean)} %`);
console.log(`  Veredicto: ${redMean >= 70 ? "SE CONFIRMA (≥ 70 %)" : "NO se alcanza el 70 % (reducción sustancial, por debajo del umbral)"}`);

// --- Prueba t pareada (Manual vs Postly) ---
const dMean = mean(diff), dSd = sd(diff), n = diff.length;
if (n >= 2 && dSd > 0) {
  const t = dMean / (dSd / Math.sqrt(n)); const df = n - 1;
  // valores críticos t (dos colas, α=0,05)
  const crit = {1:12.71,2:4.30,3:3.18,4:2.78,5:2.57,6:2.45,7:2.36,8:2.31,9:2.26,10:2.23,
    11:2.20,12:2.18,13:2.16,14:2.14,15:2.13,16:2.12,17:2.11,18:2.10,19:2.09,20:2.09,
    21:2.08,22:2.07,24:2.06,26:2.06,28:2.05,30:2.04};
  const tc = crit[df] || 2.04;
  console.log("\n  Prueba t de Student pareada (Manual − Postly):");
  console.log(`   t(${df}) = ${t.toFixed(2)}  ·  t crítico (α=0,05, dos colas) = ${tc}`);
  console.log(`   ${Math.abs(t) > tc ? "Diferencia estadísticamente significativa (p < 0,05)." : "Diferencia NO significativa a α=0,05 (n pequeño)."}`);
}

// --- Prueba t sobre las medias por participante (unidad independiente) ---
// Los pares estan anidados en participantes: doce observaciones sobre tres sujetos no
// son doce observaciones independientes. El §5.1 reporta este estadistico como principal.
const porSujeto = [...new Set(pairs.map(p => p.part))].map(part => {
  const g = pairs.filter(p => p.part === part);
  return mean(g.map(x => x.M)) - mean(g.map(x => x.P));
});
if (porSujeto.length >= 2) {
  const dm = mean(porSujeto), ds = sd(porSujeto), k = porSujeto.length;
  const t2 = dm / (ds / Math.sqrt(k)), df2 = k - 1;
  // p de dos colas, forma cerrada para df = 2:  P(|T| > t) = 1 - t/sqrt(2 + t^2)
  const p2 = df2 === 2 ? 1 - Math.abs(t2) / Math.sqrt(2 + t2 * t2) : null;
  console.log("\n  Prueba t pareada sobre las medias por participante (no independencia):");
  console.log(`   n = ${k} sujetos  ·  t(${df2}) = ${t2.toFixed(2)}` +
              (p2 !== null ? `  ·  p = ${p2.toFixed(3)}` : ""));
  console.log(`   diferencias por sujeto (min): ${porSujeto.map(x => x.toFixed(2)).join(", ")}`);
}
console.log("");
