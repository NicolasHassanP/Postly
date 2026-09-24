// Análisis de los cuatro estudios del Objetivo Específico 2
//
// Corre los cuatro de PROTOCOLO-OE2.md: calidad del copy frente a un generador genérico,
// correspondencia con el tono pedido, ordenamiento del carrusel, y manual contra Postly a
// ciegas. Cada uno se activa si su planilla tiene datos; con las plantillas vacías dice qué
// falta cargar.
//
// La unidad de análisis es el EVALUADOR en los cuatro, nunca el producto ni el copy: varios
// juicios de una misma persona no son observaciones independientes. Es el mismo criterio que
// el §6.1 de la tesis aplica al cronometraje. Con un único evaluador (decisión del
// 24-09-2026 para los Estudios 1 y 4, PROTOCOLO-OE2.md) no hay intervalo ni acuerdo
// inter-evaluador que calcular: el script lo señala en vez de fallar en silencio.
//
// Uso:  node run_oe2.mjs [carpeta]

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = process.argv[2] || dirname(fileURLToPath(import.meta.url));

// ─── Estadística ─────────────────────────────────────────────────────────────
const media = a => a.reduce((s, x) => s + x, 0) / a.length;
const varS = a => a.length < 2 ? 0 : a.reduce((s, x) => s + (x - media(a)) ** 2, 0) / (a.length - 1);
const de = a => Math.sqrt(varS(a));
const f2 = x => (Math.round(x * 100) / 100).toFixed(2).replace(".", ",");
const pct = x => (Math.round(x * 1000) / 10).toFixed(1).replace(".", ",") + " %";

// Intervalo de Wilson: el que la tesis usa, y que no colapsa cuando la proporción vale 0 o 1
function wilson(exitos, n, z = 1.96) {
  if (!n) return [0, 1];
  const p = exitos / n, d = 1 + z * z / n;
  const c = (p + z * z / (2 * n)) / d;
  const h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}
// Prueba binomial exacta de dos colas
function binomial(k, n, p0) {
  const lnFact = m => { let s = 0; for (let i = 2; i <= m; i++) s += Math.log(i); return s; };
  const pmf = i => Math.exp(lnFact(n) - lnFact(i) - lnFact(n - i) +
    i * Math.log(p0) + (n - i) * Math.log(1 - p0));
  const obs = pmf(k);
  let acc = 0;
  for (let i = 0; i <= n; i++) { const v = pmf(i); if (v <= obs * 1.0000001) acc += v; }
  return Math.min(1, acc);
}
function lnGamma(z) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let x = z, y = z, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += g[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}
function betacf(a, b, x) {
  const EPS = 3e-14, FPMIN = 1e-300;
  let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d; let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
const betai = (a, b, x) => x <= 0 ? 0 : x >= 1 ? 1
  : (x < (a + 1) / (a + b + 2)
    ? Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x)) * betacf(a, b, x) / a
    : 1 - Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x)) * betacf(b, a, 1 - x) / b);
const pDosColas = (t, df) => betai(df / 2, 0.5, df / (df + t * t));
// t crítico por bisección: hace falta para el intervalo sobre las medias por evaluadora,
// que es la unidad del diseño. Un intervalo de Wilson sobre el total de decisiones ignora
// que las decisiones de una misma persona no son independientes.
function tCritico(df, alfa = 0.05) {
  let lo = 0, hi = 100;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; pDosColas(m, df) > alfa ? lo = m : hi = m; }
  return (lo + hi) / 2;
}
function icMedia(v) {
  if (v.length < 2) return null;
  const m = media(v), ee = de(v) / Math.sqrt(v.length), t = tCritico(v.length - 1);
  return [m, Math.max(0, m - t * ee), Math.min(1, m + t * ee)];
}
const fmtP = p => p < 0.001 ? "< 0,001" : "= " + p.toFixed(3).replace(".", ",");
function tPareada(dif) {
  const n = dif.length, m = media(dif), s = de(dif);
  if (n < 2 || s === 0) return null;
  const t = m / (s / Math.sqrt(n));
  return { n, m, s, t, df: n - 1, p: pDosColas(t, n - 1), d: m / s };
}
function pearson(x, y) {
  const n = x.length; if (n < 3) return null;
  const mx = media(x), my = media(y);
  const num = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0);
  const den = Math.sqrt(x.reduce((s, v) => s + (v - mx) ** 2, 0) * y.reduce((s, v) => s + (v - my) ** 2, 0));
  return den === 0 ? null : num / den;
}
// κ de Fleiss: acuerdo entre más de dos evaluadoras sobre categorías nominales
function fleiss(matriz, categorias) {
  const N = matriz.length; if (!N) return null;
  const n = matriz[0].reduce((s, v) => s + v, 0);
  if (n < 2) return null;
  const P = matriz.map(f => (f.reduce((s, v) => s + v * v, 0) - n) / (n * (n - 1)));
  const pj = Array.from({ length: categorias }, (_, j) => matriz.reduce((s, f) => s + f[j], 0) / (N * n));
  const Pe = pj.reduce((s, p) => s + p * p, 0);
  const Pbar = media(P);
  return Pe === 1 ? null : (Pbar - Pe) / (1 - Pe);
}

