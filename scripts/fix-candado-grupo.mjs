// Candado de grupo para las 3 versiones de copy (imagen única, video y carrusel).
//
// Problema (prueba del 28-09-2026): «Publicar: Lock» bloquea el mensaje tocado, no el grupo.
// Tocar Publicar en una versión y después en otra publicaba dos veces con distinto tono. El
// video no tenía ningún candado.
//
// Solución:
//  1. Cada conjunto de versiones tiene un mensaje de introducción (imagen y video ya lo tenían;
//     el carrusel lo gana: «HU5: Intro opciones»). Su message_id viaja como sufijo `_g<id>` en
//     el callback_data de todos los botones del conjunto, incluidos los que aparecen tras editar.
//  2. Al tocar Publicar o Programar, «Grupo: Lock» edita ese mensaje de introducción a un texto
//     FIJO. Telegram acepta esa edición una sola vez: el segundo intento, de cualquier versión,
//     recibe «message is not modified» y sale por la rama de error → aviso a la usuaria.
//  3. Tras el candado, «Grupo: quitar botones» reenvía el texto de las otras versiones sin
//     teclado (ids y textos exactos, registrados al enviarlas en «Grupo: registrar …»).
//  4. Los botones viejos, sin sufijo, siguen el camino anterior.
//
// Uso: node scripts/fix-candado-grupo.mjs [--deploy]
//   sin --deploy: simula sobre la instancia local y el JSON del repo, y valida el resultado.
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(readFileSync(".env", "utf-8").split(/\r?\n/)
  .filter(l => /^[A-Z0-9_]+=/.test(l))
  .map(l => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^["']|["']$/g, "")]));
const BASE = "http://localhost:5678/api/v1", ID = "VOgbHGLELJfRgVO5";
const H = { "X-N8N-API-KEY": env.N8N_API_KEY_LOCAL, "content-type": "application/json" };
const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
const DEPLOY = process.argv.includes("--deploy");

const TRIG = "$('Telegram Trigger').first().json";
const SUF = "_g";                                   // separador del id de grupo
const LOCK_TXT = "🔒 Ya elegiste una versión de esta publicación. Las demás quedaron desactivadas.";
const YA_TXT = "⚠️ Ya elegiste otra versión de esta publicación, así que esta quedó desactivada. Si querés volver a publicarla, usá Mi Agenda.";

function transformar(wf) {
  const N = Object.fromEntries(wf.nodes.map(n => [n.name, n]));
  const C = wf.connections;
  const log = [];
  const nodo = n => { if (!N[n]) throw new Error("falta el nodo " + n); return N[n]; };
  if (N["Grupo: Lock"]) throw new Error("el candado de grupo ya está aplicado");

  // ── 1. sufijo en los botones
  const sufijo = intro => `${SUF}{{ $('${intro}').first().json.result.message_id }}`;
  const botones = (name, fn) => {
    for (const row of nodo(name).parameters.inlineKeyboard.rows)
      for (const b of row.row.buttons) {
        const cd = b.additionalFields.callback_data;
        b.additionalFields.callback_data = fn(cd.startsWith("=") ? cd.slice(1) : cd);
      }
    log.push("botones: " + name);
  };
  for (const n of ["B: Opción 1", "B: Opción 2", "B: Opción 3"])
    botones(n, cd => "=" + cd + sufijo("B: Intro opciones"));
  for (const n of ["Video: Opción 1", "Video: Opción 2", "Video: Opción 3"])
    botones(n, cd => "=" + cd + sufijo("Video: intro"));
  for (const n of ["HU5: Tono 1", "HU5: Tono 2", "HU5: Tono 3"])
    botones(n, cd => "=" + cd + sufijo("HU5: Intro opciones"));
  const sufijoJson = `{{ $json._g ? '${SUF}' + $json._g : '' }}`;
  botones("Descripcion editada", cd => "=" + cd + sufijoJson);
  botones("Video: edit ok", cd => "=" + cd + sufijoJson);
  botones("HU5: Reconfirmar", cd => "=" + cd + sufijoJson);

  // ── 2. el switch de imagen única compara por prefijo, no por igualdad
  for (const r of nodo("Que boton toco?").parameters.rules.values)
    for (const c of r.conditions.conditions) c.operator.operation = "startsWith";
  log.push("Que boton toco?: equals -> startsWith");

  // ── 3. los parsers descartan el sufijo (y, en la edición, lo guardan para los botones nuevos)
  const code = (name, viejo, nuevo) => {
    const n = nodo(name);
    if (!n.parameters.jsCode.includes(viejo)) throw new Error(`${name}: no encontré «${viejo.slice(0, 60)}»`);
    n.parameters.jsCode = n.parameters.jsCode.replace(viejo, nuevo);
    log.push("código: " + name);
  };
  const STRIP = ".replace(/_g\\d+$/, '')";
  const GRAW = "(String(" + TRIG + ".callback_query.data || '').match(/_g(\\d+)$/) || [])[1] || ''";
  code("Elegir fila a publicar",
    "const data = $('Telegram Trigger').first().json.callback_query?.data || 'pub_1';",
    "const data = String($('Telegram Trigger').first().json.callback_query?.data || 'pub_1')" + STRIP + ";");
  code("A: Elegir opción",
    "const data = $('Telegram Trigger').first().json.callback_query.data;",
    "const data = String($('Telegram Trigger').first().json.callback_query.data || '')" + STRIP + ";\n" +
    "$getWorkflowStaticData('global')['editAnchor_' + String($('Telegram Trigger').first().json.callback_query.message.chat.id)] = " + GRAW + ";");
  code("Sched: Set pendiente", "const data = String(cb.data || '');", "const data = String(cb.data || '')" + STRIP + ";");
  code("HU5: Pub preparar", "const data = String(cb.data || '');", "const data = String(cb.data || '')" + STRIP + ";");
  code("HU5: Set edit pendiente", "const data = String(cb.data || '');", "const data = String(cb.data || '')" + STRIP + ";");
  code("HU5: Set edit pendiente",
    "store['editPending_' + chatId] = { gid, n: Number(n), ts: Date.now() };",
    "store['editPending_' + chatId] = { gid, n: Number(n), ts: Date.now(), g: " + GRAW + " };");
  code("HU5: Aplicar edición",
    "delete store['editPending_' + inp.chatId];\nreturn [{ json: { chatId: inp.chatId, gid: inp.gid, n: inp.n, caption: inp.text } }];",
    "const _g = (store['editPending_' + inp.chatId] || {}).g || '';\ndelete store['editPending_' + inp.chatId];\n" +
    "return [{ json: { chatId: inp.chatId, gid: inp.gid, n: inp.n, caption: inp.text, _g } }];");
  code("Video: edit pedir", "store['videoEditPending_'+chatId]={ n };", "store['videoEditPending_'+chatId]={ n, g: " + GRAW + " };");
  code("Video: aplicar edit",
    "delete store['videoEditPending_'+inp.chatId];\nreturn [{ json:{ chatId:inp.chatId, n:inp.n, caption:inp.text } }];",
    "const _g=(store['videoEditPending_'+inp.chatId]||{}).g||'';\ndelete store['videoEditPending_'+inp.chatId];\n" +
    "return [{ json:{ chatId:inp.chatId, n:inp.n, caption:inp.text, _g } }];");

  // ── 4. nodos nuevos (credenciales y versiones copiadas de nodos existentes del mismo lado)
  const tg = nodo("Publicar: Lock"), tgSend = nodo("B: Intro opciones");
  const ifBase = nodo("Sched: ¿es prog?"), swBase = nodo("Router callback");
  const pos = (ref, dx, dy) => [nodo(ref).position[0] + dx, nodo(ref).position[1] + dy];
  const nuevo = (n) => { wf.nodes.push(n); N[n.name] = n; log.push("nodo nuevo: " + n.name); return n; };
  const id = s => "grp-" + s;

  // 4a. carrusel: mensaje de introducción entre «HU5: Crear pendiente» y «HU5: Tono 1»
  nuevo({ ...structuredClone(tgSend), id: id("hu5-intro"), name: "HU5: Intro opciones", position: pos("HU5: Tono 1", 0, -160),
    parameters: { ...structuredClone(tgSend.parameters),
      chatId: "={{ $('HU5: Parsear copys').first().json.chatId }}",
      text: "✨ ¡Listo! Te dejé 3 versiones para tu carrusel. Elegí con cuál publicar 👇" } });
  const crearPend = C["HU5: Crear pendiente"].main;
  for (const br of crearPend) for (const t of br || []) if (t.node === "HU5: Tono 1") t.node = "HU5: Intro opciones";
  C["HU5: Intro opciones"] = { main: [[{ node: "HU5: Tono 1", type: "main", index: 0 }]] };

  // 4b. registro de ids y textos, al final de cada envío de versiones
  const registrar = (nombre, intro, ops, ref) => {
    nuevo({ id: id(nombre.replace(/\W+/g, "-").toLowerCase()), name: nombre, type: "n8n-nodes-base.code",
      typeVersion: nodo("Elegir fila a publicar").typeVersion, position: pos(ref, 220, 0),
      parameters: { jsCode:
`// Candado de grupo: registra ids y textos exactos de las 3 versiones enviadas.
const intro = $('${intro}').first().json.result;
const store = $getWorkflowStaticData('global');
const now = Date.now();
for (const k of Object.keys(store)) if (k.indexOf('grupo_') === 0 && now - (store[k].ts || 0) > 7 * 864e5) delete store[k];
store['grupo_' + intro.message_id] = { chatId: String(intro.chat.id), ts: now,
  msgs: ${JSON.stringify(ops)}.map(n => $(n).first().json.result).map(m => ({ id: m.message_id, text: m.text })) };
return [{ json: { grupo: intro.message_id } }];` } });
    C[ref] = { main: [[{ node: nombre, type: "main", index: 0 }]] };
  };
  registrar("Grupo: registrar imagen", "B: Intro opciones", ["B: Opción 1", "B: Opción 2", "B: Opción 3"], "B: Opción 3");
  registrar("Grupo: registrar video", "Video: intro", ["Video: Opción 1", "Video: Opción 2", "Video: Opción 3"], "Video: Opción 3");
  registrar("Grupo: registrar carrusel", "HU5: Intro opciones", ["HU5: Tono 1", "HU5: Tono 2", "HU5: Tono 3"], "HU5: Tono 3");

  // 4c. edición de imagen única: pasa el id de grupo a los botones del texto editado
  nuevo({ id: id("edit-anchor"), name: "Edit: anchor", type: "n8n-nodes-base.code",
    typeVersion: nodo("Elegir fila a publicar").typeVersion, position: pos("Descripcion editada", -220, 120),
    parameters: { jsCode:
`// Candado de grupo: recupera el id de grupo de la versión que se está editando.
const chatId = String($('Telegram Trigger').first().json.message.chat.id);
const g = $getWorkflowStaticData('global')['editAnchor_' + chatId] || '';
return $input.all().map(i => ({ json: { ...i.json, _g: g } }));` } });
  for (const br of C["Descripcion en columna H"].main) for (const t of br || []) if (t.node === "Descripcion editada") t.node = "Edit: anchor";
  C["Edit: anchor"] = { main: [[{ node: "Descripcion editada", type: "main", index: 0 }]] };

  // 4d. cadena del candado
  const P0 = pos("Publicar: Lock", -900, 400);
  const at = (dx, dy) => [P0[0] + dx, P0[1] + dy];
  const ifN = structuredClone(ifBase);
  Object.assign(ifN, { id: id("tiene"), name: "Grupo: ¿tiene id?", position: at(0, 0) });
  const cond = ifN.parameters.conditions.conditions[0];
  Object.assign(cond, { id: "grp-tiene", leftValue: `={{ ${TRIG}.callback_query.data }}`, rightValue: "_g\\d+$",
    operator: { type: "string", operation: "regex" } });
  nuevo(ifN);

  nuevo({ ...structuredClone(tg), id: id("lock"), name: "Grupo: Lock", position: at(220, -80), onError: "continueErrorOutput",
    parameters: { ...structuredClone(tg.parameters),
      chatId: `={{ ${TRIG}.callback_query.message.chat.id }}`,
      messageId: `={{ (String(${TRIG}.callback_query.data).match(/_g(\\d+)$/) || [])[1] }}`,
      text: LOCK_TXT } });

  nuevo({ ...structuredClone(tgSend), id: id("ya"), name: "Grupo: ya elegida", position: at(440, 80),
    parameters: { ...structuredClone(tgSend.parameters), chatId: `={{ ${TRIG}.callback_query.message.chat.id }}`, text: YA_TXT } });

  nuevo({ id: id("hermanas"), name: "Grupo: quitar botones", type: "n8n-nodes-base.code",
    typeVersion: nodo("Elegir fila a publicar").typeVersion, position: at(440, -240),
    parameters: { jsCode:
`// Candado de grupo: las otras versiones pierden el teclado (se reenvía su texto tal cual).
const cb = $('Telegram Trigger').first().json.callback_query;
const m = String(cb.data || '').match(/_g(\\d+)$/);
const g = m && $getWorkflowStaticData('global')['grupo_' + m[1]];
if (!g) return [];
return g.msgs.filter(x => x.id !== cb.message.message_id && x.text)
  .map(x => ({ json: { chatId: g.chatId, messageId: x.id, text: x.text } }));` } });

  nuevo({ ...structuredClone(tg), id: id("editar"), name: "Grupo: editar hermanas", position: at(660, -240), onError: "continueRegularOutput",
    parameters: { ...structuredClone(tg.parameters), chatId: "={{ $json.chatId }}", messageId: "={{ $json.messageId }}", text: "={{ $json.text }}" } });

  const sw = structuredClone(swBase);
  Object.assign(sw, { id: id("continuar"), name: "Grupo: continuar", position: at(660, 0) });
  const plantilla = sw.parameters.rules.values[0];
  sw.parameters.rules.values = ["prog", "pubVid_", "pubCar_"].map((p, i) => {
    const r = structuredClone(plantilla);
    Object.assign(r.conditions.conditions[0], { id: "grp-cont-" + i, leftValue: `={{ ${TRIG}.callback_query.data }}`, rightValue: p });
    r.conditions.conditions[0].operator = { type: "string", operation: "startsWith" };
    return r;
  });
  nuevo(sw);

  // ── 5. cableado
  const a = n => ({ node: n, type: "main", index: 0 });
  C["Grupo: ¿tiene id?"] = { main: [[a("Grupo: Lock")], [a("Grupo: continuar")]] };
  C["Grupo: Lock"] = { main: [[a("Grupo: quitar botones"), a("Grupo: continuar")], [a("Grupo: ya elegida")]] };
  C["Grupo: quitar botones"] = { main: [[a("Grupo: editar hermanas")]] };
  C["Grupo: continuar"] = { main: [[a("Sched: Set pendiente")], [a("Video: pub answer")], [a("HU5: Pub answer")], [a("Publicar: Lock")]] };
  const redirigir = (src, idx, viejo) => {
    const br = C[src].main[idx];
    const t = br.find(x => x.node === viejo);
    if (!t) throw new Error(`${src}[${idx}] no apunta a ${viejo}`);
    t.node = "Grupo: ¿tiene id?";
    log.push(`cable: ${src}[${idx}] ${viejo} -> Grupo: ¿tiene id?`);
  };
  for (const i of [1, 3, 5, 6]) redirigir("Que boton toco?", i, "Publicar: Lock");
  redirigir("Sched: ¿es prog?", 0, "Sched: Set pendiente");
  redirigir("Router callback", 5, "HU5: Pub answer");
  redirigir("Router callback", 10, "Video: pub answer");

  // ── 6. tras la cadena, $json ya no es el update: los nodos que siguen leen del disparador
  for (const n of ["Video: pub answer", "HU5: Pub answer"]) {
    const p = nodo(n).parameters;
    if (p.queryId !== "={{ $json.callback_query.id }}") throw new Error(n + ": queryId inesperado " + p.queryId);
    p.queryId = `={{ ${TRIG}.callback_query.id }}`;
    log.push("queryId desde el disparador: " + n);
  }

  // ── validación: todo cable apunta a un nodo que existe, y ningún nodo tras la cadena lee $json.callback_query
  for (const [s, o] of Object.entries(C)) {
    if (!N[s]) throw new Error("conexión desde nodo inexistente: " + s);
    for (const br of o.main || []) for (const t of br || []) if (!N[t.node]) throw new Error(`${s} -> inexistente ${t.node}`);
  }
  const vistos = new Set(), cola = ["Grupo: continuar"];
  while (cola.length) {
    const x = cola.shift(); if (vistos.has(x)) continue; vistos.add(x);
    for (const br of (C[x] || {}).main || []) for (const t of br || []) cola.push(t.node);
  }
  const rotos = [...vistos].filter(x => JSON.stringify(N[x].parameters).includes("$json.callback_query"));
  if (rotos.length) throw new Error("tras el candado siguen leyendo $json.callback_query: " + rotos.join(", "));
  log.push(`validado: ${vistos.size} nodos alcanzables tras el candado, ninguno lee $json.callback_query`);
  return log;
}

// ── instancia local
const wf = await (await fetch(`${BASE}/workflows/${ID}`, { headers: H })).json();
const repo = JSON.parse(readFileSync(RUTA, "utf-8"));
const logL = transformar(wf);
const logR = transformar(repo);
console.log(logL.join("\n"));
console.log(`\nlocal: ${wf.nodes.length} nodos · repo: ${repo.nodes.length} nodos · mismos pasos: ${JSON.stringify(logL) === JSON.stringify(logR)}`);
if (!DEPLOY) { console.log("(simulación: agregar --deploy)"); process.exit(0); }

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const orig = await (await fetch(`${BASE}/workflows/${ID}`, { headers: H })).json();
writeFileSync(`workflows/_local-${ID}-respaldo-${stamp}.json`, JSON.stringify(orig, null, 2));
writeFileSync(RUTA, JSON.stringify(repo, null, 2) + "\n");
const put = await fetch(`${BASE}/workflows/${ID}`, { method: "PUT", headers: H,
  body: JSON.stringify({ name: wf.name, nodes: wf.nodes, connections: wf.connections, settings: { executionOrder: "v1" } }) });
console.log("PUT:", put.status, put.ok ? "" : (await put.text()).slice(0, 400));
if (!put.ok) process.exit(1);
const d = await fetch(`${BASE}/workflows/${ID}/deactivate`, { method: "POST", headers: H });
const act = await fetch(`${BASE}/workflows/${ID}/activate`, { method: "POST", headers: H });
console.log("reactivado:", d.status, act.status, act.ok ? "" : (await act.text()).slice(0, 300));
