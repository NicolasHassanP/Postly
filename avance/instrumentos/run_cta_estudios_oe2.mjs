// Aplica el detector de solicitud de contacto o de compra del Anexo E.12 a los copys de
// los Estudios 1 y 4 del Anexo E.14, que se generaron fuera de la corrida del E.12:
//
//   · Estudio 1 (OE2_copys_material.csv): el prompt genérico no dice nada sobre el cierre,
//     de modo que muestra la conducta por defecto del modelo, que el corpus de campo no
//     puede mostrar porque lo redactaron las consultoras.
//   · Estudio 4 (OE2_estudio4_ciego.csv + OE2_estudio4_clave.csv): los copys de Postly
//     salen de las sesiones del 26 y 27-09-2026, con el sistema en uso; confirman que el
//     prompt corregido el 19-09 era el desplegado, sobre imagen única y carrusel.
//
// Los patrones se leen del propio run_cta_generacion.mjs: una sola fuente de verdad.
// El archivo de resultados NO lleva el texto de ningún copy (los manuales son de las
// participantes): sólo el identificador, el sistema, el veredicto y los patrones.
//
// Uso:    node run_cta_estudios_oe2.mjs
// Salida: CTA_estudios_OE2_resultados.csv

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const INSTR = AQUI;

const fuente = readFileSync(join(AQUI, "..", "run_cta_generacion.mjs"), "utf-8");
const bloque = fuente.match(/const SOLICITUD = (\[[\s\S]*?\n\]);/);
if (!bloque) throw new Error("no se encontró SOLICITUD en run_cta_generacion.mjs");
const SOLICITUD = new Function(`return ${bloque[1]};`)();

function parseCSV(text) {
  const rows = []; let f = [], cur = "", q = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { f.push(cur); cur = ""; }
    else if (c === "\n") { f.push(cur); rows.push(f); f = []; cur = ""; }
    else if (c !== "\r") cur += c;
  }
  if (cur || f.length) { f.push(cur); rows.push(f); }
  const [H, ...data] = rows;
  return data.filter((r) => r.length === H.length)
    .map((r) => Object.fromEntries(H.map((h, j) => [h, r[j]])));
}

const marca = (txt) => SOLICITUD.filter((p) => p.test(txt)).map(String);
const wilson = (k, n, z = 1.96) => {
  const p = k / n, d = 1 + z * z / n, c = p + z * z / (2 * n);
  const m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return [(c - m) / d, (c + m) / d].map((x) => x.toFixed(3));
};

const salida = [["Estudio", "Id", "Sistema", "Solicitud_contacto_o_compra", "Patrones"]];
const cuenta = {};
const suma = (clave, hit) => {
  cuenta[clave] ??= [0, 0];
  cuenta[clave][0] += hit ? 1 : 0;
  cuenta[clave][1] += 1;
};

// ── Estudio 1: sólo los copys usados en el estudio (uno de Postly y uno genérico por producto)
for (const r of parseCSV(readFileSync(join(INSTR, "OE2_copys_material.csv"), "utf-8"))) {
  if ((r.Usado_Estudio1 || "").trim().toLowerCase() !== "si") continue;
  const p = marca(r.Texto);
  suma(`Estudio 1 · ${r.Sistema}`, p.length > 0);
  salida.push(["1", `${r.Carpeta}`, r.Sistema, p.length ? "SI" : "NO", p.join(" | ")]);
}

// ── Estudio 4: la clave dice qué letra es cada sistema
const clave = Object.fromEntries(
  parseCSV(readFileSync(join(INSTR, "OE2_estudio4_clave.csv"), "utf-8"))
    .filter((r) => r.Tipo === "copy").map((r) => [r.Par, r]));
for (const r of parseCSV(readFileSync(join(INSTR, "OE2_estudio4_ciego.csv"), "utf-8"))) {
  if (r.Tipo !== "copy") continue;
  const k = clave[r.Par];
  if (!k) throw new Error(`par ${r.Par} sin clave`);
  const sistema = r.Etiqueta_AB === k.Letra_postly ? "postly" : "manual";
  const p = marca(r.Contenido);
  suma(`Estudio 4 · ${sistema}`, p.length > 0);
  salida.push(["4", r.Par, sistema, p.length ? "SI" : "NO", p.join(" | ")]);
}

const esc = (v) => (/[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v);
writeFileSync(join(AQUI, "CTA_estudios_OE2_resultados.csv"),
  salida.map((r) => r.map(esc).join(",")).join("\n") + "\n", "utf-8");

console.log("Solicitud de contacto o de compra (detector del Anexo E.12):");
for (const [g, [k, n]] of Object.entries(cuenta)) {
  const [lo, hi] = wilson(k, n);
  console.log(`  ${g.padEnd(20)} ${String(k).padStart(2)}/${n}   Wilson 95 % [${lo}; ${hi}]`);
}
console.log("\nArchivo: CTA_estudios_OE2_resultados.csv");
