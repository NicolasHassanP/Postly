# Plan de remediación — séptima auditoría (dictamen 7, 7,2/10)

> El dictamen está en `C:\dev\auditoria-postly-7\dictamen-auditoria-7.md` (y en PDF).
> Este archivo dice qué se aplicó, qué falta y qué decisión falta tomar.

---

## 1. Estado

| | |
|---|---|
| Nota | **7,2** (la sexta dio 7,6, pero **no son comparables**: auditorías independientes, listas de hallazgos distintas) |
| Hallazgos | 1 crítico · 3 altos · 8 medios · 10 bajos |
| Aplicado | **22 de 22** (pasadas 39 a 44) más la corrección del sistema |
| Sistema | detección visual en los cuatro flujos, multifotograma y aviso de recorte · 195 nodos |
| Medido | **los cuatro flujos** del canal visual: imagen (Anexos E.6 y E.8), video (E.9), carrusel (E.10) y re-publicación (E.11) |
| Pendiente | nada del dictamen. Ver **§5, Cómo seguir** |

Ninguno de los 39 hallazgos de la sexta reapareció. El dictamen 7 convierte en fortalezas
varias cosas construidas para la sexta: el verificador de patrones y su extracto v1, el
Anexo A.2, la declaración de que no quedaron artefactos de Scrum, la distinción entre la
hipótesis que la prueba contrasta y la que el trabajo afirma. Su §5 dice: «reproduje o
recalculé con mi propio código **todos** los estadísticos del Capítulo 5 … no encontré una
sola discrepancia numérica».

---

## 2. Lo aplicado (pasadas 39 y 40)

Todo lo que no tenía decisión de por medio. Cada afirmación sobre la fuente normativa se
verificó contra el PDF de diez páginas antes de escribirla.

| # | Qué |
|---|---|
| **A-1** | §1.1 y §2.4 dejan de atribuir a la norma una finalidad («equidad de mercado», «venta consultiva») y una tipificación («falta grave al contrato») que **no están en la fuente**. Ella reserva «violación grave» para las afirmaciones de ingresos y «violación seria» para la venta en grupos de intercambio; para el mensaje comercial en canal público no fija sanción. |
| **A-2** | El Anexo C no tiene nada sobre el copy ni sobre alucinaciones (21 párrafos, 1.098 palabras, cero coincidencias). Se retiran las dos remisiones y se declara que no hay evidencia, ni siquiera cualitativa. |
| **A-3** | No hay componente de NLP —son seis expresiones regulares— y el sistema no suprime ni elimina: **interrumpe**. Seis frases corregidas en el Resumen, el OE3, el §1.5.1, el §3.3.2, el §4.2 y el §4.6. |
| **M-1** | El recuento de umbrales: nueve de criterios de aceptación + dos de lectura del código = once filas; y 4 por medición + 4 por configuración = 8. |
| **M-2** | El marcador de plantilla sin interpolar en el §5.1. **Error propio de la pasada 37**: al partir la oración se perdió el prefijo `f` de la línea siguiente. Barrido completo del documento: era el único. |
| **M-3** | La nota de la Tabla 1 atribuía al canal textual las cifras del agregado (0,85/0,67 son del conjunto; el textual da 0,83/0,63). |
| **M-4** | Se declara que la taxonomía de representatividad no es excluyente y que hay regla de precedencia, y la conclusión baja de «cota inferior» a lo que un caso sobre 18 permite. |
| **M-6** | Se acota qué significa «validado e2e»: recorrido funcional completo, no umbral medido. |
| **M-7** | La atomicidad del buffer viene de `appendFileSync`, no del hilo único de Node, que no serializa la entrada y salida. |
| **M-8** | 26 citas de tres o más autores pasan a «et al.», como pide APA 7. |
| **B-1** | La firma es «Consultora de Belleza Independiente Mary Kay» en los siete lugares. Es la que el código usa como valor por defecto. |
| **B-2** | §4.5.2 deja de atribuir a la norma la firma al pie. |
| **B-3** | Se restituye «aseguran/garantizan» en la cita del Anexo D. |
| **B-4** | Se saca la oración del video que rompía el párrafo del §5.4. **Error propio de la pasada 36.** |
| **B-5** | Se declara que una de las dos evaluadoras del κ es la autora del material, con su intervalo. |
| **B-6** | Los criterios de inclusión de la muestra no se registraron por participante, y se dice. |
| **B-7** | El SHA-256 del código no es comprobable por un tercero —el extracto no incluye el código—, y se declara. **Deuda propia**: el campo se escribe y se imprime pero nunca se compara. |
| **B-8** | Registro: el léxico del dictamen era más ancho que el de `medir_registro.py`. Se corrigen seis casos y se amplía el medidor con 33 formas. Con la lista nueva el Cap. 1 queda en 1,00, por debajo del Cap. 5 (1,23). |
| **B-9** | El OE2 deja de prometer «calidad editorial equivalente a la de un redactor profesional», vara que nunca se midió. |
| **B-10** | La «Fuente» de las quince figuras pasa del rótulo superior a una nota al pie, como en las catorce tablas. Los quince rótulos conservan su campo SEQ. |

