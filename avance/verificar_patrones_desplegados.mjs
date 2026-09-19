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
// El mismo criterio visual tiene que correr en los cuatro flujos que publican, igual que
// las seis expresiones del canal textual. El carrusel lo lleva dentro de un prompt que
// además pide el orden narrativo, de modo que lo que se compara es el criterio y no el
// prompt entero.
const NODOS_VISION = [
  { flujo: "imagen única (HU7/HU8)", nodo: "HU8: Detección visual" },
  { flujo: "carrusel (HU5)", nodo: "HU5: Analizar carrusel" },
  { flujo: "video (HU13)", nodo: "Video: HU8 visual" },
  { flujo: "re-publicación (HU12)", nodo: "Repost: HU8 visual" },
];
// Umbrales que no se miden con una serie de tiempos sino leyendo el codigo desplegado,
// igual que el tope de diez imagenes de HU5: la firma de HU9 y el corte de 60 s de HU13.
const NODOS_FIRMA = ["Code in JavaScript1", "HU5: Pub preparar", "Sched: Procesar",
                     "Video: pub publicar"];
const NODO_VIDEO = "Video: procesar";

const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");

// Qué bloques envuelven a una línea, y de qué tipo son. Antes de la octava auditoría este
// script sólo miraba si la línea empezaba con `if (`, de modo que no veía un condicional de
// varias líneas. Pero la profundidad a secas tampoco alcanza: la firma del flujo inmediato
// vive dentro del `for` que recorre los ítems, y un bucle no la condiciona. Lo que importa
// es si alguno de los bloques que la contienen es una bifurcación.
const BLOQUES_QUE_CONDICIONAN = new Set(["if", "else", "switch", "catch"]);

function bloquesQueContienen(codigo) {
  const pila = [];
  for (let i = 0; i < codigo.length; i++) {
    const c = codigo[i];
    if (c === "/" && codigo[i + 1] === "/") { const j = codigo.indexOf("\n", i); if (j < 0) break; i = j; continue; }
    if (c === "/" && codigo[i + 1] === "*") { const j = codigo.indexOf("*/", i); if (j < 0) break; i = j + 1; continue; }
    if (c === "'" || c === '"' || c === "`") {
      const cierre = c;
      for (i++; i < codigo.length; i++) {
        if (codigo[i] === "\\") { i++; continue; }
        if (codigo[i] === cierre) break;
      }
      continue;
    }
    if (c === "{") { pila.push(claseDeBloque(codigo.slice(0, i))); continue; }
    if (c === "}") pila.pop();
  }
  return pila;
}

