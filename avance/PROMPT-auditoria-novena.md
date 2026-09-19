# Prompt para la novena auditoría, en sesión limpia

> **Antes de pegarlo, dos condiciones.**
>
> 1. Abrir Claude Code en una carpeta **fuera de `C:\dev\Tesis`** (es decir,
>    `C:\dev\auditoria-postly-9`). Si se abre dentro del repo, la sesión hereda el
>    `CLAUDE.md` del proyecto y su memoria persistente, y la auditoría deja de ser
>    independiente.
> 2. El `.docx` de la carpeta ya tiene los campos actualizados en Word: el índice general
>    lista 116 entradas (pp. 10–170) y el de tablas y figuras, las veintinueve (pp. 27–167).
>    Si se reemplaza el archivo, hay que refrescarlos antes.
>
> El contenido de la carpeta está al final de este archivo.

---

Actuás como evaluador de un tribunal académico. Tu trabajo no es ayudarme: es dictaminar
sobre un Trabajo Integrador con criterio adversarial. Doy por sentado que preferís señalar
un problema real antes que quedar bien.

**Esta auditoría tiene dos partes, y las dos cuentan.** Se te entrega el dictamen que este
trabajo recibió de su tribunal (`Dictamen_Auditoria_Tesis_Postly_Bontorno_Hassan.pdf`,
4,4/10, del 1 de agosto de 2026). No es un límite: es la rúbrica de la primera parte. Tenés
que (a) verificar, hallazgo por hallazgo, si lo que ese dictamen señaló está efectivamente
corregido —y si la corrección no rompió otra cosa—, y (b) auditar el documento entero por tu
cuenta, como si ese informe no existiera.

**Sobre la distancia entre los dos documentos.** Aquel dictamen se emitió sobre una versión
de 101 páginas y ~27.600 palabras de cuerpo, con cero figuras, cero tablas numeradas y un
Capítulo 5 de 931 palabras sin un solo dato. El que tenés delante es sustancialmente otro.
Eso tiene dos consecuencias para tu trabajo: muchos de sus 96 hallazgos apuntan a texto que
ya no existe —verificá contra el documento actual y no supongas—, y el crecimiento mismo es
materia de auditoría: **lo que se agrega para cerrar un hallazgo suele traer sus propios
defectos, y ésos no están en ninguna lista**. Es ahí donde tenés más para encontrar.

**Y una advertencia sobre la rúbrica.** No todos sus hallazgos se sostienen contra el
documento actual, y algunos no se sostenían tampoco cuando se escribieron. Si encontrás uno
mal fundado, no lo cierres: refutalo con la evidencia. Que tu rúbrica se equivoque es una
posibilidad real y detectarlo es parte de tu trabajo.

Juzgá el documento por lo que es: el Trabajo Integrador final de una **Tecnicatura
Universitaria en Programación**. No lo midas contra los estándares de una tesis doctoral
ni le perdones nada por no serlo. La pregunta es si cumple con rigor el nivel que le
corresponde.

## Materiales

- `Tesis Postly Bontorno Hassan-1 v2.docx` — el documento a auditar. Leelo con
  `python-docx` (`pip install python-docx`) o descomprimiendo `word/document.xml`. Son
  **1.364 párrafos** (1.213 sin los tres índices), **~60.900 palabras** contando las tablas
  y sin contar los índices, **14 tablas** y **15 figuras** (quince imágenes distintas por
  hash MD5). Si tu extracción devuelve mucho menos que eso, falló y hay que arreglarla antes
  de opinar. Recorré el cuerpo **en orden de documento** para conservar la intercalación de
  párrafos y tablas —`doc.paragraphs` sola no las ve—, y **leelo completo**, incluidos los
  cinco anexos (A a E), donde está casi toda la evidencia empírica. Los párrafos de los tres
  índices llevan estilo `toc N` o `table of figures`: excluilos de cualquier métrica de
  escritura o vas a contar cada rótulo dos veces.
