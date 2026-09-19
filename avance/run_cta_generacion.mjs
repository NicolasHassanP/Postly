// Mide el llamado a la acción que produce el generador, antes y después de la corrección.
//
// POR QUÉ EXISTE
// Las Pautas de la marca definen el mensaje comercial por el acto y no por la cifra, y lo
// ejemplifican con «¡Pregúntame cómo puedes conseguirlo!» (p. 3), que no lleva monto. Hasta
// el 19 de septiembre de 2026 los cuatro prompts de generación exigían que las tres opciones
// terminaran en una invitación a contactar a la consultora. El sistema producía entonces, por
// diseño y en cada publicación, la forma que su propio Módulo Centinela no audita.
//
// El §5.4 lo afirmaba leyendo el prompt. Leer el prompt establece la instrucción, no la
// conducta: un modelo probabilístico puede desobedecerla, y de hecho la Figura 14 del trabajo
// muestra una opción «Informativa» sin ese cierre. Este script mide la conducta, en los dos
// estados del sistema, sobre las mismas imágenes y en la misma corrida.
//
// QUÉ MIDE
// Para cada imagen, llama al modelo dos veces: con el prompt anterior a la corrección y con
// el vigente. Sobre cada una de las tres opciones que devuelve aplica un detector léxico
// declarado —las expresiones de la constante SOLICITUD, más abajo— y cuenta cuántas cierran
// con una solicitud de contacto o de compra. La unidad es la opción, no la corrida: tres
// opciones por imagen y por estado.
//
// La invitación a comentar se cuenta aparte. La fuente define el mensaje comercial por la
// invitación a comprar o a contactar; pedir un comentario no es ninguna de las dos, aunque el
// prompt anterior la ofrecía como ejemplo de cierre válido. Mezclarlas inflaría el resultado.
//
// QUÉ NO MIDE
// La calidad del copy. Retirar el cierre de contacto puede empeorarlo como pieza de
// marketing, y este trabajo no tiene instrumento para evaluar eso (§6.1, OE2).
//
// LOS DOS PROMPTS
// No se transcriben acá: se extraen del workflow. El paso `--extraer` escribe
// `Prompts_generacion.json` con los cuatro prompts en sus dos estados y el SHA-256 de cada
// uno, leyendo el JSON vigente y el anterior a la corrección, que es el padre del commit que
// la introdujo. Así el lector comprueba que lo ejecutado es lo desplegado, sin acceso a la
// instancia, igual que hace `verificar_patrones_desplegados.mjs` con los detectores.
//
// Uso:  node run_cta_generacion.mjs --extraer "../workflows/Postly - Entrega Final Sprint 1 v2.json" <wf_previo.json>
//       GEMINI_API_KEY=<clave> node run_cta_generacion.mjs [n_imagenes]
// Lee:  Prompts_generacion.json + evidencia/casos_imagen/V11..V20.jpg (los casos LIMPIO)
// Escribe: CTA_generacion_resultados.csv

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const PROMPTS = join(AQUI, "Prompts_generacion.json");
const SALIDA = join(AQUI, "CTA_generacion_resultados.csv");
const MODELO = "gemini-2.5-flash";

const NODOS = [
  { nodo: "Analyze an image", rotulo: "imagen única (HU3/HU7)" },
  { nodo: "HU5: Generar copys", rotulo: "carrusel (HU5)" },
  { nodo: "Repost: Analizar imagen", rotulo: "re-publicación (HU12)" },
  { nodo: "Video: analizar", rotulo: "video (HU13)" },
];

const sha = (s) => createHash("sha256").update(s, "utf-8").digest("hex");

