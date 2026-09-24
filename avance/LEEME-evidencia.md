# evidencia/ — datos crudos y scripts de los análisis del Capítulo 6

Esta carpeta es el material complementario que el Anexo E del documento nombra. Está
para que las cifras del Capítulo 6 puedan verificarse contra el dato crudo, no para que
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
| §6.1 y E.1.4 — divergencia del flujo programado | `node run_compliance_hu10.mjs` |
| Tabla 7 — cronometraje, prueba t y contraste del umbral del 70 % | `node run_cronometraje.mjs` |
| Tabla 8 — TAM y α de Cronbach | `node run_tam.mjs` |
| §6.1 — representatividad del conjunto principal contra el corpus real | `node run_representatividad.mjs` |
| E.12 — el llamado a la acción antes y después de la corrección | `node run_cta_generacion.mjs --rescorar` (re-puntúa los textos guardados; no consume cuota) |
| E.2 — sensibilidad del cronometraje a la asimetría de la tarea | `node run_sensibilidad_cronometraje.mjs` |
| Tabla 11 — baterías de validación técnica | `node run_baterias.mjs` (requiere n8n en marcha; la fila `B1b` consume cuota del modelo) |
| Tabla 11, fila `B1b` — desglose por nodo | `node _desglose_b1b.mjs` (lee el historial; no consume cuota) |
| Tablas 12 y 14 — canal de imagen (HU8) | `GEMINI_API_KEY=… node run_compliance_vision.mjs` |
| Tabla 13 — umbrales de las Historias de Usuario | `node run_umbrales.mjs` (requiere n8n en marcha) |
| E.8 — variabilidad entre corridas | `GEMINI_API_KEY=… node run_compliance_vision.mjs casos_imagen_corrida2` |
| **todas las tablas — recomputo desde el dato crudo** | `python verificar_csv.py` (no consume cuota ni necesita n8n; exige además que cada CSV se pueda leer con un parser estándar) |

`run_compliance_vision.mjs` escribe un resultado por caso y, al terminar, imprime la
matriz de los 29. Las dos tablas del documento son dos cortes de ese mismo archivo, y
no se promedian: la **Tabla 12** son las filas `V01`–`V20`, las formas de incrustación
habituales; la **Tabla 14** son `V21`–`V28` más `R01`, los casos de legibilidad extrema.
Sobre un conjunto ya puntuado el script no gasta cuota: saltea los casos con veredicto.

El conmutador `--v1` corre el conjunto de expresiones regulares anterior a la corrección
descrita en el §6.1 —el que produjo las Tablas 3, 4 y 5—; sin el conmutador corre el
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
- `run_cronometraje.mjs` reporta **cuatro** estadísticos y conviene no confundirlos. Los
  dos primeros contrastan H₀ «reducción = 0», es decir que Postly no reduce el tiempo: son
  los que el §6.1 reporta como `t(11) = 14,21` y `t(2) = 9,15`. Los dos últimos contrastan
  H₀ «reducción = 70 %», que es lo que la hipótesis del §4.2 afirma, y dan `t(2) = 0,91`
  (p unilateral 0,230) y `t(11) = 1,52` (p 0,078): **el margen por encima del umbral no es
  estadísticamente distinguible** con tres unidades independientes. El §6.1 reporta las dos
  cosas por separado. La p de la t se calcula con la beta incompleta regularizada, y el
  script se autocomprueba contra la forma cerrada disponible para df = 2. Desde la sexta
  auditoría reporta además el **intervalo de confianza del 95 %** de la reducción media y el
  **d de Cohen** para muestras pareadas (d_z), en las dos agregaciones. Los dos intervalos
  contienen el umbral del 70 %, que es la misma conclusión que el contraste unilateral.
  `run_compliance_text.mjs` y `run_compliance_field.mjs` acompañan cada proporción con su
  intervalo de Wilson, que no colapsa cuando la proporción vale 1 (la Precisión de campo).

