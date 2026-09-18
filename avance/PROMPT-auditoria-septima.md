# Prompt para la séptima auditoría, en sesión limpia

> **Antes de pegarlo, dos condiciones.**
>
> 1. Abrir Claude Code en una carpeta **fuera de `C:\dev\Tesis`** (es decir,
>    `C:\dev\auditoria-postly-7`). Si se abre dentro del repo, la sesión hereda el
>    `CLAUDE.md` del proyecto y su memoria persistente, y la auditoría deja de ser
>    independiente.
> 2. El `.docx` de la carpeta ya tiene los campos actualizados en Word: el índice general
>    lista 113 entradas (pp. 10–157), el de tablas las catorce (pp. 26–158) y el de figuras
>    las quince (pp. 36–104). Si se reemplaza el archivo, hay que refrescarlos antes.
>
> El contenido de la carpeta está al final de este archivo.

---

Actuás como evaluador de un tribunal académico. Tu trabajo no es ayudarme: es dictaminar
sobre un Trabajo Integrador con criterio adversarial. Doy por sentado que preferís señalar
un problema real antes que quedar bien.

**Esta es una auditoría total y desde cero.** No estás verificando la remediación de un
informe anterior ni hay una lista de hallazgos previos que cerrar. El documento pasó por
rondas de revisión interna, y deliberadamente **no** se te entrega ninguno de esos
informes: si el trabajo se sostiene, tiene que sostenerse solo, leído por alguien que lo
ve por primera vez. Eso es exactamente lo que va a hacer el tribunal.

Juzgá el documento por lo que es: el Trabajo Integrador final de una **Tecnicatura
Universitaria en Programación**. No lo midas contra los estándares de una tesis doctoral
ni le perdones nada por no serlo. La pregunta es si cumple con rigor el nivel que le
corresponde.

## Materiales

- `Tesis Postly Bontorno Hassan-1 v2.docx` — el documento a auditar. Leelo con
  `python-docx` (`pip install python-docx`) o descomprimiendo `word/document.xml`. Son
  **1.315 párrafos**, **~51.500 palabras** sin contar los tres índices —37.300 en el cuerpo
  y 9.800 en los anexos—, **14 tablas** y **15 figuras** (quince imágenes distintas por hash
  MD5). Si tu extracción devuelve mucho menos que eso, falló y hay que arreglarla antes de
  opinar. Recorré el cuerpo **en orden de documento** para conservar la intercalación de
  párrafos y tablas —`doc.paragraphs` sola no las ve—, y **leelo completo**, incluidos los
  cinco anexos (A a E), donde está casi toda la evidencia empírica. Los párrafos de los tres
  índices llevan estilo `toc N` o `table of figures`: excluilos de cualquier métrica de
  escritura o vas a contar cada rótulo dos veces.
- `evidencia/` — los datos crudos, los scripts de análisis y la fuente normativa que el
  documento cita en su Anexo E. Están para que **verifiques** las cifras, no para que
  confíes en ellas. Leé primero su `LEEME.md`.
- `md_a_pdf.py` — conversor para el entregable. Ver «Entregable».

## Qué es el trabajo, en una línea

Un sistema que permite a una Consultora de Belleza Independiente de Mary Kay generar y
publicar contenido en Instagram y Facebook conversando con un bot de Telegram, con un
módulo que audita el contenido contra dos reglas corporativas —no publicar precios en
canal público y firmar con la nomenclatura legal— antes de publicar. Está orquestado en
n8n, usa Gemini para generar el texto y para leer precios incrustados en imágenes, y
persiste en Google Sheets.

## Marco de evaluación

Calificá sobre 10, con un decimal, **capítulo por capítulo**, y ponderá con estos pesos
para la nota global:

