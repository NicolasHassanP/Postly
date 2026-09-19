# Plan de remediación — octava auditoría (dictamen 8, 6,6/10)

> El dictamen está en `C:\dev\auditoria-postly-8\auditoria-postly-8-revision-20260919T102858Z-1-001\auditoria-postly-8-revision\dictamen-auditoria-8.md` (y en PDF).
> Este archivo dice qué hay que arreglar, en qué orden, qué necesita a Nico y qué no se puede cerrar sin volver al campo.

---

## 0. Estado de la aplicación (19-09-2026)

**Aplicado: las pasadas 48 a 58.** Los tres verificadores cierran limpios
(`verificar_documento.py`, `verificar_coherencia.py`, `verificar_patrones_desplegados.mjs`), y
las métricas de escritura no empeoraron: 0 oraciones de más de 50 palabras y 5 párrafos de más
de 250, los mismos cinco de antes.

| Pasada | Cubre |
|---|---|
| 48 | **A1** — la Tabla 5 pasa a dos paneles (constructo n=27 y «publicable» n=29) |
| 49 | **A4, A6, M13, B4** — «compatible, no confirmada»; OE-2; ≈24 sujetos; registro |
| 50 | **A2, A8, M6** — cronología de la corrección visual; los cuatro casos pasan al §5.1 |
| 51 | **A3** — el extracto publica prompts y código; Tabla 13 baja HU9 y HU13 a lectura de código |
| 52 · 52b | **A5, M2, M7** — poda del §2.4 y del Anexo D contra el PDF de la fuente |
| 53 | **M3, M8, A7, A-16, A-19, C-14** — capacidades que el código desmiente; inventario de almacenes |
| 54 | **M4, C-13** — Cap. 4 y Anexo B al día con el sistema corregido |
| 55a | **M5, M10, B7, B8, B9, B10** — las seis remisiones; Tabla 2; B.1 declara la baja del VPS |
| 55b | **M9** — Figura 6 redibujada (auditoría visual antes de los copys) y nota de la Figura 11 |
| 56a | **A9, M14, M1** — composición de E.9; el E.6 y el E.11; defecto de avisos; fail-open |
| 56b | **M11, M13, M15, M16** — Wilson del canal visual; inventarios; representatividad |
| 57a · 57b · 57c | **M12, B1, B2, B3, B4, B5, C-03, A-26** — HU2 restituido; escritura; protocolo del estado del arte |
| 58 | la duda de cuota del §9: parte de las inferencias es anterior al 14-09 |

**Sistema corregido y desplegado** (195 nodos, activo): `scripts/fix-hu13-duracion.mjs` cierra
la guarda de duración de HU13, que era fail-open. Y `verificar_patrones_desplegados.mjs` pasa
de comprobar un booleano a comparar los cuatro prompts carácter por carácter.

**Evidencia**: `anonimizar_marca_agua.py` cubre `@DANYGIL_MK`;
`run_compliance_vision.mjs` persiste la respuesta cruda del modelo; los `LEEME` de
`casos_video/` y `casos_repost/` declaran la autoría de las placas y la publicación en
Instagram. `armar_evidencia.py` ya regeneró la entrega.

**Cerrado también (pasadas 59 a 62), en la segunda tanda:**

| Pasada | Cubre |
|---|---|
| 59 | **B6** — APA 7 completo, y las 16 citas de las Pautas con su página, ubicada sobre el PDF |
| 60 · 60b | el campo SEQ de la Tabla 5, que rompí en la 48, y los números cacheados de los 29 rótulos |
| 61 | **M9** (Figuras 1 y 3) y **A-22** (el umbral de HU6, que no tenía vara) |
| 62 | pasada propia de coherencia: lo que dejaron abiertos HU2 y la baja del VPS |

**Los 51 puntos del dictamen 8 están aplicados.** Los tres verificadores cierran limpios y
`verificar_documento.py` suma ahora **58 frases prohibidas nuevas**, una por cada afirmación
que esta tanda retiró, de modo que ninguna puede volver sin que el verificador lo diga.
`verificar_coherencia.py` suma un guarda para los campos SEQ de los rótulos.

**Lo que queda, y es de Nico:**
1. **Refrescar los campos en Word** (Ctrl+E, F9) sobre el archivo final: se agregaron
   párrafos en los ocho anexos y se reconstruyó el campo de la Tabla 5.
2. **Retirar de Instagram** la pieza de prueba con «20 % OFF / ARS $4500»: el E.6 y el
   `LEEME` de `casos_repost/` ya declaran que se retiró.
3. **Decidir sobre el recuento de páginas.** Ver abajo.
4. **Lanzar la novena** desde `C:\dev\auditoria-postly-9`, en sesión limpia fuera del repo.
   La carpeta ya está armada y probada; el enunciado es `PROMPT-auditoria-novena.md` y la
   rúbrica, el dictamen 8.

## 0 bis. El riesgo que queda abierto: el largo

El documento creció **+4.172 palabras (+7,6 %)** desde la versión que se auditó, unas **12
páginas**. El reparto:

