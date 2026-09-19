// Corrige el destinatario de tres avisos que nunca podrían llegar.
//
// POR QUÉ EXISTE
// Los avisos de compliance que se agregaron al flujo de video y al de re-publicación
// heredaron el chatId del aviso del flujo de imagen única:
//
//   {{ $node["Telegram Trigger"].json.message.chat.id }}
//
// Eso es correcto allí, porque ese flujo arranca cuando la usuaria manda una foto y el
// update de Telegram trae `message`. Pero los tres avisos que corrige este script viven
// en ramas que arrancan con un botón, es decir con un `callback_query`, y en esos updates
// `message` no existe en la raíz: cuelga de `callback_query.message`. El chatId resuelve a
// undefined y el envío falla.
//
//   - «Repost: imagen con precio»  — la rama entera nace del botón de Mi Agenda.
//   - «Video: frame con precio» y «Video: aviso de recorte» — llegan por dos caminos: el
//     video de hasta 60 s, que entra como mensaje, y el de más de 60 s, que pasa por el
//     botón de recortar. Funcionan en el primero y fallan en el segundo, que es por donde
//     no se los probó.
//
// Los dos de video quedan con la forma condicional que el workflow ya usa en otro nodo
// para el mismo problema; el de repost, con la forma directa de los otros trece avisos de
// rama de botón.
//
// Uso:  node scripts/fix-chatid-avisos.mjs [--escribir]
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
const wf = JSON.parse(readFileSync(RUTA, "utf-8"));
const porNombre = new Map(wf.nodes.map((n) => [n.name, n]));
const fallos = [];

const T = "$('Telegram Trigger').first().json";
const SOLO_BOTON = `={{ ${T}.callback_query.message.chat.id }}`;
const AMBOS = `={{ ${T}.callback_query ? ${T}.callback_query.message.chat.id : ${T}.message.chat.id }}`;
const ROTO = '={{ $node["Telegram Trigger"].json.message.chat.id }}';

const CAMBIOS = [
  ["Repost: imagen con precio", SOLO_BOTON],
  ["Video: frame con precio", AMBOS],
  ["Video: aviso de recorte", AMBOS],
];

for (const [nombre, nuevo] of CAMBIOS) {
  const n = porNombre.get(nombre);
  if (!n) { fallos.push(`falta el nodo «${nombre}»`); continue; }
  const actual = String(n.parameters.chatId || "");
  if (actual === nuevo) { console.log(`  = ${nombre} ya estaba corregido`); continue; }
  if (actual !== ROTO) { fallos.push(`«${nombre}»: chatId inesperado -> ${actual}`); continue; }
  n.parameters.chatId = nuevo;
  console.log(`  ~ ${nombre}`);
}

// comprobación: ningún nodo de Telegram alcanzable desde el router de botones lee
// `message` en la raíz del update. Se recorre el grafo hacia adelante desde el router.
const alcanzables = (raiz) => {
  const vistos = new Set();
  const pila = [raiz];
  while (pila.length) {
    const n = pila.pop();
    if (vistos.has(n)) continue;
    vistos.add(n);
    for (const rama of wf.connections[n]?.main || []) {
      for (const c of rama || []) pila.push(c.node);
    }
  }
  return vistos;
};
const porBoton = alcanzables("Router callback");
let sospechosos = 0;
for (const n of wf.nodes) {
  if (!n.type.endsWith("telegram")) continue;
  const chat = String(n.parameters.chatId || "");
  if (!chat.includes("message.chat.id") || chat.includes("callback_query")) continue;
  if (!porBoton.has(n.name)) continue;
  console.log(`  *** ${n.name} se alcanza desde un botón y lee message en la raíz`);
  sospechosos++;
}
console.log(`\nnodos de Telegram alcanzables desde un botón con chatId sospechoso: ${sospechosos}`);
console.log(`   (el router alcanza ${porBoton.size} nodos)`);

if (fallos.length) { console.error("\n*** FALLOS ***\n  " + fallos.join("\n  ")); process.exit(1); }
if (!process.argv.includes("--escribir")) {
  console.log("\n(dry-run: no se escribió el JSON. Agregá --escribir para aplicar)");
  process.exit(0);
}
writeFileSync(RUTA, JSON.stringify(wf, null, 2), "utf-8");
console.log(`\nescrito: ${RUTA}`);