| Capítulo | Peso |
|---|---|
| Cap. 3 — Marco Metodológico | 18 % |
| Cap. 4 — Desarrollo | 18 % |
| Cap. 5 — Resultados (§5.1) | 16 % |
| Cap. 2 — Marco Teórico | 12 % |
| Cap. 1 — Introducción | 10 % |
| §5.4 — Discusión | 8 % |
| Cap. 6 — Conclusiones | 8 % |
| Cap. 7 — Referencias | 6 % |
| Cap. 8 — Anexos | 4 % |

Mostrá la ponderación completa, término por término, para que la nota sea auditable.

Escala, para que el número signifique algo:

- **10** — no encontrás nada que corregir después de buscar en serio.
- **9** — sin defectos de fondo; lo que queda es acabado, y ninguna conclusión depende de
  algo que no esté sostenido.
- **8** — sólido, con defectos reales pero acotados que no comprometen las conclusiones.
- **7** — aprobado, con al menos un problema que obliga a leer alguna conclusión con
  reserva.
- **6 o menos** — hay algo que compromete la validez de lo que el trabajo afirma.

Declará el estado: *aprobada* / *aprobada con observaciones* / *requiere revisión*.

## Método

1. Leé el documento entero antes de juzgar nada.
2. **Verificá todo lo que sea computable.** Ver «Verificaciones instrumentales». Si una
   cifra del texto no coincide con la que sale del dato crudo, es un hallazgo crítico.
3. Recién después, evaluá lo que es materia de criterio: la calidad del planteo, la
   coherencia interna, la calibración de las afirmaciones y la solidez de las conclusiones.
4. Ordená los hallazgos por severidad y ubicá cada uno con precisión (sección, párrafo,
   frase literal).

## Qué buscar, por clase de defecto

Estas son las clases que más suelen afectar a un trabajo de este tipo. No son una lista de
cosas que sepa que están: son dónde mirar.

- **Afirmaciones cuya fuerza excede a su evidencia.** Garantías, coberturas totales,
  eliminaciones de riesgo, superioridades, porcentajes sin medición detrás,
  generalizaciones a partir de muestras chicas. Marcá cada una y decí qué evidencia haría
  falta.
- **La misma afirmación con distinta calibración en distintos capítulos.** Cuando el
  documento acote una afirmación en el lugar donde la desarrolla, andá a buscar esa misma
  afirmación en los otros capítulos donde aparece de paso: en el Resumen, en la
  justificación del Cap. 1, en la descripción de módulos del Cap. 4, en los anexos. Una
  capacidad declarada con precisión en un apartado y afirmada sin reservas tres capítulos
  antes es una contradicción, aunque las dos frases estén técnicamente escritas.
- **Estadística que no contrasta lo que el texto dice que contrasta.** Cuando el documento
  reporte una prueba, preguntate cuál es la hipótesis nula real y si es la que el trabajo
  afirma haber puesto a prueba. Verificá también que el estadístico corresponda al diseño
  (independencia de las observaciones, unidad de análisis, grados de libertad) y que los
  intervalos y tamaños del efecto que reporte estén bien calculados y bien leídos.
- **Remisiones que resuelven pero afirman un contenido ausente.** Cuando el texto diga «el
  §X declara Y» o «el Anexo Z documenta W», andá al destino y comprobá que diga eso. Un
  barrido de referencias cruzadas no detecta esta clase, porque la sección existe.
- **Inventarios y enumeraciones incompletos.** Cuando el texto declare sobre qué base se
  midió algo, contá los casos contra los archivos y comprobá que la suma cierre. Prestá
  atención a los casos que se reutilizan en más de un conjunto: contarlos dos veces infla
  la base, contarlos una vez cuando son escenarios distintos la reduce.
- **Contradicciones entre capítulos.** Compará lo que el Cap. 3 declara que va a medir
  contra lo que el Cap. 5 reporta y contra lo que el Cap. 6 afirma haber demostrado. Y lo
  que el cuerpo afirma contra lo que los anexos conceden.
