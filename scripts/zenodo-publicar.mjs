// Publica un borrador de Zenodo (irreversible). Uso: node --env-file=.env scripts/zenodo-publicar.mjs <id>
const T = process.env.ZENODO_TOKEN, id = process.argv[2];
const H = { Authorization: `Bearer ${T}`, 'User-Agent': 'Mozilla/5.0 postly-deposito' };
const r = await fetch(`https://zenodo.org/api/deposit/depositions/${id}/actions/publish`, { method: 'POST', headers: H });
const j = await r.json().catch(() => ({}));
console.log('HTTP', r.status, '| estado', j.state, '| doi', j.doi, '| concepto', j.conceptdoi, '| version', j.metadata?.version, '| fecha', j.metadata?.publication_date, '| archivos', j.files?.map(f => f.filename));
if (!r.ok) console.log(JSON.stringify(j).slice(0, 400));
