// Verifica que los detectores que este material complementario ejecuta sean, carácter por
// carácter, los del workflow desplegado.
//
// POR QUÉ EXISTE
// Los scripts `run_compliance_text.mjs` y `run_compliance_vision.mjs` declaran transcribir
// "verbatim" las seis expresiones regulares del Módulo Centinela y el prompt del nodo de
// detección visual. Todo el Capítulo 5 del canal textual descansa en esa declaración, y
// hasta ahora era una afirmación del trabajo que un lector externo no podía comprobar: la
// auditoría de cuarta instancia la dejó explícitamente en su lista de puntos no
// verificables. Este script la vuelve comprobable sin acceso a la instancia.
//
// CÓMO
// El paso `--extraer` lee el workflow exportado y escribe `Nodos_compliance_desplegados.json`,
// que contiene SOLO el código de los cuatro nodos de compliance, el prompt del nodo de
// visión y el SHA-256 de cada uno. No copia webhookId, credenciales, URL de la instancia ni
// ningún otro identificador: el extracto es publicable tal cual.
//
// El paso por defecto no necesita el workflow. Compara el extracto contra los dos scripts de
// evidencia y falla con código 1 si algo difiere. Cualquiera que tenga esta carpeta puede
// correrlo; cualquiera que además tenga la instancia puede regenerar el extracto y comprobar
// que es el mismo.
//
//   node verificar_patrones_desplegados.mjs --extraer "../workflows/Postly - Entrega Final Sprint 1 v2.json"
//   node verificar_patrones_desplegados.mjs
//
// EL DETECTOR ANTERIOR A LA CORRECCIÓN
// Las Tablas 3, 4 y 5 no las produjo el conjunto vigente sino el anterior al análisis de
// valores límite (v1), y el Recall de 0,500 del flujo programado lo produjo el conjunto
// divergente de HU10. Verificar sólo el conjunto vigente dejaría sin respaldo justamente a
// las matrices principales. El workflow previo a la corrección está versionado —es el padre
// del commit `fix(compliance): unifica y corrige los patrones del Centinela en los 4
// flujos`—, de modo que ese estado se extrae igual que el vigente:
//
//   git show "<commit>^:workflows/Postly - Entrega Final Sprint 1 v2.json" > wf_v1.json
//   node verificar_patrones_desplegados.mjs --extraer-v1 wf_v1.json
//
// y queda en `Nodos_compliance_desplegados_v1.json`. La verificación lo usa, si está, para
// comprobar `PATRONES_V1` y `PATRONES_HU10` carácter por carácter.
//
// Los cuatro nodos son los que el §4.5 y el Anexo B.4 describen: el del flujo inmediato
// (HU7/HU9), el del carrusel (HU5), el de la publicación programada (HU10) y el del video
// (HU13). Que los cuatro lleven el mismo conjunto es lo que el §5.1 afirma tras la
// corrección de la divergencia de HU10, y esta comprobación lo sostiene.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const EXTRACTO = join(AQUI, "Nodos_compliance_desplegados.json");
const EXTRACTO_V1 = join(AQUI, "Nodos_compliance_desplegados_v1.json");

const NODOS = [
  { nodo: "Code in JavaScript1", variable: "patronesPrecios", rotulo: "flujo inmediato (HU7/HU9)" },
  { nodo: "HU5: Pub preparar", variable: "patrones", rotulo: "carrusel (HU5)" },
  { nodo: "Sched: Procesar", variable: "patrones", rotulo: "publicación programada (HU10)" },
  { nodo: "Video: pub publicar", variable: "pats", rotulo: "video (HU13)" },
];
const NODO_VISION = "HU8: Detección visual";
// Umbrales que no se miden con una serie de tiempos sino leyendo el codigo desplegado,
// igual que el tope de diez imagenes de HU5: la firma de HU9 y el corte de 60 s de HU13.
const NODOS_FIRMA = ["Code in JavaScript1", "HU5: Pub preparar", "Sched: Procesar",
                     "Video: pub publicar"];
const NODO_VIDEO = "Video: procesar";

const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");

