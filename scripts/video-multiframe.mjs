// Amplía la detección visual del flujo de video: varios fotogramas y el encuadre completo.
//
// POR QUÉ EXISTE
// La primera prueba con un video real expuso dos límites del diseño anterior, que analizaba
// un único fotograma del video ya normalizado:
//
//   1. UN SOLO INSTANTE. El fotograma se extraía sin `-ss`, de modo que era el primero. Una
//      placa de precio que apareciera a los tres segundos no se veía.
//   2. EL RECORTE. La normalización a 9:16 escala para cubrir y recorta al centro. Sobre un
//      video de 1280×720 sobrevive el 32 % del ancho: 1167 px de cada lado se pierden. El
//      cartel «PROMO: $59.99» del video de prueba vivía en el borde derecho y desaparecía
//      antes de que el detector viera nada.
//
// El segundo caso no era un incumplimiento —el Reel publicado tampoco llevaba el cartel,
// porque el recorte lo había eliminado—, pero sí un recorte silencioso: la consultora sube
// un video con una placa y el sistema publica una versión sin ella sin decírselo.
//
// QUÉ HACE
// `Video: procesar` pasa a extraer cuatro fotogramas y a subirlos todos:
//   · tres del video NORMALIZADO, al 10 %, 50 % y 90 % de su duración — es lo que se publica;
//   · uno del ORIGINAL sin recortar, al 10 % — es lo que la consultora filmó.
// Los cuatro viajan en una sola petición a Gemini, que admite varias imágenes por llamada:
// el costo de cuota es el mismo que antes.
//
// La respuesta distingue dos cosas:
//   · `tiene_precio`    — hay un precio en lo que se va a publicar. Bloquea, como antes.
//   · `precio_recortado`— hay un precio en el encuadre original que el recorte elimina. No
//                          bloquea: avisa, y la publicación sigue.
//
// La cláusula de criterio se reusa VERBATIM de `HU8: Detección visual`, de modo que
// `verificar_patrones_desplegados.mjs` sigue demostrando que los cuatro flujos comparten el
// mismo criterio. Lo que cambia alrededor es el encuadre de la tarea, no la regla.
//
// Uso:  node scripts/video-multiframe.mjs            (dry-run)
//       node scripts/video-multiframe.mjs --escribir
//       node scripts/deploy-local-n8n.mjs --deploy
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
const wf = JSON.parse(readFileSync(RUTA, "utf-8"));
const porNombre = new Map(wf.nodes.map((n) => [n.name, n]));
const fallos = [];

const REF = porNombre.get("HU8: Detección visual");
const VIS = porNombre.get("Video: HU8 visual");
const PARSE = porNombre.get("Video: HU8 parsear");
const PROC = porNombre.get("Video: procesar");
const IF = porNombre.get("Video: ¿frame limpio?");
const MSG = porNombre.get("Video: frame con precio");
for (const [n, v] of [["HU8: Detección visual", REF], ["Video: HU8 visual", VIS],
                      ["Video: HU8 parsear", PARSE], ["Video: procesar", PROC],
                      ["Video: ¿frame limpio?", IF], ["Video: frame con precio", MSG]]) {
  if (!v) fallos.push(`falta el nodo «${n}»`);
}
if (fallos.length) { console.error(fallos.join("\n")); process.exit(1); }

const PROMPT_HU8 = REF.parameters.text;
const CRITERIO = PROMPT_HU8.slice(PROMPT_HU8.indexOf("Detectá si"),
                                 PROMPT_HU8.indexOf("# RESPUESTA")).trim();

// ─── 1 · Video: procesar — cuatro fotogramas ──────────────────────────────────
const NORMALIZAR_VIEJO = `async function normalizar(inPath, chatId, cut){
  const outP='/tmp/out_'+chatId+'.mp4'; const frP='/tmp/fr_'+chatId+'.jpg';
  const tflag = cut ? ' -t 60' : '';
  cp.execSync('ffmpeg -y -i '+inPath+' -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -c:v libx264 -preset veryfast -c:a aac -movflags +faststart'+tflag+' '+outP,{stdio:'pipe',maxBuffer:1024*1024*50});
  cp.execSync('ffmpeg -y -i '+outP+' -vframes 1 -q:v 2 '+frP,{stdio:'pipe',maxBuffer:1024*1024*50});
  const v=await cloud('video','data:video/mp4;base64,'+fs.readFileSync(outP).toString('base64'));
  const f=await cloud('image','data:image/jpeg;base64,'+fs.readFileSync(frP).toString('base64'));
  return { videoUrl:v.secure_url, frameUrl:f.secure_url };
}`;

