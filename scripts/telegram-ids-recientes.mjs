// Solo lectura: lista quién escribió al bot en las últimas ejecuciones del workflow principal del VPS
// (ID de chat, nombre y texto/botón), para obtener el TelegramUserID de una usuaria que acaba de escribir.
//   N8N_VPS_URL=https://<host> node --env-file=C:/dev/Tesis/.env scripts/telegram-ids-recientes.mjs [cuantas]
const { N8N_VPS_URL: base, N8N_API_KEY_VPS: key } = process.env;
if (!base || !key) throw new Error('Faltan N8N_VPS_URL / N8N_API_KEY_VPS en el entorno');
const host = base.replace(/\/$/, '');
const n = process.argv[2] || '25';

const r = await fetch(`${host}/api/v1/executions?workflowId=xwYkQA25a6IjRmqX&limit=${n}&includeData=true`, { headers: { 'X-N8N-API-KEY': key } });
if (!r.ok) throw new Error(`HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
const { data } = await r.json();

for (const e of data) {
  const t = e.data?.resultData?.runData?.['Telegram Trigger']?.[0]?.data?.main?.[0]?.[0]?.json;
  if (!t) continue;
  const m = t.message || t.callback_query?.message;
  const de = t.message?.from || t.callback_query?.from;
  const texto = t.message?.text || (t.message?.photo ? '[foto]' : '') || (t.callback_query ? `[botón] ${String(t.callback_query.data).slice(0, 30)}` : '');
  console.log(`${e.startedAt.slice(0, 19)}Z  ejec ${e.id}  chat ${m?.chat?.id}  ${de?.first_name || ''}  ${texto}`);
}