- **Capacidades descritas que el sistema no tiene.** El Cap. 4 describe la arquitectura. Para
  cada capacidad que declare, preguntate qué evidencia la respalda: una medición del Cap. 5,
  una lectura del código en un anexo, o nada. La tercera respuesta es un hallazgo.
- **Premisa normativa.** El sistema entero se justifica en dos reglas corporativas. El PDF
  de la fuente está en `evidencia/`. Comprobá, regla por regla, que el trabajo le atribuya
  a la norma exactamente lo que la norma dice, ni más ni menos, y que la regla citada rija
  para el canal al que el trabajo la aplica.
- **Límites declarados vs. límites ocultos.** Distinguí siempre un límite que el trabajo
  reconoce de un problema que oculta. Pero no aceptes una declaración como si fuera una
  solución: si una limitación declarada compromete una conclusión, decilo.
- **Validez metodológica.** Diseño del estudio, composición y reclutamiento de la muestra,
  amenazas a la validez interna, externa y de conclusión, instrumentos y su sesgo.
- **Aparato editorial.** Que toda tabla y figura esté referida desde el cuerpo y llevada al
  índice; que los rótulos sean campos `SEQ` y no texto plano; que las tablas tengan nota de
  fuente y que la nota vaya debajo del cuadro; que las referencias cruzadas resuelvan; que
  el formato APA 7 sea uniforme —incluida la regla de autores, que cambia a partir de 21— y
  que toda cita tenga entrada y ninguna entrada quede huérfana.

## Verificaciones instrumentales

No opines sobre estos puntos: medilos.

### Qué correr y qué no

| Script | Correr | Qué verifica / por qué no |
|---|---|---|
| `run_compliance_text.mjs <csv>` (con y sin `--v1`) | **Sí** | Tablas 3, 4, 6 y 10. Imprime además la desagregación del canal de texto y los intervalos de Wilson al pie. |
| `run_compliance_field.mjs` | **Sí** | Tabla 5, el κ de Cohen del estudio de campo y sus intervalos. |
| `run_compliance_hu10.mjs` | **Sí** | La divergencia entre el flujo inmediato y el programado. |
| `run_cronometraje.mjs` | **Sí** | Tabla 7, la prueba t, el contraste del umbral, los IC del 95 % y el *d* de Cohen. |
| `run_tam.mjs` | **Sí** | Tabla 8 y el α de Cronbach. |
| `run_representatividad.mjs` | **Sí** | El contraste de representatividad del conjunto principal contra el corpus real. Ver abajo. |
| `verificar_patrones_desplegados.mjs` | **Sí** | Que los detectores de los scripts sean los del workflow. Ver abajo. |
| `run_baterias.mjs` | No | Necesita la instancia de n8n, su clave de API y un token de Meta. Verificá la Tabla 11 contra `Baterias_resultados.csv`. |
| `_desglose_b1b.mjs` | No | Lee el historial de esa instancia. Verificá `B1b_desglose.csv`. |
| `run_umbrales.mjs` | No | Ídem. Verificá la Tabla 13 contra `Umbrales_HU_resultados.csv`. |
| `run_compliance_vision.mjs` | No | Consume cuota de un servicio de pago con tope de 20 peticiones diarias. Verificá las Tablas 12 y 14 contra `casos_imagen/…_resultados.csv` y `casos_imagen_corrida2/`, que traen el veredicto y la justificación textual del modelo caso por caso. |

### El mecanismo de correspondencia con el sistema desplegado

`verificar_patrones_desplegados.mjs` compara los detectores de los scripts de evidencia
contra dos extractos del workflow: `Nodos_compliance_desplegados.json`, el del estado
vigente, y `Nodos_compliance_desplegados_v1.json`, el del estado **anterior** a la
corrección que el §5.1 describe, que es el que produjo algunas de las matrices del capítulo.
Corré el script —es instantáneo y no necesita la instancia— y después **evaluá el mecanismo
con criterio**: qué establece, qué no establece, y si el documento lo presenta con su
alcance exacto o afirma más de lo que entrega. Preguntate en particular qué parte de la
cadena queda fuera y si el trabajo la declara.

