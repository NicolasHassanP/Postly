# Plan de remediación — décima auditoría (dictamen 10, 6,2/10)

## ESTADO — los siete altos, APLICADOS (19-09-2026)

Decisiones de Nico: **D1 = corregir el sistema + bajar la afirmación · D2 = depósito con DOI ·
D3 = sí al capítulo de Arquitectura · D4 = declarar y acotar.**

| Pasada | Cubre | Resultado |
|---|---|---|
| — | **V1** | Los 4 prompts **sí** imponían el CTA (regla 4 idéntica en los cuatro). El §5.4 decía la verdad; la que estaba mal era la Figura 14 |
| — | **V2** | El umbral de HU12 **sí** estaba medido: `B1b_desglose.csv`, columna `Generacion_copys_s`. 31,2 s de media, 2 de 9 bajo 15 s |
| — | **V4** | El documento citaba **`patterns.mjs`, que no existe**; el archivo real es `fix-compliance-patterns.mjs` (queda para la pasada 89) |
| **72** | **N-01** | Dos entornos con nombre (E1 servidor propio, E2 instancia local) en el B.1, y cada cifra, captura y batería rotulada con el suyo. Retirada la comparación de los 654 MB contra los 2 GB |
| **73** | **N-02, M-08** | **Sistema corregido y desplegado**: `scripts/fix-cta-mensaje-comercial.mjs` invierte la regla 4 en los cuatro prompts. **Medido: 15/15 opciones con solicitud de contacto antes, 0/15 después** (Anexo E.12 nuevo). Resumen, §1.3.c, §6.1 y OE3 alineados. La Figura 14 pasa de contradicción a evidencia |
| **74** | **N-03** | Retirado «alcance idéntico»; amenaza declarada en §5.1 y §3.5.5; **cota medida: la reducción cruza el 70 % si la adaptación insumiera más de 65 s por publicación**, y la significación sobrevive a todo el rango |
| **75 · 75b** | **N-04** | HU12 con un solo estado: medido e incumplido. La columna de la Tabla 9 pasa a «Recorrido funcional: Ejecutado completo». Recuentos corridos de 7/4 a 8/3 |
| **76** | **N-05** | Vigna et al. (2003) retirada del texto y de la lista; la afirmación queda atribuida a la Tabla 2, que es de donde viene |
| **77** | **N-06** | Las remisiones falsas corregidas; **los 12 pares cronometrados y las 3 filas del TAM transcritos en el PDF**; el resto al depósito. Parte de C-08, de paso |
| **78** | **N-07, B-15/16/17** | Bucher y Cotter reemplazados por la documentación de Meta; Hashmi, Baltrušaitis y Chandy retirados de donde no corresponden y conservados donde sí |

**Lo único que queda de los altos es de Nico:** el depósito. El texto lleva el marcador
`[DOI-PENDIENTE]` y `verificar_documento.py` lo declara punto abierto, de modo que el
documento no puede entregarse con el marcador puesto. El paquete está armado en
`avance/evidencia/` (`armar_evidencia.py --verificar` cierra limpio).

**Verificadores:** `verificar_documento.py` (1 punto abierto, el DOI, a propósito),
`verificar_coherencia.py` y `verificar_patrones_desplegados.mjs` limpios. Métricas de
escritura sin empeorar: 0 oraciones de más de 50 palabras, 5 párrafos de más de 250.

**Sigue:** pasadas 79 a 92 (los 19 medios, los 27 bajos, el arrastre y el largo), con el
capítulo de Arquitectura (D3) en la 85.

---


> Dictamen: `C:\dev\auditoria-postly-10\auditoria-postly-10-20260919T184313Z-1-001\auditoria-postly-10\dictamen-auditoria-10.md`
> Documento vivo: `avance/Tesis Postly Bontorno Hassan-1 v2.docx` (el PDF auditado salió de ahí, 19-09 15:12).
> Este archivo dice qué hay que arreglar, en qué orden, qué decide Nico y qué no se cierra sin volver al campo.

---

## 0. Qué significa este dictamen

**Es el primero en condiciones reales del tribunal**: sólo el PDF, sin acceso al repo, sin la
evidencia complementaria, y con el **dictamen original (4,4/10) como rúbrica** — no con el noveno.
Por eso la nota baja de 6,9 a 6,2 sin que el documento haya empeorado: cambió el evaluador y
cambió la superficie evaluable. Las instancias que dieron 8,3–8,4 tenían acceso a todo.

