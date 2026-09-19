// Extiende la detección visual de precios a los flujos que no la tenían, y unifica el
// criterio del que sí la tenía con otro prompt.
//
// POR QUÉ EXISTE
// El Módulo Centinela audita cuatro flujos de publicación. En el canal TEXTUAL los cuatro
// llevan el mismo conjunto de seis expresiones desde `fix-compliance-patterns.mjs`, que
// corrigió la divergencia de HU10. En el canal VISUAL no: recorriendo el grafo de
// conexiones del workflow, la detección de precios incrustados sólo corría en el flujo de
// imagen única (`HU8: Detección visual`). El carrusel usaba otro nodo con otro prompt y
// otro criterio, y el video y la re-publicación no tenían ninguna.
//
// Es la misma clase de defecto que la divergencia de HU10, en el otro canal: un contenido
// bloqueado al publicarse como imagen se publicaba si se enviaba como video o si se
// reciclaba desde Mi Agenda.
//
// QUÉ HACE
//   1. Video (HU13)      inserta la detección sobre el fotograma extraído, entre la guarda
//                        de duración y la generación de copys.
//   2. Repost (HU12)     inserta la detección sobre la imagen recuperada de la fila, antes
//                        de regenerar el copy.
//   3. Carrusel (HU5)    reemplaza la cláusula de compliance de su prompt por la de HU8,
//                        palabra por palabra. No se separa en dos llamadas: el nodo evalúa
//                        N imágenes en una sola petición y separarlo multiplicaría por N el
//                        consumo de una cuota de 20 peticiones diarias. Lo que se unifica
//                        es el criterio, que es lo que el §5.1 mide.
//
// El parseo es el mismo de HU8, incluido su modo fail-open ante una respuesta que no sea
// JSON válido, que el §4.5.1 declara. Replicarlo mantiene el comportamiento medido.
//
// Uso:  node scripts/add-vision-compliance.mjs            (dry-run)
//       node scripts/add-vision-compliance.mjs --escribir (reescribe el JSON del repo)
//
// Después: node scripts/deploy-local-n8n.mjs --deploy
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
const wf = JSON.parse(readFileSync(RUTA, "utf-8"));
const porNombre = new Map(wf.nodes.map((n) => [n.name, n]));
const fallos = [];

const REF = porNombre.get("HU8: Detección visual");
const REF_PARSE = porNombre.get("HU8: Parsear detección");
const REF_IF = porNombre.get("HU8: ¿Imagen limpia?");
const REF_MSG = porNombre.get("HU8: Imagen con precio");
for (const [n, v] of [["HU8: Detección visual", REF], ["HU8: Parsear detección", REF_PARSE],
                      ["HU8: ¿Imagen limpia?", REF_IF], ["HU8: Imagen con precio", REF_MSG]]) {
  if (!v) fallos.push(`falta el nodo de referencia «${n}»`);
}
if (fallos.length) { console.error(fallos.join("\n")); process.exit(1); }

const PROMPT = REF.parameters.text;
// la cláusula de compliance de HU8, que es la que se propaga a los otros flujos
const CRITERIO = PROMPT.slice(PROMPT.indexOf("Detectá si"), PROMPT.indexOf("# RESPUESTA")).trim();

const uid = (() => { let i = 0; return () => `vc${(++i).toString().padStart(4, "0")}`; })();

function conectar(desde, salida, hacia) {
  wf.connections[desde] ??= { main: [] };
  const m = wf.connections[desde].main;
  while (m.length <= salida) m.push([]);
  m[salida] = [{ node: hacia, type: "main", index: 0 }];
}

function nodoGemini(nombre, urlExpr, pos) {
  return {
    parameters: {
      resource: "image", operation: "analyze",
      modelId: JSON.parse(JSON.stringify(REF.parameters.modelId)),
      text: PROMPT, inputType: REF.parameters.inputType,
      imageUrls: urlExpr, options: {},
    },
    type: REF.type, typeVersion: REF.typeVersion, position: pos,
    id: uid(), name: nombre,
    credentials: JSON.parse(JSON.stringify(REF.credentials || {})),
    onError: REF.onError, retryOnFail: REF.retryOnFail,
  };
}

