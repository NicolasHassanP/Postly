# Plan de remediación — undécima auditoría (dictamen 11, 6,5/10)

> Dictamen: `C:\dev\auditoria-postly-11\dictamen-auditoria-11.md`
> Documento vivo: `avance/Tesis Postly Bontorno Hassan-1 v2.docx` (el PDF auditado salió de ahí, 27-09 19:09).
> Este archivo dice qué hay que arreglar, en qué orden, qué decide Nico y qué no se cierra sin volver al campo.

---

## 0. Estado al cerrar esta sesión (27-09-2026)

Los **11 hallazgos "Alto"** (H-01 a H-11) quedaron **aplicados y verificados** en las pasadas 111, 112 y 113:

| Pasada | Cubre | Qué hizo |
|---|---|---|
| **111** | H-01, H-02, H-03, H-04, H-05, H-06, H-07, H-08, H-09 (parcial), H-10 (parcial), H-11 | Reescribió 12 párrafos, agregó el §6.1.8 nuevo (Anexo E.14 al Cap. 6), agregó dos párrafos de amenazas en §3.5.5, y **regeneró las seis figuras** (1, 3, 4, 5, 6, 11) desde sus scripts fuente (`redibujar_figura*.py`, `corregir_figura11.py`) para corregir remisiones «§4.7.2», «§4.5.1», etc. |
| **112** | H-09 (cierre) | Agregó `p = 0,125` al «6 de 7» del orden de carrusel en la HU5 y en el §8.1 (sólo estaba en el Anexo E.14.2). |
| **113** | H-10 (cierre) | Agregó el localizador público verificado de las Pautas Mary Kay (`marykay.sv/.../Social-Media-Mary-Kay-Final_compressed.pdf`) en la referencia y en el Anexo D, confirmado por Nico que el contenido coincide. |

Los 4 verificadores (`verificar_documento.py`, `verificar_coherencia.py`, `verificar_patrones_desplegados.mjs`, `verificar_csv.py`) corren limpios sobre el `.docx` actual. El PDF está re-exportado y sincronizado (campos de Word refrescados: el índice de tablas ya dice «n = 32» y «n = 8», no «n = 12» / «n = 3»).

### ⚠️ Bug propio a corregir PRIMERO

Al redactar el §6.1.8 nuevo y las correcciones de HU4/§8.1 (pasada 111) **repetí el mismo error que el dictamen señala en el OE-2** (§4.8 del dictamen: *"«26 de los 32 pares … frente al trabajo manual de una consultora», cuando fueron ocho"*): escribí **"frente al trabajo manual de una consultora"** (singular) en tres lugares, cuando el Estudio 4 comparó contra el trabajo real de **las ocho participantes de la ampliación**, no de una sola. Confirmado en el `.docx` actual:

- Párrafo de la HU4 (Cap. 4, Módulo B): *"El Anexo E.14 mide, con un evaluador externo, la calidad de ese copy frente a un generador genérico y frente al trabajo manual de una consultora."*
- Párrafo del §6.1 (H-03, el que remite al §6.1.8): *"...preferido frente a un generador genérico y frente al trabajo manual de una consultora, en los dos casos."*
- Párrafo del §8.1 (Conclusiones, OE-2): mismo giro.

El §6.1.8 nuevo, en cambio, ya dice correctamente *"el trabajo manual real de las 8 participantes de la ampliación"* — o sea que quedó inconsistente conmigo mismo. **Es lo primero que se corrige la próxima sesión**, antes de tocar cualquier medio o bajo, porque si se arrastra a más lugares nuevos el problema crece en vez de cerrarse.

### Actualización 28-09-2026 — pasadas 114 a 125 APLICADAS

Bug propio (114) y los 20 medios y 24 bajos aplicados, cada pasada con los 4 verificadores limpios, 0 oraciones de más de 50 palabras, y backup `bak-pre-pasadaNNN.docx`. Campos de Word refrescados y PDF re-exportado con SaveAs2 (190 págs.). D1 (b), D2 y D3 según la recomendación.