- `run_cta_generacion.mjs` + `CTA_generacion_resultados.csv` + `Prompts_generacion.json` —
  la medición del Anexo E.12. Hasta el 19 de septiembre de 2026 los cuatro prompts de
  generación exigían que las tres opciones de copy terminaran en una invitación a contactar a
  la consultora, que es lo que la fuente normativa define como mensaje comercial. El script
  llama al modelo dos veces por imagen —con el prompt anterior y con el vigente, en la misma
  corrida— y aplica sobre cada opción un detector léxico declarado en su propio código.
  Resultado: **15 de 15 opciones antes, 0 de 15 después**. `Prompts_generacion.json` trae los
  cuatro prompts en sus dos estados con el SHA-256 de cada uno, de modo que se comprueba que
  lo ejecutado es lo desplegado sin acceso a la instancia, igual que hace
  `verificar_patrones_desplegados.mjs` con los detectores. Ojo con el conmutador: sin
  argumentos vuelve a llamar al modelo y consume cuota; con `--rescorar` sólo vuelve a puntuar
  los textos ya guardados, que es lo que la entrega necesita.

- `run_sensibilidad_cronometraje.mjs` + `Sensibilidad_cronometraje_resultados.csv` — la cota
  del Anexo E.2. La condición manual del cronometraje incluye adaptar la imagen al formato de
  feed y Postly no hace esa tarea, de modo que las dos condiciones no cubren exactamente el
  mismo trabajo. Esa subtarea no se cronometró por separado y el script no la inventa:
  descuenta del tiempo manual cada duración hipotética y recalcula la reducción media por
  consultora. La reducción cruza el umbral del 70 % en los **65 segundos por publicación**, y
  la t pareada contra la hipótesis de reducción nula se mantiene por encima del valor crítico
  en todo el rango explorado. Lo que el resultado establece no es cuánto duró la adaptación,
  sino cuánto tendría que haber durado para invertir la conclusión sobre el umbral.

- `run_representatividad.mjs` + `Representatividad_resultados.csv` — el contraste de la
  afirmación de representatividad del §6.1. Clasifica cada caso infractor **de texto** por la
  forma en que expresa el precio o la promoción, con una taxonomía léxica de seis categorías
  ajena al detector: describe cómo está escrito el caso, no si el sistema lo bloquea. A cada
  caso se le asigna la primera categoría que coincide, ordenadas de la más explícita a la
  menos, de modo que «vale $2900» cuenta como símbolo y no como palabra de precio. El
  resultado: los doce infractores del corpus real se reparten en tres formas —cinco con
  símbolo de moneda, cuatro con descuento porcentual, tres con vocabulario comercial sin
  cifra— y **ninguno** adopta una forma indirecta, mientras que el conjunto representativo
  lleva uno de dieciocho. El conjunto diseñado es algo más adverso que la redacción
  observada en esa forma, no equivalente a ella. Eso indica la dirección de la diferencia y
  no convierte sus métricas en una cota inferior de las reales: la brecha de F1 contra el
  campo sale sobre todo de los falsos positivos —tres contra cero—, que esta taxonomía no
  clasifica porque sólo ordena los positivos. El contraste es además acotado: doce textos de
  tres consultoras, y de canal privado, donde el precio se enuncia con menos rodeos que en
  una publicación de feed.

  La quinta forma se llamaba «vocabulario comercial sin cifra» y el nombre no describía su
  contenido: dos de los tres casos de campo que caen en ella son un «2x1» y un «3x2», que sí
  llevan cifra. Lo que la define es que el vocabulario, y no la cifra, dispara la regla.

- `casos_video/` — los dos casos que ejercitan el canal visual sobre **video** (HU13),
  ejecutados de extremo a extremo contra el bot en producción. Hacen falta dos y no uno
  porque la normalización a 9:16 recorta el video al centro, de modo que una placa de precio
  pegada a un borde desaparece **antes** de que el detector la vea y antes de que el Reel se
  publique. `V-BLOQ` tiene el precio dentro del encuadre publicable y el módulo **bloquea**;
  `V-RECORTE` lo tiene en el borde que el recorte elimina y el módulo **avisa sin bloquear**,
  porque lo que sale al aire no lleva el precio pero la usuaria tiene que saber que su placa
  no va a verse. El detector recibe cuatro imágenes en una sola petición —tres instantes del
  video normalizado y el encuadre original— y la cuota cuesta lo mismo que con una. Su
  `LEEME.md` tiene el detalle y declara el único fotograma que se omitió, por privacidad.

