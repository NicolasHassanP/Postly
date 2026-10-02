// node --test scripts/fix-nombres-if-precio.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renombrar, NOMBRES } from "./fix-nombres-if-precio.mjs";

const textoRepo = () => readFileSync(new URL("../workflows/Postly - Entrega Final Sprint 1 v2.json", import.meta.url), "utf-8");
// el estado anterior al renombre, reconstruido desde el repo (que ya lo tiene aplicado)
const wfRepo = () => {
  let s = textoRepo();
  for (const [v, n] of Object.entries(NOMBRES)) s = s.split(n).join(v);
  return JSON.parse(s);
};
const viejo = (wf) => Object.keys(NOMBRES).filter((v) => JSON.stringify(wf).includes(v));

test("los cinco IF dicen lo que evalúan: true es la rama que bloquea", () => {
  const wf = wfRepo();
  renombrar(wf);
  for (const nuevo of Object.values(NOMBRES)) {
    const n = wf.nodes.find((x) => x.name === nuevo);
    assert.ok(n, `falta ${nuevo}`);
    assert.equal(n.type, "n8n-nodes-base.if");
    const cond = n.parameters.conditions.conditions[0];
    assert.match(cond.leftValue, /\$json\.(tiene_precio|blocked)/);
    assert.equal(cond.operator.operation, "true");
    const [siTrue] = wf.connections[nuevo].main;
    assert.ok(siTrue.some((c) => /precio|bloquead/i.test(c.node)), `${nuevo}: true no va al aviso`);
  }
});

test("no queda ningún nombre viejo, ni en la versión activa ni en las conexiones", () => {
  const wf = wfRepo();
  renombrar(wf);
  assert.deepEqual(viejo(wf), []);
  for (const [origen, v] of Object.entries(wf.connections))
    for (const salida of v.main || []) for (const c of salida || [])
      assert.ok(wf.nodes.some((n) => n.name === c.node), `${origen} → ${c.node} apunta a un nodo inexistente`);
});

test("la lógica no cambia: el workflow es idéntico salvo los nombres", () => {
  const antes = wfRepo();
  const despues = wfRepo();
  renombrar(despues);
  let s = JSON.stringify(antes);
  for (const [v, n] of Object.entries(NOMBRES)) s = s.split(v).join(n);
  assert.equal(JSON.stringify(despues), s);
});

test("aplicado al estado anterior, reproduce exactamente el JSON del repo", () => {
  const wf = wfRepo();
  renombrar(wf);
  assert.deepEqual(wf, JSON.parse(textoRepo()));
});

test("es idempotente", () => {
  const wf = wfRepo();
  assert.ok(renombrar(wf) > 0);
  assert.equal(renombrar(wf), 0);
});