Lo que confirma:

- **0 críticos.** De los 41 críticos y altos del dictamen original: **36 resueltos, 5 parciales,
  0 sin resolver.** El trabajo de las 71 pasadas se sostiene.
- **El dictamen lo declara defendible** («Aprobada con observaciones mayores») y descarta
  explícitamente «requiere revisión profunda»: la evidencia existe y está bien analizada.
- Los 53 hallazgos nuevos (7 altos · 19 medios · 27 bajos) son, en palabras del propio dictamen,
  **de rotulado, de alcance de lo afirmado, de coherencia y de acceso al material**. Ninguno pide
  volver al laboratorio.

Lo que descubre, y es nuevo:

1. **El crecimiento produce contradicciones.** Las seis contradicciones cuerpo↔anexo del dictamen
   original están cerradas, y el crecimiento generó **al menos diez nuevas**. Es el patrón que ya
   vimos en la sexta: una corrección puntual deja la misma afirmación viva en otros apartados.
2. **El registro promocional se fue y llegó uno defensivo.** 105 aperturas «Corresponde…» /
   «Conviene…» contadas sobre el `.docx` (59 + 46), más referencias al propio proceso de revisión.
3. **La estructura sigue sin cumplir el instrumento.** No hay capítulo de Arquitectura e Interfaz;
   la Discusión es una sección; el §5.1 concentra 19 páginas sin subdividir; hay **dos índices de
   contenido**. Es lo mismo que la memoria del Prompt Maestro ya anticipaba.
4. **La evidencia caso por caso no viaja con el PDF** (N-06), y encima el §5.1 dice que está en el
   Anexo E y no está. Este es el hallazgo con más palanca: cierra N-06 y buena parte de C-08, y
   la carpeta ya existe armada en `avance/evidencia/` (41 archivos, 12 scripts, los CSV y las
   carpetas de casos).

---

## 1. Verificaciones previas (antes de tocar nada)

Cuatro hallazgos altos afirman cosas sobre el **sistema**, no sobre el texto. Hay que comprobarlas
contra el código desplegado antes de decidir si se corrige el texto o se corrige el sistema.

| # | Qué verificar | Cómo | Decide |
|---|---|---|---|
| V1 | ¿Los 4 prompts obligan la invitación a contactar en **las tres** opciones? | `node avance/verificar_patrones_desplegados.mjs` y lectura de los 4 prompts | N-02 y M-08. La Figura 14 muestra una «Informativa» **sin** invitación: o la figura es vieja, o el §5.4 afirma de más |
| V2 | ¿Qué mide exactamente la HU12 y qué dice el dato? | §4.1.4 (13,6–84,9 s; 2 de 9 bajo el umbral) contra `avance/Baterias_resultados.csv` | N-04: cuál de los tres estados es el verdadero |
| V3 | ¿El umbral de 3 s de HU1 está medido dos veces? | Tabla 11 (1,85 s, n=10) contra Tabla 13 (0,923 s, n=20), `run_baterias.mjs` y `run_umbrales.mjs` | B-13: si miden cosas distintas, hay que decir cuál es cuál |
| V4 | El nombre de los scripts citados | Ya verificado: el documento cita **`patterns.mjs`, que no existe**. El archivo real es `fix-compliance-patterns.mjs`. `run_umbrales.mjs` sí existe, en `avance/evidencia/` | B-23, y es crítico si la evidencia se deposita: un script citado que no está en el paquete es exactamente lo que el tribunal va a buscar |

Son minutos, y sin ellos dos de los siete altos se corrigen a ciegas.

---

## 2. Decisiones que son de Nico

Cuatro. Ninguna la puedo tomar yo porque cambian el alcance del trabajo, no su redacción.

### D1 — N-02: ¿se corrige el sistema o se baja la afirmación?

El generador impone en cada copy una invitación a contactar que la fuente normativa define como
**mensaje comercial**. O sea: el módulo que se vende como diferencial convive con un generador que
produce la infracción. El dictamen da dos caminos:

- **(a) Corregir el sistema.** Retirar el llamado a la acción de la ruta de Instagram (es la
  recomendación 3 del propio §6.2), redesplegar y **re-ejecutar el corpus de campo de 29 piezas**
  con `run_compliance_field.mjs`. El dictamen dice textualmente que es barato y que **no invalida
  las Tablas 3–5**. Es la respuesta fuerte: convierte un hallazgo alto en una fortaleza («lo
  detectamos y lo arreglamos»).
