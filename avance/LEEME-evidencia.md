# evidencia/ — datos crudos y scripts de los análisis del Capítulo 5

Esta carpeta es el material complementario que el Anexo E del documento nombra. Está
para que las cifras del Capítulo 5 puedan verificarse contra el dato crudo, no para que
se confíe en ellas.

## Requisitos
Node.js 18 o posterior. Sin dependencias externas: los scripts sólo usan `node:fs`.

## Cómo reproducir cada tabla

| Tabla del documento | Comando |
|---|---|
| Tabla 3 — conjunto representativo (n = 40) | `node run_compliance_text.mjs Casos_Compliance_Representativo.csv --v1` |
| Tabla 4 — conjunto de estrés (n = 40) | `node run_compliance_text.mjs Casos_Compliance.csv --v1` |
| Tabla 5 — contenido real y κ de Cohen (n = 29) | `node run_compliance_field.mjs` |
| Tabla 6 y Tabla 10 — valores límite, antes | `node run_compliance_text.mjs Casos_Compliance_Limite.csv --v1` |
| Tabla 6 y Tabla 10 — valores límite, después | `node run_compliance_text.mjs Casos_Compliance_Limite.csv` |
| §5.1 y E.1.4 — divergencia del flujo programado | `node run_compliance_hu10.mjs` |
| Tabla 7 — cronometraje y prueba t | `node run_cronometraje.mjs` |
| Tabla 8 — TAM y α de Cronbach | `node run_tam.mjs` |
| Tabla 11 — baterías de validación técnica | `node run_baterias.mjs` (requiere n8n en marcha) |
| Tablas 12 y 14 — canal de imagen (HU8) | `GEMINI_API_KEY=… node run_compliance_vision.mjs` |
| Tabla 13 — umbrales de las Historias de Usuario | `node run_umbrales.mjs` (requiere n8n en marcha) |
| E.8 — variabilidad entre corridas | `GEMINI_API_KEY=… node run_compliance_vision.mjs casos_imagen_corrida2` |

`run_compliance_vision.mjs` escribe un resultado por caso y, al terminar, imprime la
matriz de los 29. Las dos tablas del documento son dos cortes de ese mismo archivo, y
no se promedian: la **Tabla 12** son las filas `V01`–`V20`, las formas de incrustación
habituales; la **Tabla 14** son `V21`–`V28` más `R01`, los casos de legibilidad extrema.
Sobre un conjunto ya puntuado el script no gasta cuota: saltea los casos con veredicto.

El conmutador `--v1` corre el conjunto de expresiones regulares anterior a la corrección
descrita en el §5.1 —el que produjo las Tablas 3, 4 y 5—; sin el conmutador corre el
conjunto corregido y unificado. Ambos están transcritos verbatim del nodo desplegado.

## Qué contiene cada archivo

- `Casos_Compliance_*.csv` — los conjuntos de casos, con la clase real etiquetada a mano
  conforme al Anexo D y la predicción de comportamiento registrada **antes** de ejecutar.
- `*_resultados.csv` / `*_resultados_v1.csv` — la salida de cada corrida: para cada caso,
  el veredicto del detector y la expresión regular que produjo el bloqueo. Son el registro
  de ejecución de las matrices de confusión.
- `Divergencia_HU10_resultados.csv` — veredicto del flujo inmediato y del flujo programado
  para cada caso, sobre los cuatro conjuntos.
- `Compliance_Campo.csv` — los 29 casos de campo, con el **pie de foto verbatim** de cada
  uno, la etiqueta de la consultora, la del evaluador externo, la verdad de base y el
  resultado que devolvió el bot en producción. El texto es el mismo que recibió el bot: lo
  único normalizado es el espacio en blanco, porque hay una fila por caso. Ejecutar
  `run_compliance_text.mjs` sobre esa columna reproduce, caso por caso, el veredicto de la
  columna `Resultado_sistema`.