Lo que apareció fuera del plan, y se corrigió en la pasada indicada:
- **Restos de altos que la 111 no alcanzó:** §3.5.2 seguía describiendo la muestra del piloto (H-04, 117); HU5 decía que el Cap. 6 no mide orden/copy/tono (H-03, 119); §4.4.3 «exigido por la API» y §4.4.2 «el encuadre queda a cargo de la plataforma» (H-07, 119); Anexo D «las tres que participaron del Cap. 6» (119).
- **114:** eran 5 apariciones de «una consultora», no 3 (dos más en el propio E.14).
- **117:** las «cuatro baterías» del §3.4.2 se alinearon con las del E.5 (multimodal, interfaz, multimedia, OAuth); compliance corre aparte. Vínculo verificado en ReclutamientoC1-C8: Conocida C2, C3; Familiar C6.
- **118:** el §3.6 tenía 8 párrafos vacíos (no 3) y 3 líneas horizontales que se conservan (son estilo: 47 en todo el documento).
- **119:** el criterio de 20 MB de HU4 **se conserva** (la Tabla 13 no reescribe criterios, y el dictamen lo valora); se declara que no es alcanzable por la vía de ingesta. Desvío deliberado del plan.
- **121:** el α 0,29 de PU lo baja **PU3** (ítem-resto −0,43; sin él α = 0,55), no PU1. Recalculado de TAM_respuestas_v2.csv con PU4r recodificado.
- **122:** E.12 cambia de fuente: el prompt genérico del Estudio 1 muestra el CTA por defecto (8/8), y el Estudio 4 confirma el prompt corregido en las sesiones (Postly 0/32 frente a manual 12/32). Script nuevo: `instrumentos/run_cta_estudios_oe2.mjs`. Sesiones: 26/09 (C1-C6) y 27/09 (C7-C8), posteriores al fix del 19/09, así que PU3 se respondió sobre el sistema corregido.
- **124:** localizadores verificados de Michelson (DOI 10.1571/bda2-2-06cc), Forrester, MuleSoft y Shoup (GOTO Aarhus 2014). El año 2015 de MuleSoft **no se pudo verificar** (el PDF no trae fecha).

Quedan para Nico: (1) «Función del capítulo» del Cap. 2 (bajo): el pasaje de scraping y la Tabla 2 de riesgos son resultados de diseño; moverlos renumera tablas y no se tocó. (2) La nota «Consultado/Recuperado» de Mary Kay no se agregó. (3) Si se quiere citar la URL del repo como evidencia de anterioridad de los protocolos (hoy el E.4 sólo dice «repositorio versionado»). (4) Nada commiteado.

---

## 1. Qué queda pendiente

El dictamen 11 reporta, además de los 11 altos ya cerrados: **20 medios, 24 bajos, y 4 "Parcial" heredados** del dictamen original (C-03, C-08, A-26, A-40). Ninguno exige volver a medir — son de coherencia, rotulado y redacción, igual que los altos.

**C-08 ya está sustancialmente resuelto** por la pasada 113 (localizador de las Pautas). **A-40** se resuelve junto con la limpieza del §3.6 (pasada 118). **C-03** y **A-26** son limitaciones estructurales que ya están declaradas con números exactos — el plan las deja así (ver §5).

---

## 2. Decisiones que son de Nico

Sólo tres, y son livianas — no cambian alcance, son criterio editorial.

### D1 — Figura 7(b): nombre real de un autor visible

El dictamen señala que la captura de la pantalla de autorización de Meta muestra el nombre real de uno de los autores. No es un defecto técnico, pero es un dato personal en un documento público.

- **(a) Difuminarlo/recortarlo** en la imagen antes de la próxima exportación.
- **(b) Dejarlo.** Es un nombre que ya figura en la carátula del propio trabajo (autoría declarada), así que no agrega exposición real.