function nodoParseo(nombre, nodoIA, urlExpr, pos) {
  // mismo parseo tolerante de HU8: si Gemini no devuelve JSON limpio, no bloquea (§4.5.1)
  const js = [
    `// ${nombre} — parsea la detección visual de Gemini (fail-open ante JSON inválido)`,
    `const raw = ($('${nodoIA}').first().json.content.parts[0].text) || '';`,
    `let parsed = { tiene_precio: false, detalle: '' };`,
    `try {`,
    `  parsed = JSON.parse(raw.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim());`,
    `} catch (e) { /* Gemini no devolvió JSON limpio -> no bloquear */ }`,
    `return [{ json: {`,
    `  tiene_precio: parsed.tiene_precio === true,`,
    `  detalle: parsed.detalle || '',`,
    `  secure_url: ${urlExpr}`,
    `} }];`,
  ].join("\n");
  return {
    parameters: { jsCode: js }, type: REF_PARSE.type, typeVersion: REF_PARSE.typeVersion,
    position: pos, id: uid(), name: nombre,
  };
}

function nodoIf(nombre, pos) {
  const c = JSON.parse(JSON.stringify(REF_IF.parameters));
  c.conditions.conditions ??= c.conditions.conditions;
  for (const cond of (c.conditions.conditions || c.conditions)) {
    if (cond && typeof cond === "object" && "id" in cond) cond.id = `${nombre}-cond`;
  }
  return { parameters: c, type: REF_IF.type, typeVersion: REF_IF.typeVersion,
           position: pos, id: uid(), name: nombre };
}

function nodoAviso(nombre, texto, pos) {
  return {
    parameters: {
      chatId: REF_MSG.parameters.chatId, text: texto,
      additionalFields: { appendAttribution: false },
    },
    type: REF_MSG.type, typeVersion: REF_MSG.typeVersion, position: pos,
    id: uid(), name: nombre,
    credentials: JSON.parse(JSON.stringify(REF_MSG.credentials || {})),
    webhookId: undefined,
  };
}

// ─── 1 · VIDEO ────────────────────────────────────────────────────────────────
// `Video: procesar` deja `frameUrl`, el fotograma que ya se usa para generar los copys.
// La detección se interpone entre la guarda de duración y esa generación.
const AVISO_VIDEO =
  "=🚫 *Detecté un precio o promoción en el video.*\n\n" +
  "Por las normas de Mary Kay no puedo publicar contenido con precios, ofertas o descuentos " +
  "incrustados en la imagen.\n\n_Detalle:_ {{ $json.detalle }}\n\n" +
  "🎬 Mandame otro video sin precios y seguimos.";

const nuevos = [
  nodoGemini("Video: HU8 visual", "={{ $('Video: procesar').first().json.frameUrl }}", [3160, 700]),
  nodoParseo("Video: HU8 parsear", "Video: HU8 visual",
             "$('Video: procesar').first().json.frameUrl", [3400, 700]),
  nodoIf("Video: ¿frame limpio?", [3640, 700]),
  nodoAviso("Video: frame con precio", AVISO_VIDEO, [3880, 620]),

  // ─── 2 · REPOST ─────────────────────────────────────────────────────────────
  nodoGemini("Repost: HU8 visual",
             "={{ $('Repost: Elegir fila').first().json.ImageURL }}", [2360, 1180]),
  nodoParseo("Repost: HU8 parsear", "Repost: HU8 visual",
             "$('Repost: Elegir fila').first().json.ImageURL", [2600, 1180]),
  nodoIf("Repost: ¿imagen limpia?", [2840, 1180]),
  nodoAviso("Repost: imagen con precio",
            "=🚫 *Detecté un precio o promoción en la imagen guardada.*\n\n" +
            "Por las normas de Mary Kay no puedo volver a publicarla.\n\n" +
            "_Detalle:_ {{ $json.detalle }}\n\n" +
            "📸 Elegí otra publicación de tu agenda o mandame una foto nueva.", [3080, 1100]),
];

for (const n of nuevos) {
  if (porNombre.has(n.name)) { fallos.push(`el nodo «${n.name}» ya existe`); continue; }
  wf.nodes.push(n); porNombre.set(n.name, n);
}

