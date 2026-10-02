// Genera los consentimientos escritos retroactivos que pide N-03 de la devolución del 29-09-2026.
// Mismo tono y estructura que avance/instrumentos/CONSENTIMIENTO.md (el de la ampliación).
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
  LevelFormat, Table, TableRow, TableCell, WidthType, ShadingType,
} = require('docx');

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

const FUENTE = 'Arial';
const p = (texto, opts = {}) => new Paragraph({
  spacing: { after: 120, line: 276 },
  ...opts,
  children: (Array.isArray(texto) ? texto : [texto]).map((t) =>
    typeof t === 'string' ? new TextRun({ text: t, font: FUENTE, size: 22 }) : t),
});
const b = (t) => new TextRun({ text: t, bold: true, font: FUENTE, size: 22 });
const t = (s) => new TextRun({ text: s, font: FUENTE, size: 22 });
const h = (texto) => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 },
  children: [new TextRun({ text: texto, bold: true, font: FUENTE, size: 24, color: '1F3C5E' })],
});
const vineta = (texto) => new Paragraph({
  numbering: { reference: 'vinetas', level: 0 }, spacing: { after: 80, line: 276 },
  children: (Array.isArray(texto) ? texto : [texto]).map((x) => typeof x === 'string' ? t(x) : x),
});
const casilla = (texto) => p([t('☐  '), t(texto)], { indent: { left: 360 } });
const linea = () => new Paragraph({
  spacing: { before: 120, after: 240 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999', space: 1 } },
  children: [],
});

function encabezado(titulo, subtitulo) {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1, alignment: AlignmentType.LEFT, spacing: { after: 120 },
      children: [new TextRun({ text: titulo, bold: true, font: FUENTE, size: 30, color: '1F3C5E' })],
    }),
    p([new TextRun({ text: subtitulo, italics: true, font: FUENTE, size: 20, color: '555555' })]),
    linea(),
    p([b('Trabajo: '), t('«Postly: Sistema de Automatización Inteligente para la Generación y Publicación de '
      + 'Contenido en Redes Sociales mediante n8n e IA».')]),
    p([b('Carrera: '), t('Tecnicatura Universitaria en Programación, Universidad Tecnológica Nacional, '
      + 'Facultad Regional Mendoza.')]),
    p([b('Autores: '), t('Jeremías Bontorno y Nicolás Hassan. '), b('Director: '), t('Alberto Cortez.')]),
    linea(),
  ];
}

// Bloque de firma: tabla de dos columnas sin bordes visibles, con líneas para completar.
function firma(rol) {
  const celda = (texto) => new TableCell({
    width: { size: 4513, type: WidthType.DXA },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
               left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    children: [
      new Paragraph({ spacing: { before: 480, after: 40 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 } }, children: [] }),
      p([new TextRun({ text: texto, font: FUENTE, size: 18, color: '555555' })]),
    ],
  });
  const fila = (a, c) => new TableRow({ children: [celda(a), celda(c)] });
  return [
    h('Firma'),
    new Table({
      width: { size: 9026, type: WidthType.DXA }, columnWidths: [4513, 4513],
      rows: [
        fila(`Firma de ${rol}`, 'Aclaración (nombre y apellido)'),
        fila('DNI (opcional)', 'Lugar y fecha'),
        fila('Firma de uno de los autores', 'Aclaración'),
      ],
    }),
    p([new TextRun({ text: 'Se firman dos ejemplares: uno queda con quien firma y otro con los autores. '
      + 'Este formulario no se publica ni se deposita.', italics: true, font: FUENTE, size: 18, color: '555555' })],
      { spacing: { before: 240 } }),
  ];
}

const comunes = (quien) => [
  h('Tu participación es voluntaria'),
  p('Firmar es voluntario. Si preferís no firmar, o querés que tu participación deje de usarse, decinoslo: '
    + 'mientras la versión final del trabajo no se haya presentado, lo que dependa de vos se retira del '
    + 'documento y de los depósitos, y se informa así en la tesis. No hace falta dar explicaciones y no tiene '
    + 'ninguna consecuencia.'),
  p(`No hubo ni hay pago ni beneficio económico por ${quien}, ni costo alguno para vos.`),
  h('Dudas'),
  p('Podés preguntar lo que quieras antes de firmar. Si más adelante querés retirar tu consentimiento, '
    + 'escribinos.'),
];