| Sección | Antes | Ahora | Δ |
|---|---:|---:|---:|
| Anexos | 12.041 | 13.312 | **+1.271** |
| Cap. 5 | 8.959 | 10.205 | **+1.246** |
| Cap. 4 | 9.683 | 10.077 | +394 |
| Cap. 2 | 6.836 | 7.243 | +407 |
| Cap. 3 | 6.357 | 6.693 | +336 |
| Cap. 6 | 1.877 | 2.123 | +246 |
| Cap. 1 | 6.229 | 6.456 | +227 |

El crecimiento está donde el dictamen exigía declarar más —los anexos y el Capítulo 5—, que
es justamente donde **no** conviene cortar. Si hay que recortar, la grasa sigue estando en el
Cap. 4 y en el Cap. 2, que son los dos capítulos con más prosa por dato. Eso es una decisión
de Nico, y depende de si el límite de páginas incluye los anexos.

---

## 1. Cómo leer el 6,6

**No es una caída desde el 7,2.** La octava se lanzó con el **dictamen original (4,4/10, 96
hallazgos)** como rúbrica, no con el séptimo. Es decir: auditó la tesis entera otra vez, de
cero, con la lista más larga que existió, y calificó capítulo por capítulo con pesos propios.
La séptima calificaba otra cosa. Comparar 6,6 con 7,2 es comparar dos reglas distintas.

Lo que sí es comparable, y es el dato relevante:

| | Séptima | Octava |
|---|---|---|
| Críticos | 1 | **0** |
| Altos | 3 | 9 |
| Medios | 8 | 17 |
| Bajos | 10 | 10 |
| Discrepancias numéricas | 0 | **0** |

El dictamen dice, textual: «**Todas las cifras del Capítulo 5 que pude recalcular salen iguales
del dato crudo**… No encontré ninguna cifra que no coincida», y los archivos de resultados
quedaron «idénticos byte a byte» al reejecutarse. El Capítulo 5 no hay que tocarlo en lo
numérico. **El problema pasó de la evidencia a la lectura de la evidencia**: qué dice el
documento que significan cifras que están bien calculadas.

Eso es una buena noticia y una mala. La buena: casi todo se arregla escribiendo, y casi todo
es *restar*, no agregar (lo que además ayuda con el límite de páginas). La mala: son
**51 puntos accionables** y varios tocan frases del Resumen y del Capítulo 6, que es donde un
lector rápido forma su nota.

### Por qué aparecieron nueve altos que ninguna auditoría anterior vio

Tres causas, y conviene tenerlas presentes porque predicen lo que va a encontrar la novena:

1. **Rúbrica más ancha.** Volvió a mirar el Cap. 1, 2, 6 y 7, que las auditorías 5 a 7 daban
   por cerrados. De ahí salen A5 (§2.4), A6 (OE-2), A7 (§3.7.1) y buena parte de los medios.
2. **La corrección del sistema del 19-09 dejó afirmaciones viejas vivas.** Es exactamente el
   patrón que el plan anterior anotó como lección, y volvió a pasar: A2, A8, M4, M6, M9,
   regresión 1. El Anexo B y el Cap. 4 describen el sistema de antes de la corrección.
3. **El auditor leyó el `LEEME` de la evidencia y lo cotejó con los anexos.** El `LEEME` es
   más honesto que la tesis en dos casos (A9, M14). Eso es autoinfligido: la honestidad estaba
   escrita, pero en el archivo que no se entrega como parte del trabajo.

---

## 2. Inventario: 51 puntos

| Bloque | Cuántos | Dónde |
|---|---|---|
| Altos nuevos | 9 | A1–A9 |
| Medios nuevos | 17 | M1–M17 |
| Bajos nuevos | 10 | B1–B10 |
| Parciales del dictamen original | 11 | C-03, C-08, C-13, C-14, A-16, A-19, A-22, A-26, A-33, A-37, A-39 |
| Regresiones | 4 | §4 del dictamen |

**Los 11 parciales y las 4 regresiones no necesitan pasada propia: todos caen dentro de un
hallazgo nuevo.** El mapa:

| Parcial / regresión | Se cierra en |
|---|---|
| C-08 (norma sin fuente) | **A5** |
| C-13 (video contradictorio) | **M4** |
| C-14 (minimización de datos) | **A7** |
| A-16 (microservicios) · A-19 (relacional/transaccional) | **M3** |
| A-22 (criterios no verificables) | **M12** + tres umbrales de la Tabla 13 |
| A-33 (title case) | **B6** |
| A-37 (Tabla 2 de riesgos) | **M10** |
| A-39 (Cloudinary) | pasada 54 |
| C-03 (línea base 15–30 min) · A-26 (estado del arte sin protocolo) | pasada 57 |
| Regresión 1 (Anexo B atrás del sistema) | **M4** |
| Regresión 2 (criterio de HU2 reescrito) | **M12** |
| Regresión 3 (honestidad: E.9, E.11, defecto de avisos) | **A9 + M14** |
| Regresión 4 (frases rotas) | **B3** |

---

## 3. Las diez pasadas

Ordenadas por el §8 del propio dictamen («qué separa este trabajo de un 10»), que es la
prioridad que el evaluador declaró. Cada pasada es un `_pasadaNN.py` como las 39 a 47, y
termina corriendo `verificar_documento.py` y `verificar_coherencia.py`.

### Pasada 48 — La lectura del estudio de campo · **A1** · la de mayor impacto

