// Cierra la guarda de duración de HU13, que era fail-open.
//
// POR QUÉ EXISTE
// El corte de 60 s de HU13 lo impone una sola línea del nodo «Video: procesar»:
//
//   const dur = ffdur(inP);
//   if (dur && dur > 60) { return [{ json: { chatId, tooLong: true, dur: Math.round(dur) } }]; }
//
// `ffdur` parsea la duración de la salida de texto de `ffmpeg -i ... -f null -`, buscando
// la subcadena «Duration: ». No hay `ffprobe` en la instancia, de modo que ése es el único
// camino, y el propio §4.7.3 lo declara frágil. Cuando ese parseo falla —un contenedor que
// ffmpeg no reporta, una salida en otro idioma, un error antes de llegar a esa línea—
// `ffdur` devuelve `null`, y `dur && dur > 60` es falso: **la guarda no se dispara y el
// video sigue de largo sin ningún control de duración**. El flujo lo normaliza sin el flag
// `-t 60` y lo manda a publicar.
//
// Es la clase de defecto que la octava auditoría marcó en su hallazgo A3: la Tabla 13 daba
// esa fila como «Cumple: Sí» por configuración, y la configuración no lo establecía.
//
// QUÉ HACE
// La guarda pasa a fail-closed. Si la duración no se puede leer, el flujo NO sigue: toma la
// misma rama que un video demasiado largo y le pregunta a la usuaria si recorta a 60 s.
// Es la respuesta segura y además la única que el sistema puede garantizar, porque el
// camino de recorte aplica `-t 60` y no depende de `dur` (usa `Math.min(dur || 60, 60)`).
//
// El aviso de «Video: avisar» distingue los dos casos, porque decir «tu video dura null
// segundos» sería peor que no avisar.
//
// Uso:  node scripts/fix-hu13-duracion.mjs [--escribir]
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
const wf = JSON.parse(readFileSync(RUTA, "utf-8"));
const porNombre = new Map(wf.nodes.map((n) => [n.name, n]));
const fallos = [];

// ── 1. la guarda ─────────────────────────────────────────────────────────────
const VIEJA = "if(dur && dur>60){ return [{ json:{ chatId, tooLong:true, dur:Math.round(dur) } }]; }";
const NUEVA = "if(dur===null || dur>60){ return [{ json:{ chatId, tooLong:true, " +
              "durDesconocida:dur===null, dur:dur===null?null:Math.round(dur) } }]; }";

const procesar = porNombre.get("Video: procesar");
if (!procesar) {
  fallos.push("falta el nodo «Video: procesar»");
} else if (procesar.parameters.jsCode.includes(NUEVA)) {
  console.log("  = «Video: procesar» ya estaba corregido");
} else if (!procesar.parameters.jsCode.includes(VIEJA)) {
  fallos.push("«Video: procesar»: no encuentro la guarda esperada");
} else {
  procesar.parameters.jsCode = procesar.parameters.jsCode.replace(VIEJA, NUEVA);
  console.log("  ~ «Video: procesar»: la guarda pasa a fail-closed");
}

// ── 2. el aviso, que ahora tiene dos casos ───────────────────────────────────
const TEXTO_VIEJO = "=🎬 Tu video dura {{ $json.dur }} segundos, pero los Reels admiten máximo 60." +
  "\n\n¿Querés que lo recorte a los primeros 60 segundos?";
const TEXTO_NUEVO = "=🎬 {{ $json.durDesconocida ? 'No pude leer la duración de tu video, y los " +
  "Reels admiten un máximo de 60 segundos.' : 'Tu video dura ' + $json.dur + ' segundos, pero " +
  "los Reels admiten máximo 60.' }}\n\n¿Querés que lo recorte a los primeros 60 segundos?";

const avisar = porNombre.get("Video: avisar");
if (!avisar) {
  fallos.push("falta el nodo «Video: avisar»");
} else if (avisar.parameters.text === TEXTO_NUEVO) {
  console.log("  = «Video: avisar» ya estaba corregido");
} else if (avisar.parameters.text !== TEXTO_VIEJO) {
  fallos.push(`«Video: avisar»: texto inesperado -> ${JSON.stringify(avisar.parameters.text)}`);
} else {
  avisar.parameters.text = TEXTO_NUEVO;
  console.log("  ~ «Video: avisar»: distingue duración desconocida de duración excesiva");
}

// ── 3. comprobación: ninguna rama publica un video sin pasar por la pregunta ──
// La única vía que evita `Video: ¿largo?` sería un `return` anterior en el mismo nodo.
if (procesar) {
  const cod = procesar.parameters.jsCode;
  const previos = cod.slice(0, cod.indexOf("const dur=ffdur(inP);"))
    .split("\n").filter((l) => /^\s*return\s/.test(l));
  console.log(`\n  returns en «Video: procesar» anteriores a la guarda: ${previos.length}`);
  for (const l of previos) console.log(`    ${l.trim()}`);

  const sinGuarda = /if\(dur\s*&&\s*dur\s*>\s*60\)/.test(cod);
  if (sinGuarda) fallos.push("todavía queda una guarda de la forma «dur && dur>60»");
}

// el camino de recorte no puede depender de una duración legible
const cortar = porNombre.get("Video: cortar");
if (cortar && !cortar.parameters.jsCode.includes("Math.min(dur||60, 60)")) {
  fallos.push("«Video: cortar» ya no aplica el tope de 60 s independiente de `dur`");
}

if (fallos.length) { console.error("\n*** FALLOS ***\n  " + fallos.join("\n  ")); process.exit(1); }
if (!process.argv.includes("--escribir")) {
  console.log("\n(dry-run: no se escribió el JSON. Agregá --escribir para aplicar)");
  process.exit(0);
}
writeFileSync(RUTA, JSON.stringify(wf, null, 2), "utf-8");
console.log(`\nescrito: ${RUTA}`);
