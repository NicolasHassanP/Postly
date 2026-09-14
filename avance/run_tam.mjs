// Análisis de la encuesta TAM (Track A2). Medias por constructo + alfa de Cronbach.
// Uso:  node run_tam.mjs [TAM_respuestas.csv]

import { readFileSync } from "node:fs";
const file = process.argv[2] || "TAM_respuestas.csv";
const raw = readFileSync(new URL("./" + file, import.meta.url), "utf-8");

const rows = raw.split(/\r?\n/).filter(l => l.trim()).map(l => l.split(","));
const H = rows[0];
const idx = Object.fromEntries(H.map((h, i) => [h.trim(), i]));
const constructs = {
  "Utilidad Percibida (PU)":       ["PU1","PU2","PU3","PU4"],
  "Facilidad de Uso (PEOU)":       ["PEOU1","PEOU2","PEOU3","PEOU4"],
  "Intención de Uso (BI)":         ["BI1","BI2"],
};

const data = [];
for (let r = 1; r < rows.length; r++) {
  const row = rows[r]; if (!row[0] || !row[0].trim()) continue;
  const rec = { id: row[0] };
  let ok = true;
  for (const h of H.slice(1)) { const v = Number(row[idx[h]]); rec[h] = v; if (!(v >= 1 && v <= 5)) ok = false; }
  rec._ok = ok; data.push(rec);
}
const full = data.filter(d => d._ok);
if (full.length === 0) { console.log("\n(Sin respuestas completas todavía. Cargá valores 1–5.)\n"); process.exit(0); }

const mean = a => a.reduce((x,y)=>x+y,0)/a.length;
const varS = a => { if (a.length<2) return 0; const m=mean(a); return a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1); };

function cronbach(items){
  const k = items.length; if (k<2 || full.length<2) return null;
  const itemVars = items.map(it => varS(full.map(d=>d[it])));
  const totals = full.map(d => items.reduce((s,it)=>s+d[it],0));
  const vt = varS(totals); if (vt===0) return null;
  return (k/(k-1))*(1 - itemVars.reduce((a,b)=>a+b,0)/vt);
}

console.log(`\n════ ENCUESTA TAM (n = ${full.length} consultoras) ════\n`);
let grand=[];
for (const [name, items] of Object.entries(constructs)) {
  const vals = full.flatMap(d => items.map(it => d[it]));
  const m = mean(vals); grand.push(...vals);
  const a = cronbach(items);
  const alpha = a==null ? "n/d" : a.toFixed(2) + (a>=0.7?" (aceptable)":" (bajo; n pequeño)");
  console.log(`  ${name.padEnd(28)} media ${m.toFixed(2)}/5  ·  α de Cronbach: ${alpha}`);
}
console.log(`  ${"Puntaje TAM global".padEnd(28)} media ${mean(grand).toFixed(2)}/5`);
console.log("\n  Por participante (media de sus 10 ítems):");
for (const d of full) console.log(`   ${d.id}: ${mean(H.slice(1).map(h=>d[h])).toFixed(2)}/5`);
if (data.length!==full.length) console.log(`\n  (${data.length-full.length} fila(s) incompleta(s), excluida(s))`);
console.log("");