Es el único hallazgo que toca la cifra con la que el trabajo responde la objeción más fuerte
que recibió («los casos los diseñaron ustedes»). Verificado contra `Compliance_Campo.csv`:
**el auditor tiene razón**. `c1inf3` y `c2inf3` están etiquetados INFRACTOR por *defecto de
producto* —«tinta corrida en el envase», «tapa rota»— y no tienen ninguna referencia
monetaria. Son los dos falsos negativos. Hay 12 piezas con precio, no 14.

Y los 14 positivos son mensajes para canal **privado** («que enviarían por canal privado»,
E.1.2). La nota de la Tabla 5 dice hoy lo contrario: «contenido destinado al canal público».

Qué se hace:

- **Dos matrices bajo una sola Tabla 5**, en dos paneles. *Panel A — constructo declarado*
  (27 casos, sin los dos de defecto de producto): 12/0/0/15, Recall, Precisión y F1 = 1,00,
  con sus intervalos de Wilson. *Panel B — regla de «publicable» completa* (29 casos):
  12/2/0/15, F1 0,923, con la aclaración de que los dos FN son defectos de producto, materia
  que el módulo no audita.
  > **Un solo número de tabla, dos paneles.** Agregar una Tabla 5-bis renumera las Tablas 6 a
  > 14 y rompe todas las remisiones. No vale la pena.
- Renombrar la clase positiva: **«mensaje de venta privado trasladado hipotéticamente al
  feed»**, que es lo que efectivamente es.
- Retirar «destinado al canal público» de la nota de la Tabla 5 y del §5.1.
- Corregir «14 mensajes con precio, oferta o descuento» → 12, y el §5.4 «27 reales» → los 29
  pies de foto pasaron por el detector (M13).
- Declarar que el κ = 1,00 es acuerdo sobre la etiqueta mixta, y que «los 27 casos en que la
  regla sí gobernó el juicio» (Anexo D) es un subconjunto definido **después** de ver el
  resultado. Decirlo desarma el reproche; callarlo lo invita.
- Propagar a: Resumen, §6.1, E.1.2.

Recalcular los Wilson del panel A con un script chico; no hace falta reejecutar nada.

### Pasada 49 — Calibrar las conclusiones · **A4, A6, M13, B4**

El §6.1 ya dice lo correcto («el margen por encima del umbral no es estadísticamente
distinguible… la hipótesis se sostiene en el valor puntual observado y no en un respaldo
inferencial»), y a renglón seguido rotula el resultado como confirmación. **El arreglo es de
rótulo, no de contenido.**

- «se considera confirmada» → **«compatible con la hipótesis, no confirmada: el valor puntual
  la supera y el intervalo del 95 % la contiene»**, en §5.1, §6.1 y en el `console.log` de
  `run_cronometraje.mjs`, que imprime «Veredicto: SE CONFIRMA».
- Agregar el dato que el auditor calculó y el trabajo no reporta: con el efecto observado
  (d = 0,52 frente al 70 %), una potencia del 80 % pediría **≈ 24 sujetos**. Ponerlo en el
  §5.4 y en el §6.2 convierte una debilidad en una línea de trabajo dimensionada.
- Retirar del §6.1 «el sistema Postly resuelve la ineficiencia operativa que motivó el
  trabajo»: lo medido es un tramo, no los 15–30 min con curación incluida.
- **OE-2 (A6)**: declararlo cumplido **en la integración** y **no evaluado en la calidad**, y
  retirar la comparación con «generadores de texto genéricos», que nunca se hizo. El propio
  §5.1 dice «La calidad del copywriting generado… no se evaluó» y el §5.4 dice que sobre
  alucinaciones no hay «ni siquiera evidencia cualitativa».
- «14 de 14 Historias de Usuario» (Resumen, §5.1, §5.3, §6.2): el §5.1 ya lo acota en el
  párrafo siguiente; el Resumen no. Llevar la salvedad al Resumen o bajar a «las 14 HU
  implementadas; tres umbrales sin verificar (Tabla 13)».
- Registro sin criterio previo (B4): «desempeño satisfactorio» (§5.1), «estándares de nivel
  corporativo», OE-1 «de nula fricción», OE-2 «de forma eficiente» (§6.1). «Nula fricción»
  sobrevive además en el §3.2.

### Pasada 50 — La cronología de la corrección visual · **A2, A8, M6**

El §5.4 dice que los tres flujos nuevos llevaban el criterio visual «durante toda la
evaluación». El §5.1 y el E.10 dicen lo contrario, y son ellos los que tienen razón. **Es la
única frase del documento que reescribe la historia a favor del sistema**, y por eso pesa más
que su tamaño.

- Reescribir ese párrafo: **fechar la unificación** («desde el 19 de septiembre de 2026») y
  decir que durante la evaluación esos tres flujos no llevaban el criterio.
- Limitar «esa evidencia cubre todas las ejecuciones por construcción» **al canal textual**.
  Vale para seis expresiones regulares, que son deterministas. No vale para un criterio que un
  modelo probabilístico lee dentro de prompts distintos —en el carrusel mezclado con el pedido
  de orden narrativo, en el video con cuatro imágenes—. La identidad del texto no cubre
  ninguna ejecución del canal visual.
