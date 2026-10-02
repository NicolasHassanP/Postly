// node --test scripts/fix-config-por-usuaria.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { configDe, parchear } from "./fix-config-por-usuaria.mjs";

const AsyncFunction = (async () => {}).constructor;
const wfRepo = () => JSON.parse(readFileSync(new URL("../workflows/Postly - Entrega Final Sprint 1 v2.json", import.meta.url), "utf-8"));
const NODOS = { "Code in JavaScript1": "Leer Config", "HU5: Pub preparar": "HU5: Pub leer Config",
                "Sched: Procesar": "Sched: Leer Config", "Video: pub publicar": "Video: pub Config" };

// Corre solo la cabecera inyectada + la lectura reescrita, con $ simulado.
function firmaDe(codigo, lector, trigger, filas) {
  const cabecera = codigo.slice(0, codigo.indexOf("// fin HU9 multi-usuaria"));
  const lectura = `({ json: _configDe($('${lector}').all().map(i => i.json), _uidCfg) })`;
  const $ = (n) => n === "Telegram Trigger"
    ? { first: () => ({ json: trigger }) }
    : { all: () => filas.map((json) => ({ json })) };
  return new Function("$", `${cabecera}; return ${lectura}.json.firma;`)($);
}

test("el parche toca los 4 nodos, compila y es idempotente", () => {
  const wf = wfRepo();
  parchear(wf);
  assert.equal(parchear(wf), 0);
  for (const [nombre, lector] of Object.entries(NODOS)) {
    const c = wf.nodes.find((x) => x.name === nombre).parameters.jsCode;
    assert.ok(!c.includes(`$('${lector}').first()`), `${nombre} sigue usando .first()`);
    assert.doesNotThrow(() => new AsyncFunction("$", c), nombre);
  }
});

test("cada lector de Config corre UNA vez aunque le lleguen N filas (429 de Sheets con 59 posts)", () => {
  const wf = wfRepo(); parchear(wf);
  for (const lector of Object.values(NODOS))
    assert.equal(wf.nodes.find((x) => x.name === lector).executeOnce, true, lector);
});

test("dentro del nodo, el chat sale del botón (callback) o del mensaje", () => {
  const wf = wfRepo(); parchear(wf);
  const filas = [{ TelegramUserID: "111", firma: "-- Ana --" }, { TelegramUserID: "222", firma: "-- Bea --" }];
  for (const [nombre, lector] of Object.entries(NODOS)) {
    const c = wf.nodes.find((x) => x.name === nombre).parameters.jsCode;
    assert.equal(firmaDe(c, lector, { callback_query: { message: { chat: { id: 222 } } } }, filas), "-- Bea --", nombre);
    assert.equal(firmaDe(c, lector, { message: { chat: { id: 111 } } }, filas), "-- Ana --", nombre);
  }
});

const ana = { TelegramUserID: "111", firma: "-- Ana --", contacto: "WA Ana" };
const bea = { TelegramUserID: "222", firma: "-- Bea --", contacto: "WA Bea" };
const general = { TelegramUserID: "", firma: "-- General --", contacto: "" };

test("elige la fila de la usuaria que publica", () => {
  assert.equal(configDe([ana, bea], "222").firma, "-- Bea --");
  assert.equal(configDe([ana, bea], "111").firma, "-- Ana --");
});

test("sin fila propia usa la fila sin dueña (compatibilidad con la hoja de una sola fila)", () => {
  assert.equal(configDe([ana, general], "333").firma, "-- General --");
  assert.equal(configDe([{ firma: "-- Vieja --", contacto: "" }], "111").firma, "-- Vieja --");
});

test("nunca devuelve la firma de OTRA usuaria", () => {
  assert.deepEqual(configDe([ana, bea], "333"), {});
});

test("la fila propia gana aunque la general esté primero", () => {
  assert.equal(configDe([general, ana], "111").firma, "-- Ana --");
});

test("encabezado sin distinguir mayúsculas ni espacios, e id numérico en la hoja", () => {
  assert.equal(configDe([{ " telegramuserid ": 222, firma: "-- Bea --" }], "222").firma, "-- Bea --");
});

test("hoja vacía o lectura sin filas (alwaysOutputData devuelve un ítem vacío)", () => {
  assert.deepEqual(configDe([], "111"), {});
  assert.deepEqual(configDe([{}], "111"), {});
});