- `Dictamen_Auditoria_Tesis_Postly_Bontorno_Hassan.pdf` — el dictamen del tribunal, 26
  páginas, que oficia de rúbrica para la primera parte. Su §9 lista los 41 hallazgos
  críticos y altos en una tabla con identificador (`C-01` … `A-41`); los 55 restantes,
  medios y bajos, están descritos en sus apartados 3 a 8. Su §11.2 resume las diez
  debilidades principales: empezá por ahí y después bajá al detalle. Leelo con `pypdf` (ya
  instalado) o con la herramienta que prefieras.
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

## Dónde se concentró el trabajo desde aquel dictamen

Esto no es una lista de méritos ni una guía de lo que tenés que dar por bueno: es dónde
mirar con más atención, porque lo que se toca es lo que se rompe. **Cada punto es una
afirmación del trabajo, no un hecho establecido.**

1. **El Capítulo 5 pasó de no tener datos a tener catorce tablas.** Cronometraje con tres
   consultoras, matrices de confusión del módulo de compliance en dos canales y varias
   configuraciones, un cuestionario TAM y un análisis de valores límite. Los datos crudos y
   los scripts están en `evidencia/`: reproducí las cifras en vez de aceptarlas.
2. **Aparecieron quince figuras y cinco anexos.** Entre ellos el Anexo D, que transcribe la
   fuente normativa cuya ausencia era el hallazgo `C-08`, y el Anexo E, que documenta toda
   la evidencia empírica. El PDF de esa fuente está en `evidencia/`.
3. **Se corrigió el sistema, no sólo el documento.** La detección visual de precios corría
   sólo en el flujo de imagen única; el carrusel usaba un criterio propio y los flujos de
   video y de re-publicación no ejecutaban ninguna. Los cuatro llevan hoy el mismo criterio,
   y el Anexo E.4 aporta el mecanismo con que lo verifica. Y la guarda que impone el corte de
   60 s en video era `if (dur && dur > 60)`, que no se dispara si no se puede leer la
   duración: ahora cubre también ese caso.
4. **Hay cuatro casos ejecutados de extremo a extremo** en los otros tres flujos: dos de
   video (Anexo E.9), uno de carrusel (E.10) y uno de re-publicación (E.11).
5. **Las afirmaciones del documento se recalibraron a fondo.** La matriz de campo se separó
   en dos paneles según qué constructo mide; la hipótesis del 70 % pasa de «confirmada» a
   «compatible, no confirmada»; el §2.4 y el Anexo D se podaron a lo que la fuente dice, con
   cada cita literal acompañada de su página; el §3.7.1 suma un inventario de almacenes de
   datos; y varios capítulos declaran ahora qué no se midió. **Una recalibración así falla de
   dos maneras —acotando de menos, o acotando tanto que el texto queda incoherente con otro
   capítulo— y las dos son materia de tu auditoría.**

Preguntate, para cada uno: si el documento declara el alcance exacto de lo que agregó, si
las afirmaciones viejas de otros capítulos quedaron consistentes con lo nuevo, y si algún
inventario o enumeración se quedó corto o largo al moverse una cifra.

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
3. Recorré los hallazgos del dictamen y dictaminá el estado de cada uno: **resuelto**,
   **parcial**, **no resuelto** o **no correspondía**, con la evidencia de por qué. Los 41
   con identificador, uno por uno; los medios y bajos de sus apartados 3 a 8, agrupados por
   apartado si son de forma. Un hallazgo mal fundado no se cierra, se refuta.
4. Recién después, evaluá lo que es materia de criterio: la calidad del planteo, la
   coherencia interna, la calibración de las afirmaciones y la solidez de las conclusiones.
5. Ordená los hallazgos nuevos por severidad y ubicá cada uno con precisión (sección,
   párrafo, frase literal).

## Qué buscar, por clase de defecto

Estas son las clases que más suelen afectar a un trabajo de este tipo. No son una lista de
control: son dónde mirar.

