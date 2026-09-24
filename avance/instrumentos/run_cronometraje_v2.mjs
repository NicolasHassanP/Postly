// Análisis del cronometraje ampliado — el que corre cuando lleguen las 24 participantes
//
// Reemplaza a run_cronometraje.mjs, que estaba escrito para tres consultoras y doce pares
// con forma cerrada del valor p para dos grados de libertad. Éste sirve para cualquier n y
// agrega lo que el protocolo de la ampliación exige informar:
//
//   · la reducción sobre el TRAMO COMPARABLE (producción y publicación), que es el que las
//     dos condiciones comparten, además de la reducción sobre el total. El piloto no pudo
//     separarlos porque no registró la adaptación (§6.1 de la tesis, análisis de
//     sensibilidad); acá es una columna;
//   · el contraste que le corresponde a la hipótesis —H0: reducción = 70 %, unilateral— y no
//     sólo el de reducción nula;
//   · el efecto de orden entre las secuencias MP y PM;
//   · el efecto de aprendizaje entre la primera publicación y la última;
//   · la reducción por estrato de relación previa con el equipo, si el archivo de
//     reclutamiento está presente.
//
// La unidad de análisis es la participante, nunca la publicación: cuatro publicaciones de
// una misma persona no son cuatro observaciones independientes.
//
// Uso:  node run_cronometraje_v2.mjs [Cronometraje_datos_v2.csv] [Reclutamiento_v2.csv]

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const F_DATOS = process.argv[2] || join(AQUI, "Cronometraje_datos_v2.csv");
const F_RECL = process.argv[3] || join(AQUI, "Reclutamiento_v2.csv");
const UMBRAL = 70;

// ─── Estadística ─────────────────────────────────────────────────────────────
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
const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
const f2 = x => (Math.round(x * 100) / 100).toFixed(2);
const fmtP = p => p < 0.001 ? "< 0,001" : "= " + p.toFixed(3).replace(".", ",");

// ─── Datos ───────────────────────────────────────────────────────────────────
const filas = leerCSV(F_DATOS);
if (!filas) { console.error(`No se encontró ${F_DATOS}`); process.exit(1); }
const pares = [];
for (const f of filas) {
  const manual = aMin(f.Manual_mmss), postly = aMin(f.Postly_mmss);
  const adapt = aMin(f.Adaptacion_mmss) ?? 0;
  if (manual == null || postly == null) continue;
  pares.push({
    part: f.Participante, sec: (f.Secuencia || "").toUpperCase(), tipo: f.Tipo || "",
    orden: Number(f.Orden_en_sesion) || 0, adapt, manual, postly,
    // tramo comparable: la adaptación sale del lado manual porque Postly no la ejecuta
    manualComp: manual - adapt,
    redTotal: (manual - postly) / manual * 100,
    redComp: (manual - adapt - postly) / (manual - adapt) * 100,
  });
}
if (!pares.length) {
  console.log(`\n  La planilla ${F_DATOS.split(/[\\/]/).pop()} está vacía.`);
  console.log("  El análisis corre solo: cargá un renglón por publicación y volvé a ejecutarlo.\n");
  console.log("  Columnas: Participante, Secuencia (MP|PM), Publicacion, Tipo (imagen|carrusel),");
  console.log("            Producto, Orden_en_sesion, Adaptacion_mmss, Manual_mmss, Postly_mmss\n");
  process.exit(0);
}

const participantes = [...new Set(pares.map(p => p.part))];
const porPart = participantes.map(p => {
  const s = pares.filter(x => x.part === p);
  return {
    part: p, n: s.length, sec: s[0].sec,
    manual: media(s.map(x => x.manual)), postly: media(s.map(x => x.postly)),
    adapt: media(s.map(x => x.adapt)),
    redTotal: media(s.map(x => x.redTotal)), redComp: media(s.map(x => x.redComp)),
  };
});

console.log(`\n════ CRONOMETRAJE AMPLIADO ════`);
console.log(`  ${participantes.length} participantes · ${pares.length} pares · ` +
  `${pares.filter(p => p.tipo.toLowerCase() === "carrusel").length} de carrusel`);

console.log(`\n── por participante`);
console.log(`  ${"ID".padEnd(6)}${"n".padEnd(4)}${"sec".padEnd(6)}${"manual".padEnd(9)}` +
  `${"adapt.".padEnd(9)}${"Postly".padEnd(9)}${"red.total".padEnd(11)}red.comparable`);
for (const p of porPart) {
  console.log(`  ${p.part.padEnd(6)}${String(p.n).padEnd(4)}${(p.sec || "—").padEnd(6)}` +
    `${(f1(p.manual) + " min").padEnd(9)}${(f1(p.adapt) + " min").padEnd(9)}` +
    `${(f1(p.postly) + " min").padEnd(9)}${(f1(p.redTotal) + " %").padEnd(11)}${f1(p.redComp)} %`);
}

// ─── Contraste principal: H0 reducción = 70 %, unilateral, tramo comparable ──
const redComp = porPart.map(p => p.redComp);
const redTotal = porPart.map(p => p.redTotal);
const a = tUnaMuestra(redComp, UMBRAL);
const tc = tCritico(a.df);
console.log(`\n── contraste principal · tramo comparable · H0: reducción = ${UMBRAL} % (unilateral)`);
console.log(`  reducción media ${f1(a.media)} % (DE ${f1(a.de)}) · n = ${a.n} participantes`);
console.log(`  IC 95 % [${f1(a.media - tc * a.ee)} % ; ${f1(a.media + tc * a.ee)} %]`);
if (Number.isFinite(a.t)) {
  const p = pUnaCola(a.t, a.df);
  console.log(`  t(${a.df}) = ${f2(a.t)} · p ${fmtP(p)}` +
    ` · ${p < 0.05 ? "SUPERA el umbral de forma significativa" : "el margen sobre el umbral NO es distinguible"}`);
  console.log(`  d de Cohen (pareada, frente al umbral) = ${f2((a.media - UMBRAL) / a.de)}`);
}

