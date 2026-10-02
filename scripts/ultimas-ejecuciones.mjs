// Solo lectura: resume las últimas ejecuciones de un workflow del VPS (nodos recorridos, errores, tiempos).
// No imprime tokens ni claves ni el contenido de las filas de Usuarios, solo lo necesario para diagnosticar.
//   node --env-file=C:/dev/Tesis/.env scripts/ultimas-ejecuciones.mjs [workflowId] [cuantas]
// Por defecto: el callback de OAuth (HU2) en el VPS, las 3 últimas.
const { N8N_VPS_URL: base, N8N_API_KEY_VPS: key } = process.env;
if (!base || !key) throw new Error('Faltan N8N_VPS_URL / N8N_API_KEY_VPS en el entorno');
const wf = process.argv[2] || 'QT540ZcOfxd7VfvQ';
const n = process.argv[3] || '3';
const host = base.replace(/\/$/, '');

const r = await fetch(`${host}/api/v1/executions?workflowId=${wf}&limit=${n}&includeData=true`, { headers: { 'X-N8N-API-KEY': key } });
if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
const { data } = await r.json();

const enmascarar = (s) => (s ? '…' + String(s).slice(-4) : '(vacío)');
for (const e of data) {
  const ini = new Date(e.startedAt), fin = new Date(e.stoppedAt);
  console.log(`\n=== ejecución ${e.id} · ${e.status} · modo ${e.mode} · ${e.startedAt} · ${((fin - ini) / 1000).toFixed(1)} s`);
  const run = e.data?.resultData?.runData || {};
  const nodos = Object.entries(run)
    .map(([nombre, runs]) => ({ nombre, t: runs[0]?.startTime, ms: runs[0]?.executionTime, err: runs[0]?.error?.message, items: runs[0]?.data?.main?.[0]?.length }))
    .sort((a, b) => a.t - b.t);
  for (const x of nodos) console.log(`  ${x.err ? 'ERR' : ' ok'}  ${x.nombre}  (${x.ms} ms${x.items != null ? ', ' + x.items + ' ítem(s)' : ''})${x.err ? '  → ' + x.err : ''}`);
  // Nodos con "continuar ante error": el mensaje viaja por la segunda salida (main[1]), no por runs[0].error.
  // Solo los nodos que llaman al modelo (los Switch/IF también tienen main[1], pero es la rama "falso").
  for (const [nombre, runs] of Object.entries(run)) {
    if (!/Detecci[oó]n visual|Analyze|Gemini|Generar|HTTP Request/i.test(nombre)) continue;
    for (const [k, rr] of runs.entries()) {
      const salidaError = rr.data?.main?.[1]?.[0]?.json;
      if (salidaError) {
        // La rama de error lleva el ítem de entrada (p. ej. la subida a Cloudinary); el error propio va en .error.
        const e = salidaError.error ?? rr.error;
        console.log(`  ⚠ error en «${nombre}» (intento ${k + 1}): campos [${Object.keys(salidaError).join(', ')}]`);
        console.log(`     error: ${e ? JSON.stringify(e).slice(0, 700) : '(el ítem no trae campo error)'}`);
      }
    }
  }
  const err = e.data?.resultData?.error;
  if (err) console.log('  ERROR GENERAL:', err.message, err.node?.name ? `(nodo ${err.node.name})` : '');
  // Cierre del copy (firma y contacto): últimas 2 líneas del primer Caption_IG que aparezca en la ejecución.
  for (const [nombre, runs] of Object.entries(run)) {
    const cap = runs[0]?.data?.main?.[0]?.[0]?.json?.Caption_IG;
    if (typeof cap === 'string' && cap.includes('\n')) {
      console.log(`  cierre del copy en «${nombre}»: ${JSON.stringify(cap.trim().split('\n').slice(-2))}`);
      break;
    }
  }
  const fila = run['Preparar fila']?.[0]?.data?.main?.[0]?.[0]?.json;
  if (fila) console.log('  fila de Usuarios: TelegramUserID', enmascarar(fila.TelegramUserID), '· PageName', fila.PageName || '(vacío)', '· PageID', enmascarar(fila.PageID), '· IGAccountID', enmascarar(fila.IGAccountID), '· ExpiresAt', fila.ExpiresAt);
}
