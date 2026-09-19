# Plan de remediación — séptima auditoría (dictamen 7, 7,2/10)

> El dictamen está en `C:\dev\auditoria-postly-7\dictamen-auditoria-7.md` (y en PDF).
> Este archivo dice qué se aplicó, qué falta y qué decisión falta tomar.

---

## 1. Estado

| | |
|---|---|
| Nota | **7,2** (la sexta dio 7,6, pero **no son comparables**: auditorías independientes, listas de hallazgos distintas) |
| Hallazgos | 1 crítico · 3 altos · 8 medios · 10 bajos |
| Aplicado | **22 de 22** (pasadas 39, 40 y 41, más la corrección del sistema) |
| Pendiente | nada del dictamen; falta refrescar los campos en Word |

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

## 4. Dónde el dictamen no se sostiene

La tabla §4.14 reporta **55 oraciones de más de 50 palabras y una máxima de 81**. No
reproduce: con dos segmentadores independientes —el de `medir_escritura.py`, con lookahead, y
uno ingenuo que corta en todo `.!?`— el documento da **0 y máxima 50**. Sus reglas de
protección de abreviaturas están fusionando oraciones. No es un hallazgo (no aparece en la
lista de hallazgos) pero esa columna está mal.

Lo que sí se acepta de esa zona es B-8, que mide otra cosa —registro, no longitud— y tenía
razón.

---

## 5. Método

El de siempre, con dos aprendizajes nuevos de esta ronda:

- **La guarda de longitud de una pasada tiene que usar `bloques()`**, la misma selección que
  `verificar_documento.py`. Con una selección más ancha marca como regresión la nota de la
  Tabla 1, que es una nota y no prosa.
- **Partir una oración larga puede romper una interpolación.** Fue el origen de M-2. Si una
  pasada edita texto generado con f-strings, hay que barrer el documento buscando llaves
  después. `verificar_documento.py` lo comprueba ahora con una frase prohibida.
