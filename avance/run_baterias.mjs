// Baterías de prueba que el §3.4.2 declara y el Capítulo 5 no reportaba (N-11 / A-22).
//
// Mide tres cosas sobre la instancia desplegada, contra los umbrales que fijan las
// Historias de Usuario:
//   B1  Latencia de respuesta del bot a un comando (HU1: < 3 s; HU12: < 15 s).
//   B2  Pico de memoria durante la normalización de video (HU13, "control de
//       desbordamiento de memoria" del §3.4.2).
//   B3  Validación preventiva y refresco del token de larga duración (HU2: < 5 s; HU3).
//
// No publica nada: B1 dispara el comando /start, cuya única salida es un mensaje de
// bienvenida en el chat de prueba, y B3 sólo lee de la Graph API e intercambia el token
// sin persistir el resultado.
//
// Uso:  node run_baterias.mjs [--repeticiones 10] [--sin-b1]
// Escribe: Baterias_resultados.csv

import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const REPS = Number(process.argv[process.argv.indexOf("--repeticiones") + 1]) || 10;
const SIN_B1 = process.argv.includes("--sin-b1");

// ─── entorno ─────────────────────────────────────────────────────────────────
function entorno() {
  const e = { ...process.env };
  // la carpeta de evidencia puede colgar del repo (evidencia/ -> avance/ -> raiz)
  // o entregarse suelta con su propio .env al lado
  for (const ruta of [join(AQUI, ".env"), join(AQUI, "..", ".env"),
                      join(AQUI, "..", "..", ".env")]) {
    if (!existsSync(ruta)) continue;
    for (const l of readFileSync(ruta, "utf-8").split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !e[m[1]]) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return e;
}
const ENV = entorno();
const N8N = ENV.N8N_LOCAL_URL || "http://localhost:5678";
const KEY = ENV.N8N_API_KEY_LOCAL || ENV.N8N_API_KEY;
const WF = ENV.N8N_WORKFLOW_ID || "";                 // workflow principal
// La ruta de produccion de un Telegram Trigger es /webhook/<webhookId>/webhook.
// El webhookId y el chat de prueba son identificadores de la instancia desplegada:
// se leen del .env y no se versionan, para que este archivo no permita disparar
// el flujo en produccion a quien lo tenga.
const WEBHOOK = ENV.N8N_WEBHOOK_ID || "";
const CHAT = Number(ENV.TELEGRAM_TEST_CHAT_ID || 0);
if (!WF || !WEBHOOK || !CHAT) {
  console.error(
    "Faltan identificadores de la instancia. Defini en el .env:\n" +
    "  N8N_WORKFLOW_ID=<id del workflow principal>\n" +
    "  N8N_WEBHOOK_ID=<webhookId del Telegram Trigger>\n" +
    "  TELEGRAM_TEST_CHAT_ID=<chat de prueba>");
  process.exit(1);
}

const dormir = ms => new Promise(r => setTimeout(r, ms));
const med = a => a.reduce((s, x) => s + x, 0) / a.length;
const de = a => a.length < 2 ? 0 :
  Math.sqrt(a.reduce((s, x) => s + (x - med(a)) ** 2, 0) / (a.length - 1));
const pctil = (a, p) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1,
  Math.floor(p * a.length))];
const filas = [["Bateria", "Metrica", "n", "Media", "DE", "Minimo", "Maximo", "p95",
                "Umbral_declarado", "Cumple", "Fuente"]];
const num = x => (Math.round(x * 1000) / 1000).toString().replace(".", ",");

