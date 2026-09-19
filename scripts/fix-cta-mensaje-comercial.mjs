// Retira de los cuatro prompts de generación el llamado a la acción obligatorio, y lo prohíbe.
//
// POR QUÉ EXISTE
// Las Pautas de la marca definen el mensaje comercial por el acto y no por la cifra: una
// pieza informativa se vuelve comercial al agregarle una invitación a comprar o a contactar,
// y la propia fuente lo ejemplifica con «¡Pregúntame cómo puedes conseguirlo!» (p. 3), que
// no lleva ningún monto. Los cuatro prompts de generación traían esta regla:
//
//   4. **LLAMADO A LA ACCIÓN OBLIGATORIO (LAS 3 OPCIONES):** Cada una de las tres opciones
//      DEBE terminar SIEMPRE con un llamado a la acción que invite a contactar a la
//      consultora ... Ninguna opción puede quedar sin ese cierre de contacto.
//
// Es decir: el sistema producía por diseño, en cada publicación y en los tres tonos, la
// forma exacta que la fuente pone como ejemplo de mensaje comercial, mientras su Módulo
// Centinela auditaba solamente la referencia monetaria. Sobre la regla completa el sistema
// no reducía la exposición de la consultora: la introducía. Lo declaran el §5.4 y el Anexo D,
// y la recomendación 3 del §6.2 pedía corregirlo.
//
// QUÉ HACE
// Sustituye esa regla 4 por su contraria, en los cuatro nodos de generación, y retira de la
// OPCIÓN 2 («vendedora») la instrucción de cerrar con un CTA de contacto. No alcanza con
// borrar la regla: la tarea es de copywriting de marketing y el modelo agrega el cierre de
// contacto por defecto si nadie se lo prohíbe — el propio corpus de campo lo muestra, con
// once de quince pies de foto sin cifra terminando en una invitación a contactar.
//
// De las dos salidas que el §6.2 propone se aplica la estricta —retirarlo de los tres
// tonos— y no la de separar el destino. La fuente admite el mensaje comercial en la página
// de negocios de Facebook, pero el sistema publica el mismo copy en Instagram y en Facebook
// en una sola acción: conservarlo en una ruta y no en la otra exige dos textos por
// publicación, y eso es un cambio de producto que habría que medir aparte.
//
// DE PASO
// El prompt del carrusel («HU5: Generar copys») tenía la regla 4 insertada en medio de la
// sección «# FORMATO», partiendo la instrucción por la mitad: decía «Respondé», después la
// regla entera, y recién después «ÚNICA y EXCLUSIVAMENTE con un JSON válido». Queda unida.
//
// LO QUE ESTE CAMBIO NO TOCA
// Nada de lo que el Capítulo 5 mide. Las matrices de confusión evalúan al detector de
// referencias monetarias sobre casos de entrada, y el corpus de campo son piezas que
// escribieron las consultoras: ni unas ni otro dependen de lo que el generador agregue.
//
// Uso:  node scripts/fix-cta-mensaje-comercial.mjs [--escribir]
//       node scripts/deploy-local-n8n.mjs --deploy
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
const wf = JSON.parse(readFileSync(RUTA, "utf-8"));
const porNombre = new Map(wf.nodes.map((n) => [n.name, n]));
const fallos = [];

// ── el texto que sale y el que entra ─────────────────────────────────────────
const REGLA_VIEJA =
  "\n\n\n4. **LLAMADO A LA ACCIÓN OBLIGATORIO (LAS 3 OPCIONES):** Cada una de las tres " +
  "opciones DEBE terminar SIEMPRE con un llamado a la acción que invite a contactar a la " +
  'consultora (por ejemplo: "Escribime un MD 💬", "Dejame tu comentario 👇", "Mandame un ' +
  'mensaje y coordinamos"). Ninguna opción puede quedar sin ese cierre de contacto.\n';

const REGLA_NUEVA =
  "\n4. **PROHIBIDO INVITAR A COMPRAR O A CONTACTAR:** Ninguna de las tres opciones puede " +
  'cerrar —ni incluir en ningún lugar— una invitación a contactar o a comprar: nada de ' +
  '"Escribime un MD", "Mandame un mensaje", "Preguntame cómo conseguirlo", "Consultame", ' +
  '"Pedilo ya", "Escribime y coordinamos" ni equivalentes, en ningún tono. Las Pautas de la ' +
  "marca consideran comercial todo mensaje que invite a comprar o a contactar, y estos copys " +
  "se publican en el feed. Cerrá con información, con una recomendación de uso o con una " +
  "pregunta abierta que no pida contacto ni compra.\n";

const CTA_OPCION2 =
  'Usa un Call to Action (CTA) claro para que te contacten (ej: "Enviame un MD y armamos ' +
  'tu rutina ideal"). ';