- **(b) Bajar la afirmación.** Reformular Resumen, §1.3.c, apertura del §6.1 y conclusión del OE3
  para que el cumplimiento se declare **acotado a la referencia monetaria**. Es honesto y es
  gratis, pero deja al tribunal la pregunta «¿y por qué no lo corrigieron?».

**Recomiendo (a) + (b).** El (b) hay que hacerlo igual, porque aun sin la invitación quedan las
otras tres fricciones del Anexo D: Instagram no es página de negocios admitida por la fuente; la
normalización y la re-publicación modifican material de marca; y el permiso marcario no se relevó.

### D2 — N-06: ¿dónde vive la evidencia?

Unos 20 archivos «se entregan como material complementario» y la entrega es **sólo el PDF**.

- **(a) Depósito con identificador persistente** (Zenodo u OSF): se sube `avance/evidencia/`, sale
  un DOI, y el §5.1 y el Anexo E citan ese DOI. Cierra N-06, mejora C-08 y **no suma una sola
  página**. La carpeta ya está armada por `armar_evidencia.py`.
- **(b) Transcribir en el Anexo E** los 80 casos controlados, los 29 de campo, los 12 pares
  cronometrados y las 3 filas del TAM. Cierra N-06 y **suma entre 15 y 25 páginas** a un documento
  que ya mide 175 contra ~120 pedidas.

**Recomiendo (a)**, y además (b) *parcial*: sólo los 12 pares cronometrados y las 3 filas del TAM,
que son tablas chicas y sostienen la hipótesis, que es lo primero que el tribunal va a mirar.

Dos cuidados con (a): el repo es público y expone ngrok + `webhookId` — al depósito va la
**carpeta de evidencia**, nunca el repo; y `evidencia/` contiene el PDF de las Pautas Mary Kay,
que es material de terceros (ver C-08 en §6).

### D3 — M-14: ¿se crea el capítulo de Arquitectura?

El instrumento del profesor exige diez capítulos y uno es «Arquitectura e Interfaz de
Visualización». El documento tiene ocho. Este dictamen lo evaluó como equivalente funcional y **no
le asignó peso**, así que no cuesta nota *acá*; pero la memoria del Prompt Maestro dice que el
profesor le puso **2,8** cuando lo evaluó como capítulo faltante.

- **Costo medido:** promover §4.3 + §4.4 + §4.6 a capítulo propio obliga a renumerar Cap. 5→6,
  6→7, 7→8, 8→9. En el `.docx` hay **241 referencias «§x.y»**, de las cuales **162 apuntan a los
  capítulos 4, 5 y 6**. Es mecánico y scriptable, y `verificar_documento.py` comprueba que toda
  referencia resuelva, así que el riesgo es controlable — pero es la pasada más delicada del plan.
- **Costo cero en páginas:** se mueve contenido existente, no se escribe nada nuevo.

**Recomiendo hacerlo**, en una pasada aislada, con backup y verificador antes y después.

### D4 — N-03: ¿se re-cronometra?

La condición manual incluye adaptar la imagen al formato de feed, y Postly no adapta imágenes. El
73,6 % puede venir en parte de una subtarea que el sistema no ejecuta, y el margen contra el
umbral del 70 % es de **3,6 puntos**.

- **(a) Declarar la amenaza** en §5.1 y §3.5.5, y retirar «alcance idéntico». Es lo que el dictamen
  pide como mínimo.
- **(b) Análisis de sensibilidad sobre los datos que ya existen**: acotar cuánto dura la adaptación
  y recomputar el porcentaje en el peor caso, sobre los 12 pares de `Cronometraje_datos.csv`. No
  necesita campo ni consultoras — es aritmética más una cota superior de la subtarea.
- **(c) Re-cronometrar** con tarea equivalente. Necesita a las tres consultoras otra vez.

**Recomiendo (a) + (b).** El (b) es la diferencia entre «declaramos una amenaza» y «acotamos su
efecto y la conclusión se sostiene igual», y no cuesta trabajo de campo.

---

## 3. Bloque A — los siete altos (pasadas 72 a 78)