const docBase = (secciones) => new Document({
  creator: 'Bontorno y Hassan',
  styles: { default: { document: { run: { font: FUENTE, size: 22 } } } },
  numbering: { config: [{ reference: 'vinetas', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
    alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 },
      margin: { top: 1134, bottom: 1134, left: 1440, right: 1440 } } },
    children: secciones,
  }],
});

// ───────────────────────────────────────────── evaluadores
function evaluador(nombreArchivo, cual, tareas, como, registra, deposito) {
  const doc = docBase([
    ...encabezado('Consentimiento informado — participación como evaluador externo',
      'Consentimiento escrito de una participación que ya ocurrió (septiembre de 2026)'),
    h('Por qué recibís este formulario ahora'),
    p(`Participaste como ${cual} de la evaluación de Postly en septiembre de 2026, con un acuerdo verbal. `
      + 'El tribunal que evalúa el trabajo pidió que ese acuerdo quede por escrito, porque es lo que corresponde '
      + 'cuando una persona participa de una investigación. Este formulario describe lo que hiciste, cómo '
      + 'aparece en el trabajo y te permite confirmarlo o pedir que se retire.'),
    h('Qué hiciste'),
    ...tareas.map(vineta),
    h('Qué se registra'),
    p(registra + ' No se registra tu nombre en ningún archivo de datos.'),
    h('Cómo aparecés en el trabajo'),
    p(como),
    p(deposito),
    ...comunes('participar'),
    h('Declaración'),
    p('Confirmo que participé de las tareas descritas, que lo hice voluntariamente, que la descripción de mi '
      + 'participación es correcta y que autorizo su uso en los términos de este formulario.'),
    ...firma('quien evaluó'),
  ]);
  return Packer.toBuffer(doc).then((buf) => fs.writeFileSync(path.join(OUT, nombreArchivo), buf));
}

const comoComun = 'En la tesis no figura tu nombre. Se te describe como un estudiante de la misma universidad '
  + 'que los autores, que cursa su propio trabajo final, ajeno al desarrollo del sistema y conocido de los '
  + 'autores: el trabajo declara esa proximidad como una limitación de la evaluación.';