// Clasifica un `{` por lo que lo precede: `) {` viene de if/for/while/switch/catch/function.
function claseDeBloque(antes) {
  const t = antes.replace(/\s+$/, "");
  if (t.endsWith("=>")) return "arrow";
  if (/\btry$/.test(t)) return "try";
  if (/\belse$/.test(t)) return "else";
  if (!t.endsWith(")")) return "bloque";
  let d = 0;
  let i = t.length - 1;
  for (; i >= 0; i--) {
    if (t[i] === ")") d++;
    else if (t[i] === "(") { d--; if (d === 0) break; }
  }
  if (i < 0) return "bloque";
  const palabra = /([A-Za-z_$][\w$]*)\s*$/.exec(t.slice(0, i));
  return palabra ? palabra[1] : "bloque";
}

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
      // El código entero, y no sólo su sha. Sin esto el hash no es comprobable por un
      // tercero: puede recalcularlo, pero no contra nada.
      codigo,
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

  // El canal visual, flujo por flujo. El textual lleva el mismo conjunto de seis
  // expresiones en los cuatro nodos que publican; el visual no lo llevaba: la detección
  // sólo corría en imagen única, el carrusel usaba otro criterio y el video y la
  // re-publicación no tenían ninguna. `add-vision-compliance.mjs` lo unificó, y esto es
  // lo que vuelve comprobable esa unificación.
  const criterio = prompt.slice(prompt.indexOf("Detectá si"),
                                prompt.indexOf("# RESPUESTA")).trim();
  salida.vision.criterio = criterio;
  salida.vision.sha256_del_criterio = sha(criterio);
  salida.vision_por_flujo = {};
  for (const { flujo, nodo } of NODOS_VISION) {
    const n = porNombre.get(nodo);
    const texto = n?.parameters?.text ?? "";
    salida.vision_por_flujo[flujo] = {
      nodo,
      presente: Boolean(n),
      // El prompt entero, no un veredicto. Hasta la octava auditoría este campo era el
      // booleano `lleva_el_criterio`, calculado acá con `texto.includes(criterio)` sobre un
      // workflow que no se entrega: un tercero leía un `true` escrito por los autores. Ahora
      // se publica el prompt y la comprobación la rehace quien verifica.
      prompt: texto,
      sha256_del_prompt: sha(texto),
      modelo: n?.parameters?.modelId?.value ?? null,
      imagen: typeof n?.parameters?.imageUrls === "string" ? n.parameters.imageUrls : null,
    };
  }

  // HU9: la concatenacion de la firma debe ser incondicional en los cuatro nodos que
  // publican. Se extrae la linea y se comprueba que no cuelgue de ningun `if`.
  salida.firma_hu9 = {
    alcance: "Se localiza la concatenación de la firma y se clasifican los bloques que la " +
      "contienen, saltando cadenas y comentarios. Un `for` que recorre los ítems no la " +
      "condiciona; un `if`, un `else`, un `switch` o un `catch`, sí. Esto NO " +
      "establece que ninguna rama del workflow publique sin pasar por el nodo: eso es una " +
      "propiedad del grafo de conexiones y no del código de un nodo.",
  };
  for (const nodo of NODOS_FIRMA) {
    const codigo = porNombre.get(nodo)?.parameters?.jsCode ?? "";
    const lineas = codigo.split(String.fromCharCode(10));
    const concat = [];
    for (const [i, cruda] of lineas.entries()) {
      const l = cruda.trim();
      if (!(/caption\s*=\s*caption\s*\+/.test(l) && /firma/i.test(l))) continue;
      const hasta = lineas.slice(0, i).join(String.fromCharCode(10));
      const bloques = bloquesQueContienen(hasta);
      concat.push({
        linea: i + 1,
        texto: l,
        bloques_que_la_contienen: bloques,
        dentro_de_una_bifurcacion: bloques.some((b) => BLOQUES_QUE_CONDICIONAN.has(b)),
        // Un ternario o un `&&` delante de la asignación la condicionan sin abrir bloque.
        condicional_en_la_linea: /^(if|else)\b/.test(l) ||
          /[?&|]{1,2}[^=]*caption\s*=\s*caption\s*\+/.test(l),
      });
    }
    salida.firma_hu9[nodo] = {
      concatenacion: concat,
      condicionada: concat.some((c) => c.dentro_de_una_bifurcacion || c.condicional_en_la_linea),
      elimina_duplicado: lineas.some((l) => /caption\s*=\s*caption\.split\(\s*firma/i.test(l)),
    };
  }
  // HU13: la guarda del corte de 60 s. Era `if(dur && dur>60)`, que no se dispara cuando
  // `ffdur` no puede leer la duración: fail-open. `scripts/fix-hu13-duracion.mjs` la cerró.
  const cod13 = porNombre.get(NODO_VIDEO)?.parameters?.jsCode ?? "";
  const lineas13 = cod13.split(String.fromCharCode(10)).map((l) => l.trim());
  salida.corte_hu13 = {
    nodo: NODO_VIDEO,
    guarda: lineas13.filter((l) => /dur\s*>\s*60/.test(l))[0] ?? null,
    lectura_de_la_duracion: lineas13.filter((l) => /function ffdur/.test(l))[0] ?? null,
    // La guarda tiene que cubrir el caso en que la duración no se puede leer.
    cierra_ante_duracion_ilegible: /dur\s*===\s*null\s*\|\|\s*dur\s*>\s*60/.test(cod13),
    codigo: cod13,
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

  // 2.c bis — el criterio visual, en los cuatro flujos
  console.log("");
  console.log("── el canal visual lleva el mismo criterio en los cuatro flujos");
  const porFlujo = ext.vision_por_flujo;
  if (!porFlujo) {
    mal("el extracto no trae vision_por_flujo: regeneralo con --extraer");
  } else {
    // La comparación se rehace acá, contra el prompt que el extracto publica. Antes el
    // extracto traía el veredicto ya calculado y esto sólo lo leía.
    const criterio = ext.vision?.criterio ?? "";
    for (const [flujo, d] of Object.entries(porFlujo)) {
      if (!d.presente) { mal(`${flujo}: falta el nodo «${d.nodo}»`); continue; }
      if (typeof d.prompt !== "string") {
        mal(`${flujo}: el extracto no trae el prompt de «${d.nodo}»: regeneralo con --extraer`);
        continue;
      }
      if (sha(d.prompt) !== d.sha256_del_prompt) {
        mal(`${flujo}: el sha del prompt de «${d.nodo}» no coincide con su texto`);
        continue;
      }
      if (!criterio) { mal("el extracto no trae el criterio visual de HU8"); continue; }
      d.prompt.includes(criterio)
        ? ok(`${flujo} — «${d.nodo}»: prompt de ${d.prompt.length} caracteres que contiene el ` +
             `criterio de ${criterio.length}, sobre ${d.imagen ?? "(sin url declarada)"}`)
        : mal(`${flujo}: «${d.nodo}» no lleva el criterio de HU8`);
    }
    const n = Object.keys(porFlujo).length;
    (n === 4 ? ok_ : mal)(`${n} flujos de publicación cubiertos por el canal visual`);
  }

  // 2.d — los dos umbrales estructurales
  console.log("");
  console.log("── umbrales verificables por lectura del codigo desplegado");
  for (const [nodo, d] of Object.entries(ext.firma_hu9 ?? {})) {
    if (nodo === "alcance") continue;
    const bien = d.concatenacion.length > 0 && !d.condicionada;
    const donde = d.concatenacion
      .map((c) => `línea ${c.linea}, dentro de [${c.bloques_que_la_contienen.join(" > ") || "el cuerpo del nodo"}]`).join("; ");
    (bien ? ok_ : mal)(`HU9 · ${nodo}: ${d.concatenacion.length} concatenacion(es) de firma ` +
      `(${donde || "ninguna"}), ${d.condicionada ? "CONDICIONADA" : "incondicional"}` +
      `${d.elimina_duplicado ? ", con limpieza previa del duplicado" : ""}`);
  }
  if (ext.firma_hu9?.alcance) console.log(`   alcance: ${ext.firma_hu9.alcance}`);

  if (!ext.corte_hu13?.guarda) {
    mal("HU13: no encuentro la guarda de 60 s en el extracto");
  } else {
    ok_(`HU13 · ${ext.corte_hu13.nodo}: ${ext.corte_hu13.guarda}`);
    // Una guarda de la forma `dur && dur>60` no se dispara si la duración no se pudo leer,
    // que es el camino frágil que el §4.7.3 describe al no haber ffprobe.
    ext.corte_hu13.cierra_ante_duracion_ilegible
      ? ok_("HU13 · la guarda cubre también el caso de duración ilegible (fail-closed)")
      : mal("HU13 · la guarda NO cubre el caso de duración ilegible: es fail-open");
    if (ext.corte_hu13.codigo && sha(ext.corte_hu13.codigo).length !== 64) {
      mal("HU13: el código del nodo no se pudo hashear");
    }
  }

  // 2.e — el extracto trae el código, y no sólo su hash
  console.log("");
  console.log("── el extracto es autocontenido");
  for (const [nodo, d] of Object.entries(ext.nodos)) {
    if (typeof d.codigo !== "string") {
      mal(`«${nodo}»: el extracto no trae el código: regeneralo con --extraer`);
    } else {
      sha(d.codigo) === d.sha256_del_codigo
        ? ok(`«${nodo}»: ${d.codigo.length} caracteres de código, sha verificable contra su texto`)
        : mal(`«${nodo}»: el sha declarado no corresponde al código que el extracto trae`);
    }
  }

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
