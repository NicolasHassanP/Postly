// Borra de Cloudinary los assets propios que no respaldan ninguna fila de la hoja.
// Entrada: el JSON que produce cloudinary-huerfanos.mjs. Excluye los ejemplos de fábrica de Cloudinary.
// Por defecto es una PRUEBA EN SECO: solo muestra qué borraría. El borrado real exige --borrar.
//   node --env-file=C:/dev/Tesis/.env scripts/cloudinary-borrar-huerfanos.mjs <cruce.json> <lista-borrados.json> [--borrar]
// Cloudinary no tiene papelera: antes de borrar se guarda la lista (id, tipo, fecha, tamaño; sin imágenes).
import { readFileSync, writeFileSync } from 'node:fs';

const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
if (!cloud || !key || !secret) throw new Error('Faltan CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET en el entorno');
const [cruce, listaOut, flag] = process.argv.slice(2);
if (!cruce || !listaOut) throw new Error('Uso: <cruce.json> <lista-borrados.json> [--borrar]');
const borrar = flag === '--borrar';

const esEjemplo = (id) => /^(samples\/|main-sample$|cld-sample)/.test(id);
const todos = JSON.parse(readFileSync(cruce, 'utf8')).assets;
const aBorrar = todos.filter((a) => !a.referenciado && !esEjemplo(a.public_id));

const cuenta = (xs) => ({ total: xs.length, imagenes: xs.filter((a) => a.tipo === 'image').length,
  videos: xs.filter((a) => a.tipo === 'video').length, mb: +(xs.reduce((s, a) => s + a.bytes, 0) / 1048576).toFixed(1) });
console.log('a borrar      ', cuenta(aBorrar));
console.log('se conservan  ', cuenta(todos.filter((a) => !aBorrar.includes(a))), '(referenciados + ejemplos de fábrica)');

writeFileSync(listaOut, JSON.stringify({ generado: new Date().toISOString(), borrado: borrar, assets: aBorrar }, null, 1));
console.log('lista guardada en', listaOut);
if (!borrar) { console.log('PRUEBA EN SECO: no se borró nada. Agregá --borrar para borrar.'); process.exit(0); }

const auth = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
let borrados = 0;
for (const tipo of ['image', 'video']) {
  const ids = aBorrar.filter((a) => a.tipo === tipo).map((a) => a.public_id);
  for (let i = 0; i < ids.length; i += 100) {
    const lote = ids.slice(i, i + 100);
    const url = new URL(`https://api.cloudinary.com/v1_1/${cloud}/resources/${tipo}/upload`);
    for (const id of lote) url.searchParams.append('public_ids[]', id);
    url.searchParams.set('invalidate', 'true');
    const r = await fetch(url, { method: 'DELETE', headers: { Authorization: auth } });
    if (!r.ok) throw new Error(`${tipo}: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
    const j = await r.json();
    borrados += Object.values(j.deleted).filter((v) => v === 'deleted').length;
    console.log(`${tipo}: lote ${i / 100 + 1}, borrados acumulados ${borrados}`);
  }
}
console.log('listo. borrados:', borrados, 'de', aBorrar.length);