// ─── extracción de literales de expresión regular ─────────────────────────────
// Un escáner y no una expresión regular: hay que respetar las clases de caracteres
// —donde `/` no cierra— y los escapes, o `/\d+[.,]\d{3}/` se parte mal.
function literalesDeArreglo(codigo, variable) {
  const decl = new RegExp(`(?:const|let|var)\\s+${variable}\\s*=\\s*\\[`);
  const m = decl.exec(codigo);
  if (!m) throw new Error(`no encuentro la declaración de «${variable}»`);

  let i = m.index + m[0].length;
  const fuera = [];
  let profundidad = 1;

  while (i < codigo.length && profundidad > 0) {
    const c = codigo[i];
    if (c === "[") { profundidad++; i++; continue; }
    if (c === "]") { profundidad--; i++; continue; }
    if (c !== "/") { i++; continue; }

    // ¿es un literal de expresión regular o un comentario?
    if (codigo[i + 1] === "/" || codigo[i + 1] === "*") {
      i = codigo[i + 1] === "/" ? codigo.indexOf("\n", i) + 1 || codigo.length
                                : codigo.indexOf("*/", i) + 2;
      continue;
    }

    let j = i + 1, enClase = false, escapado = false;
    for (; j < codigo.length; j++) {
      const d = codigo[j];
      if (escapado) { escapado = false; continue; }
      if (d === "\\") { escapado = true; continue; }
      if (d === "[") { enClase = true; continue; }
      if (d === "]") { enClase = false; continue; }
      if (d === "/" && !enClase) break;
      if (d === "\n") { j = -1; break; }
    }
    if (j < 0) { i++; continue; }

    let k = j + 1;
    while (k < codigo.length && /[gimsuyd]/.test(codigo[k])) k++;
    fuera.push(codigo.slice(i, k));
    i = k;
  }
  if (profundidad !== 0) throw new Error(`el arreglo «${variable}» no cierra`);
  return fuera;
}

