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
// El valor puntual no confirma la hipótesis: el contraste unilateral del margen sobre las
// medias por consultora da p = 0,230 y los dos intervalos del 95 % contienen el 70 %. El
// veredicto que se imprime es el que el §5.1 y el §6.1 declaran.
console.log(`  Veredicto: ${redMean >= 70
  ? "COMPATIBLE, NO CONFIRMADA (el valor puntual supera el 70 %; ver el contraste del umbral más abajo)"
  : "NO se alcanza el 70 % (reducción sustancial, por debajo del umbral)"}`);

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

// ─── Contraste del UMBRAL, que es lo que la hipotesis del §4.2 afirma ────────
// Las dos pruebas anteriores contrastan H0: "reduccion = 0", es decir que Postly no
// reduce el tiempo. Eso NO es la hipotesis del trabajo, que postula una reduccion
// > 70 %. El contraste que le corresponde es H0: "reduccion = 70 %", unilateral, y da
// un resultado muy distinto: con tres unidades independientes el margen por encima del
// umbral no se distingue de cero. El §5.1 reporta las dos cosas por separado.
function gammln(x) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
             -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, tmp = x + 5.5, ser = 1.000000000190015;
  tmp -= (x + 0.5) * Math.log(tmp);
  for (let j = 0; j < 6; j++) ser += c[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}
function betacf(a, b, x) {
  const EPS = 3e-16, FPMIN = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
function betai(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(gammln(a + b) - gammln(a) - gammln(b) +
                      a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a
                                   : 1 - bt * betacf(b, a, 1 - x) / b;
}
// p unilateral de la t de Student
const pUni = (t, df) => betai(df / 2, 0.5, df / (df + t * t)) / 2;

// autocomprobacion: para df = 2 hay forma cerrada, P(|T| > t) = 1 - t/sqrt(2+t^2)
const cerrada = (t) => (1 - Math.abs(t) / Math.sqrt(2 + t * t)) / 2;
if (Math.abs(pUni(9.15, 2) - cerrada(9.15)) > 1e-9) {
  console.error("  *** betai no coincide con la forma cerrada para df = 2");
  process.exit(1);
}

const UMBRAL = 70;
console.log("");
console.log("  Contraste del umbral del 70 % (H0: reducción = 70 %, unilateral):");
for (const [etq, vals] of [
  ["medias por consultora", [...new Set(pairs.map(p => p.part))].map(part => {
    const g = pairs.filter(p => p.part === part);
    return mean(g.map(x => 100 * (x.M - x.P) / x.M));
  })],
  ["los doce pares", pairs.map(x => 100 * (x.M - x.P) / x.M)],
]) {
  const m = mean(vals), s = sd(vals), k = vals.length, df = k - 1;
  const t = (m - UMBRAL) / (s / Math.sqrt(k));
  console.log(`   ${etq.padEnd(22)} n = ${String(k).padStart(2)}  ·  t(${df}) = ${t.toFixed(2)}` +
              `  ·  p unilateral = ${pUni(t, df).toFixed(3)}` +
              `  ·  ${pUni(t, df) < 0.05 ? "significativo" : "NO significativo a 0,05"}`);
}
console.log("   El punto estimado supera el umbral; el margen por encima de él no está");
console.log("   respaldado por el contraste. Las dos proposiciones se reportan aparte (§5.1).");

// ─── Precisión de la estimación y tamaño del efecto ──────────────────────────
// APA 7 pide el tamaño del efecto junto al contraste, y un punto estimado sin intervalo
// no dice cuánta incertidumbre arrastra. El d de Cohen que corresponde a un diseño
// pareado es d_z = media de las diferencias / DE de las diferencias: se calcula sobre la
// misma serie que la prueba t, y no sobre la DE agrupada de dos muestras independientes,
// que este diseño no tiene.

// cuantil t por bisección sobre pUni, que ya está verificada contra la forma cerrada
function tQuantil(p, df) {           // p = cola superior (p.ej. 0,025 para IC del 95 %)
  let lo = 0, hi = 1000;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (pUni(mid, df) > p) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
// autocomprobación: t(2) de dos colas al 5 % = 4,3027; t(11) = 2,2010
for (const [df, esperado] of [[2, 4.30265], [11, 2.20099]]) {
  if (Math.abs(tQuantil(0.025, df) - esperado) > 1e-3) {
    console.error(`  *** tQuantil(0,025, ${df}) = ${tQuantil(0.025, df)} y debería ser ${esperado}`);
    process.exit(1);
  }
}

const redPorSujeto = [...new Set(pairs.map(p => p.part))].map(part => {
  const g = pairs.filter(p => p.part === part);
  return mean(g.map(x => 100 * (x.M - x.P) / x.M));
});
const difPorSujeto = porSujeto;

console.log("");
console.log("  Precisión de la estimación (IC del 95 %) y tamaño del efecto:");
for (const [etq, red_, dif_] of [
  ["medias por consultora", redPorSujeto, difPorSujeto],
  ["los doce pares", R, diff],
]) {
  const k = red_.length, df = k - 1, tc = tQuantil(0.025, df);
  const mR = mean(red_), hR = tc * sd(red_) / Math.sqrt(k);
  const mD = mean(dif_), hD = tc * sd(dif_) / Math.sqrt(k);
  const dz = mD / sd(dif_);
  console.log(`   ${etq} (n = ${k}, gl = ${df}, t crítico = ${tc.toFixed(3)}):`);
  console.log(`     reducción media  ${mR.toFixed(1)} %   IC 95 % [${(mR - hR).toFixed(1)}; ${(mR + hR).toFixed(1)}]` +
              `  ${(mR - hR) > UMBRAL ? "— el intervalo excluye el umbral del 70 %" : "— el intervalo CONTIENE el umbral del 70 %"}`);
  console.log(`     ahorro medio     ${mD.toFixed(1)} min IC 95 % [${(mD - hD).toFixed(1)}; ${(mD + hD).toFixed(1)}]`);
  console.log(`     d de Cohen (d_z) ${dz.toFixed(2)}`);
}
console.log("");
