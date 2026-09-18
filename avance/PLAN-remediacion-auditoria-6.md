# Plan de remediación — auditoría total (dictamen 6, 7,6/10)

> **Para retomar en una sesión nueva.** El dictamen completo está en
> `C:\dev\auditoria-postly-6\dictamen-auditoria-6.md` (y en PDF). Este archivo dice qué se
> hizo, qué falta y con qué método, para no releer las 624 líneas del dictamen.

---

## 0. Antes de tocar nada

1. **Refrescar los campos en Word** (Ctrl+E, F9). Las pasadas 23, 24 y 25 agregaron
   párrafos y filas de tabla, de modo que el índice general, el de tablas y el de figuras
   están desactualizados. La Tabla 6 pasó de 7 a 10 filas y la Tabla 13 de 10 a 12.
2. **Commitear.** Hecho: bloques 0-2 en `6e814f4`, bloque 3 en `7b32fa2`. Hay respaldos
   en `*.bak-pre-pasadaNN.docx`, el último `bak-pre-pasada26`.
3. **No hace falta n8n ni ngrok.** Todo lo que queda es texto y datos locales.

---

## 1. Estado

| | |
|---|---|
| Nota de la auditoría total | **7,61** |
| Bloques 0, 1 y 2 | **aplicados** (pasadas 23, 24, 25) |
| Proyección con todo lo pendiente hecho | **~9,0–9,1** |

La medición nunca estuvo en discusión: el dictamen dice que «todas las cifras computables
del Capítulo 5 coinciden con el dato crudo, hasta el último decimal» y que el tratamiento
estadístico de la hipótesis del 70 % «no tiene nada que corregir». Lo que baja la nota es
la atribución, el inventario y la calibración **alrededor** de la medición.

Notas por capítulo, con sus pesos: Cap. 3 (18 %) 7,4 · Cap. 4 (18 %) 7,8 · §5.1 (16 %) 7,6 ·
Cap. 2 (12 %) 7,2 · Cap. 1 (10 %) 6,9 · §5.4 (8 %) 8,2 · Cap. 6 (8 %) 7,5 · Cap. 7 (6 %) 8,6 ·
Cap. 8 (4 %) 8,3.

**Los capítulos que más pesan son los que más hallazgos tienen abiertos: Cap. 3 y Cap. 4,
18 % cada uno.** Ahí está el grueso de la ganancia.

---

## 2. Lo que ya se hizo

**Bloque 0 · pasada 23 — un error propio, revertido.** La pasada 20 (sesión anterior) había
contado *filas* de imagen en los CSV (8) tomándolas por *casos distintos* (4). `R39`/`N19` y
`R40`/`N20` son cadenas idénticas; `R19`/`P19` y `R20`/`P20`, el mismo escenario redactado
distinto. Son cuatro escenarios reutilizados en las dos configuraciones, y el §5.1 ya lo
decía tres párrafos antes. Revertido en las cinco ubicaciones (hallazgo **A-4**).

**Bloque 1 · pasada 24 — el crítico y los altos declarativos.**

- **C-1** · La fuente nombra **dos veces** la página de negocios de Facebook entre los
  mecanismos autorizados para el mensaje comercial, y Postly publica ahí. Dos párrafos
  nuevos en el Anexo D: las dos citas, por qué el equipo audita igual (la fanpage es de
  visibilidad pública y no cumple la condición que la fuente impone) y el costo declarado.
- **A-1** el bucle de retroalimentación pasa a futuro · **A-3** soberanía acotada al motor y
  la lógica de negocio · **A-5** V10 reclasificado y V20 deja de ser «cifra romana» ·
  **A-6** el κ mide acuerdo, no fidelidad a la regla (27 casos, no 29) · **A-8** retirada la
  saturación teórica · **A-9** tres filas nuevas en la Tabla 6 como deuda pendiente.