- `casos_carrusel/` — el caso que ejercita el canal visual sobre **carrusel** (HU5), también
  de extremo a extremo contra el bot. La imagen con precio es la misma pieza auténtica que
  el caso `R01` del Anexo E.8, que el flujo de imagen única bloquea: el mismo material, por
  otro flujo, con el mismo veredicto. Va acompañada de una foto limpia del mismo producto,
  porque el bloqueo tiene que alcanzar a la publicación entera y no sólo a la imagen que
  lleva la cifra.

- `casos_repost/` — el caso que ejercita el canal visual sobre la **re-publicación** (HU12),
  el cuarto y último flujo. Es el que más cuesta armar, porque la re-publicación no recibe
  una imagen: toma la que ya está guardada en la agenda, y por Postly nunca puede entrar una
  con precio. La vía es la real: la pieza se publica a mano en Instagram, la sincronización
  la trae a la hoja al abrir Mi Agenda y desde ahí se la recicla. Antes de la corrección que
  el §6.1 documenta, ese camino no ejecutaba ninguna detección.

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
- `Baterias_resultados.csv` — las baterías de validación técnica. Las tres que el §3.4.2
  declara son las de integración multimodal, procesamiento multimedia y transacciones
  OAuth 2.0; la de interfaz conversacional se agrega porque mide el umbral de respuesta
  de HU1. La columna `Umbral_declarado` nombra la Historia de Usuario que fija cada
  umbral; donde la HU no fija ninguno, la columna lo dice y `Cumple` queda en `—`. La
  fila `B1b` es la batería de integración multimodal: se corre con
  `node run_baterias.mjs --solo-b1b --repeticiones 10` y consume dos peticiones del
  modelo por repetición, de modo que diez repeticiones son el cupo diario entero.

  Dos celdas de `Umbral_declarado` de este archivo quedaron con una atribución que el
  documento descartó después, y conviene leerlas con esa advertencia. La fila del acuse de
  recepción del webhook lo contrasta contra «< 3 s (HU1)» y la del refresco del token
  contra «< 5 s (HU2)»; la **Tabla 11 es deliberadamente más conservadora** y retira ambos,
  porque el criterio de HU1 es el tiempo hasta la respuesta del bot y no el acuse, y el de
  los 5 s de HU2 corresponde a la notificación de enlace y no al refresco. Los valores
  medidos no cambian: lo que se corrigió es a qué umbral se los contrasta. El archivo se
  deja tal como lo emitió la corrida, sin editarlo a mano, para que el dato crudo siga
  siendo el que produjo el script; la discrepancia es de rótulo y va en la dirección
  conservadora.

- `B1b_desglose.csv` — una fila por repetición de la batería de integración multimodal,
  con el total, lo que tardó cada una de las dos llamadas al modelo y lo que tardó el
  resto de la cadena. Es lo que sostiene la afirmación del §6.1 sobre dónde está la
  dispersión. Lo produce `_desglose_b1b.mjs`.

- `Umbrales_HU_resultados.csv` — una advertencia primero, del mismo tipo que la de
  `Baterias_resultados.csv`: la fila de **HU6** trae `Cumple = Sí` y la **Tabla 13 del
  documento dice «Parcial»**. La tabla es la correcta y es deliberadamente más
  conservadora: el límite de 2200 caracteres se cumple en los copys enviados pero no está
  impuesto por un truncado en el flujo, de modo que depende de que el modelo respete la
  extensión que el prompt le pide. El archivo se deja tal como lo emitió la corrida, sin
  editarlo a mano; la divergencia es de veredicto cualitativo y va en la dirección
  conservadora. El valor observado —media 552, máx. 580 caracteres— es el mismo en los dos.

  Hay una segunda divergencia del mismo tipo, y en la misma dirección. La fila **HU2**
  «Intercambio por un token de larga duración» trae `medición … Sí`, y la **Tabla 13 dice
  «No verificado»** sobre el umbral «vigencia de hasta 60 días». La tabla es la correcta.
  El criterio de aceptación de HU2 fija esa vigencia y se conserva tal como se redactó
  antes de medir; lo que la corrida observó es que la Graph API devuelve el token de página
  sin campo de expiración, que es una propiedad de la respuesta y no la longevidad que el
  criterio pide. El rótulo de la fila, además, enuncia el umbral en los términos de lo
  observado y no en los del criterio. Igual que con HU6, el archivo se deja como lo emitió
  la corrida y la divergencia se declara acá: son 7 de 11 umbrales verificados y 4 sin
  verificar, como dicen el §6.1, la Tabla 13, el Anexo A y el Resumen.

