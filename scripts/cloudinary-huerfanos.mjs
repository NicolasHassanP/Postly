// Solo lectura: lista los assets de Cloudinary y los cruza contra un CSV exportado de la hoja "Hoja 1".
// Un asset es "referenciado" si su public_id aparece en cualquier celda del CSV (URL de Cloudinary).
// NO borra nada. Uso (desde la raíz, para que Node cargue .env sin que nadie lo imprima):
//   node --env-file=.env scripts/cloudinary-huerfanos.mjs "<hoja1.csv>" "<salida.json>"
import { readFileSync, writeFileSync } from 'node:fs';

const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
if (!cloud || !key || !secret) throw new Error('Faltan CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET en el entorno');
const [csvPath, outPath] = process.argv.slice(2);
if (!csvPath || !outPath) throw new Error('Uso: node --env-file=.env scripts/cloudinary-huerfanos.mjs <hoja1.csv> <salida.json>');

const auth = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
const csv = readFileSync(csvPath, 'utf8');

async function listar(tipo) {
  const out = [];
  let cursor;
  do {
    const url = new URL(`https://api.cloudinary.com/v1_1/${cloud}/resources/${tipo}/upload`);
    url.searchParams.set('max_results', '500');
    if (cursor) url.searchParams.set('next_cursor', cursor);
    const r = await fetch(url, { headers: { Authorization: auth } });
    if (!r.ok) throw new Error(`${tipo}: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    out.push(...j.resources.map((x) => ({
      tipo, public_id: x.public_id, formato: x.format, bytes: x.bytes, creado: x.created_at,
    })));
    cursor = j.next_cursor;
  } while (cursor);
  return out;
}

const assets = [...await listar('image'), ...await listar('video')];
for (const a of assets) a.referenciado = csv.includes(a.public_id);

const huerfanos = assets.filter((a) => !a.referenciado);
const resumen = (xs) => ({
  total: xs.length,
  imagenes: xs.filter((a) => a.tipo === 'image').length,
  videos: xs.filter((a) => a.tipo === 'video').length,
  mb: +(xs.reduce((s, a) => s + a.bytes, 0) / 1048576).toFixed(1),
});
const porMes = {};
for (const a of huerfanos) { const m = a.creado.slice(0, 7); porMes[m] = (porMes[m] || 0) + 1; }

writeFileSync(outPath, JSON.stringify({ resumen: { todos: resumen(assets), huerfanos: resumen(huerfanos), referenciados: resumen(assets.filter((a) => a.referenciado)) }, huerfanosPorMes: porMes, assets }, null, 1));
console.log('todos        ', resumen(assets));
console.log('referenciados', resumen(assets.filter((a) => a.referenciado)));
console.log('huérfanos    ', resumen(huerfanos));
console.log('huérfanos por mes de subida', porMes);
console.log('detalle en', outPath);
