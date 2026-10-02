// node --test scripts/lecturas-multiplicadas.test.mjs
//
// En n8n, un nodo recibe N ítems y se ejecuta N veces. Si una lectura de Sheets que trae
// todas las filas de la usuaria alimenta otra llamada a Sheets/HTTP, esa llamada se repite
// una vez por fila. Pasó el 01-10: "Sched: Leer Config" corrió 59 veces (59 posts) y la
// cuota de Sheets (60 lecturas/min) cortó "Sched: Guardar" con un 429. El Feedback Loop
// tenía lo mismo con "Leer usuarios". Este test lo detecta en los seis workflows.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const WORKFLOWS = ["Entrega Final Sprint 1 v2", "Programador", "Publicar Post", "Publicar Carrusel",
                   "Feedback Loop", "HU2 OAuth Callback"];

export function llamadasMultiplicadas(wf) {
  const C = wf.connections, por = Object.fromEntries(wf.nodes.map((n) => [n.name, n]));
  const lecturaMultiple = (x) => /googleSheets/.test(x.type) && !x.executeOnce
    && (!x.parameters.operation || x.parameters.operation === "read") && !x.parameters.options?.returnFirstMatch;
  // estos nodos colapsan los N ítems en uno (o los recortan), así que cortan la propagación
  const colapsa = (x) => x.executeOnce || /limit|aggregate|merge|summarize/i.test(x.type)
    || (/\.code$/.test(x.type) && (x.parameters.mode || "runOnceForAllItems") === "runOnceForAllItems");
  const hallazgos = [];
  for (const origen of wf.nodes.filter(lecturaMultiple)) {
    const pila = [origen.name], visto = new Set();
    while (pila.length) {
      for (const rama of C[pila.pop()]?.main || []) for (const { node } of rama || []) {
        if (visto.has(node)) continue;
        visto.add(node);
        const x = por[node];
        if (!x || x.executeOnce) continue;
        if (/googleSheets|httpRequest/.test(x.type)) hallazgos.push(`${origen.name} -> ${node}`);
        if (!colapsa(x)) pila.push(node);
      }
    }
  }
  return hallazgos;
}

for (const nombre of WORKFLOWS) {
  test(`${nombre}: ninguna llamada a Sheets/HTTP se repite por cada fila leída`, () => {
    const wf = JSON.parse(readFileSync(new URL(`../workflows/Postly - ${nombre}.json`, import.meta.url), "utf-8"));
    assert.deepEqual(llamadasMultiplicadas(wf), []);
  });
}
