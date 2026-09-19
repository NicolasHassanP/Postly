// Harness de validación — canal de imagen del Módulo Centinela (HU8).
//
// Ejerce el mismo modelo y el mismo prompt que el nodo "HU8: Detección visual" del
// workflow "Postly - Entrega Final Sprint 1 v2": gemini-2.5-flash, el prompt transcrito
// verbatim más abajo, y el mismo parseo tolerante a JSON sucio que hace el nodo
// "HU8: Parsear detección" (fail-open: si el modelo no devuelve JSON válido, no bloquea).
// La única diferencia con producción es el transporte de la imagen: el nodo la pasa por
// URL de Cloudinary y aquí va como inline_data en base64. El contenido que ve el modelo
// es el mismo.
//
// Uso:  GEMINI_API_KEY=<clave> node run_compliance_vision.mjs [casos_imagen]
//       (la clave también se lee de .env o de ../.env si está definida allí)
// Lee:  <dir>/Casos_Compliance_Imagen.csv + los .jpg que la planilla nombra
// Escribe: <dir>/Casos_Compliance_Imagen_resultados.csv

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const DIR = join(AQUI, process.argv[2] || "casos_imagen");
const MODELO = "gemini-2.5-flash";

// ─── Prompt VERBATIM del nodo "HU8: Detección visual" ────────────────────────
const PROMPT = `# ROL
Sos el Compliance Sentinel visual de Postly para la marca Mary Kay. Analizá la imagen adjunta.

# TAREA
Detectá si la imagen contiene CUALQUIER precio o promoción incrustada en los píxeles
(placa gráfica, etiqueta, cartel, texto sobre la foto). Considerá infractor:
- Montos o cifras de precio, símbolos de moneda ($, US$, AR$, ARS, USD).
- Listas de precios o tarifas.
- Texto promocional: "OFERTA", "PROMO", "PROMOCIÓN", "DESCUENTO", "X% OFF", "2x1",
  "LIQUIDACIÓN", "SALE", "REBAJA", "GRATIS", "ENVÍO GRATIS".

NO es infractor: nombres de productos, logos de Mary Kay, texto descriptivo sin precios,
números que claramente no son precios (ej. "SPF 30", "24h", "50 ml").

# RESPUESTA
Respondé ÚNICA y EXCLUSIVAMENTE con un objeto JSON válido, sin texto adicional y sin bloques
de código markdown (no uses tres backticks). Estructura exacta:
{"tiene_precio": true, "detalle": "qué detectaste y dónde"}
o, si está limpia:
{"tiene_precio": false, "detalle": ""}`;

// ─── Clave ───────────────────────────────────────────────────────────────────
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

// ─── CSV ─────────────────────────────────────────────────────────────────────
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

// ─── Llamada al modelo, con reintento ante 429/5xx ───────────────────────────
const dormir = ms => new Promise(r => setTimeout(r, ms));

class CupoDiarioAgotado extends Error {
  constructor() { super("cupo diario del nivel gratuito agotado"); }
}