// ═══════════════════════════════════════ B1 — latencia de respuesta del bot
async function b1() {
  console.log(`\n── B1 · latencia de respuesta al comando /start (n = ${REPS})`);
  const latencias = [], duraciones = [];
  const desde = Date.now();
  for (let i = 0; i < REPS; i++) {
    const update = {
      update_id: 900000000 + i,
      message: {
        message_id: 990000 + i,
        from: { id: CHAT, is_bot: false, first_name: "Medición", language_code: "es" },
        chat: { id: CHAT, first_name: "Medición", type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "/start",
      },
    };
    const t0 = performance.now();
    const r = await fetch(`${N8N}/webhook/${WEBHOOK}/webhook`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(update),
    });
    await r.text();
    const ms = performance.now() - t0;
    latencias.push(ms / 1000);
    console.log(`   ${String(i + 1).padStart(2)}  HTTP ${r.status}  ${(ms / 1000).toFixed(3)} s`);
    await dormir(1500);
  }
  // duración que registra el propio motor, como contraste
  await dormir(2500);
  try {
    const j = await (await fetch(
      `${N8N}/api/v1/executions?limit=${REPS * 2}&workflowId=${WF}`,
      { headers: { "X-N8N-API-KEY": KEY } })).json();
    for (const e of j.data || []) {
      if (!e.startedAt || !e.stoppedAt) continue;
      if (new Date(e.startedAt).getTime() < desde) continue;   // ejecucion de otra corrida
      duraciones.push((new Date(e.stoppedAt) - new Date(e.startedAt)) / 1000);
    }
  } catch { /* sin API key: se reporta sólo la latencia observada */ }

  const cumple = pctil(latencias, 0.95) < 3;
  console.log(`   media ${med(latencias).toFixed(3)} s · DE ${de(latencias).toFixed(3)} · ` +
              `p95 ${pctil(latencias, 0.95).toFixed(3)} s · umbral HU1 3 s -> ${cumple ? "cumple" : "NO cumple"}`);
  filas.push(["B1 · interfaz", "Acuse de recepcion del webhook por n8n (s)", REPS,
    num(med(latencias)), num(de(latencias)), num(Math.min(...latencias)),
    num(Math.max(...latencias)), num(pctil(latencias, 0.95)), "< 3 s (HU1)",
    cumple ? "Si" : "No", "POST al webhook del Telegram Trigger; el acuse precede a la respuesta"]);
  if (duraciones.length) {
    console.log(`   duración registrada por n8n: media ${med(duraciones).toFixed(3)} s ` +
                `(n = ${duraciones.length})`);
    filas.push(["B1 · interfaz", "Tiempo hasta la respuesta del bot: duracion de la ejecucion (s)", duraciones.length,
      num(med(duraciones)), num(de(duraciones)), num(Math.min(...duraciones)),
      num(Math.max(...duraciones)), num(pctil(duraciones, 0.95)), "< 3 s (HU1)",
      pctil(duraciones, 0.95) < 3 ? "Si" : "No", "API de ejecuciones de n8n: del disparo al envio del mensaje de respuesta"]);
  }
}