| Pasada | ID | Qué hace | Depende de |
|---|---|---|---|
| **72** | **N-01** | Nombrar los dos entornos de medición (**E1**: VPS DonWeb, 2 vCPU / 2 GB, jun–jul; **E2**: instancia local + túnel, sept.) en una nota del §3.4.3 y de la Tabla 11, y **etiquetar cada medición con el suyo**. Barrer las **40 apariciones de «producción»** y las **12 de «instancia desplegada»** del Cap. 5, Tablas 11 y 13, Anexo E y pies de las Figuras 12–15. **Retirar la comparación de los 654 MB contra los 2 GB del VPS** —se midió en E2 y el servidor era E1— o rehacerla contra la máquina real. Poner en pasado el despliegue en §5.3, §6.1, §6.2 y Resumen | — |
| **73** | **N-02, M-08** | Según D1. Si (a): retirar el CTA de la ruta IG en los 4 prompts, redesplegar, re-ejecutar el corpus de campo y actualizar §5.4, Anexo D y Tablas 3–5. Si (b): reformular Resumen, §1.3.c, apertura del §6.1 y OE3 a «cumplimiento acotado a la referencia monetaria». **En ambos casos**: conciliar la Figura 14 con el §5.4 | V1, D1 |
| **74** | **N-03** | Retirar «el alcance … fue idéntico en ambos flujos» del §5.1. Párrafo de amenaza en §5.1 y §3.5.5. Si D4 = (b), tabla de sensibilidad con el porcentaje recomputado en el peor caso | D4 |
| **75** | **N-04** | Un solo estado para la HU12, el que diga la evidencia (previsiblemente *medido e incumplido*), unificado en §4.1.4, Tabla 9, Tabla 13, §5.3 y §6.2. **Renombrar la columna de la Tabla 9** a «recorrido funcional ejecutado», que es lo que esa columna mide de verdad para las 14 HU. Revisar que el §5.3 no siga diciendo «14 HU validadas» | V2 |
| **76** | **N-05** | Sustituir Vigna, Kruegel y Kemmerer (2003) por **Kruegel, C. & Vigna, G. (2003), *Anomaly detection of web-based attacks*, CCS '03, pp. 251–261** si el §2.4 lo sostiene, o por la fuente realmente consultada | — |
| **77** | **N-06** | Según D2. Corregir la remisión falsa del §5.1 («el detalle caso por caso se presenta en el Anexo E»). Si (a): frase de depósito con DOI en §5.1, §3.6 y Anexo E.1.1. Si (b): transcribir los casos | D2 |
| **78** | **N-07** | Sustituir Bucher (2012) y Cotter (2019) por **documentación de Meta sobre especificaciones de Reels y feed**; Hashmi et al. (2018) por literatura de evaluación de clasificadores; **retirar** la frase que atribuye a Baltrušaitis et al. (2019) el comportamiento de Gemini. Arrastra B-15 (Gómez), B-16 (Wang es un *survey*, no una revisión sistemática) y B-17 (Chandy citado junto a una latencia de 2026): misma familia, se hacen acá | — |

---

## 4. Bloque B — los diecinueve medios (pasadas 79 a 86)