- **Afirmaciones que el propio documento desmiente en otro apartado.** Un capítulo
  atribuyendo al sistema algo que otro mide distinto, un anexo describiendo una versión
  anterior del flujo, dos capítulos con dos cifras para el mismo recuento. Buscá activamente
  contradicciones internas: es donde este trabajo se rompe.
- **Rótulos que no describen lo que miden.** Una matriz que dice medir una cosa y mide otra,
  una clase positiva mal nombrada, un criterio de aceptación que se ajustó al resultado.
- **Inventarios que no cierran.** «Los cuatro análisis» seguido de cinco, «tres umbrales»
  donde hay cuatro, una cronología que termina antes que los hechos que narra.
- **Remisiones que llevan a contenido ausente.** Verificá que cada «(§N)» y cada «Anexo X»
  apunte a algo que existe y que dice lo que se le atribuye.
- **Conclusiones que exceden la evidencia**, y su inversa: evidencia que el documento no
  aprovecha porque la declara con más reserva de la que merece.
- **Lo que se agrega para cerrar un hallazgo** y trae sus propios defectos: una oración
  partida que quedó sin sentido, una salvedad que contradice otra, un párrafo nuevo entre
  dos que hablaban de otra cosa.
- **Lo que se le atribuye a una fuente y la fuente no dice.** Vale para la normativa
  corporativa y para la bibliografía académica.

## Verificaciones instrumentales

### El verificador de patrones desplegados

`evidencia/verificar_patrones_desplegados.mjs` y los dos extractos que lo acompañan:
`Nodos_compliance_desplegados.json`, el del detector vigente, y
`Nodos_compliance_desplegados_v1.json`, el del estado **anterior** a la corrección que el
§5.1 describe, que es el que produjo algunas de las matrices del capítulo. Corré el script
—es instantáneo y no necesita la instancia— y después **evaluá el mecanismo con criterio**:
qué establece, qué no establece, y si el documento lo presenta con su alcance exacto. El
extracto trae el código y los prompts completos: comprobá los hashes contra ese texto, y
preguntate qué parte de la cadena queda fuera y si el trabajo la declara.

### El contraste de representatividad

`run_representatividad.mjs` clasifica los casos infractores de texto por la forma en que
expresan el precio, con una taxonomía léxica propia, y compara el conjunto de prueba contra
el corpus real. Corrélo y después evaluá **la taxonomía misma**: si las seis categorías son
exhaustivas y mutuamente excluyentes, si el orden de precedencia altera el resultado, y si
la conclusión que el §5.4 extrae de ella es la que los números permiten.

### La premisa normativa

`evidencia/Pautas Mary Kay para el uso en las Redes Sociales.pdf`, diez páginas. El
documento entrecomilla fragmentos en su Anexo D, en el §2.4 y en el Anexo E.6, y cada cita
lleva su página. Comprobá **cada una** contra la fuente: el texto y el número de página.
Comprobá también el alcance —que una regla citada rija para el canal al que el trabajo la
aplica— y qué queda atribuido a la norma y qué a los autores.

### Reproducción de las cifras del Capítulo 5

- **Tabla 5**: se apoya en la columna `Resultado_sistema` de `Compliance_Campo.csv`, que
  trae el pie de foto **verbatim** de los 29 casos. Ejecutá el detector sobre esa columna y
  comprobá si reproduce el veredicto registrado, caso por caso. Las columnas de esa planilla
  no son las que `run_compliance_text.mjs` espera, así que vas a tener que mapearlas o
  reutilizar las expresiones regulares. Comprobá además los dos paneles: qué casos entran en
  cada uno, si las proporciones y los intervalos de Wilson de ambos salen del dato, y si el
  recorte de 27 casos está justificado o es selección posterior al resultado.
- **Tablas 12 y 14**: recomponé las matrices desde los archivos de veredictos y compará.
  Fijate cómo se compone cada corte, si el documento declara esa composición, y qué se puede
  y qué no se puede establecer sobre los negativos.