async function detectar(rutaImagen) {
  const b64 = readFileSync(rutaImagen).toString("base64");
  const cuerpo = {
    contents: [{
      parts: [
        { text: PROMPT },
        { inline_data: { mime_type: "image/jpeg", data: b64 } },
      ],
    }],
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`;
  // El nivel gratuito tiene dos topes distintos y conviene no confundirlos. El de por
  // minuto se espera y se reintenta. El de POR DÍA no: cada reintento cuenta contra el
  // mismo cupo de 20, de modo que insistir consume las peticiones que necesitan los
  // casos que faltan. Ante el tope diario se aborta y se deja el trabajo hecho guardado,
  // para retomarlo cuando el cupo se renueve.
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
    if (r.status === 429 && /RequestsPerDay/i.test(detalle)) {
      throw new CupoDiarioAgotado();
    }
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

// Réplica del nodo "HU8: Parsear detección": fail-open ante JSON inválido.
//
// El fail-open es el comportamiento desplegado y por eso se replica, pero tiene una
// consecuencia sobre la auditabilidad que la octava auditoría marcó (M1): una respuesta
// vacía, bloqueada por el filtro de seguridad del modelo o con prosa delante del JSON queda
// registrada como "Publico", igual que un `tiene_precio: false` genuino. Sin la respuesta
// cruda, un negativo no se puede distinguir de un fallo de formato.
//
// Por eso se devuelve `raw` y se persiste en el archivo de resultados. Las corridas
// anteriores al 19 de septiembre de 2026 no lo guardaron y ese dato no se puede recuperar;
// el Anexo E.6 lo declara.
function parsearVeredicto(raw) {
  let p = { tiene_precio: false, detalle: "" };
  let jsonValido = true;
  try { p = JSON.parse(String(raw).replace(/```json/gi, "").replace(/```/g, "").trim()); }
  catch { jsonValido = false; /* el modelo no devolvió JSON limpio -> no bloquear */ }
  return {
    bloquea: p.tiene_precio === true,
    detalle: p.detalle || "",
    respuesta_cruda: String(raw ?? ""),
    json_valido: jsonValido,
  };
}

// ─── Corrida ─────────────────────────────────────────────────────────────────
// Si ya existe un archivo de resultados parcial se retoma desde ahi: cada caso cuesta una
// llamada al modelo y el nivel gratuito corta por cuota, de modo que la corrida tiene que
// poder reanudarse sin volver a pagar las inferencias ya hechas.
const SALIDA = join(DIR, "Casos_Compliance_Imagen_resultados.csv");
const ORIGEN = existsSync(SALIDA) ? SALIDA : join(DIR, "Casos_Compliance_Imagen.csv");
const filas = parseCSV(readFileSync(ORIGEN, "utf-8"));
const H = Object.fromEntries(filas[0].map((h, i) => [h.trim(), i]));
const guardar = () => writeFileSync(SALIDA, toCSV(filas), "utf-8");
if (ORIGEN === SALIDA) console.log("[reanudando desde el archivo de resultados parcial]");

let VP = 0, FP = 0, VN = 0, FN = 0;
let cortado = false;      // el cupo diario se agoto a mitad de la corrida
const fallos = [];

console.log(`\n[canal de imagen · ${MODELO} · prompt verbatim del nodo HU8]\n`);
for (let i = 1; i < filas.length; i++) {
  const f = filas[i];
  if (!f[H.ID]) continue;
  const clase = f[H.Clase_real].trim().toUpperCase();
  let bloquea, detalle, respuesta_cruda = "", json_valido = true;
  if ((f[H.Veredicto] || "").trim()) {           // caso ya resuelto en una corrida previa
    bloquea = (f[H.Resultado_obtenido] || "").toLowerCase().includes("bloque");
    detalle = f[H.Detalle_modelo] || "";
    respuesta_cruda = f[H.Respuesta_cruda] ?? "";
  } else {
    try {
      ({ bloquea, detalle, respuesta_cruda, json_valido } =
        parsearVeredicto(await detectar(join(DIR, f[H.Archivo]))));
    } catch (e) {
      if (!(e instanceof CupoDiarioAgotado)) throw e;
      guardar();
      const hechos = filas.slice(1).filter(x => (x[H.Veredicto] || "").trim()).length;
      console.log(`\n  Cupo diario del nivel gratuito agotado en ${f[H.ID]}.`);
      console.log(`  Puntuados ${hechos} de ${filas.length - 1}; lo hecho queda guardado.`);
      console.log("  Volvé a correr el script cuando el cupo se renueve y retoma desde ahí.");
      process.exitCode = 2;
      cortado = true;
      break;
    }
  }
  const veredicto = clase === "INFRACTOR" ? (bloquea ? "VP" : "FN") : (bloquea ? "FP" : "VN");
  f[H.Resultado_obtenido] = bloquea ? "Bloqueo" : "Publico";
  f[H.Detalle_modelo] = detalle;
  f[H.Veredicto] = veredicto;
  // La respuesta cruda, para que un negativo sea distinguible de un fallo de formato (M1).
  if (H.Respuesta_cruda === undefined) {
    H.Respuesta_cruda = filas[0].length;
    filas[0].push("Respuesta_cruda");
    filas[0].push("JSON_valido");
    H.JSON_valido = filas[0].length - 1;
  }
  f[H.Respuesta_cruda] = respuesta_cruda;
  f[H.JSON_valido] = json_valido ? "si" : "NO";
  if (!json_valido)
    console.log(`       ** ${f[H.ID]}: el modelo no devolvió JSON válido; fail-open -> Publico`);
  if (veredicto === "VP") VP++; else if (veredicto === "FP") FP++;
  else if (veredicto === "VN") VN++; else FN++;
  if (veredicto === "FN" || veredicto === "FP")
    fallos.push({ id: f[H.ID], veredicto, forma: f[H.Forma_de_incrustacion], detalle });
  console.log(`  ${f[H.ID]}  ${clase.padEnd(9)} -> ${(bloquea ? "Bloqueo" : "Publico").padEnd(8)} ${veredicto}` +
              (detalle ? `   «${detalle.slice(0, 70)}»` : ""));
  guardar();                 // se persiste caso por caso, para poder reanudar
  await dormir(15000);       // el nivel gratuito admite 20 peticiones por minuto   // margen frente a la cuota del plan gratuito
}

guardar();

// Con la corrida incompleta no se imprime matriz: seria una matriz sobre una muestra
// truncada, que es justo lo que no hay que reportar.
if (!cortado) {
const recall = VP / (VP + FN), precision = VP / (VP + FP);
const f1 = (2 * precision * recall) / (precision + recall);
const pct = x => (x * 100).toFixed(1) + "%";
const total = VP + FP + VN + FN;

console.log(`\n════════ MATRIZ DE CONFUSIÓN — canal de imagen (HU8), ${total} casos ════════\n`);
console.log("                      │ Sistema BLOQUEÓ │ Sistema PUBLICÓ");
console.log("  ────────────────────┼─────────────────┼────────────────");
console.log(`  Real INFRACTOR       │   VP = ${String(VP).padStart(2)}      │   FN = ${String(FN).padStart(2)}`);
console.log(`  Real LIMPIO          │   FP = ${String(FP).padStart(2)}      │   VN = ${String(VN).padStart(2)}`);
console.log("\n──────────────────────────────────────────────────────────────");
console.log(`  Recall        = ${VP}/${VP + FN} = ${recall.toFixed(3)}  (${pct(recall)})`);
console.log(`  Precisión     = ${VP}/${VP + FP} = ${precision.toFixed(3)}  (${pct(precision)})`);
console.log(`  Especificidad = ${VN}/${VN + FP} = ${(VN / (VN + FP)).toFixed(3)}`);
console.log(`  F1-score      = ${f1.toFixed(3)}`);
console.log(`  Exactitud     = ${pct((VP + VN) / total)}`);
if (fallos.length) {
  console.log("\n──────────────── Casos que el detector FALLÓ ────────────────");
  for (const f of fallos) console.log(`  ${f.id}  ${f.veredicto}  ${f.forma}\n       «${f.detalle}»`);
} else {
  console.log("\n  Sin errores sobre los 20 casos.");
}
console.log(`\n✔ Resultados en casos_imagen/Casos_Compliance_Imagen_resultados.csv\n`);
}