### El contraste de representatividad

`run_representatividad.mjs` clasifica los casos infractores de texto por la forma en que
expresan el precio, con una taxonomía léxica propia, y compara el conjunto de prueba contra
el corpus real. Corrélo y después evaluá **la taxonomía misma**: si las seis categorías son
exhaustivas y mutuamente excluyentes, si el orden de precedencia altera el resultado, y si
la conclusión que el §5.1 extrae de ella es la que los números permiten.

### La premisa normativa

`evidencia/Pautas Mary Kay para el uso en las Redes Sociales.pdf`, diez páginas. El
documento entrecomilla fragmentos en su Anexo D y en otras secciones. Comprobá **cada uno**
contra la fuente, y comprobá también el alcance: que una regla citada rija para el canal al
que el trabajo la aplica. Prestá atención a las reglas de precios, de identidad/firma, de
video y de uso de imágenes de la Compañía.

### Reproducción de las cifras del Capítulo 5

- **Tabla 5**: se apoya en la columna `Resultado_sistema` de `Compliance_Campo.csv`, que
  trae el pie de foto **verbatim** de los 29 casos. Ejecutá el detector sobre esa columna y
  comprobá si reproduce el veredicto registrado, caso por caso. Las columnas de esa
  planilla no son las que `run_compliance_text.mjs` espera, así que vas a tener que
  mapearlas o reutilizar las expresiones regulares.
- **Tablas 12 y 14**: recomponé las matrices desde los archivos de veredictos y compará.
  Fijate cómo se compone cada corte y si el documento declara esa composición.
- **Los intervalos y los tamaños del efecto**: recalculalos por tu cuenta, con tu propio
  método, y comprobá que coincidan. Verificá además cuál es la agregación que corresponde
  al diseño y si el documento reporta la que corresponde.
- **Métricas de escritura**: longitud media de oración, oraciones de más de 50 palabras,
  párrafos de más de 250 palabras y densidad de registro promocional por capítulo. Declará
  con qué criterio segmentaste, porque la media varía varios puntos según se corten o no las
  oraciones en dos puntos, y acordate de excluir los tres índices.

## Reglas

- **No edites ningún archivo del documento ni de la evidencia.** Tu salida es un dictamen.
  Podés escribir los scripts de verificación que necesites.
- No elogies. No cierres con una nota de aliento. Si algo está bien, alcanza con decir que
  está resuelto y pasar al siguiente punto.
- No inventes hallazgos para parecer riguroso, y no omitas ninguno para ser amable.
- Si algo te parece dudoso pero no podés probarlo, decilo como duda, no como hallazgo.
- Si no podés verificar algo, decí que no podés y por qué. Es una respuesta legítima;
  inventar un veredicto no lo es.
- **No asumas que la nota tiene que ser alta ni baja.** Calificá lo que leés.

## Entregable

Escribí el dictamen en `dictamen-auditoria-7.md`, con esta estructura:

1. **Veredicto** — nota global sobre 10, estado, y los motivos en pocas líneas.
2. **Calificación por capítulo** — tabla con la nota y el motivo en una línea, más la
   ponderación completa término por término.
3. **Hallazgos** — ordenados por severidad (críticos, altos, medios, bajos). Cada uno con
   su ubicación exacta, la cita literal del problema, por qué importa y qué lo corrige.
4. **Verificaciones instrumentales** — tabla de lo que mediste, con el número que obtuviste
   y el número que afirma el documento, uno al lado del otro.
5. **Fortalezas** — qué sostiene el trabajo con solidez. No es un elogio: es parte del
   dictamen, y sirve para saber qué no hay que tocar.
6. **Qué separa este trabajo de un 10** — lista accionable, ordenada por impacto.
7. **Qué no pude verificar** — explícito, con el motivo de cada punto.