**Recomiendo (b)** y sólo dejar una nota si Nico prefiere taparlo por estética, no por privacidad.

### D2 — A-26: ¿insistir con la bibliografía de antecedentes directos?

El dictamen confirma lo que ya sabíamos (`postly-bibliografia-bloqueo-editores`): agregamos ocho obras recientes pero ninguna es un antecedente directo sobre "automatización de publicación con compliance". La revisión amplia de 596 candidatos no produjo ninguna.

**Recomiendo dejarlo declarado como está** (ya lo dice el §1.6.0 con los números exactos) y no reabrir la búsqueda: es la tercera vez que se agota la misma vía sin resultado.

### D3 — C-03: ¿instrumentar la línea base de 15-30 min?

Sigue siendo una estimación cualitativa de los autores, ahora acompañada del dato medido (9,33 min del tramo comparable). Instrumentarla de verdad exigiría cronometrar el proceso manual completo *sin* Postly con nuevas consultoras — trabajo de campo, no de escritorio.

**Recomiendo declararla más explícitamente como estimación no instrumentada** en el §1.2.a (ya casi lo hace) y **dejar de usarla para proyectar horas mensuales**, que es lo que el dictamen específicamente objeta.

---

## 3. Bloque A — el bug propio (pasada 114, primero que nada)

| Pasada | Qué hace |
|---|---|
| **114** | Buscar las 3 apariciones de «trabajo manual de una consultora» (HU4, §6.1/H-03, §8.1/OE-2) y reemplazar por «trabajo manual real de las ocho participantes de la ampliación» o equivalente, coherente con el §6.1.8. Correr `grep` sobre todo el `.docx` para confirmar que no quedó ninguna otra aparición de la frase en singular referida al Estudio 4. |

---

## 4. Bloque B — los veinte medios (pasadas 115 a 121)

Organizados por capítulo, como los agrupa el propio dictamen (§4 del dictamen).

