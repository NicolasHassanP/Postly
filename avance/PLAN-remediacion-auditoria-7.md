# Plan de remediación — séptima auditoría (dictamen 7, 7,2/10)

> El dictamen está en `C:\dev\auditoria-postly-7\dictamen-auditoria-7.md` (y en PDF).
> Este archivo dice qué se aplicó, qué falta y qué decisión falta tomar.

---

## 1. Estado

| | |
|---|---|
| Nota | **7,2** (la sexta dio 7,6, pero **no son comparables**: auditorías independientes, listas de hallazgos distintas) |
| Hallazgos | 1 crítico · 3 altos · 8 medios · 10 bajos |
| Aplicado | **20 de 22** (pasadas 39 y 40) |
| Pendiente | **C-1** y **M-5**, los dos con decisión del autor de por medio |

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

## 3. Lo que falta, y por qué espera

### C-1 — la verdad de base del estudio de campo · **decisión del autor**

**Verificado y se sostiene.** Las quince piezas etiquetadas LIMPIO terminan, las quince, en
una solicitud de compra («Escribime por mensaje directo para reservar el tuyo»). La fuente
resuelve ese caso exacto (p. 3): «Acabo de probar el rímel … ¡Wow!» → INFORMATIVO;
«… ¡Pregúntame cómo puedes conseguirlo!» → **COMERCIAL**, «porque ella está anunciando a su
audiencia que se lo compren a ella». Así que la Precisión de 1,00 y el «15/15 informativos
publicados» no significan lo que el §6.1 les hace significar.

Tres caminos:

1. **Reetiquetar el corpus.** Lo más honesto y lo más caro: Recall 0,857 → 0,444 y F1 0,923 →
   0,615. El Resumen y el §6.1 pierden su cifra más fuerte.
2. **Cambiar lo que la Tabla 5 dice medir**: no «cumplimiento de la regla (a)» sino
   «detección de referencias monetarias». Los números se conservan; cae «15/15 informativos
   publicados» y la Precisión deja de leerse como ausencia de sobre-bloqueo.
3. **Declarar la solicitud comercial sin precio fuera de alcance**, en §5.4
   «Transferibilidad» y en el Anexo D, junto a las cuatro materias que ya enumera.

Recomendación: **2 + 3**. El alcance declarado del módulo siempre fue precio y promoción, de
modo que el defecto es de rotulación y de alcance, no de medición. La opción 1 tiraría abajo
una medición correcta para el objeto que el módulo sí audita.

### M-5 — la cobertura del canal visual por flujo · **peor de lo que el dictamen pudo probar**

El dictamen no pudo establecer si el carrusel y el video atraviesan la detección visual. Se
recorrió el grafo de conexiones del workflow y sí se puede:

| flujo | detección visual de precios |
|---|---|
| imagen única (HU8) | **sí** — nodo `HU8: Detección visual`, prompt de 967 caracteres. Es el único medido (Tablas 12 y 14) y el único que verifica el script |
| carrusel (HU5) | **sí, pero con otro prompt** — `HU5: Analizar carrusel`, 1.276 caracteres, que hace compliance y orden narrativo en la misma llamada y con otro criterio (lista tokens «OFERTA/PROMO/2x1/LIQUIDACIÓN/SALE» que el de HU8 no tiene). Nunca medido ni verificado |
| video (HU13) | **no** |
| repost (HU12) | **no** |

Es **la misma clase de defecto que la divergencia de HU10** que el trabajo descubrió, corrigió
y reportó en el canal textual, pero en el canal visual y sin descubrir. Contradice el §1.5.1
(«sin excepción condicional, en el 100 % de las transacciones») y el párrafo del §5.4 que la
pasada 36 agregó, que declaraba respaldo estructural para el video mirando sólo el canal
textual.

Hay dos decisiones: si se corrige el sistema antes de entregar, y qué se declara en el
documento en cualquiera de los dos casos.

---

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
