// Tiempo del motor para las 32 publicaciones con Postly de la ampliación (28-09-2026,
// dictamen 13, A-01). Lee del historial de ejecuciones de n8n (entorno E2) el intervalo entre
// la llegada de la primera foto y el fin de la ejecución que publica, que es la columna
// Sistema_mmss de Cronometraje_datos_v2.csv. El cronómetro de la condición Postly quedó por
// debajo de ese intervalo en 23 de las 32 publicaciones: no incluyó de forma uniforme la
// espera por el modelo. El análisis toma el mayor de los dos (§6.1.6 de la tesis).
//
// La asignación de sesiones a participantes sigue el orden de las sesiones y la confirman
// tres incidencias que la planilla anota y el historial registra: C2-2 y C6-1 fallan en
// «Telegram Éxito» (ejecuciones 650 y 712) y C6-3 en «HU5: Crear hijo» (724).
// En C6-3 y C8-3, con un intento fallido, se descuenta la ventana de ese intento.
//
// No imprime ni guarda datos de las participantes: sólo tiempos.
// Uso (desde la raíz del repo, con N8N_BASE_URL y N8N_API_KEY_LOCAL en .env):
//   node avance/instrumentos/tiempos_motor_v2.mjs

import { readFileSync } from "node:fs";

const env = { ...process.env };
try {
  for (const l of readFileSync(".env", "utf-8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* sin .env */ }
const H = { "X-N8N-API-KEY": env.N8N_API_KEY_LOCAL || env.N8N_API_KEY, "ngrok-skip-browser-warning": "true" };

// [foto, publica] o, con intento fallido, [foto, falla, reintento, publica]
const PARES = {
  C1: [[630, 631], [633, 634], [636, 639], [641, 644]],
  C2: [[646, 647], [649, 650], [652, 655], [657, 660]],
  C3: [[662, 663], [667, 668], [669, 672], [674, 677]],
  C4: [[679, 680], [682, 683], [685, 688], [690, 693]],
  C5: [[695, 696], [698, 699], [701, 704], [706, 709]],
  C6: [[711, 712], [718, 719], [726, 729], [731, 734]],
  C7: [[736, 737], [739, 740], [742, 745], [747, 750]],
  C8: [[752, 753], [755, 756], [758, 760, 761, 762], [764, 767]],
};

const cache = {};
async function ej(id) {
  if (!cache[id]) {
    const r = await fetch(`${env.N8N_BASE_URL}/api/v1/executions/${id}`, { headers: H });
    if (!r.ok) throw new Error(`ejecución ${id}: HTTP ${r.status}`);
    const e = await r.json();
    cache[id] = { ini: new Date(e.startedAt).getTime(), fin: new Date(e.stoppedAt).getTime() };
  }
  return cache[id];
}
const mmss = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${(s % 60).toFixed(2).padStart(5, "0")}`;

for (const [p, pubs] of Object.entries(PARES)) {
  for (const [k, ids] of pubs.entries()) {
    let s;
    if (ids.length === 2) s = ((await ej(ids[1])).fin - (await ej(ids[0])).ini) / 1000;
    else s = ((await ej(ids[1])).ini - (await ej(ids[0])).ini + (await ej(ids[3])).fin - (await ej(ids[2])).ini) / 1000;
    console.log(`${p},${k + 1},${ids.join("-")},${mmss(s)}`);
  }
}
