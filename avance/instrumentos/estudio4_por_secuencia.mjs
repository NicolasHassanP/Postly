// Estudio 4 por secuencia (dictamen 14, N-10): ¿el copy manual de las participantes que empezaron con
// Postly está contaminado por haber visto antes los tres copys del sistema?
//
// En las participantes con secuencia PM (Postly primero) el copy manual de cada publicación se redactó
// después de ver los tres copys de Postly para el mismo producto. Si eso lo acercara al de Postly, la
// preferencia por Postly bajaría en PM respecto de MP (manual primero). Se cuenta, por secuencia, en
// cuántos de los pares de copy el evaluador prefirió el de Postly, y se contrastan las dos secuencias
// con la prueba exacta de Fisher (dos colas). La secuencia sale de Cronometraje_datos_v2.csv y la
// identidad de cada par, de OE2_estudio4_clave.csv.
//
// Uso:  node estudio4_por_secuencia.mjs [carpeta]

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = process.argv[2] || dirname(fileURLToPath(import.meta.url));

function leerCSV(nombre) {
  const lineas = readFileSync(join(AQUI, nombre), "utf-8").replace(/^﻿/, "")
    .split(/\r?\n/).filter(l => l.trim());
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

const secuencia = {};
for (const f of leerCSV("Cronometraje_datos_v2.csv")) secuencia[f.Participante] = f.Secuencia.toUpperCase();
const clave = Object.fromEntries(leerCSV("OE2_estudio4_clave.csv").map(f => [f.Par, f]));

const pares = {};
for (const r of leerCSV("OE2_estudio4_respuestas.csv")) {
  if (r.Tipo !== "copy") continue;
  (pares[r.Par] ??= []).push(r);
}
const por = { MP: [0, 0], PM: [0, 0] };          // [preferencias por Postly, pares]
for (const [par, filas] of Object.entries(pares)) {
  const c = clave[par], s = secuencia[c.Participante];
  const preferida = filas.find(x => x.Preferida === "si").Letra;
  por[s][1]++; if (preferida === c.Letra_postly) por[s][0]++;
}

// Fisher exacto de dos colas para [[a, b], [c, d]]
function fisher(a, b, c, d) {
  const lf = n => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const n = a + b + c + d, r1 = a + b, c1 = a + c;
  const pmf = x => Math.exp(lf(r1) + lf(c + d) + lf(c1) + lf(b + d) - lf(n) - lf(x) - lf(r1 - x) - lf(c1 - x) - lf(n - r1 - c1 + x));
  const obs = pmf(a); let p = 0;
  for (let x = Math.max(0, r1 + c1 - n); x <= Math.min(r1, c1); x++) { const v = pmf(x); if (v <= obs * 1.0000001) p += v; }
  return Math.min(1, p);
}

const [kMP, nMP] = por.MP, [kPM, nPM] = por.PM;
console.log(`\n════ ESTUDIO 4 POR SECUENCIA (copys) ════`);
console.log(`  manual primero (MP): Postly preferido en ${kMP}/${nMP} pares = ${(100 * kMP / nMP).toFixed(1).replace(".", ",")} %`);
console.log(`  Postly primero (PM): Postly preferido en ${kPM}/${nPM} pares = ${(100 * kPM / nPM).toFixed(1).replace(".", ",")} %`);
console.log(`  Fisher exacto, dos colas: p = ${fisher(kMP, nMP - kMP, kPM, nPM - kPM).toFixed(2).replace(".", ",")}`);
