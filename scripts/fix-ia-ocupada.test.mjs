// node --test scripts/fix-ia-ocupada.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parchear, RAMAS } from "./fix-ia-ocupada.mjs";

const RUTA = new URL("../workflows/Postly - Entrega Final Sprint 1 v2.json", import.meta.url);
const NUEVOS = [...new Set(RAMAS.map((r) => r.aviso))].filter((n) => n !== "Video: IA ocupada");
// estado previo al parche, reconstruido desde el repo (que puede tenerlo ya aplicado)
const wfPrevio = () => {
  const wf = JSON.parse(readFileSync(RUTA, "utf-8"));
  wf.nodes = wf.nodes.filter((n) => !NUEVOS.includes(n.name));
  for (const { origen } of RAMAS) {
    const n = wf.nodes.find((x) => x.name === origen);
    if (origen !== "Video: analizar") delete n.onError;
    wf.connections[origen].main = wf.connections[origen].main.slice(0, 1);
  }
  return wf;
};

test("cada nodo de Gemini tiene salida de error hacia un aviso «IA ocupada», y la de éxito no cambia", () => {
  const antes = wfPrevio();
  const wf = wfPrevio();
  parchear(wf);
  for (const { origen, aviso } of RAMAS) {
    const n = wf.nodes.find((x) => x.name === origen);
    assert.equal(n.onError, "continueErrorOutput", origen);
    const [exito, error] = wf.connections[origen].main;
    assert.deepEqual(exito, antes.connections[origen].main[0], `${origen}: cambió la salida de éxito`);
    assert.deepEqual(error.map((c) => c.node), [aviso], origen);
    const a = wf.nodes.find((x) => x.name === aviso);
    assert.equal(a.type, "n8n-nodes-base.telegram");
    assert.match(a.parameters.text, /sobrecargada/);
  }
});

test("los avisos nuevos usan la credencial y el chatId del aviso de video de la misma instancia", () => {
  const wf = wfPrevio();
  parchear(wf);
  const video = wf.nodes.find((x) => x.name === "Video: IA ocupada");
  for (const nombre of NUEVOS) {
    const a = wf.nodes.find((x) => x.name === nombre);
    assert.deepEqual(a.credentials, video.credentials, nombre);
    assert.equal(a.parameters.chatId, video.parameters.chatId, nombre);
  }
});

test("en el canvas vigente (el del repo), los avisos no se superponen con ningún nodo", () => {
  // el canvas de E3 se reordenó con «Tidy up» el 02-10 y el repo copió esas posiciones
  const wf = JSON.parse(readFileSync(RUTA, "utf-8"));
  for (const nombre of NUEVOS) {
    const [x, y] = wf.nodes.find((n) => n.name === nombre).position;
    const cerca = wf.nodes.filter((n) => n.name !== nombre &&
      Math.abs(n.position[0] - x) < 180 && Math.abs(n.position[1] - y) < 140);
    assert.deepEqual(cerca.map((n) => n.name), [], nombre);
  }
});

test("agrega cuatro nodos y es idempotente", () => {
  const wf = wfPrevio();
  const n0 = wf.nodes.length;
  assert.ok(parchear(wf) > 0);
  assert.equal(wf.nodes.length, n0 + 4);
  assert.equal(parchear(wf), 0);
  assert.equal(wf.nodes.length, n0 + 4);
});