- **A8**: retirar «la identidad de criterio entre flujos queda medida sobre un caso». R01 nunca
  recorrió el flujo de imagen única del bot: se evaluó con `run_compliance_vision.mjs`, que
  llama a la API directamente. Los dos términos son *un script* y *el flujo de carrusel*.
  Queda: «demuestra que la detección corre en el carrusel». Y en E.10, retirar «que el flujo de
  imagen única bloquea».
- **M6**: los cuatro casos E.9–E.11 y la regla bloquear/avisar aparecen por primera vez en la
  Discusión. Mover su reporte al §5.1 y dejar en el §5.4 sólo la lectura. Hoy el capítulo de
  resultados no menciona la corrección que él mismo anuncia.

### Pasada 51 — Hacer verificable el extracto · **A3** · toca el sistema

`verificar_patrones_desplegados.mjs` termina sin divergencias, pero el auditor leyó su código:
**para carrusel, video y re-publicación el extracto no trae los prompts**, trae un booleano
`lleva_el_criterio` calculado con `texto.includes(criterio)` sobre un workflow que no se
entrega. Un tercero lee un `true` escrito por nosotros.

- Incluir en `Nodos_compliance_desplegados.json` **el texto completo de los tres prompts** y el
  **código completo** del nodo de firma de HU9 y de la guarda de HU13. Ya está redactado; es
  ampliar el extractor y regenerar. Requiere la instancia arriba (`.\start-n8n.ps1`).
- Cambiar la comprobación de booleano a **comparación carácter por carácter de los cuatro
  prompts**, como ya hace con las seis expresiones.
- Bajar en la Tabla 13 las dos filas de «Configuración» de «Cumple: Sí» a **«verificado en la
  línea de código X, con este alcance»**:
  - la firma de HU9: el script sólo marca como condicionada la línea de concatenación que
    empieza con `if (`. No detecta un bloque condicional de varias líneas, un `return` previo
    ni una rama que publique sin pasar por el nodo. No sostiene «ninguna rama publica sin ella».
  - la guarda de HU13 es `if (dur && dur > 60)`. **Si FFmpeg no devuelve una duración legible
    —el camino frágil que el propio §4.7.3 describe al no haber `ffprobe`— la guarda no se
    dispara.** Es fail-open.
- **Reconciliar los dos inventarios de «cuatro flujos»**, que hoy se pisan: los del canal
  textual son inmediato, carrusel, programado y video; los del visual son imagen, carrusel,
  video y re-publicación. El programado no tiene nodo visual y la re-publicación no tiene nodo
  textual propio. El §2.4 afirma que «ambas capas cubren los cuatro flujos» y enumera los del
  visual.

> **Corrección de sistema propuesta (gobernanza MEDIA — implementar con checkpoint).** Hacer
> la guarda de HU13 *fail-closed*: si la duración no se puede leer, preguntar o abortar en vez
> de seguir. Cierra A3 y de paso el residuo de C-13 (§4.7.3 dice que «ante un video que excede
> con mucho la duración permitida el bot aborta el flujo», y la guarda tiene un solo umbral).
> Son ~10 líneas en el Code node. **Confirmar antes de escribir.**

### Pasada 52 — Podar el §2.4 y el Anexo D a lo que la fuente dice · **A5, M2, M7**

Es la reaparición de C-08, que la primera auditoría marcó y siete instancias no terminaron de
cerrar. El anexo acota con precisión y el marco teórico sigue afirmando sin reservas. Cada
frase de acá se verifica contra el PDF de diez páginas **antes** de escribirla, como en la
pasada 39.

Retirar del §2.4 lo que la fuente no contiene:

- el estándar estético y la «infracción punible». Las Pautas sólo piden usar las imágenes de
  «COMPARTIR» sin modificarlas y pedir permiso escrito para las marcas;
- «el incumplimiento, incluso accidental, de esta directriz infringe el Acuerdo de Consultora».
  La fuente separa las Pautas de los Acuerdos, y reserva «violación seria del Acuerdo» para la
  venta en grupos de intercambio;
- el fundamento de «equidad de mercado / guerra de precios / venta consultiva» con cita
  «(Mary Kay Inc., s.f.)». La fuente da otras dos razones —los términos de las plataformas y la
  respuesta del consumidor—, que son justo las que el §1.1 cita bien. **El trabajo se
  contradice a sí mismo.** Atribuir la equidad de mercado a los autores o a Kotler;
- «resulta legalmente imperativo… responde a un mandato legal», sin fuente;
- «una de las normas de compliance más supervisadas», sin fuente;
- §3.7.4: «las dos reglas del contrato de distribución que el Anexo D transcribe». Las Pautas
  no son el contrato.

En el Anexo D (M2):

- «La fuente es inequívoca respecto del feed, la historia y el álbum público de Instagram» →
  **es una inferencia** desde «no al público en general». Marcarla como tal;
- resolver la contradicción interna: «la síntesis codificada no se aparta de la fuente» dos
  párrafos después de «el sistema es más estricto que la letra»;
- la elicitación con las tres consultoras corrobora la regla (a). Sobre la (b) —la
  obligatoriedad de la firma— **la contradice**, no la corrobora: es una creencia que la fuente
  no sostiene. Decirlo;
- la reserva sobre la página de Facebook («las métricas del §5.1 deben leerse con esa reserva»)
  no está en el §5.1. Llevarla.