- `Umbrales_HU_resultados.csv` — los nueve umbrales numéricos que fijan las Historias
  de Usuario, con el grado de verificación de cada uno (`medición`, `configuración` o
  `no verificado`), la n cuando hay una serie de tiempos, el valor observado y la
  fuente. Lo produce `run_umbrales.mjs`, que no dispara ejecuciones nuevas: lee la
  configuración del workflow desplegado y el historial de ejecuciones del propio motor,
  de modo que no consume cuota de ningún modelo y puede reejecutarse sin costo.

### Scripts auxiliares (no producen ninguna tabla)

- `verificar_csv.py` — el contrachequeo del lector. Carga cada archivo de resultados con
  `csv.DictReader`, exige que toda fila tenga los campos de su cabecera y recomputa contra su
  valor publicado cada cifra del Capítulo 6: las cuatro matrices del canal textual, los dos
  paneles de la Tabla 5, las Tablas 12 y 14, el cronometraje con sus tres estadísticos, el TAM
  y el desglose de HU12. Sale con código 1 ante cualquier divergencia. Existe porque dos
  archivos habían quedado mal formados —la fila `V20` del conjunto de imagen y los decimales
  de la tabla de sensibilidad, los dos por una coma sin comillar— y la matriz que un tercero
  obtenía de ellos no era la publicada. **Los decimales van con coma: todo campo que la
  contenga tiene que ir entrecomillado.**

- `_extraer_foto.mjs` — toma de una ejecución real el arreglo `photo` que Telegram
  entregó al disparador y lo guarda en `_foto_patron.json`. Un `file_id` de Telegram es
  estable para el mismo bot, de modo que ese patrón permite reproducir el envío de una
  imagen —y con él la batería de integración multimodal de `run_baterias.mjs`— sin un
  cliente humano. Ejecutar primero: `node _extraer_foto.mjs <id de ejecución>`.
  **El remitente va anonimizado a propósito.** El update real trae el nombre, el apellido
  y el identificador de Telegram de una persona, y nada de eso hace falta para reproducir
  el envío: los dos identificadores los sobrescribe `run_baterias.mjs` con el chat de
  prueba que lee del `.env`, y el camino de la foto no usa los nombres. El script los
  reemplaza al extraer, de modo que el patrón pueda acompañar al trabajo sin llevar datos
  personales. Si en `_foto_patron.json` se lee «Usuaria de prueba» y `id` en cero, es eso
  y no un error de extracción.

- `_desglose_b1b.mjs` — separa, para cada repetición de la batería de integración
  multimodal, el tiempo de las dos llamadas al modelo del tiempo del resto de la cadena,
  y lo escribe en `B1b_desglose.csv`. Como `run_umbrales.mjs`, no dispara ejecuciones ni
  consume cuota: lee el historial que el propio motor conserva. Por eso sólo puede
  reejecutarse mientras esas ejecuciones sigan en el historial; el CSV queda como
  evidencia cuando ya no estén. Ejecutar después de la batería: `node _desglose_b1b.mjs`.

- `fix-compliance-patterns.mjs` — aplica el conjunto corregido y unificado de expresiones
  regulares a los cuatro nodos que ejecutan el filtro en el workflow (HU7/HU9, el carrusel
  de HU5, el programador de HU10 y el video de HU13). Es idempotente y, sin `--deploy`,
  sólo reescribe el JSON versionado del workflow sin tocar la instancia. Es el script que
  cierra la divergencia entre flujos descrita en el §6.1 y el Anexo E.1.4.
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

- `verificar_patrones_desplegados.mjs` + `Nodos_compliance_desplegados.json` — la prueba
  de que los dos scripts de compliance de esta carpeta corren los detectores del sistema y
  no una copia divergente. El JSON es un extracto **redactado** del workflow: sólo el
  código de los cuatro nodos que ejecutan compliance de precios, el prompt del nodo de
  detección visual y el SHA-256 de cada uno; ningún webhookId, credencial ni URL de la
  instancia. `node verificar_patrones_desplegados.mjs` compara ese extracto contra
  `run_compliance_text.mjs` y `run_compliance_vision.mjs` carácter por carácter y sale con
  código 1 si algo difiere; no necesita la instancia ni consume cuota. Para regenerar el
  extracto desde el workflow: `node verificar_patrones_desplegados.mjs --extraer
  "<workflow.json>"`. Se documenta en el Anexo E.4. Desde la auditoría total cubre además dos umbrales
  que no se miden con una serie de tiempos sino leyendo el código desplegado: que la
  concatenación de la **firma de HU9** sea incondicional en los cuatro nodos que publican
  —ninguna rama publica sin ella, y cada una elimina antes el duplicado— y que el **corte de
  60 s de HU13** esté impuesto por una guarda. Son las dos filas de «Configuración» que la
  Tabla 13 agrega, y la razón de verificarlas así y no por muestreo es que una concatenación
  sin rama alternativa cubre **todas** las ejecuciones y no una muestra.