`verificar_documento.py` suma 24 frases prohibidas y dos comprobaciones sobre la posición de
la fuente de las figuras, todas verificadas contra el documento anterior.

---

## 3. C-1 y M-5 · **aplicados** (pasada 41 + corrección del sistema)

### C-1 — qué mide la Tabla 5

Se tomó el camino **2 + 3** del dictamen y no el 1. El alcance declarado del Módulo Centinela
siempre fue el precio y la promoción, de modo que el defecto es de rotulación y de alcance y
no de medición: reetiquetar el corpus haría caer una medición correcta del objeto que el
módulo sí audita. Las cifras no se movieron (VP 12 · FN 2 · FP 0 · VN 15); lo que cambió es
qué dice el documento que significan.

- El §5.1 declara que el etiquetado usó **el criterio del módulo** —la referencia monetaria en
  canal público— y que es más estrecho que la definición de mensaje comercial de las Pautas.
- Cae el «15/15 informativos publicados». Las quince piezas pasan a llamarse **«piezas sin
  referencia monetaria»**, con la explicación de por qué no son «informativas» en el sentido
  de la norma: las quince cierran en una invitación a escribir para reservar o encargar.
- La nota de la Tabla 5 dice que la Precisión de 1,00 **no significa ausencia de
  sobre-bloqueo**, porque el corpus no contiene casos en los que sobre-bloquear.
- El §6.1 baja de «salvaguarda legal» a **«salvaguarda parcial»**, con el motivo.
- El §5.4 «Transferibilidad» suma **la solicitud comercial sin precio** a las cuatro materias
  que el módulo no audita.

### M-5 — el canal visual por flujo · **se corrigió el sistema**

El dictamen no pudo establecer qué flujos invocan la detección visual. El grafo de conexiones
sí, y era peor de lo que sospechaba: corría **sólo en imagen única**. El carrusel evaluaba con
un criterio propio —su lista de tokens no incluía «ENVÍO GRATIS»— y el video y la
re-publicación **no tenían ninguna**. Una foto con el precio impreso en los píxeles quedaba
bloqueada si se enviaba sola y se publicaba si se mandaba como video o se reciclaba desde Mi
Agenda.

`scripts/add-vision-compliance.mjs` (185 → 193 nodos, desplegado y activo):

| flujo | antes | ahora |
|---|---|---|
| imagen única (HU7/HU8) | `HU8: Detección visual` | igual |
| carrusel (HU5) | criterio propio en el prompt combinado | **el criterio de HU8, palabra por palabra** |
| video (HU13) | sin detección | `Video: HU8 visual` sobre el fotograma extraído |
| re-publicación (HU12) | sin detección | `Repost: HU8 visual` sobre la imagen de la fila |

Dos decisiones de diseño, y su porqué:

- **El carrusel no se separó en dos llamadas.** Su nodo evalúa N imágenes en una sola petición;
  separarlo multiplicaría por N el consumo de una cuota de 20 diarias. Lo que se unificó es el
  criterio, que es lo que el §5.1 mide — el mismo movimiento que la corrección de HU10.
- **El criterio se inserta sin sangrar.** Una sangría de tres espacios no cambiaría el
  comportamiento pero rompería la identidad literal, que es justo lo que hace la corrección
  demostrable.

El parseo replica el de HU8, **incluido su modo fail-open** ante una respuesta que no sea JSON
válido, que el §4.5.1 declara: así el comportamiento sigue siendo el medido.

`verificar_patrones_desplegados.mjs` comprueba ahora el criterio visual flujo por flujo, como
ya hacía con las seis expresiones del canal textual. Corrida limpia: los cuatro flujos llevan
el mismo criterio de 569 caracteres.