Y M7: HU9 dice «para prevenir activamente el fraude por publicidad engañosa» y HU7 «protegiendo
así la equidad de mercado», contra el §3.7.4, que dice que «un detector léxico de precios y un
concatenador de cadenas no previenen la competencia desleal, la publicidad engañosa ni el
fraude marcario». Gana el §3.7.4. Además el §4.6 llama «obligatoria» a la firma y la trunca en
«(Consultora de Belleza Independiente)».

### Pasada 53 — Capacidades que el código desmiente · **M3, M8, A7**

- «correlaciona luego con la proximidad de términos semánticos gatillo, como "oferta", "solo
  por hoy"» (§2.4, HU7). Las seis expresiones son **independientes**, bloquea la primera que
  coincide, no hay proximidad y «solo por hoy» no figura en el set.
- «Todo ello sin latencia perceptible para el usuario final» (§2.3). Medido: **59,7 s de media,
  máximo 143,1 s** (Tabla 11).
- «validado y sellado criptográficamente» (§4.3.2) y «payload criptográficamente validado»
  (§2.3): no existe tal sello.
- «persistidos de manera transaccional», «coherencia referencial» (§4.3.2), «actualiza
  transaccionalmente» (§4.6), «integridad referencial» (HU12, §4.4.2). El §2.3 y la Fig. 5
  niegan las dos propiedades. Cierra A-19.
- §3.7.5: «limitando las frecuencias de programación y evitando ejecuciones masivas». Ningún
  anexo lo documenta: o se documenta o se retira.
- §2.3: «Postly se inscribe teóricamente y de manera práctica en esta tendencia» de servicios
  «orientados a microservicios», cuando el §4.3 ya concluye lo contrario. Cierra A-16.
- **M8**: §1.5.1 «alimentar el motor de sugerencias» y §4.1.5 «transforma telemetría de
  interacción en heurísticas proactivas», contra el §6.1, que declara esa capa no implementada.
  Y el alcance que promete un filtrado del «100 %».
- **A7 · el inventario de privacidad (cierra C-14).** El §3.7.1 dice «la enumeración completa de
  lo que se persiste es la que publica la Figura 5… no se recolecta ninguno ajeno a la ejecución
  del flujo». No es completa. Falta: el historial de ejecuciones de n8n en SQLite, que guarda
  los *updates* completos de Telegram con nombre, apellido e identificador; el *buffer* de
  carrusel en un archivo del servidor (B.5); los identificadores de *callback* de la
  deduplicación (B.6); la hoja de configuración de la firma y el contacto (B.4); y las imágenes
  de las usuarias en **Cloudinary**, cuando el §2.1.a sólo reconoce el video en infraestructura
  externa. Reemplazar por un **inventario real de almacenes con su retención y su protección**.
  Es el único punto del plan que agrega media página; vale la pena, porque es el que un jurado
  con perfil de seguridad mira primero.

### Pasada 54 — El Cap. 4 y el Anexo B al día · **M4, A-39** · cierra la regresión 1

El Anexo B era, según el dictamen anterior, «la parte más exacta» del trabajo. Hoy describe el
sistema de antes del 19-09.

- **B.9**: el video pasa a «(4) se extraen cuatro imágenes —tres instantes del normalizado más
  el encuadre original— y se analizan en una sola llamada», con la detección visual, no sólo el
  fotograma para los copys.
- **B.4**: «imagen, carrusel y video comparten la misma lógica» → sumar la re-publicación y el
  programado. Y corregir «montos escritos en palabras»: llama así a «100 pesos», que es
  justamente la forma que el detector **sí** captura, mientras el §5.1 declara el precio en
  palabras como su límite insalvable. Contradicción directa.
- **§4.5.1 y criterio de HU8**: «si cualquiera de los dos niveles devuelve un valor positivo el
  flujo se interrumpe». Ya no: el flujo de video **avisa sin bloquear** cuando el recorte
  elimina el precio. Documentar la regla bloquear/avisar donde se define, no sólo en el §5.4.
- **§4.7.3**: el caso de cruce con compliance «lo reporta el §5.1» → está en el §5.4 (y con la
  pasada 50 vuelve al §5.1). Y describir el análisis de cuatro imágenes.
- **§1.5.1**: la IA «cubre exclusivamente dos aspectos» (orden del carrusel y copy). Son tres:
  falta la detección visual de precios.
- **A-39 · Cloudinary**: aparece descrito como paso «para el flujo de video», pero las imágenes
  también pasan por ahí (§4.7.2, E.5, E.6). Corregir §4.3.1, §2.1.a y la nota de la Fig. 4.

### Pasada 55 — Remisiones y figuras · **M5, M9, M10, B7, B8, B9, B10**

**Las seis remisiones rotas (M5)** — el hallazgo más barato de todos y el que peor queda:

| Dónde | Dice | Pasa |
|---|---|---|
| §5.1 | control de calidad estética «(§6.2)» | no está en el §6.2 |
| §6.1, OE-4 | «se traslada la capa predictiva a… (§6.2)» | no está |
| §3.3.2 | los criterios de aceptación «(§4.4)» | están en el §4.1 |
| Nota Tabla 9 | la instancia «fue dada de baja (Anexo B.1)» | B.1 no lo dice y describe el servidor en presente |
| E.6 | las salvedades «quedan atendidas en el Anexo E.8» | E.8 repitió 8 de los 9 difíciles y ninguno de los 20 |
| E.8 | «la salvedad que el §5.1 declaraba pendiente» | el §5.1 no la declara pendiente: afirma que «acota» |