const NORMALIZAR_NUEVO = `async function normalizar(inPath, chatId, cut, dur){
  const outP='/tmp/out_'+chatId+'.mp4';
  const tflag = cut ? ' -t 60' : '';
  cp.execSync('ffmpeg -y -i '+inPath+' -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -c:v libx264 -preset veryfast -c:a aac -movflags +faststart'+tflag+' '+outP,{stdio:'pipe',maxBuffer:1024*1024*50});
  // Tres instantes del video que SE VA A PUBLICAR, mas el encuadre COMPLETO del original.
  // Lo primero cubre la placa que aparece a mitad del clip; lo segundo, la que el recorte
  // a 9:16 elimina de los bordes (sobre un 16:9 sobrevive un tercio del ancho).
  const efect = cut ? Math.min(dur||60, 60) : (dur||10);
  const marcas = [efect*0.1, efect*0.5, efect*0.9].map(function(s){ return Math.max(0, s).toFixed(2); });
  const frames = [];
  for (let i=0; i<marcas.length; i++){
    const p='/tmp/fr_'+chatId+'_'+i+'.jpg';
    cp.execSync('ffmpeg -y -ss '+marcas[i]+' -i '+outP+' -vframes 1 -q:v 2 '+p,{stdio:'pipe',maxBuffer:1024*1024*50});
    frames.push(p);
  }
  const fullP='/tmp/fr_'+chatId+'_full.jpg';
  cp.execSync('ffmpeg -y -ss '+marcas[0]+' -i '+inPath+' -vframes 1 -q:v 2 -vf "scale=1080:-2" '+fullP,{stdio:'pipe',maxBuffer:1024*1024*50});
  const v=await cloud('video','data:video/mp4;base64,'+fs.readFileSync(outP).toString('base64'));
  const urls=[];
  for (const p of frames.concat([fullP])){
    const f=await cloud('image','data:image/jpeg;base64,'+fs.readFileSync(p).toString('base64'));
    urls.push(f.secure_url);
  }
  // frameUrl sigue siendo el primer fotograma publicable: es el que genera los copys.
  return { videoUrl:v.secure_url, frameUrl:urls[0], frameUrls:urls.join(','), nFrames:urls.length };
}`;

const LLAMADA_VIEJA = "const r=await normalizar(inP, chatId, false);";
const LLAMADA_NUEVA = "const r=await normalizar(inP, chatId, false, dur);";
const RETORNO_VIEJO = "return [{ json:{ chatId, tooLong:false, dur: dur?Math.round(dur):null, videoUrl:r.videoUrl, frameUrl:r.frameUrl } }];";
const RETORNO_NUEVO = "return [{ json:{ chatId, tooLong:false, dur: dur?Math.round(dur):null, videoUrl:r.videoUrl, frameUrl:r.frameUrl, frameUrls:r.frameUrls, nFrames:r.nFrames } }];";

// Los DOS nodos que normalizan llevan la misma función. «Video: cortar» es la rama del
// video de más de 60 s, que llega por un callback y es una ejecución aparte: antes salía
// directo a la generación de copys, de modo que el video recortado se publicaba sin pasar
// por ninguna detección visual. Es el mismo agujero que este cambio viene a cerrar.
const CORTAR = porNombre.get("Video: cortar");
if (!CORTAR) fallos.push("falta el nodo «Video: cortar»");

for (const nodo of [PROC, CORTAR].filter(Boolean)) {
  let js = nodo.parameters.jsCode;
  if (!js.includes(NORMALIZAR_VIEJO)) {
    fallos.push(`«${nodo.name}» no tiene la función normalizar esperada`);
    continue;
  }
  js = js.replace(NORMALIZAR_VIEJO, NORMALIZAR_NUEVO);
  nodo.parameters.jsCode = js;
}

// «Video: procesar»: ya tiene `dur` calculado
let js = PROC.parameters.jsCode;
for (const [viejo, nuevo] of [[LLAMADA_VIEJA, LLAMADA_NUEVA], [RETORNO_VIEJO, RETORNO_NUEVO]]) {
  if (!js.includes(viejo)) { fallos.push(`no encuentro en «Video: procesar»: ${viejo.slice(0, 50)}…`); continue; }
  js = js.replace(viejo, nuevo);
}
PROC.parameters.jsCode = js;

