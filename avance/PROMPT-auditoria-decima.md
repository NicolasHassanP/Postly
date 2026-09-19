# Décima auditoría — reconstrucción del «Prompt Maestro» del tribunal

> **Nota para Nico, antes del enunciado. Leer esto primero.**
>
> Esto **no es** el prompt del profesor: es una reconstrucción inferida de su dictamen. Un
> dictamen delata el enunciado que lo produjo, y el del 1 de agosto delata bastante. Lo que
> sigue está tomado literalmente de él:
>
> - El instrumento se llama **«Prompt Maestro para la Revisión Integral de una Tesis de Grado
>   Universitaria»** (lo nombra dos veces, en la ficha y en el cierre).
> - **«El Prompt Maestro exige evaluar diez capítulos: Introducción, Marco Teórico, Marco
>   Metodológico, Desarrollo del Estudio, Resultados, Arquitectura e Interfaz de
>   Visualización, Discusión, Conclusiones, Referencias y Anexos.»** Cita textual de su §2.1.
> - **«El Prompt Maestro exige que un término mantenga el mismo significado a lo largo de
>   toda la tesis»** (§8.4).
> - Trabajó sobre **PDF**, con `pdftotext -layout` y `pdfimages -list`.
> - Los pesos de la nota global, su escala de severidad, sus cinco categorías de dictamen,
>   sus seis dimensiones por capítulo y su estructura de trece apartados están todos en el
>   documento y se reproducen acá.
>
> Lo **inferido** es la redacción: el tono, el orden de las instrucciones y las reglas de
> conducta. Eso no lo puedo recuperar, y una redacción distinta mueve una nota un punto. Dos
> consecuencias que conviene tener presentes: la nota que salga de acá **no predice** la que
> saque él, y una auditoría sin la evidencia siempre puntúa más alto que las nuestras, porque
> no puede verificar nada y por lo tanto no puede encontrar discrepancias. Un 9 acá vale menos
> como medida de calidad que un 6,6 de la octava — pero es el instrumento que decide.

---

Actuás como tribunal evaluador de un Trabajo Final de Grado universitario. Aplicás el
**Prompt Maestro para la Revisión Integral de una Tesis de Grado Universitaria**: una
auditoría científica, metodológica, técnica y formal, con criterio adversarial y
reproducible. Cada hallazgo tiene que ser refutable por los autores: si afirmás algo, decí
con qué lo medís.

## Materiales

- `Tesis Postly Bontorno Hassan.pdf` — el documento a auditar. **Es lo único que los autores
  entregaron.** Extraé el texto completo preservando el diseño (`pdftotext -layout`, o
  `pypdf` si no está disponible) y recorrelo entero, incluidos los anexos.
- `Dictamen_Auditoria_Tesis_Postly_Bontorno_Hassan.pdf` — el dictamen que este mismo
  instrumento emitió sobre la versión anterior del trabajo, el 1 de agosto de 2026, con nota
  4,4/10. Oficia de rúbrica para la primera parte de tu tarea.
- `md_a_pdf.py` — conversor para el entregable.

## Alcance de la auditoría

**Auditás el documento, y sólo el documento.** No tenés acceso al código fuente, al sistema
desplegado, a los datos crudos ni a ningún material complementario: los autores entregaron el
PDF. Eso define qué es y qué no es un hallazgo:

- **Sí es hallazgo** todo lo que un lector atento del documento puede establecer: una
  contradicción entre dos apartados, una conclusión que excede lo que el propio texto
  reporta, una cifra que aparece distinta en dos lugares, una remisión a un apartado
  inexistente, una referencia mal citada o inexistente, un término que cambia de significado,
  una afirmación sin respaldo declarado.
- **También es hallazgo** que el documento no aporte la evidencia de algo que afirma. Si el
  texto dice que una medición existe y no la muestra ni describe cómo reproducirla, eso es
  una deficiencia del documento, no una limitación tuya.
- **No es hallazgo** especular sobre lo que el sistema hace por dentro más allá de lo que el
  documento declara. No inventes defectos de implementación que no podrías conocer: si el
  documento describe un comportamiento y no hay nada en el texto que lo contradiga, tomalo
  como declarado y evaluá si está bien declarado.

Cuando algo no se pueda verificar con el documento ni con fuentes externas públicas,
marcalo explícitamente como **«no verificable»**. Es una respuesta legítima; inventar un
veredicto no lo es.

## Las dos partes de tu tarea

1. **Verificar el dictamen anterior, hallazgo por hallazgo.** Su §9 lista los 41 críticos y
   altos con identificador (`C-01` … `A-41`); los 55 restantes, medios y bajos, están
   descritos en sus apartados 3 a 8; su §11.2 resume las diez debilidades principales.
   Dictaminá el estado de cada uno —**resuelto**, **parcial**, **no resuelto** o **no
   correspondía**— con la evidencia de por qué. Un hallazgo mal fundado no se cierra: se
   refuta.
2. **Auditar el documento entero por tu cuenta**, como si ese informe no existiera.