// ─── paso 1: extraer del workflow ─────────────────────────────────────────────
function extraer(rutaWorkflow) {
  const wf = JSON.parse(readFileSync(rutaWorkflow, "utf-8"));
  const porNombre = new Map(wf.nodes.map((n) => [n.name, n]));

  const salida = {
    _lea_esto:
      "Extracto redactado del workflow desplegado, producido por verificar_patrones_desplegados.mjs " +
      "--extraer. Contiene el código de los nodos de compliance y el prompt de detección visual, y " +
      "nada más: ningún webhookId, credencial, URL de instancia ni identificador de chat. Sirve para " +
      "comprobar que los scripts de esta carpeta corren los detectores del sistema y no una copia " +
      "divergente.",
    workflow: wf.name ?? "(sin nombre)",
    nodos: {},
    vision: null,
  };

  for (const { nodo, variable, rotulo } of NODOS) {
    const n = porNombre.get(nodo);
    if (!n) throw new Error(`el workflow no tiene el nodo «${nodo}»`);
    const codigo = n.parameters?.jsCode ?? "";
    salida.nodos[nodo] = {
      rotulo,
      variable,
      patrones: literalesDeArreglo(codigo, variable),
      sha256_del_codigo: sha(codigo),
    };
  }

  const v = porNombre.get(NODO_VISION);
  if (!v) throw new Error(`el workflow no tiene el nodo «${NODO_VISION}»`);
  const prompt = v.parameters?.text ?? "";
  salida.vision = {
    nodo: NODO_VISION,
    modelo: v.parameters?.modelId?.value ?? "(sin modelo declarado)",
    prompt,
    sha256_del_prompt: sha(prompt),
  };

  // HU9: la concatenacion de la firma debe ser incondicional en los cuatro nodos que
  // publican. Se extrae la linea y se comprueba que no cuelgue de ningun `if`.
  salida.firma_hu9 = {};
  for (const nodo of NODOS_FIRMA) {
    const codigo = porNombre.get(nodo)?.parameters?.jsCode ?? "";
    const lineas = codigo.split(String.fromCharCode(10)).map((l) => l.trim());
    const concat = lineas.filter((l) => /caption\s*=\s*caption\s*\+/.test(l) && /firma/i.test(l));
    salida.firma_hu9[nodo] = {
      concatenacion: concat,
      condicionada: concat.some((l) => /^if\s*\(/.test(l)),
      elimina_duplicado: lineas.some((l) => /caption\s*=\s*caption\.split\(\s*firma/i.test(l)),
    };
  }
  // HU13: la guarda del corte de 60 s
  const cod13 = porNombre.get(NODO_VIDEO)?.parameters?.jsCode ?? "";
  salida.corte_hu13 = {
    nodo: NODO_VIDEO,
    guarda: cod13.split(String.fromCharCode(10)).map((l) => l.trim())
            .filter((l) => /dur\s*>\s*60/.test(l))[0] ?? null,
  };

  writeFileSync(EXTRACTO, JSON.stringify(salida, null, 2) + "\n", "utf-8");
  console.log(`extracto escrito: ${EXTRACTO}`);
  for (const [nombre, d] of Object.entries(salida.nodos)) {
    console.log(`  ${nombre.padEnd(22)} ${d.patrones.length} patrones · sha ${d.sha256_del_codigo.slice(0, 12)}`);
  }
  console.log(`  ${NODO_VISION.padEnd(22)} prompt de ${prompt.length} caracteres · sha ${salida.vision.sha256_del_prompt.slice(0, 12)}`);
}

// ─── paso 1 bis: extraer el estado anterior a la corrección ───────────────────
// Sólo los cuatro nodos de compliance: el prompt de visión y los umbrales de HU9/HU13 no
// cambiaron con la corrección, y este extracto existe para respaldar las Tablas 3, 4 y 5.
function extraerV1(rutaWorkflow) {
  const wf = JSON.parse(readFileSync(rutaWorkflow, "utf-8"));
  const porNombre = new Map(wf.nodes.map((n) => [n.name, n]));
  const salida = {
    _lea_esto:
      "Extracto redactado del workflow ANTERIOR a fix-compliance-patterns.mjs, producido por " +
      "verificar_patrones_desplegados.mjs --extraer-v1. Es el estado que produjo las Tablas 3, 4 " +
      "y 5 y el Recall de 0,500 del flujo programado. Contiene sólo el código de los nodos de " +
      "compliance: ningún webhookId, credencial, URL de instancia ni identificador de chat.",
    workflow: wf.name ?? "(sin nombre)",
    nodos: {},
  };
  for (const { nodo, variable, rotulo } of NODOS) {
    const n = porNombre.get(nodo);
    if (!n) throw new Error(`el workflow no tiene el nodo «${nodo}»`);
    const codigo = n.parameters?.jsCode ?? "";
    salida.nodos[nodo] = {
      rotulo,
      variable,
      patrones: literalesDeArreglo(codigo, variable),
      sha256_del_codigo: sha(codigo),
    };
  }
  writeFileSync(EXTRACTO_V1, JSON.stringify(salida, null, 2) + "\n", "utf-8");
  console.log(`extracto v1 escrito: ${EXTRACTO_V1}`);
  for (const [nombre, d] of Object.entries(salida.nodos)) {
    console.log(`  ${nombre.padEnd(22)} ${d.patrones.length} patrones · sha ${d.sha256_del_codigo.slice(0, 12)}`);
  }
}

// ─── paso 2: verificar los scripts contra el extracto ─────────────────────────
function leerScript(nombre) {
  const ruta = join(AQUI, nombre);
  if (!existsSync(ruta)) throw new Error(`falta ${nombre} en esta carpeta`);
  return readFileSync(ruta, "utf-8");
}

function verificar() {
  if (!existsSync(EXTRACTO)) {
    console.error(`No está ${EXTRACTO}. Generalo primero con --extraer <workflow.json>.`);
    process.exit(2);
  }
  const ext = JSON.parse(readFileSync(EXTRACTO, "utf-8"));
  const fallos = [];
  const ok_ = (t) => console.log(`  OK   ${t}`);
  const ok = ok_;
  const mal = (t) => { console.log(`  MAL  ${t}`); fallos.push(t); };

  // 2.a — los cuatro nodos llevan el mismo conjunto
  console.log("\n── los cuatro nodos de compliance llevan el mismo conjunto");
  const conjuntos = Object.entries(ext.nodos).map(([n, d]) => [n, d.patrones.join("\n")]);
  const [, referencia] = conjuntos[0];
  for (const [nombre, texto] of conjuntos) {
    texto === referencia
      ? ok(`${nombre} — ${ext.nodos[nombre].patrones.length} patrones (${ext.nodos[nombre].rotulo})`)
      : mal(`${nombre} diverge del conjunto canónico`);
  }

  // 2.b — run_compliance_text.mjs corre exactamente esos patrones
  console.log("\n── run_compliance_text.mjs contra el nodo desplegado");
  const texto = leerScript("run_compliance_text.mjs");
  const delScript = literalesDeArreglo(texto, "PATRONES_V2");
  const delNodo = ext.nodos["Code in JavaScript1"].patrones;
  if (delScript.length !== delNodo.length) {
    mal(`el script declara ${delScript.length} patrones y el nodo tiene ${delNodo.length}`);
  } else {
    delScript.forEach((p, i) => {
      p === delNodo[i] ? ok(`patrón ${i + 1}: ${p}`)
                       : mal(`patrón ${i + 1}\n       script: ${p}\n       nodo  : ${delNodo[i]}`);
    });
  }

  // 2.b bis — el detector que produjo las Tablas 3, 4 y 5, y el divergente de HU10
  console.log("\n── el conjunto anterior a la corrección (Tablas 3, 4 y 5) y el divergente de HU10");
  if (!existsSync(EXTRACTO_V1)) {
    mal("falta Nodos_compliance_desplegados_v1.json: las Tablas 3, 4 y 5 quedan sin respaldo " +
        "(generalo con --extraer-v1 sobre el workflow del commit anterior a la corrección)");
  } else {
    const v1 = JSON.parse(readFileSync(EXTRACTO_V1, "utf-8"));
    for (const [constante, nodo, rotulo] of [
      ["PATRONES_V1", "Code in JavaScript1", "conjunto original (Tablas 3, 4 y 5)"],
      ["PATRONES_HU10", "Sched: Procesar", "conjunto divergente del flujo programado"],
    ]) {
      const delScript = literalesDeArreglo(texto, constante);
      const delNodo = v1.nodos[nodo]?.patrones ?? [];
      if (delScript.length !== delNodo.length) {
        mal(`${constante}: el script declara ${delScript.length} patrones y el nodo «${nodo}» tenía ${delNodo.length}`);
        continue;
      }
      const iguales = delScript.every((p, i) => p === delNodo[i]);
      if (iguales) {
        ok(`${constante} — ${delNodo.length} patrones idénticos a «${nodo}» (${rotulo})`);
      } else {
        delScript.forEach((p, i) => {
          if (p !== delNodo[i]) mal(`${constante} patrón ${i + 1}\n       script: ${p}\n       nodo  : ${delNodo[i]}`);
        });
      }
    }
  }

  // 2.c — el prompt de visión
  console.log("\n── run_compliance_vision.mjs contra el nodo de detección visual");
  const vision = leerScript("run_compliance_vision.mjs");
  const m = /const PROMPT = `([\s\S]*?)`;/.exec(vision);
  if (!m) {
    mal("no encuentro la constante PROMPT en run_compliance_vision.mjs");
  } else {
    const promptScript = m[1];
    sha(promptScript) === ext.vision.sha256_del_prompt
      ? ok(`prompt idéntico · ${promptScript.length} caracteres · sha ${ext.vision.sha256_del_prompt.slice(0, 12)}`)
      : mal(`el prompt difiere\n       script: sha ${sha(promptScript).slice(0, 12)}\n       nodo  : sha ${ext.vision.sha256_del_prompt.slice(0, 12)}`);
    const modeloScript = /const MODELO = "([^"]+)"/.exec(vision)?.[1];
    ext.vision.modelo.endsWith(modeloScript ?? " ")
      ? ok(`modelo: el script usa «${modeloScript}» y el nodo «${ext.vision.modelo}»`)
      : mal(`el script usa «${modeloScript}» y el nodo «${ext.vision.modelo}»`);
  }

  // 2.d — los dos umbrales estructurales
  console.log("");
  console.log("── umbrales verificables por lectura del codigo desplegado");
  for (const [nodo, d] of Object.entries(ext.firma_hu9 ?? {})) {
    const ok = d.concatenacion.length > 0 && !d.condicionada;
    (ok ? ok_ : mal)(`HU9 · ${nodo}: ${d.concatenacion.length} concatenacion(es) de firma, ` +
      `${d.condicionada ? "CONDICIONADA" : "incondicional"}` +
      `${d.elimina_duplicado ? ", con limpieza previa del duplicado" : ""}`);
  }
  ext.corte_hu13?.guarda
    ? ok_(`HU13 · ${ext.corte_hu13.nodo}: ${ext.corte_hu13.guarda}`)
    : mal("HU13: no encuentro la guarda de 60 s en el extracto");

  console.log("");
  if (fallos.length) {
    console.log(`*** ${fallos.length} DIVERGENCIA(S): lo que corre el material complementario NO es lo desplegado ***`);
    process.exit(1);
  }
  console.log("Sin divergencias: los scripts de esta carpeta corren los detectores del sistema desplegado.");
}

const i = process.argv.indexOf("--extraer");
const i1 = process.argv.indexOf("--extraer-v1");
if (i1 >= 0) extraerV1(process.argv[i1 + 1]);
else if (i >= 0) extraer(process.argv[i + 1]);
else verificar();