// ─── extracción de los dos estados del prompt ────────────────────────────────
if (process.argv.includes("--extraer")) {
  const [, , , vigente, previo] = process.argv;
  if (!vigente || !previo) {
    console.error("uso: --extraer <workflow_vigente.json> <workflow_previo.json>");
    process.exit(1);
  }
  const leer = (ruta) => {
    const wf = JSON.parse(readFileSync(ruta, "utf-8"));
    const porNombre = new Map(wf.nodes.map((n) => [n.name, n]));
    const out = {};
    for (const { nodo } of NODOS) {
      const n = porNombre.get(nodo);
      if (!n) { console.error(`falta el nodo «${nodo}» en ${ruta}`); process.exit(1); }
      out[nodo] = { prompt: n.parameters.text, sha256: sha(n.parameters.text) };
    }
    return out;
  };
  const doc = {
    _: "Prompts de generación del workflow «Postly - Entrega Final Sprint 1 v2», en sus dos " +
       "estados. No contiene credenciales, webhookId ni URL de la instancia.",
    antes: leer(previo),
    despues: leer(vigente),
  };
  writeFileSync(PROMPTS, JSON.stringify(doc, null, 2), "utf-8");
  for (const { nodo, rotulo } of NODOS) {
    const a = doc.antes[nodo].sha256.slice(0, 12), d = doc.despues[nodo].sha256.slice(0, 12);
    console.log(`  ${rotulo.padEnd(26)} ${a} -> ${d}${a === d ? "   *** SIN CAMBIO ***" : ""}`);
  }
  console.log(`\nescrito: ${PROMPTS}`);
  process.exit(0);
}

// ─── el detector de solicitud, declarado ─────────────────────────────────────
// Léxico y determinista, como el del canal textual del Módulo Centinela. Cubre las formas
// que el prompt anterior ofrecía como ejemplo y las que el corpus de campo registra.
//
// Las formas van con y sin tilde y en las dos conjugaciones, la rioplatense y la peninsular
// o mexicana, porque el modelo alterna entre ellas dentro de una misma corrida. Escribir
// `\bescrib` alcanzaría para «escribime» y dejaría pasar «escríbeme», que es el mismo acto:
// es la clase de omisión léxica que el §5.1 documenta en el propio Módulo Centinela, y acá
// costó un falso negativo antes de corregirla.
const SOLICITUD = [
  /\bescr[ií]b(?:e|i)(?:me|nos|le)?\b/i,
  /\bm[áa]nd(?:a|á)(?:me|nos)?\b/i,
  /\benv[ií](?:a|á)(?:me|nos)?\b/i,
  /\bcons[úu]lt(?:a|á)(?:me|nos)?\b/i,
  /\bpreg[úu]nt(?:a|á)(?:me|nos)?\b/i,
  /\bcont[áa]ct(?:a|á)(?:me|nos|te)?\b/i,
  /\bhablemos\b/i,
  /\bcoordin(?:amos|emos)\b/i,
  /\bagend(?:a|á)(?:me)?\s+(?:tu|una)\b/i,
  /\b(?:un\s+)?(?:MD|DM)\b/,
  /\bmensaje\s+(?:directo|privado)\b/i,
  /\b(?:escribi|manda|envia|mandá|enviá)\w*\s+(?:un\s+)?mensaje\b/i,
  /\bc[oó]mo\s+(?:conseguirlo|conseguirla|obtenerlo|comprarlo|adquirirlo)\b/i,
  /\bpuedes?\s+conseguirlo\b/i,
  /\bp[ií]d(?:e|a)(?:lo|la|me)\b/i,
  /\bped[ií](?:lo|la|melo|mela)\b/i,
  /\bcompr(?:a|á)(?:lo|la|me)?\b/i,
  /\badqui(?:rilo|rila|[ée]relo|[ée]rela)\b/i,
  /\breserv(?:a|á)(?:lo|la)?\s+(?:el|la|tu)\b/i,
  /\bte\s+espero\s+en\s+(?:mi|el|la)\b/i,
  /\bll[eé]va(?:telo|tela)\b/i,
  /\bsum(?:ate|ate)\s+a\b/i,
];
const COMENTARIO = [
  /\bdej(?:ame|á|a)\s+(?:tu\s+)?comentario\b/i,
  /\bcoment(?:a|á)(?:me|nos)?\b/i,
  /\bcu[ée]nt(?:a|á)(?:me|nos)\b/i,
  /\bcont(?:a|á)(?:me|nos)\b/i,
];
const marca = (txt, pats) => pats.filter((p) => p.test(txt)).map((p) => String(p));