// ─── Contraste secundario: t pareada sobre los tiempos ───────────────────────
// Es el estadístico que la tesis reporta —t(2) = 9,15 en el piloto— y contrasta que
// Postly reduzca el tiempo, sin decir cuánto. Se calcula sobre las medias por
// participante, que son las unidades independientes, y sobre el tramo comparable.
const difTiempos = porPart.map(p => p.manual - p.adapt - p.postly);
const b = tUnaMuestra(difTiempos, 0);
if (Number.isFinite(b.t)) {
  console.log(`\n── contraste secundario · t pareada sobre los tiempos · H0: no hay diferencia`);
  console.log(`  ahorro medio ${f1(b.media)} min por publicación (DE ${f1(b.de)})`);
  console.log(`  t(${b.df}) = ${f2(b.t)} · p ${fmtP(pDosColas(b.t, b.df))}` +
    ` · d de Cohen pareada = ${f2(b.media / b.de)}`);
}

console.log(`\n── la misma cuenta sobre el tiempo TOTAL (incluye la adaptación, que Postly no hace)`);
const c = tUnaMuestra(redTotal, UMBRAL);
console.log(`  reducción media ${f1(c.media)} %` +
  (Number.isFinite(c.t) ? ` · t(${c.df}) = ${f2(c.t)} frente al ${UMBRAL} %` : ""));
console.log(`  La diferencia entre ${f1(a.media)} % y ${f1(c.media)} % es la subtarea de adaptación:` +
  ` ${f1(media(porPart.map(p => p.adapt)))} min de media.`);

// ─── Efecto de orden ─────────────────────────────────────────────────────────
const mp = porPart.filter(p => p.sec === "MP").map(p => p.redComp);
const pm = porPart.filter(p => p.sec === "PM").map(p => p.redComp);
console.log(`\n── efecto de orden (secuencias contrabalanceadas)`);
if (mp.length >= 2 && pm.length >= 2) {
  const s2 = (x) => de(x) ** 2 / x.length;
  const t = (media(mp) - media(pm)) / Math.sqrt(s2(mp) + s2(pm));
  const df = (s2(mp) + s2(pm)) ** 2 /
    (s2(mp) ** 2 / (mp.length - 1) + s2(pm) ** 2 / (pm.length - 1));
  const p = pDosColas(t, df);
  console.log(`  MP ${f1(media(mp))} % (n=${mp.length}) · PM ${f1(media(pm))} % (n=${pm.length})`);
  console.log(`  t de Welch = ${f2(t)} · gl ≈ ${f1(df)} · p ${fmtP(p)}` +
    ` · ${p < 0.05 ? "HAY efecto de orden: informarlo" : "sin efecto de orden detectable"}`);
} else {
  console.log(`  insuficientes participantes por secuencia (MP ${mp.length}, PM ${pm.length})`);
}

// ─── Efecto de aprendizaje ───────────────────────────────────────────────────
console.log(`\n── efecto de aprendizaje (primera publicación contra la última, con Postly)`);
const dif = [];
for (const p of participantes) {
  const s = pares.filter(x => x.part === p && x.orden).sort((x, y) => x.orden - y.orden);
  if (s.length >= 2) dif.push(s[0].postly - s[s.length - 1].postly);
}
if (dif.length >= 2) {
  const d = tUnaMuestra(dif, 0);
  const p = pDosColas(d.t, d.df);
  console.log(`  la última tardó ${f1(d.media)} min menos que la primera (n = ${d.n})`);
  console.log(`  t(${d.df}) = ${f2(d.t)} · p ${fmtP(p)}` +
    ` · ${p < 0.05 ? "HAY aprendizaje dentro de la sesión: informarlo" : "sin aprendizaje detectable"}`);
} else {
  console.log(`  hace falta la columna Orden_en_sesion poblada en al menos dos participantes`);
}

// ─── Estratos de relación previa ─────────────────────────────────────────────
const recl = leerCSV(F_RECL);
if (recl && recl.length) {
  console.log(`\n── reducción por relación previa con el equipo`);
  const rel = Object.fromEntries(recl.map(r => [r.Participante, r.Relacion_previa || "sin dato"]));
  const grupos = {};
  for (const p of porPart) (grupos[rel[p.part] || "sin dato"] ??= []).push(p.redComp);
  for (const [g, v] of Object.entries(grupos)) {
    console.log(`  ${g.padEnd(12)} n = ${String(v.length).padEnd(4)} reducción media ${f1(media(v))} %`);
  }
  console.log(`  Si los estratos difieren, va informado: es la amenaza que el §3.5.5 declara.`);
}

// ─── Potencia alcanzada ──────────────────────────────────────────────────────
if (Number.isFinite(a.t) && a.de > 0) {
  const d = Math.abs(a.media - UMBRAL) / a.de;
  const nNec = Math.ceil(((1.645 + 0.842) / d) ** 2);
  console.log(`\n── potencia`);
  console.log(`  tamaño del efecto frente al umbral: d = ${f2(d)}`);
  console.log(`  n para potencia del 80 % (α = 0,05 unilateral): ${nNec} participantes` +
    ` · disponibles: ${a.n}`);
}
console.log();