En el documento: el §5.1 reporta la divergencia junto a la de HU10, el §4.5 dice que las dos
capas cubren los cuatro flujos, el Anexo E.4 declara la comprobación nueva, y se declara la
salvedad propia del video —la detección opera sobre el fotograma extraído, no sobre todos los
del clip—.

## 4. Después del dictamen: lo que salió de probar el sistema

Con n8n arriba se corrigió **el sistema** además del documento, y probarlo destapó cosas que
ninguna auditoría había visto. Orden cronológico, porque cada hallazgo salió del anterior.

1. **La detección visual sólo corría en imagen única** (M-5). El carrusel usaba otro prompt
   con otro criterio, y video y re-publicación **no tenían ninguna**: un precio incrustado se
   bloqueaba como imagen y se publicaba como video o como repost.
   → `scripts/add-vision-compliance.mjs`, 185 → 193 nodos.
2. **`Video: procesar` nunca había corrido en local.** El `.env` tenía
   `NODE_FUNCTION_ALLOW_BUILTIN=crypto,fs` y falta `child_process`, que el `CLAUDE.md`
   documenta. Lo corrigió Nico y reinició.
3. **Insertar nodos rompió el `$json` del siguiente.** `Video: analizar` leía
   `$json.frameUrl` del nodo de FFmpeg y pasó a recibir el del parseo. Es el gotcha que el
   `CLAUDE.md` documenta y aun así pasó. Auditar los nodos aguas abajo de toda inserción.
4. **El recorte a 9:16 se comía el precio.** Sobre un 16:9 sobrevive el tercio central del
   ancho: una placa contra el borde desaparece antes de que el detector la vea **y antes de
   que el Reel se publique**. No es incumplimiento, pero sí una modificación silenciosa del
   contenido de la usuaria.
   → `scripts/video-multiframe.mjs`: cuatro imágenes en una sola llamada (tres instantes del
   video normalizado + el encuadre original), dos respuestas —bloquea o avisa— y la cuota
   cuesta lo mismo. De paso cerró otro agujero: **`Video: cortar`**, la rama del video de más
   de 60 s, salía directo a la generación de copys sin pasar por ninguna detección.
5. **El texto del modelo rompía el envío por Telegram.** El `detalle` se interpola en un
   mensaje con Markdown y un `@DANYGIL_MK` abrió una cursiva sin cerrar: 400 de la API. Los
   cinco avisos tenían la misma bomba, incluido uno que venía de antes.
   → `scripts/fix-telegram-markdown.mjs`, saneo en los cuatro nodos que parsean.
6. **Los dos casos de video, medidos** (ejecuciones 607 y 605). Cierran con medición la
   quinta limitación del §5.1, que declaraba que ese flujo no tenía ningún caso.
   → Anexo E.9 nuevo y `evidencia/casos_video/`.

7. **El caso de carrusel, medido** (ejecución 609, pasada 43). Nico mandó al bot un grupo de
   dos imágenes del mismo producto, una con precio y otra sin, y el módulo bloqueó la
   publicación entera. Tiene un valor que no depende de su tamaño: **la imagen con precio es
   la misma pieza que el caso R01** del conjunto de imagen, de modo que el mismo material
   entró por dos flujos distintos y recibió el mismo veredicto. La identidad de criterio
   entre flujos deja de sostenerse sólo por verificación del texto de los nodos.
   → Anexo E.10 nuevo y `evidencia/casos_carrusel/`.
8. **La pasada 42 dejó una contradicción.** El §6.2 seguía recomendando «construir un
   conjunto de casos de video», que es justo lo que el §5.1 acababa de reportar. Es el mismo
   patrón de siempre: corregir en un lugar deja viva la afirmación vieja en otro. Corregido
   en la pasada 43, con las dos frases viejas agregadas al verificador.

9. **El caso de re-publicación, medido** (ejecución 614, pasada 44). Con él los **cuatro**
   flujos del canal visual quedan medidos y no sólo verificados. Es el que más costó armar:
   la re-publicación no recibe una imagen, toma la de la fila de la agenda, y por Postly no
   puede entrar una con precio. La única vía es la real —publicarla a mano en Instagram y
   dejar que la sincronización la traiga—, que es justo el camino por el que la divergencia
   dejaba pasar contenido. → Anexo E.11 nuevo y `evidencia/casos_repost/`.
