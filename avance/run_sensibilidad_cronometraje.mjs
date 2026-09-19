// Análisis de sensibilidad del cronometraje a la asimetría de la tarea manual.
//
// POR QUÉ EXISTE
// El protocolo del Anexo E.2 define la condición manual en cinco pasos, y el segundo es
// «edita/adapta la imagen al formato de feed (recorte/resolución)». Postly no hace esa tarea:
// el §4.7.2 declara que la normalización de imágenes nunca se implementó y que el flujo sube
// cada archivo a Cloudinary sin declarar transformación. Las dos condiciones no cubren
// entonces exactamente el mismo trabajo, y parte de la reducción del 73,6 % puede provenir de
// una subtarea que el sistema no ejecuta. El margen sobre el umbral de la hipótesis es de
// 3,6 puntos, de modo que la pregunta no es retórica.
//
// QUÉ HACE
// No inventa un dato que no se midió. Recorre el espacio de valores posibles: para cada
// duración hipotética A de esa subtarea, descuenta A del tiempo manual de cada publicación
// —el asistido no la incluye nunca— y recalcula la reducción. Devuelve la curva y el punto en
// que cruza el umbral del 70 %.
//
// Lo que el resultado permite decir no es cuánto dura la adaptación, sino cuánto tendría que
// durar para que la conclusión cambiara. Es una cota, no una medición, y así hay que leerla.
//
// Uso:  node run_sensibilidad_cronometraje.mjs
// Lee:  Cronometraje_datos.csv
// Escribe: Sensibilidad_cronometraje_resultados.csv

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const ENTRADA = join(AQUI, "Cronometraje_datos.csv");
const SALIDA = join(AQUI, "Sensibilidad_cronometraje_resultados.csv");
const UMBRAL = 70;

const seg = (s) => {
  const [m, x] = s.split(":").map(Number);
  return m * 60 + x;
};
const media = (v) => v.reduce((a, b) => a + b, 0) / v.length;

// ─── datos ───────────────────────────────────────────────────────────────────
const lineas = readFileSync(ENTRADA, "utf-8").trim().split(/\r?\n/);
const cab = lineas[0].split(",");
const iP = cab.indexOf("Participante");
const iM = cab.indexOf("Manual_mmss");
const iT = cab.indexOf("Postly_mmss");

const porConsultora = new Map();
for (const linea of lineas.slice(1)) {
  const c = linea.split(",");
  if (!c[iM] || !c[iT]) continue;
  if (!porConsultora.has(c[iP])) porConsultora.set(c[iP], []);
  porConsultora.get(c[iP]).push([seg(c[iM]), seg(c[iT])]);
}
const pares = [...porConsultora.values()].flat();
console.log(`  ${pares.length} pares cronometrados, ${porConsultora.size} consultoras`);

// La unidad del diseño es la consultora (§5.1): se promedia dentro de cada una y después
// entre ellas, para no dar más peso a quien aportó más publicaciones.
function reduccion(A) {
  const porC = [...porConsultora.values()].map((v) =>
    media(v.map(([m, p]) => ((m - A) - p) / (m - A) * 100)));
  return media(porC);
}

const base = reduccion(0);
console.log(`  reducción sin descontar nada: ${base.toFixed(1)} %`);
if (Math.abs(base - 73.6) > 0.1) {
  console.error(`*** la reducción base no reproduce el 73,6 % del §5.1: ${base.toFixed(2)} %`);
  process.exit(1);
}

// El contraste que la prueba del §5.1 sí respalda es el de reducción nula, y conviene saber
// si sobrevive al descuento. Es la misma t pareada sobre las medias por consultora.
function tContraReduccionNula(A) {
  const difs = [...porConsultora.values()].map((v) =>
    media(v.map(([m]) => m - A)) - media(v.map(([, p]) => p)));
  const m = media(difs);
  const s = Math.sqrt(difs.reduce((a, x) => a + (x - m) ** 2, 0) / (difs.length - 1));
  return m / (s / Math.sqrt(difs.length));
}
const T_CRITICO = 4.303;   // bilateral, α = 0,05, 2 grados de libertad

// ─── la curva y el cruce ─────────────────────────────────────────────────────
const filas = [["Adaptacion_supuesta_s", "Reduccion_media_pct", "Cruza_el_umbral_70",
                "t_contra_reduccion_nula", "Sigue_siendo_significativa"]];
for (const A of [0, 15, 30, 45, 60, 75, 90, 120, 150, 180]) {
  const r = reduccion(A);
  const t = tContraReduccionNula(A);
  filas.push([A, r.toFixed(2).replace(".", ","), r > UMBRAL ? "No" : "Si",
              t.toFixed(2).replace(".", ","), t > T_CRITICO ? "Si" : "No"]);
  console.log(`   A = ${String(A).padStart(3)} s  ->  ${r.toFixed(1)} %` +
    `   t(2) = ${t.toFixed(2)}${t > T_CRITICO ? "" : "   *** ya no significativa ***"}`);
}

let lo = 0, hi = 600;
while (hi - lo > 0.05) {
  const mid = (lo + hi) / 2;
  if (reduccion(mid) > UMBRAL) lo = mid; else hi = mid;
}
console.log(`\n  la reducción cruza el ${UMBRAL} % con A = ${lo.toFixed(0)} s ` +
  `(${(lo / 60).toFixed(1)} min) por publicación`);
filas.push([`cruce_${UMBRAL}pct`, lo.toFixed(0), "—", "—", "—"]);

writeFileSync(SALIDA, filas.map((r) => r.join(",")).join("\n"), "utf-8");
console.log(`\nescrito: ${SALIDA}`);