- **Tabla 1** · Postly baja a «Parcial» en *compliance de marca* y en *auto-hospedaje*, con
  las dos salvedades en la nota (cierra también **M-7**).

**Bloque 2 · pasada 25 — A-2 y A-7, con lo que el historial permitía.**

El historial del n8n local tiene 56 ejecuciones (13→17-09) y **ninguna tocó un nodo de
publicación**: las mediciones paran antes de publicar. Las validaciones e2e de agosto se
fueron con el VPS.

- **A-2 resuelto por otra vía.** La concatenación de la firma es **incondicional en los
  cuatro nodos que publican**, verificable por lectura del código: es la categoría
  «Configuración» que la Tabla 13 ya usaba para el tope de 10 imágenes de HU5, y es más
  fuerte que contar N ejecuciones porque una rama única cubre *todas*. Ídem el corte de 60 s
  de HU13. Dos filas nuevas en la Tabla 13; el inventario pasa de **nueve a once** umbrales,
  8 verificados. `verificar_patrones_desplegados.mjs` extendido para comprobarlo desde el
  extracto redactado.
- **A-7 no es recuperable y se declara.** La nota de la Tabla 9 dice ahora que la validación
  se documentó por observación y captura, no por identificador de ejecución, y que las
  trazas no se preservaron porque la instancia fue dada de baja. **No se fabricó nada.**

---

## 3. Bloque 3 — los dieciséis medios

**Once aplicados en la pasada 26** (commit `bloque 3 de la auditoria 6`). Quedan tres, y los
tres esperan información que sólo tiene el equipo — ver §3.1.

| # | Estado | Qué se hizo |
|---|---|---|
| **M-1** | ✅ | No se declaró: se **cerró**. El workflow anterior a la corrección está versionado, así que `--extraer-v1` produce `Nodos_compliance_desplegados_v1.json` y el verificador comprueba `PATRONES_V1` y `PATRONES_HU10` carácter por carácter. Encontró de paso una diferencia literal (`[.,]` contra `[\.,]`), inerte pero real, y se corrigió. |
| **M-2** | ✅ | Nota de la Figura 3 reescrita sobre el bitmap (`_pasada26_figura3.py`): el 73,6 % queda acotado al tramo medido, que excluye la primera etapa del As-Is. El §4.2 describe las tres acciones reales de la usuaria. |
| **M-3** | ✅ | §3.7.1 enumera contra la Figura 5 y declara el ChatID como dato personal. El principio pasa a ser «ningún dato ajeno a la ejecución del flujo». |
| **M-5** | ✅ | **130**, no 134 ni 97: 97 de texto + 4 escenarios de imagen + 29 del canal visual. El 134 del dictamen contaba dos veces los cuatro escenarios de imagen (es el mismo error que A-4). |
| **M-8** | ✅ | El bloqueo de cuenta pasa a riesgo conjeturado y no evaluado, y la decisión se apoya en las tres razones que sí se sostienen. |
| **M-9** | ✅ | §6.1 OE5: lo medido es la ausencia de `expires_in`, no la longevidad. Las Tablas 11 y 13 ya lo decían bien. |
| **M-10** | ✅ | **Era más grave de lo que el dictamen suponía.** El workflow no tiene ningún nodo de redimensionado ni conversión: la estandarización de formato la hace el canal de ingesta de Telegram (sólo acepta `message.photo`, ya JPEG) y la relación de aspecto **no está implementada**. El §4.7.2 lo declara y el §6.2 lo recoge como pendiente. |
| **M-11** | ✅ | `run_cronometraje.mjs` calcula IC del 95 % y *d* de Cohen (d_z); los dos de compliance, IC de Wilson. IC de la reducción: [56,6; 90,6] sobre tres consultoras y [68,4; 78,8] sobre doce pares — **los dos contienen el 70 %**, que refuerza lo que el §5.1 ya decía del contraste unilateral. d_z = 5,28 y 4,10. Recall de campo 12/14: [0,601; 0,960]. |
| **M-12** | ✅ | §2.2.a: el sistema propone un orden de carrusel (HU5); elegir «imágenes ganadoras» es la capa predictiva no implementada. |
| **M-14** | ✅ | El canal visual de campo son **17** casos, no 2: los 15 mixtos también lo atravesaron y son verdaderos negativos. Y «fotografía propia» se retira: E.6 dice que en su mayoría es arte de marca. |
| **M-16** | ✅ | Nuevo `run_representatividad.mjs`. Clasifica los infractores de texto por forma de expresión del precio, con taxonomía ajena al detector. Los 12 reales: 5 símbolo, 4 % de descuento, 3 vocabulario, **0 indirectas**; el representativo lleva 1 de 18. El conjunto diseñado es más adverso que la realidad: sus métricas son cota inferior. |
| **M-7** | ✅ | Cerrado en la pasada 24. |
| **M-6** | ⏳ | Falta el dato del equipo. |
| **M-13** | ⏳ | Falta decidir. |
| **M-15** | ⏳ | Falta el dato del equipo. |
| **M-4** | → | Aparato editorial, bloque 4. |

