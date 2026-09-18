# Plan de remediación — auditoría total (dictamen 6, 7,6/10)

> **Para retomar en una sesión nueva.** El dictamen completo está en
> `C:\dev\auditoria-postly-6\dictamen-auditoria-6.md` (y en PDF). Este archivo dice qué se
> hizo, qué falta y con qué método, para no releer las 624 líneas del dictamen.

---

## 0. Antes de tocar nada

1. **Refrescar los campos en Word** (Ctrl+E, F9). Las pasadas 23, 24 y 25 agregaron
   párrafos y filas de tabla, de modo que el índice general, el de tablas y el de figuras
   están desactualizados. La Tabla 6 pasó de 7 a 10 filas y la Tabla 13 de 10 a 12.
2. **Commitear.** El árbol tiene sin commitear el `.docx`, `LEEME-evidencia.md`,
   `verificar_patrones_desplegados.mjs` y `Nodos_compliance_desplegados.json`. Hay respaldos
   en `*.bak-pre-pasada23/24/25.docx`.
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

Todos son texto o cálculo sobre datos que ya están. Ordenados por lo que aportan.

| # | Qué | Dónde |
|---|---|---|
| **M-11** | No hay un solo intervalo de confianza ni tamaño del efecto, y el §6.2 recomienda estrecharlos. Los datos están: `Cronometraje_datos.csv` y las matrices. Agregar IC del 95 % a la reducción media y *d* de Cohen. | transversal; §6.2 P942 |
| **M-16** | La «configuración representativa» es la medida principal y su representatividad nunca se contrastó, ni siquiera con los 29 casos reales disponibles. | §5.1 P824 |
| **M-1** | El verificador de correspondencia no cubre el detector que produjo las Tablas 3, 4 y 5 (el conjunto `--v1`, anterior a la corrección). Declararlo o extenderlo. | §5.1 P823; E.4 P1147-1148 |
| **M-5** | El §3.5.5 dice 97 casos controlados etiquetados por los desarrolladores; son **134** (97 de texto + 8 filas de imagen + los 29 de campo se etiquetaron aparte — verificar la cuenta contra los CSV antes de escribir). | §3.5.5 P392 |
| **M-6** | El protocolo de cronometraje omite tres condiciones que gobiernan la validez interna. Y las columnas `Producto` y `Orden` de la planilla están vacías. | Anexo E.2 P1142; §6.1 P927 |
| **M-13** | Cuatro Sprints y un Product Backlog sin ningún artefacto. **Si no se conservaron, declararlo**; no fabricar un backlog retroactivo. | §3.3.1-§3.3.2 P294-319 |
| **M-15** | El evaluador externo es la mitigación declarada del sesgo de confirmación y no está caracterizado (quién es, qué relación tiene con el equipo, qué se le dio). | §3.5.5 P392; §5.1 P864; E.1.2 P1134 |
| **M-3** | El §3.7.1 dice que no se almacena ningún otro dato personal; la Figura 5 muestra `ChatID_Telegram`, `Token_Acceso`, etc. | §3.7.1 P423 |
| **M-14** | La base del canal de imagen en el estudio de campo no cierra contra la planilla. | §5.4 P910 |
| **M-2** | La Figura 3 atribuye el 73,6 % al ahorro entre los dos flujos que dibuja e incluye en el manual una etapa que la medición excluyó por diseño. Requiere editar la imagen o corregir la nota. | Figura 3; §4.2 P588 |
| **M-9** | «Vigencia mayor que 60 días» se infiere de la ausencia de un campo en **una** respuesta. Acotar. | §6.1 OE5 P935; Tablas 11 y 13 |
| **M-10** | La normalización de imágenes se describe y no se documenta ni valida. Declararlo. | §4.7.2 P782, P784 |
| **M-12** | El §2.2 atribuye al sistema una recomendación de «imágenes ganadoras» que no existe. | §2.2.a P192 |
| **M-8** | El riesgo que justifica descartar el scraping se declara Alta/Alto sin evidencia. | §2.4 P253; Tabla 2 fila 1 |
| **M-4** | Aparato editorial — ver bloque 4. | transversal |
| **M-7** | **Ya cerrado** en la pasada 24 (Tabla 1). | — |

---

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