// ─── CSV ─────────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const rows = []; let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\r") { /* nada */ }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1 || (r[0] || "").trim());
}
const toCSV = (rows) => rows.map((r) => r.map((v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}).join(",")).join("\n");

function resumir(filas) {
  const r = { antes: { total: 0, con: 0, com: 0 }, despues: { total: 0, con: 0, com: 0 } };
  for (const f of filas.slice(1)) {
    if (f[2] === "-" || !r[f[1]]) continue;
    r[f[1]].total++;
    if (f[3] === "SI") r[f[1]].con++;
    if (f[4] === "SI") r[f[1]].com++;
  }
  console.log("\n── resumen (unidad: la opción) ──");
  for (const estado of ["antes", "despues"]) {
    const x = r[estado];
    if (!x.total) continue;
    console.log(`  ${estado.padEnd(8)} solicitud de contacto o compra: ${x.con}/${x.total}` +
      `   ·   invitación a comentar: ${x.com}/${x.total}`);
  }
  return r;
}

// ─── re-puntuación sobre los textos ya guardados, sin gastar cupo ────────────
// El detector es léxico y por lo tanto corregible; los textos que el modelo devolvió, no.
// Separar las dos cosas permite arreglar una omisión del instrumento sin volver a llamar
// al modelo, y deja el cambio auditable: la corrida es la misma, la lectura cambia.
if (process.argv.includes("--rescorar")) {
  const ruta = join(AQUI, "CTA_generacion_resultados.csv");
  if (!existsSync(ruta)) { console.error(`falta ${ruta}`); process.exit(1); }
  const filas = parseCSV(readFileSync(ruta, "utf-8"));
  let cambios = 0;
  for (const f of filas.slice(1)) {
    if (f[2] === "-") continue;
    const s = marca(f[6], SOLICITUD), c = marca(f[6], COMENTARIO);
    const nuevoS = s.length ? "SI" : "NO", nuevoC = c.length ? "SI" : "NO";
    if (nuevoS !== f[3] || nuevoC !== f[4]) {
      console.log(`  ~ ${f[0]}/${f[1]}/${f[2]}: solicitud ${f[3]}->${nuevoS}, comentario ${f[4]}->${nuevoC}`);
      cambios++;
    }
    f[3] = nuevoS; f[4] = nuevoC; f[5] = [...s, ...c].join(" | ");
  }
  console.log(`\n  filas re-puntuadas que cambiaron: ${cambios}`);
  resumir(filas);
  writeFileSync(ruta, toCSV(filas), "utf-8");
  console.log(`\nescrito: ${ruta}`);
  process.exit(0);
}