**Figuras (M9)** — las dos primeras requieren redibujar, con el mismo camino de
`redibujar_figura4.py` (PIL):

- **Fig. 11**: lleva «(~185 nodos)» dentro de la imagen, mientras el §4.3, B.2, la Fig. 4 y el
  Anexo B dicen ~195. Y su nota interna afirma que el workflow «es idéntico al desplegado»,
  incompatible con 10 nodos de diferencia. Lo más limpio: **recapturar el canvas** de la
  instancia actual y rehacer el rótulo.
- **Fig. 6**: pone la auditoría de la imagen (paso 6) **después** de elegir el tono. La
  implementación la corre **antes** de generar los copys (B.4, Tabla 9 HU8, cadena de E.5).
- **Fig. 3**: su nota dice que «Tomar/editar foto» no computa; el E.2 incluye en la condición
  manual «adapta la imagen al formato de feed».
- **Fig. 1**: funde el canje del código con el paso a token largo y omite el token de página,
  que es con el que se publica.
- **Figs. 12–15**: dicen «Fuente: elaboración propia» siendo capturas, como las 7–10.
- **M10 · Tabla 2**: califica el bloqueo por WAF como «Alta / Alto (suspensión de cuenta)», dos
  párrafos después de que el §2.4 declare ese escenario «conjeturado y no evaluado». Cierra A-37.
- **B7** (la nota de la Tabla 1 usa «**» para dos llamadas distintas), **B8** (el §4.3 llama
  «regular» al modo de n8n; §4.3.3, §5.1 y B.1 lo llaman «single»), **B9** (encabezados de
  capítulo: «CAPÍTULO 1: Introducción» contra «CAPÍTULO 6. CONCLUSIONES»), **B10** (el
  «Refinamiento Heurístico de IA» del §6.2, fuera de la lista y sin prioridad).

Extender `verificar_coherencia.py` para que estas seis remisiones y el recuento de nodos no
vuelvan a divergir.

### Pasada 56 — Los anexos E y lo que el `LEEME` dice y la tesis no · **A9, M14, M1, M11, M15, M16, M13**

El punto más incómodo del dictamen, porque el trabajo tiene «honestidad en los límites» como
fortaleza declarada y acá falta. Verificado: el `LEEME` de `casos_repost/` dice todo lo que
E.11 calla.

- **A9 · E.11**: declarar que la pieza **la compuso el equipo sobre arte oficial de MK Men** y
  que **se publicó a mano en Instagram** con «20 % OFF» y «ARS $4500» para poder ejercitar el
  flujo. Y corregir el E.6, que afirma que «ninguna de estas composiciones se publicó».
  Extender a E.11 la «tensión» que el E.6 ya declara para las composiciones del equipo.
  > El auditor lo dice sin vueltas: es «la conducta que el módulo existe para impedir, sobre
  > arte de marca modificado». Declararlo con su justificación metodológica lo convierte en
  > rigor; callarlo, si lo encuentra la novena, en otra cosa.
- **A9 · E.9**: declarar **quién sobreimprimió las placas** «Promo $59,99» y «PROMO: $59.75».
  Hoy los presenta como «videos que aportó una de las consultoras».
- **A9 · anonimizar** la marca de agua `@DANYGIL_MK`, que es un usuario de Instagram
  identificable, en la misma carpeta de la que se excluyó un fotograma por el rostro.
- **M14**: reportar en el documento el defecto que el caso E.11 destapó —el aviso de bloqueo de
  la re-publicación resolvía a `undefined` y no llegaba: el módulo bloqueaba y **la usuaria no
  se enteraba**—, corregido en `scripts/fix-chatid-avisos.mjs`. HU7 y HU8 exigen el aviso y la
  Tabla 9 da HU12 como «Validado e2e». Va al §5.1 y a la cronología del A.2.
- **M1 · las respuestas crudas del modelo**. `run_compliance_vision.mjs` guarda sólo el
  `detalle`, y con el parseo *fail-open* una respuesta vacía, bloqueada o con prosa delante
  queda registrada como «Publico», igual que un «false» genuino. Dos consecuencias: que V23 sea
  «el límite de resolución del canal» (E.8) es indistinguible de un fallo de formato, y el E.6
  afirma que el archivo trae «la justificación que devolvió para cada caso» cuando **los 13
  negativos lo tienen vacío**. → parchear el script para guardar la respuesta cruda en toda
  corrida futura, y **declarar el límite** en las notas de las Tablas 12 y 14. Lo pasado no se
  recupera.
- **M11**: agregar los Wilson que faltan al canal visual (Recall 10/10 → [0,72; 1,00]; 5/6 →
  [0,44; 0,97]) y bajar «el resultado sí acota la variabilidad del modelo entre corridas» a lo
  que una sola repetición de 8 casos permite — el propio E.8 dice que «dos corridas no
  establecen una distribución».
