// Análisis del cuestionario TAM v2 — con ítems invertidos
//
// Reemplaza a run_tam.mjs, escrito para el instrumento de diez ítems todos favorables. Lo
// que agrega es lo que el §3.5.5 de la tesis pedía y el piloto no podía dar:
//
//   · recodifica los tres ítems invertidos (PU4r, PEOU2r, BI2r) antes de promediar;
//   · mide la AQUIESCENCIA, que es el motivo por el que existen esos ítems: correlaciona
//     las respuestas crudas de los ítems directos con las de los invertidos del mismo
//     constructo. Si esa correlación es positiva, quien acuerda con una afirmación acuerda
//     también con su contraria, y el puntaje no mide aceptación;
//   · informa cuántas participantes fallaron el control de atención, sin descartarlas;
//   · da el intervalo del 95 % de cada media, que con n pequeño importa más que la media.
//
// Uso:  node run_tam_v2.mjs [TAM_respuestas_v2.csv]

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const F = process.argv[2] || join(AQUI, "TAM_respuestas_v2.csv");

const CONSTRUCTOS = {
  "Utilidad percibida": ["PU1", "PU2", "PU3", "PU4r", "PU5"],
  "Facilidad de uso percibida": ["PEOU1", "PEOU2r", "PEOU3", "PEOU4"],
  "Intención de uso": ["BI1", "BI2r"],
};
const INVERTIDOS = new Set(["PU4r", "PEOU2r", "BI2r"]);
const ATENCION = { item: "AT1", esperado: 2 };
const MAX = 5;   // escala de 1 a 5: el invertido se recodifica como (MAX + 1) − x

const media = a => a.reduce((s, x) => s + x, 0) / a.length;
const varS = a => a.length < 2 ? 0
  : a.reduce((s, x) => s + (x - media(a)) ** 2, 0) / (a.length - 1);
const de = a => Math.sqrt(varS(a));
const f2 = x => (Math.round(x * 100) / 100).toFixed(2).replace(".", ",");

function pearson(x, y) {
  const n = x.length;
  if (n < 3) return null;
  const mx = media(x), my = media(y);
  const num = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0);
  const den = Math.sqrt(x.reduce((s, v) => s + (v - mx) ** 2, 0) *
    y.reduce((s, v) => s + (v - my) ** 2, 0));
  return den === 0 ? null : num / den;
}
function cronbach(filas, items) {
  const k = items.length;
  if (k < 2 || filas.length < 2) return null;
  const vi = items.map(it => varS(filas.map(f => f[it])));
  const vt = varS(filas.map(f => items.reduce((s, it) => s + f[it], 0)));
  if (vt === 0) return null;
  return (k / (k - 1)) * (1 - vi.reduce((s, v) => s + v, 0) / vt);
}

if (!existsSync(F)) { console.error(`No se encontró ${F}`); process.exit(1); }
const lineas = readFileSync(F, "utf-8").split(/\r?\n/).filter(l => l.trim());
const enc = lineas[0].split(",").map(s => s.trim());
const crudas = lineas.slice(1).map(l => {
  const celdas = []; let campo = "", q = false;
  for (const c of l) {
    if (c === '"') q = !q;
    else if (c === "," && !q) { celdas.push(campo); campo = ""; }
    else campo += c;
  }
  celdas.push(campo);
  return Object.fromEntries(enc.map((h, i) => [h, (celdas[i] ?? "").trim()]));
}).filter(f => f.Participante);

if (!crudas.length) {
  console.log(`\n  ${F.split(/[\\/]/).pop()} está vacío: cargá una fila por participante.`);
  console.log(`  Columnas: Participante, ${enc.slice(1).join(", ")}\n`);
  console.log(`  Los tres ítems invertidos (${[...INVERTIDOS].join(", ")}) se cargan TAL COMO`);
  console.log(`  los respondió la participante: este script los recodifica.\n`);
  process.exit(0);
}