// «Video: cortar»: no tenía `dur`; lo calcula con la misma función que ya define
if (CORTAR) {
  let jc = CORTAR.parameters.jsCode;
  const VIEJO_C = [
    "const r=await normalizar(inP, chatId, true);",
    "return [{ json:{ chatId, videoUrl:r.videoUrl, frameUrl:r.frameUrl } }];",
  ].join("\n");
  const NUEVO_C = [
    "const dur=ffdur(inP);",
    "const r=await normalizar(inP, chatId, true, dur);",
    "return [{ json:{ chatId, videoUrl:r.videoUrl, frameUrl:r.frameUrl, " +
      "frameUrls:r.frameUrls, nFrames:r.nFrames } }];",
  ].join("\n");
  if (!jc.includes(VIEJO_C)) fallos.push("no encuentro el cierre de «Video: cortar»");
  else { CORTAR.parameters.jsCode = jc.replace(VIEJO_C, NUEVO_C); console.log("  ~ Video: cortar — 4 fotogramas y duración propia"); }
}

// ─── 2 · Video: HU8 visual — los cuatro fotogramas y el nuevo encuadre ────────
// del ITEM y no de un nodo con nombre: el mismo nodo sirve para las dos ramas
VIS.parameters.imageUrls = "={{ $json.frameUrls }}";
VIS.parameters.text = [
  "# ROL",
  "Sos el Compliance Sentinel visual de Postly para la marca Mary Kay.",
  "",
  "# QUÉ TE PASO",
  "Cuatro imágenes de un mismo video, en este orden:",
  "1, 2 y 3: tres instantes del video TAL COMO SE VA A PUBLICAR (formato vertical 9:16).",
  "4: el encuadre COMPLETO del video original, antes del recorte a vertical. Todo lo que se",
  "ve en la 4 y no se ve en las otras tres es lo que el recorte elimina.",
  "",
  "# TAREA",
  CRITERIO,
  "",
  "Aplicá ese criterio dos veces y por separado:",
  "- sobre las imágenes 1, 2 y 3 (lo que se publica) -> campo \"tiene_precio\";",
  "- sobre la imagen 4 (el encuadre original) -> si ahí hay un precio o promoción que NO",
  "  aparece en ninguna de las tres primeras, marcá \"precio_recortado\": true.",
  "",
  "# RESPUESTA",
  "Respondé ÚNICA y EXCLUSIVAMENTE con un objeto JSON válido, sin texto adicional y sin",
  "bloques de código markdown (no uses tres backticks). Estructura exacta:",
  '{"tiene_precio": false, "precio_recortado": true, "detalle": "qué detectaste y en qué imagen"}',
].join("\n");

// ─── 3 · Video: HU8 parsear — el campo nuevo ─────────────────────────────────
PARSE.parameters.jsCode = [
  "// Video: HU8 parsear — parsea la detección visual de Gemini (fail-open ante JSON inválido)",
  "const raw = ($('Video: HU8 visual').first().json.content.parts[0].text) || '';",
  "let parsed = { tiene_precio: false, precio_recortado: false, detalle: '' };",
  "try {",
  "  parsed = JSON.parse(raw.replace(/```json/gi, '').replace(/```/g, '').trim());",
  "} catch (e) { /* Gemini no devolvió JSON limpio -> no bloquear */ }",
  "// mismo idioma que «Video: parsear»: el origen es uno de los dos nodos que normalizan,",
  "// según el video haya venido entero o recortado desde el callback",
  "let src = null;",
  "try { const p = $('Video: procesar').first().json; if (p && p.videoUrl) src = p; } catch (e) {}",
  "if (!src) { try { const c = $('Video: cortar').first().json; if (c && c.videoUrl) src = c; } catch (e) {} }",
  "src = src || {};",
  "return [{ json: {",
  "  tiene_precio: parsed.tiene_precio === true,",
  "  precio_recortado: parsed.precio_recortado === true && parsed.tiene_precio !== true,",
  "  detalle: parsed.detalle || '',",
  "  secure_url: src.frameUrl,",
  "  nFrames: src.nFrames || 1,",
  "  // se reemiten para que los nodos siguientes no dependan de qué rama corrió",
  "  frameUrl: src.frameUrl,",
  "  videoUrl: src.videoUrl,",
  "  chatId: src.chatId",
  "} }];",
].join("\n");

