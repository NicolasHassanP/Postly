// Si Gemini sigue sin responder tras los reintentos, la consultora recibe un aviso en vez de silencio.
//
// Los nodos de Gemini reintentan solos (4 × 35 s), pero si los cuatro intentos fallan —el 503 «high
// demand» de las horas pico, que pasó dos veces en las pruebas del 02-10 en E3— la ejecución terminaba
// en error y el bot no contestaba nada. El flujo de video ya lo resolvía con una salida de error hacia
// «Video: IA ocupada»; acá se hace lo mismo en los otros siete nodos de Gemini. La salida de éxito no
// cambia. Los avisos nuevos copian la credencial y el chatId de «Video: IA ocupada» de la MISMA
// instancia (las credenciales son por instancia), y se ubican en huecos libres del canvas.
//
// Uso:  node scripts/fix-ia-ocupada.mjs                 (solo el JSON del repo)
//       N8N_VPS_URL=https://<host> node scripts/fix-ia-ocupada.mjs --deploy
// Test: node --test scripts/fix-ia-ocupada.test.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const T = (que, como) => `🤖 La IA (Gemini) está sobrecargada en este momento y no pudo ${que}. ` +
  `Es temporal — reintentá en un par de minutos ${como}. 🔃`;

export const AVISOS = {
  "HU8: IA ocupada": { pos: [2512, -2944], texto: T("procesar la foto", "volviendo a mandarla"), id: 1 },
  "HU5: IA ocupada": { pos: [2960, -3312], texto: T("analizar el carrusel", "volviendo a mandar las fotos"), id: 2 },
  "HU5: IA ocupada (copys)": { pos: [720, -1104], texto: T("generar los textos del carrusel", "volviendo a mandar las fotos"), id: 3 },
  "Repost: IA ocupada": { pos: [1392, -1688], texto: T("procesar la imagen", "volviendo a elegir la publicación"), id: 4 },
};

export const RAMAS = [
  { origen: "HU8: Detección visual", aviso: "HU8: IA ocupada" },
  { origen: "Analyze an image", aviso: "HU8: IA ocupada" },
  { origen: "HU5: Analizar carrusel", aviso: "HU5: IA ocupada" },
  { origen: "HU5: Generar copys", aviso: "HU5: IA ocupada (copys)" },
  { origen: "Repost: HU8 visual", aviso: "Repost: IA ocupada" },
  { origen: "Repost: Analizar imagen", aviso: "Repost: IA ocupada" },
  { origen: "Video: HU8 visual", aviso: "Video: IA ocupada" },
];

export function parchear(wf) {
  let cambios = 0;
  const video = wf.nodes.find((n) => n.name === "Video: IA ocupada");
  if (!video) throw new Error("no encuentro «Video: IA ocupada», el aviso que sirve de modelo");
  for (const [nombre, { pos, texto, id }] of Object.entries(AVISOS)) {
    if (wf.nodes.some((n) => n.name === nombre)) continue;
    wf.nodes.push({
      parameters: { chatId: video.parameters.chatId, text: texto, additionalFields: { appendAttribution: false } },
      type: video.type, typeVersion: video.typeVersion, position: pos, name: nombre,
      id: `1a0c0f0e-0000-4000-8000-00000000000${id}`,
      webhookId: `1a0c0f0e-0000-4000-9000-00000000000${id}`,
      credentials: JSON.parse(JSON.stringify(video.credentials)),
    });
    cambios++;
  }
  for (const { origen, aviso } of RAMAS) {
    const n = wf.nodes.find((x) => x.name === origen);
    if (!n) throw new Error(`no encuentro ${origen}`);
    const salidas = wf.connections[origen].main;
    if (n.onError === "continueErrorOutput" && (salidas[1] || []).some((c) => c.node === aviso)) continue;
    n.onError = "continueErrorOutput";
    salidas[1] = [{ node: aviso, type: "main", index: 0 }];
    cambios++;
  }
  return cambios;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
  const ID_VPS = "xwYkQA25a6IjRmqX";
  const repo = JSON.parse(readFileSync(RUTA, "utf-8"));
  const n = parchear(repo);
  if (n) writeFileSync(RUTA, JSON.stringify(repo, null, 2) + "\n", "utf-8");
  console.log(`repo: ${n ? `${n} cambios (${repo.nodes.length} nodos)` : "ya estaba parcheado"}`);

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
    console.log(`VPS: ${nv} cambios y reactivado — ${fin.nodes.length} nodos, activo: ${fin.active}`);
  }
}
