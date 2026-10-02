// HU9 multi-usuaria: la firma y el contacto salen de la fila de Config de QUIEN publica.
//
// Antes: los 4 nodos que firman el caption (Code in JavaScript1, HU5: Pub preparar,
// Sched: Procesar, Video: pub publicar) leían Config con `.first()`. Con dos consultoras,
// las dos publicaban con la firma y el contacto de la primera fila (N-08 de la devolución
// del 29-09, contradice el criterio 3 de HU9).
//
// Ahora Config tiene una columna TelegramUserID y cada nodo elige:
//   1. la fila cuya TelegramUserID es el chat que publica;
//   2. si no hay, la fila SIN dueña (la hoja vieja de una sola fila sigue funcionando igual);
//   3. si tampoco hay, nada: el nodo usa su firma de respaldo. Nunca la de otra usuaria.
//
// Uso:  node scripts/fix-config-por-usuaria.mjs                 (solo el JSON del repo)
//       N8N_VPS_URL=https://<host> node scripts/fix-config-por-usuaria.mjs --deploy
// Test: node --test scripts/fix-config-por-usuaria.test.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function configDe(rows, uid) {
  const duena = (r) => {
    for (const k of Object.keys(r || {}))
      if (k.trim().toLowerCase() === "telegramuserid") return String(r[k] ?? "").trim();
    return "";
  };
  return rows.find((r) => duena(r) === uid) || rows.find((r) => !duena(r)) || {};
}

const NODOS = {   // nodo que firma -> nodo de Sheets que lee Config
  "Code in JavaScript1": "Leer Config",
  "HU5: Pub preparar": "HU5: Pub leer Config",
  "Sched: Procesar": "Sched: Leer Config",
  "Video: pub publicar": "Video: pub Config",
};
const MARCA = "// HU9 multi-usuaria: Config por TelegramUserID (fix-config-por-usuaria)";
const CABECERA = `${MARCA}
const _uidCfg = (() => { const t = $('Telegram Trigger').first().json; return String((t.callback_query && t.callback_query.message.chat.id) || (t.message && t.message.chat.id) || ''); })();
const _configDe = ${configDe.toString()};
// fin HU9 multi-usuaria
`;

export function parchear(wf) {
  let cambios = 0;
  for (const [nombre, lector] of Object.entries(NODOS)) {
    // Config no depende del ítem que entra: leerla una vez. Sin esto, "Sched: Leer Config"
    // corría una vez por cada publicación de la usuaria (59 lecturas con 59 posts) y agotaba
    // la cuota de Sheets (60 lecturas/min) antes de "Sched: Guardar" → 429.
    const lec = wf.nodes.find((n) => n.name === lector);
    if (!lec.executeOnce) { lec.executeOnce = true; cambios++; }

    const nodo = wf.nodes.find((n) => n.name === nombre);
    const codigo = nodo.parameters.jsCode;
    if (codigo.includes(MARCA)) continue;
    const viejo = `$('${lector}').first()`;
    if (codigo.split(viejo).length !== 2) throw new Error(`${nombre}: se esperaba una sola lectura ${viejo}`);
    nodo.parameters.jsCode = CABECERA + codigo.replace(viejo,
      `({ json: _configDe($('${lector}').all().map(i => i.json), _uidCfg) })`);
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
  console.log(`repo: ${n ? `${n} nodos parcheados` : "ya estaba parcheado"}`);

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
    console.log(`VPS: ${nv} nodos parcheados y reactivado — activo: ${fin.active}`);
  }
}
