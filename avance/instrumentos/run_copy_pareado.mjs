// Genera el material pareado del Estudio 1 de OE2 (PROTOCOLO-OE2.md): para cada uno de 8
// productos —4 de imagen única, 4 de carrusel de 2 imágenes—, el copy del prompt DESPLEGADO
// de Postly y el de un prompt genérico, con el mismo modelo, la misma temperatura por
// defecto. Cada tipo usa el prompt real de ese tipo: "Analyze an image" para imagen única,
// "HU5: Generar copys" para carrusel —son dos nodos distintos en el workflow, y los dos se
// transcriben verbatim más abajo—.
//
// El prompt de imagen única devuelve TRES opciones (tonos) en una sola llamada; el de
// carrusel también. Para el pareo se usa UNA por producto —es la que compite contra el
// genérico—, asignada por ROTACIÓN FIJA (Informativo, Vendedor, Divertido, …) antes de
// generar nada, sobre los 8 productos en el orden en que aparecen en el manifiesto: así el
// tono que se compara no depende de cuál salió mejor.
//
// La letra A/B de cada fila también se fija de antemano, por paridad del índice del
// producto (par → Postly = A; impar → Postly = B), no por sorteo en el momento.
//
// ── Procedencia de las imágenes (léase antes de correr) ──────────────────────────────────
// El protocolo pide imágenes "de las que las consultoras aportaron". La tercera auditoría de
// la tesis encontró una vez fotos atribuidas al equipo que en realidad eran arte oficial de
// catálogo de la marca, no material propio (N3-02/N3-10, corregido con caso real R01). Para
// que eso no se repita acá, este script NO elige una carpeta de imágenes por su cuenta: exige,
// dentro de la carpeta que se le pase, un manifiesto `Imagenes_manifiesto.csv` con columnas
// `Carpeta,Producto,Aportada_por` —una fila por cada una de las 8 subcarpetas— que declare de
// quién es cada producto. Sin ese manifiesto, el script se niega a correr.
//
// Las subcarpetas se reconocen por su nombre, tolerando espacios ("Pub3 Carrusel" o
// "Pub3Carrusel" son lo mismo): `Pub<N>` para imagen única (debe tener 1 archivo) y
// `Pub<N>Carrusel` para carrusel (debe tener exactamente 2, y se ordenan alfabéticamente por
// nombre de archivo dentro de la carpeta —regla fija, declarada acá, no elegida al correr—).
//
// Uso:  GEMINI_API_KEY=<clave> node run_copy_pareado.mjs [carpeta_imagenes]
//       (la clave también se lee de .env o de ../.env si está definida allí)
//       Por defecto usa avance/ImagenesEstudio1 (al lado de avance/instrumentos).
// Lee:  <carpeta>/Imagenes_manifiesto.csv + las 8 subcarpetas Pub1..Pub4 y PubXCarrusel
// Escribe: OE2_copys_material.csv (en esta carpeta, junto al resto de OE2)

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const DIR = process.argv[2] ? join(AQUI, process.argv[2]) : join(AQUI, "..", "ImagenesEstudio1");
const MODELO = "gemini-2.5-flash";
const SALIDA = join(AQUI, "OE2_copys_material.csv");
const TONOS = ["Informativo", "Vendedor", "Divertido"];
const EXT_VALIDAS = [".jpg", ".jpeg", ".png"];

// ─── Prompt VERBATIM del nodo "Analyze an image" (imagen única, tres tonos) ──────────────
const PROMPT_POSTLY_IMAGEN = `# ROL
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

// ─── Prompt VERBATIM del nodo "HU5: Generar copys" (carrusel, tres tonos) ────────────────
const PROMPT_POSTLY_CARRUSEL = `# ROL
Actúa como Postly, experto en Marketing Digital y Copywriting para la marca Mary Kay, ayudando a una Consultora de Belleza Independiente a brillar en Instagram.