// ───────────────────────────────────────────── aportantes de material
function aportantes() {
  const doc = docBase([
    ...encabezado('Consentimiento informado — uso del material aportado para evaluar el sistema Postly',
      'Consentimiento escrito de un aporte que ya ocurrió (septiembre de 2026)'),
    h('Por qué recibís este formulario ahora'),
    p('En septiembre de 2026 le aportaste al equipo material de tu actividad como Consultora de Belleza '
      + 'Independiente, con un acuerdo verbal, para poner a prueba el módulo del sistema que detecta precios y '
      + 'promociones. El tribunal que evalúa el trabajo pidió que ese acuerdo quede por escrito. Si además '
      + 'participaste de la sesión de cronometraje, el consentimiento que firmaste entonces cubre esa sesión, '
      + 'pero no este material: por eso este formulario es aparte.'),
    h('Qué aportaste'),
    p('Marcá lo que corresponda:'),
    casilla('Mensajes de venta que enviaste por canal privado a clientas, que el equipo transcribió.'),
    casilla('Textos (pies de foto) que escribiste, a pedido del equipo, para imágenes de tus productos.'),
    casilla('Imágenes de producto —arte de la marca o fotos propias— que le reenviaste al equipo.'),
    casilla('Una pieza con un precio o un descuento ya impreso en la imagen.'),
    casilla('Etiquetaste tus propias piezas como publicables o no publicables.'),
    h('Cómo se usó'),
    vineta('Los textos se pasaron por el detector del sistema para medir cuántos precios y promociones '
      + 'detecta y cuántas veces bloquea de más. No se publicaron en ninguna cuenta.'),
    vineta('Algunas imágenes se usaron como base para casos de prueba: el equipo les agregó placas de precio '
      + 'para comprobar que el sistema las bloquea. Esas composiciones no se publicaron en tus cuentas. Si '
      + 'aportaste una pieza que ya traía el precio impreso, se usó tal cual, como caso real.'),
    vineta('Tu etiqueta de cada pieza se comparó con la de un evaluador externo.'),
    h('Dónde queda y cómo aparecés'),
    p([t('En la tesis aparecés con un código, nunca con tu nombre. Código asignado: '),
       b('__________'), t('.')]),
    p('Los textos completos y las imágenes quedan en el registro restringido del material complementario en '
      + 'Zenodo (https://doi.org/10.5281/zenodo.22921344), que sólo se entrega por solicitud justificada, y no '
      + 'llevan tu nombre. La tesis puede citar fragmentos de tus textos, también sin tu nombre.'),
    p([b('Datos de terceros. '), t('Si alguna transcripción de tus mensajes incluye el nombre, el teléfono o '
      + 'cualquier dato de una clienta, avisanos y se elimina antes de cualquier uso.')]),
    ...comunes('aportar el material'),
    h('Declaración'),
    p('Confirmo que el material marcado es mío o fue enviado por mí, que lo aporté voluntariamente, que la '
      + 'descripción de su uso es correcta y que autorizo ese uso en los términos de este formulario.'),
    ...firma('la consultora'),
  ]);
  return Packer.toBuffer(doc).then((buf) =>
    fs.writeFileSync(path.join(OUT, 'Consentimiento_aporte_de_material.docx'), buf));
}

Promise.all([
  evaluador('Consentimiento_evaluador_1.docx', 'primer evaluador externo', [
    'Etiquetaste como «infractor» o «limpio» las 29 piezas de contenido real que aportaron tres consultoras, '
      + 'a partir de las dos reglas de las Pautas de la marca que te entregamos, sin ver lo que había '
      + 'decidido el sistema.',
    'Estudio 1: comparaste a ciegas, para 8 productos, el texto que propone Postly con el de un generador '
      + 'genérico; puntuaste cuatro dimensiones de 1 a 5 y elegiste cuál publicarías.',
    'Estudio 4: comparaste a ciegas 32 pares de textos —el escrito a mano por cada participante y el de '
      + 'Postly— y el orden de imágenes de los carruseles, y elegiste en cada caso cuál publicarías.',
  ], comoComun,
  'Tus etiquetas del corpus, tus puntajes y tus elecciones, tal como las entregaste.',
  'Tus puntajes y elecciones de los Estudios 1 y 4 se publican como archivo de datos, sin tu nombre, en el '
    + 'registro abierto del material complementario en Zenodo (https://doi.org/10.5281/zenodo.22921147), para '
    + 'que un tercero pueda recalcular los resultados. Tus etiquetas del corpus quedan junto a los textos de '
    + 'las consultoras en el registro restringido (https://doi.org/10.5281/zenodo.22921344), que sólo se '
    + 'entrega por solicitud justificada.'),
  evaluador('Consentimiento_evaluador_2.docx', 'segundo evaluador externo', [
    'Estudio 2: leíste 24 textos generados por Postly sin saber con qué tono se habían pedido y asignaste '
      + 'cada uno a uno de los tres tonos (Informativo, Vendedor, Divertido).',
    'Estudio 3: para 8 conjuntos de imágenes de carrusel, viste las dos secuencias posibles —la que propone '
      + 'el sistema y la del envío original— y elegiste cuál publicarías.',
  ], comoComun,
  'Tus asignaciones de tono y tus elecciones de secuencia, tal como las entregaste.',
  'Tus respuestas se publican como archivo de datos, sin tu nombre, en el registro abierto del material '
    + 'complementario en Zenodo (https://doi.org/10.5281/zenodo.22921147), para que un tercero pueda '
    + 'recalcular los resultados.'),
  aportantes(),
]).then(() => console.log('escritos en', OUT));