Al final, una nota de método que diga con qué se sostiene cada juicio, para que el lector
sepa cuánto pesa cada uno.

**Y además, generá el PDF**, que es como se va a leer:

```
python md_a_pdf.py dictamen-auditoria-7.md
```

Deja `dictamen-auditoria-7.pdf` en la misma carpeta. El script usa `reportlab` (ya
instalado) porque no hay pandoc en esta máquina; maneja encabezados, tablas, listas, citas
y bloques de código. Si algo no renderiza bien, arreglá el script —no el dictamen.

---

## Qué copiar a la carpeta de la auditoría

Desde PowerShell:

```powershell
$dst = "C:\dev\auditoria-postly-7"
$src = "C:\dev\Tesis\avance"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item "$src\Tesis Postly Bontorno Hassan-1 v2.docx" $dst
Copy-Item "$src\PROMPT-auditoria-septima.md"            $dst
Copy-Item "$src\md_a_pdf.py"                            $dst
Copy-Item "$src\evidencia"                              $dst -Recurse
```

La carpeta queda así:

```
C:\dev\auditoria-postly-7\
├── Tesis Postly Bontorno Hassan-1 v2.docx   ← con los campos actualizados en Word
├── PROMPT-auditoria-septima.md              ← este archivo
├── md_a_pdf.py                              ← conversor del dictamen a PDF
└── evidencia\
    ├── LEEME.md                                   ← leer primero
    ├── Pautas Mary Kay ... .pdf                   ← la fuente normativa
    ├── Casos_Compliance_Representativo.csv        ← conjunto representativo (40)
    ├── Casos_Compliance.csv                       ← conjunto de estrés (40)
    ├── Casos_Compliance_Limite.csv                ← valores límite (25)
    ├── Compliance_Campo.csv                       ← 29 casos de campo, pie de foto verbatim
    ├── Cronometraje_datos.csv                     ← 12 pares de tiempos
    ├── TAM_respuestas.csv                         ← 3 respuestas, 10 ítems
    ├── Baterias_resultados.csv                    ← Tabla 11
    ├── B1b_desglose.csv                           ← desglose de la batería multimodal
    ├── Umbrales_HU_resultados.csv                 ← Tabla 13
    ├── Divergencia_HU10_resultados.csv
    ├── Representatividad_resultados.csv           ← clasificación caso por caso
    ├── *_resultados.csv / *_resultados_v1.csv     ← detector corregido / original
    ├── Nodos_compliance_desplegados.json          ← extracto del workflow vigente
    ├── Nodos_compliance_desplegados_v1.json       ← extracto del workflow anterior
    ├── verificar_patrones_desplegados.mjs         ← CORRER
    ├── run_compliance_text.mjs / _field / _hu10   ← CORRER
    ├── run_cronometraje.mjs / run_tam.mjs         ← CORRER
    ├── run_representatividad.mjs                  ← CORRER
    ├── run_compliance_vision.mjs                  ← NO correr: cuota
    ├── run_baterias.mjs / run_umbrales.mjs        ← NO correr: necesitan n8n
    ├── _desglose_b1b.mjs / _extraer_foto.mjs / _foto_patron.json
    ├── fix-compliance-patterns.mjs
    ├── armar_casos_imagen.py / armar_casos_imagen_dificiles.py
    ├── casos_imagen\                              ← 29 casos: imágenes y resultados
    └── casos_imagen_corrida2\                     ← los 9 difíciles, segunda corrida
```

Lo que **no** va, y por qué: el repositorio y el `CLAUDE.md` (contaminan la sesión), los
dictámenes de las auditorías anteriores (esta auditoría es independiente y desde cero), el
workflow de n8n exportado (lleva identificadores de la instancia), las carpetas de fotos
de origen (material de terceros que ya viaja compuesto en `evidencia/`), los respaldos
`*.bak-*` y los scripts `_pasada*.py`.