- **Los intervalos y los tamaños del efecto**: recalculalos por tu cuenta, con tu propio
  método, y comprobá que coincidan. Verificá además cuál es la agregación que corresponde
  al diseño, si el documento reporta la que corresponde, y si la calibración de la hipótesis
  es la que el contraste permite.
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
- **No heredes los juicios del dictamen.** Que haya calificado bien un capítulo no te
  obliga; que haya calificado mal otro, tampoco. Su nota es sobre otra versión del trabajo
  y no es el piso ni el techo de la tuya. Y si encontrás que alguno de sus hallazgos no se
  sostenía, decilo con la evidencia.
- **No asumas que la nota tiene que ser alta ni baja.** Calificá lo que leés.

## Entregable

Escribí el dictamen en `dictamen-auditoria-9.md`, con esta estructura:

1. **Veredicto** — nota global sobre 10, estado, y los motivos en pocas líneas.
2. **Calificación por capítulo** — tabla con la nota y el motivo en una línea, más la
   ponderación completa término por término.
3. **Estado de los hallazgos del dictamen** — una tabla con los 41 que llevan identificador
   (`C-01` … `A-41`): identificador, estado (resuelto / parcial / no resuelto / no
   correspondía) y la evidencia en una o dos líneas. Después, un párrafo por apartado para
   los medios y bajos de sus §3 a §8. Y al final, el veredicto sobre sus diez debilidades
   principales (§11.2), que es lo que un lector de aquel informe va a querer saber primero.
4. **Regresiones** — lo que aquel dictamen daba por bien —su §11.1 lista ocho fortalezas— y
   hoy está peor, si lo hay.
5. **Hallazgos nuevos** — ordenados por severidad (críticos, altos, medios, bajos). Cada uno
   con su ubicación exacta, la cita literal del problema, por qué importa y qué lo corrige.
6. **Verificaciones instrumentales** — tabla de lo que mediste, con el número que obtuviste
   y el número que afirma el documento, uno al lado del otro.
7. **Fortalezas** — qué sostiene el trabajo con solidez. No es un elogio: es parte del
   dictamen, y sirve para saber qué no hay que tocar.
8. **Qué separa este trabajo de un 10** — lista accionable, ordenada por impacto.
9. **Qué no pude verificar** — explícito, con el motivo de cada punto.

Al final, una nota de método que diga con qué se sostiene cada juicio, para que el lector
sepa cuánto pesa cada uno.

**Y además, generá el PDF**, que es como se va a leer:

```
python md_a_pdf.py dictamen-auditoria-9.md
```

Deja `dictamen-auditoria-9.pdf` en la misma carpeta. El script usa `reportlab` (ya
instalado) porque no hay pandoc en esta máquina; maneja encabezados, tablas, listas, citas
y bloques de código. Si algo no renderiza bien, arreglá el script —no el dictamen.

---

## Qué copiar a la carpeta de la auditoría

Desde PowerShell:

```powershell
$dst = "C:\dev\auditoria-postly-9"
$src = "C:\dev\Tesis\avance"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item "$src\Tesis Postly Bontorno Hassan-1 v2.docx" $dst
Copy-Item "$src\PROMPT-auditoria-novena.md"             $dst
Copy-Item "$src\md_a_pdf.py"                            $dst
Copy-Item "$src\evidencia"                              $dst -Recurse
Copy-Item "$src\Dictamen_Auditoria_Tesis_Postly_Bontorno_Hassan.pdf" $dst
```

La carpeta queda así:

```
C:\dev\auditoria-postly-9\
├── Tesis Postly Bontorno Hassan-1 v2.docx   ← con los campos actualizados en Word
├── PROMPT-auditoria-novena.md               ← este archivo
├── Dictamen_Auditoria_Tesis_Postly_Bontorno_Hassan.pdf   ← la rúbrica de la primera parte
├── md_a_pdf.py                              ← conversor del dictamen a PDF
└── evidencia\                               ← 42 entradas, con su LEEME.md
```