// ─── CSV ─────────────────────────────────────────────────────────────────────
function leer(nombre) {
  const ruta = join(AQUI, nombre);
  if (!existsSync(ruta)) return { falta: true, nombre, filas: [], enc: [] };
  const lineas = readFileSync(ruta, "utf-8").split(/\r?\n/).filter(l => l.trim());
  const enc = lineas[0].split(",").map(s => s.trim());
  const filas = lineas.slice(1).map(l => {
    const c = []; let campo = "", q = false;
    for (const ch of l) {
      if (ch === '"') q = !q;
      else if (ch === "," && !q) { c.push(campo); campo = ""; }
      else campo += ch;
    }
    c.push(campo);
    return Object.fromEntries(enc.map((h, i) => [h, (c[i] ?? "").trim()]));
  });
  return { falta: false, nombre, filas, enc };
}
const vacio = (d, cols) => {
  console.log(`  ${d.nombre}: ${d.falta ? "no está" : "vacío"} — falta cargarlo.`);
  console.log(`    columnas: ${cols}\n`);
};

console.log(`\n════ OBJETIVO ESPECÍFICO 2 — los cuatro estudios ════`);

// ─── Estudio 1 · calidad del copy ────────────────────────────────────────────
console.log(`\n── Estudio 1 · calidad frente a un generador genérico (HU4)`);
const e1 = leer("OE2_estudio1_respuestas.csv");
const DIMS = ["Fidelidad", "Utilidad", "Voz_marca", "Cumplimiento"];
if (!e1.filas.length) {
  vacio(e1, `Evaluador, Producto, Tipo (imagen|carrusel), Sistema (postly|generico), ${DIMS.join(", ")}, Preferido (si|no), No_verificables`);
} else {
  const evaluadoras = [...new Set(e1.filas.map(f => f.Evaluadora))];
  console.log(`  ${evaluadoras.length} evaluador(es) · ${e1.filas.length} juicios`);
  if (evaluadoras.length < 2) {
    console.log(`  Con un único evaluador esto es un juicio experto DESCRIPTIVO: hay media y`);
    console.log(`  proporción, pero ningún intervalo ni acuerdo inter-evaluador (PROTOCOLO-OE2.md).`);
  }
  const diffPorDim = (filas) => DIMS.map(dim => {
    const evs = [...new Set(filas.map(f => f.Evaluadora))];
    const dif = evs.map(ev => {
      const suyas = filas.filter(f => f.Evaluadora === ev);
      const p = suyas.filter(f => f.Sistema === "postly").map(f => Number(f[dim])).filter(Number.isFinite);
      const g = suyas.filter(f => f.Sistema === "generico").map(f => Number(f[dim])).filter(Number.isFinite);
      return p.length && g.length ? media(p) - media(g) : null;
    }).filter(v => v !== null);
    return { dim, dif };
  });
  for (const { dim, dif } of diffPorDim(e1.filas)) {
    const t = tPareada(dif);
    console.log(`  ${dim.padEnd(14)} diferencia media Postly − genérico: ${f2(media(dif))} puntos` +
      (t ? ` · t(${t.df}) = ${f2(t.t)} · p ${fmtP(t.p)} · d = ${f2(t.d)}` : " (n insuficiente)"));
  }
  // Imagen contra carrusel por separado: no hay razón para asumir la misma ventaja en los
  // dos formatos, y mezclarlos escondería la asimetría (PROTOCOLO-OE2.md, Estudio 1).
  for (const tipo of ["imagen", "carrusel"]) {
    const filasTipo = e1.filas.filter(f => (f.Tipo || "").toLowerCase() === tipo);
    if (!filasTipo.length) continue;
    console.log(`\n  · sólo ${tipo}:`);
    for (const { dim, dif } of diffPorDim(filasTipo)) {
      const t = tPareada(dif);
      console.log(`    ${dim.padEnd(14)} diferencia media Postly − genérico: ${f2(media(dif))} puntos` +
        (t ? ` · t(${t.df}) = ${f2(t.t)} · p ${fmtP(t.p)}` : " (n insuficiente)"));
    }
  }
  console.log();
  const porEv = evaluadoras.map(ev => {
    const s = e1.filas.filter(f => f.Evaluadora === ev && f.Sistema === "postly");
    return s.length ? s.filter(f => (f.Preferido || "").toLowerCase() === "si").length / s.length : null;
  }).filter(v => v !== null);
  if (porEv.length) {
    // El intervalo va sobre las proporciones POR EVALUADORA, que son las unidades
    // independientes. Antes esta línea construía un Wilson con k = media × n_evaluadoras
    // redondeado, que descarta la información por imagen y da un intervalo que no
    // corresponde a ningún estimador: corregido el 23-09-2026 en la auditoría del script.
    const ic = icMedia(porEv);
    console.log(`  Preferencia por Postly: ${pct(media(porEv))} de los pares` +
      (ic ? ` · IC 95 % [${pct(ic[1])} ; ${pct(ic[2])}] sobre ${porEv.length} evaluadoras` : ""));
    const tot = e1.filas.filter(f => f.Sistema === "postly");
    const k = tot.filter(f => (f.Preferido || "").toLowerCase() === "si").length;
    const [lo, hi] = wilson(k, tot.length);
    console.log(`    (agrupando las ${tot.length} decisiones e ignorando el anidamiento:` +
      ` ${pct(k / tot.length)} · Wilson [${pct(lo)} ; ${pct(hi)}]; se informa por completitud)`);
  }
  const nv = e1.filas.filter(f => f.Sistema === "postly");
  const conNV = nv.filter(f => Number(f.No_verificables) > 0).length;
  if (nv.length) {
    const [lo, hi] = wilson(conNV, nv.length);
    console.log(`  Copys de Postly con al menos una afirmación no verificable contra la foto:` +
      ` ${conNV}/${nv.length} · IC 95 % [${pct(lo)} ; ${pct(hi)}]`);
    console.log(`    (primera evidencia sobre alucinaciones; el Capítulo 7 hoy declara que no hay ninguna)`);
  }
  if (evaluadoras.length >= 3) {
    const prods = [...new Set(e1.filas.map(f => f.Producto + "|" + f.Sistema))];
    const rs = [];
    for (let i = 0; i < evaluadoras.length; i++) for (let j = i + 1; j < evaluadoras.length; j++) {
      const x = [], y = [];
      for (const pr of prods) {
        const a = e1.filas.find(f => f.Evaluadora === evaluadoras[i] && f.Producto + "|" + f.Sistema === pr);
        const b = e1.filas.find(f => f.Evaluadora === evaluadoras[j] && f.Producto + "|" + f.Sistema === pr);
        if (a && b) { x.push(media(DIMS.map(d => Number(a[d])))); y.push(media(DIMS.map(d => Number(b[d])))); }
      }
      const r = pearson(x, y); if (r !== null) rs.push(r);
    }
    if (rs.length) console.log(`  Acuerdo entre evaluadores: r de Pearson media entre pares = ${f2(media(rs))}` +
      ` (${rs.length} pares). No es un α de Krippendorff: es una correlación media, y así se informa.`);
  } else if (evaluadoras.length > 0) {
    console.log(`  Acuerdo entre evaluadores: no se calcula con ${evaluadoras.length} evaluador(es) (hacen falta ≥3).`);
  }
}

