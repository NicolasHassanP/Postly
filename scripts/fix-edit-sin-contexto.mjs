// El texto suelto ya no pisa la última publicación si la usuaria no tocó "✏️ Editar".
//
// Antes: cualquier mensaje de texto que no fuera comando, foto, video ni una de las tres
// esperas con flag (edición de video, fecha de programación, edición de carrusel) caía en
// "Get row(s) in sheet1" → "Descripcion en columna H" y se escribía como Copy_Final de la
// ÚLTIMA fila de la usuaria, aunque ya estuviera publicada. Un "Hola" pisó la fila 68 el
// 2026-10-01 y ofrecía "Publicar Ahora" con ese texto.
//
// Ahora la edición de imagen única tiene su flag, igual que las otras tres:
//   - "A: Elegir opción" (al tocar ✏️ Editar) marca editSingle_<chat> con la hora;
//   - "Edit: check pendiente" + "Edit: ¿pendiente?" dejan pasar a la escritura solo si el
//     flag existe y tiene menos de 60 minutos; si no, "Edit: sin contexto" lo explica;
//   - "Edit: anchor" consume el flag (un texto por cada toque de Editar, como HU5).
//
// Uso:  node scripts/fix-edit-sin-contexto.mjs                 (solo el JSON del repo)
//       N8N_VPS_URL=https://<host> node scripts/fix-edit-sin-contexto.mjs --deploy
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
const ID_VPS = "xwYkQA25a6IjRmqX";
const TTL_MIN = 60;

const MARCA = "// editSingle: flag de edición de imagen única (fix-edit-sin-contexto)";
const SET_FLAG = `${MARCA}
$getWorkflowStaticData('global')['editSingle_' + String($('Telegram Trigger').first().json.callback_query.message.chat.id)] = Date.now();
`;

const CHECK = `// ¿La usuaria tocó "✏️ Editar" en una publicación de imagen única hace menos de ${TTL_MIN} min?
// Sin ese flag, un texto suelto NO es una edición (antes pisaba Copy_Final de su última fila).
const msg = $('Telegram Trigger').first().json.message;
const chatId = String(msg.chat.id);
const t = $getWorkflowStaticData('global')['editSingle_' + chatId];
const pending = !!(t && msg.text && Date.now() - t < ${TTL_MIN} * 60 * 1000);
return [{ json: { pending, chatId } }];`;

const CONSUMIR = `${MARCA}
delete $getWorkflowStaticData('global')['editSingle_' + chatId];
`;

const TEXTO = "🤔 No estoy esperando un texto en este momento.\n\n" +
  "Si querías editar una publicación, tocá <b>✏️ Editar</b> en la opción que te guste y " +
  "después mandame el texto. Para empezar de nuevo, mandá /start.";

function parchear(wf) {
  const nodos = wf.nodes, C = wf.connections;
  const nodo = (n) => nodos.find((x) => x.name === n);
  if (nodo("Edit: check pendiente")) return false;   // ya aplicado

  const elegir = nodo("A: Elegir opción");
  elegir.parameters.jsCode = elegir.parameters.jsCode.replace(/(return \[)/, `${SET_FLAG}$1`);

  const anchor = nodo("Edit: anchor");
  anchor.parameters.jsCode = anchor.parameters.jsCode.replace(/(return \$input)/, `${CONSUMIR}$1`);

  const hu5If = nodo("HU5: ¿Edit pendiente?");
  const ifNuevo = JSON.parse(JSON.stringify(hu5If));
  Object.assign(ifNuevo, { id: "e5c1a0de-0001-4001-8001-000000000001", name: "Edit: ¿pendiente?", position: [2288, -2160] });
  ifNuevo.parameters.conditions.conditions[0].id = "e5c1a0de-0002-4002-8002-000000000002";

  const check = {
    id: "e5c1a0de-0003-4003-8003-000000000003", name: "Edit: check pendiente",
    type: "n8n-nodes-base.code", typeVersion: 2, position: [2176, -2160],
    parameters: { jsCode: CHECK },
  };

  const modelo = nodo("Descripcion editada");
  const sinContexto = {
    id: "e5c1a0de-0004-4004-8004-000000000004", name: "Edit: sin contexto",
    type: modelo.type, typeVersion: modelo.typeVersion, position: [2512, -2080],
    parameters: {
      chatId: "={{ $('Telegram Trigger').first().json.message.chat.id }}",
      text: TEXTO,
      additionalFields: { appendAttribution: false, parse_mode: "HTML" },
    },
    credentials: JSON.parse(JSON.stringify(modelo.credentials)),
  };
  nodos.push(check, ifNuevo, sinContexto);

  // HU5: ¿Edit pendiente? (false) → Edit: check → Edit: ¿pendiente? → (true) Get row(s) | (false) sin contexto
  const salidaFalse = C["HU5: ¿Edit pendiente?"].main[1];
  if (salidaFalse.length !== 1 || salidaFalse[0].node !== "Get row(s) in sheet1")
    throw new Error("cableado inesperado en HU5: ¿Edit pendiente?");
  C["HU5: ¿Edit pendiente?"].main[1] = [{ node: "Edit: check pendiente", type: "main", index: 0 }];
  C["Edit: check pendiente"] = { main: [[{ node: "Edit: ¿pendiente?", type: "main", index: 0 }]] };
  C["Edit: ¿pendiente?"] = { main: [
    [{ node: "Get row(s) in sheet1", type: "main", index: 0 }],
    [{ node: "Edit: sin contexto", type: "main", index: 0 }],
  ] };

  if (!elegir.parameters.jsCode.includes(MARCA) || !anchor.parameters.jsCode.includes(MARCA))
    throw new Error("no se pudo inyectar el flag en A: Elegir opción / Edit: anchor");
  return true;
}

// ── repo
const repo = JSON.parse(readFileSync(RUTA, "utf-8"));
const cambioRepo = parchear(repo);
if (cambioRepo) writeFileSync(RUTA, JSON.stringify(repo, null, 2) + "\n", "utf-8");
console.log(`repo: ${cambioRepo ? "parcheado" : "ya estaba parcheado"} (${repo.nodes.length} nodos)`);

if (!process.argv.includes("--deploy")) process.exit(0);

// ── VPS: GET, mismo parche, PUT y reactivar (un workflow activo no toma el PUT hasta reactivarlo)
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
if (!parchear(vps)) { console.log("VPS: ya estaba parcheado"); process.exit(0); }
await api("PUT", `/workflows/${ID_VPS}`, {
  name: vps.name, nodes: vps.nodes, connections: vps.connections, settings: { executionOrder: "v1" },
});
await api("POST", `/workflows/${ID_VPS}/deactivate`);
await api("POST", `/workflows/${ID_VPS}/activate`);
const fin = await api("GET", `/workflows/${ID_VPS}`);
console.log(`VPS: parcheado y reactivado — ${fin.nodes.length} nodos, activo: ${fin.active}`);