- `Cronometraje_datos.csv` — los 12 pares de tiempos (mm:ss), tres participantes.
- `Pautas Mary Kay para el uso en las Redes Sociales.pdf` — la fuente normativa del
  Anexo D, diez páginas. Está para que las dos reglas que codifica el Módulo Centinela
  puedan leerse en su letra y no sólo en la síntesis del anexo. Ojo con lo que dice y
  lo que no: la regla de precios está literal; la de la firma obliga a la nomenclatura
  en el nombre de la página de negocio y a identificarse al comentar en sitios de la
  marca, y no a firmar cada publicación del feed propio. Que Postly la firme igual es
  una lectura conservadora, y el Anexo D lo declara como tal.
- `TAM_respuestas.csv` — las respuestas al cuestionario de diez ítems, una fila por
  participante. La redacción de los ítems está transcrita en el Anexo E.3.

- `casos_imagen/` — los 29 casos del canal de imagen (HU8): las imágenes, el manifiesto
  `Casos_Compliance_Imagen.csv` con la clase real y la forma de incrustación que prueba
  cada una, y el archivo de resultados con el veredicto del modelo y su justificación. Las
  imágenes se incluyen para que el canal de imagen sea reproducible: sin ellas sólo puede
  leerse el archivo de resultados y hay que confiar en él.
  Son dos conjuntos con propósitos distintos, y conviene no promediarlos sin decirlo:
  `V01`–`V20` son las formas de incrustación habituales (Tabla 12, Anexo E.6) y
  `V21`–`V28` más `R01` son los casos de legibilidad extrema (Tabla 14, Anexo E.8).
- `casos_imagen_corrida2/` — los nueve casos difíciles otra vez, con su propio manifiesto
  y su propio archivo de resultados. Existe para medir la variabilidad del modelo entre
  corridas sin volver a pagar las inferencias de los veinte casos habituales. Llegó a ocho
  de los nueve: la cuota diaria se agotó en `R01`, y así se declara en el Anexo E.8.
- `Baterias_resultados.csv` — las tres baterías de validación técnica del §3.4.2. La
  columna `Umbral_declarado` nombra la Historia de Usuario que fija cada umbral; donde la
  HU no fija ninguno, la columna lo dice y `Cumple` queda en `—`.

- `Umbrales_HU_resultados.csv` — los nueve umbrales numéricos que fijan las Historias
  de Usuario, con el grado de verificación de cada uno (`medición`, `configuración` o
  `no verificado`), la n cuando hay una serie de tiempos, el valor observado y la
  fuente. Lo produce `run_umbrales.mjs`, que no dispara ejecuciones nuevas: lee la
  configuración del workflow desplegado y el historial de ejecuciones del propio motor,
  de modo que no consume cuota de ningún modelo y puede reejecutarse sin costo.

### Scripts auxiliares (no producen ninguna tabla)

- `_extraer_foto.mjs` — toma de una ejecución real el arreglo `photo` que Telegram
  entregó al disparador y lo guarda en `_foto_patron.json`. Un `file_id` de Telegram es
  estable para el mismo bot, de modo que ese patrón permite reproducir el envío de una
  imagen —y con él la batería de integración multimodal de `run_baterias.mjs`— sin un
  cliente humano. Ejecutar primero: `node _extraer_foto.mjs <id de ejecución>`.

- `fix-compliance-patterns.mjs` — aplica el conjunto corregido y unificado de expresiones
  regulares a los cuatro nodos que ejecutan el filtro en el workflow (HU7/HU9, el carrusel
  de HU5, el programador de HU10 y el video de HU13). Es idempotente y, sin `--deploy`,
  sólo reescribe el JSON versionado del workflow sin tocar la instancia. Es el script que
  cierra la divergencia entre flujos descrita en el §5.1 y el Anexo E.1.4.
- `armar_casos_imagen.py` — compone las placas, etiquetas, marcas de agua y textos
  promocionales de los diez casos infractores `V01`–`V10` sobre el material gráfico de
  base, y escribe el manifiesto `Casos_Compliance_Imagen.csv`. Permite auditar cómo se
  construyó cada caso del conjunto ampliado (Anexo E.6).