// ─── Estudio 2 · correspondencia con el tono ─────────────────────────────────
console.log(`\n── Estudio 2 · correspondencia con el tono pedido (HU6)`);
const e2 = leer("OE2_estudio2_respuestas.csv");
const TONOS = ["informativo", "vendedor", "divertido"];
if (!e2.filas.length) {
  vacio(e2, "Evaluadora, Conjunto, Copy, Tono_real, Tono_asignado");
} else {
  const evaluadoras = [...new Set(e2.filas.map(f => f.Evaluadora))];
  const aciertosPorEv = evaluadoras.map(ev => {
    const s = e2.filas.filter(f => f.Evaluadora === ev);
    return s.filter(f => (f.Tono_real || "").toLowerCase() === (f.Tono_asignado || "").toLowerCase()).length / s.length;
  });
  const total = e2.filas.length;
  const aciertos = e2.filas.filter(f => (f.Tono_real || "").toLowerCase() === (f.Tono_asignado || "").toLowerCase()).length;
  const [lo, hi] = wilson(aciertos, total);
  console.log(`  ${evaluadoras.length} evaluadoras · ${total} asignaciones`);
  console.log(`  Aciertos: ${aciertos}/${total} = ${pct(aciertos / total)} · IC 95 % [${pct(lo)} ; ${pct(hi)}]`);
  console.log(`  Contra el azar (1/3, asignación forzada): p ${fmtP(binomial(aciertos, total, 1 / 3))}`);
  console.log(`  Media por evaluadora: ${pct(media(aciertosPorEv))}` +
    ` · ${media(aciertosPorEv) < 0.6 ? "POR DEBAJO del 60 % declarado: los tonos no se distinguen en la práctica" : "por encima del 60 % declarado"}`);
  console.log(`\n  matriz de confusión (fila = tono pedido, columna = tono asignado)`);
  console.log(`  ${"".padEnd(13)}${TONOS.map(t => t.slice(0, 11).padEnd(13)).join("")}`);
  for (const real of TONOS) {
    const fila = TONOS.map(asig => e2.filas.filter(f =>
      (f.Tono_real || "").toLowerCase() === real && (f.Tono_asignado || "").toLowerCase() === asig).length);
    console.log(`  ${real.padEnd(13)}${fila.map(v => String(v).padEnd(13)).join("")}`);
  }
  const conjuntos = [...new Set(e2.filas.map(f => f.Conjunto + "|" + f.Copy))];
  const matriz = conjuntos.map(c => TONOS.map(t =>
    e2.filas.filter(f => f.Conjunto + "|" + f.Copy === c && (f.Tono_asignado || "").toLowerCase() === t).length));
  const k = fleiss(matriz.filter(f => f.reduce((s, v) => s + v, 0) >= 2), 3);
  console.log(`\n  κ de Fleiss entre evaluadoras: ${k === null ? "indefinido" : f2(k)}`);
}

