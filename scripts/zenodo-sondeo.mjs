// Solo lectura: lista los depositos de la cuenta del ZENODO_TOKEN. No imprime el token.
const T = process.env.ZENODO_TOKEN;
if (!T) { console.error('Falta ZENODO_TOKEN'); process.exit(1); }
const r = await fetch('https://zenodo.org/api/deposit/depositions?size=25&all_versions=true', { headers: { Authorization: `Bearer ${T}`, 'User-Agent': 'Mozilla/5.0 postly-deposito' } });
console.log('HTTP', r.status);
const j = await r.json();
if (!Array.isArray(j)) { console.log(JSON.stringify(j).slice(0, 400)); process.exit(0); }
for (const d of j) console.log(d.id, '| conceptrecid', d.conceptrecid, '| doi', d.doi || d.metadata?.prereserve_doi?.doi, '| v', d.metadata?.version, '|', d.state, '|', d.submitted, '|', (d.title || '').slice(0, 70), '| files', d.files?.length);