10. **Dos fallos que el sistema se tragaba en silencio**, los dos destapados al preparar ese
    caso y los dos corregidos y desplegados:
    - **Los avisos no llegaban al chat.** `Repost: imagen con precio` y, por el camino del
      video de más de 60 s, `Video: frame con precio` y `Video: aviso de recorte` leían el
      destinatario como `message.chat.id`. Esas ramas nacen de un **botón**, y en un
      `callback_query` el `message` no está en la raíz: el chatId resolvía a `undefined` y el
      envío fallaba. El módulo bloqueaba bien; la usuaria no se enteraba.
      → `scripts/fix-chatid-avisos.mjs`.
    - **La sincronización desde Instagram no escribía nada.** `Sync: Upsert` tenía anotadas 8
      columnas y la hoja tiene 16, así que abortaba con «Column names were updated after the
      node's setup». Con `onError: continueRegularOutput`, Mi Agenda se dibujaba igual con
      las filas viejas y lo publicado a mano no aparecía nunca, sin ningún error visible.
      → `scripts/fix-sync-upsert-schema.mjs`.

`verificar_patrones_desplegados.mjs` comprueba ahora el criterio visual **flujo por flujo**,
como ya hacía con las seis expresiones del canal textual.

---

## 5. Cómo seguir

**Primero, y es de Nico:**

1. **Refrescar los campos en Word** (Ctrl+E, F9). Los Anexos E.9 y E.10 suman dos entradas al
   índice general y el cuerpo creció. Sin eso, los tres índices quedan desfasados.
2. **Decidir sobre un fotograma.** El segundo del caso de bloqueo es el único donde aparece
   el rostro de quien filmó; se omitió del material entregado y la omisión está declarada en
   el Anexo E.9 y en el LEEME. Si se prefiere incluirlo, está en la instancia de Cloudinary y
   se vuelve a bajar en un minuto.

**Después, por orden de rendimiento:**

3. **Decidir si los dos fallos silenciosos van a la tesis.** El del `Sync: Upsert` y el de
   los avisos que no llegaban son de la misma clase —un camino de error que no se manifiesta—
   y el **Anexo C** es su lugar natural: hoy tiene ocho obstáculos con su diagnóstico y su
   decisión, y éste sería el noveno. Está sin escribir a propósito: es alcance nuevo y la
   decisión es de Nico. A favor, es la clase de hallazgo que una auditoría premia y los dos
   están corregidos; en contra, suma páginas y hay que tocar el §5.3, que dice «los ocho».
4. **Decidir si va una octava auditoría.** El gate del profesor es demostrar >9. La séptima
   dio 7,2 con los 22 hallazgos ya aplicados, y encima se corrigió el sistema. Vale la pena
   una pasada propia de coherencia antes —como la de las pasadas 35-38, que encontró catorce
   cosas—, porque las últimas rondas mostraron que el documento acumula desfasajes cada vez
   que se toca; la pasada 43 encontró uno más, del día anterior. En particular hay que barrer
   lo que el §4.7.3 y el §5.1 dicen ahora sobre el video y el carrusel contra lo que dicen el
   Resumen, el Cap. 1 y los Anexos B.5 y B.9.
5. **Recuento de páginas.** Venía en ~158 y creció. Si el límite de ~120 incluye el material
   preliminar, hay que mirarlo antes de entregar.

**Dónde quedó el material de origen.** Los dos videos y las dos imágenes con que se hicieron
las pruebas están en `avance/fuentes de prueba/`, fuera de `evidencia/` y **fuera de git**:
en uno de los videos se ve la cara de la consultora, y `armar_evidencia.py` habría borrado
esa carpeta en la próxima corrida por no conocerla. Lo que se entrega son los fotogramas y
las imágenes ya procesadas.

**Estado de la instancia:** n8n local con 195 nodos, activo, con todo lo anterior desplegado.
`node scripts/probe-local-n8n.mjs` compara el repo contra la instancia sin tocar nada.

---

## 5 bis. Repaso del PRIMER dictamen (4,4/10) · 19-09

**Por qué se hizo.** Nico vio, en la planilla donde los profesores dejan sus devoluciones,
que en otros grupos **toman el dictamen anterior antes de emitir el nuevo**. La premisa con
que se armó la sexta auditoría —que auditan desde cero— era equivocada, y eso vuelve
relevante todo lo que haya quedado abierto en los dictámenes viejos.

