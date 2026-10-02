// N-09 (devolución del 29-09): lo que el Centinela VISUAL bloquea se borra de Cloudinary.
//
// La imagen se sube a Cloudinary ANTES de analizarla (Gemini la lee por URL), así que una
// pieza con precio incrustado quedaba guardada aunque nunca se publicara. Ahora cada una de
// las tres ramas de bloqueo visual tiene, en paralelo al aviso a la usuaria, un nodo que
// borra lo subido con la Admin API firmada (destroy). Corre con continueRegularOutput: si
// Cloudinary falla, el bloqueo y el aviso siguen igual.
//
// NO se borra cuando el bloqueo es por TEXTO ("HU5: Pub bloqueado") ni en la re-publicación:
// ahí las imágenes están limpias, la usuaria edita el texto y reintenta con las mismas.
//
// Requiere CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en el entorno de n8n.
//
// Uso:  node scripts/fix-cloudinary-bloqueadas.mjs                 (solo el JSON del repo)
//       N8N_VPS_URL=https://<host> node scripts/fix-cloudinary-bloqueadas.mjs --deploy
// Test: node --test scripts/fix-cloudinary-bloqueadas.test.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

export function publicIdDeUrl(url) {
  const m = String(url || "").match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+)$/);
  if (!m) return null;
  return { cloud: m[1], tipo: m[2], publicId: m[3].replace(/\.[A-Za-z0-9]+$/, "") };
}

export function firmaCloudinary(params, secret) {
  const base = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  return createHash("sha1").update(base + secret).digest("hex");
}

// si: el IF de "¿limpia?" · aviso: el Telegram que avisa el bloqueo · urls: expresión JS
export const RAMAS = [
  { si: "HU8: ¿Imagen limpia?", aviso: "HU8: Imagen con precio", nodo: "HU8: borrar de Cloudinary",
    urls: "$('HTTP Request').all().map(i => i.json.secure_url)" },
  { si: "HU5: ¿Carrusel limpio?", aviso: "HU5: Carrusel bloqueado", nodo: "HU5: borrar de Cloudinary",
    urls: "String($('HU5: Juntar URLs').first().json.urlList || '').split(',')" },
  { si: "Video: ¿frame limpio?", aviso: "Video: frame con precio", nodo: "Video: borrar de Cloudinary",
    // el video viene de "Video: procesar" (≤ 60 s) o de "Video: cortar" (recorte confirmado)
    urls: "(() => { for (const n of ['Video: cortar', 'Video: procesar']) { try { const j = $(n).first().json; " +
          "if (j && j.videoUrl) return [j.videoUrl, ...String(j.frameUrls || '').split(',')]; } catch (e) {} } return []; })()" },
];

const codigoNodo = (urls) => `// N-09: borra de Cloudinary lo que el Centinela visual bloqueó (fix-cloudinary-bloqueadas)
const crypto = require('crypto');
const publicIdDeUrl = ${publicIdDeUrl.toString()};
const firmaCloudinary = (params, secret) => crypto.createHash('sha1')
  .update(Object.keys(params).sort().map(k => k + '=' + params[k]).join('&') + secret).digest('hex');
const KEY = $env.CLOUDINARY_API_KEY, SECRET = $env.CLOUDINARY_API_SECRET;
const urls = [...new Set((${urls}).filter(Boolean))];
const borradas = [];
for (const u of urls) {
  const a = publicIdDeUrl(u);
  if (!a) continue;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = firmaCloudinary({ public_id: a.publicId, timestamp }, SECRET);
  try {
    const r = await helpers.httpRequest({ method: 'POST', url: 'https://api.cloudinary.com/v1_1/' + a.cloud + '/' + a.tipo + '/destroy',
      body: { public_id: a.publicId, timestamp, api_key: KEY, signature },
      headers: { 'content-type': 'application/x-www-form-urlencoded' }, json: true });
    borradas.push({ publicId: a.publicId, tipo: a.tipo, result: r.result });
  } catch (e) { borradas.push({ publicId: a.publicId, tipo: a.tipo, error: String(e.message || e) }); }
}
return [{ json: { borradas } }];`;

export function parchear(wf) {
  let cambios = 0;
  RAMAS.forEach(({ si, aviso, nodo, urls }, i) => {
    if (wf.nodes.some((n) => n.name === nodo)) return;
    const salidas = wf.connections[si]?.main || [];
    const rama = salidas.find((b) => (b || []).some((c) => c.node === aviso));
    if (!rama) throw new Error(`${si}: no encuentro la salida que va a ${aviso}`);
    const ref = wf.nodes.find((n) => n.name === aviso);
    wf.nodes.push({
      id: `c1d0e9a0-000${i}-4000-8000-00000000000${i}`, name: nodo, type: "n8n-nodes-base.code", typeVersion: 2,
      position: [ref.position[0], ref.position[1] + 176], onError: "continueRegularOutput",
      parameters: { jsCode: codigoNodo(urls) },
    });
    rama.push({ node: nodo, type: "main", index: 0 });
    cambios++;
  });
  return cambios;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
  const ID_VPS = "xwYkQA25a6IjRmqX";
  const repo = JSON.parse(readFileSync(RUTA, "utf-8"));
  const n = parchear(repo);
  if (n) writeFileSync(RUTA, JSON.stringify(repo, null, 2) + "\n", "utf-8");
  console.log(`repo: ${n ? `${n} nodos agregados (${repo.nodes.length} en total)` : "ya estaba parcheado"}`);

  if (process.argv.includes("--deploy")) {
    const e = { ...process.env };
    for (const l of readFileSync(".env", "utf-8").split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !e[m[1]]) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    const BASE = (e.N8N_VPS_URL || "").replace(/\/$/, "");
    if (!BASE || !e.N8N_API_KEY_VPS) { console.error("faltan N8N_VPS_URL / N8N_API_KEY_VPS"); process.exit(1); }
    const cab = { "X-N8N-API-KEY": e.N8N_API_KEY_VPS, "content-type": "application/json" };
    const api = async (m, r, b) => {
      const x = await fetch(`${BASE}/api/v1${r}`, { method: m, headers: cab, body: b && JSON.stringify(b) });
      if (!x.ok) throw new Error(`${m} ${r} -> ${x.status}: ${(await x.text()).slice(0, 300)}`);
      return x.json();
    };
    const vps = await api("GET", `/workflows/${ID_VPS}`);
    const nv = parchear(vps);
    if (!nv) { console.log("VPS: ya estaba parcheado"); process.exit(0); }
    await api("PUT", `/workflows/${ID_VPS}`, {
      name: vps.name, nodes: vps.nodes, connections: vps.connections, settings: { executionOrder: "v1" },
    });
    await api("POST", `/workflows/${ID_VPS}/deactivate`);
    await api("POST", `/workflows/${ID_VPS}/activate`);
    const fin = await api("GET", `/workflows/${ID_VPS}`);
    console.log(`VPS: ${nv} nodos agregados y reactivado — ${fin.nodes.length} nodos, activo: ${fin.active}`);
  }
}