| Pasada | Capítulo | Qué hace |
|---|---|---|
| **115** | Cap. 1 (Introducción) | **§1.6.1 vs Tabla 1**: el texto dice que "ninguna" plataforma SMMS tiene compliance de marca ni razonamiento visual multimodal, pero la Tabla 1 marca a Later "Parcial" en *Multimodal (imagen)* y a Hootsuite "Parcial\*" en *Compliance de marca* — matizar el texto o la tabla para que no se contradigan a una página de distancia. **§1.6.0**: reencuadrar la barrera de acceso bibliográfico como barrera de *método* (bots bloqueados por TDM) y no de *acceso* (el contenido es abierto); sacar la narración de cómo funciona `buscar_bibliografia.py`, que es impropia del registro de un estado del arte. |
| **116** | Cap. 2 (Marco Teórico) | **§2.3, polling**: agregar al inventario el *Feedback Loop* diario (HU14) y la sincronización con Instagram al abrir la agenda (Anexo B.8) — hoy dice que el polling "queda reservado a los dos tramos" y hay cuatro. **§2.4, "cuatro flujos que publican"**: la enumeración (imagen única, carrusel, video, re-publicación) no coincide con la de §4.3.1/HU9/Anexo B.4 (inmediato, carrusel, programado, video) — unificar una sola lista y usarla en los dos lugares. |
| **117** | Cap. 3, parte 1 (muestra) | **§3.5.2 vs Anexo E.2**: el §3.5.2 dice que no se registró el valor de cada criterio de inclusión por participante; el E.2 dice que se registraron seis, "declarados de antemano" — unificar. **§3.5.2, vínculo familiar**: agregar ahí (no sólo en §3.5.5, ya hecho en la pasada 111) que una de las participantes tiene vínculo familiar con un autor, con la estratificación «Conocida»(2)/«Familiar»(1)/«Ninguna»(5) del §6.1.6. **§3.4.1**: se contradice a sí mismo — dice que las observaciones "no dejaron registro instrumental" y "ninguna afirmación empírica", y después que "se cuantificó el costo de oportunidad" con "una base empírica sólida"; elegir una lectura y sostenerla. **§3.4.2**: la batería "Pruebas de estrés" es en realidad una sola normalización sin concurrencia (Tabla 11, n=1) — renombrarla o ampliar la n; y "las cuatro baterías" nombra un conjunto distinto en §3.4.2 (con compliance) que en el Anexo E.5 (con interfaz) — unificar cuáles son las cuatro. |
| **118** | Cap. 3, parte 2 (limpieza + A-40) | **§3.6**: sacar las tres viñetas vacías de la pág. 60 (restos de texto suprimido). **§3.6.2** se titula "Integración con modelos de inteligencia artificial" pero repite la justificación de n8n del §3.6.1 y trata además APIs, OAuth y arquitectura — podar o retitular. Esto cierra de paso **A-40** (duplicación §2/§3.6). **§3.5, introducción**: todavía dice "la planificación metodológica de las futuras instancias de validación" — poner en pasado, esa validación ya se ejecutó. |
| **119** | Cap. 4 (Desarrollo) | **HU4 vs §4.4.2 vs Meta**: el criterio 1 de HU4 exige procesar "imágenes de hasta 20 MB sin recomprimir", pero §4.4.2 dice que la ingesta sólo acepta mensajes tipo *foto* (transcodificados por Telegram a JPEG) y la propia referencia de Meta fija 8 MB como máximo publicable — bajar el criterio de HU4 a lo que el sistema realmente hace y puede publicar. **§4.3.1**: el párrafo "Las dos capas no cubren esos flujos…" remite a algo que el texto anterior no enumera (referente colgado, resto de una edición) — completar la enumeración o borrar la remisión. |
| **120** | Cap. 5 (Arquitectura) | **§5.2.1**: la lista numerada de pasos (disparo, enrutamiento, inferencia, HITL, publicación) omite las dos auditorías del Centinela que la Figura 6 y el §5.1.2 sí ubican en el flujo — agregarlas como pasos. **Terminología**: "Capa de Integración y Distribución (API Gateway)" no corresponde a ningún gateway real — renombrar o quitar la aclaración entre paréntesis; "audita estáticamente" es impreciso para un modelo probabilístico (el canal visual); "confirmación de doble factor lógico" (§5.3) es una confirmación simple, no doble factor. **§5.1.3 vs §8.2.5**: el primero dice que cada capa se reemplaza "de manera aislada", el segundo que la capa de integración "se extiende, no se enchufa" — conciliar. |
| **121** | Cap. 6 (Resultados) | **§6.1.7**: atribuye el alfa=0,29 de Utilidad Percibida a que el ítem PU1 "tuvo varianza nula", pero el recálculo sin PU1 sigue dando alfa=0,31 — el ítem constante no explica el valor bajo; reformular sin esa causa falsa (puede quedar como "causa no identificada" o explorar si es el n=8 el que lo explica). **§6.1.3, panel A**: dice que sobre contenido real "no erró" apoyándose en una reetiquetación de los autores posterior al resultado (el kappa de la Tabla 5 se midió sobre la etiqueta del panel B, no la del panel A) — la operación es legítima porque el constructo estaba declarado de antemano, pero hay que atribuirla correctamente, no como si fuera la etiqueta original. **§6.1.1**: la taxonomía llama a la quinta forma "vocabulario comercial sin cifra" pero dos de sus tres ejemplos ("2x1") sí llevan cifra — corregir el rótulo o los ejemplos. **§6.1.4**: 25 predicciones cumplidas son compatibles con que el detector sea "íntegramente caracterizable por su especificación", pero no lo confirman — bajar la afirmación a lo que el dato permite. |

---

## 5. Bloque C — el resto de los veinte medios, en Discusión y Anexos (pasada 122)