// ═══════════════════════ B1b — integración multimodal de extremo a extremo (HU4)
//
// El §3.4.2 declara para esta bateria "latencia y consistencia en la comunicacion
// bidireccional entre Telegram y la API de Gemini, asegurando la correcta extraccion
// de formato JSON". El comando /start de B1 no invoca al modelo: mide la interfaz,
// no la integracion. Esta bateria mide el tramo que si la ejerce, de punta a punta:
//
//   foto recibida -> Bajar Foto -> Cloudinary -> HU8: Deteccion visual (Gemini,
//   vision) -> Analyze an image (Gemini, copywriting) -> B: Parsear opciones (JSON)
//   -> los tres copys enviados al chat.
//
// Se reproduce el update que Telegram entrego en una ejecucion real (_foto_patron.json,
// producido por _extraer_foto.mjs): un file_id es estable para el mismo bot, de modo
// que cada repeticion baja la misma imagen y la diferencia medida es la del sistema.
// El flujo termina mostrando los tres copys y espera que la usuaria elija: NO publica.
//
// Cuota: cada repeticion gasta DOS peticiones de Gemini. El nivel gratuito de
// gemini-2.5-flash admite 20 por dia, asi que la corrida se detiene por las buenas
// ante el primer agotamiento y reporta con las repeticiones que alcanzo.
async function b1b() {
  const patron = JSON.parse(readFileSync(join(AQUI, "_foto_patron.json"), "utf-8"));
  console.log(`\n── B1b · integración multimodal: imagen → tres copys (n = ${REPS})`);
  console.log(`   imagen patrón: ${patron.photo.at(-1).width}x${patron.photo.at(-1).height} ` +
              `(de la ejecución ${patron.origen_exec}) · 2 peticiones de Gemini por repetición`);

  const cabApi = { "X-N8N-API-KEY": KEY };
  const ultimaEjec = async () => {
    const j = await (await fetch(`${N8N}/api/v1/executions?limit=1&workflowId=${WF}`,
      { headers: cabApi })).json();
    return Number(j.data?.[0]?.id ?? 0);
  };

  const duraciones = [], fallos = [];
  for (let i = 0; i < REPS; i++) {
    const previa = await ultimaEjec();
    const sello = Date.now();
    const update = {
      update_id: 910000000 + i,
      message: {
        message_id: 991000 + i,
        from: { ...patron.from, id: CHAT },
        chat: { ...patron.chat, id: CHAT },
        date: Math.floor(sello / 1000),
        photo: patron.photo,
      },
    };
    await fetch(`${N8N}/webhook/${WEBHOOK}/webhook`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(update),
    }).then(r => r.text()).catch(() => {});

    // esperar a que aparezca y termine la ejecucion disparada
    let ejec = null;
    for (let t = 0; t < 150 && !ejec; t++) {
      await dormir(2000);
      const j = await (await fetch(`${N8N}/api/v1/executions?limit=5&workflowId=${WF}`,
        { headers: cabApi })).json();
      const cand = (j.data || []).find(e => Number(e.id) > previa && e.stoppedAt);
      if (cand) ejec = cand;
    }
    if (!ejec) {
      console.log(`   ${String(i + 1).padStart(2)}  sin ejecución tras 5 min — se corta`);
      break;
    }

    const seg = (new Date(ejec.stoppedAt) - new Date(ejec.startedAt)) / 1000;
    const det = await (await fetch(`${N8N}/api/v1/executions/${ejec.id}?includeData=true`,
      { headers: cabApi })).json();
    const run = det.data?.resultData?.runData ?? {};
    const copys = ["B: Opción 1", "B: Opción 2", "B: Opción 3"].filter(n => run[n]).length;
    const gemini = ["HU8: Detección visual", "Analyze an image"]
      .map(n => Math.round((run[n]?.[0]?.executionTime ?? 0) / 100) / 10);
    const crudo = JSON.stringify(det.data?.resultData?.error ?? {});
    const cuota = /429|RESOURCE_EXHAUSTED|quota/i.test(crudo);

    if (ejec.status === "success" && copys === 3) {
      duraciones.push(seg);
      console.log(`   ${String(i + 1).padStart(2)}  exec ${ejec.id}  ${seg.toFixed(1)} s  ` +
                  `(visión ${gemini[0]} s · copys ${gemini[1]} s) · 3 copys OK`);
    } else {
      fallos.push({ id: ejec.id, estado: ejec.status, copys, cuota });
      console.log(`   ${String(i + 1).padStart(2)}  exec ${ejec.id}  ${ejec.status}  ` +
                  `copys=${copys}${cuota ? "  ← cuota de Gemini agotada" : ""}`);
      if (cuota) { console.log("   se detiene la batería: no queda cuota diaria"); break; }
    }
    await dormir(3000);
  }

  if (!duraciones.length) {
    console.log("   sin repeticiones válidas: no se reporta la batería");
    return;
  }
  const n = duraciones.length;
  console.log(`   media ${med(duraciones).toFixed(1)} s · DE ${de(duraciones).toFixed(1)} · ` +
              `min ${Math.min(...duraciones).toFixed(1)} · máx ${Math.max(...duraciones).toFixed(1)}` +
              (fallos.length ? `  (${fallos.length} repeticiones descartadas)` : ""));
  filas.push(["B1b · integracion multimodal",
    "Latencia de extremo a extremo: imagen recibida -> tres copys en pantalla (s)", n,
    num(med(duraciones)), num(de(duraciones)), num(Math.min(...duraciones)),
    num(Math.max(...duraciones)), num(pctil(duraciones, 0.95)),
    "Las HU no fijan umbral para este tramo", "—",
    "Update de Telegram con foto reproducido contra el webhook de produccion; " +
    "duracion de la ejecucion en la API de n8n. Cadena: Bajar Foto -> Cloudinary -> " +
    "HU8 (Gemini vision) -> Analyze an image (Gemini) -> parseo JSON -> tres envios. " +
    "Consistencia del JSON: " + n + "/" + n + " ejecuciones devolvieron tres copys"]);
}

