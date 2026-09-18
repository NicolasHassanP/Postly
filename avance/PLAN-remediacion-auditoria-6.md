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

**Bloque 3 cerrado.** Once hallazgos en la pasada 26 y los tres restantes en la pasada 27,
con los datos que aportó el autor. Queda sólo M-4, que es aparato editorial y va en el
bloque 4.

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
| **M-6** | ✅ | Anexo E.2, pasada 27: **no hubo instrucción ni demostración previa** —lo que respalda la afirmación del §6.1 y sitúa el aprendizaje del ítem PEOU1 en la sesión misma—, el cronómetro lo llevaron los autores y no las participantes, y el tipo de publicación y el orden **no se registraron y no son reconstruibles**: la asimetría del carrusel queda declarada y no ponderada. |
| **M-13** | ✅ | §3.3.2 declara que **no se conserva ningún artefacto** de Scrum, y el nuevo **Anexo A.2** reconstruye la cronología desde el repositorio (25/06→02/07/2026, 37 commits en 8 días; 11 de 14 HU rastreables a un commit; HU4, HU6 y HU7 llegaron con la integración inicial). Declara además que la partición en cuatro Sprints es una ordenación por objetivo y no un calendario. No se fabricó backlog. |
| **M-15** | ✅ | Anexo E.1.2: estudiante de la misma universidad, programador, con su propio trabajo final; ajeno a este trabajo y a la vez conocido de los autores, la misma proximidad que el §3.5.2 declara para las consultoras. §3.5.5 y §5.1 remiten ahí. |
| **M-4** | → | Aparato editorial, bloque 4. |

### 3.1 Lo que el cierre dejó anotado

- El **Anexo A.2** expone que el desarrollo registrado ocupa ocho días. Está declarado en el
  mismo apartado que el trabajo anterior a la integración no quedó versionado, que es la
  explicación real y verificable. Si un tribunal pregunta, la respuesta está escrita.
- `Cronometraje_70pct.csv` es una **planilla de diseño vacía** —el contrabalanceo que se
  planificó y no se ejecutó—, no un archivo de datos. Ya figura como frase prohibida en
  `verificar_documento.py` desde N3-14; conviene no confundirla nunca con el dato.
- `verificar_documento.py` tiene desde la pasada 27 una lista **EXIGIDAS**, además de las
  prohibidas: un hallazgo se cierra tanto por lo que se saca como por lo que se pone, y las
  cuatro frases que sostienen M-6, M-13 y M-15 no pueden desaparecer sin que el verificador
  lo note.

## 4. Bloque 4 — aparato editorial y registro · **CERRADO**

Aplicado en las pasadas 28 a 34. No hizo falta n8n ni ngrok.

| # | Estado | Qué se hizo |
|---|---|---|
| **M-4a** | ✅ | Campo TOC de niveles 1 a 3 antes del índice de tablas, del mismo tipo que los dos que ya existían. Generará 113 entradas (9 capítulos, 35 secciones, 69 subsecciones) al actualizar los campos en Word. |
| **M-4b** | ✅ | Los ocho párrafos vacíos con estilo de encabezado pasan a Normal. No se borran, por si alguno llevaba un salto de página; lo que se les quita es lo que los metía en el panel de navegación y los habría metido en el índice. |
| **M-4c** | ✅ | Las notas de las Tablas 3, 4, 5 y 8 se mueven debajo del cuadro. Las 14 quedan uniformes. |
| **M-4d** | ✅ | Las Figuras 7 a 10 llevaban el rótulo pintado dentro del bitmap, sin acentos, duplicando el del campo SEQ. Se recorta la franja y se ajusta la altura declarada del dibujo en la misma proporción: relación de aspecto verificada. |
| **B-1** | ✅ | Las seis entradas con elipsis de APA 6. **La nómina de cada obra se verificó contra su fuente antes de escribirla**, y de ahí salen dos tratamientos distintos: Beck (17), Floridi (13), Ji (10) y Vaswani (8) se listan completas; Brown (31) y Zhao (22) van con 19 + elipsis + último **sin** ampersand, que es lo que APA 7 pide arriba de 20. |
| **B-2** | ✅ | Las 46 citas parentéticas pasan de «&» a «y». La lista de referencias conserva «&», que es lo correcto, y la sustitución se limitó a los paréntesis que terminan en año para no tocar títulos como «International Law & Business». |
| **B-3** | ✅ | Figura 4 redibujada entera (`redibujar_figura4.py`). El recuadro del VPS contiene ahora sólo lo que corre en el VPS; el bot queda afuera, rotulado como infraestructura de Telegram, y la persistencia pasa a servicios externos. La flecha «publica» sale del orquestador. |
| **B-4** | ✅ | El §5.2 remite al Anexo C. |
| **B-5** | ✅ | TikTok deja de ser «únicamente agregar nodos» y se deja de invocar un diseño orientado a servicios que el §4.3 niega. |
| **B-6** | ✅ | **El hallazgo más laborioso.** Se agrega `medir_registro.py` y se nivela todo el documento en dos pasadas (141 sustituciones): Cap. 1 de 8,52 a 0,67 por mil, Cap. 2 de 5,17 a 1,19, Cap. 3 de 5,28 a 0,97, Cap. 4 de 4,79 a 0,32, Resumen de 6,40 a 0,00. Sale el adjetivo que sube el tono; se queda el que nombra algo. |
| **B-7** | ✅ | La fase de Evaluación del DSRM incorpora la evaluación de campo con usuarias. |
| **B-8** | ✅ | Se retira el borrado del post antiguo: no está en HU12, no está en el alcance, tensiona con la integridad referencial **y no está implementado** (el workflow no tiene ninguna llamada DELETE a la Graph API). |
| **B-9** | ✅ | §1.2.c y §1.4.2 alineados con el Anexo D. El Cap. 1 había quedado sin alinear tras N-01. |
| **B-10** | ✅ | §3.7.4 deja de atribuir a un detector léxico la prevención de la competencia desleal, la publicidad engañosa y el fraude marcario. El título del apartado también. |