// ─── 4 · la rama de aviso por recorte ────────────────────────────────────────
const uid = (() => { let i = 0; return () => `vm${(++i).toString().padStart(4, "0")}`; })();

function clonar(modelo, nombre, cambios, pos) {
  const n = JSON.parse(JSON.stringify(modelo));
  n.name = nombre; n.id = uid(); n.position = pos;
  delete n.webhookId;
  Object.assign(n.parameters, cambios);
  return n;
}

const NUEVOS = [
  clonar(IF, "Video: ¿precio recortado?", {}, [3880, 780]),
  clonar(MSG, "Video: aviso de recorte", {
    text: "=✂️ *Ojo con el encuadre.*\n\nTu video tiene un precio o promoción en un borde que el " +
          "recorte a formato vertical (9:16) va a eliminar, así que no va a aparecer en el Reel." +
          "\n\n_Detalle:_ {{ $json.detalle }}\n\nSigo con la publicación. Si querías que esa placa " +
          "se viera, mandame el video ya en vertical.",
  }, [4120, 700]),
];
for (const n of NUEVOS) {
  if (porNombre.has(n.name)) { fallos.push(`el nodo «${n.name}» ya existe`); continue; }
  wf.nodes.push(n); porNombre.set(n.name, n);
}
// la condición del IF nuevo mira el otro campo
const cond = NUEVOS[0].parameters.conditions;
for (const c of (cond.conditions || [])) {
  c.id = "video-precio-recortado";
  c.leftValue = "={{ $json.precio_recortado }}";
}

function conectar(desde, salida, hacia) {
  wf.connections[desde] ??= { main: [] };
  const m = wf.connections[desde].main;
  while (m.length <= salida) m.push([]);
  const destinos = Array.isArray(hacia) ? hacia : [hacia];
  m[salida] = destinos.map((node) => ({ node, type: "main", index: 0 }));
}

// ¿frame limpio? por false ya no va directo a analizar: pasa por el aviso de recorte
conectar("Video: ¿frame limpio?", 1, "Video: ¿precio recortado?");
// El aviso NO se encadena antes de la generación de copys: un nodo de Telegram emite la
// respuesta de su API y no el item que recibió, de modo que el siguiente perdería
// `frameUrl`. La rama «sí, hay precio recortado» se abre en dos: avisa y sigue en paralelo.
conectar("Video: ¿precio recortado?", 0, ["Video: aviso de recorte", "Video: analizar"]);
conectar("Video: ¿precio recortado?", 1, "Video: analizar");
if (wf.connections["Video: aviso de recorte"]) delete wf.connections["Video: aviso de recorte"];

// La rama del video recortado entra ahora por la detección, en vez de saltearla.
conectar("Video: cortar", 0, "Video: HU8 visual");

// Con el parseo reemitiendo `frameUrl`, la generación de copys vuelve a leerlo del item:
// así funciona igual venga por «Video: procesar» o por «Video: cortar».
const ANALIZAR = porNombre.get("Video: analizar");
if (!ANALIZAR) fallos.push("falta el nodo «Video: analizar»");
else {
  ANALIZAR.parameters.imageUrls = "={{ $json.frameUrl }}";
  console.log("  ~ Video: analizar — vuelve a leer frameUrl del item");
}

// ─── informe ─────────────────────────────────────────────────────────────────
console.log(`nodos: ${wf.nodes.length}`);
for (const n of NUEVOS) console.log(`  + ${n.name}`);
console.log(`  ~ Video: procesar — 4 fotogramas (3 del publicable + 1 del encuadre completo)`);
console.log(`  ~ Video: HU8 visual — recibe frameUrls; criterio de HU8 intacto: ` +
            `${VIS.parameters.text.includes(CRITERIO)}`);
if (!VIS.parameters.text.includes(CRITERIO)) fallos.push("el prompt de video perdió el criterio de HU8");

if (fallos.length) { console.error("\n*** FALLOS ***\n  " + fallos.join("\n  ")); process.exit(1); }
if (!process.argv.includes("--escribir")) {
  console.log("\n(dry-run: no se escribió el JSON. Agregá --escribir para aplicar)");
  process.exit(0);
}
writeFileSync(RUTA, JSON.stringify(wf, null, 2), "utf-8");
console.log(`\nescrito: ${RUTA}`);