### 3.1 Lo que queda del bloque 3 y qué necesita

- **M-6 · protocolo de cronometraje.** El Anexo E.2 no dice (a) si hubo instrucción o
  demostración previa del bot —el §6.1 afirma «sin entrenamiento previo» y el ítem PEOU1
  presupone un momento de aprendizaje—, (b) quién cronometró y dónde, ni (c) el orden de
  condiciones y el tipo de publicación de cada par. Las columnas `Producto` y `Orden` de
  `Cronometraje_datos.csv` están **vacías en las doce filas**. No exige volver a medir, pero
  sí que el equipo recuerde los tres datos. Ojo: `Cronometraje_70pct.csv` es una **planilla
  de diseño vacía** con el orden contrabalanceado que se planificó y no se ejecutó; no
  confundirla con el dato.
- **M-13 · Sprints y Product Backlog.** No hay artefactos. Dos caminos, y es decisión del
  autor: declarar la ausencia, o declararla **y** agregar un anexo con la cronología real
  reconstruida del repositorio versionado, que existe y es verificable. El costo del segundo
  es que expone que el desarrollo corrió del 25/06 al 02/07/2026 y que los cuatro sprints
  narrados no mapean uno a uno sobre los commits: HU11/HU12, atribuidas al último sprint,
  se entregaron el primer día.
- **M-15 · el evaluador externo.** Falta quién es: relación con los autores (no sólo con el
  equipo de desarrollo), formación y cómo se lo reclutó. Sobre su externalidad descansa la
  mitigación del sesgo de confirmación del §3.5.5 y el respaldo indirecto del Anexo D.

## 4. Bloque 4 — aparato editorial y registro