- **M15 · representatividad**: «2x1» y «3x2» están en «vocabulario comercial sin cifra» y sí
  llevan cifra (2 de los 3 casos de campo de esa categoría); la brecha de F1 sale sobre todo de
  los falsos positivos (3 contra 0), no del caso «indirecto»; y el script y el `LEEME` siguen
  imprimiendo «las métricas son una cota inferior», que el §5.1 ya corrigió.
- **M16 · instrumentos declarados y nunca reportados**: el §3.4.3 dice que «se cuantificó
  mediante logs la tasa de reducción bruta de errores de cumplimiento normativo» y esa cifra no
  aparece en ninguna parte; el §3.4.2 anuncia «Matrices de Casos de Uso» y «Usuarios de Prueba»
  de Meta que ningún anexo muestra. O se reportan o se retiran del §3.4.
- **M13 · inventarios que no cierran**: la nota de la Tabla 9 dice «los tres umbrales que la
  Tabla 13 verifica por medición» y son cuatro; «17 casos… otros tantos verdaderos negativos»
  del canal visual no tiene respaldo en `Compliance_Campo.csv`, que no registra veredicto por
  canal, y esas 17 imágenes no están en `evidencia/`; el E.4 dice «los cuatro análisis» y
  enumera cinco, omitiendo `run_representatividad.mjs` y `run_compliance_vision.mjs`; y la
  cronología del A.2 termina el 18-09 cuando los casos E.9–E.11 se ejecutaron el 19.

### Pasada 57 — Escritura, bibliografía y residuos · **B1–B6, M12, C-03, A-26, A-22**

- **M12 · el criterio de HU2** dice «se reformuló después de medir, porque la vigencia que el
  sistema obtiene resultó mayor». Un criterio de aceptación ajustado al dato pierde su función
  aunque se declare, y la Tabla 13 le da «Cumple: Sí» contra el criterio reescrito. **Requiere
  decisión** (ver §4.7).
- **B2 · «validez interna»** usada como sinónimo de «evaluación en profundidad» en el §3.5.2
  («medir la fricción tecnológica en contextos reales de uso (validez interna)»). Viene del
  dictamen anterior sin resolver. Es validez **ecológica**.
- **B3 · frases rotas** que dejó la reducción de longitud de oración: «Son cuatro.» (Cap. 2),
  «Destacan dos.» (§1.2.c), la pregunta rectora partida en dos, y el §3.5.3 con la lógica
  invertida («Tampoco aplicaría a las variables (a) y (b), ajenas por naturaleza…»).
- **B1**: HU12 y §4.4.2 ponen como objetivo «inyectar variabilidad en el texto para eludir los
  filtros de contenido duplicado (Spam) de Meta», incoherente con el §3.7.5 y con la regla de
  cumplir los términos de cada plataforma que la propia fuente impone. Reformular como
  variación editorial, no como elusión.
- **Terminología del módulo**, unificar: hoy conviven «Módulo Centinela», «Middleware de
  seguridad», «Agente de Auditoría Algorítmica», «filtro de auditoría» y «capa de validación».
- **Registro promocional residual**: «sistema nervioso central», «cerebro de IA», «apéndices de
  salida» (§2.3), «simbiosis tecnológica», «pulcra implementación», «muro de contención»,
  «grado corporativo».
- **B6 · APA 7**: marcadores de edición en dos idiomas («6ta ed.» junto a «3rd ed.»); «Versión
  preprint:», «Artículo» y «En» mezclados con inglés; Zhao sin [Preprint] que Yao sí lleva;
  Vaswani sin URL; capítulos sin editores (Garlan y Shaw, Vigna); literatura gris sin URL
  (MuleSoft, Michelson, Richardson y Rymer, Shoup, Cavoukian); tres títulos sin cursiva (Mary
  Kay Inc., OWASP, Wake); title case en Crockford y Vigna (cierra A-33); y **las citas literales
  de las Pautas en el Anexo D y el E.6 sin localizador de página**, que APA 7 exige.
- **B5 · Beales et al. (1981)** sostiene «un pilar para el libre ejercicio de la venta directa»
  y el artículo trata de la regulación de la información al consumidor en general.
- **C-03 · las «decenas de horas mensuales»** del §1.2.a no salen del dato medido: 9,4 min × una
  publicación diaria ≈ **4,7 h/mes**. Derivarlo del dato propio, que además es una cifra
  defendible.
- **A-26 · el estado del arte** sin protocolo de selección, cosa que el propio §5.4 admite.
  Agregar dos líneas de criterio y fecha de corte.
- **A-22 · tres umbrales sin verificar** (HU2, HU4, HU12) y el «tono semántico esperado» de HU6
  sin umbral.

---

## 4. Lo que necesita a Nico

Siete cosas. Las tres primeras bloquean la pasada 56; la sexta, la 51.

1. **¿Se retiró de Instagram la pieza de prueba con «20 % OFF / ARS $4500»?** ¿Cuándo? La
   respuesta va al E.11 tal cual sea. Si sigue publicada, conviene bajarla antes de escribirlo.
2. **¿Quién sobreimprimió las placas de precio de los dos videos de E.9?** (equipo o consultora).
3. **La marca de agua `@DANYGIL_MK`**: ¿se anonimiza la imagen entregada, o se pide permiso a la
   consultora y se declara? Hay que rehacer el archivo de `evidencia/casos_video/` en cualquier
   caso.