| Pasada | Qué hace |
|---|---|
| **122** | **§7.3**: dice que un detector de criterio fijo "no puede ganar sensibilidad sin arriesgar especificidad" como "propiedad de cualquier clasificador binario" — eso vale para mover el umbral sobre una misma curva ROC, no entre clasificadores, y la propia Tabla 10 lo refuta (recall subió de 0,412 a 0,706 con los FP constantes en 4) — corregir el argumento. **E.7 vs §6.1.5**: el §6.1.5 dice que las HU fijan nueve umbrales y que "la lectura del código desplegado agrega otros dos"; el E.7 dice que esas dos filas "provienen de un criterio de aceptación, como las otras nueve" (con lo que serían once) — unificar el recuento. **E.11**: enumera cuatro vías por las que una pieza con precio puede llegar a la agenda y en la oración siguiente dice que "la única vía… es la que se usó para este caso" — no son contradictorios si se aclara que las otras tres son hipotéticas y ninguna ocurrió en el caso reportado; redactarlo así. **E.12**: dice que el modelo agrega el llamado a la acción por defecto "como muestra el propio corpus de campo", pero ese corpus lo redactaron las consultoras, no el modelo — no puede mostrar la conducta por defecto del generador; corregir la fuente de esa afirmación (el harness de compliance, no el corpus de campo). **E.14.1**: el generador de comparación es un *prompt* de una línea, lo que favorece trivialmente al *prompt* de Postly en la dimensión "cumplimiento normativo" — declarar esta ventaja estructural del diseño del estudio. **Remisiones externas**: `PROTOCOLO-ampliacion.md`, `PROTOCOLO-OE2.md`, `LEEME`, `Protocolo_TrackA2_Muestras.md` se citan como preregistro pero no viajan con el PDF — declarar explícitamente que son externos y por qué (mismo criterio ya usado para no redistribuir el material de terceros). **Fechas**: fechar la ampliación de ocho consultoras y el Anexo E.14 en la cronología del Anexo A.2 (hoy termina el 19-09 sin mencionarlas) y declarar qué versión del *prompt* usó el cronometraje (antes o después de `fix-cta-mensaje-comercial.mjs` del 19-09) — esto también resuelve si el ítem PU3 del TAM ("Postly me ayuda a cumplir las normas de la marca") se respondió sobre un sistema que todavía introducía el mensaje comercial. **Terminología de imágenes**: el E.1.2 llama "imágenes propias" al corpus, mientras el E.6 y el §7.3 dicen que "no corresponde llamarlo fotografía propia" — unificar en la versión más precisa (E.6/§7.3). |

---

## 6. Bloque D — los veinticuatro bajos (pasadas 123 a 125)

Se agrupan por naturaleza, como en el plan de la décima auditoría.

**Pasada 123 — residuos puntuales del cuerpo**
`§1.2.a` estimación de 15-30 min todavía se usa para proyectar horas mensuales (ver D3) · objetivos específicos con adjetivación sin verificar ("democratizar el acceso", "maximizando su peso estético", "calidad editorial apta para publicación sin reescritura") · `§1.5.2` "instancia en la nube de n8n" (es auto-hospedado) · registro residual en Cap. 2 y 4 ("director de arte", "agente de diseño corporativo", "Asesor de Marketing Digital", "CTA agresivo") · `§6.1.1` taxonomía (ver pasada 121, mismo bloque si sobra tiempo) · `HU5` en Cap. 4 (ya resuelto en pasada 112, verificar que no quedó ningún otro "6 de 7" sin su p) · `§7.5` *non sequitur* ("no fue necesario replicar… no demuestra que el vacío exista") · `§7.1` McTear et al. citado como si fuera un estudio con medición, siendo un libro de texto.