# TAREA
Te paso las imágenes de un CARRUSEL de Instagram (varias fotos de productos Mary Kay) en el orden definido. Analizalas EN CONJUNTO como una sola publicación y generá tres (3) opciones de copy para el carrusel.

# REGLAS CRÍTICAS (INCUMPLIMIENTO = ERROR)
1. PROHIBIDO INVENTAR PRECIOS: no menciones montos, signo $ ni divisas.
2. PROHIBIDO INVENTAR DESCUENTOS: no uses "Oferta", "Promoción", "% OFF", "barato" ni "económico".
3. NO agregues firma: el sistema la inyecta después.
4. **PROHIBIDO INVITAR A COMPRAR O A CONTACTAR:** Ninguna de las tres opciones puede cerrar —ni incluir en ningún lugar— una invitación a contactar o a comprar: nada de "Escribime un MD", "Mandame un mensaje", "Preguntame cómo conseguirlo", "Consultame", "Pedilo ya", "Escribime y coordinamos" ni equivalentes, en ningún tono. Las Pautas de la marca consideran comercial todo mensaje que invite a comprar o a contactar, y estos copys se publican en el feed. Cerrá con información, con una recomendación de uso o con una pregunta abierta que no pida contacto ni compra.

# ESTILOS
- OPCIÓN 1 — INFORMATIVA: educativa, beneficios e ingredientes, profesional.
- OPCIÓN 2 — VENDEDORA: persuasiva, aspiracional, centrada en el resultado.
- OPCIÓN 3 — DIVERTIDA: fresca, cercana, con onda y hashtags de tendencia.
Cada opción con emojis y hashtags relevantes (ej. #MaryKay #CuidadoDeLaPiel).

# FORMATO
Respondé ÚNICA y EXCLUSIVAMENTE con un JSON válido, sin markdown ni bloques de código:
{"opcion1":"...","opcion2":"...","opcion3":"..."}`;

// El texto exacto que Estudio 1 del protocolo fija como prompt de control, uno por tipo.
const PROMPT_GENERICO_IMAGEN = "Escribí un pie de foto para esta imagen de producto para Instagram.";
const PROMPT_GENERICO_CARRUSEL = "Escribí un pie de foto para este carrusel de imágenes de producto para Instagram.";

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

// ─── Descubrir los 8 productos por el nombre de la subcarpeta ─────────────────────────────
if (!existsSync(DIR)) {
  console.error(`\nNo existe la carpeta ${DIR}.`);
  process.exit(1);
}
const subcarpetas = readdirSync(DIR).filter(n => statSync(join(DIR, n)).isDirectory());
const productos = [];
for (const nombre of subcarpetas) {
  const compacto = nombre.replace(/\s+/g, "");
  const mCarrusel = compacto.match(/^Pub(\d+)Carrusel$/i);
  const mSimple = compacto.match(/^Pub(\d+)$/i);
  if (mCarrusel) productos.push({ carpeta: nombre, n: Number(mCarrusel[1]), tipo: "carrusel" });
  else if (mSimple) productos.push({ carpeta: nombre, n: Number(mSimple[1]), tipo: "imagen" });
}
productos.sort((a, b) => a.tipo === b.tipo ? a.n - b.n : (a.tipo === "imagen" ? -1 : 1));

const simples = productos.filter(p => p.tipo === "imagen");
const carruseles = productos.filter(p => p.tipo === "carrusel");
if (simples.length !== 4 || carruseles.length !== 4) {
  console.error(`\nSe esperan 4 subcarpetas "Pub<N>" y 4 "Pub<N>Carrusel"; hay ${simples.length} y ${carruseles.length}.`);
  console.error(`Encontradas: ${subcarpetas.join(", ") || "(ninguna)"}`);
  process.exit(1);
}

// ─── Manifiesto de procedencia: obligatorio, sin default silencioso ───────────────────────
const RUTA_MANIFIESTO = join(DIR, "Imagenes_manifiesto.csv");
if (!existsSync(RUTA_MANIFIESTO)) {
  console.error(`\nFalta el manifiesto de procedencia: ${RUTA_MANIFIESTO}`);
  console.error(`Este script no elige imágenes por su cuenta. Creá un "Imagenes_manifiesto.csv"`);
  console.error(`con columnas Carpeta,Producto,Aportada_por —una fila por cada una de estas 8:`);
  for (const p of productos) console.error(`    ${p.carpeta}`);
  console.error(`Aportada_por: código de consultora, o "catálogo oficial de la marca" si así es.`);
  console.error(`La tercera auditoría ya encontró una vez fotos mal atribuidas (N3-02/N3-10).`);
  process.exit(1);
}
const manifiesto = parseCSV(readFileSync(RUTA_MANIFIESTO, "utf-8"));
const MH = Object.fromEntries(manifiesto[0].map((h, i) => [h.trim(), i]));
for (const col of ["Carpeta", "Producto", "Aportada_por"]) {
  if (MH[col] === undefined) { console.error(`El manifiesto no tiene la columna "${col}".`); process.exit(1); }
}
const filasManifiesto = manifiesto.slice(1).filter(f => (f[MH.Carpeta] || "").trim());
const mapaManifiesto = Object.fromEntries(filasManifiesto.map(f => [f[MH.Carpeta].trim(), f]));
for (const p of productos) {
  if (!mapaManifiesto[p.carpeta]) {
    console.error(`El manifiesto no declara la carpeta "${p.carpeta}". Faltan filas.`);
    process.exit(1);
  }
}

// ─── Archivos de imagen dentro de cada subcarpeta, orden alfabético fijo ──────────────────
for (const p of productos) {
  const archivos = readdirSync(join(DIR, p.carpeta))
    .filter(f => EXT_VALIDAS.includes(extname(f).toLowerCase()))
    .sort();
  const esperados = p.tipo === "imagen" ? 1 : 2;
  if (archivos.length !== esperados) {
    console.error(`"${p.carpeta}" tiene ${archivos.length} imagen(es); se esperaban ${esperados}.`);
    process.exit(1);
  }
  p.archivos = archivos.map(f => join(DIR, p.carpeta, f));
  p.producto = mapaManifiesto[p.carpeta][MH.Producto];
  p.aportante = mapaManifiesto[p.carpeta][MH.Aportada_por];
}

// ─── Llamada al modelo, con el mismo reintento ante 429/5xx del resto del harness ─────────
const dormir = ms => new Promise(r => setTimeout(r, ms));
class CupoDiarioAgotado extends Error {
  constructor() { super("cupo diario del nivel gratuito agotado"); }
}

async function generar(rutasImagen, prompt) {
  const partesImagen = rutasImagen.map(ruta => {
    const b64 = readFileSync(ruta).toString("base64");
    const mime = /\.png$/i.test(ruta) ? "image/png" : "image/jpeg";
    return { inline_data: { mime_type: mime, data: b64 } };
  });
  const cuerpo = { contents: [{ parts: [{ text: prompt }, ...partesImagen] }] };
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

// ─── Corrida, con reanudación (cada producto cuesta 2 llamadas al modelo) ─────────────────
// Cada llamada al prompt de Postly devuelve los TRES tonos en una sola respuesta —no cuesta
// una llamada extra guardar los tres—. Uno de los tres, elegido por la rotación fija, es el
// que compite contra el genérico en el Estudio 1 (lleva letra A/B); los otros dos quedan sin
// letra y son, sin gasto de cuota aparte, el material del Estudio 2 (correspondencia de
// tono, PROTOCOLO-OE2.md): 8 conjuntos de tres copys, no 12 como preveía el diseño anterior.
let filas = existsSync(SALIDA)
  ? parseCSV(readFileSync(SALIDA, "utf-8"))
  : [["Producto", "Carpeta", "Tipo", "Aportada_por", "Sistema", "Tono", "Texto", "Etiqueta_AB", "Usado_Estudio1", "JSON_valido"]];
if (existsSync(SALIDA)) console.log("[reanudando desde OE2_copys_material.csv]");
const yaHechas = new Set(filas.slice(1).map(f => f[1])); // por Carpeta
const guardar = () => writeFileSync(SALIDA, toCSV(filas), "utf-8");

console.log(`\n[Estudio 1 y 2 de OE2 · material · ${MODELO} · 4 imagen + 4 carrusel · rotación fija de tono]\n`);
let cortado = false;
for (let i = 0; i < productos.length; i++) {
  const p = productos[i];
  if (yaHechas.has(p.carpeta)) { console.log(`  ${p.carpeta}: ya generada, se conserva.`); continue; }

  const tonoParEstudio1 = TONOS[i % 3];
  const letraPostly = i % 2 === 0 ? "A" : "B";
  const letraGenerico = letraPostly === "A" ? "B" : "A";
  const promptPostly = p.tipo === "imagen" ? PROMPT_POSTLY_IMAGEN : PROMPT_POSTLY_CARRUSEL;
  const promptGenerico = p.tipo === "imagen" ? PROMPT_GENERICO_IMAGEN : PROMPT_GENERICO_CARRUSEL;

  try {
    console.log(`  ${p.carpeta}  (${p.tipo}, "${p.producto}", aportada por ${p.aportante})  → par de Estudio 1: ${tonoParEstudio1}, Postly=${letraPostly}`);
    const rawPostly = await generar(p.archivos, promptPostly);
    const op = parsearOpciones(rawPostly);
    if (!op.json_valido) {
      console.log(`     ** el modelo no devolvió JSON válido para ${p.carpeta}; se guarda la respuesta cruda y se sigue`);
      filas.push([p.producto, p.carpeta, p.tipo, p.aportante, "postly", "", op.raw, letraPostly, "si", "NO"]);
    } else {
      // Los tres tonos, en el orden fijo Informativo/Vendedor/Divertido (opcion1/2/3).
      const tonosTexto = [["Informativo", op.opcion1], ["Vendedor", op.opcion2], ["Divertido", op.opcion3]];
      for (const [tono, texto] of tonosTexto) {
        const esElDeEstudio1 = tono === tonoParEstudio1;
        filas.push([p.producto, p.carpeta, p.tipo, p.aportante, "postly", tono, texto,
          esElDeEstudio1 ? letraPostly : "", esElDeEstudio1 ? "si" : "no", "si"]);
      }
    }
    guardar();
    await dormir(15000); // 20 peticiones/minuto del nivel gratuito

    const textoGenerico = (await generar(p.archivos, promptGenerico)).trim();
    filas.push([p.producto, p.carpeta, p.tipo, p.aportante, "generico", "", textoGenerico, letraGenerico, "si", "si"]);
    guardar();
    await dormir(15000);
  } catch (e) {
    if (!(e instanceof CupoDiarioAgotado)) throw e;
    console.log(`\n  Cupo diario del nivel gratuito agotado en ${p.carpeta}.`);
    console.log(`  Generadas ${filas.length - 1} filas; lo hecho queda guardado en OE2_copys_material.csv.`);
    console.log("  Volvé a correr el script cuando el cupo se renueve y retoma desde ahí.");
    process.exitCode = 2;
    cortado = true;
    break;
  }
}
guardar();
if (!cortado) {
  console.log(`\n✔ Material completo: ${productos.length} productos (4 imagen + 4 carrusel), ${filas.length - 1} filas, en OE2_copys_material.csv`);
  console.log(`  Rotación del par de Estudio 1 por índice %3: ${TONOS.join(" · ")}, repitiendo.`);
  console.log(`  Estudio 1: filas con Usado_Estudio1=si y Etiqueta_AB cargada -> Texto + Etiqueta_AB`);
  console.log(`  para imprimir a ciegas; respuestas en OE2_estudio1_respuestas.csv.`);
  console.log(`  Estudio 2: las filas Sistema=postly con los tres tonos por producto (8 conjuntos,`);
  console.log(`  no 12) son el material, sin costo de generación aparte; respuestas en OE2_estudio2_respuestas.csv.`);
}
console.log();
