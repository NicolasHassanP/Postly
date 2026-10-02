// T-01 de la auditoría 16: cinco IF se llamaban «¿… limpio?» y evalúan lo contrario.
//
// «HU8: ¿Imagen limpia?» pregunta `tiene_precio == true` y manda la salida *true* al bloqueo: la
// lógica es correcta, pero el nombre dice que *true* es «limpia», y leído en el canvas (Figura 11)
// parece que bloquea las imágenes limpias. Lo mismo en los otros cuatro. Se renombran a lo que
// evalúan; la lógica no se toca.
//
// El renombre recorre el objeto entero —claves y valores, también la versión activa que el GET
// trae anidada y los ids de condición que repiten el nombre— porque n8n referencia los nodos por
// nombre en las conexiones y en las expresiones `$('…')`.
//
// Uso:  node scripts/fix-nombres-if-precio.mjs                 (solo el JSON del repo)
//       N8N_VPS_URL=https://<host> node scripts/fix-nombres-if-precio.mjs --deploy
// Test: node --test scripts/fix-nombres-if-precio.test.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const NOMBRES = {
  "HU8: ¿Imagen limpia?": "HU8: ¿Precio en imagen?",
  "HU5: ¿Carrusel limpio?": "HU5: ¿Precio en carrusel?",
  "HU5: ¿Pub limpio?": "HU5: ¿Pub bloqueada?",
  "Video: ¿frame limpio?": "Video: ¿precio en frame?",
  "Repost: ¿imagen limpia?": "Repost: ¿precio en imagen?",
};

const cambiar = (s) => {
  let r = s;
  for (const [v, n] of Object.entries(NOMBRES)) r = r.split(v).join(n);
  return r;
};

// Devuelve cuántas cadenas (claves o valores) cambió.
export function renombrar(obj) {
  let cambios = 0;
  const recorrer = (x) => {
    if (Array.isArray(x)) {
      x.forEach((v, i) => {
        if (typeof v === "string") { const c = cambiar(v); if (c !== v) { x[i] = c; cambios++; } }
        else if (v && typeof v === "object") recorrer(v);
      });
      return;
    }
    for (const k of Object.keys(x)) {
      let v = x[k];
      if (typeof v === "string") { const c = cambiar(v); if (c !== v) { x[k] = v = c; cambios++; } }
      else if (v && typeof v === "object") recorrer(v);
      const nk = cambiar(k);
      if (nk !== k) {                       // conservar el orden de las claves
        const resto = Object.keys(x).slice(Object.keys(x).indexOf(k) + 1).map((r) => [r, x[r]]);
        delete x[k];
        x[nk] = v;
        for (const [r, rv] of resto) { delete x[r]; x[r] = rv; }
        cambios++;
      }
    }
  };
  recorrer(obj);
  return cambios;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
  const ID_VPS = "xwYkQA25a6IjRmqX";
  const repo = JSON.parse(readFileSync(RUTA, "utf-8"));
  const n = renombrar(repo);
  if (n) writeFileSync(RUTA, JSON.stringify(repo, null, 2) + "\n", "utf-8");
  console.log(`repo: ${n ? `${n} cadenas renombradas` : "ya estaba renombrado"}`);

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
    const nv = renombrar(vps);
    if (!nv) { console.log("VPS: ya estaba renombrado"); process.exit(0); }
    await api("PUT", `/workflows/${ID_VPS}`, {
      name: vps.name, nodes: vps.nodes, connections: vps.connections, settings: { executionOrder: "v1" },
    });
    await api("POST", `/workflows/${ID_VPS}/deactivate`);
    await api("POST", `/workflows/${ID_VPS}/activate`);
    const fin = await api("GET", `/workflows/${ID_VPS}`);
    console.log(`VPS: ${nv} cadenas renombradas y reactivado — ${fin.nodes.length} nodos, activo: ${fin.active}`);
  }
}
