// Neutraliza el Markdown del texto que devuelve el modelo antes de mandarlo por Telegram.
//
// POR QUÉ EXISTE
// Los avisos de compliance interpolan el campo `detalle`, que lo redacta Gemini, dentro de
// un mensaje con Markdown: «_Detalle:_ {{ $json.detalle }}». La primera detección real
// devolvió «…una placa con 'PROMO: $59.75' y '@DANYGIL_MK' en la esquina superior derecha»,
// y el guion bajo de esa cuenta abrió una entidad de cursiva que nunca cerraba. Telegram
// rechazó el mensaje entero:
//
//   400 · can't parse entities: Can't find end of the entity starting at byte offset 285
//
// El defecto no es del aviso nuevo: es de todos los nodos que interpolan texto del modelo
// en un mensaje con formato, incluido `HU8: Imagen con precio`, que venía de antes y tenía
// la misma bomba de tiempo esperando un nombre de producto con guion bajo o asterisco.
//
// Se corrige en el origen —el nodo que parsea la respuesta— y no en cada mensaje: así
// cualquier aviso que se agregue después hereda el saneamiento. Se quitan los cinco
// caracteres que el Markdown de Telegram trata como marca (`_`, `*`, backtick, `[`, `]`);
// el texto queda legible y deja de poder romper el envío.
//
// Uso:  node scripts/fix-telegram-markdown.mjs [--escribir]
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
const wf = JSON.parse(readFileSync(RUTA, "utf-8"));
const porNombre = new Map(wf.nodes.map((n) => [n.name, n]));
const fallos = [];

const SANEAR = "const limpio = (s) => String(s || '').replace(/[_*`\\[\\]]/g, '');";

const NODOS = ["HU8: Parsear detección", "Video: HU8 parsear", "Repost: HU8 parsear"];
// El del carrusel emite el detalle en una sola línea dentro del return, de modo que no
// calza con el patrón de los otros tres y se trata aparte.
const CARRUSEL = "HU5: Parsear análisis";

for (const nombre of NODOS) {
  const n = porNombre.get(nombre);
  if (!n) { fallos.push(`falta el nodo «${nombre}»`); continue; }
  let js = n.parameters.jsCode;

  if (js.includes(SANEAR)) { console.log(`  = ${nombre} ya estaba saneado`); continue; }

  // la línea que emite el detalle, en cualquiera de sus dos formas
  const VIEJO = ["  detalle: parsed.detalle || '',", "  detalle: parsed.detalle || '',"];
  if (!js.includes(VIEJO[0])) { fallos.push(`«${nombre}»: no encuentro la línea del detalle`); continue; }

  js = js.replace(VIEJO[0], "  detalle: limpio(parsed.detalle),");
  // la función va antes del return
  const iRet = js.indexOf("return [{ json: {");
  if (iRet < 0) { fallos.push(`«${nombre}»: no encuentro el return`); continue; }
  js = js.slice(0, iRet) +
       "// El detalle lo redacta el modelo y se interpola en un mensaje con Markdown: un\n" +
       "// guion bajo de una cuenta como @DANYGIL_MK abre una cursiva que no cierra y\n" +
       "// Telegram rechaza el envío con 400. Se le quitan las marcas.\n" +
       SANEAR + "\n" + js.slice(iRet);
  n.parameters.jsCode = js;
  console.log(`  ~ ${nombre} — el detalle se sanea antes de emitirse`);
}

const car = porNombre.get(CARRUSEL);
if (!car) fallos.push(`falta el nodo «${CARRUSEL}»`);
else if (car.parameters.jsCode.includes("limpio(")) console.log(`  = ${CARRUSEL} ya estaba saneado`);
else {
  const V = "detalle: p.detalle || ''";
  if (!car.parameters.jsCode.includes(V)) fallos.push(`«${CARRUSEL}»: no encuentro la línea del detalle`);
  else {
    // la clase de caracteres se arma por partes: escrita en línea, los corchetes del
    // literal se escapan mal al pasar por el reemplazo y la expresión deja de filtrar
    const CLASE = "/[_*`" + String.fromCharCode(92) + "[" + String.fromCharCode(92) + "]]/g";
    car.parameters.jsCode = car.parameters.jsCode
      .replace(V, `detalle: String(p.detalle || '').replace(${CLASE}, '')`);
    console.log(`  ~ ${CARRUSEL} — el detalle se sanea antes de emitirse`);
  }
}

// comprobación: ningún nodo de Telegram interpola `detalle` sin que su origen lo sanee
const avisos = wf.nodes.filter((n) => n.type.endsWith("telegram") &&
                                      String(n.parameters?.text || "").includes("$json.detalle"));
console.log(`\nmensajes que interpolan el detalle: ${avisos.length}`);
for (const a of avisos) console.log(`   ${a.name}`);

if (fallos.length) { console.error("\n*** FALLOS ***\n  " + fallos.join("\n  ")); process.exit(1); }
if (!process.argv.includes("--escribir")) {
  console.log("\n(dry-run: no se escribió el JSON. Agregá --escribir para aplicar)");
  process.exit(0);
}
writeFileSync(RUTA, JSON.stringify(wf, null, 2), "utf-8");
console.log(`\nescrito: ${RUTA}`);
