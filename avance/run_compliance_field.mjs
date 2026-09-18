// Análisis de la validación de compliance CON CONTENIDO REAL (Track A1).
// Calcula: acuerdo entre evaluadoras (kappa de Cohen) + matriz de confusión del
// sistema contra la verdad de base consensuada + Recall/Precisión/F1.
// Uso:  node run_compliance_field.mjs [Compliance_Campo.csv]

import { readFileSync } from "node:fs";
const file = process.argv[2] || "Compliance_Campo.csv";
const raw = readFileSync(new URL("./" + file, import.meta.url), "utf-8");

function parseCSV(t){const R=[];let r=[],f="",q=false;for(let i=0;i<t.length;i++){const c=t[i];
 if(q){if(c==='"'&&t[i+1]==='"'){f+='"';i++;}else if(c==='"')q=false;else f+=c;}
 else if(c==='"')q=true;else if(c===","){r.push(f);f="";}else if(c==="\r"){}else if(c==="\n"){r.push(f);R.push(r);r=[];f="";}else f+=c;}
 if(f.length||r.length){r.push(f);R.push(r);}return R;}
const rows = parseCSV(raw);
const H = Object.fromEntries(rows[0].map((h,i)=>[h.trim(),i]));
const norm = s => (s||"").trim().toUpperCase();

let VP=0,FP=0,VN=0,FN=0, sinDato=0;
// para kappa (etiqueta consultora vs externa)
let a_II=0,a_LL=0,a_IL=0,a_LI=0; // I=INFRACTOR, L=LIMPIO
for(let i=1;i<rows.length;i++){
  const row=rows[i]; if(!row[H.ID]||!row[H.ID].trim()) continue;
  const lc=norm(row[H.Etiqueta_consultora]), le=norm(row[H.Etiqueta_externa]);
  if((lc==="INFRACTOR"||lc==="LIMPIO")&&(le==="INFRACTOR"||le==="LIMPIO")){
    if(lc==="INFRACTOR"&&le==="INFRACTOR")a_II++;
    else if(lc==="LIMPIO"&&le==="LIMPIO")a_LL++;
    else if(lc==="INFRACTOR"&&le==="LIMPIO")a_IL++;
    else a_LI++;
  }
  const gt=norm(row[H.Ground_truth]);
  const res=norm(row[H.Resultado_sistema]); // BLOQUEO / PUBLICO
  const bloq = res.includes("BLOQUE");
  const pub = res.includes("PUBLIC");
  if(!(gt==="INFRACTOR"||gt==="LIMPIO")||!(bloq||pub)){ sinDato++; continue; }
  if(gt==="INFRACTOR") (bloq?VP++:FN++);
  else (bloq?FP++:VN++);
}
const n = VP+FP+VN+FN;
if(n===0){ console.log("\n(Planilla sin datos completos todavía. Cargá Ground_truth y Resultado_sistema.)\n"); process.exit(0);}

// ---- kappa de Cohen ----
const nk=a_II+a_LL+a_IL+a_LI;
let kappaStr="(sin datos suficientes)";
if(nk>0){
  const po=(a_II+a_LL)/nk;
  const pI1=(a_II+a_IL)/nk, pI2=(a_II+a_LI)/nk; // marginales INFRACTOR de cada evaluadora
  const pe=pI1*pI2+(1-pI1)*(1-pI2);
  const kappa=(po-pe)/(1-pe||1);
  kappaStr=`κ = ${kappa.toFixed(3)} (acuerdo observado ${(po*100).toFixed(1)}%, n=${nk})`;
}
const recall=VP/(VP+FN||1), prec=VP/(VP+FP||1), f1=2*prec*recall/((prec+recall)||1);
const pct=x=>(x*100).toFixed(1)+"%";
console.log(`\n════ COMPLIANCE — VALIDACIÓN CON CONTENIDO REAL (n=${n}) ════\n`);
console.log("  Acuerdo entre evaluadoras (fiabilidad de la etiqueta):");
console.log("   "+kappaStr+"\n");
console.log("                 │ Sistema BLOQUEÓ │ Sistema PUBLICÓ");
console.log(`  Real INFRACTOR  │   VP = ${String(VP).padStart(2)}      │   FN = ${String(FN).padStart(2)}`);
console.log(`  Real LIMPIO     │   FP = ${String(FP).padStart(2)}      │   VN = ${String(VN).padStart(2)}`);
console.log(`\n  Recall = ${recall.toFixed(3)} (${pct(recall)}) · Precisión = ${prec.toFixed(3)} (${pct(prec)}) · F1 = ${f1.toFixed(3)}`);
console.log(`  Exactitud = ${((VP+VN)/n).toFixed(3)} (${pct((VP+VN)/n)})`);
// Intervalo de Wilson: con denominadores de una o dos decenas, la aproximación normal
// (Wald) produce límites fuera de [0,1] y colapsa a cero cuando la proporción es 1.
// Wilson no tiene ninguno de los dos defectos y es el que APA recomienda para proporciones.
function wilson(k, m, z = 1.959964) {
  if (!m) return [NaN, NaN];
  const p = k / m, d = 1 + z * z / m;
  const c = (p + z * z / (2 * m)) / d;
  const h = z * Math.sqrt(p * (1 - p) / m + z * z / (4 * m * m)) / d;
  return [c - h, c + h];
}
const ic = (k, m) => { const [a, b] = wilson(k, m); return `[${a.toFixed(3)}; ${b.toFixed(3)}]`; };
console.log("\n  IC del 95 % (Wilson) sobre las proporciones:");
console.log(`   Recall    ${VP}/${VP + FN}  ${ic(VP, VP + FN)}`);
console.log(`   Precisión ${VP}/${VP + FP}  ${ic(VP, VP + FP)}`);
console.log(`   Exactitud ${VP + VN}/${n}  ${ic(VP + VN, n)}`);
console.log("   (El F1 no es una proporción sobre un denominador único y no lleva intervalo.)");
if(sinDato) console.log(`\n  (${sinDato} filas sin datos completos, excluidas)`);
console.log("");