// ─── Recodificación ──────────────────────────────────────────────────────────
const items = Object.values(CONSTRUCTOS).flat();
const filas = [];
const incompletas = [];
for (const c of crudas) {
  const f = { id: c.Participante, _crudo: {} };
  let ok = true;
  for (const it of items) {
    const v = Number(c[it]);
    if (!(v >= 1 && v <= MAX)) { ok = false; continue; }
    f._crudo[it] = v;
    f[it] = INVERTIDOS.has(it) ? (MAX + 1) - v : v;
  }
  f._atencion = Number(c[ATENCION.item]);
  ok ? filas.push(f) : incompletas.push(c.Participante);
}
console.log(`\n════ TAM v2 ════`);
console.log(`  ${filas.length} cuestionarios completos` +
  (incompletas.length ? ` · ${incompletas.length} incompletos: ${incompletas.join(", ")}` : ""));
console.log(`  recodificados (${MAX + 1} − x): ${[...INVERTIDOS].join(", ")}`);

const fallaron = filas.filter(f => f._atencion !== ATENCION.esperado);
console.log(`  control de atención (${ATENCION.item} = ${ATENCION.esperado}): ` +
  `${filas.length - fallaron.length}/${filas.length} correctos` +
  (fallaron.length ? ` · fallaron: ${fallaron.map(f => f.id).join(", ")} (no se descartan)` : ""));

if (filas.length < 2) {
  console.log(`\n  Con menos de dos respuestas no hay varianza que analizar.\n`);
  process.exit(0);
}

// ─── Medias por constructo ───────────────────────────────────────────────────
const tc = filas.length > 1 ? 1.96 + 2.4 / filas.length : 0;   // aprox. t de dos colas
console.log(`\n── medias por constructo (escala 1–5, invertidos ya recodificados)`);
const todos = [];
for (const [nombre, its] of Object.entries(CONSTRUCTOS)) {
  const porPersona = filas.map(f => media(its.map(it => f[it])));
  todos.push(...filas.flatMap(f => its.map(it => f[it])));
  const m = media(porPersona), s = de(porPersona);
  const ee = s / Math.sqrt(porPersona.length);
  const a = cronbach(filas, its);
  console.log(`  ${nombre.padEnd(28)} ${f2(m)}  (DE ${f2(s)}` +
    `, IC 95 % [${f2(m - tc * ee)} ; ${f2(Math.min(MAX, m + tc * ee))}])`);
  console.log(`  ${"".padEnd(28)} α de Cronbach: ` +
    (a === null ? "indefinido (varianza nula o n insuficiente)" : f2(a)) +
    `  · ${its.length} ítems`);
}
console.log(`\n  Puntaje TAM global: ${f2(media(todos))}`);

// ─── Aquiescencia ────────────────────────────────────────────────────────────
console.log(`\n── aquiescencia (por qué existen los ítems invertidos)`);
console.log(`  Se correlacionan las respuestas CRUDAS de los directos contra las de los`);
console.log(`  invertidos del mismo constructo. Esperado si el instrumento mide aceptación:`);
console.log(`  correlación NEGATIVA. Positiva = tendencia a acordar con todo.`);
let sospecha = 0;
for (const [nombre, its] of Object.entries(CONSTRUCTOS)) {
  const inv = its.filter(i => INVERTIDOS.has(i));
  const dir = its.filter(i => !INVERTIDOS.has(i));
  if (!inv.length || !dir.length) continue;
  const x = filas.map(f => media(dir.map(i => f._crudo[i])));
  const y = filas.map(f => media(inv.map(i => f._crudo[i])));
  const r = pearson(x, y);
  const señal = r === null ? "sin varianza" : r > 0.2 ? "AQUIESCENCIA probable"
    : r > -0.2 ? "sin relación clara" : "coherente";
  if (r !== null && r > 0.2) sospecha++;
  console.log(`  ${nombre.padEnd(28)} r = ${r === null ? "n/d" : f2(r)}  → ${señal}`);
}
console.log(sospecha
  ? `\n  ** ${sospecha} constructo(s) con señal de aquiescencia: hay que informarlo junto a la media.`
  : `\n  Sin señal de aquiescencia en los constructos con ítem invertido.`);

// ─── Ítem por ítem ───────────────────────────────────────────────────────────
console.log(`\n── ítem por ítem (recodificado)`);
for (const [nombre, its] of Object.entries(CONSTRUCTOS)) {
  for (const it of its) {
    const v = filas.map(f => f[it]);
    console.log(`  ${it.padEnd(8)}${INVERTIDOS.has(it) ? "(inv.) " : "       "}` +
      `media ${f2(media(v))} · DE ${f2(de(v))} · ${nombre}`);
  }
}
console.log();
