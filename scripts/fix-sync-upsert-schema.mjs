// Pone al día el esquema de columnas de «Sync: Upsert», que venía fallando en silencio.
//
// POR QUÉ EXISTE
// El nodo de Google Sheets guarda, junto con el mapeo, una copia del encabezado de la hoja
// tal como estaba cuando se lo configuró. Si después la hoja gana columnas, el nodo aborta
// con:
//
//   Column names were updated after the node's setup
//
// «Sync: Upsert» quedó con las 8 columnas que mapea y la hoja tiene 16. Y como el nodo
// está en `onError: continueRegularOutput`, el error no interrumpe nada: Mi Agenda se
// dibuja igual, con las filas que ya estaban, y la sincronización desde Instagram no
// escribe. El síntoma es que una publicación hecha a mano en Instagram nunca aparece en la
// agenda, sin ningún mensaje de error.
//
// El esquema pasa a tener las 16 columnas reales de la hoja, en su orden. El mapeo no
// cambia: se siguen escribiendo las mismas 8, y en una actualización las otras 8 quedan
// intactas, que es lo que permite que una fila creada por Postly conserve sus tres copys y
// sus métricas de Facebook cuando la sincronización la vuelve a tocar.
//
// Uso:  node scripts/fix-sync-upsert-schema.mjs [--escribir]
import { readFileSync, writeFileSync } from "node:fs";

const RUTA = "workflows/Postly - Entrega Final Sprint 1 v2.json";
const wf = JSON.parse(readFileSync(RUTA, "utf-8"));
const nodo = wf.nodes.find((n) => n.name === "Sync: Upsert");
if (!nodo) { console.error("falta el nodo «Sync: Upsert»"); process.exit(1); }

// El encabezado vivo de «Hoja 1», leído de la salida del nodo que la lee en la misma
// ejecución (612). Si la hoja vuelve a cambiar, esta lista se actualiza desde ahí.
const COLUMNAS = [
  "UserID", "Timestamp", "ImageURL", "Carousel_URLs", "Status",
  "Copy_Op1", "Copy_Op2", "Copy_Op3", "Copy_Final", "PostID_IG",
  "Fecha_Programada", "Likes", "Comments", "Reach", "Metricas_Enviadas", "PostID_FB",
];

const campo = (id) => ({
  id, displayName: id, required: false, defaultMatch: false,
  display: true, type: "string", canBeUsedToMatch: true,
});

const mapeadas = Object.keys(nodo.parameters.columns.value);
const faltan = mapeadas.filter((m) => !COLUMNAS.includes(m));
if (faltan.length) { console.error("columnas mapeadas que la hoja no tiene: " + faltan.join(", ")); process.exit(1); }

const antes = nodo.parameters.columns.schema.map((s) => s.id);
nodo.parameters.columns.schema = COLUMNAS.map(campo);
console.log(`  esquema: ${antes.length} -> ${COLUMNAS.length} columnas`);
console.log(`  se agregan: ${COLUMNAS.filter((c) => !antes.includes(c)).join(", ")}`);
console.log(`  se siguen escribiendo: ${mapeadas.join(", ")}`);
console.log(`  se conservan en cada actualización: ${COLUMNAS.filter((c) => !mapeadas.includes(c)).join(", ")}`);

// comprobación: ningún otro nodo de Sheets que escriba sobre «Hoja 1» quedó con un
// esquema que no cubra las columnas que mapea
let sospechosos = 0;
for (const n of wf.nodes) {
  if (!n.type.endsWith("googleSheets")) continue;
  const col = n.parameters?.columns;
  if (!col || col.mappingMode !== "defineBelow") continue;
  const ids = (col.schema || []).map((s) => s.id);
  const sinEsquema = Object.keys(col.value || {}).filter((v) => !ids.includes(v));
  if (sinEsquema.length) { console.log(`  *** ${n.name}: mapea sin esquema -> ${sinEsquema.join(", ")}`); sospechosos++; }
}
console.log(`\nnodos de Sheets que mapean una columna ausente de su esquema: ${sospechosos}`);

if (!process.argv.includes("--escribir")) {
  console.log("\n(dry-run: no se escribió el JSON. Agregá --escribir para aplicar)");
  process.exit(0);
}
writeFileSync(RUTA, JSON.stringify(wf, null, 2), "utf-8");
console.log(`\nescrito: ${RUTA}`);
