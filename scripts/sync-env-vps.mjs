// Copia las variables propias de Postly del .env local al .env del VPS, por SSH.
// Los valores viajan por stdin (no quedan en la línea de comando) y NO se imprimen.
// Uso: node scripts/sync-env-vps.mjs
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const VARS = ["POSTLY_ENC_KEY", "META_ACCESS_TOKEN", "META_APP_ID", "META_APP_SECRET",
              "META_CONFIG_ID", "META_PAGE_ID", "IG_BUSINESS_ID",
              "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const SSH = ["-p", "5472", "-o", "BatchMode=yes", "root@201.32.129.22"];

const env = {};
for (const linea of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
}

const faltan = VARS.filter((k) => !env[k]);
if (faltan.length) console.log("vacías o ausentes en el .env local (no se copian):", faltan.join(", "));
const copiar = VARS.filter((k) => env[k]);
if (!copiar.length) process.exit(1);

// En el server: borra las líneas viejas de esas claves, agrega las nuevas y recrea n8n.
const remoto = [
  "set -e", "cd /opt/n8n", "umask 077", "cat > /tmp/postly.env",
  "for k in $(cut -d= -f1 /tmp/postly.env); do grep -v \"^$k=\" .env > .env.tmp || true; mv .env.tmp .env; done",
  "cat /tmp/postly.env >> .env", "rm -f /tmp/postly.env", "chmod 600 .env",
  "docker compose up -d n8n >/dev/null 2>&1", "echo reiniciado",
].join(" && ");

const r = spawnSync("ssh", [...SSH, remoto], {
  input: copiar.map((k) => `${k}=${env[k]}`).join("\n") + "\n",
  encoding: "utf8",
});
if (r.status !== 0) { console.error("falló:", r.stderr); process.exit(1); }
console.log(`copiadas ${copiar.length}/${VARS.length}: ${copiar.join(", ")} — ${r.stdout.trim()}`);