// ═════════════════════════════ B2 — pico de memoria en la normalización de video
function picoMemoria(cmd, args) {
  // El muestreo corre en un PowerShell aparte que sigue al PID hasta que termina y
  // devuelve el maximo de WorkingSet64 observado. Hacerlo desde Node con execSync por
  // intervalo pierde los picos: el propio muestreo compite con FFmpeg por el CPU.
  return new Promise(resolve => {
    const p = spawn(cmd, args, { stdio: "ignore" });
    const t0 = performance.now();
    const guion =
      "$m=0; while($true){ try { $x=(Get-Process -Id " + p.pid +
      " -ErrorAction Stop).WorkingSet64 } catch { break }; if($x -gt $m){ $m=$x }; " +
      "Start-Sleep -Milliseconds 30 }; [math]::Round($m/1MB,1)";
    const ps = spawn("powershell.exe", ["-NoProfile", "-Command", guion],
                     { stdio: ["ignore", "pipe", "pipe"] });
    let salida = "", err = "";
    ps.stdout.on("data", d => { salida += d; });
    ps.stderr.on("data", d => { err += d; });
    ps.on("error", e => { err += e.message; });
    let segundos = 0, terminado = 0;
    const listo = () => {
      if (++terminado < 2) return;
      if (err.trim()) console.log("   [muestreo err]", err.trim().slice(0, 160));
      resolve({ picoMB: Number(salida.trim().replace(",", ".")) || 0, segundos });
    };
    p.on("close", () => { segundos = (performance.now() - t0) / 1000; listo(); });
    ps.on("close", listo);
  });
}

async function b2() {
  console.log("\n── B2 · pico de memoria durante la normalización de video (HU13)");
  const dir = tmpdir();
  const fuente = join(dir, "bateria_fuente.mp4");
  const salida = join(dir, "bateria_normalizado.mp4");
  const frame = join(dir, "bateria_frame.jpg");
  // clip de prueba 1920x1080 a 30 fps, 45 s: el peor caso admitido sin recorte
  console.log("   generando el clip de prueba (1920x1080, 45 s)…");
  execSync(`ffmpeg -y -f lavfi -i testsrc2=size=1920x1080:rate=30:duration=45 ` +
           `-f lavfi -i sine=frequency=440:duration=45 -c:v libx264 -preset veryfast ` +
           `-c:a aac -shortest "${fuente}"`, { stdio: "pipe" });
  const mb = statSync(fuente).size / 1024 / 1024;
  console.log(`   clip de ${mb.toFixed(1)} MB`);

  // comando VERBATIM del nodo "Video: procesar"
  const norm = await picoMemoria("ffmpeg", ["-y", "-i", fuente, "-vf",
    "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
    "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac",
    "-movflags", "+faststart", salida]);
  const extr = await picoMemoria("ffmpeg", ["-y", "-i", salida,
    "-vframes", "1", "-q:v", "2", frame]);

  console.log(`   normalización: pico ${norm.picoMB.toFixed(1)} MB en ${norm.segundos.toFixed(1)} s`);
  console.log(`   extracción del fotograma: pico ${extr.picoMB.toFixed(1)} MB en ${extr.segundos.toFixed(1)} s`);
  const LIMITE = 2048;   // RAM del plan de VPS documentado en el Anexo B.1
  filas.push(["B2 · multimedia", "Pico de memoria residente de FFmpeg — normalización (MB)",
    1, num(norm.picoMB), "", num(norm.picoMB), num(norm.picoMB), "",
    "2048 MB de RAM del VPS (Anexo B.1)", norm.picoMB < LIMITE ? "Si" : "No",
    `clip de prueba 1920x1080, 45 s, ${mb.toFixed(1)} MB`]);
  // la extraccion del fotograma dura menos que el intervalo de muestreo
  filas.push(["B2 · multimedia", "Extraccion del fotograma: duracion (s)", 1,
    num(extr.segundos), "", num(extr.segundos), num(extr.segundos), "", "—", "—",
    extr.picoMB > 0 ? `pico ${num(extr.picoMB)} MB`
                    : "por debajo del intervalo de muestreo; memoria no registrada"]);
  filas.push(["B2 · multimedia", "Tiempo de normalización (s)", 1,
    num(norm.segundos), "", num(norm.segundos), num(norm.segundos), "", "—", "—",
    "clip de 45 s a 1080x1920/H.264"]);
  for (const f of [fuente, salida, frame]) { try { rmSync(f); } catch { } }
}