- `armar_casos_imagen_dificiles.py` — agrega los casos de legibilidad extrema `V21`–`V28`,
  copia `R01` —la pieza auténtica, que no se compone ni se reencuadra— y prepara la
  carpeta de la segunda corrida (Anexo E.8). Es **aditivo**: anexa las filas al manifiesto
  y al archivo de resultados en vez de rehacerlos, porque cada caso ya puntuado costó una
  petición contra la cuota diaria. Por lo mismo, `armar_casos_imagen.py` **no debe
  reejecutarse tal cual**: reescribe el manifiesto desde cero y dejaría fuera estos nueve.

Ninguno de los scripts lleva identificadores de la instancia desplegada: la URL base,
la clave de la API de n8n, el `webhookId` del Telegram Trigger y el chat de prueba se leen de un
`.env` que no acompaña a esta carpeta. `run_baterias.mjs` aborta indicando qué falta si no
los encuentra.

## Nota sobre las cuatro filas de imagen de los conjuntos de texto
Las filas con `Canal = Imagen` de `Casos_Compliance*.csv` no las evalúa ningún script:
son los cuatro casos originales, que se enviaron al bot en producción y cuyo veredicto se
cargó a mano en la columna `Resultado_obtenido`. El conjunto ampliado del canal de imagen
vive en `casos_imagen/` y sí lo produce `run_compliance_vision.mjs`.

## Material de terceros

Dos partes de esta carpeta son contenido que aportaron las tres Consultoras de Belleza
Independientes que participaron del estudio: el pie de foto verbatim de los 29 casos de
`Compliance_Campo.csv` y el material gráfico sobre el que se componen los casos de
`casos_imagen/`. Se incluyen porque sin ellos las Tablas 5, 12 y 14 no son verificables
contra el dato crudo, que es el propósito de esta carpeta.

Corresponde precisar qué son y qué no, y las dos partes son distintas entre sí.

Los 29 textos los **redactaron ellas**, sobre sus propios productos, a los efectos de esta
evaluación: no son publicaciones en línea de sus cuentas. Entre ellos hay catorce mensajes
comerciales con precio, que la normativa de la marca restringe al canal privado; aparecen
aquí porque son la clase positiva que el Módulo Centinela debe bloquear.

El material gráfico **no lo fotografiaron ellas**. En su mayoría es material oficial de la
marca —arte de catálogo, bodegones de producto y placas de campaña— que la consultora
recibe por el canal interno y reenvía. Se lo describe aquí como lo que es: la base sobre
la que se compusieron los casos, no una muestra de la producción fotográfica propia de una
consultora. Esa distinción importa para leer la Tabla 12: el conjunto mide el detector
sobre arte comercial de marca, que es en efecto lo que más circula por estas cuentas, y no
sobre fotografía casera, que es un régimen visual distinto y queda fuera de la medición.

Las placas y etiquetas de precio de los casos `V01`–`V28` tampoco son de las consultoras:
las compusieron los autores con `armar_casos_imagen.py` y
`armar_casos_imagen_dificiles.py`, porque ninguna de las piezas entregadas en la primera
recolección traía el precio incrustado en los píxeles (Anexo E.6).

La excepción es **`R01`, que no está compuesto**. Es una pieza auténtica —«10% de
descuento» y «PVP OFERTA SUGERIDO $52.470» impresos en los píxeles— de las que circulan
por el canal de la marca hacia las consultoras, incorporada en la segunda recolección. Es
el único caso del conjunto cuya clase positiva no la fabricó el equipo, y por eso se lo
identifica aparte en la planilla y en el Anexo E.6.

Por lo mismo, ni esta carpeta ni las carpetas de origen se publican en el repositorio del
proyecto. Acompañan al documento como material complementario y no se redistribuyen.

## Nota sobre la cuota del modelo
`run_compliance_vision.mjs` consume una petición por caso contra el nivel gratuito de la
API de Gemini. El tope que ata no es el de peticiones por minuto sino el de **20 por
día**, y los reintentos cuentan contra el mismo cupo: insistir ante el tope diario gasta
las peticiones del día siguiente. El script distingue por eso los dos topes —ante el de
minuto espera y reintenta; ante el diario corta en seco— y guarda el resultado caso por
caso, de modo que una corrida interrumpida se reanuda sin repetir las inferencias hechas.
Los 20 casos del conjunto no entran, por lo tanto, en una sola corrida si algo ya consumió
cupo ese día.