**Qué se revisó.** Los 41 hallazgos críticos y altos del primer dictamen, uno por uno,
contra el documento actual. Las diez debilidades principales de su §11.2 están todas
cerradas: el Cap. 5 tiene datos, la hipótesis del 70 % está medida, hay 15 figuras y 28
tablas, la fase de Evaluación del DSR se ejecutó, las Pautas están en el Anexo D con su PDF,
existe el §5.4 Discusión, la bibliografía pasó de 80 entradas con 0 DOI a 92 con 41 y 14
posteriores a 2024, las ocho contradicciones de su tabla 7.3 están resueltas una por una, y
el Cap. 3 tiene variables, instrumentos y amenazas a la validez.

**Lo que quedaba vivo, y no por descuido de aquella remediación.** Su §7.4 objetaba que el
trabajo afirmara consecuencias graves —«rescisión unilateral del contrato de distribución»—
sobre una empresa nombrada y sin fuente. Con el PDF de las Pautas incorporado, el hallazgo
A-1 de la **séptima** auditoría estableció qué dice realmente la fuente: reserva sus
calificaciones más graves para las afirmaciones de ingresos y la venta en grupos de
intercambio, y **para el mensaje comercial en canal público no fija sanción**. Esa corrección
se aplicó en el §1.1 y el §2.4 y dejó seis frases prometiendo sanciones por esa misma
conducta —una de ellas en el §1.2.c, a cuatro párrafos de la que la desmiente—. Corregidas en
la **pasada 45**, con siete frases nuevas en el verificador.

**Y un desfasaje propio** (pasada 46): el documento decía «~185 nodos» en el §4.3, el Anexo
B.2 y dentro de la Figura 4. Son **195** desde que la corrección del canal visual agregó la
detección a video y re-publicación, y el extracto del Anexo E.4 sale de ese mismo workflow.

**Residuo menor, no corregido:** dos o tres entradas de Springer del Cap. 7 podrían llevar
DOI y no lo llevan (Weske 2012, Vigna et al. 2003). El resto de las 40 sin enlace son libros,
que no tienen.

---

## 6. Dónde el dictamen no se sostiene

La tabla §4.14 reporta **55 oraciones de más de 50 palabras y una máxima de 81**. No
reproduce: con dos segmentadores independientes —el de `medir_escritura.py`, con lookahead, y
uno ingenuo que corta en todo `.!?`— el documento da **0 y máxima 50**. Sus reglas de
protección de abreviaturas están fusionando oraciones. No es un hallazgo (no aparece en la
lista de hallazgos) pero esa columna está mal.

Lo que sí se acepta de esa zona es B-8, que mide otra cosa —registro, no longitud— y tenía
razón.

---

## 7. Método

El de siempre, con estos aprendizajes:

- **La guarda de longitud de una pasada tiene que usar `bloques()`**, la misma selección que
  `verificar_documento.py`. Con una selección más ancha marca como regresión la nota de la
  Tabla 1, que es una nota y no prosa.
- **Partir una oración larga puede romper una interpolación.** Fue el origen de M-2. Si una
  pasada edita texto generado con f-strings, hay que barrer el documento buscando llaves
  después. `verificar_documento.py` lo comprueba ahora con una frase prohibida.
- **Los heredoc de bash colapsan el salto de línea escapado dentro de un string de Python**
  —la secuencia de dos caracteres, contrabarra y ene— y rompen el JS o el regex que generan.
  Esta misma línea lo sufrió: quedó partida en dos hasta la pasada 43. Pasó tres veces en esta sesión. El `CLAUDE.md` lo dice: usar la
  herramienta de edición de archivos, `String.fromCharCode(10)` o armar la cadena por partes.
- **Al editar el workflow, auditar siempre los nodos aguas abajo.** Insertar un nodo cambia el
  `$json` que ve el siguiente. El grafo de conexiones se recorre en diez líneas y evita un
  «Cannot read properties of undefined» en producción.
- **El texto que devuelve el modelo es dato no confiable para un mensaje con formato.** Se
  sanea en el nodo que parsea y no en cada mensaje.
- **Una guarda que falla tiene que decir qué la hizo fallar.** La pasada 43 imprime las
  oraciones largas que ella misma introdujo, en vez de sólo el conteo: dos intentos a ciegas
  contra uno con el texto delante.
- **Un título no sirve de ancla en el verificador.** Aparece también en el índice, que es un
  campo de Word y cuenta 1 o 2 según si se refrescó. Se ancla en la primera oración del
  apartado.