4. **Las fechas de cada medición contra la cuota de Gemini.** El auditor no lo levantó como
   hallazgo pero lo dejó anotado como duda, y **la novena lo va a levantar**: el A.2 ubica la
   validación entre el 14 y el 18-09, y E.5/E.8 declaran un tope de 20 peticiones diarias
   compartido. Lo declarado suma más de cien inferencias. ¿Hubo varias claves, un nivel pago, o
   mediciones anteriores al 14? Con la respuesta se fecha cada medición en el A.2 y la duda
   desaparece.
5. **La autoría de las 15 piezas «limpias» de campo.** Cierran con
   «-- Consultora de Belleza Independiente Mary Kay --» y una batería de *hashtags*, el mismo
   formato que el sistema agrega. El trabajo dice que las redactaron las consultoras. Si el
   formato se les dio como plantilla, hay que decirlo.
6. **La guarda de HU13 fail-closed** (pasada 51): son ~10 líneas en el Code node, pero es
   comportamiento de publicación. ¿Se toca el sistema o se declara la limitación y listo?
7. **El criterio de HU2** (M12): dos caminos. (a) **Restituir el criterio original** y reportar
   HU2 como no verificada, declarando que lo medido es la ausencia del campo de expiración y no
   la longevidad del token — es lo que el §6.1 ya dice. (b) Dejar la reformulación y marcar HU2
   «no verificado» en la Tabla 13. **Recomiendo (a)**: es una línea más de texto y desarma una
   regresión que el auditor calificó de pérdida de función.

Y lo de siempre: **refrescar los campos en Word (Ctrl+E, F9)** después de cada bloque de
pasadas, porque cambian los tres índices.

---

## 5. Lo que no se cierra en el documento

| Qué | Por qué | Qué se hace |
|---|---|---|
| Confirmar la hipótesis | Pide ≈ 24 sujetos con orden contrabalanceado | Declararlo dimensionado en el §6.2 (pasada 49) |
| Las respuestas crudas de las corridas pasadas | No se guardaron y no se recuperan | Parchear el script para el futuro y declarar el límite (M1) |
| Las 17 imágenes del estudio de campo | No están en `evidencia/` | Incluirlas o declarar por qué no (privacidad) |
| La identidad extracto ↔ workflow desplegado | El workflow no acompaña a la evidencia | La pasada 51 la reduce a su mínimo; el E.4 ya declara que la cadena no cierra |
| Yao et al. (2025) | La paráfrasis no se pudo confirmar | Releer la obra o ablandar la atribución |

---

## 6. Orden de ejecución

```
48 (A1)  →  49 (conclusiones)  →  50 (cronología)      ← el núcleo del dictamen
    │
    ├─ 51 (extracto) ── necesita n8n arriba y la decisión 6
    ├─ 52 (norma) ──── verificar cada frase contra el PDF antes de escribirla
    ├─ 53 (capacidades)  ·  54 (Cap. 4 + Anexo B)  ·  55 (remisiones y figuras)
    │
    ├─ 56 (anexos E) ── necesita las decisiones 1, 2 y 3
    │
    └─ 57 (escritura y bibliografía) ── última, porque toca texto que las otras mueven
```

Las 48–50 son el grueso de lo que el dictamen descuenta y se pueden hacer hoy, sin depender de
nada. Las 52–55 son largas pero mecánicas. La 56 es la que espera a Nico.

---

## 7. Criterio de cierre

Antes de considerar el plan terminado:

1. `python verificar_documento.py` — sumar como frases prohibidas: «se considera confirmada»,
   «destinado al canal público», «durante toda la evaluación», «queda medida sobre un caso»,
   «infracción punible», «infringe el Acuerdo», «mandato legal», «sin latencia perceptible»,
   «sellado criptográficamente», «integridad referencial», «motor de sugerencias», «14 de 14».
2. `python verificar_coherencia.py` — sin remisiones huérfanas y con un solo valor para el
   recuento de nodos.
3. `node verificar_patrones_desplegados.mjs` — con la comparación de prompts, no de booleanos.
4. **Una pasada propia de coherencia** antes de cualquier novena auditoría. Las pasadas 35–38
   encontraron catorce cosas y la 43 encontró una del día anterior. Este plan mueve texto en el
   Cap. 4, el Cap. 5 y los anexos a la vez: va a dejar desfasajes.
5. Recuento de páginas. El saldo debería ser cercano a cero: la 52, la 53 y la 57 restan; la 48
   y el inventario de almacenes de la 53 suman.

---

## 8. Sobre la novena

El gate del profesor sigue siendo demostrar >9, y ninguna instancia pasó de 7,6. Vale la pena
mirar el patrón: cada auditoría cierra la lista anterior y trae cosecha nueva, y la octava
—que reauditó todo de cero contra la rúbrica más larga— encontró **cero críticos y cero
discrepancias numéricas**. Lo que descuenta hoy es rótulo, remisión e inventario: exactamente
lo que este plan arregla. Una novena con el dictamen 8 como rúbrica, después de las diez
pasadas, es la primera que puede subir de verdad.

La carpeta se arma copiando el `.docx`, `evidencia/`, `md_a_pdf.py` y un enunciado nuevo, y
**la sesión se abre fuera de `C:\dev\Tesis`** o hereda el `CLAUDE.md` y deja de ser
independiente.