// ─── Estudio 3 · ordenamiento del carrusel ───────────────────────────────────
console.log(`\n── Estudio 3 · ordenamiento del carrusel (HU5)`);
const e3 = leer("OE2_estudio3_respuestas.csv");
if (!e3.filas.length) {
  vacio(e3, "Evaluadora, Conjunto, Preferida (ia|envio), Coincidian (si|no)");
} else {
  const utiles = e3.filas.filter(f => (f.Coincidian || "no").toLowerCase() !== "si");
  const iguales = e3.filas.length - utiles.length;
  const evaluadoras = [...new Set(utiles.map(f => f.Evaluadora))];
  const porEv = evaluadoras.map(ev => {
    const s = utiles.filter(f => f.Evaluadora === ev);
    return s.filter(f => (f.Preferida || "").toLowerCase() === "ia").length / s.length;
  });
  const k = utiles.filter(f => (f.Preferida || "").toLowerCase() === "ia").length;
  const [lo, hi] = wilson(k, utiles.length);
  console.log(`  ${evaluadoras.length} evaluadoras · ${utiles.length} decisiones` +
    (iguales ? ` · ${iguales} conjuntos quedaron fuera porque las dos secuencias coincidían` : ""));
  const ic3 = icMedia(porEv);
  console.log(`  Prefieren la secuencia de la IA: media por evaluadora ${pct(media(porEv))}` +
    (ic3 ? ` · IC 95 % [${pct(ic3[1])} ; ${pct(ic3[2])}] sobre ${porEv.length} evaluadoras` : ""));
  console.log(`    (agrupando las ${utiles.length} decisiones e ignorando el anidamiento:` +
    ` ${k}/${utiles.length} = ${pct(k / utiles.length)} · Wilson [${pct(lo)} ; ${pct(hi)}]` +
    ` · binomial contra 0,5: p ${fmtP(binomial(k, utiles.length, 0.5))})`);
  console.log(`  Alcance: preferencia declarada, no rendimiento en la plataforma.`);
}