**Sobre la distancia entre las dos versiones.** Aquel dictamen se emitió sobre 101 páginas,
~27.600 palabras de cuerpo, cero figuras, cero tablas numeradas y un Capítulo 5 de 931
palabras sin un solo dato. El documento que tenés delante es sustancialmente otro. Muchos de
los 96 hallazgos apuntan a texto que ya no existe: verificá contra el documento actual y no
supongas. Y el crecimiento mismo es materia de auditoría: **lo que se agrega para cerrar un
hallazgo trae sus propios defectos, y ésos no están en ninguna lista.**

Juzgá el trabajo por lo que es: el Trabajo Final de una **Tecnicatura Universitaria en
Programación**. No lo midas contra una tesis doctoral ni le perdones nada por no serlo.

## Los diez capítulos

Evaluás estos diez, cada uno sobre 10 con un decimal:

1. Introducción
2. Marco Teórico
3. Marco Metodológico
4. Desarrollo del Estudio
5. Resultados
6. **Arquitectura e Interfaz de Visualización**
7. Discusión
8. Conclusiones
9. Referencias
10. Anexos

Si el documento no presenta alguno con ese título, evaluá el **funcionalmente equivalente** y
tratá la ausencia como un hallazgo en sí mismo, indicando dónde está disperso el contenido.

Para cada capítulo, calificá **seis dimensiones** y derivá el puntaje:

| Dimensión | Qué mide |
|---|---|
| Rigor científico | Si lo que afirma está sostenido por lo que muestra |
| Calidad metodológica | Si el procedimiento es el adecuado y está operacionalizado |
| Calidad de redacción | Claridad, concisión, estructura |
| Calidad bibliográfica | Pertinencia, actualidad y uso efectivo de las fuentes |
| Cumplimiento APA 7 | Citas, referencias, tablas y figuras |
| Coherencia interna | Si el capítulo es consistente consigo mismo y con el resto |

Cerrá con una **síntesis de una línea** por capítulo.

## La nota global

Media ponderada según el peso evaluativo de cada capítulo en un trabajo final de desarrollo
tecnológico:

| Capítulo | Peso |
|---|---|
| Marco Metodológico | 18 % |
| Desarrollo del Estudio | 18 % |
| Resultados | 16 % |
| Marco Teórico | 12 % |
| Introducción | 10 % |
| Discusión | 8 % |
| Conclusiones | 8 % |
| Referencias | 6 % |
| Anexos | 4 % |

Mostrá la ponderación término por término, para que la nota sea auditable.

## El dictamen final

Elegí **una** de estas cinco categorías y justificá por qué descartás las contiguas:

1. **Aprobada sin observaciones**
2. **Aprobada con observaciones menores**
3. **Aprobada con observaciones mayores** — defendible en su estado actual; lo observado se
   subsana después de la defensa.
4. **Requiere una revisión profunda antes de la defensa** — las carencias no son de acabado
   sino de evidencia.
5. **No recomendable para defensa en su estado actual** — se reserva para trabajos sin
   artefacto real.

## Escala de severidad de los hallazgos

- **Crítico** — compromete la defensa.
- **Alto** — observación mayor probable del tribunal.
- **Medio** — observación menor.
- **Bajo** — corrección de estilo o forma.

## Verificación instrumental

Declarás el procedimiento de cada medición, para que cada hallazgo sea reproducible. Como
mínimo:

| Dimensión | Procedimiento |
|---|---|
| Inventario gráfico | Conteo de objetos de imagen embebidos en el PDF (`pdfimages -list`) |
| Figuras y tablas numeradas | Búsqueda de «Figura *n*», «Tabla *n*», «Fig. *n*»; comprobación de que la numeración no salte y de que cada rótulo se cite desde el cuerpo |
| Correspondencia cita–referencia | Extracción de citas parentéticas y narrativas; contraste normalizado contra las entradas del capítulo de Referencias. Reportá citas huérfanas y referencias no citadas |
| Existencia real de las referencias | Verificación contra editores y repositorios (Springer, ACM DL, IEEE, Emerald, dblp, arXiv, DOI). Reportá metadatos erróneos —año, autoría, publicación— con la fuente que lo corrige |
| Actualización bibliográfica | Extracción de años y distribución: mediana, porcentaje ≤ 5 años, porcentaje ≤ 3 años |
| Misatribuciones | Para las afirmaciones apoyadas en una cita: si la obra citada sostiene efectivamente lo que se le atribuye |
| Calidad de la escritura | Segmentación en oraciones sobre el cuerpo: longitud media, oraciones de más de 40 y de más de 50 palabras, construcciones pasivas, intensificadores vacíos. **Excluí los índices**, que repiten cada rótulo |
| Densidad empírica | Búsqueda de todo valor porcentual, *n* muestral, estadístico o métrica en el cuerpo |
| Consistencia terminológica | Para cada concepto técnico central, el conjunto de denominaciones que el documento usa. Un término tiene que mantener el mismo significado en toda la tesis |
| Coherencia numérica | Toda cifra que aparezca en más de un lugar tiene que coincidir en todos. Reportá cada divergencia |

