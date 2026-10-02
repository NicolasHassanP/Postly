// Feedback Loop (HU14): "Leer usuarios" se ejecutaba una vez por cada publicación que trae
// "Leer publicados" (una lectura de Sheets por post). Con más de 60 publicados, la cuota de
// Sheets (60 lecturas/min) corta el Cron diario. "Traer métricas" ya lee los usuarios con
// .all(), así que alcanza con leerlos una sola vez. Lo vigila scripts/lecturas-multiplicadas.test.mjs.
//
// Uso:  node scripts/fix-feedback-leer-usuarios-once.mjs                 (solo el repo)
//       N8N_VPS_URL=https://<host> node scripts/fix-feedback-leer-usuarios-once.mjs --deploy
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "workflows/Postly - Feedback Loop.json";
const ID_VPS = "NmBryYPdCd91bZ4G";

function parchear(wf) {
  const n = wf.nodes.find((x) => x.name === "Leer usuarios");
  if (n.executeOnce) return false;
  n.executeOnce = true;
  return true;
}

const repo = JSON.parse(readFileSync(RUTA, "utf-8"));
const cambio = parchear(repo);
if (cambio) writeFileSync(RUTA, JSON.stringify(repo, null, 2) + "\n", "utf-8");
console.log(`repo: ${cambio ? "parcheado" : "ya estaba parcheado"}`);

if (process.argv.includes("--deploy")) {
  const e = { ...process.env };
  for (const l of readFileSync(".env", "utf-8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !e[m[1]]) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  const BASE = (e.N8N_VPS_URL || "").replace(/\/$/, "");
  if (!BASE || !e.N8N_API_KEY_VPS) { console.error("faltan N8N_VPS_URL / N8N_API_KEY_VPS"); process.exit(1); }
  const cab = { "X-N8N-API-KEY": e.N8N_API_KEY_VPS, "content-type": "application/json" };
  const r = await fetch(`${BASE}/api/v1/workflows/${ID_VPS}`, { headers: cab });
  const vps = await r.json();
  if (!parchear(vps)) { console.log("VPS: ya estaba parcheado"); process.exit(0); }
  const put = await fetch(`${BASE}/api/v1/workflows/${ID_VPS}`, {
    method: "PUT", headers: cab,
    body: JSON.stringify({ name: vps.name, nodes: vps.nodes, connections: vps.connections, settings: { executionOrder: "v1" } }),
  });
  console.log(`VPS: PUT -> ${put.status} (activo: ${vps.active})`);
}