// ─── Estudio 4 · manual contra Postly, a ciegas (agregado el 24-09-2026) ─────
console.log(`\n── Estudio 4 · manual contra Postly, a ciegas`);
const e4 = leer("OE2_estudio4_respuestas.csv");
const clave4 = leer("OE2_estudio4_clave.csv");
if (!e4.filas.length) {
  vacio(e4, "Evaluador, Par, Tipo (copy|orden), Letra, Fidelidad, Utilidad, Voz_marca, Cumplimiento, Preferida (si|no)");
} else if (!clave4.filas.length) {
  console.log(`  OE2_estudio4_clave.csv no está: sin ella no se puede saber qué letra es`);
  console.log(`  manual y cuál Postly. La produce armar_material_estudio4.mjs y NO se`);
  console.log(`  versiona (lleva identidad); tiene que estar en esta carpeta para analizar.`);
} else {
  const claveMapa = Object.fromEntries(clave4.filas.map(c => [c.Par, c]));

  // -- Copy: mismo análisis que el Estudio 1, Postly contra manual en vez de contra el genérico --
  const copyResp = e4.filas.filter(f => (f.Tipo || "").toLowerCase() === "copy");
  if (copyResp.length) {
    const evaluadores = [...new Set(copyResp.map(f => f.Evaluador))];
    console.log(`\n  · copy (${evaluadores.length} evaluadores · ${new Set(copyResp.map(f => f.Par)).size} pares)`);
    for (const dim of DIMS) {
      const dif = evaluadores.map(ev => {
        const suyas = copyResp.filter(f => f.Evaluador === ev);
        const postly = [], manual = [];
        for (const f of suyas) {
          const c = claveMapa[f.Par]; if (!c) continue;
          const v = Number(f[dim]); if (!Number.isFinite(v)) continue;
          if (f.Letra === c.Letra_postly) postly.push(v);
          else if (f.Letra === c.Letra_manual) manual.push(v);
        }
        return postly.length && manual.length ? media(postly) - media(manual) : null;
      }).filter(v => v !== null);
      const t = tPareada(dif);
      console.log(`    ${dim.padEnd(14)} diferencia media Postly − manual: ${f2(media(dif))} puntos` +
        (t ? ` · t(${t.df}) = ${f2(t.t)} · p ${fmtP(t.p)} · d = ${f2(t.d)}` : " (n insuficiente)"));
    }
    const prefPorEv = evaluadores.map(ev => {
      const porPar = {};
      for (const f of copyResp.filter(f => f.Evaluador === ev)) (porPar[f.Par] ??= []).push(f);
      let postlyPref = 0, decididos = 0;
      for (const [par, filasPar] of Object.entries(porPar)) {
        const c = claveMapa[par]; if (!c) continue;
        const elegida = filasPar.find(f => (f.Preferida || "").toLowerCase() === "si");
        if (!elegida) continue;
        decididos++;
        if (elegida.Letra === c.Letra_postly) postlyPref++;
      }
      return decididos ? postlyPref / decididos : null;
    }).filter(v => v !== null);
    if (prefPorEv.length) {
      const ic = icMedia(prefPorEv);
      console.log(`    Preferencia por Postly: ${pct(media(prefPorEv))} de los pares` +
        (ic ? ` · IC 95 % [${pct(ic[1])} ; ${pct(ic[2])}] sobre ${prefPorEv.length} evaluadores` : ""));
    }
  }

  // -- Orden: mismo análisis que el Estudio 3, Postly contra manual en vez de contra el envío --
  const ordenResp = e4.filas.filter(f => (f.Tipo || "").toLowerCase() === "orden");
  if (ordenResp.length) {
    const evaluadores = [...new Set(ordenResp.map(f => f.Evaluador))];
    const porEv = evaluadores.map(ev => {
      let postlyPref = 0, decididos = 0;
      for (const f of ordenResp.filter(f => f.Evaluador === ev)) {
        const c = claveMapa[f.Par]; if (!c) continue;
        decididos++;
        if (f.Letra === c.Letra_postly) postlyPref++;
      }
      return decididos ? postlyPref / decididos : null;
    }).filter(v => v !== null);
    const decididas = ordenResp.filter(f => claveMapa[f.Par]);
    const totalPostly = decididas.filter(f => f.Letra === claveMapa[f.Par].Letra_postly).length;
    console.log(`\n  · orden de carrusel (${evaluadores.length} evaluadores · ${new Set(ordenResp.map(f => f.Par)).size} pares)`);
    if (porEv.length && decididas.length) {
      const ic = icMedia(porEv);
      const [lo, hi] = wilson(totalPostly, decididas.length);
      console.log(`    Prefieren el orden de Postly: media por evaluador ${pct(media(porEv))}` +
        (ic ? ` · IC 95 % [${pct(ic[1])} ; ${pct(ic[2])}] sobre ${porEv.length} evaluadores` : ""));
      console.log(`      (agrupando las ${decididas.length} decisiones: ${totalPostly}/${decididas.length} = ${pct(totalPostly / decididas.length)}` +
        ` · Wilson [${pct(lo)} ; ${pct(hi)}] · binomial contra 0,5: p ${fmtP(binomial(totalPostly, decididas.length, 0.5))})`);
    }
  }
  console.log(`\n  Recordatorio: el material manual llegó a la cuenta real de cada participante y`);
  console.log(`  el de Postly a la cuenta de prueba (PROTOCOLO-ampliacion.md, §10); no afecta esta`);
  console.log(`  comparación porque acá sólo se juzga texto u orden, nunca la cuenta de destino.`);
}
console.log();