De yapa, la línea base de escritura mejoró: párrafos de más de 250 palabras **6 → 5**, oraciones
de más de 50 palabras **5 → 2** (máxima 61), y se corrigió una subordinada sin verbo al inicio
del §2.4.

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

**Los cuatro bloques están aplicados.** Lo que queda es de Nico y de Word:

1. **Refrescar los campos en Word** (Ctrl+E, F9). Es imprescindible ahora, más que antes: el
   **índice general está vacío** hasta que se actualicen los campos —lleva un marcador que lo
   dice—, y el índice de tablas, el de figuras y la numeración se movieron con las pasadas.
2. **Revisar cómo quedaron las páginas.** El índice general suma unas tres páginas de
   material preliminar, y el cuerpo bajó a 36.985 palabras. Si el límite de ~120 páginas
   incluye el preliminar, hay que mirarlo de nuevo.
3. `python verificar_documento.py` y `python verificar_remisiones.py`. El primero deja un
   único punto abierto —dos oraciones de más de 50 palabras, contra las cinco de la línea
   base— y ninguna frase prohibida ni exigida fuera de lugar.
4. **Decidir si va una séptima auditoría.** El gate del profesor es demostrar >9. Con los
   cuatro bloques hechos la proyección del dictamen era ~9,0–9,1, que sigue siendo un margen
   fino. Antes de volver a auditar conviene la pasada propia por clases de defecto
   (sobreafirmación, remisiones atributivas, inventarios, estadística): en la ronda anterior
   encontró tres hallazgos que las auditorías no habían visto, y en ésta encontró dos más
   —que los casos controlados son 130 y no 134, y que la normalización de imagen del §4.7.2
   no estaba sólo indocumentada sino sin implementar—.

## 7. Pasada propia de coherencia (pasadas 35-38) · hecha

Antes de auditar de nuevo, la relectura completa buscando lo que las pasadas 23-34 pudieron
dejar a medias. **Encontró catorce cosas.** La clase dominante era previsible en retrospectiva:
*un hallazgo se corrige donde el dictamen lo señala, pero la misma afirmación vive en otros
tres capítulos.*

**Contradicciones con correcciones propias (10).** Cinco con M-10: el §4.7 pedía un filtro de
QA «que garantice que cada imagen o video sea técnicamente apto», el §4.7.2 anunciaba
«subrutinas sobre cada imagen» dos párrafos antes de declarar que ninguna se implementó, el
§4.7.1 atribuía a FFmpeg un tratamiento genérico, el §4.4 decía que el módulo asegura el
Aspect Ratio de «cada archivo» y el §3.4.2 declaraba pruebas de FFmpeg sobre imágenes. Una con
B-5: el §4.3.4 sostenía la expansión a otras redes «requiriendo únicamente el añadido de
nuevos nodos», palabra por palabra lo retirado del §6.2. Una con M-13: el §3.3.1 describía el
Product Backlog como «artefacto vivo» cuatro párrafos antes de declarar que no se conserva.
Una con M-16: el Anexo E.1.1 afirmaba de plano la representatividad que el §5.1 había acotado.
Una tensión entre capítulos: «no opera como una herramienta aislada y monolítica» (§1.3.b)
contra el monolito modular del §4.3.3. Y una remisión atributiva que prometía de más: el §3.3.2
decía que el Anexo A documenta «el alcance comprometido», y la Tabla 9 documenta lo entregado.

**Un hueco que el dictamen listó y el texto no declaraba (1).** El §7 del dictamen anotó que
no hay ningún caso de prueba de video en ninguno de los conjuntos. No entró en la lista de
hallazgos, pero el §5.4 comparaba dos canales sin mencionar el tercer flujo y las limitaciones
del §5.1 enumeraban cuatro puntos y no éste. Se declara ahora en los tres lugares, distinguiendo
la evidencia estructural —el nodo lleva las mismas seis expresiones, verificado carácter por
carácter— de una medición del comportamiento.

**Redacción (3).** Una subordinada sin oración principal en el §3.7.3 (preexistente) y dos
enumeraciones que la pasada 31 había desarmado al sacar intensificadores.

**Verificación de cierre.** Los diez hallazgos críticos y altos del dictamen (C-1, A-1 a A-9)
se comprobaron uno por uno sobre el documento actual: los diez cerrados. Y el verificador
quedó **sin ningún punto abierto** por primera vez: cuerpo y anexos con oración máxima de 50
palabras, contra las cinco de más de 50 y la máxima de 62 de la línea base.

## 7. Herramientas que dejaron las pasadas

- `medir_registro.py` — densidad de intensificadores por capítulo, con una lista cerrada y
  discutible entrada por entrada. Es la que sostiene B-6 y la que hay que volver a correr si
  se reescribe un capítulo.
- `run_representatividad.mjs` — el contraste del conjunto principal contra el corpus real
  (M-16). Entra en la entrega y se corre desde `evidencia/`.
- `verificar_patrones_desplegados.mjs --extraer-v1` — el extracto del workflow **anterior** a
  la corrección, que es el que respalda las Tablas 3, 4 y 5 (M-1).
- `verificar_documento.py` tiene ahora, además de las frases prohibidas, una lista
  **EXIGIDAS**: un hallazgo se cierra tanto por lo que se saca como por lo que se pone.
- `redibujar_figura4.py` — la Figura 4 es ahora código y no un bitmap heredado, de modo que
  la próxima corrección de arquitectura se aplica editando el script.
