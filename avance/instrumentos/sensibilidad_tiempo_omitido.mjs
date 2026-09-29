// Sensibilidad de la reducción al tiempo que el motor no registra (dictamen 14, N-01).
//
// El tiempo de Postly que se analiza es el mayor entre el cronómetro y el intervalo que el
// motor registró entre la llegada de la foto y el fin de la publicación (run_cronometraje_v2.mjs).
// Ese valor es una cota inferior del tiempo real: no incluye lo que la usuaria tarda antes de que
// el motor vea la foto. Este script estima cuánto es y cuánto mueve el contraste contra el 70 %.
//
// Estimación: en las publicaciones donde el cronómetro superó al motor, la diferencia entre ambos
// es el tiempo que el motor no ve. Se toma su mediana y su media como valores de referencia, y
// se recalcula el tiempo de Postly como max(cronómetro, motor + delta) para una grilla de delta.
// Se informa también el delta a partir del cual el contraste unilateral deja de ser significativo
// (alfa = 0,05) y el delta a partir del cual la estimación puntual deja de superar el 70 %.
//
// Misma unidad de análisis que el contraste principal: la media por participante, sobre el tramo
// comparable (se descuenta la adaptación del lado manual).
//
// Uso:  node sensibilidad_tiempo_omitido.mjs [Cronometraje_datos_v2.csv]

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const F_DATOS = process.argv[2] || join(AQUI, "Cronometraje_datos_v2.csv");
const UMBRAL = 70;

// ─── Estadística (idéntica a run_cronometraje_v2.mjs) ────────────────────────
const media = a => a.reduce((s, x) => s + x, 0) / a.length;
const de = a => a.length < 2 ? 0
  : Math.sqrt(a.reduce((s, x) => s + (x - media(a)) ** 2, 0) / (a.length - 1));

// Beta incompleta regularizada por fracción continua (Lentz). Da el valor p de la t para
// cualquier grado de libertad, que es lo que el script del piloto no podía hacer.
function lnGamma(z) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let x = z, y = z, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += g[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}
function betacf(a, b, x) {
  const EPS = 3e-14, FPMIN = 1e-300;
  let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
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
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
}
const pDosColas = (t, df) => betai(df / 2, 0.5, df / (df + t * t));
const pUnaCola = (t, df) => t > 0 ? pDosColas(t, df) / 2 : 1 - pDosColas(t, df) / 2;
// t crítico por bisección sobre la cola de dos colas
function tCritico(df, alfa = 0.05) {
  let lo = 0, hi = 100;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2;
    pDosColas(m, df) > alfa ? lo = m : hi = m;
  }
  return (lo + hi) / 2;
}
function tUnaMuestra(valores, mu0) {
  const n = valores.length, m = media(valores), s = de(valores);
  const t = s === 0 ? NaN : (m - mu0) / (s / Math.sqrt(n));
  return { n, media: m, de: s, t, df: n - 1, ee: s / Math.sqrt(n) };
}

// ─── CSV ─────────────────────────────────────────────────────────────────────
function leerCSV(ruta) {
  if (!existsSync(ruta)) return null;
  const lineas = readFileSync(ruta, "utf-8").split(/\r?\n/).filter(l => l.trim());
  const enc = lineas[0].split(",").map(s => s.trim());
  return lineas.slice(1).map(l => {
    const celdas = []; let campo = "", q = false;
    for (const c of l) {
      if (c === '"') q = !q;
      else if (c === "," && !q) { celdas.push(campo); campo = ""; }
      else campo += c;
    }
    celdas.push(campo);
    return Object.fromEntries(enc.map((h, i) => [h, (celdas[i] ?? "").trim()]));
  });
}
const aMin = s => {
  if (!s) return null;
  if (s.includes(":")) { const [m, x] = s.split(":").map(Number); return m + (x || 0) / 60; }
  const v = Number(s); return Number.isFinite(v) ? v : null;
};
const f1 = x => (Math.round(x * 10) / 10).toFixed(1).replace(".", ",");
const f2 = x => (Math.round(x * 100) / 100).toFixed(2).replace(".", ",");
const f3 = x => x.toFixed(3).replace(".", ",");
const mediana = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const seg = s => aMin(s) * 60;
const filas = leerCSV(F_DATOS);
if (!filas) { console.error(`No se encontró ${F_DATOS}`); process.exit(1); }
const pares = filas.filter(f => aMin(f.Manual_mmss) != null && aMin(f.Postly_mmss) != null && aMin(f.Sistema_mmss) != null).map(f => ({
  part: f.Participante,
  manualComp: seg(f.Manual_mmss) - seg(f.Adaptacion_mmss),
  crono: seg(f.Postly_mmss),
  motor: seg(f.Sistema_mmss),
}));