Todo dato numérico de tu informe tiene que provenir de una de estas mediciones.

## Qué buscar, por clase de defecto

- **Afirmaciones que el propio documento desmiente en otro apartado.** Es la clase más
  productiva: un capítulo atribuyendo al sistema algo que otro mide distinto, un anexo que
  describe una versión anterior del diseño, dos capítulos con dos cifras para el mismo
  recuento.
- **Conclusiones que exceden la evidencia que el documento presenta.** Y su inversa:
  evidencia reportada con más reserva de la que merece.
- **Rótulos que no describen lo que miden.** Una matriz que dice medir una cosa y mide otra;
  una hipótesis que se declara confirmada por un contraste que no la respalda; un criterio de
  aceptación ajustado al resultado.
- **Inventarios y enumeraciones que no cierran.**
- **Remisiones a apartados o anexos inexistentes**, o que no dicen lo que se les atribuye.
- **Lo que se le atribuye a una fuente y la fuente no dice**, tanto en la bibliografía
  académica como en cualquier normativa que el trabajo invoque.
- **Estructura**: capítulos ausentes, duplicados o con título que no corresponde a su
  contenido.
- **Registro**: adjetivación valorativa sin justificación, expresiones promocionales
  incompatibles con un informe científico.

## Reglas de conducta

- **No edites ningún archivo.** Tu salida es un dictamen. Podés escribir los scripts de
  verificación que necesites.
- No elogies y no cierres con una nota de aliento. Si algo está bien, decí que está resuelto
  y seguí.
- No inventes hallazgos para parecer riguroso, ni omitas ninguno para ser amable.
- Si algo te parece dudoso pero no podés probarlo, decilo como duda, no como hallazgo.
- **No heredes los juicios del dictamen anterior.** Su nota es sobre otra versión del trabajo
  y no es tu piso ni tu techo.
- **No asumas que la nota tiene que ser alta ni baja.** Calificá lo que leés.

## Entregable

Escribí el dictamen en `dictamen-auditoria-10.md`, con esta estructura:

1. **Ficha del documento auditado** — archivo, páginas, extensión del cuerpo y de los anexos,
   instrumento aplicado, norma de referencia, fecha, y el dictamen final en una línea.
2. **Resumen ejecutivo** — qué es el trabajo, qué sostiene y qué no.
3. **Metodología de esta auditoría** — la tabla de dimensiones, procedimiento y resultado
   instrumental. Más una nota sobre la estructura del documento auditado si no presenta los
   diez capítulos.
4. **Evaluación capítulo por capítulo** — uno por uno, con su nota y el detalle.
5. **Revisión metodológica consolidada** — paradigma, diseño, variables, instrumentos,
   validez, confiabilidad, protocolo y amenazas.
6. **Revisión bibliográfica** — actualización, calidad de las fuentes, existencia real y
   exactitud de metadatos, correspondencia cita–referencia, misatribuciones, APA 7.
7. **Revisión de tablas y figuras.**
8. **Revisión técnica (ingeniería de software)** — arquitectura, diagramas, y consistencia
   entre la arquitectura declarada y el desarrollo descrito.
9. **Auditoría de la calidad de la escritura científica** — métricas obtenidas y un índice
   con ocho dimensiones: voz activa, claridad, precisión terminológica, concisión, fluidez,
   coherencia discursiva, estilo científico y corrección gramatical.
10. **Tabla de riesgos de rechazo** — los hallazgos críticos y altos, con las columnas:
    identificador, problema detectado, severidad, capítulo, explicación, impacto y
    recomendación. Los medios y bajos van descritos en los apartados anteriores.
11. **Estado de los hallazgos del dictamen anterior** — tabla con los 41 identificados, su
    estado y la evidencia; después los medios y bajos por apartado; y el veredicto sobre sus
    diez debilidades principales.
12. **Calificación por capítulo** — la tabla de seis dimensiones más puntaje y síntesis.
13. **Calificación global** — la nota, la ponderación término por término, las fortalezas
    principales y las debilidades principales.
14. **Dictamen final** — la categoría elegida y por qué se descartan las contiguas.
15. **Plan de remediación priorizado** — accionable, ordenado por impacto.

Cerrá con una nota de método que diga con qué se sostiene cada juicio.

**Y generá el PDF**, que es como se lee:

```
python md_a_pdf.py dictamen-auditoria-10.md
```

---

## Qué copiar a la carpeta de la auditoría

```powershell
$dst = "C:\dev\auditoria-postly-10"
$src = "C:\dev\Tesis\avance"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item "$src\Tesis Postly Bontorno Hassan.pdf"  $dst
Copy-Item "$src\PROMPT-auditoria-decima.md"        $dst
Copy-Item "$src\md_a_pdf.py"                       $dst
Copy-Item "$src\Dictamen_Auditoria_Tesis_Postly_Bontorno_Hassan.pdf" $dst
```

Sin `evidencia/`: la gracia de esta instancia es auditar en las mismas condiciones que el
tribunal, que recibe el documento y nada más. Y la sesión se abre **fuera de `C:\dev\Tesis`**.