// ─── clave ───────────────────────────────────────────────────────────────────
function clave() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  for (const ruta of [join(AQUI, ".env"), join(AQUI, "..", ".env")]) {
    if (!existsSync(ruta)) continue;
    for (const linea of readFileSync(ruta, "utf-8").split(/\r?\n/)) {
      const m = linea.match(/^\s*(GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.*?)\s*$/);
      if (m) return m[2].replace(/^["']|["']$/g, "");
    }
  }
  console.error("Falta GEMINI_API_KEY (variable de entorno o entrada en .env).");
  process.exit(1);
}
const API_KEY = clave();

// ─── llamada, con la misma política de cupo que run_compliance_vision.mjs ────
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
class CupoDiarioAgotado extends Error {
  constructor() { super("cupo diario del nivel gratuito agotado"); }
}

async function generar(prompt, rutaImagen) {
  const b64 = readFileSync(rutaImagen).toString("base64");
  const cuerpo = {
    contents: [{
      parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: b64 } }],
    }],
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`;
  for (let intento = 1; intento <= 8; intento++) {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": API_KEY },
      body: JSON.stringify(cuerpo),
    });
    if (r.ok) {
      const j = await r.json();
      return j?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
    }
    const detalle = await r.text();
    if (r.status === 429 && /RequestsPerDay/i.test(detalle)) throw new CupoDiarioAgotado();
    if (r.status === 429 || r.status >= 500) {
      const sug = detalle.match(/"retryDelay"\s*:\s*"(\d+)s"/);
      const espera = Math.min(90000, sug ? (Number(sug[1]) + 4) * 1000 : 5000 * intento);
      console.log(`     ${r.status}; reintento ${intento}/8 en ${espera / 1000} s`);
      await dormir(espera);
      continue;
    }
    throw new Error(`${r.status} ${detalle.slice(0, 300)}`);
  }
  throw new Error("agotados los reintentos");
}

// Mismo parseo tolerante que el nodo «Parsear copys»: el modelo a veces envuelve el JSON.
function opciones(bruto) {
  const m = bruto.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const j = JSON.parse(m[0]);
    const o = [j.opcion1, j.opcion2, j.opcion3];
    return o.every((x) => typeof x === "string" && x.trim()) ? o : null;
  } catch { return null; }
}

// ─── corrida ─────────────────────────────────────────────────────────────────
if (!existsSync(PROMPTS)) {
  console.error(`Falta ${PROMPTS}. Generalo con --extraer.`);
  process.exit(1);
}
const doc = JSON.parse(readFileSync(PROMPTS, "utf-8"));
const NODO = "Analyze an image"; // el flujo de imagen única, que es el que estos casos ejercen

const N = Number(process.argv[2] || 5);
const CASOS = Array.from({ length: N }, (_, i) => `V${String(11 + i).padStart(2, "0")}`);
const DIR_IMG = join(AQUI, "evidencia", "casos_imagen");

const filas = [[
  "Caso", "Estado", "Opcion", "Solicitud_contacto_o_compra", "Invitacion_a_comentar",
  "Patrones", "Texto",
]];
const resumen = { antes: { total: 0, con: 0, com: 0 }, despues: { total: 0, con: 0, com: 0 } }; // progreso en consola
let abortado = null;

for (const caso of CASOS) {
  const img = join(DIR_IMG, `${caso}.jpg`);
  if (!existsSync(img)) { console.log(`  ${caso}: sin archivo, se saltea`); continue; }
  for (const estado of ["antes", "despues"]) {
    if (abortado) break;
    process.stdout.write(`  ${caso} / ${estado} ... `);
    let bruto;
    try {
      bruto = await generar(doc[estado][NODO].prompt, img);
    } catch (e) {
      if (e instanceof CupoDiarioAgotado) { abortado = e.message; console.log("CUPO DIARIO"); break; }
      throw e;
    }
    const ops = opciones(bruto);
    if (!ops) {
      console.log("respuesta no parseable");
      filas.push([caso, estado, "-", "", "", "", bruto.slice(0, 400)]);
      continue;
    }
    let con = 0, com = 0;
    ops.forEach((texto, i) => {
      const s = marca(texto, SOLICITUD), c = marca(texto, COMENTARIO);
      if (s.length) con++;
      if (c.length) com++;
      filas.push([caso, estado, `opcion${i + 1}`, s.length ? "SI" : "NO",
        c.length ? "SI" : "NO", [...s, ...c].join(" | "), texto]);
    });
    resumen[estado].total += 3;
    resumen[estado].con += con;
    resumen[estado].com += com;
    console.log(`solicitud ${con}/3 · comentario ${com}/3`);
    await dormir(4000); // el tope por minuto del nivel gratuito
  }
  if (abortado) break;
}

writeFileSync(SALIDA, toCSV(filas), "utf-8");
resumir(filas);
if (abortado) console.log(`\n*** corrida incompleta: ${abortado} ***`);
console.log(`\nescrito: ${SALIDA}`);