- `Nodos_compliance_desplegados_v1.json` — el mismo extracto, pero del workflow **anterior a
  la corrección**. Hacía falta porque el extracto vigente respalda el detector actual y las
  Tablas 3, 4 y 5 las produjo el anterior, de modo que las matrices principales quedaban sin
  cadena de verificación. El estado previo está versionado —es el del commit inmediatamente
  anterior a `fix-compliance-patterns.mjs`—, así que se extrae igual:

  ```
  git show "<commit>^:workflows/Postly - Entrega Final Sprint 1 v2.json" > wf_v1.json
  node verificar_patrones_desplegados.mjs --extraer-v1 wf_v1.json
  ```

  Con ese archivo presente, `verificar_patrones_desplegados.mjs` comprueba además
  `PATRONES_V1` y `PATRONES_HU10` carácter por carácter. La primera corrida encontró una
  diferencia literal en el conjunto de HU10 —`[.,]` donde el nodo escribía `[\.,]`—, inerte en
  su comportamiento y real en la transcripción, y se corrigió.

Ninguno de los scripts lleva identificadores de la instancia desplegada: la URL base,
la clave de la API de n8n, el `webhookId` del Telegram Trigger y el chat de prueba se leen de un
`.env` que no acompaña a esta carpeta. `run_baterias.mjs` aborta indicando qué falta si no
los encuentra. Es comprobable con un barrido sobre la carpeta: no hay ningún UUID de
webhook ni ningún identificador de chat escrito en el código, de modo que la ruta de
webhook de producción no viaja en la entrega.

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
sobre arte comercial de marca, que es lo que, según las tres consultoras, más circula por estas cuentas, y no
sobre fotografía casera, que es un régimen visual distinto y queda fuera de la medición.

Las placas y etiquetas de precio de los casos `V01`–`V28` tampoco son de las consultoras:
las compusieron los autores con `armar_casos_imagen.py` y
`armar_casos_imagen_dificiles.py`, porque ninguna de las piezas entregadas en la primera
recolección traía el precio incrustado en los píxeles (Anexo E.6).

La excepción es **`R01`, que no está compuesto**. Es una pieza auténtica —«10% de
descuento» y «PVP OFERTA SUGERIDO $52.470» impresos en los píxeles— de las que circulan
por el canal de la marca hacia las consultoras. Es el único caso del conjunto cuya clase
positiva no la fabricó el equipo, y por eso se lo identifica aparte en la planilla y en el
Anexo E.6. Que no la compuso el equipo es comprobable —llegó así—; **quién imprimió el
precio no lo es**, y el documento ya no se lo atribuye a la marca.

La **segunda recolección** —los nueve casos difíciles— la aportó una cuarta Consultora de
Belleza Independiente, ajena al estudio de campo y madre de uno de los dos autores. Se
recurrió a ella para no depender de los plazos de respuesta de las tres participantes. Esa
misma informante describió de dónde sale el material: parte son originales de la marca que
las propias consultoras editan —texto, color, descripciones— para volverlos publicitarios,
y parte son fotografías que ellas mismas toman de los productos en físico. La primera
práctica es la que el conjunto reproduce; la segunda queda fuera de la medición, porque
ninguna de las 29 piezas tiene por base una fotografía casera. Es el relato de una sola
informante y se declara como testimonio (Anexo E.6).

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

La batería de integración multimodal de `run_baterias.mjs` compite por ese mismo
cupo: cada repetición gasta dos peticiones —la detección visual de HU8 y la generación
de copys—, de modo que diez repeticiones son el día entero y no conviene planificar
ninguna otra corrida contra el modelo para esa jornada. El cupo se renueva a medianoche
del Pacífico, no a medianoche local.
