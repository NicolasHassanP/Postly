// Genera el material pareado del Estudio 1 de OE2 (PROTOCOLO-OE2.md): para cada imagen de
// producto, el copy del prompt DESPLEGADO de Postly (nodo "Analyze an image" del workflow
// "Postly - Entrega Final Sprint 1 v2", gemini-2.5-flash, transcrito verbatim más abajo) y
// el de un prompt genérico, con el mismo modelo, la misma temperatura por defecto.
//
// El prompt desplegado devuelve TRES opciones (tonos) en una sola llamada. Para el pareo se
// usa UNA por imagen —es la que compite contra el genérico—, asignada por ROTACIÓN FIJA
// (Informativo, Vendedor, Divertido, …) antes de generar nada: así el tono que se compara no
// depende de cuál salió mejor. Con 12 imágenes son 4 de cada tono.
//
// La letra A/B de cada fila también se fija de antemano, por paridad del índice de la
// imagen (par → Postly = A; impar → Postly = B), no por sorteo en el momento: cualquiera
// puede reconstruir la asignación leyendo este archivo, y no se decide nada después de ver
// un resultado.
//
// ── Procedencia de las imágenes (léase antes de correr) ──────────────────────────────────
// El protocolo pide "12 imágenes de producto, de las que las consultoras aportaron". La
// tercera auditoría de la tesis encontró una vez fotos atribuidas al equipo que en realidad
// eran arte oficial de catálogo de la marca, no material propio (N3-02/N3-10, corregido con
// caso real R01). Para que eso no se repita acá, este script NO elige una carpeta de
// imágenes por su cuenta: exige, dentro de la carpeta que se le pase, un manifiesto
// `Imagenes_manifiesto.csv` con columnas `Imagen,Producto,Aportada_por` que declare de quién
// es cada foto (código de consultora, o "catálogo oficial de la marca" si lo es). Sin ese
// manifiesto, el script se niega a correr.
//
// Uso:  GEMINI_API_KEY=<clave> node run_copy_pareado.mjs [carpeta_imagenes]
//       (la clave también se lee de .env o de ../.env si está definida allí)
// Lee:  <carpeta>/Imagenes_manifiesto.csv + las imágenes que nombra (12, .jpg/.jpeg/.png)
// Escribe: OE2_copys_material.csv (en esta carpeta, junto al resto de OE2)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const DIR = join(AQUI, process.argv[2] || "oe2_material_fuente");
const MODELO = "gemini-2.5-flash";
const SALIDA = join(AQUI, "OE2_copys_material.csv");
const TONOS = ["Informativo", "Vendedor", "Divertido"];