| # | Qué |
|---|---|
| **M-4** | No hay **índice general**; hay **ocho encabezados vacíos** con estilo de título; **cuatro tablas** llevan la nota encima del cuadro en vez de debajo. |
| **B-1** | Seis entradas usan la elipsis de APA 6 y el §7 declara APA 7: Beck (2001), Brown (2020), Floridi (2018), Ji (2023), Vaswani (2017), Zhao (2023). APA 7 exige listar hasta 20 autores. |
| **B-2** | «&» en citas parentéticas de un texto en español; la adaptación de APA 7 prescribe «y». Es uniforme, así que es opcional. |
| **B-3** | Figura 4: el bot de Telegram y Google Sheets están dibujados **dentro** del recuadro del VPS, y ninguno corre ahí. La flecha «publica» sale del módulo equivocado. |
| **B-4** | El §5.2 no remite al Anexo C, que declara ampliarlo. Enlace unidireccional. |
| **B-5** | §6.2, TikTok: «únicamente la adición de nuevos nodos sin refactorizar», invocando un diseño orientado a servicios que el §4.3 dice expresamente que **no** es de microservicios. |
| **B-6** | **Registro desparejo**: intensificadores por mil palabras — Cap. 1 **7,03**, Cap. 2 3,74, Cap. 3 3,09, Cap. 4 2,66, Cap. 5 **0,71**, Anexos **0,22**. El Cap. 1 está diez veces más promocional que los anexos. |
| **B-7** | §3.2: la fase de Evaluación del DSRM sólo menciona pruebas funcionales; la evaluación de campo con usuarias se incorporó después y la fase quedó sin actualizar. |
| **B-8** | §4.4.2: el borrado del post antiguo no está en ningún criterio de HU12 ni en el alcance, y tensiona con la integridad referencial que HU12 exige. |
| **B-9** | §1.2.c y §1.4.2 atribuyen a la norma una «obligatoriedad» de la firma que el Anexo D niega. **El Cap. 1 quedó sin alinear** tras la corrección de N-01 de la ronda anterior. |
| **B-10** | §3.7.4: «previene la competencia desleal, la publicidad engañosa y el fraude marcario» — tres efectos sociales atribuidos a un detector de precios, sin medición. |

---

## 5. Método

Lo que viene funcionando, y conviene no cambiar:

- **Una pasada por bloque**, en `_pasadaNN.py`, sobre `_util_docx.py`. Respaldo
  `cp "…docx" "…bak-pre-pasadaNN.docx"` antes de correr.
- **Las cifras se leen del dato, nunca se escriben a mano**, y la pasada **aborta** si no
  coinciden con lo que el texto va a afirmar.
- **Verificar después de cada pasada**: `python verificar_documento.py "…docx"` (referencias
  cruzadas, tablas, figuras, bibliografía, 29 frases prohibidas, métricas de escritura) y
  `python verificar_remisiones.py "…docx"` (las remisiones atributivas, que ningún barrido
  de referencias detecta).
- **Agregar a `verificar_documento.py`** una frase prohibida por cada hallazgo cerrado, y
  comprobar que dispare sobre el documento previo y no sobre el nuevo.
- **Sincronizar la entrega**: `cp LEEME-evidencia.md evidencia/LEEME.md` y, si cambian los
  scripts, copiarlos a `evidencia/`.

### Trampas conocidas

- **Medir la longitud al escribir, no después.** En las tres últimas pasadas introduje
  oraciones de más de 50 palabras y párrafos de más de 250, y hubo que volver atrás. La
  línea base es: cuerpo 5 oraciones >50 (máx. 62), anexos 0, párrafos >250: 6 (máx. 277).
- **Una guarda que cuenta lo mismo que la hipótesis no valida nada.** Fue exactamente lo que
  produjo el error A-4: `len(img)==8` contaba filas, que era justo lo que estaba mal.
- **Leer el contexto antes de sustituir.** El §5.1 ya afirmaba lo correcto tres párrafos
  antes de donde edité.
- **En heredocs de bash, `\n` dentro de un string de Python se colapsa** y rompe el JS
  generado. Usar `String.fromCharCode(10)` o un `console.log("")` aparte.
- **Los anclas de `sustituir` cambian si una sustitución anterior los toca.** Ordenar de
  la más específica a la más general, o reordenar.

---

## 6. Al terminar

1. Refrescar campos en Word.
2. `python verificar_documento.py` y `python verificar_remisiones.py`, ambos limpios.
3. Commitear.
4. **Decidir si va una séptima auditoría.** El gate del profesor es demostrar >9. Con todo
   lo pendiente hecho la proyección es ~9,0–9,1, que es un margen fino: conviene una pasada
   propia por clases de defecto (sobreafirmación, remisiones atributivas, inventarios,
   estadística) **antes** de volver a auditar, que es lo que en la ronda anterior encontró
   tres hallazgos que las auditorías no habían visto.