// ── 1. los tres prompts de imagen, re-publicación y video ────────────────────
for (const nombre of ["Analyze an image", "Repost: Analizar imagen", "Video: analizar"]) {
  const n = porNombre.get(nombre);
  if (!n) { fallos.push(`falta el nodo «${nombre}»`); continue; }
  let t = n.parameters.text;

  if (t.includes(REGLA_NUEVA) && !t.includes(CTA_OPCION2)) {
    console.log(`  = «${nombre}» ya estaba corregido`);
    continue;
  }
  if (!t.includes(REGLA_VIEJA)) {
    fallos.push(`«${nombre}»: no aparece la regla 4 tal como se espera`);
    continue;
  }
  t = t.replace(REGLA_VIEJA, REGLA_NUEVA);

  if (!t.includes(CTA_OPCION2)) fallos.push(`«${nombre}»: no aparece el CTA de la OPCIÓN 2`);
  t = t.replace(CTA_OPCION2, "");

  n.parameters.text = t;
  console.log(`  ~ «${nombre}»: regla 4 invertida y CTA retirado de la OPCIÓN 2`);
}

// ── 2. el prompt del carrusel, que además tenía el «# FORMATO» partido ───────
const CARRUSEL_VIEJO =
  "3. NO agregues firma: el sistema la inyecta después.\n\n# ESTILOS\n" +
  "- OPCIÓN 1 — INFORMATIVA: educativa, beneficios e ingredientes, profesional.\n" +
  "- OPCIÓN 2 — VENDEDORA: persuasiva, aspiracional, con un CTA claro para que te contacten.\n" +
  "- OPCIÓN 3 — DIVERTIDA: fresca, cercana, con onda y hashtags de tendencia.\n" +
  "Cada opción con emojis y hashtags relevantes (ej. #MaryKay #CuidadoDeLaPiel).\n\n" +
  "# FORMATO\nRespondé \n4. **LLAMADO A LA ACCIÓN OBLIGATORIO (LAS 3 OPCIONES):** Cada una " +
  "de las tres opciones DEBE terminar SIEMPRE con un llamado a la acción que invite a " +
  'contactar a la consultora (por ejemplo: "Escribime un MD 💬", "Dejame tu comentario 👇", ' +
  '"Mandame un mensaje y coordinamos"). Ninguna opción puede quedar sin ese cierre de ' +
  "contacto.\n\nÚNICA y EXCLUSIVAMENTE con un JSON válido, sin markdown ni bloques de código:";

const CARRUSEL_NUEVO =
  "3. NO agregues firma: el sistema la inyecta después.\n" +
  REGLA_NUEVA.replace(/^\n/, "").replace(/\n$/, "") +
  "\n\n# ESTILOS\n" +
  "- OPCIÓN 1 — INFORMATIVA: educativa, beneficios e ingredientes, profesional.\n" +
  "- OPCIÓN 2 — VENDEDORA: persuasiva, aspiracional, centrada en el resultado.\n" +
  "- OPCIÓN 3 — DIVERTIDA: fresca, cercana, con onda y hashtags de tendencia.\n" +
  "Cada opción con emojis y hashtags relevantes (ej. #MaryKay #CuidadoDeLaPiel).\n\n" +
  "# FORMATO\nRespondé ÚNICA y EXCLUSIVAMENTE con un JSON válido, sin markdown ni bloques " +
  "de código:";

const hu5 = porNombre.get("HU5: Generar copys");
if (!hu5) {
  fallos.push("falta el nodo «HU5: Generar copys»");
} else if (hu5.parameters.text.includes(CARRUSEL_NUEVO)) {
  console.log("  = «HU5: Generar copys» ya estaba corregido");
} else if (!hu5.parameters.text.includes(CARRUSEL_VIEJO)) {
  fallos.push("«HU5: Generar copys»: el bloque de reglas/estilos/formato no es el esperado");
} else {
  hu5.parameters.text = hu5.parameters.text.replace(CARRUSEL_VIEJO, CARRUSEL_NUEVO);
  console.log("  ~ «HU5: Generar copys»: regla 4 invertida, CTA fuera de la OPCIÓN 2 " +
    "y «# FORMATO» reunido");
}

// ── 3. comprobación: que no quede ningún resto de la obligación ──────────────
for (const n of wf.nodes) {
  const s = JSON.stringify(n.parameters ?? {});
  if (s.includes("LLAMADO A LA ACCIÓN OBLIGATORIO"))
    fallos.push(`queda la obligación de CTA en «${n.name}»`);
  if (s.includes("cierre de contacto"))
    fallos.push(`queda la fórmula «cierre de contacto» en «${n.name}»`);
}

const conRegla = wf.nodes.filter((n) =>
  JSON.stringify(n.parameters ?? {}).includes("PROHIBIDO INVITAR A COMPRAR O A CONTACTAR"));
console.log(`\n  nodos de generación con la prohibición: ${conRegla.length}` +
  ` (${conRegla.map((n) => n.name).join(", ")})`);
if (conRegla.length !== 4) fallos.push(`se esperaban 4 nodos con la prohibición, hay ${conRegla.length}`);

if (fallos.length) { console.error("\n*** FALLOS ***\n  " + fallos.join("\n  ")); process.exit(1); }
if (!process.argv.includes("--escribir")) {
  console.log("\n(dry-run: no se escribió el JSON. Agregá --escribir para aplicar)");
  process.exit(0);
}
writeFileSync(RUTA, JSON.stringify(wf, null, 2), "utf-8");
console.log(`\nescrito: ${RUTA}`);