// ─── Prompt VERBATIM del nodo "Analyze an image" (genera los tres tonos) ─────────────────
const PROMPT_POSTLY = `# ROL
Actúa como Postly, un experto en Marketing Digital y Copywriting, especializado en el sector de belleza y cuidado de la piel de alta gama, con foco específico en la marca Mary Kay. Tu objetivo es ayudar a una Consultora de Belleza Independiente a brillar en Instagram.

# TAREA
Analiza detenidamente la imagen adjunta. Identifica los productos Mary Kay visibles (su tipo, función y línea si es posible, ej: TimeWise, Clear Proof, MKMen). Luego, basándote *únicamente* en lo visual y en el conocimiento general de la marca (sin inventar datos técnicos), genera tres (3) opciones de copy para un post de Instagram.

# REGLAS CRÍTICAS DE NEGOCIO (INCUMPLIMIENTO = ERROR)
1. **PROHIBIDO INVENTAR PRECIOS:** No menciones montos, signos de pesos ($) ni divisas.
2. **PROHIBIDO INVENTAR DESCUENTOS:** No uses palabras como "Oferta", "Promoción", "X% OFF", ni digas que un producto es "barato" o "económico".
3. **NO AGREGUES FIRMA:** No incluyas ninguna firma ni la línea "-- Consultora de Belleza Independiente Mary Kay --"; del agregado de la firma se encarga el sistema automáticamente después.
4. **PROHIBIDO INVITAR A COMPRAR O A CONTACTAR:** Ninguna de las tres opciones puede cerrar —ni incluir en ningún lugar— una invitación a contactar o a comprar: nada de "Escribime un MD", "Mandame un mensaje", "Preguntame cómo conseguirlo", "Consultame", "Pedilo ya", "Escribime y coordinamos" ni equivalentes, en ningún tono. Las Pautas de la marca consideran comercial todo mensaje que invite a comprar o a contactar, y estos copys se publican en el feed. Cerrá con información, con una recomendación de uso o con una pregunta abierta que no pida contacto ni compra.

# ESTRUCTURA DE LA RESPUESTA
Genera tres opciones claramente separadas con los siguientes enfoques:

---
## OPCIÓN 1: TONO INFORMATIVO (EL EXPERTO)
- **Foco:** Educación y Beneficios.
- **Estilo:** Profesional, claro, centrado en la ciencia del cuidado de la piel o los ingredientes clave (ej: "Ayuda a combatir los signos de la edad", "Hidratación profunda"). Explica *para qué sirve* el producto de la foto. Usa emojis sutiles y profesionales.

---
## OPCIÓN 2: TONO VENDEDOR (EL IMPULSOR)
- **Foco:** Conversión y Deseo.
- **Estilo:** Persuasivo, aspiracional, centrado en los *resultados* y en el sentimiento de "merecerlo". Usa emojis que denoten brillo, lujo y acción.

---
## OPCIÓN 3: TONO DIVERTIDO (EL AMIGO)
- **Foco:** Engagement y Relatabilidad.
- **Estilo:** Moderno, fresco, con onda de "amiga a amiga". Usá referencias a situaciones cotidianas (ej: "Cuando necesitás un spa en casa", "Tu aliado para los lunes"). Incluí más emojis, hashtags de tendencia y un tono relajado.
---

# NOTAS PARA LA IA
- Si la imagen es borrosa o no identificas el producto, genera copys genéricos sobre "Cuidado de la piel Mary Kay" o "Belleza que te empodera". Tambien podes investigar para ver que producto es, no inventes nombres.
- Usa hashtags relevantes al final de cada copy (ej: #MaryKayArgentina #CuidadoDeLaPiel #BellezaIndependiente).

---
#INSTRUCCIÓN DE FORMATO CRÍTICA:
Tu respuesta debe ser ÚNICA Y EXCLUSIVAMENTE un objeto JSON válido, sin ningún texto adicional, sin saludos y sin bloques de código Markdown (no uses \`\`\`json). La estructura exacta debe ser esta:
{
"opcion1": "Aquí el texto informativo con emojis y hashtags",
"opcion2": "Aquí el texto vendedor con emojis y hashtags",
"opcion3": "Aquí el texto divertido con emojis y hashtags"
}`;

// El texto exacto que Estudio 1 del protocolo fija como prompt de control.
const PROMPT_GENERICO = "Escribí un pie de foto para esta imagen de producto para Instagram.";

// ─── Clave ────────────────────────────────────────────────────────────────────────────────
function clave() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  for (const ruta of [join(AQUI, ".env"), join(AQUI, "..", ".env"), join(AQUI, "..", "..", ".env")]) {
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

// ─── CSV (mismo parser/escritor que el resto del harness) ─────────────────────────────────
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

// ─── Manifiesto de procedencia: obligatorio, sin default silencioso ───────────────────────
const RUTA_MANIFIESTO = join(DIR, "Imagenes_manifiesto.csv");
if (!existsSync(DIR) || !existsSync(RUTA_MANIFIESTO)) {
  console.error(`\nFalta el manifiesto de procedencia: ${RUTA_MANIFIESTO}`);
  console.error(`Este script no elige imágenes por su cuenta. Creá la carpeta con 12`);
  console.error(`imágenes de producto y un "Imagenes_manifiesto.csv" con columnas`);
  console.error(`Imagen,Producto,Aportada_por (código de consultora, o "catálogo oficial`);
  console.error(`de la marca" si así es). Ver la nota de procedencia al inicio de este`);
  console.error(`archivo: la tercera auditoría ya encontró una vez fotos mal atribuidas.`);
  process.exit(1);
}
const manifiesto = parseCSV(readFileSync(RUTA_MANIFIESTO, "utf-8"));
const MH = Object.fromEntries(manifiesto[0].map((h, i) => [h.trim(), i]));
for (const col of ["Imagen", "Producto", "Aportada_por"]) {
  if (MH[col] === undefined) {
    console.error(`El manifiesto no tiene la columna "${col}".`);
    process.exit(1);
  }
}
const imagenes = manifiesto.slice(1).filter(f => (f[MH.Imagen] || "").trim());
if (imagenes.length !== 12) {
  console.error(`El protocolo pide 12 imágenes; el manifiesto declara ${imagenes.length}.`);
  console.error(`Corregí el manifiesto antes de correr —no se generan de más ni de menos.`);
  process.exit(1);
}
for (const f of imagenes) {
  const ruta = join(DIR, f[MH.Imagen]);
  if (!existsSync(ruta)) {
    console.error(`El manifiesto nombra "${f[MH.Imagen]}" y ese archivo no está en ${DIR}.`);
    process.exit(1);
  }
}

// ─── Llamada al modelo, con el mismo reintento ante 429/5xx del resto del harness ─────────
const dormir = ms => new Promise(r => setTimeout(r, ms));
class CupoDiarioAgotado extends Error {
  constructor() { super("cupo diario del nivel gratuito agotado"); }
}

async function generar(rutaImagen, prompt) {
  const b64 = readFileSync(rutaImagen).toString("base64");
  const mime = /\.png$/i.test(rutaImagen) ? "image/png" : "image/jpeg";
  const cuerpo = {
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: b64 } }] }],
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
      return j?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ?? "";
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