| Pasada | IDs | Qué hace |
|---|---|---|
| **79** | **M-02, M-03, M-04** | **Una sola descripción del flujo de creación.** Hoy hay cuatro: §4.3.2, §4.6 Fase 1, Figura 3 y (Figura 6 + §4.4.1 + B.4). Se adopta la del par Figura 6 / B.4 —auditoría visual *antes* de generar, textual sobre el texto final— y se reescriben las otras tres. Conciliar el texto del §4.3 con la Figura 4: el bot y la persistencia quedan **fuera** de la frontera. Declarar **Cloudinary también para imágenes** en §4.3.1 y en la Figura 4. Corregir la Figura 6: **dos** llamadas a Gemini, no una |
| **80** | **M-01** | Un solo inventario de símbolos monetarios. Hoy el §2.4 dice «$, AR$, U$S, €, £», el §4.5.1 dice «$, ARS, USD» y el B.4 dice «$, U$S, ARS, €, £». **Transcribir literalmente las seis expresiones regulares en el B.4** —hoy las parafrasea en familias— y alinear los otros dos con el código desplegado |
| **81** | **M-05, M-06, M-09** | Tabla 5: panel A con **n = 29** (VN = 17), o justificar la exclusión de las dos piezas **en la tabla misma** y no sólo en el Anexo D. Corregir el E.1.1, que dice que el §5.1 «concluye que el conjunto resulta algo más adverso» cuando el §5.1 concluye lo contrario (Fisher p = 1,0, «tampoco indica una dirección»). Llevar al §5.1 —donde se reporta el 1,00 de la Tabla 12— la salvedad de que **un negativo del canal visual no se distingue de un fallo de parseo** *fail-open* |
| **82** | **M-07, M-10, M-19** | Retirar «procesamiento de lenguaje natural» del §1.5.1: el canal textual es **sólo léxico**, como dicen el §5.1 y el §6.2. Terminología: «almacenamiento tabular» en vez de «base de datos» (18 apariciones) y «Cloud Database» (3); **un solo nombre** para el identificador de usuaria, hoy «UUID» / «Chat ID» / «ID del usuario de Telegram». Dejar explícito en §3.7.1 que el historial de n8n guarda *updates* completos de Telegram **sin política de retención**, como debilidad de privacidad declarada y no corregida |
| **83** | **M-11** | APA de la lista: cursivas mal asignadas en **8 entradas** (Baltrušaitis, Beales, Hashmi, Kaplan y Haenlein, Gómez, Pautasso, Chen, Hong) — la cursiva va en la revista o el volumen, no en el título del artículo. Unificar «In»/«En» y «3rd ed.»/«6.ª ed.». URL en la literatura gris (Shoup, MuleSoft, Michelson, Richardson y Rymer) y en Cavoukian. «APA (7ma edición)» → «7.ª». Metadatos: **Google AI 2024 → 2025 o s.f. + fecha de consulta**; **Cole et al. (2005) es 1.ª ed.**, la 2.ª es de 2009; **Larsen et al. (2025)** sin editores ni volumen de LNCS; Meta / Telegram / n8n / Google → «s.f.» con fecha de consulta |
| **84** | **M-12, M-13, M-18** | Apartado de **ética de investigación**: consentimiento verbal, publicación efectiva de la pieza de E.11, uso de material de marca y la ausencia de instancia institucional de revisión. Declarar en §3.5.5 la **superposición de roles**: las tres consultoras enunciaron las reglas, aportaron el corpus, lo etiquetaron y fueron cronometradas y encuestadas — cuatro papeles, tratados como amenaza **conjunta** y no por separado. Dar técnica de análisis al relevamiento del §3.4.1 y vincularlo con la elicitación del Anexo D |
| **85** | **M-14** | Según D3. **Subdividir el §5.1** en apartados numerados (compliance · baterías · umbrales · cronometraje · TAM): 19 páginas sin subdivisión son indefendibles. **Suprimir el índice duplicado** («Tabla de contenido» pp. 2–5 e «Índice de contenidos» pp. 5–9). Si D3 = sí: promover Arquitectura a capítulo y renumerar |
| **86** | **M-15, M-16, M-17** | Retirar de los objetivos específicos toda **remisión a resultados** (OE2, OE3, OE5) y podar el OE3, que pasa de 180 palabras. Sacar del §2.4 el detalle de implementación —cuántos nodos aloja cada canal—: es marco teórico. **Reducir en dos tercios las 105 aperturas «Corresponde…» / «Conviene…»**: cada salvedad se dice una vez, donde rige, y se remite desde el resto. **Eliminar las referencias al proceso de revisión**: «que este trabajo no citaba», «versiones anteriores de este trabajo», «Hasta el 19 de septiembre traía…», «La quinta se llamaba…», «El tiempo verbal es deliberado» |

---

## 5. Bloque C — los veintisiete bajos (pasadas 87 a 90)

Se agrupan por naturaleza, no por número.

**Pasada 87 — contradicciones puntuales del cuerpo**
`B-05` el §3.4.2 dice que los datos «no provinieron de encuestas» y el §3.4.3 aplica un TAM ·
`B-06` «Validez de conclusión» rotula un sesgo de medición, y «la muestra proyectada (mínimo 3
consultoras)» conserva el futuro · `B-07` la variable (c) es «cualitativa/actitudinal» en §3.5.4 y
«instrumento cuantitativo actitudinal» en §3.5.3 · `B-08` la lista de pasos del §4.4.1 omite al
Centinela · `B-09` la Figura 2 pasa Pendiente → Programado y el criterio 2 de la HU10 registra
«Pendiente» · `B-10` el §4.4.2 dice que los binarios están «alojados en la base de datos» y están
en Cloudinary · `B-12` el §5.1 dice que las baterías de OAuth cumplen su umbral y la Tabla 13 da el
de la HU2 por no verificado · `B-13` el umbral de 3 s de la HU1 medido dos veces con resultados
distintos · `B-18` la Tabla 11 rotula «refresco a token de larga duración» un canje único ·
`B-20` modo «single» (§4.3.3) contra «regular» (§4.3, §5.1, B.1).