**Pasada 124 — bibliografía y forma (Etapa 3 del dictamen)**
Mezcla idiomática: "(6.ª ed.)" junto a "(3rd ed.)"; "En" en Garlan y Shaw / Gómez et al., "In" en Nuseibeh y Easterbrook — unificar en español. Localizador a Shoup (2014), MuleSoft (2015), Michelson (2006), Richardson y Rymer (2014) — son literatura gris sin URL, buscar si tienen una públicamente accesible (mismo método que el localizador de Mary Kay: buscar, verificar contenido antes de citar, declarar si no se encuentra). Actualizar Storey, Baskerville y Kaul (2024→2025, el número 35(3) es de 2025) y Baskerville et al. (2026, ya asignado a 35(5), 830-847). Mary Kay usa "Consultado el" y el resto "Recuperado el" — está bien porque son tipos de fuente distintos (documento sin URL estable vs. página web), pero conviene una nota que lo aclare para que no se lea como inconsistencia.

**Pasada 125 — voz de bitácora y pulido final**
Suprimir la voz de bitácora: "el §8.1 declaraba", "hasta esta medición", "ya tienen", "a diferencia del piloto", "existe porque dos de esos archivos habían quedado mal formados". Reemplazar las doce apariciones de "(el Capítulo 7)" (resto de un buscar-y-reemplazar automático) por "el Capítulo 7" sin paréntesis o por su título. Recortar la autocalificación repetida en `§6.1.1` (tres párrafos para decir que un contraste de 1/18 contra 0/12 no es informativo — decirlo en uno) y en los Anexos E.6 y E.8. Renumerar el §8.2 (la "Política de retención" va sin número entre los ítems 6 y 7; el ítem 2 no tiene título ni prioridad). Mencionar en el Resumen que el canal visual es *fail-open* (hoy sólo dice "delegado al modelo", y el dictamen la llama "la declaración técnica más honesta del documento" — debería estar donde el tribunal lee primero).

---

## 7. Orden de ejecución

```
114                 ← el bug propio, primero (3 apariciones de "una consultora")
   │
   ▼
D1 · D2 · D3        ← decisiones de Nico (livianas, no bloquean el resto)
   │
   ▼
115 · 116           ← Caps. 1 y 2
   │
   ▼
117 · 118           ← Cap. 3 (muestra + limpieza, cierra A-40)
   │
   ▼
119 · 120 · 121     ← Caps. 4, 5 y 6
   │
   ▼
122                 ← Discusión y Anexos
   │
   ▼
123 · 124 · 125     ← los bajos: residuos puntuales, bibliografía, voz de bitácora
   │
   ▼
verificar_documento.py · verificar_coherencia.py
verificar_patrones_desplegados.mjs · verificar_csv.py
   │
   ▼
Refrescar campos de Word (Fields.Update + TOC/TOF) → exportar PDF → confirmar con pymupdf
   │
   ▼
(opcional) lanzar la duodécima auditoría en sesión limpia
```

**Regla de las once auditorías anteriores:** cada pasada que reescribe una afirmación se busca en **todo** el documento antes de darse por cerrada — el bug de la pasada 114 nació exactamente de no hacer eso. Ninguna pasada se da por buena sin correr los cuatro verificadores, y toda regeneración de figura o reexportación de PDF se hace con el patrón ya probado esta sesión (`Fields.Update()` + `TablesOfContents`/`TablesOfFigures` + `SaveAs2`, no `ExportAsFixedFormat`, que cuelga con este documento).

---

## 8. Qué no cierra este plan

- **C-03 completo.** La línea base de 15-30 min seguirá siendo una estimación no instrumentada; instrumentarla de verdad exige cronometrar el proceso manual puro con consultoras nuevas, que es trabajo de campo.
- **A-26 completo.** No hay antecedente académico directo sobre "automatización de publicación con compliance" localizable con los medios de este equipo (sin acceso institucional). Ya se agotó la vía de la revisión amplia dos veces.
- **La nota.** Aplicar los 20 medios y 24 bajos sube coherencia y rotulado; no cambia que la muestra es n=8 intencional, que las participantes tienen vínculos personales con los autores, ni la mediana bibliográfica de 2014. Esos son techos estructurales del trabajo, no de su redacción — el propio dictamen 11 ya lo dice así (§13.3).