// Reducción media por participante, sobre el tramo comparable, con tiempo Postly = max(crono, motor + delta)
function contraste(delta) {
  const por = new Map();
  for (const p of pares) {
    const post = Math.max(p.crono, p.motor + delta);
    const r = (p.manualComp - post) / p.manualComp * 100;
    por.set(p.part, [...(por.get(p.part) ?? []), r]);
  }
  const a = tUnaMuestra([...por.values()].map(media), UMBRAL);
  return { ...a, p: pUnaCola(a.t, a.df) };
}

const dif = pares.filter(p => p.crono > p.motor).map(p => p.crono - p.motor);
const parts = new Set(pares.filter(p => p.crono > p.motor).map(p => p.part));
console.log(`\n════ SENSIBILIDAD AL TIEMPO NO REGISTRADO POR EL MOTOR ════`);
console.log(`  ${pares.length} pares · el cronómetro superó al motor en ${dif.length} (${parts.size} participantes)`);
console.log(`  diferencia cronómetro − motor en esos ${dif.length} pares: mín. ${f1(Math.min(...dif))} s · ` +
  `mediana ${f1(mediana(dif))} s · media ${f1(media(dif))} s · máx. ${f1(Math.max(...dif))} s`);

console.log(`\n── reducción sobre el tramo comparable, frente al ${UMBRAL} % (unilateral)`);
console.log(`  ${"delta".padEnd(10)}${"reducción".padEnd(12)}${"t(7)".padEnd(9)}p`);
for (const d of [0, 10, 17, 20, 28, 30, 40]) {
  const r = contraste(d);
  console.log(`  ${(d + " s").padEnd(10)}${(f1(r.media) + " %").padEnd(12)}${f2(r.t).padEnd(9)}${f3(r.p)}`);
}

function biseccion(cumple) {
  let lo = 0, hi = 600;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; cumple(m) ? lo = m : hi = m; }
  return (lo + hi) / 2;
}
console.log(`\n  el contraste deja de ser significativo (alfa = 0,05) con delta ≈ ` +
  `${f1(biseccion(d => contraste(d).p < 0.05))} s`);
console.log(`  la estimación puntual deja de superar el ${UMBRAL} % con delta ≈ ` +
  `${f1(biseccion(d => contraste(d).media > UMBRAL))} s`);

const sub = pares.filter(p => p.crono > p.motor)
  .map(p => (p.manualComp - p.crono) / p.manualComp * 100);
console.log(`\n── los ${sub.length} pares en que el cronómetro cubrió todo el tramo (subconjunto, no contraste)`);
console.log(`  reducción media ${f1(media(sub))} % · mínimo ${f1(Math.min(...sub))} % · máximo ${f1(Math.max(...sub))} %`);

// ─── Medidas no paramétricas (Kitchenham y Madeyski, 2024; dictamen 14, N-22) ─
// Prueba de rangos con signo de Wilcoxon, exacta y unilateral, sobre las reducciones por participante
// frente al umbral (se enumeran los 2^n signos posibles; n = 8).
function wilcoxonExacto(difs) {
  const d = difs.filter(x => x !== 0), n = d.length;
  const orden = d.map((x, i) => [Math.abs(x), i]).sort((a, b) => a[0] - b[0]);
  const rango = new Array(n);
  for (let i = 0; i < n;) {
    let j = i; while (j < n && orden[j][0] === orden[i][0]) j++;
    for (let k = i; k < j; k++) rango[orden[k][1]] = (i + j + 1) / 2;
    i = j;
  }
  const obs = d.reduce((s, x, i) => s + (x > 0 ? rango[i] : 0), 0);
  let iguales = 0;
  for (let m = 0; m < 2 ** n; m++) {
    let w = 0; for (let i = 0; i < n; i++) if (m >> i & 1) w += rango[i];
    if (w >= obs - 1e-9) iguales++;
  }
  return iguales / 2 ** n;
}
function porParticipante(delta) {
  const por = new Map();
  for (const p of pares) {
    const r = (p.manualComp - Math.max(p.crono, p.motor + delta)) / p.manualComp * 100;
    por.set(p.part, [...(por.get(p.part) ?? []), r]);
  }
  return [...por.values()].map(media);
}
const rapidos = pares.filter(p => Math.max(p.crono, p.motor) < p.manualComp).length;
console.log(`
── medidas no paramétricas`);
console.log(`  probabilidad de superioridad pareada (Postly más rápido que el manual): ` +
  `${rapidos}/${pares.length} pares = ${f2(rapidos / pares.length)}`);
for (const d of [0, 17, 28]) {
  const r = porParticipante(d);
  console.log(`  Wilcoxon (exacta, unilateral) sobre las ${r.length} reducciones frente al ${UMBRAL} %, ` +
    `delta = ${d} s: ${r.filter(x => x > UMBRAL).length}/${r.length} por encima · p = ${f3(wilcoxonExacto(r.map(x => x - UMBRAL)))}`);
}