function parsearOpciones(raw) {
  try {
    const j = JSON.parse(String(raw).replace(/```json/gi, "").replace(/```/g, "").trim());
    return { opcion1: j.opcion1 || "", opcion2: j.opcion2 || "", opcion3: j.opcion3 || "", json_valido: true };
  } catch {
    return { opcion1: "", opcion2: "", opcion3: "", json_valido: false, raw: String(raw ?? "") };
  }
}

// ─── Corrida, con reanudación (cada imagen cuesta 2 llamadas al modelo) ───────────────────
let filas = existsSync(SALIDA)
  ? parseCSV(readFileSync(SALIDA, "utf-8"))
  : [["Imagen", "Producto", "Aportada_por", "Sistema", "Tono", "Texto", "Etiqueta_AB", "JSON_valido"]];
if (existsSync(SALIDA)) console.log("[reanudando desde OE2_copys_material.csv]");
const yaHechas = new Set(filas.slice(1).map(f => f[0]));
const guardar = () => writeFileSync(SALIDA, toCSV(filas), "utf-8");

console.log(`\n[Estudio 1 de OE2 · material pareado · ${MODELO} · rotación fija de tono]\n`);
let cortado = false;
for (let i = 0; i < imagenes.length; i++) {
  const f = imagenes[i];
  const img = f[MH.Imagen], producto = f[MH.Producto], aportante = f[MH.Aportada_por];
  if (yaHechas.has(img)) { console.log(`  ${img}: ya generada, se conserva.`); continue; }

  const tono = TONOS[i % 3];
  const letraPostly = i % 2 === 0 ? "A" : "B";
  const letraGenerico = letraPostly === "A" ? "B" : "A";
  const ruta = join(DIR, img);

  try {
    console.log(`  ${img}  (${producto}, aportada por ${aportante})  → tono ${tono}, Postly=${letraPostly}`);
    const rawPostly = await generar(ruta, PROMPT_POSTLY);
    const op = parsearOpciones(rawPostly);
    if (!op.json_valido) {
      console.log(`     ** el modelo no devolvió JSON válido para ${img}; se guarda la respuesta cruda y se sigue`);
      filas.push([img, producto, aportante, "postly", tono, op.raw, letraPostly, "NO"]);
    } else {
      const texto = tono === "Informativo" ? op.opcion1 : tono === "Vendedor" ? op.opcion2 : op.opcion3;
      filas.push([img, producto, aportante, "postly", tono, texto, letraPostly, "si"]);
    }
    guardar();
    await dormir(15000); // 20 peticiones/minuto del nivel gratuito

    const textoGenerico = (await generar(ruta, PROMPT_GENERICO)).trim();
    filas.push([img, producto, aportante, "generico", "", textoGenerico, letraGenerico, "si"]);
    guardar();
    await dormir(15000);
  } catch (e) {
    if (!(e instanceof CupoDiarioAgotado)) throw e;
    console.log(`\n  Cupo diario del nivel gratuito agotado en ${img}.`);
    console.log(`  Generadas ${filas.length - 1} filas; lo hecho queda guardado en OE2_copys_material.csv.`);
    console.log("  Volvé a correr el script cuando el cupo se renueve y retoma desde ahí.");
    process.exitCode = 2;
    cortado = true;
    break;
  }
}
guardar();
if (!cortado) {
  console.log(`\n✔ Material completo: ${imagenes.length} imágenes, ${filas.length - 1} filas, en OE2_copys_material.csv`);
  console.log(`  Rotación de tono: ${TONOS.map((t, j) => `${t} en las imágenes con índice %3=${j}`).join(" · ")}`);
  console.log(`  Con esto armado, la sesión de evaluadoras usa las columnas Texto + Etiqueta_AB`);
  console.log(`  para imprimir el material a ciegas; las respuestas van en OE2_estudio1_respuestas.csv.`);
}
console.log();
