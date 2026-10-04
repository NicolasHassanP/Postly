// Crea el BORRADOR de la version 2.1.0 del registro abierto de Postly. NO publica.
import { readFileSync } from 'node:fs';
const T = process.env.ZENODO_TOKEN;
const H = { Authorization: `Bearer ${T}`, 'User-Agent': 'Mozilla/5.0 postly-deposito' };
const API = 'https://zenodo.org/api';
const ULTIMA = 23029245; // 2.0.1, ultima version publicada del registro abierto
const ZIP = 'avance/deposito/PARA_JERE_Zenodo_v21/Postly_abierto_v2.1.0.zip';
const PARRAFO = '<p><strong>Versión 2.1.0.</strong> Agrega la repetición de los 29 casos del canal de imagen con la respuesta cruda del modelo (carpeta casos_imagen_cruda/). Ver la sección «Versión 2.1.0» de LEEME.md.</p>\n\n';
const j = async (r) => { const t = await r.text(); if (!r.ok) throw new Error(`${r.status} ${t.slice(0, 300)}`); return t ? JSON.parse(t) : {}; };

const nv = await j(await fetch(`${API}/deposit/depositions/${ULTIMA}/actions/newversion`, { method: 'POST', headers: H }));
const draftUrl = nv.links.latest_draft;
let d = await j(await fetch(draftUrl, { headers: H }));
console.log('borrador', d.id, d.state, 'archivos heredados:', d.files.map(f => f.filename));
for (const f of d.files) await j(await fetch(`${API}/deposit/depositions/${d.id}/files/${f.id}`, { method: 'DELETE', headers: H }));
const zip = readFileSync(ZIP);
await j(await fetch(`${d.links.bucket}/Postly_abierto_v2.1.0.zip`, { method: 'PUT', headers: { ...H, 'Content-Type': 'application/octet-stream' }, body: zip }));
const m = d.metadata;
m.version = '2.1.0';
m.publication_date = '2026-10-04';
if (!m.description.includes('Versión 2.1.0')) m.description = PARRAFO + m.description;
d = await j(await fetch(`${API}/deposit/depositions/${d.id}`, { method: 'PUT', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ metadata: m }) }));
console.log('borrador listo:', d.id, '| estado', d.state, '| version', d.metadata.version, '| fecha', d.metadata.publication_date);
console.log('archivos:', d.files.map(f => `${f.filename} (${(f.filesize / 1e6).toFixed(2)} MB)`));
console.log('DOI reservado:', d.metadata.prereserve_doi?.doi);
console.log('revisar en:', d.links.html);
console.log('descripcion (inicio):', d.metadata.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 260));
console.log('licencia:', JSON.stringify(d.metadata.license), '| access_right:', d.metadata.access_right, '| creadores:', d.metadata.creators.length);