**Pasada 88 — encabezados, aperturas y residuos de registro**
`B-01` la pregunta rectora abre con «¿» y cierra con punto · `B-02` el Resumen tiene **496
palabras** (medidas sobre el `.docx`) y hay que llevarlo a ≤ 250 · `B-03` «firma legal exigida»
dos párrafos después de declarar que la norma no la exige para el feed propio · `B-04` el *non
sequitur* de la p. 44: la consistencia de la firma la da la concatenación por código, no la hoja
centralizada · `B-11` el encabezado «Control Determinista de Duración **y Peso**» del §4.7.3 no
describe ningún control de peso · `B-14` la apertura del Cap. 5 dice que la evaluación DSR «no debe
confundirse» con el contraste de hipótesis, y el capítulo hace exactamente eso · `B-21` el párrafo
sobre qué respalda la medición está en la recomendación 3 y pertenece a la 2, y las
«Recomendaciones Priorizadas» no están ordenadas por prioridad (la 6 es Baja y la 7 es Media) ·
residuos promocionales: «rudimentario ERP», «democratiza la auditoría», «la consultora
empoderada», «nivel de sofisticación técnica», «referentes indiscutidos», «escenario catastrófico».

**Pasada 89 — los anexos**
`B-22` el E.11 enumera tres vías por las que una pieza infractora llega a la agenda y después dice
que «la única vía … es la que se usó» · `B-23` el inventario de scripts del E.4 anuncia diez, nombra
nueve, y entre el E.5, el E.7 y el E.6 (`armar_casos_imagen.py`) suman **doce**; además el
documento cita **`patterns.mjs`, que no existe** — el archivo real es `fix-compliance-patterns.mjs`
(ver V4) · `B-24` el E.7 dice que los umbrales de HU9 y HU13 no vienen de un criterio de
aceptación, y la HU13 fija los 60 s (§4.1.5) y la HU9 el «100 % de las ejecuciones» · `B-25` el E.2
dice «Producto y Orden» donde la columna es «Tipo» · `B-27` «el evaluador externo» / «ambas
evaluadoras»: concordancia de género.

**Pasada 90 — forma de tablas y figuras (`B-19`, `B-26`)**
Títulos de figura separados de la imagen por salto de página (Figuras 3, 4, 9, 11, 12, 15) ·
columnas de la Tabla 1 tan angostas que cortan palabras («Herramient/a», «Programaci/ón») ·
numeración de tablas que no sigue el orden de primera mención (la Tabla 11 se cita en la p. 37 y la
13 en la p. 68, antes que la 3) · tablas de los anexos sin la letra del anexo (Tabla E1, no Tabla
12) · notas de tabla enteras en cursiva, cuando APA sólo pone en cursiva «*Nota.*» · la Figura 11
repite su título dentro de la imagen, es ilegible a la escala publicada y rotula «~185 nodos»
mientras su nota dice «~195» · subtítulos sin tilde en las Figuras 7, 10 y 11 («Autorizacion»,
«Menu», «Publicacion», «metricas») · la Figura 5 omite la hoja **Config** que el §3.7.1 y el B.4
describen como parte de la persistencia.

---

## 6. Bloque D — lo que arrastra del dictamen original (pasada 91)

Cinco parciales y cinco no resueltos que el dictamen 10 vuelve a contar:

| ID | Qué queda | Acción |
|---|---|---|
| **C-03** | La línea base de 15–30 min sigue sin instrumento | Mantenerla como estimación declarada; **ya no sostiene la hipótesis**, porque el tramo manual se cronometró en 9,4 min. Basta con que el §1.2.a lo diga y que el dato no vuelva a usarse como evidencia |
| **C-08** | La fuente normativa no se entrega, no tiene fecha ni versión | Fecharla y versionarla en el Anexo D. Si D2 = (a), va al depósito **sólo si la licencia lo permite**; si no, se cita con fecha de consulta y se deja constancia de por qué no se redistribuye |
| **C-15** | Mediana bibliográfica 2013; 18,3 % de los últimos tres años | Sumar 6–8 arbitrados de 2024–2026 en compliance automatizado y evaluación de clasificadores. Se solapa con N-07, que necesita fuentes nuevas igual |
| **A-39** | Cloudinary sólo para video | Cerrado en la pasada 79 (M-04) |
| **A-40** | El §3.6.1 repite la caracterización de n8n del §2.1 | Podar el §3.6.1 y dejar sólo la justificación de la selección |
| — | El pasaje de scraping sigue mal ubicado en el §2.4 | Pasada 86 (M-16) |
| — | Shoup, MuleSoft y Michelson sin URL | Pasada 83 (M-11) |
| — | «3rd ed.» junto a «6.ª ed.», «In» junto a «En» | Pasada 83 (M-11) |
| — | El compliance se explica en §1.5.1, §2.4, §4.1.3, §4.5, §5.1 y B.4 | Pasada 86 (M-17): una vez, y remisiones |
| — | Falta la matriz de trazabilidad **OE → HU → criterio → evidencia → sección** | **Tabla nueva.** El dictamen la pide desde la segunda instancia y las Tablas 9 y 13 sólo la cubren en parte, porque ninguna vincula los objetivos específicos. Es una tabla, no un capítulo |

---

## 7. Bloque E — el largo (pasada 92, al final)

175 páginas contra ~120 pedidas. Este plan **quita** páginas (M-17: dos tercios de 105 salvedades;
M-15: el OE3; A-40: el §3.6.1; el índice duplicado) y **suma** pocas (la amenaza de N-03, la ética
de M-12, la matriz de trazabilidad). Si D2 = (b), suma 15–25 y el balance se rompe: otra razón
para el DOI.

Medir al cierre con `medir_escritura.py` y `medir_registro.py`. Si sigue largo, cortar donde la
grasa está desde la séptima: el **Capítulo 4**, que es descriptivo y no aporta dato. Nunca el
Cap. 5 ni los anexos.

---

## 8. Orden de ejecución

```
V1 V2 V3 V4        ← verificaciones, minutos
   │
   ▼
D1 D2 D3 D4        ← decisiones de Nico
   │
   ▼
72 · 76 · 78       ← altos que no dependen de nadie: entorno, Vigna, misatribuciones
   │
   ▼
73 · 74 · 75 · 77  ← altos que dependen de V/D
   │
   ▼
79 … 86            ← los medios
   │
   ▼
87 … 90            ← los bajos
   │
   ▼
91 · 92            ← arrastre del dictamen original y el largo
   │
   ▼
verificar_documento.py · verificar_coherencia.py · verificar_remisiones.py
verificar_patrones_desplegados.mjs · medir_escritura.py · medir_registro.py
   │
   ▼
Nico: refrescar campos en Word (Ctrl+E, F9) → exportar PDF → depositar
```

**Regla, de las siete auditorías anteriores:** cada pasada suma a `verificar_documento.py` una
frase prohibida por cada afirmación que retira. Si una vuelve, el verificador lo dice. Y ninguna
pasada se da por buena sin correr los tres verificadores.

**Regla nueva, por la debilidad 4 del §13.3 del dictamen:** toda corrección que toque una
afirmación se busca en **todo** el documento antes de darse por cerrada. Diez de las
contradicciones nuevas nacieron de corregir en un lugar y no en los otros tres.

---

## 9. Qué no cierra este plan

- **La nota.** El gate es demostrar > 9 y este dictamen da 6,2 con la rúbrica del original.
  Aplicar los 53 puntos sube la coherencia y el rotulado; no cambia la mediana bibliográfica de
  2013, ni el n = 3 de la muestra, ni el hecho de que las participantes son conocidas de los
  autores. Esos techos son estructurales del trabajo, no de su redacción.
- **N-03 sin campo.** Con D4 = (a)+(b) la conclusión se sostiene con una amenaza declarada y
  acotada; no queda *demostrada* sin re-cronometrar.
- **C-08 completo.** Si la licencia de las Pautas no permite redistribuirlas, la fuente seguirá sin
  ser recuperable por el lector. Se puede declarar; no se puede resolver.