// reconexión: el que iba al generador ahora va al detector, y el detector al generador
const RECABLEADO = [
  // [origen, salida, destino viejo, destino nuevo]
  ["Video: ¿largo?", 1, "Video: analizar", "Video: HU8 visual"],
  ["Repost: Elegir fila", 0, "Repost: Analizar imagen", "Repost: HU8 visual"],
];
for (const [origen, salida, viejo, nuevo] of RECABLEADO) {
  const m = wf.connections[origen]?.main?.[salida];
  const i = (m || []).findIndex((c) => c.node === viejo);
  if (i < 0) { fallos.push(`no encuentro ${origen}[${salida}] -> ${viejo}`); continue; }
  m[i] = { node: nuevo, type: "main", index: 0 };
}

conectar("Video: HU8 visual", 0, "Video: HU8 parsear");
conectar("Video: HU8 parsear", 0, "Video: ¿frame limpio?");
conectar("Video: ¿frame limpio?", 0, "Video: frame con precio");   // true  = tiene precio
conectar("Video: ¿frame limpio?", 1, "Video: analizar");           // false = sigue
conectar("Repost: HU8 visual", 0, "Repost: HU8 parsear");
conectar("Repost: HU8 parsear", 0, "Repost: ¿imagen limpia?");
conectar("Repost: ¿imagen limpia?", 0, "Repost: imagen con precio");
conectar("Repost: ¿imagen limpia?", 1, "Repost: Analizar imagen");

// ─── 3 · CARRUSEL: el mismo criterio, en su prompt combinado ──────────────────
const car = porNombre.get("HU5: Analizar carrusel");
if (!car) fallos.push("falta el nodo «HU5: Analizar carrusel»");
else {
  const t = car.parameters.text;
  const ini = t.indexOf("1) COMPLIANCE:");
  const fin = t.indexOf("2) ORDEN");
  if (ini < 0 || fin < 0) fallos.push("no ubico la cláusula de compliance del carrusel");
  else {
    // El criterio se inserta SIN sangrar. La identidad tiene que ser literal para que
    // verificar_patrones_desplegados.mjs pueda demostrarla carácter por carácter, igual
    // que hace con las seis expresiones del canal textual; una sangría de tres espacios
    // la rompería sin cambiar nada del comportamiento, que es peor que no unificar.
    car.parameters.text = t.slice(0, ini) +
      "1) COMPLIANCE: sobre CUALQUIERA de las imágenes, con este criterio.\n" +
      CRITERIO + "\nSi alguna la incumple, marcá tiene_precio=true e indicá en qué imagen " +
      "(1..N) y qué viste.\n" + t.slice(fin);
  }
}

// ─── informe ──────────────────────────────────────────────────────────────────
console.log(`nodos: ${wf.nodes.length}`);
for (const n of nuevos) console.log(`  + ${n.name}`);
console.log("\ncriterio visual por flujo:");
for (const [flujo, nodo] of [["imagen única", "HU8: Detección visual"],
                             ["carrusel", "HU5: Analizar carrusel"],
                             ["video", "Video: HU8 visual"],
                             ["repost", "Repost: HU8 visual"]]) {
  const n = porNombre.get(nodo);
  const tiene = n && n.parameters.text && n.parameters.text.includes(CRITERIO.split("\n")[0]);
  console.log(`  ${flujo.padEnd(14)} ${nodo.padEnd(24)} ${tiene ? "criterio de HU8" : "SIN el criterio"}`);
  if (!tiene) fallos.push(`«${nodo}» no lleva el criterio de HU8`);
}

if (fallos.length) { console.error("\n*** FALLOS ***\n  " + fallos.join("\n  ")); process.exit(1); }
if (!process.argv.includes("--escribir")) {
  console.log("\n(dry-run: no se escribió el JSON. Agregá --escribir para aplicar)");
  process.exit(0);
}
writeFileSync(RUTA, JSON.stringify(wf, null, 2), "utf-8");
console.log(`\nescrito: ${RUTA}`);
console.log("ahora: node scripts/deploy-local-n8n.mjs --deploy");
