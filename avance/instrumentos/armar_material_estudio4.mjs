// Arma el material ciego del Estudio 4 de OE2 (PROTOCOLO-OE2.md): manual contra Postly.
//
// Lee OE2_estudio4_material.csv —con la identidad de la participante, completado durante o
// después de cada sesión de cronometraje— y produce dos archivos:
//
//   · OE2_estudio4_ciego.csv    — SIN identidad, para imprimir y mostrar al evaluador.
//   · OE2_estudio4_clave.csv    — la identidad y qué letra es cada sistema, para quien
//                                 puntúa las respuestas después. NO se muestra al evaluador.
//
// La letra A/B se asigna por PARIDAD DEL ÍNDICE de cada par dentro del archivo de origen
// —la misma regla fija que usa run_copy_pareado.mjs—, no al azar en el momento: cualquiera
// puede reconstruir la asignación leyendo este archivo, y no se decide nada después de ver
// el material.
//
// Cada fila de origen produce hasta dos pares: uno de COPY (todas las filas) y uno de ORDEN
// (sólo si Tipo = carrusel). El texto/orden manual y el de Postly nunca se muestran juntos
// con el nombre de la participante: por eso este script existe, en vez de armar el material
// a mano.
//
// Uso:  node armar_material_estudio4.mjs
// Lee:  OE2_estudio4_material.csv
//       (Participante, Publicacion, Tipo [imagen|carrusel], Copy_manual, Copy_postly,
//        Orden_manual, Orden_postly)
// Escribe: OE2_estudio4_ciego.csv, OE2_estudio4_clave.csv

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const F_ORIGEN = join(AQUI, "OE2_estudio4_material.csv");
const F_CIEGO = join(AQUI, "OE2_estudio4_ciego.csv");
const F_CLAVE = join(AQUI, "OE2_estudio4_clave.csv");

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\r") { /* skip */ }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r[0] || "").trim());
}
const toCSV = rows => rows.map(r => r.map(v => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}).join(",")).join("\n");

if (!existsSync(F_ORIGEN)) {
  console.error(`\nFalta ${F_ORIGEN.split(/[\\/]/).pop()}.`);
  console.error("Columnas: Participante, Publicacion, Tipo (imagen|carrusel), Copy_manual,");
  console.error("Copy_postly, Orden_manual, Orden_postly (las dos últimas sólo para carrusel).");
  console.error("Se completa durante o después de cada sesión de cronometraje.");
  process.exit(1);
}

const filas = parseCSV(readFileSync(F_ORIGEN, "utf-8"));
const H = Object.fromEntries(filas[0].map((h, i) => [h.trim(), i]));
for (const col of ["Participante", "Publicacion", "Tipo", "Copy_manual", "Copy_postly"]) {
  if (H[col] === undefined) { console.error(`Falta la columna "${col}" en el origen.`); process.exit(1); }
}
const origen = filas.slice(1).filter(f => (f[H.Participante] || "").trim());
if (!origen.length) {
  console.log("\nEl origen está vacío: cargá las publicaciones a medida que se hagan las sesiones.\n");
  process.exit(0);
}

const ciego = [["Par", "Tipo", "Etiqueta_AB", "Contenido"]];
const clave = [["Par", "Tipo", "Participante", "Publicacion", "Letra_manual", "Letra_postly"]];
let idx = 0; // índice compartido entre pares de copy y de orden: fija A/B por paridad, en el orden en que aparecen

for (const f of origen) {
  const part = f[H.Participante], pub = f[H.Publicacion], tipo = (f[H.Tipo] || "").trim().toLowerCase();
  const copyManual = f[H.Copy_manual] || "", copyPostly = f[H.Copy_postly] || "";

  // ─── Par de copy: siempre ─────────────────────────────────────────────────
  {
    const par = `C${idx + 1}`;
    const letraManual = idx % 2 === 0 ? "A" : "B";
    const letraPostly = letraManual === "A" ? "B" : "A";
    ciego.push([par, "copy", letraManual, copyManual]);
    ciego.push([par, "copy", letraPostly, copyPostly]);
    clave.push([par, "copy", part, pub, letraManual, letraPostly]);
    idx++;
  }

  // ─── Par de orden: sólo carrusel, y sólo si las dos columnas están cargadas ─
  if (tipo === "carrusel") {
    const ordenManual = f[H.Orden_manual] || "", ordenPostly = f[H.Orden_postly] || "";
    if (!ordenManual.trim() || !ordenPostly.trim()) {
      console.log(`  ${part} · pub. ${pub}: carrusel sin Orden_manual/Orden_postly cargado; se omite el par de orden.`);
    } else if (ordenManual.trim() === ordenPostly.trim()) {
      console.log(`  ${part} · pub. ${pub}: los dos órdenes coinciden; se informa y queda fuera del contraste.`);
    } else {
      const par = `O${idx + 1}`;
      const letraManual = idx % 2 === 0 ? "A" : "B";
      const letraPostly = letraManual === "A" ? "B" : "A";
      ciego.push([par, "orden", letraManual, ordenManual]);
      ciego.push([par, "orden", letraPostly, ordenPostly]);
      clave.push([par, "orden", part, pub, letraManual, letraPostly]);
      idx++;
    }
  }
}

writeFileSync(F_CIEGO, toCSV(ciego), "utf-8");
writeFileSync(F_CLAVE, toCSV(clave), "utf-8");

const nCopy = clave.slice(1).filter(f => f[1] === "copy").length;
const nOrden = clave.slice(1).filter(f => f[1] === "orden").length;
console.log(`\n✔ ${nCopy} pares de copy y ${nOrden} pares de orden en OE2_estudio4_ciego.csv (sin identidad, se versiona).`);
console.log(`  La clave para puntuar después queda en OE2_estudio4_clave.csv — NO se muestra al evaluador`);
console.log(`  y, como el origen, queda fuera del repositorio (.gitignore): llevan la identidad de las 8 participantes.\n`);