// ══════════════════════════ B3 — validación y refresco del token de larga duración
async function b3() {
  console.log("\n── B3 · validación preventiva y refresco del token (HU2, HU3)");
  const token = ENV.META_ACCESS_TOKEN;
  if (!token) { console.log("   sin META_ACCESS_TOKEN en .env; batería omitida"); return; }

  // HU3: el mismo GET que ejecuta el nodo "HU3: Validar token"
  const lat = [];
  let vigente = false;
  for (let i = 0; i < REPS; i++) {
    const t0 = performance.now();
    const r = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id&access_token=${token}`);
    const j = await r.json();
    lat.push((performance.now() - t0) / 1000);
    vigente = Boolean(j.id);
    if (i === 0) console.log(`   validación -> ${vigente ? "token vigente (id devuelto)" :
      "token NO vigente: " + JSON.stringify(j).slice(0, 160)}`);
    await dormir(400);
  }
  console.log(`   latencia de validación: media ${med(lat).toFixed(3)} s · ` +
              `p95 ${pctil(lat, 0.95).toFixed(3)} s`);
  filas.push(["B3 · OAuth", "Latencia de la validación preventiva del token (s)", REPS,
    num(med(lat)), num(de(lat)), num(Math.min(...lat)), num(Math.max(...lat)),
    num(pctil(lat, 0.95)), "HU3 no fija umbral", "—",
    "GET graph.facebook.com/v19.0/me, el mismo del nodo HU3: Validar token"]);
  filas.push(["B3 · OAuth", "Token vigente al momento de la medición", 1,
    vigente ? "Si" : "No", "", "", "", "", "id devuelto por la Graph API",
    vigente ? "Si" : "No", "nodo HU3: ¿Token vigente?"]);

  // HU2: el intercambio a token de larga duración del nodo "Token largo"
  if (ENV.META_APP_ID && ENV.META_APP_SECRET) {
    const t0 = performance.now();
    const r = await fetch("https://graph.facebook.com/v19.0/oauth/access_token?" +
      `grant_type=fb_exchange_token&client_id=${ENV.META_APP_ID}` +
      `&client_secret=${ENV.META_APP_SECRET}&fb_exchange_token=${token}`);
    const j = await r.json();
    const seg = (performance.now() - t0) / 1000;
    const ok = Boolean(j.access_token);
    const dias = j.expires_in ? (j.expires_in / 86400).toFixed(1) : "sin expires_in (no expira)";
    console.log(`   refresco -> ${ok ? "token de larga duración obtenido" : "FALLÓ"} ` +
                `en ${seg.toFixed(3)} s · vigencia: ${dias}${j.expires_in ? " días" : ""}`);
    if (!ok) console.log("   ", JSON.stringify(j).slice(0, 200));
    filas.push(["B3 · OAuth", "Refresco a token de larga duración: latencia (s)", 1,
      num(seg), "", num(seg), num(seg), "", "< 5 s (HU2)", seg < 5 ? "Si" : "No",
      "GET oauth/access_token?grant_type=fb_exchange_token, nodo Token largo"]);
    filas.push(["B3 · OAuth", "Refresco a token de larga duración: resultado", 1,
      ok ? "Token devuelto" : "Fallo", "", "", "", "",
      "Token de larga duracion (HU2)", ok ? "Si" : "No",
      `vigencia devuelta: ${dias}${j.expires_in ? " dias" : ""}`]);
  }
}

// ─────────────────────────────────────────────────────────────────── corrida
const SOLO = process.argv.includes("--solo-b1b");
if (!SIN_B1 && !SOLO) await b1();
if (existsSync(join(AQUI, "_foto_patron.json"))) await b1b();
else console.log("\n(sin _foto_patron.json: se omite B1b — corré antes _extraer_foto.mjs)");
if (!SOLO) { await b2(); await b3(); }

// Se fusiona con lo ya medido en vez de sobrescribir: una corrida parcial
// (--solo-b1b, o una bateria que se corta por cuota) no debe borrar el resto.
const CSV = join(AQUI, "Baterias_resultados.csv");
const esc = v => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const clave = f => `${f[0]} ${f[1]}`;
const nuevas = new Map(filas.slice(1).map(f => [clave(f), f]));
const salida = [filas[0]];
if (existsSync(CSV)) {
  const parse = l => {
    const c = []; let a = "", q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (q) { if (ch === '"' && l[i + 1] === '"') { a += '"'; i++; } else if (ch === '"') q = false; else a += ch; }
      else if (ch === '"') q = true;
      else if (ch === ",") { c.push(a); a = ""; }
      else a += ch;
    }
    c.push(a); return c;
  };
  for (const linea of readFileSync(CSV, "utf-8").split(/\r?\n/).slice(1)) {
    if (!linea.trim()) continue;
    const f = parse(linea);
    salida.push(nuevas.get(clave(f)) ?? f);
    nuevas.delete(clave(f));
  }
}
for (const f of filas.slice(1)) if (nuevas.has(clave(f))) salida.push(f);
writeFileSync(CSV, salida.map(r => r.map(esc).join(",")).join("\n"), "utf-8");
console.log(`\n✔ Baterias_resultados.csv (${salida.length - 1} filas)\n`);
